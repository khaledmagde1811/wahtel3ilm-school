import { supabase } from "../Utilities/supabaseClient";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedBackground from "../Utilities/AnimatedBackground";
import { Mail, Lock, ArrowRight, CheckCircle } from "lucide-react";

export default function ResetPassword() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState(null);

  const navigate = useNavigate();

  // إرسال رابط إعادة تعيين كلمة المرور
  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // التحقق من وجود البريد في جدول students
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("email")
        .eq("email", email)
        .single();

      if (studentError || !studentData) {
        setMessage("البريد الإلكتروني غير مسجل في النظام ❌");
        setLoading(false);
        return;
      }

      // إرسال رابط إعادة تعيين كلمة المرور عبر Supabase Auth
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#/reset-password`,
      });

      if (error) {
        setMessage(`خطأ: ${error.message} ❌`);
      } else {
        setMessage("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني ✅");
        setStep("waiting");
      }
    } catch (err) {
      setMessage("حدث خطأ غير متوقع أثناء الإرسال ❌");
    } finally {
      setLoading(false);
    }
  };

  // تحديث كلمة المرور الجديدة
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (newPassword !== confirmPassword) {
        setMessage("كلمة المرور غير متطابقة ❌");
        setLoading(false);
        return;
      }

      if (newPassword.length < 6) {
        setMessage("كلمة المرور يجب أن تكون 6 أحرف على الأقل ❌");
        setLoading(false);
        return;
      }

      // تحديث كلمة المرور في Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        setMessage(`خطأ في تحديث كلمة المرور: ${error.message} ❌`);
      } else {
        setMessage("تم تحديث كلمة المرور بنجاح ✅");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      setMessage("حدث خطأ أثناء تحديث كلمة المرور ❌");
    } finally {
      setLoading(false);
    }
  };

  // التحقق من وجود session أو access_token في URL للانتقال لخطوة تحديث كلمة المرور
  useState(() => {
    const handleAuthStateChange = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setStep("password");
        setEmail(session.user.email);
      }
    };

    handleAuthStateChange();

    // الاستماع لتغييرات حالة المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        setStep("password");
        setEmail(session.user.email);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <AnimatedBackground className="min-h-screen flex items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#665446] mb-2">إعادة تعيين كلمة المرور</h2>
          <p className="text-gray-600 text-sm">
            {step === "email" && "أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين"}
            {step === "waiting" && "تحقق من بريدك الإلكتروني واتبع التعليمات"}
            {step === "password" && "أدخل كلمة المرور الجديدة"}
          </p>
        </div>

        {/* مؤشر الخطوات */}
        <div className="flex justify-center mb-6">
          <div className="flex space-x-2">
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
              step === "email" ? "bg-[#665446]" : "bg-green-500"
            }`}></div>
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
              step === "waiting" ? "bg-[#665446]" : step === "password" ? "bg-green-500" : "bg-gray-300"
            }`}></div>
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
              step === "password" ? "bg-[#665446]" : "bg-gray-300"
            }`}></div>
          </div>
        </div>

        {/* رسائل التنبيه */}
        {message && (
          <div className={`text-center text-sm mb-4 p-4 rounded-lg ${
            message.includes("تم إرسال") || message.includes("تم تحديث")
              ? "bg-green-100 text-green-700 border border-green-200"
              : message.includes("غير مسجل") || message.includes("خطأ") || message.includes("غير متطابقة")
              ? "bg-red-100 text-red-700 border border-red-200"
              : "bg-blue-100 text-blue-700 border border-blue-200"
          }`}>
            {message}
          </div>
        )}

        {/* خطوة إدخال البريد الإلكتروني */}
        {step === "email" && (
          <form onSubmit={handleSendResetEmail} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#665446] mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full p-3 pr-10 border border-[#CDC0B6]/30 rounded-lg bg-white/80 backdrop-blur-sm focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/20 transition-all duration-300"
                  required
                  disabled={loading}
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || !email.trim()} 
              className="w-full py-3 bg-[#665446] text-white rounded-lg hover:bg-[#5A4633] hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  جاري الإرسال...
                </>
              ) : (
                <>
                  إرسال رابط إعادة التعيين
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            <div className="text-center">
              <button 
                type="button" 
                onClick={() => navigate("/login")} 
                className="text-[#665446] underline text-sm hover:no-underline transition-colors duration-200"
              >
                العودة لتسجيل الدخول
              </button>
            </div>
          </form>
        )}

        {/* خطوة انتظار الرد على البريد */}
        {step === "waiting" && (
          <div className="text-center space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-blue-600 text-4xl mb-2">📧</div>
              <p className="text-blue-800 text-sm">
                تم إرسال رابط إعادة تعيين كلمة المرور إلى:
              </p>
              <p className="font-semibold text-blue-900 mt-1">{email}</p>
              <p className="text-xs text-blue-600 mt-2">
                تحقق من صندوق الوارد وقد تحتاج للبحث في مجلد الرسائل غير المرغوب فيها
              </p>
            </div>
            
            <button 
              onClick={() => setStep("email")} 
              className="text-[#665446] underline text-sm hover:no-underline transition-colors duration-200"
            >
              استخدام بريد إلكتروني آخر
            </button>
            
            <div className="text-center">
              <button 
                type="button" 
                onClick={() => navigate("/login")} 
                className="text-[#665446] underline text-sm hover:no-underline transition-colors duration-200"
              >
                العودة لتسجيل الدخول
              </button>
            </div>
          </div>
        )}

        {/* خطوة تحديث كلمة المرور */}
        {step === "password" && (
          <form onSubmit={handlePasswordUpdate} className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                <strong>البريد الإلكتروني:</strong> {email}
              </p>
              <p className="text-xs text-green-600 mt-1">
                جاري تحديث كلمة المرور لهذا الحساب
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#665446] mb-2">
                كلمة المرور الجديدة
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 pr-10 border border-[#CDC0B6]/30 rounded-lg bg-white/80 backdrop-blur-sm focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/20 transition-all duration-300"
                  required
                  minLength="6"
                  disabled={loading}
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#665446] mb-2">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 pr-10 border border-[#CDC0B6]/30 rounded-lg bg-white/80 backdrop-blur-sm focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/20 transition-all duration-300"
                  required
                  disabled={loading}
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || !newPassword.trim() || newPassword !== confirmPassword} 
              className="w-full py-3 bg-[#665446] text-white rounded-lg hover:bg-[#5A4633] hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  جاري التحديث...
                </>
              ) : (
                <>
                  تحديث كلمة المرور
                  <CheckCircle size={20} />
                </>
              )}
            </button>

            <div className="text-center">
              <button 
                type="button" 
                onClick={() => navigate("/login")} 
                className="text-[#665446] underline text-sm hover:no-underline transition-colors duration-200"
              >
                العودة لتسجيل الدخول
              </button>
            </div>
          </form>
        )}
      </div>
    </AnimatedBackground>
  );
}