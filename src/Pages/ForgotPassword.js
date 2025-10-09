import { useState } from "react";
import { supabase } from "../Utilities/supabaseClient";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#/update-password`,
      });
      if (error) throw error;
      setMsg("✅ تم إرسال رابط إعادة التعيين إلى بريدك (افحص الوارد والمزعج).");
      setEmail("");
    } catch (err) {
      setMsg(`❌ خطأ: ${err.message || "حدث خطأ غير متوقع"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
        <h2 className="text-2xl font-bold text-[#665446] mb-4 text-center">نسيت كلمة المرور</h2>
        {msg && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${/✅/.test(msg) ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {msg}
          </div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            placeholder="أدخل بريدك الإلكتروني"
            className="w-full p-3 border rounded-lg"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#665446] text-white rounded-lg shadow-lg"
          >
            {loading ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
          </button>
        </form>
      </div>
    </div>
  );
}
