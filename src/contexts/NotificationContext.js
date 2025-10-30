// contexts/NotificationContext.js
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { supabase } from '../Utilities/supabaseClient';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState({
    // قديم
    newArticles: 0,
    newPosts: 0,
    // جديد للامتحانات
    newExams: 0,        // امتحانات جديدة نشطة
    myResultsReady: 0,  // نتائج جاهزة/تحديثات لمحاولاتي
    newSubmissions: 0,  // (اختياري للمشرف) محاولات طلاب جديدة
    lastVisited: {
      articles: null,
      community: null,
      exams: null,      // آخر زيارة لصفحة الامتحانات
    }
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null); // students.id (إن وجد)
  const [isLoading, setIsLoading] = useState(true);
  const [realtimeSubscriptions, setRealtimeSubscriptions] = useState([]);

  // مفاتيح التخزين المحلي
  const STORAGE_KEYS = {
    LAST_ARTICLES_VISIT: 'last_articles_visit',
    LAST_COMMUNITY_VISIT: 'last_community_visit',
    LAST_EXAMS_VISIT: 'last_exams_visit',
  };

  // Refs لمنع السبام والتحديث المتكرر
  const lastExamsWriteRef = useRef('');
  const lastArticlesWriteRef = useRef('');
  const lastCommunityWriteRef = useRef('');

  // التحقق من المستخدم الحالي
  useEffect(() => {
    checkCurrentUser();
  }, []);

  // عند وجود مستخدم: اجلب الإشعارات واشترك Realtime
  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      setupRealtimeSubscriptions();

      // تحديث احتياطي كل 5 دقائق
      const interval = setInterval(fetchNotifications, 300000);

      return () => {
        clearInterval(interval);
        cleanupRealtimeSubscriptions();
      };
    } else {
      // لو مفيش مستخدم امسح حالة الإشعارات والاشتراكات
      cleanupRealtimeSubscriptions();
      setNotifications({
        newArticles: 0,
        newPosts: 0,
        newExams: 0,
        myResultsReady: 0,
        newSubmissions: 0,
        lastVisited: {
          articles: null,
          community: null,
          exams: null,
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, currentUserId]);

  const checkCurrentUser = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setCurrentUser(user);

        // محاولة جلب صف الطالب لمعرفة students.id
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('id, auth_id')
          .eq('auth_id', user.id)
          .single();

        if (!studentError && studentData) {
          setCurrentUserId(studentData.id.toString()); // ثبات نوع البيانات
        } else {
          setCurrentUserId(null);
        }
      } else {
        setCurrentUser(null);
        setCurrentUserId(null);
      }
    } catch (error) {
      console.error('خطأ في التحقق من المستخدم:', error);
      setCurrentUser(null);
      setCurrentUserId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    console.log('إعداد Realtime subscriptions...');

    // --- إشعارات المقالات (قديمة)
    const articlesChannel = supabase
      .channel('public:articles')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'articles' },
        handleNewArticle
      )
      .subscribe((status) => console.log('حالة اشتراك المقالات:', status));

    // --- إشعارات المنشورات (قديمة)
    const postsChannel = supabase
      .channel('public:posts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        handleNewPost
      )
      .subscribe((status) => console.log('حالة اشتراك المنشورات:', status));

    // --- جديد: امتحانات جديدة (monthly_exams)
    const examsChannel = supabase
      .channel('public:monthly_exams')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'monthly_exams' },
        handleNewExam
      )
      .subscribe((status) => console.log('حالة اشتراك الامتحانات:', status));

    // --- جديد: محاولات الامتحانات (exam_attempts) Insert/Update
    const attemptsChannel = supabase
      .channel('public:exam_attempts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'exam_attempts' },
        handleNewAttemptInsert
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'exam_attempts' },
        handleAttemptUpdate
      )
      .subscribe((status) => console.log('حالة اشتراك المحاولات:', status));

    setRealtimeSubscriptions([articlesChannel, postsChannel, examsChannel, attemptsChannel]);
  };

  const cleanupRealtimeSubscriptions = () => {
    console.log('تنظيف Realtime subscriptions...');
    realtimeSubscriptions.forEach((subscription) => {
      supabase.removeChannel(subscription);
    });
    setRealtimeSubscriptions([]);
  };

  const fetchNotifications = async () => {
    if (!currentUser) return;

    try {
      // --- مفاتيح آخر زيارة من التخزين المحلي
      const lastArticlesVisit = localStorage.getItem(`${STORAGE_KEYS.LAST_ARTICLES_VISIT}_${currentUserId || currentUser.id}`);
      const lastCommunityVisit = localStorage.getItem(`${STORAGE_KEYS.LAST_COMMUNITY_VISIT}_${currentUserId || currentUser.id}`);
      const lastExamsVisit = localStorage.getItem(`${STORAGE_KEYS.LAST_EXAMS_VISIT}_${currentUserId || currentUser.id}`);

      // ------ المقالات الجديدة (قديمة) ------
      let newArticlesCount = 0;
      if (lastArticlesVisit) {
        const { count, error } = await supabase
          .from('articles')
          .select('*', { count: 'exact', head: true })
          .gt('created_at', lastArticlesVisit)
          .eq('status', 'مفتوح');
        if (!error) newArticlesCount = count || 0;
      } else {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        const { count, error } = await supabase
          .from('articles')
          .select('*', { count: 'exact', head: true })
          .gt('created_at', threeDaysAgo.toISOString())
          .eq('status', 'مفتوح');
        if (!error) newArticlesCount = count || 0;
      }

      // ------ المنشورات الجديدة (قديمة) ------
      let newPostsCount = 0;
      if (lastCommunityVisit) {
        const { count, error } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .gt('created_at', lastCommunityVisit);
        if (!error) newPostsCount = count || 0;
      } else {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        const { count, error } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .gt('created_at', threeDaysAgo.toISOString());
        if (!error) newPostsCount = count || 0;
      }

      // ------ جديد: امتحانات جديدة نشطة ------
      let newExamsCount = 0;
      if (lastExamsVisit) {
        const { count, error } = await supabase
          .from('monthly_exams')
          .select('*', { count: 'exact', head: true })
          .gt('created_at', lastExamsVisit)
          .eq('is_active', true);
        if (!error) newExamsCount = count || 0;
      } else {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        const { count, error } = await supabase
          .from('monthly_exams')
          .select('*', { count: 'exact', head: true })
          .gt('created_at', threeDaysAgo.toISOString())
          .eq('is_active', true);
        if (!error) newExamsCount = count || 0;
      }

      // ------ جديد: نتائج جاهزة لي (محاولاتي المحدثة/المُسلمة) ------
      let myResultsReadyCount = 0;
      {
        const meAuthId = currentUser?.id ? currentUser.id.toString() : null;
        const meStudentId = currentUserId ? currentUserId.toString() : null;

        // بناء شرط OR بشكل آمن — فقط أضف شروط غير فارغة
        const orConds = [];
        if (meAuthId) orConds.push(`student_id.eq.${meAuthId}`);
        if (meStudentId) orConds.push(`student_id.eq.${meStudentId}`);

        if (orConds.length === 0) {
          // لا يوجد معرف صالح — لا توجد نتائج
          myResultsReadyCount = 0;
        } else {
          let base = supabase
            .from('exam_attempts')
            .select('*', { count: 'exact', head: true })
            .or(orConds.join(','));

          if (lastExamsVisit) base = base.gt('updated_at', lastExamsVisit);

          const { count, error } = await base;
          if (!error) myResultsReadyCount = count || 0;
        }
      }

      console.log('إحصائيات الإشعارات:', {
        newArticlesCount,
        newPostsCount,
        newExamsCount,
        myResultsReadyCount,
        lastArticlesVisit,
        lastCommunityVisit,
        lastExamsVisit
      });

      setNotifications((prev) => ({
        ...prev,
        newArticles: newArticlesCount,
        newPosts: newPostsCount,
        newExams: newExamsCount,
        myResultsReady: myResultsReadyCount,
        lastVisited: {
          articles: lastArticlesVisit || null,
          community: lastCommunityVisit || null,
          exams: lastExamsVisit || null,
        }
      }));
    } catch (error) {
      console.error('خطأ في جلب الإشعارات:', error);
    }
  };

  // -------- دوال Realtime (قديمة) --------
  const handleNewArticle = (payload) => {
    if (payload?.new && payload.new.status === 'مفتوح') {
      const newAuthorId = payload.new.author_id ? payload.new.author_id.toString() : null;
      if (newAuthorId !== (currentUserId || currentUser?.id)?.toString()) {
        setNotifications((prev) => ({ ...prev, newArticles: prev.newArticles + 1 }));
        if (typeof window !== 'undefined' && window.Notification && Notification.permission === 'granted') {
          new Notification('مقال جديد!', {
            body: `تم نشر مقال جديد: ${payload.new.title}`,
            icon: '/favicon.ico'
          });
        }
      }
    }
  };

  const handleNewPost = (payload) => {
    if (payload?.new) {
      const newAuthorId = payload.new.author_id ? payload.new.author_id.toString() : null;
      if (newAuthorId !== (currentUserId || currentUser?.id)?.toString()) {
        setNotifications((prev) => ({ ...prev, newPosts: prev.newPosts + 1 }));
        if (typeof window !== 'undefined' && window.Notification && Notification.permission === 'granted') {
          const content = payload.new.content || 'منشور جديد';
          const truncatedContent = content.length > 50 ? content.substring(0, 50) + '...' : content;
          new Notification('منشور جديد في المجتمع!', {
            body: `${payload.new.author_name}: ${truncatedContent}`,
            icon: '/favicon.ico'
          });
        }
      }
    }
  };

  // -------- دوال Realtime (جديد للامتحانات) --------
  const handleNewExam = (payload) => {
    const exam = payload?.new;
    if (!exam) return;

    const createdBy = exam.created_by ? exam.created_by.toString() : null;
    const isActive = exam.is_active === true;

    // لو أنا صاحب الامتحان — متزودش إشعار
    if (createdBy && currentUser && createdBy === currentUser.id) return;

    if (isActive) {
      setNotifications((prev) => ({ ...prev, newExams: prev.newExams + 1 }));
      if (typeof window !== 'undefined' && window.Notification && Notification.permission === 'granted') {
        new Notification('امتحان جديد!', {
          body: `تم إضافة امتحان: ${exam.title || 'بدون عنوان'}`,
          icon: '/favicon.ico'
        });
      }
    }
  };

  // عند إدراج محاولة جديدة:
  // - للمشرف: نزود عداد "newSubmissions" (اختياري تعتمد على دورك)
  const handleNewAttemptInsert = (payload) => {
    const attempt = payload?.new;
    if (!attempt) return;

    setNotifications((prev) => ({
      ...prev,
      newSubmissions: prev.newSubmissions + 1
    }));
  };

  // عند تحديث محاولة:
  // لو المحاولة بتاعتي (auth_id أو students.id) و اتحدثت درجتها/حالتها => نزود myResultsReady
  const handleAttemptUpdate = (payload) => {
    const next = payload?.new;
    if (!next) return;

    const attemptStudent = next.student_id ? next.student_id.toString() : null;
    const meAuthId = currentUser?.id ? currentUser.id.toString() : null;
       const meStudentId = currentUserId ? currentUserId.toString() : null;
    const isMine = attemptStudent === meAuthId || attemptStudent === meStudentId;

    if (isMine && (next.status === 'submitted' || typeof next.score !== 'undefined' || typeof next.percentage !== 'undefined')) {
      setNotifications((prev) => ({ ...prev, myResultsReady: prev.myResultsReady + 1 }));
      if (typeof window !== 'undefined' && window.Notification && Notification.permission === 'granted') {
        new Notification('تم تحديث نتيجتك!', {
          body: `تم تسليم/تحديث نتيجتك لامتحان رقم ${next.exam_id}`,
          icon: '/favicon.ico'
        });
      }
    }
  };

  // -------- Helpers لمنع السبان في "آخر زيارة" --------
  const nearlySameTime = (a, b, toleranceMs = 1000) => {
    if (!a || !b) return false;
    return Math.abs(new Date(a) - new Date(b)) < toleranceMs;
  };

  // -------- أدوات التعامل مع "آخر زيارة" + إعادة ضبط --------
  const markArticlesAsVisited = useCallback(() => {
    if (!currentUser) return;
    const now = new Date().toISOString();
    const key = `${STORAGE_KEYS.LAST_ARTICLES_VISIT}_${currentUserId || currentUser.id}`;

    // تبريد 3 ثواني
    if (lastArticlesWriteRef.current) {
      const diffMs = new Date(now) - new Date(lastArticlesWriteRef.current);
      if (diffMs < 3000) return;
    }

    const prevInState = notifications?.lastVisited?.articles || null;
    const prevInLS = localStorage.getItem(key);

    if (nearlySameTime(now, prevInState) || nearlySameTime(now, prevInLS)) {
      lastArticlesWriteRef.current = now;
      return;
    }

    localStorage.setItem(key, now);
    lastArticlesWriteRef.current = now;
    setNotifications((prev) => {
      if (prev?.lastVisited?.articles && nearlySameTime(now, prev.lastVisited.articles)) return prev;
      return {
        ...prev,
        newArticles: 0,
        lastVisited: { ...prev.lastVisited, articles: now }
      };
    });
    console.log('تم تحديث آخر زيارة للمقالات:', now);
  }, [currentUser, currentUserId, notifications?.lastVisited?.articles]);

  const markCommunityAsVisited = useCallback(() => {
    if (!currentUser) return;
    const now = new Date().toISOString();
    const key = `${STORAGE_KEYS.LAST_COMMUNITY_VISIT}_${currentUserId || currentUser.id}`;

    // تبريد 3 ثواني
    if (lastCommunityWriteRef.current) {
      const diffMs = new Date(now) - new Date(lastCommunityWriteRef.current);
      if (diffMs < 3000) return;
    }

    const prevInState = notifications?.lastVisited?.community || null;
    const prevInLS = localStorage.getItem(key);

    if (nearlySameTime(now, prevInState) || nearlySameTime(now, prevInLS)) {
      lastCommunityWriteRef.current = now;
      return;
    }

    localStorage.setItem(key, now);
    lastCommunityWriteRef.current = now;
    setNotifications((prev) => {
      if (prev?.lastVisited?.community && nearlySameTime(now, prev.lastVisited.community)) return prev;
      return {
        ...prev,
        newPosts: 0,
        lastVisited: { ...prev.lastVisited, community: now }
      };
    });
    console.log('تم تحديث آخر زيارة للمجتمع:', now);
  }, [currentUser, currentUserId, notifications?.lastVisited?.community]);

  // جديد: آخر زيارة للامتحانات (Idempotent + Cooldown)
  const markExamsAsVisited = useCallback(() => {
    if (!currentUser) return;
    const key = `${STORAGE_KEYS.LAST_EXAMS_VISIT}_${currentUserId || currentUser.id}`;
    const now = new Date().toISOString();

    // تبريد 3 ثواني لمنع السبان
    if (lastExamsWriteRef.current) {
      const diffMs = new Date(now) - new Date(lastExamsWriteRef.current);
      if (diffMs < 3000) return;
    }

    // لو القيمة الحالية في state أو localStorage قريبة جدًا (±1 ثانية) متحدّثش
    const prevInState = notifications?.lastVisited?.exams || null;
    const prevInLS = localStorage.getItem(key);
    if (nearlySameTime(now, prevInState) || nearlySameTime(now, prevInLS)) {
      lastExamsWriteRef.current = now;
      return;
    }

    // اكتب مرة واحدة
    localStorage.setItem(key, now);
    lastExamsWriteRef.current = now;
    setNotifications((prev) => {
      if (prev?.lastVisited?.exams && nearlySameTime(now, prev.lastVisited.exams)) return prev;
      return {
        ...prev,
        newExams: 0,
        myResultsReady: 0,
        lastVisited: { ...prev.lastVisited, exams: now },
      };
    });
    console.log('تم تحديث آخر زيارة للامتحانات:', now);
  }, [currentUser, currentUserId, notifications?.lastVisited?.exams]);

  // إعادة تعيين كل الإشعارات + إزالة آخر زيارات
  const resetNotifications = () => {
    if (!currentUser) return;

    setNotifications({
      newArticles: 0,
      newPosts: 0,
      newExams: 0,
      myResultsReady: 0,
      newSubmissions: 0,
      lastVisited: {
        articles: null,
        community: null,
        exams: null,
      }
    });

    const articlesKey = `${STORAGE_KEYS.LAST_ARTICLES_VISIT}_${currentUserId || currentUser.id}`;
    const communityKey = `${STORAGE_KEYS.LAST_COMMUNITY_VISIT}_${currentUserId || currentUser.id}`;
    const examsKey = `${STORAGE_KEYS.LAST_EXAMS_VISIT}_${currentUserId || currentUser.id}`;

    localStorage.removeItem(articlesKey);
    localStorage.removeItem(communityKey);
    localStorage.removeItem(examsKey);

    console.log('تم إعادة تعيين جميع الإشعارات');
  };

  // تحديث يدوي عام
  const refreshNotifications = () => {
    if (currentUser) {
      console.log('تحديث الإشعارات يدوياً...');
      fetchNotifications();
    }
  };

  // تحديث يدوي لإشعارات الامتحانات (اختياري)
  const refreshExamsNotifications = () => {
    if (currentUser) {
      console.log('تحديث إشعارات الامتحانات يدوياً...');
      fetchNotifications();
    }
  };

  const value = {
    notifications,
    isLoading,
    currentUser,
    currentUserId,
    // قديم
    markArticlesAsVisited,
    markCommunityAsVisited,
    resetNotifications,
    refreshNotifications,
    // جديد
    markExamsAsVisited,
    refreshExamsNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
