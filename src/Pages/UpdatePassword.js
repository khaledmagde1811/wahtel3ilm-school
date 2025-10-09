import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../Utilities/supabaseClient';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const UpdatePassword = () => {
  // ======= State =======
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [message, setMessage] = useState('');          // نص الرسالة داخل الصفحة
  const [messageType, setMessageType] = useState('');  // 'success' | 'error'
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ======= Helpers =======
  // استخراج التوكنات من الهاش (#/update-password#access_token=...&refresh_token=...&type=recovery)
  const getTokensFromHash = () => {
    try {
      const rawHash = window.location.hash || '';
      const noHash = rawHash.startsWith('#') ? rawHash.slice(1) : rawHash;
      const parts = noHash.split('#');
      const afterRoute = parts.length > 1 ? parts.slice(1).join('#') : parts[0];
      const params = new URLSearchParams(afterRoute || '');
      return {
        access_token: params.get('access_token'),
        refresh_token: params.get('refresh_token'),
        type: params.get('type'),
        error: params.get('error'),
      };
    } catch {
      return { access_token: null, refresh_token: null, type: null, error: null };
    }
  };

  // فاليديشن: 6 أحرف على الأقل + تحتوي على أحرف + تحتوي على أرقام
  const validatePassword = (pwd) => {
    const minLength = pwd.length >= 6;
    const hasLetters = /[A-Za-z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    return {
      minLength,
      hasLetters,
      hasNumbers,
      isValid: minLength && hasLetters && hasNumbers,
    };
  };

  const passwordValidation = validatePassword(password);

  // ======= Effects =======
  useEffect(() => {
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ======= Session / Token Check =======
  const checkSession = async () => {
    try {
      // حاول قراءة من الquery، ولو مش موجودة جرّب الهاش
      const hashTokens = getTokensFromHash();
      const accessToken = searchParams.get('access_token') || hashTokens.access_token;
      const refreshToken = searchParams.get('refresh_token') || hashTokens.refresh_token;
      const linkError   = searchParams.get('error')        || hashTokens.error;
      const linkType    = searchParams.get('type')         || hashTokens.type;

      if (linkError) {
        setMessage('الرابط غير صحيح أو منتهي الصلاحية');
        setMessageType('error');
        setIsValidToken(false);
        return;
      }

      // روابط الاسترداد من Supabase بتيجي type=recovery
      if (linkType && linkType !== 'recovery') {
        setMessage('هذا الرابط غير مخصص لإعادة تعيين كلمة المرور');
        setMessageType('error');
        setIsValidToken(false);
        return;
      }

      if (accessToken && refreshToken) {
        // أنشئ الجلسة من التوكنات
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error('setSession error:', error);
          setMessage('الرابط غير صحيح أو منتهي الصلاحية');
          setMessageType('error');
          setIsValidToken(false);
        } else {
          // نظّف الرابط من التوكنات بعد نجاح إنشاء الجلسة
          try {
            const cleanUrl = `${window.location.origin}${window.location.pathname}#/update-password`;
            window.history.replaceState({}, '', cleanUrl);
          } catch {}
          setIsValidToken(true);
          setMessage('يمكنك الآن تغيير كلمة المرور');
          setMessageType('success');
        }
      } else {
        // لو مفيش توكنات في الرابط، جرّب الجلسة الحالية (لو المستخدم بالفعل متسجل من قبل)
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          setMessage('الرابط غير صحيح أو منتهي الصلاحية. يرجى طلب رابط جديد.');
          setMessageType('error');
          setIsValidToken(false);
        } else {
          setIsValidToken(true);
          setMessage('يمكنك الآن تغيير كلمة المرور');
          setMessageType('success');
        }
      }
    } catch (err) {
      console.error('خطأ في التحقق من الجلسة:', err);
      setMessage('حدث خطأ غير متوقع');
      setMessageType('error');
      setIsValidToken(false);
    } finally {
      setIsCheckingToken(false);
    }
  };

  // ======= Submit =======
  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    // تنبيهات سريعة بالتوست + تحديث message box داخل الصفحة
    if (!password || !confirmPassword) {
      setMessage('يرجى ملء جميع الحقول');
      setMessageType('error');
      toast.error('❌ يرجى ملء جميع الحقول');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('كلمات المرور غير متطابقة');
      setMessageType('error');
      toast.error('❌ كلمات المرور غير متطابقة');
      return;
    }

    if (!passwordValidation.isValid) {
      setMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل وتحتوي على أحرف وأرقام');
      setMessageType('error');
      toast.error('❌ كلمة المرور يجب أن تكون 6 أحرف على الأقل وتحتوي على أحرف وأرقام');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        console.error('خطأ في تحديث كلمة المرور:', error);
        const raw = (error.message || '').toLowerCase();
        let friendly = 'فشل في تحديث كلمة المرور. حاول مرة أخرى.';
        if (raw.includes('new password should be different')) {
          friendly = '❌ كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية.';
        } else if (raw.includes('at least') || raw.includes('6 characters')) {
          friendly = '❌ كلمة المرور قصيرة. يجب أن تكون 6 أحرف على الأقل.';
        } else if (raw.includes('rate limit') || raw.includes('too many')) {
          friendly = '❌ محاولات كثيرة خلال وقت قصير. انتظر دقيقة وحاول مرة أخرى.';
        }
        setMessage(friendly);
        setMessageType('error');
        toast.error(friendly);
        return;
      }

      // نجاح
      setMessage('تم تحديث كلمة المرور بنجاح!');
      setMessageType('success');
      toast.success('تم تحديث كلمة المرور بنجاح ✅', {
        style: { background: '#4CAF50', color: '#fff', fontFamily: 'Almarai' },
        duration: 4000,
      });

      // إعادة توجيه بعد ثوانٍ
      setTimeout(() => navigate('/login'), 3000);

    } catch (err) {
      console.error('خطأ غير متوقع:', err);
      setMessage('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
      setMessageType('error');
      toast.error('حدث خطأ غير متوقع. حاول مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  // ======= Loading while checking token =======
  if (isCheckingToken) {
    return (
      <>
        <Toaster position="top-right" reverseOrder={false} />
        <div className="min-h-screen bg-gradient-to-br from-[#FFF9EF] to-[#F5E6D3] flex items-center justify-center" dir="rtl">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#665446] mx-auto mb-4"></div>
              <p className="text-[#665446] font-[Almarai]">جاري التحقق من الرابط...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ======= UI =======
  return (
    <>
      {/* Toast container داخل الصفحة */}
      <Toaster position="top-right" reverseOrder={false} />

      <div className="min-h-screen bg-gradient-to-br from-[#FFF9EF] to-[#F5E6D3] flex items-center justify-center px-4 py-8" dir="rtl">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#665446] rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#665446] font-[Almarai] mb-2">
              إعادة تعيين كلمة المرور
            </h1>
            <p className="text-gray-600 font-[Almarai] text-sm">
              أدخل كلمة المرور الجديدة لحسابك
            </p>
          </div>

          {/* Status message box داخل الصفحة */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                messageType === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {messageType === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <p className="font-[Almarai] text-sm">{message}</p>
            </div>
          )}

          {/* Main content */}
          {isValidToken ? (
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-[#665446] mb-2 font-[Almarai]">
                  كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#665446] focus:border-transparent font-[Almarai]"
                    placeholder="أدخل كلمة المرور الجديدة"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Indicators */}
                {password && (
                  <div className="mt-2 space-y-1 text-xs font-[Almarai]">
                    <div className={`flex items-center gap-2 ${passwordValidation.minLength ? 'text-green-600' : 'text-red-600'}`}>
                      <div className={`w-2 h-2 rounded-full ${passwordValidation.minLength ? 'bg-green-600' : 'bg-red-600'}`} />
                      6 أحرف على الأقل
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.hasLetters ? 'text-green-600' : 'text-red-600'}`}>
                      <div className={`w-2 h-2 rounded-full ${passwordValidation.hasLetters ? 'bg-green-600' : 'bg-red-600'}`} />
                      تحتوي على أحرف
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.hasNumbers ? 'text-green-600' : 'text-red-600'}`}>
                      <div className={`w-2 h-2 rounded-full ${passwordValidation.hasNumbers ? 'bg-green-600' : 'bg-red-600'}`} />
                      تحتوي على أرقام
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-medium text-[#665446] mb-2 font-[Almarai]">
                  تأكيد كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#665446] focus:border-transparent font-[Almarai]"
                    placeholder="أعد إدخال كلمة المرور"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Match indicator */}
                {confirmPassword && (
                  <div
                    className={`mt-2 text-xs flex items-center gap-2 ${
                      password === confirmPassword ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        password === confirmPassword ? 'bg-green-600' : 'bg-red-600'
                      }`}
                    />
                    <span className="font-[Almarai]">
                      {password === confirmPassword ? 'كلمات المرور متطابقة' : 'كلمات المرور غير متطابقة'}
                    </span>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || !passwordValidation.isValid || password !== confirmPassword}
                className="w-full bg-[#665446] text-white py-3 px-4 rounded-lg hover:bg-[#8B7355] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-[Almarai] font-bold flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    جاري التحديث...
                  </>
                ) : (
                  'تحديث كلمة المرور'
                )}
              </button>
            </form>
          ) : (
            // حالة عدم صلاحية الرابط
            <div className="text-center space-y-4">
              <p className="text-gray-600 font-[Almarai]">
                لا يمكن الوصول لهذه الصفحة مباشرة
              </p>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 text-[#665446] hover:text-[#8B7355] transition-colors font-[Almarai] font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                العودة لتسجيل الدخول
              </button>
            </div>
          )}

          {/* Footer: زر العودة دائمًا عند صلاحية التوكن */}
          {isValidToken && (
            <div className="mt-8 text-center">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 text-[#665446] hover:text-[#8B7355] transition-colors font-[Almarai] text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                العودة لتسجيل الدخول
              </button>
            </div>
          )}

          {/* Success redirect hint */}
          {messageType === 'success' && isValidToken && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 font-[Almarai]">
                سيتم إعادة توجيهك لصفحة تسجيل الدخول خلال 3 ثوان...
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UpdatePassword;
