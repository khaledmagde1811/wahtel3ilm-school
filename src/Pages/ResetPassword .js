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
  const [expiredOrInvalid, setExpiredOrInvalid] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // نقرأ الهـاش بالكامل (كل شيء بعد #)
    // أمثلة: 
    // 1) "/reset-password#access_token=XXX&type=recovery..."
    // 2) "access_token=XXX&type=recovery..."
    const rawHash = window.location.hash || ""; // يعطي شيئًا مثل "#/reset-password#access_token=..."
    const withoutHash = rawHash.startsWith("#") ? rawHash.slice(1) : rawHash; // "/reset-password#access_token=..."
    // إذا فيه # ثاني نفصل عنده ونأخذ الجزء اللي بعده
    const tokenPart = withoutHash.includes("#") ? withoutHash.split("#").slice(1).join("#") : withoutHash;
    // كمان نحاول من search كوسيلة احتياطية (بعض حالات قد تضع المعلمات في query)
    const qs = new URLSearchParams(window.location.search);
    const fallbackAccess = qs.get("access_token");
    const fallbackRefresh = qs.get("refresh_token");
    const fallbackError = qs.get("error");

    // الآن نحاول استخراج من tokenPart
    const params = new URLSearchParams(tokenPart || "");
    const accessToken = params.get("access_token") || fallbackAccess;
    const refreshToken = params.get("refresh_token") || fallbackRefresh;
    const type = params.get("type");
    const hashError = params.get("error") || fallbackError;

    // حالة وجود خطأ في الهاش (مثل otp_expired)
    if (hashError) {
      setMessage("رابط إعادة التعيين غير صالح أو انتهت صلاحيته ❌");
      setExpiredOrInvalid(true);
      setTokenValid(false);
      return;
    }

    // لا يوجد توكن => رابط غير صالح
    if (!accessToken) {
      setMessage("لم يتم العثور على رمز التحقق في الرابط. يُرجى طلب رابط جديد. ❌");
      setExpiredOrInvalid(true);
      setTokenValid(false);
      return;
    }

    // إذا النوع ليس recovery يمكن رفض الطلب
    if (type && type !== "recovery") {
      setMessage("هذا الرابط غير خاص بإعادة تعيين كلمة المرور ❌");
      setExpiredOrInvalid(true);
      setTokenValid(false);
      return;
    }

    // حاول إعداد الجلسة (يمكن تمرير refresh_token إن وُجد)
    const setupSession = async () => {
      try {
        // بعض إصدارات supabase تتطلب كل من access & refresh؛ إن لم يتوفر refresh، نعطي فقط access_token
        const sessionPayload = refreshToken
          ? { access_token: accessToken, refresh_token: refreshToken }
          : { access_token: accessToken };

        const { error } = await supabase.auth.setSession(sessionPayload);
        if (error) {
          console.error("setSession error:", error);
          setMessage("تعذّر إنشاء الجلسة. الرابط قد يكون منتهي الصلاحية ❌");
          setExpiredOrInvalid(true);
          setTokenValid(false);
        } else {
          setMessage("");
          setTokenValid(true);
          setExpiredOrInvalid(false);
        }
      } catch (err) {
        console.error("setSession exception:", err);
        setMessage("حدث خطأ أثناء معالجة الرابط ❌");
        setExpiredOrInvalid(true);
        setTokenValid(false);
      }
    };

    setupSession();
  }, []);

  // تحديث كلمة المرور
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
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setMessage(`خطأ في تحديث كلمة المرور: ${error.message} ❌`);
      } else {
        setMessage("تم تحديث كلمة المرور بنجاح ✅");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      console.error(err);
      setMessage("حدث خطأ أثناء تحديث كلمة المرور ❌");
    } finally {
      setLoading(false);
    }
  };

  // إعادة إرسال رابط إعادة التعيين
  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail || !resendEmail.includes("@")) {
      setMessage("أدخل بريدًا إلكترونيًا صحيحًا لإرسال الرابط.");
      return;
    }
    setResendLoading(true);
    setMessage("");
    try {
      // دعم للإصدارات المختلفة من مكتبة supabase
      let data, error;
      if (typeof supabase.auth.resetPasswordForEmail === "function") {
        ({ data, error } = await supabase.auth.resetPasswordForEmail(resendEmail, {
          redirectTo: `${window.location.origin}/#/reset-password`,
        }));
      } else if (supabase.auth.api && typeof supabase.auth.api.resetPasswordForEmail === "function") {
        ({ data, error } = await supabase.auth.api.resetPasswordForEmail(resendEmail, {
          redirectTo: `${window.location.origin}/#/reset-password`,
        }));
      } else {
        throw new Error("نسخة Supabase لا تدعم resetPasswordForEmail هنا");
      }

      if (error) {
        console.error("resetPasswordForEmail error:", error);
        setMessage(`تعذّر إرسال الرابط: ${error.message} ❌`);
      } else {
        setMessage("تم إرسال رابط جديد إلى بريدك الإلكتروني ✅ (تحقق من صندوق الوارد والمزعج)");
        setExpiredOrInvalid(false);
        setTokenValid(false);
      }
    } catch (err) {
      console.error(err);
      setMessage("حدث خطأ أثناء محاولة إرسال الرابط. حاول مرة أخرى لاحقًا ❌");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AnimatedBackground className="min-h-screen flex items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#665446] mb-2">إعادة تعيين كلمة المرور</h2>
          <p className="text-gray-600 text-sm">
            {tokenValid ? "أدخل كلمة المرور الجديدة لتحديث حسابك" : expiredOrInvalid ? "الرابط غير صالح أو منتهي الصلاحية" : "جارٍ التحقق من الرابط..."}
          </p>
        </div>

        {message && (
          <div className={`text-center text-sm mb-4 p-4 rounded-lg ${
            message.includes("تم تحديث") || message.includes("تم إرسال")
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
                  className="w-full p-3 pr-10 border border-[#CDC0B6]/30 rounded-lg bg-white/80"
                  required minLength="6" disabled={loading}
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
                  className="w-full p-3 pr-10 border border-[#CDC0B6]/30 rounded-lg bg-white/80"
                  required disabled={loading}
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !newPassword.trim() || newPassword !== confirmPassword}
              className="w-full py-3 bg-[#665446] text-white rounded-lg shadow-lg"
            >
              {loading ? "جاري التحديث..." : "تحديث كلمة المرور"}
            </button>

            <div className="text-center">
              <button type="button" onClick={() => navigate("/login")} className="text-[#665446] underline text-sm">العودة لتسجيل الدخول</button>
            </div>
          </form>
        )}

        {!tokenValid && (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">إذا انتهت صلاحية الرابط يمكنك طلب رابط جديد هنا:</p>

            <form onSubmit={handleResend} className="space-y-4">
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="أدخل بريدك الإلكتروني"
                className="w-full p-3 border rounded-lg"
                required
                disabled={resendLoading}
              />
              <button
                type="submit"
                disabled={resendLoading}
                className="w-full py-3 bg-[#665446] text-white rounded-lg shadow-lg"
              >
                {resendLoading ? "جاري الإرسال..." : "أرسل رابط إعادة التعيين"}
              </button>
            </form>

            <div className="text-center">
              <button type="button" onClick={() => navigate("/login")} className="text-[#665446] underline text-sm">العودة لتسجيل الدخول</button>
            </div>
          </div>
        )}
      </div>
    </AnimatedBackground>
  );
}
