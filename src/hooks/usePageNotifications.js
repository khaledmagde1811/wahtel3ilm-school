// hooks/usePageNotifications.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';

/**
 * Hook مخصص لإدارة الإشعارات في الصفحات
 * يقوم تلقائياً بمسح الإشعارات عند دخول الصفحة المناسبة
 * 
 * @param {string} pageType - نوع الصفحة ('articles' | 'community')
 */
export const usePageNotifications = (pageType) => {
  const { markArticlesAsVisited, markCommunityAsVisited, refreshNotifications } = useNotifications();
  const location = useLocation();

  useEffect(() => {
    // مسح الإشعارات عند دخول الصفحة
    if (pageType === 'articles') {
      markArticlesAsVisited();
    } else if (pageType === 'community') {
      markCommunityAsVisited();
    }

    // تحديث الإشعارات عند مغادرة الصفحة
    return () => {
      refreshNotifications();
    };
  }, [location.pathname, pageType, markArticlesAsVisited, markCommun