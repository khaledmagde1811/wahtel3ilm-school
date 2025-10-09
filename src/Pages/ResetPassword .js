import { supabase } from "../Utilities/supabaseClient";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedBackground from "../Utilities/AnimatedBackground";
import { Lock } from "lucide-react";

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

  // أداة صغيرة لاستخراج بارامات من أي سترينج
  const parseParams = (str) => {
    try {
      const params = new URLSearchParams(str || "");
      const obj = {};
      for (const [k, v] of params.entries()) obj[k] = v;
      return obj;
    } catch {
      return {};
    }
  };

  // نعمل parsing ذكي للهاش + الكويري
  const parsedTokens = useMemo(() => {
    // مثال محتمل: "#/reset-password#access_token=...&refresh_token=...&type=recovery"
    const rawHash = window.location.hash || ""; // يبدأ بـ '#'
    const hashNoHash = rawHash.startsWith("#") ? rawHash.slice(1) : rawHash; // يشيل أول '#'

    // لو فيه هاشين: ناخد كل ما بعد أول '#'
    const parts = hashNoHash.split("#");
    const afterRoute = parts.length > 1 ? parts.slice(1).join("#") : parts[0];

    const hashParams = parseParams(afterRoute);
    const queryParams = parseParams(window.location.search);

    const access_token = hashParams.access_token || queryParams.access_token || "";
    const refresh_token = hashParams.refresh_token || queryParams.refresh_token || "";
    const type = hashParams.type || queryParams.type || "";
    const err = hashParams.error || queryParams.error || "";

    return { access_token, refresh_token, type, err };
  }, []);

  useEffect(() => {
    const setupSession = async () => {
      // أي خطأ صريح من Supabase في الرابط
      if (parsedTokens.err) {
        setMessage("رابط إعادة التعيين غير صالح أو منتهي الصلاحية ❌");
        setExpiredOrInvalid(true);
        setTokenValid(false);
        return;
      }

      // لازم يكون type=recovery و access_token موجودين
      if (!parsedTokens.access_token || (parsedTokens.type && parsedTokens.type !== "recovery")) {
        setMessage("لم يتم العثور على رمز صالح لإعادة التعيين. يُرجى طلب رابط جديد ❌");
        setExpiredOrInvalid(true);
        setTokenValid(false);
        return;
      }

      try {
        // setSession يفضّل وجود الاثنين (access & refresh) في v2
        const sessionPayload = parsedTokens.refresh_token
          ? { access_token: parsedTokens.access_token, refresh_token: parsedTokens.refresh_token }
          : { access_token: parsedTokens.access_token };

        const { error } = await supabase.auth.setSession(sessionPayload);
        if (error) {
          console.error("setSession error:", error);
          setMessage("تعذّر إنشاء الجلسة. قد تكون صلاحية الرابط انتهت ❌");
          setExpiredOrInvalid(true);
          setTokenValid(false);
        } else {
          setTokenValid(true);
          setExpiredOrInvalid(false);
          setMessage("");
          // نظّف الـ URL من التوكنات (اختياري لكنه أنظف)
          try {
            const cleanUrl = `${window.location.origin}${window.location.pathname}#/reset-password`;
            window.history.replaceState({}, "", cleanUrl);
          } catch {}
        }
      } catch (e) {
        console.error("setSession exception:", e);
        setMessage("حدث خطأ أثناء معالجة الرابط ❌");
        setExpiredOrInvalid(true);
        setTokenValid(false);
      }
    };

    setupSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // تحققات بسيطة
    if (newPassword !== confirmPassword) {
      setMessage("كلمتا المرور غير متطابقتين ❌");
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
        setMessage("تم تحديث كلمة المرور بنجاح ✅ سيتم تحويلك لتسجيل الدخول...");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      console.error(err);
      setMessage("حدث خطأ أثناء تحديث كلمة المرور ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail || !resendEmail.includes("@")) {
      setMessage("أدخل بريدًا إلكترونيًا صحيحًا لإرسال الرابط.");
      return;
    }
    setResendLoading(true);
    setMessage("");

    try {
      // v2
      if (typeof supabase.auth.resetPasswordForEmail === "function") {
        const { error } = await supabase.auth.resetPasswordForEmail(resendEmail, {
          redirectTo: `${window.location.origin}/#/reset-password`,
        });
        if (error) throw error;
      }
      // v1 fallback
      else if (supabase.auth.api?.resetPasswordForEmail) {
        const { error } = await supabase.auth.api.resetPasswordForEmail(resendEmail, {
          redirectTo: `${window.location.origin}/#/reset-password`,
        });
        if (error) throw error;
      } else {
        throw new Error("نسخة Supabase لا تدعم resetPasswordForEmail في هذا العميل");
      }

      setMessage("تم إرسال رابط جديد إلى بريدك الإلكتروني ✅ (افحص الوارد والمزعج)");
      setExpiredOrInvalid(false);
      setTokenValid(false);
    } catch (err) {
      console.error("resetPasswordForEmail:", err);
      setMessage(`تعذّر إرسال الرابط: ${err.message || "خطأ غير متوقع"} ❌`);
    } finally {
      setResendLoading(false);
    }
  };

  const canSubmit = tokenValid && !loading && newPassword.trim() && newPassword === confirmPassword;

  return (
    <AnimatedBackground className="min-h-screen flex items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#665446] mb-2">إعادة تعيين كلمة المرور</h2>
          <p className="text-gray-600 text-sm">
            {tokenValid
              ? "أدخل كلمة المرور الجديدة لتحديث حسابك"
              : expiredOrInvalid
              ? "الرابط غير صالح أو منتهي الصلاحية"
              : "جارٍ التحقق من الرابط..."}
          </p>
        </div>

        {message && (
          <div
            className={`text-center text-sm mb-4 p-4 rounded-lg ${
              /تم تحديث|تم إرسال|✅/i.test(message)
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        {tokenValid ? (
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
                  required
                  minLength={6}
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
                  className="w-full p-3 pr-10 border border-[#CDC0B6]/30 rounded-lg bg-white/80"
                  required
                  disabled={loading}
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full py-3 rounded-lg shadow-lg text-white ${
                canSubmit ? "bg-[#665446] hover:opacity-95" : "bg-[#665446]/60 cursor-not-allowed"
              }`}
            >
              {loading ? "جاري التحديث..." : "تحديث كلمة المرور"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-[#665446] underline text-sm"
              >
                العودة لتسجيل الدخول
              </button>
            </div>
          </form>
        ) : (
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
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-[#665446] underline text-sm"
              >
                العودة لتسجيل الدخول
              </button>
            </div>
          </div>
        )}
      </div>
    </AnimatedBackground>
  );
}
