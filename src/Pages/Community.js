import React, { useState, useEffect } from 'react';
import { supabase } from '../Utilities/supabaseClient';
import { Image, Send, Trash2, Heart, MessageCircle, Share2, Camera, X, AlertCircle } from 'lucide-react';
import AnimatedBackground from '../Utilities/AnimatedBackground'; // Import الخلفية المتحركة الجاهزة
const Community = () => {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [postComments, setPostComments] = useState({});
  const [userLikes, setUserLikes] = useState(new Set());

  // جلب بيانات المستخدم الحالي
  useEffect(() => {
    getCurrentUser();
  }, []);

  // جلب المنشورات مع الإحصائيات
  useEffect(() => {
    fetchPosts();
    if (currentUser) {
      fetchUserLikes();
    }
  }, [currentUser]);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        
        // جلب بيانات المستخدم من جدول students
        const { data: userData, error } = await supabase
          .from('students')
          .select('role, first_name, last_name')
          .eq('auth_id', user.id)
          .single();

        if (!error && userData) {
          setUserRole(userData.role || '');
          setUserName(`${userData.first_name} ${userData.last_name}`);
        }
      }
    } catch (error) {
      console.error('خطأ في جلب بيانات المستخدم:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          post_likes(count),
          post_comments(count),
          post_shares(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const postsWithCounts = (data || []).map(post => ({
        ...post,
        likes_count: post.post_likes?.[0]?.count || 0,
        comments_count: post.post_comments?.[0]?.count || 0,
        shares_count: post.post_shares?.[0]?.count || 0
      }));

      console.log('المنشورات المجلبة:', postsWithCounts);
      setPosts(postsWithCounts);
    } catch (error) {
      console.error('خطأ في جلب المنشورات:', error);
      
      // fallback - جلب المنشورات بدون إحصائيات
      try {
        const { data: basicPosts, error: basicError } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (!basicError) {
          const postsWithZeroCounts = (basicPosts || []).map(post => ({
            ...post,
            likes_count: 0,
            comments_count: 0,
            shares_count: 0
          }));
          console.log('المنشورات الأساسية:', postsWithZeroCounts);
          setPosts(postsWithZeroCounts);
        }
      } catch (fallbackError) {
        console.error('خطأ في الـ fallback:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserLikes = async () => {
    if (!currentUser) return;
    
    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', currentUser.id);

      if (!error) {
        setUserLikes(new Set(data.map(like => like.post_id)));
      }
    } catch (error) {
      console.error('خطأ في جلب الإعجابات:', error);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (!error) {
        setPostComments(prev => ({
          ...prev,
          [postId]: data || []
        }));
      }
    } catch (error) {
      console.error('خطأ في جلب التعليقات:', error);
    }
  };

  const uploadImage = async (file) => {
    try {
      if (!currentUser) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }

      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        throw new Error('يجب أن يكون الملف صورة');
      }

      // التحقق من حجم الملف (5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName;

      console.log('بدء رفع الصورة:', filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('posts-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('خطأ في الرفع:', uploadError);
        throw uploadError;
      }

      console.log('تم رفع الصورة بنجاح:', uploadData);

      const { data: urlData } = supabase.storage
        .from('posts-images')
        .getPublicUrl(filePath);

      console.log('رابط الصورة:', urlData.publicUrl);
      
      return urlData.publicUrl;

    } catch (error) {
      console.error('خطأ في رفع الصورة:', error);
      throw error;
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        alert('يرجى اختيار صورة صحيحة');
        e.target.value = '';
        return;
      }

      // التحقق من حجم الملف
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        e.target.value = '';
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const createPost = async () => {
    if (!currentUser) {
      alert('يجب تسجيل الدخول أولاً');
      return;
    }

    if (!newPostContent.trim() && !selectedImage) {
      alert('يجب كتابة محتوى أو إرفاق صورة على الأقل');
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = null;
      
      if (selectedImage) {
        console.log('بدء رفع الصورة...');
        imageUrl = await uploadImage(selectedImage);
        console.log('تم رفع الصورة:', imageUrl);
      }

      console.log('إنشاء المنشور...');
      const { data: postData, error } = await supabase
        .from('posts')
        .insert([
          {
            content: newPostContent.trim() || '', // إرسال نص فارغ بدلاً من null
            image_url: imageUrl,
            author_id: currentUser.id,
            author_name: userName
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('خطأ في إنشاء المنشور:', error);
        throw error;
      }

      console.log('تم إنشاء المنشور بنجاح:', postData);

      // إضافة المنشور الجديد للقائمة محلياً
      const newPost = {
        ...postData,
        likes_count: 0,
        comments_count: 0,
        shares_count: 0
      };
      
      setPosts(prevPosts => [newPost, ...prevPosts]);

      // إعادة تعيين النموذج
      setNewPostContent('');
      setSelectedImage(null);
      setImagePreview(null);

      console.log('تم إضافة المنشور للقائمة محلياً');

    } catch (error) {
      console.error('خطأ في إنشاء المنشور:', error);
      
      let errorMessage = 'حدث خطأ أثناء نشر المنشور';
      
      if (error.message.includes('يجب تسجيل الدخول')) {
        errorMessage = 'يجب تسجيل الدخول أولاً';
      } else if (error.message.includes('حجم الصورة')) {
        errorMessage = 'حجم الصورة كبير جداً';
      } else if (error.message.includes('نوع الملف')) {
        errorMessage = 'نوع الملف غير مدعوم';
      } else if (error.message.includes('storage')) {
        errorMessage = 'خطأ في رفع الصورة، تأكد من الاتصال بالإنترنت';
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLike = async (postId) => {
    if (!currentUser) {
      alert('يجب تسجيل الدخول للإعجاب');
      return;
    }

    const isLiked = userLikes.has(postId);

    try {
      if (isLiked) {
        // إزالة الإعجاب
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUser.id);

        if (!error) {
          setUserLikes(prev => {
            const newSet = new Set(prev);
            newSet.delete(postId);
            return newSet;
          });

          // تحديث العداد محلياً
          setPosts(prev => prev.map(post => 
            post.id === postId 
              ? { ...post, likes_count: Math.max(0, post.likes_count - 1) }
              : post
          ));
        }
      } else {
        // إضافة إعجاب
        const { error } = await supabase
          .from('post_likes')
          .insert([{ post_id: postId, user_id: currentUser.id }]);

        if (!error) {
          setUserLikes(prev => new Set([...prev, postId]));

          // تحديث العداد محلياً
          setPosts(prev => prev.map(post => 
            post.id === postId 
              ? { ...post, likes_count: (post.likes_count || 0) + 1 }
              : post
          ));
        }
      }
    } catch (error) {
      console.error('خطأ في تغيير الإعجاب:', error);
    }
  };

  const toggleComments = (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));

    // جلب التعليقات إذا لم تكن محملة
    if (!postComments[postId]) {
      fetchComments(postId);
    }
  };

  const addComment = async (postId) => {
    if (!currentUser) {
      alert('يجب تسجيل الدخول للتعليق');
      return;
    }

    const commentText = newComment[postId]?.trim();
    if (!commentText) return;

    try {
      const { error } = await supabase
        .from('post_comments')
        .insert([{
          post_id: postId,
          author_id: currentUser.id,
          author_name: userName,
          content: commentText
        }]);

      if (!error) {
        // مسح النص
        setNewComment(prev => ({ ...prev, [postId]: '' }));
        
        // إعادة جلب التعليقات
        fetchComments(postId);

        // تحديث عداد التعليقات
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, comments_count: (post.comments_count || 0) + 1 }
            : post
        ));
      }
    } catch (error) {
      console.error('خطأ في إضافة التعليق:', error);
    }
  };

  // حذف تعليق
const deleteComment = async (commentId, postId) => {
    try {
      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId);
  
      if (!error) {
        // إعادة جلب التعليقات
        fetchComments(postId);
  
        // تحديث عداد التعليقات
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, comments_count: Math.max(0, post.comments_count - 1) }
            : post
        ));
      }
    } catch (error) {
      console.error('خطأ في حذف التعليق:', error);
    }
  };
  
  // مشاركة منشور
  const sharePost = async (postId) => {
    if (!currentUser) {
      alert('يجب تسجيل الدخول للمشاركة');
      return;
    }
  
    try {
      const { error } = await supabase
        .from('post_shares')
        .insert([{ post_id: postId, user_id: currentUser.id }]);
  
      if (!error) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, shares_count: (post.shares_count || 0) + 1 }
            : post
        ));
        alert('تم تسجيل المشاركة!');
      }
    } catch (error) {
      if (error.code !== '23505') {
        console.error('خطأ في المشاركة:', error);
      }
    }
  };
  
  // حذف منشور
  const deletePost = async (postId, authorId) => {
    if (!currentUser) return;
  
    // التحقق من الصلاحيات
    const canDelete = currentUser.id === authorId || userRole === 'admin';
    
    if (!canDelete) {
      alert('ليس لديك صلاحية لحذف هذا المنشور');
      return;
    }
  
    if (!window.confirm('هل أنت متأكد من حذف هذا المنشور؟')) return;  
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
  
      if (error) throw error;
  
      // تحديث القائمة محلياً
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (error) {
      console.error('خطأ في حذف المنشور:', error);
      alert('حدث خطأ أثناء حذف المنشور');
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`;
    return `منذ ${Math.floor(diffInMinutes / 1440)} يوم`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#665446] mx-auto"></div>
          <p className="mt-4 text-[#665446] font-[Almarai]">جاري تحميل المجتمع...</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatedBackground className="min-h-screen" dir="rtl">
<div className="max-w-4xl mx-auto px-4 py-8 relative z-10">        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#665446] font-[Almarai] mb-2">
            مجتمع واحة العلم
          </h1>
          <p className="text-gray-600 font-[Almarai]">
            شارك أفكارك وتفاعل مع زملائك في رحلة التعلم
          </p>
        </div>

        {/* Create Post Section */}
        {currentUser && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#665446] rounded-full flex items-center justify-center text-white font-bold font-[Almarai]">
                {userName.charAt(0)}
              </div>
              
              <div className="flex-1">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="شارك شيئاً مع المجتمع..."
                  className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-[#665446] focus:border-transparent font-[Almarai]"
                  rows="3"
                />

                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-4 relative inline-block">
                    <img 
                      src={imagePreview} 
                      alt="معاينة الصورة" 
                      className="max-w-xs max-h-64 rounded-lg shadow-md"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                      <Camera className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-600 font-[Almarai]">
                        {selectedImage ? 'تغيير الصورة' : 'إضافة صورة'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        disabled={isSubmitting}
                      />
                    </label>
                  </div>

                  <button
                    onClick={createPost}
                    disabled={isSubmitting || (!newPostContent.trim() && !selectedImage)}
                    className="flex items-center gap-2 px-6 py-2 bg-[#665446] text-white rounded-lg hover:bg-[#8B7355] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-[Almarai] font-bold"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        جاري النشر...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        نشر
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-xl font-[Almarai]">
                لا توجد منشورات بعد
              </p>
              <p className="text-gray-400 font-[Almarai]">
                كن أول من يشارك شيئاً مع المجتمع!
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                
                {/* Post Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#665446] rounded-full flex items-center justify-center text-white font-bold font-[Almarai]">
                        {post.author_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#665446] font-[Almarai]">
                          {post.author_name}
                        </h3>
                        <p className="text-gray-500 text-sm font-[Almarai]">
                          {formatDate(post.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Delete Button (for author or admin) */}
                    {currentUser && (currentUser.id === post.author_id || userRole === 'admin') && (
                      <button
                        onClick={() => deletePost(post.id, post.author_id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف المنشور"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                {post.content && post.content.trim() && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-800 font-[Almarai] leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>
                )}

                {/* Post Image */}
                {post.image_url && (
                  <div className="px-6 pb-4">
                    <img
                      src={post.image_url}
                      alt="صورة المنشور"
                      className="w-full max-h-96 object-cover rounded-lg shadow-sm"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Post Actions */}
                <div className="px-6 py-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-2 transition-colors ${
                          userLikes.has(post.id) 
                            ? 'text-red-500' 
                            : 'text-gray-600 hover:text-red-500'
                        }`}
                      >
                        <Heart 
                          className={`w-5 h-5 ${userLikes.has(post.id) ? 'fill-current' : ''}`} 
                        />
                        <span className="font-[Almarai]">
                          {post.likes_count || 0} إعجاب
                        </span>
                      </button>
                      
                      <button 
                        onClick={() => toggleComments(post.id)}
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-[Almarai]">
                          {post.comments_count || 0} تعليق
                        </span>
                      </button>
                      
                      <button 
                        onClick={() => sharePost(post.id)}
                        className="flex items-center gap-2 text-gray-600 hover:text-green-500 transition-colors"
                      >
                        <Share2 className="w-5 h-5" />
                        <span className="font-[Almarai]">
                          {post.shares_count || 0} مشاركة
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {showComments[post.id] && (
                    <div className="border-t border-gray-100 pt-4">
                      
                      {/* Add Comment */}
                      {currentUser && (
                        <div className="flex gap-3 mb-4">
                          <div className="w-8 h-8 bg-[#665446] rounded-full flex items-center justify-center text-white text-sm font-bold font-[Almarai]">
                            {userName.charAt(0)}
                          </div>
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              value={newComment[post.id] || ''}
                              onChange={(e) => setNewComment(prev => ({
                                ...prev,
                                [post.id]: e.target.value
                              }))}
                              placeholder="اكتب تعليقاً..."
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#665446] focus:border-transparent font-[Almarai] text-sm"
                              onKeyPress={(e) => e.key === 'Enter' && addComment(post.id)}
                            />
                            <button
                              onClick={() => addComment(post.id)}
                              className="px-4 py-2 bg-[#665446] text-white rounded-lg hover:bg-[#8B7355] transition-colors font-[Almarai] text-sm font-bold"
                            >
                              نشر
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Comments List */}
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {(postComments[post.id] || []).map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 bg-[#665446] rounded-full flex items-center justify-center text-white text-sm font-bold font-[Almarai]">
                              {comment.author_name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="bg-gray-100 rounded-lg px-3 py-2">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-bold text-sm text-[#665446] font-[Almarai]">
                                    {comment.author_name}
                                  </h4>
                                  {currentUser && (currentUser.id === comment.author_id || userRole === 'admin') && (
                                    <button
                                      onClick={() => deleteComment(comment.id, post.id)}
                                      className="text-gray-400 hover:text-red-500 transition-colors"
                                      title="حذف التعليق"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                                <p className="text-gray-800 text-sm font-[Almarai] leading-relaxed">
                                  {comment.content}
                                </p>
                              </div>
                              <p className="text-gray-500 text-xs mt-1 font-[Almarai]">
                                {formatDate(comment.created_at)}
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        {postComments[post.id] && postComments[post.id].length === 0 && (
                          <p className="text-center text-gray-500 py-4 font-[Almarai]">
                            لا توجد تعليقات بعد
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Login Prompt for Guests */}
        {!currentUser && (
          <div className="fixed bottom-8 right-8 bg-[#665446] text-white p-4 rounded-lg shadow-lg max-w-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-300" />
              <div>
                <p className="font-bold font-[Almarai] mb-1">انضم للمجتمع</p>
                <p className="text-sm font-[Almarai] opacity-90">
                  سجل دخولك لتتمكن من المشاركة والتفاعل
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AnimatedBackground>
  );
};

export default Community;