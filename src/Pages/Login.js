import React, { useState } from 'react';
import { supabase } from '../Utilities/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const { email, password } = formData;

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError('❌ البريد أو كلمة المرور غير صحيحة');
      return;
    }

    // التحقق من حالة تأكيد الحساب بعد تسجيل الدخول
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (!userData?.user?.email_confirmed_at) {
      await supabase.auth.signOut(); // نسجل خروج فوري
      setError('📩 من فضلك قم بتأكيد بريدك الإلكتروني أولاً قبل تسجيل الدخول.');
      return;
    }

    alert('✅ تم تسجيل الدخول بنجاح');
    navigate('/');
  };

  // إعادة تعيين كلمة المرور
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setResetMessage('✅ تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني!');
      setResetEmail('');
      
      setTimeout(() => {
        setShowResetForm(false);
        setResetMessage('');
      }, 3000);
    } catch (error) {
      setResetMessage(`❌ خطأ: ${error.message}`);
    }
  };

  return (
    <div className="bg-[#CDC0B6] min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleLogin}
        className="bg-[#FFF9EF] p-8 rounded-xl shadow-md max-w-md w-full"
      >
        <h2 className="text-2xl font-bold text-[#665446] mb-6 text-center">تسجيل الدخول</h2>

        <input
          type="email"
          name="email"
          placeholder="البريد الإلكتروني"
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded border"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="كلمة المرور"
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded border"
          required
        />

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <button
          type="submit"
          className="w-full py-3 bg-[#665446] text-white rounded-xl hover:opacity-90 mb-4"
        >
          تسجيل الدخول
        </button>

        {/* رابط نسيت كلمة المرور */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowResetForm(true)}
            className="text-orange-600 underline text-sm hover:text-orange-800"
          >
            نسيت كلمة المرور؟
          </button>
        </div>
      </form>

      {/* نافذة إعادة تعيين كلمة المرور */}
      {showResetForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-[#FFF9EF] p-6 rounded-xl shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#665446]">إعادة تعيين كلمة المرور</h3>
              <button
                onClick={() => setShowResetForm(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleResetPassword}>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="أدخل بريدك الإلكتروني"
                className="w-full p-3 mb-4 border rounded"
                required
              />
              
              <button
                type="submit"
                className="w-full py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700"
              >
                إرسال رابط إعادة التعيين
              </button>
            </form>
            
            {resetMessage && (
              <p className={`mt-4 text-center ${resetMessage.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                {resetMessage}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;