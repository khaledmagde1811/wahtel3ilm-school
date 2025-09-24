import bcrypt from "bcryptjs";
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
  const [userInfo, setUserInfo] = useState(null);

  const navigate = useNavigate();

  const handleEmailCheck = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("email", email)
        .single();

      if (error || !data) {
        setMessage("البريد غير مسجل ❌");
      } else {
        setUserInfo(data);
        setMessage("تم التحقق من البريد بنجاح ✅");
        setStep("password");
      }
    } catch (err) {
      setMessage("حدث خطأ أثناء التحقق");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (newPassword !== confirmPassword) {
        setMessage("كلمة المرور غير متطابقة ❌");
        setLoading(false);
        return;
      }

      const hashedPassword = bcrypt.hashSync(newPassword, 10);

      const { data, error } = await supabase
      .from("students")
      .update({ password_hash: hashedPassword })
      .eq("email", email);
    

      if (error) {
        setMessage("حدث خطأ أثناء تحديث كلمة المرور ❌");
      } else {
        setMessage("تم تحديث كلمة المرور بنجاح ✅");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setMessage("حدث خطأ أثناء تحديث كلمة المرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedBackground className="min-h-screen flex items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
        {/* مؤشر الخطوات */}
        <div className="flex justify-center mt-2">
          <div className="flex space-x-2">
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${step === "email" ? "bg-[#665446]" : "bg-green-500"}`}></div>
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${step === "password" ? "bg-[#665446]" : "bg-gray-300"}`}></div>
          </div>
        </div>

        {/* رسائل التنبيه */}
        {message && (
          <div className={`text-center text-sm my-4 p-4 rounded-lg ${
            message.includes("تم التحقق") || message.includes("تم تحديث")
              ? "bg-green-100 text-green-700 border border-green-200"
              : message.includes("غير مسجل") || message.includes("حدث خطأ") || message.includes("غير متطابقة")
              ? "bg-red-100 text-red-700 border border-red-200"
              : "bg-blue-100 text-blue-700 border border-blue-200"
          }`}>
            {message}
          </div>
        )}

        {/* محتوى الخطوات */}
        {step === "email" ? (
          <form onSubmit={handleEmailCheck} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#665446] mb-2">البريد الإلكتروني</label>
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

            <button type="submit" disabled={loading || !email.trim()} className="w-full py-3 bg-[#665446] text-white rounded-lg hover:bg-[#5A4633] hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  جاري التحقق...
                </>
              ) : (
                <>
                  التحقق من البريد
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            <div className="text-center">
              <button type="button" onClick={() => navigate("/login")} className="text-[#665446] underline text-sm hover:no-underline transition-colors duration-200">العودة لتسجيل الدخول</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordUpdate} className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800"><strong>المستخدم:</strong> {userInfo?.name || userInfo?.email}</p>
              <p className="text-xs text-green-600 mt-1"><strong>البريد:</strong> {userInfo?.email}</p>
            </div>

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

            <button type="submit" disabled={loading || !newPassword.trim() || newPassword !== confirmPassword} className="w-full py-3 bg-[#665446] text-white rounded-lg hover:bg-[#5A4633] hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2">
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
              <button type="button" onClick={() => navigate("/login")} className="text-[#665446] underline text-sm hover:no-underline transition-colors duration-200">العودة لتسجيل الدخول</button>
            </div>
          </form>
        )}
      </div>
    </AnimatedBackground>
  );
}
