import { supabase } from "../Utilities/supabaseClient";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedBackground from "../Utilities/AnimatedBackground";
import { Lock, CheckCircle } from "lucide-react";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  const navigate = useNavigate();

  // التحقق من وجود access_token في الرابط عند تحميل الصفحة
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");

    if (!accessToken) {
      setMessage("رابط إعادة التعيين غير صالح ❌");
      setTokenValid(false);
      return;
    }

    // تعيين التوكن مؤقتًا في Supabase Auth session
    supabase.auth.setSession({ access_token: accessToken })
      .then(({ error }) => {
        if (error) {
          setMessage("رابط إعادة التعيين غير صالح أو انتهت صلاحيته ❌");
          setTokenValid(false);
        } else {
          setTokenValid(true);
        }
      });
  }, []);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

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

    try {
      // تحديث كلمة المرور باستخدام Supabase
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

  return (
    <AnimatedBackground className="min-h-screen flex items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#665446] mb-2">إعادة تعيين كلمة المرور</h2>
          <p className="text-gray-600 text-sm">
            {tokenValid ? "أدخل كلمة المرور الجديدة لتحديث حسابك" : "لا يمكن تحديث كلمة المرور"}
          </p>
        </div>

        {message && (
          <div className={`text-center text-sm mb-4 p-4 rounded-lg ${
            message.includes("تم تحديث")
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-red-100 text-red-700 border border-red-200"
          }`}>
            {message}
          </div>
        )}

        {tokenValid && (
          <form onSubmit={handlePasswordUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#665446] mb-2">كلمة المرور الجديدة</label>
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
              <label className="block text-sm font-medium text-[#665446] mb-2">تأكيد كلمة المرور</label>
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
