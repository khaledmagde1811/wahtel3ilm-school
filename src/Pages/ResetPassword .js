import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../Utilities/supabaseClient';
import AnimatedBackground from '../Utilities/AnimatedBackground';
import { Eye, EyeOff, Lock } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' | 'error' | ''
  const [isValidSession, setIsValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    // عند تحميل الصفحة نحاول نقرأ tokens من الـ hash (بعد الـ #)
    const init = async () => {
      try {
        const hash = window.location.hash || '';
        const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.substring(1) : hash);
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          // نحط الجلسة في Supabase
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('setSession error:', error);
            setMessage('الرابط غير صحيح أو منتهي الصلاحية');
            setMessageType('error');
            setIsValidSession(false);
          } else {
            // نظف الـ URL عشان ما يبقاش التوكن ظاهر
            try {
              const cleanUrl = window.location.origin + window.location.pathname;
              window.history.replaceState({}, document.title, cleanUrl);
            } catch (e) {
              // لو ما اشتغلش، الدنيا هتمشي برضه
            }

            setMessage('يمكنك الآن تغيير كلمة المرور');
            setMessageType('success');
            setIsValidSession(true);
          }
        } else {
          // لو مفيش tokens في الـ hash، نتحقق لو فيه مستخدم حاليا
          const { data, error } = await supabase.auth.getUser();
          if (error || !data?.user) {
            setMessage('الرابط غير صحيح أو منتهي الصلاحية. اطلب رابط جديد.');
            setMessageType('error');
            setIsValidSession(false);
          } else {
            setMessage('يمكنك الآن تغيير كلمة المرور');
            setMessageType('success');
            setIsValidSession(true);
          }
        }
      } catch (err) {
        console.error('خطأ في التحقق من الجلسة:', err);
        setMessage('حدث خطأ غير متوقع');
        setMessageType('error');
        setIsValidSession(false);
      } finally {
        setIsCheckingSession(false);
      }
    };

    init();

    // إضافة listener كخطة بديلة (في حال Supabase يغير طريقة الأحداث)
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setIsValidSession(true);
      }
    });

    return () => sub?.unsubscribe();
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    if (!newPassword || !confirmPassword) {
      setMessage('يرجى ملء جميع الحقول');
      setMessageType('error');
      setLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('كلمات المرور غير متطابقة');
      setMessageType('error');
      setLoading(false);
      return;
    }
    if (newPassword.length < 6) {
      setMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setMessage('✅ تم تحديث كلمة المرور بنجاح! سيتم إعادة توجيهك لتسجيل الدخول.');
      setMessageType('success');

      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      console.error('خطأ في تحديث كلمة المرور:', err);
      setMessage(`حدث خطأ: ${err.message || 'خطأ غير معروف'}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="bg-[#CDC0B6] min-h-screen flex items-center justify-center px-4" dir="rtl">
        <div className="bg-[#FFF9EF] p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#665446] mx-auto mb-4"></div>
          <p className="text-[#665446] font-[Almarai]">جاري التحقق من الرابط...</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatedBackground className="bg-[#CDC0B6] min-h-screen flex items-center justify-center px-4 py-8" dir="rtl">
      <div className="bg-[#FFF9EF] p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#665446] rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#665446] mb-2">إعادة تعيين كلمة المرور</h2>
          <p className="text-gray-600 text-sm">أدخل كلمة المرور الجديدة لحسابك</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${messageType === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            <span>{message}</span>
          </div>
        )}

        {isValidSession ? (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#665446] mb-2">كلمة المرور الجديدة</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الجديدة"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#665446] mb-2">تأكيد كلمة المرور</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg"
                  required
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
              className="w-full py-3 bg-[#665446] text-white rounded-xl disabled:opacity-50"
            >
              {loading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 mb-4">لا يمكن الوصول لهذه الصفحة مباشرة. يرجى فتح الرابط المرسل لبريدك.</p>
            <button onClick={() => navigate('/login')} className="text-[#665446]">العودة لتسجيل الدخول</button>
          </div>
        )}

      </div>
    </AnimatedBackground>
  );
};

export default ResetPassword;
