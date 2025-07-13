import React, { useState } from 'react';
import { supabase } from '../Utilities/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const { email, password, first_name, last_name, date_of_birth, phone_number, role, teacherPassword } = formData;

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
      password: finalPassword,  // إذا كان معلمًا، نستخدم كلمة المرور الثابتة
    });

    if (signUpError || !signUpData?.user) {
      setError(signUpError?.message || 'فشل في إنشاء الحساب');
      return;
    }

    const auth_id = signUpData.user.id;

    console.log('✅ الحساب أنشئ على Supabase Auth:', auth_id);

    // إضافة بيانات المستخدم إلى جدول الطلاب أو المعلمين بناءً على نوع الحساب
    const { error: dbError } = await supabase.from(finalRole === 'admin' ? 'teachers' : 'students').insert({
      email,
      first_name,
      last_name,
      password_hash: 'hidden',  // يمكنك تخزين كلمة المرور المشفرة لاحقًا إذا لزم الأمر
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
    <div className="bg-[#CDC0B6] min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSignup}
        className="bg-[#FFF9EF] p-8 rounded-xl shadow-md max-w-md w-full"
      >
        <h2 className="text-2xl font-bold text-[#665446] mb-6 text-center">إنشاء حساب جديد</h2>

        <input
          type="text"
          name="first_name"
          placeholder="الاسم الأول"
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded border"
          required
        />
        <input
          type="text"
          name="last_name"
          placeholder="الاسم الثاني"
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded border"
          required
        />
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
        <input
          type="date"
          name="date_of_birth"
          placeholder="تاريخ الميلاد"
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded border"
          required
        />
        <input
          type="tel"
          name="phone_number"
          placeholder="رقم الهاتف"
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded border"
          required
        />

        {/* إضافة حقل لإدخال كلمة المرور الثابتة للمعلم */}
        {formData.role === 'teacher' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#665446]">كلمة مرور المعلم:</label>
            <input
              type="password"
              name="teacherPassword"
              value={formData.teacherPassword}
              onChange={handleChange}
              className="w-full p-3 rounded border mt-2"
              placeholder="أدخل كلمة مرور المعلم"
              required
            />
          </div>
        )}

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <button
          type="submit"
          className="w-full py-3 bg-[#665446] text-white rounded-xl hover:opacity-90"
        >
          إنشاء حساب
        </button>
      </form>
    </div>
  );
};

export default Signup;
