        import React, { useState, useEffect } from 'react';
        import { useNavigate, useSearchParams } from 'react-router-dom';
        import { supabase } from '../Utilities/supabaseClient';
        import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

        const UpdatePassword = () => {
        const [password, setPassword] = useState('');
        const [confirmPassword, setConfirmPassword] = useState('');
        const [showPassword, setShowPassword] = useState(false);
        const [showConfirmPassword, setShowConfirmPassword] = useState(false);
        const [isLoading, setIsLoading] = useState(false);
        const [message, setMessage] = useState('');
        const [messageType, setMessageType] = useState(''); // 'success' or 'error'
        const [isValidToken, setIsValidToken] = useState(false);
        const [isCheckingToken, setIsCheckingToken] = useState(true);

        const navigate = useNavigate();
        const [searchParams] = useSearchParams();

        // التحقق من صحة الرابط وجلسة المستخدم
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
                setIsValidToken(false);
                } else {
                console.log('تم إعداد الجلسة بنجاح:', data);
                setIsValidToken(true);
                setMessage('يمكنك الآن تغيير كلمة المرور');
                setMessageType('success');
                }
            } else {
                // التحقق من الجلسة الحالية
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
            } catch (error) {
            console.error('خطأ في التحقق من الجلسة:', error);
            setMessage('حدث خطأ غير متوقع');
            setMessageType('error');
            setIsValidToken(false);
            } finally {
            setIsCheckingToken(false);
            }
        };

        const validatePassword = (password) => {
            const minLength = password.length >= 6;
            const hasUpperCase = /[A-Z]/.test(password);
            const hasLowerCase = /[a-z]/.test(password);
            const hasNumbers = /\d/.test(password);

            return {
            minLength,
            hasUpperCase,
            hasLowerCase,
            hasNumbers,
            isValid: minLength && (hasUpperCase || hasLowerCase || hasNumbers)
            };
        };

        const handleUpdatePassword = async (e) => {
            e.preventDefault();

            if (!password || !confirmPassword) {
            setMessage('يرجى ملء جميع الحقول');
            setMessageType('error');
            return;
            }

            if (password !== confirmPassword) {
            setMessage('كلمات المرور غير متطابقة');
            setMessageType('error');
            return;
            }

            const passwordValidation = validatePassword(password);
            if (!passwordValidation.isValid) {
            setMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            setMessageType('error');
            return;
            }

            setIsLoading(true);
            setMessage('');

            try {
            const { data, error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                console.error('خطأ في تحديث كلمة المرور:', error);
                setMessage(error.message || 'فشل في تحديث كلمة المرور');
                setMessageType('error');
            } else {
                console.log('تم تحديث كلمة المرور بنجاح:', data);
                setMessage('تم تحديث كلمة المرور بنجاح!');
                setMessageType('success');
                
                // إعادة التوجيه بعد 3 ثوان
                setTimeout(() => {
                navigate('/login');
                }, 3000);
            }
            } catch (error) {
            console.error('خطأ غير متوقع:', error);
            setMessage('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
            setMessageType('error');
            } finally {
            setIsLoading(false);
            }
        };

        const passwordValidation = validatePassword(password);

        if (isCheckingToken) {
            return (
            <div className="min-h-screen bg-gradient-to-br from-[#FFF9EF] to-[#F5E6D3] flex items-center justify-center" dir="rtl">
                <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#665446] mx-auto mb-4"></div>
                    <p className="text-[#665446] font-[Almarai]">جاري التحقق من الرابط...</p>
                </div>
                </div>
            </div>
            );
        }

        return (
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

                {isValidToken ? (
                <form onSubmit={handleUpdatePassword} className="space-y-6">
                    
                    {/* Password Field */}
                    <div>
                    <label className="block text-sm font-medium text-[#665446] mb-2 font-[Almarai]">
                        كلمة المرور الجديدة
                    </label>
                    <div className="relative">
                        <input
                        type={showPassword ? "text" : "password"}
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

                    {/* Password Strength Indicator */}
                    {password && (
                        <div className="mt-2 space-y-1">
                        <div className={`text-xs flex items-center gap-2 ${
                            passwordValidation.minLength ? 'text-green-600' : 'text-red-600'
                        }`}>
                            <div className={`w-2 h-2 rounded-full ${
                            passwordValidation.minLength ? 'bg-green-600' : 'bg-red-600'
                            }`} />
                            <span className="font-[Almarai]">6 أحرف على الأقل</span>
                        </div>
                        <div className={`text-xs flex items-center gap-2 ${
                            passwordValidation.hasUpperCase || passwordValidation.hasLowerCase || passwordValidation.hasNumbers 
                            ? 'text-green-600' : 'text-red-600'
                        }`}>
                            <div className={`w-2 h-2 rounded-full ${
                            passwordValidation.hasUpperCase || passwordValidation.hasLowerCase || passwordValidation.hasNumbers 
                                ? 'bg-green-600' : 'bg-red-600'
                            }`} />
                            <span className="font-[Almarai]">حروف وأرقام</span>
                        </div>
                        </div>
                    )}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                    <label className="block text-sm font-medium text-[#665446] mb-2 font-[Almarai]">
                        تأكيد كلمة المرور
                    </label>
                    <div className="relative">
                        <input
                        type={showConfirmPassword ? "text" : "password"}
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

                    {/* Password Match Indicator */}
                    {confirmPassword && (
                        <div className={`mt-2 text-xs flex items-center gap-2 ${
                        password === confirmPassword ? 'text-green-600' : 'text-red-600'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${
                            password === confirmPassword ? 'bg-green-600' : 'bg-red-600'
                        }`} />
                        <span className="font-[Almarai]">
                            {password === confirmPassword ? 'كلمات المرور متطابقة' : 'كلمات المرور غير متطابقة'}
                        </span>
                        </div>
                    )}
                    </div>

                    {/* Submit Button */}
                    <button
                    type="submit"
                    disabled={isLoading || !passwordValidation.isValid || password !== confirmPassword}
                    className="w-full bg-[#665446] text-white py-3 px-4 rounded-lg hover:bg-[#8B7355] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-[Almarai] font-bold flex items-center justify-center gap-2"
                    >
                    {isLoading ? (
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

                {/* Success Redirect Message */}
                {messageType === 'success' && isValidToken && (
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600 font-[Almarai]">
                    سيتم إعادة توجيهك لصفحة تسجيل الدخول خلال 3 ثوان...
                    </p>
                </div>
                )}
            </div>
            </div>
        );
        };

        export default UpdatePassword;