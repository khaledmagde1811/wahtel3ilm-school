// src/Pages/ResetPassword.js
import React, { useEffect, useState } from 'react';
import { supabase } from '../Utilities/supabaseClient';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [validSession, setValidSession] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const fullHash = window.location.hash || ''; // مثال: "#/reset-password#access_token=..."
        console.log('fullHash:', fullHash);

        let tokenPart = '';
        
        // نتعامل مع الحالات المختلفة للـ hash
        if (fullHash.includes('#access_token=') || fullHash.includes('#type=recovery')) {
          // نستخرج الجزء اللي فيه التوكنات
          const tokenStartIndex = fullHash.indexOf('#access_token=') !== -1 
            ? fullHash.indexOf('#access_token=') 
            : fullHash.indexOf('#type=recovery');
          
          if (tokenStartIndex !== -1) {
            tokenPart = fullHash.substring(tokenStartIndex + 1); // نشيل الـ # من الأول
          }
        } else if (fullHash.includes('access_token=') || fullHash.includes('type=recovery')) {
          // لو التوكنات موجودة بدون # إضافية
          const urlParams = new URLSearchParams(window.location.search || fullHash.substring(1));
          tokenPart = urlParams.toString();
        }

        console.log('tokenPart after extraction:', tokenPart);

        // نستخرج الـ parameters
        const params = new URLSearchParams(tokenPart);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        const type = params.get('type');

        console.log('Extracted tokens:', { access_token: access_token ? 'موجود' : 'غير موجود', 
                                         refresh_token: refresh_token ? 'موجود' : 'غير موجود', 
                                         type });

        if (access_token && refresh_token && type === 'recovery') {
          // نحط الجلسة لدى Supabase
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (error) {
            console.error('setSession error:', error);
            setMessage('⚠️ الرابط غير صالح أو منتهي الصلاحية.');
            setValidSession(false);
          } else {
            console.log('Session set successfully:', data);
            
            // ننظف الـ URL: نحتفظ بالراوت بدون التوكنات
            try {
              const cleanUrl = window.location.origin + window.location.pathname + '#/reset-password';
              window.history.replaceState({}, document.title, cleanUrl);
            } catch (e) {
              console.warn('Could not clean URL:', e);
            }

            setMessage('يمكنك الآن تغيير كلمة المرور.');
            setValidSession(true);
          }
        } else {
          // إن لم توجد توكنات أو النوع مش recovery: نتحقق هل المستخدم مسجل حالياً
          const { data, error } = await supabase.auth.getUser();
          if (!error && data?.user) {
            // المستخدم مسجل دخول بالفعل
            setValidSession(true);
            setMessage('يمكنك الآن تغيير كلمة المرور.');
          } else {
            setMessage('⚠️ افتح هذه الصفحة من الرابط المرسل إلى بريدك الإلكتروني.');
            setValidSession(false);
          }
        }
      } catch (err) {
        console.error('خطأ في التحقق من الجلسة:', err);
        setMessage('حدث خطأ غير متوقع.');
        setValidSession(false);
      } finally {
        setChecking(false);
      }
    };

    init();

    // Listener احتياطي لأي تغيُّر في auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
      if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') {
        setValidSession(true);
        setMessage('يمكنك الآن تغيير كلمة المرور.');
      } else if (event === 'SIGNED_OUT') {
        setValidSession(false);
        setMessage('⚠️ افتح هذه الصفحة من الرابط المرسل إلى بريدك الإلكتروني.');
      }
    });
    
    return () => subscription?.unsubscribe();
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (newPassword !== confirmPassword) {
      return setMessage('❌ كلمات المرور غير متطابقة');
    }
    
    if (newPassword.length < 6) {
      return setMessage('❌ كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });
      
      if (error) throw error;
      
      setMessage('✅ تم تحديث كلمة المرور بنجاح! جاري إعادة التوجيه لتسجيل الدخول...');
      
      // ننتظر شوية ثم نوجه المستخدم لصفحة اللوجين
      setTimeout(() => navigate('/login'), 2000);
      
    } catch (err) {
      console.error('updateUser error:', err);
      setMessage('❌ حدث خطأ أثناء التحديث: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" dir="rtl">
        <div className="bg-[#FFF9EF] p-6 rounded shadow text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#665446] mx-auto mb-4"></div>
          جاري التحقق من الرابط...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" dir="rtl">
      <div className="bg-[#FFF9EF] p-8 rounded-xl shadow max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-center">إعادة تعيين كلمة المرور</h2>

        {message && (
          <div className={`text-center text-sm mb-4 p-3 rounded ${
            message.includes('✅') ? 'bg-green-100 text-green-700' : 
            message.includes('❌') || message.includes('⚠️') ? 'bg-red-100 text-red-700' : 
            'bg-blue-100 text-blue-700'
          }`}>
            {message}
          </div>
        )}

        {validSession ? (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <input 
                type="password" 
                placeholder="كلمة المرور الجديدة" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} 
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-[#665446]" 
                required 
                minLength="6"
              />
            </div>
            <div>
              <input 
                type="password" 
                placeholder="تأكيد كلمة المرور" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-[#665446]" 
                required 
                minLength="6"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || !newPassword || !confirmPassword} 
              className="w-full py-3 bg-[#665446] text-white rounded hover:bg-[#554433] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
              <p className="font-semibold">لا يمكنك تغيير كلمة المرور هنا</p>
              <p className="text-sm mt-2">افتح الرابط المرسل على بريدك الإلكتروني مرة أخرى</p>
            </div>
            <button 
              onClick={() => navigate('/forgot-password')} 
              className="mt-4 text-[#665446] underline hover:no-underline"
            >
              طلب رابط جديد
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;