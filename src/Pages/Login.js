import React, { useState } from 'react';
import { supabase } from '../Utilities/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

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
          className="w-full py-3 bg-[#665446] text-white rounded-xl hover:opacity-90"
        >
          تسجيل الدخول
        </button>
      </form>
    </div>
  );
};

export default Login;
