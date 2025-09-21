// contexts/NotificationContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
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
    newArticles: 0,
    newPosts: 0,
    lastVisited: {
      articles: null,
      community: null
    }
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [realtimeSubscriptions, setRealtimeSubscriptions] = useState([]);

  // تحديد مفاتيح localStorage
  const STORAGE_KEYS = {
    LAST_ARTICLES_VISIT: 'last_articles_visit',
    LAST_COMMUNITY_VISIT: 'last_community_visit'
  };

  // التحقق من المستخدم الحالي
  useEffect(() => {
    checkCurrentUser();
  }, []);

  // جلب الإشعارات وإعداد Realtime subscriptions عند تسجيل الدخول
  useEffect(() => {
    if (currentUser && currentUserId) {
      fetchNotifications();
      setupRealtimeSubscriptions();
      
      // تحديث الإشعارات كل 5 دقائق (للاحتياط)
      const interval = setInterval(fetchNotifications, 300000);
      
      return () => {
        clearInterval(interval);
        cleanupRealtimeSubscriptions();
      };
    } else {
      // إذا لم يكن هناك مستخدم، امسح الإشعارات والاشتراكات
      cleanupRealtimeSubscriptions();
      setNotifications({
        newArticles: 0,
        newPosts: 0,
        lastVisited: {
          articles: null,
          community: null
        }
      });
    }
  }, [currentUser, currentUserId]);

  const checkCurrentUser = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setCurrentUser(user);
        
        // البحث عن المستخدم في جدول students
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('id, auth_id')
          .eq('auth_id', user.id)
          .single();
        
        if (!studentError && studentData) {
          // تحويل UUID إلى string للتوافق
          setCurrentUserId(studentData.id.toString());
        } else {
          console.log('المستخدم غير موجود في جدول students');
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
    
    // الاشتراك في تغييرات جدول articles
    const articlesChannel = supabase
      .channel('public:articles')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'articles' 
        },
        (payload) => {
          console.log('مقال جديد تم إضافته:', payload);
          handleNewArticle(payload);
        }
      )
      .subscribe((status) => {
        console.log('حالة اشتراك المقالات:', status);
      });

    // الاشتراك في تغييرات جدول posts
    const postsChannel = supabase
      .channel('public:posts')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'posts' 
        },
        (payload) => {
          console.log('منشور جديد تم إضافته:', payload);
          handleNewPost(payload);
        }
      )
      .subscribe((status) => {
        console.log('حالة اشتراك المنشورات:', status);
      });

    setRealtimeSubscriptions([articlesChannel, postsChannel]);
  };

  const cleanupRealtimeSubscriptions = () => {
    console.log('تنظيف Realtime subscriptions...');
    realtimeSubscriptions.forEach(subscription => {
      supabase.removeChannel(subscription);
    });
    setRealtimeSubscriptions([]);
  };

  const fetchNotifications = async () => {
    if (!currentUser || !currentUserId) return;

    try {
      const now = new Date().toISOString();
      
      // جلب آخر زيارة من localStorage
      const lastArticlesVisit = localStorage.getItem(`${STORAGE_KEYS.LAST_ARTICLES_VISIT}_${currentUserId}`);
      const lastCommunityVisit = localStorage.getItem(`${STORAGE_KEYS.LAST_COMMUNITY_VISIT}_${currentUserId}`);

      // حساب عدد المقالات الجديدة
      let newArticlesCount = 0;
      if (lastArticlesVisit) {
        const { count: articlesCount, error: articlesError } = await supabase
          .from('articles')
          .select('*', { count: 'exact', head: true })
          .gt('created_at', lastArticlesVisit)
          .eq('status', 'مفتوح'); // فقط المقالات المفتوحة

        if (!articlesError) {
          newArticlesCount = articlesCount || 0;
        }
      } else {
        // إذا لم يسبق الزيارة، احسب كل المقالات من آخر 3 أيام
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        
        const { count: recentArticlesCount, error: recentArticlesError } = await supabase
          .from('articles')
          .select('*', { count: 'exact', head: true })
          .gt('created_at', threeDaysAgo.toISOString())
          .eq('status', 'مفتوح');

        if (!recentArticlesError) {
          newArticlesCount = recentArticlesCount || 0;
        }
      }

      // حساب عدد المنشورات الجديدة
      let newPostsCount = 0;
      if (lastCommunityVisit) {
        const { count: postsCount, error: postsError } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .gt('created_at', lastCommunityVisit);

        if (!postsError) {
          newPostsCount = postsCount || 0;
        }
      } else {
        // إذا لم يسبق الزيارة، احسب كل المنشورات من آخر 3 أيام
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        
        const { count: recentPostsCount, error: recentPostsError } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .gt('created_at', threeDaysAgo.toISOString());

        if (!recentPostsError) {
          newPostsCount = recentPostsCount || 0;
        }
      }

      console.log('إحصائيات الإشعارات:', { 
        newArticlesCount, 
        newPostsCount,
        lastArticlesVisit,
        lastCommunityVisit 
      });

      setNotifications(prev => ({
        ...prev,
        newArticles: newArticlesCount,
        newPosts: newPostsCount,
        lastVisited: {
          articles: lastArticlesVisit,
          community: lastCommunityVisit
        }
      }));

    } catch (error) {
      console.error('خطأ في جلب الإشعارات:', error);
    }
  };

  // معالجة المقال الجديد عبر Realtime
  const handleNewArticle = (payload) => {
    console.log('معالجة مقال جديد:', payload);
    
    // التحقق من أن المقال مفتوح
    if (payload.new && payload.new.status === 'مفتوح') {
      // التحقق من أن المستخدم الحالي ليس هو منشئ المقال
      // مقارنة مع تحويل المعرفات إلى strings للتوافق
      const newAuthorId = payload.new.author_id ? payload.new.author_id.toString() : null;
      
      if (newAuthorId !== currentUserId) {
        setNotifications(prev => ({
          ...prev,
          newArticles: prev.newArticles + 1
        }));
        
        console.log('تم إضافة مقال جديد للإشعارات');
        
        // إشعار بصري للمستخدم (اختياري)
        if (typeof window !== 'undefined' && window.Notification && Notification.permission === 'granted') {
          new Notification('مقال جديد!', {
            body: `تم نشر مقال جديد: ${payload.new.title}`,
            icon: '/favicon.ico'
          });
        }
      }
    }
  };

  // معالجة المنشور الجديد عبر Realtime
  const handleNewPost = (payload) => {
    console.log('معالجة منشور جديد:', payload);
    
    if (payload.new) {
      // التحقق من أن المستخدم الحالي ليس هو منشئ المنشور
      // مقارنة مع تحويل UUIDs إلى strings للتوافق
      const newAuthorId = payload.new.author_id ? payload.new.author_id.toString() : null;
      
      if (newAuthorId !== currentUserId) {
        setNotifications(prev => ({
          ...prev,
          newPosts: prev.newPosts + 1
        }));
        
        console.log('تم إضافة منشور جديد للإشعارات');
        
        // إشعار بصري للمستخدم (اختياري)
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

  // تحديث آخر زيارة للمقالات
  const markArticlesAsVisited = () => {
    if (!currentUserId) return;
    
    const now = new Date().toISOString();
    const key = `${STORAGE_KEYS.LAST_ARTICLES_VISIT}_${currentUserId}`;
    
    localStorage.setItem(key, now);
    setNotifications(prev => ({
      ...prev,
      newArticles: 0,
      lastVisited: {
        ...prev.lastVisited,
        articles: now
      }
    }));
    
    console.log('تم تحديث آخر زيارة للمقالات:', now);
  };

  // تحديث آخر زيارة للمجتمع
  const markCommunityAsVisited = () => {
    if (!currentUserId) return;
    
    const now = new Date().toISOString();
    const key = `${STORAGE_KEYS.LAST_COMMUNITY_VISIT}_${currentUserId}`;
    
    localStorage.setItem(key, now);
    setNotifications(prev => ({
      ...prev,
      newPosts: 0,
      lastVisited: {
        ...prev.lastVisited,
        community: now
      }
    }));
    
    console.log('تم تحديث آخر زيارة للمجتمع:', now);
  };

  // إعادة تعيين جميع الإشعارات
  const resetNotifications = () => {
    if (!currentUserId) return;
    
    setNotifications({
      newArticles: 0,
      newPosts: 0,
      lastVisited: {
        articles: null,
        community: null
      }
    });
    
    const articlesKey = `${STORAGE_KEYS.LAST_ARTICLES_VISIT}_${currentUserId}`;
    const communityKey = `${STORAGE_KEYS.LAST_COMMUNITY_VISIT}_${currentUserId}`;
    
    localStorage.removeItem(articlesKey);
    localStorage.removeItem(communityKey);
    
    console.log('تم إعادة تعيين جميع الإشعارات');
  };

  // تحديث الإشعارات يدوياً
  const refreshNotifications = () => {
    if (currentUser && currentUserId) {
      console.log('تحديث الإشعارات يدوياً...');
      fetchNotifications();
    }
  };

  const value = {
    notifications,
    isLoading,
    currentUser,
    currentUserId,
    markArticlesAsVisited,
    markCommunityAsVisited,
    resetNotifications,
    refreshNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};