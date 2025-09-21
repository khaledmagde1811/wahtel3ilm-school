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
  const [isLoading, setIsLoading] = useState(true);

  // تحديد مفاتيح localStorage
  const STORAGE_KEYS = {
    LAST_ARTICLES_VISIT: 'last_articles_visit',
    LAST_COMMUNITY_VISIT: 'last_community_visit'
  };

  // التحقق من المستخدم الحالي
  useEffect(() => {
    checkCurrentUser();
  }, []);

  // جلب الإشعارات عند تسجيل الدخول
  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      // تحديث الإشعارات كل دقيقة
      const interval = setInterval(fetchNotifications, 60000);
      
      // الاستماع للتغييرات في قاعدة البيانات
      const articlesSubscription = supabase
        .channel('articles-changes')
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'articles' 
          },
          handleNewArticle
        )
        .subscribe();

      const postsSubscription = supabase
        .channel('posts-changes')
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'posts' 
          },
          handleNewPost
        )
        .subscribe();

      return () => {
        clearInterval(interval);
        supabase.removeChannel(articlesSubscription);
        supabase.removeChannel(postsSubscription);
      };
    } else {
      // إذا لم يكن هناك مستخدم، امسح الإشعارات
      setNotifications({
        newArticles: 0,
        newPosts: 0,
        lastVisited: {
          articles: null,
          community: null
        }
      });
    }
  }, [currentUser]);

  const checkCurrentUser = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('خطأ في التحقق من المستخدم:', error);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    if (!currentUser) return;

    try {
      const now = new Date().toISOString();
      
      // جلب آخر زيارة من localStorage
      const lastArticlesVisit = localStorage.getItem(STORAGE_KEYS.LAST_ARTICLES_VISIT);
      const lastCommunityVisit = localStorage.getItem(STORAGE_KEYS.LAST_COMMUNITY_VISIT);

      // حساب عدد المقالات الجديدة
      let newArticlesCount = 0;
      if (lastArticlesVisit) {
        const { count: articlesCount, error: articlesError } = await supabase
          .from('articles')
          .select('*', { count: 'exact', head: true })
          .gt('created_at', lastArticlesVisit);

        if (!articlesError) {
          newArticlesCount = articlesCount || 0;
        }
      } else {
        // إذا لم يسبق الزيارة، احسب كل المقالات من آخر 7 أيام
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const { count: recentArticlesCount, error: recentArticlesError } = await supabase
          .from('articles')
          .select('*', { count: 'exact', head: true })
          .gt('created_at', weekAgo.toISOString());

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
        // إذا لم يسبق الزيارة، احسب كل المنشورات من آخر 7 أيام
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const { count: recentPostsCount, error: recentPostsError } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .gt('created_at', weekAgo.toISOString());

        if (!recentPostsError) {
          newPostsCount = recentPostsCount || 0;
        }
      }

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
    setNotifications(prev => ({
      ...prev,
      newArticles: prev.newArticles + 1
    }));
  };

  // معالجة المنشور الجديد عبر Realtime
  const handleNewPost = (payload) => {
    setNotifications(prev => ({
      ...prev,
      newPosts: prev.newPosts + 1
    }));
  };

  // تحديث آخر زيارة للمقالات
  const markArticlesAsVisited = () => {
    const now = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.LAST_ARTICLES_VISIT, now);
    setNotifications(prev => ({
      ...prev,
      newArticles: 0,
      lastVisited: {
        ...prev.lastVisited,
        articles: now
      }
    }));
  };

  // تحديث آخر زيارة للمجتمع
  const markCommunityAsVisited = () => {
    const now = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.LAST_COMMUNITY_VISIT, now);
    setNotifications(prev => ({
      ...prev,
      newPosts: 0,
      lastVisited: {
        ...prev.lastVisited,
        community: now
      }
    }));
  };

  // إعادة تعيين جميع الإشعارات
  const resetNotifications = () => {
    setNotifications({
      newArticles: 0,
      newPosts: 0,
      lastVisited: {
        articles: null,
        community: null
      }
    });
    localStorage.removeItem(STORAGE_KEYS.LAST_ARTICLES_VISIT);
    localStorage.removeItem(STORAGE_KEYS.LAST_COMMUNITY_VISIT);
  };

  // تحديث الإشعارات يدوياً
  const refreshNotifications = () => {
    if (currentUser) {
      fetchNotifications();
    }
  };

  const value = {
    notifications,
    isLoading,
    currentUser,
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