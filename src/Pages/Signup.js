import React, { useState } from 'react';
import { supabase } from '../Utilities/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from "lucide-react"; // أيقونات جاهزة

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    date_of_birth: '',
    phone_number: '',
    role: 'student',  // القيمة الافتراضية "طالب"
    teacherPassword: '',  // لإدخال كلمة المرور الثابتة للمعلم
  });
  const [error, setError] = useState('');

  // ✅ دالة للتحقق من صيغة البريد الإلكتروني
  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const { email, password, first_name, last_name, date_of_birth, phone_number, role, teacherPassword } = formData;

    // ✅ تحقق من صحة البريد الإلكتروني قبل الإرسال
    if (!isValidEmail(email)) {
      setError("⚠️ البريد الإلكتروني غير صالح، تأكد من كتابته بشكل صحيح.");
      return;
    }

    let finalRole = role;
    let finalPassword = password;

    // إذا كان المستخدم معلمًا، تأكد من أن كلمة المرور هي "KsS3%34z%" لتعيينه كأدمن
    if (role === 'teacher' && teacherPassword === 'KsS3%34z%') {
      finalPassword = 'KsS3%34z%';  // تأكيد كلمة المرور الثابتة
      finalRole = 'admin';  // تعيين الدور كأدمن
    } else if (role === 'teacher' && teacherPassword !== 'KsS3%34z%') {
      setError('⚠️ كلمة المرور غير صحيحة، تأكد من أنك معلم.');
      return;
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: finalPassword,
    });

    if (signUpError || !signUpData?.user) {
      setError(signUpError?.message || 'فشل في إنشاء الحساب');
      return;
    }

    const auth_id = signUpData.user.id;

    console.log('✅ الحساب أنشئ على Supabase Auth:', auth_id);

    // إضافة بيانات المستخدم إلى جدول الطلاب أو المعلمين
    const { error: dbError } = await supabase
      .from(finalRole === 'admin' ? 'teachers' : 'students')
      .insert({
        email,
        first_name,
        last_name,
        password_hash: 'hidden',
        date_of_birth,
        phone_number,
        status: 'نشط',
        level_id: 1,
        auth_id,
      });

    if (dbError) {
      setError('⚠️ خطأ في حفظ بيانات ' + finalRole + ': ' + dbError.message);
      return;
    }

    alert('✅ تم إنشاء الحساب بنجاح، يُرجى تفعيل البريد الإلكتروني');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#CDC0B6] via-[#B8A99C] to-[#A69589]">
        {/* Animated geometric shapes */}
        <div className="absolute inset-0">
          {/* Large floating circles */}
          <div className="absolute w-72 h-72 bg-gradient-to-r from-[#FFF9EF]/25 to-[#E8D5C4]/25 rounded-full blur-3xl animate-pulse" style={{top: '-15%', left: '-15%', animationDuration: '5s'}}></div>
          <div className="absolute w-80 h-80 bg-gradient-to-l from-[#665446]/15 to-[#5A4633]/15 rounded-full blur-3xl animate-pulse" style={{bottom: '-25%', right: '-20%', animationDuration: '7s'}}></div>
          <div className="absolute w-56 h-56 bg-gradient-to-t from-[#FFF9EF]/20 to-[#CDC0B6]/20 rounded-full blur-2xl animate-pulse" style={{top: '25%', right: '15%', animationDuration: '6s'}}></div>
          <div className="absolute w-40 h-40 bg-gradient-to-b from-[#E8D5C4]/30 to-[#CDC0B6]/30 rounded-full blur-xl animate-pulse" style={{bottom: '15%', left: '20%', animationDuration: '4s'}}></div>
          
          {/* Floating particles with different sizes and speeds */}
          <div className="absolute w-4 h-4 bg-[#FFF9EF] rounded-full opacity-70 animate-bounce" style={{top: '12%', left: '8%', animationDelay: '0s', animationDuration: '3s'}}></div>
          <div className="absolute w-3 h-3 bg-[#665446] rounded-full opacity-50 animate-bounce" style={{top: '28%', right: '18%', animationDelay: '1s', animationDuration: '4s'}}></div>
          <div className="absolute w-5 h-5 bg-[#FFF9EF] rounded-full opacity-40 animate-bounce" style={{bottom: '35%', left: '12%', animationDelay: '2s', animationDuration: '3.5s'}}></div>
          <div className="absolute w-2 h-2 bg-[#5A4633] rounded-full opacity-80 animate-bounce" style={{top: '65%', left: '22%', animationDelay: '0.5s', animationDuration: '2.5s'}}></div>
          <div className="absolute w-3 h-3 bg-[#FFF9EF] rounded-full opacity-60 animate-bounce" style={{bottom: '18%', right: '28%', animationDelay: '1.5s', animationDuration: '4s'}}></div>
          <div className="absolute w-4 h-4 bg-[#665446] rounded-full opacity-45 animate-bounce" style={{top: '45%', right: '8%', animationDelay: '2.5s', animationDuration: '3s'}}></div>
          <div className="absolute w-2 h-2 bg-[#E8D5C4] rounded-full opacity-65 animate-bounce" style={{top: '75%', left: '35%', animationDelay: '3s', animationDuration: '2.8s'}}></div>
          <div className="absolute w-6 h-6 bg-[#FFF9EF] rounded-full opacity-35 animate-bounce" style={{bottom: '50%', right: '40%', animationDelay: '1.2s', animationDuration: '3.8s'}}></div>
          
          {/* Animated waves */}
          <div className="absolute bottom-0 left-0 w-full h-44 opacity-25">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z" fill="#FFF9EF">
                <animate attributeName="d" dur="9s" repeatCount="indefinite"
                  values="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z;
                          M0,80 C300,0 900,120 1200,80 L1200,120 L0,120 Z;
                          M0,40 C300,100 900,20 1200,40 L1200,120 L0,120 Z;
                          M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z"/>
              </path>
            </svg>
          </div>
          
          {/* Top wave */}
          <div className="absolute top-0 left-0 w-full h-36 opacity-20 transform rotate-180">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0,60 C300,120 900,0 1200,60 L1200,0 L0,0 Z" fill="#665446">
                <animate attributeName="d" dur="11s" repeatCount="indefinite"
                  values="M0,60 C300,120 900,0 1200,60 L1200,0 L0,0 Z;
                          M0,40 C300,0 900,80 1200,40 L1200,0 L0,0 Z;
                          M0,80 C300,140 900,20 1200,80 L1200,0 L0,0 Z;
                          M0,60 C300,120 900,0 1200,60 L1200,0 L0,0 Z"/>
              </path>
            </svg>
          </div>

          {/* Diagonal animated lines */}
          <div className="absolute w-1 h-32 bg-gradient-to-b from-transparent via-[#FFF9EF]/30 to-transparent animate-pulse" style={{top: '20%', left: '15%', transform: 'rotate(45deg)', animationDuration: '4s'}}></div>
          <div className="absolute w-1 h-24 bg-gradient-to-b from-transparent via-[#665446]/20 to-transparent animate-pulse" style={{bottom: '25%', right: '20%', transform: 'rotate(-45deg)', animationDuration: '5s', animationDelay: '2s'}}></div>
        </div>
      </div>

      {/* Signup Form */}
      <form
        onSubmit={handleSignup}
        className="bg-[#FFF9EF]/95 backdrop-blur-sm p-8 rounded-xl shadow-2xl max-w-md w-full relative z-10 border border-white/20 hover:shadow-3xl transition-all duration-500"
      >
        <h2 className="text-2xl font-bold text-[#665446] mb-6 text-center">إنشاء حساب جديد</h2>

        <input
          type="text"
          name="first_name"
          placeholder="الاسم الأول"
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded border border-[#CDC0B6]/30 bg-white/80 backdrop-blur-sm focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/20 transition-all duration-300"
          required
        />
        <input
          type="text"
          name="last_name"
          placeholder="الاسم الثاني"
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded border border-[#CDC0B6]/30 bg-white/80 backdrop-blur-sm focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/20 transition-all duration-300"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="البريد الإلكتروني"
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded border border-[#CDC0B6]/30 bg-white/80 backdrop-blur-sm focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/20 transition-all duration-300"
          required
        />

        {/* الباسورد مع العين */}
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="كلمة المرور"
            onChange={handleChange}
            className="w-full p-3 rounded border border-[#CDC0B6]/30 bg-white/80 backdrop-blur-sm pr-10 focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/20 transition-all duration-300"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#665446] transition-colors duration-200"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <input
          type="date"
          name="date_of_birth"
          placeholder="تاريخ الميلاد"
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded border border-[#CDC0B6]/30 bg-white/80 backdrop-blur-sm focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/20 transition-all duration-300"
          required
        />
        <input
          type="tel"
          name="phone_number"
          placeholder="رقم الهاتف"
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded border border-[#CDC0B6]/30 bg-white/80 backdrop-blur-sm focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/20 transition-all duration-300"
          required
        />

      

        {error && <p className="text-red-600 mb-4 p-2 bg-red-50 rounded border border-red-200">{error}</p>}

        <button
          type="submit"
          className="w-full py-3 bg-[#665446] text-white rounded-xl hover:bg-[#5A4633] hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          إنشاء حساب
        </button>

        {/* <div className="text-center mt-4">
          <p className="text-sm text-[#665446]">
            لديك حساب بالفعل؟{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-blue-600 underline hover:text-blue-800 transition-colors duration-200"
            >
              تسجيل الدخول
            </button>
          </p>
        </div> */}
      </form>
    </div>
  );
};

export default Signup;