import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../Utilities/supabaseClient';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, ArrowLeft, Shield } from 'lucide-react';
import AnimatedBackground from '../Utilities/AnimatedBackground';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isValidSession, setIsValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // التحقق من وجود access_token في URL
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');

      if (accessToken && refreshToken) {
        // إعداد الجلسة باستخدام الـ tokens
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error('خطأ في إعداد الجلسة:', error);
          setMessage('الرابط غير صحيح أو منتهي الصلاحية');
          setMessageType('error');
          setIsValidSession(false);
        } else {
          setIsValidSession(true);
          setMessage('يمكنك الآن تغيير كلمة المرور');
          setMessageType('success');
        }
      } else {
        // التحقق من الجلسة الحالية
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          setMessage('الرابط غير صحيح أو منتهي الصلاحية. يرجى طلب رابط جديد.');
          setMessageType('error');
          setIsValidSession(false);
        } else {
          setIsValidSession(true);
          setMessage('يمكنك الآن تغيير كلمة المرور');
          setMessageType('success');
        }
      }
    } catch (error) {
      console.error('خطأ في التحقق من الجلسة:', error);
      setMessage('حدث خطأ غير متوقع');
      setMessageType('error');
      setIsValidSession(false);
    } finally {
      setIsCheckingSession(false);
    }
  };

  const validatePassword = (password) => {
    return {
      minLength: password.length >= 6,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  };

  const getPasswordStrength = (password) => {
    const validation = validatePassword(password);
    const score = Object.values(validation).filter(Boolean).length;
    
    if (score <= 1) return { text: 'ضعيفة جداً', color: 'text-red-600', bg: 'bg-red-100' };
    if (score <= 2) return { text: 'ضعيفة', color: 'text-red-500', bg: 'bg-red-50' };
    if (score <= 3) return { text: 'متوسطة', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (score <= 4) return { text: 'قوية', color: 'text-green-600', bg: 'bg-green-100' };
    return { text: 'قوية جداً', color: 'text-green-700', bg: 'bg-green-100' };
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

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
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setMessage('تم تحديث كلمة المرور بنجاح!');
      setMessageType('success');
      
      // إعادة توجيه إلى صفحة تسجيل الدخول بعد 3 ثواني
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('خطأ في تحديث كلمة المرور:', error);
      setMessage(`حدث خطأ: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = newPassword ? getPasswordStrength(newPassword) : null;
  const passwordValidation = validatePassword(newPassword);

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

    <AnimatedBackground className="min-h-screen flex items-center justify-center px-4" dir="rtl">
      <div className="bg-[#FFF9EF] p-8 rounded-xl shadow-lg max-w-md w-full">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#665446] rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#665446] font-[Almarai] mb-2">
            إعادة تعيين كلمة المرور
          </h2>
          <p className="text-gray-600 font-[Almarai] text-sm">
            أدخل كلمة المرور الجديدة لحسابك
          </p>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            messageType === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {messageType === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <p className="font-[Almarai] text-sm">{message}</p>
          </div>
        )}

        {isValidSession ? (
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-[#665446] mb-2 font-[Almarai]">
                كلمة المرور الجديدة
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الجديدة"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#665446] focus:border-transparent font-[Almarai]"
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

              {/* Password Strength Indicator */}
              {newPassword && passwordStrength && (
                <div className={`mt-2 p-3 rounded-lg ${passwordStrength.bg}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4" />
                    <span className={`text-sm font-bold font-[Almarai] ${passwordStrength.color}`}>
                      قوة كلمة المرور: {passwordStrength.text}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className={`flex items-center gap-2 ${
                      passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        passwordValidation.minLength ? 'bg-green-600' : 'bg-gray-400'
                      }`} />
                      <span className="font-[Almarai]">6 أحرف على الأقل</span>
                    </div>
                    
                    <div className={`flex items-center gap-2 ${
                      passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        passwordValidation.hasUpperCase ? 'bg-green-600' : 'bg-gray-400'
                      }`} />
                      <span className="font-[Almarai]">حروف كبيرة</span>
                    </div>
                    
                    <div className={`flex items-center gap-2 ${
                      passwordValidation.hasNumbers ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        passwordValidation.hasNumbers ? 'bg-green-600' : 'bg-gray-400'
                      }`} />
                      <span className="font-[Almarai]">أرقام</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-[#665446] mb-2 font-[Almarai]">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#665446] focus:border-transparent font-[Almarai]"
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

              {/* Password Match Indicator */}
              {confirmPassword && (
                <div className={`mt-2 text-xs flex items-center gap-2 ${
                  newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    newPassword === confirmPassword ? 'bg-green-600' : 'bg-red-600'
                  }`} />
                  <span className="font-[Almarai]">
                    {newPassword === confirmPassword ? 'كلمات المرور متطابقة' : 'كلمات المرور غير متطابقة'}
                  </span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
              className="w-full py-3 bg-[#665446] text-white rounded-xl hover:bg-[#8B7355] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-[Almarai] font-bold flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  جاري التحديث...
                </>
              ) : (
                'تحديث كلمة المرور'
              )}
            </button>
          </form>
        ) : (
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

        {/* Footer */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 text-[#665446] hover:text-[#8B7355] transition-colors font-[Almarai] text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة لتسجيل الدخول
          </button>
        </div>

        {/* Success Redirect Message */}
        {messageType === 'success' && isValidSession && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 font-[Almarai]">
              سيتم إعادة توجيهك لصفحة تسجيل الدخول خلال 3 ثوان...
            </p>
          </div>
        )}
      </div>
    </AnimatedBackground>
  );
};

export default ResetPassword;