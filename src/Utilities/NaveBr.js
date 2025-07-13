import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../Utilities/supabaseClient"; // تأكد من استيراد supabase بشكل صحيح

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(''); // حفظ دور المستخدم (أدمن أو معلم)
  const navigate = useNavigate();

  const toggleNavbar = () => setIsOpen(!isOpen);

  const checkAuth = async () => {
    const { data, error } = await supabase.auth.getUser();
    setIsLoggedIn(!!data?.user); // true if user exists
  
    if (data?.user) {
      // تعديل هنا من teachers إلى students
      const { data: userData, error: userError } = await supabase
        .from('students')  // هنا نقوم بالتحقق في جدول الطلاب
        .select('role')
        .eq('auth_id', data.user.id) // تأكد من أن auth_id هو الذي يربط الطلاب بحساباتهم
        .single(); // استرجاع أول سجل فقط بناءً على auth_id
  
      if (userError) {
        console.error('Error fetching user role:', userError.message || userError);
      } else {
        console.log("Fetched User Data:", userData);  // إضافة هذا السطر للتأكد من البيانات
        setRole(userData?.role);  // تعيين الدور للمستخدم
      }
    }
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setRole('');
    navigate("/login");
  };

  useEffect(() => {
    checkAuth();
    supabase.auth.onAuthStateChange(() => {
      checkAuth(); // تحديث الحالة في حال تغيّر الدخول
    });
  }, []);

  return (
    <div className="bg-[#FFF9EF] shadow-md rounded-md w-full">
      <div className="max-w-screen-xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between">
        {/* Logo */}
        <h1 className="text-[#665446] text-3xl md:text-4xl font-bold font-[Almarai]">
          واحة العلم
        </h1>

        {/* زر القائمة للهاتف */}
        <button
          onClick={toggleNavbar}
          className="md:hidden text-3xl text-[#665446] focus:outline-none"
        >
          {isOpen ? "×" : "☰"}
        </button>

        {/* التنقل */}
        <nav
          className={`${
            isOpen ? "flex" : "hidden"
          } md:flex flex-col md:flex-row items-center gap-4 mt-4 md:mt-0 font-[Inter] font-bold text-[#665446]`}
        >
          <Link to="/" className="text-xl md:text-2xl">
            الصفحة الرئيسية
          </Link>
          <Link to="/courses" className="text-xl md:text-2xl">
            المحاضرات
          </Link>
          <Link to="/goals" className="text-xl md:text-2xl">
            أهداف المدرسة
          </Link>

          {/* فقط إذا كان المستخدم أدمن أو مسجل الدخول */}
          {isLoggedIn && role === 'admin' && (
            <>
              <Link to="/admin-dashboard" className="text-xl md:text-2xl">
                لوحة تحكم الأدمن
              </Link>
              
            </>
          )}

          {!isLoggedIn ? (
            <>
              <Link to="/login" className="text-xl md:text-2xl">
                تسجيل الدخول
              </Link>
              <Link to="/signup" className="text-xl md:text-2xl">
                إنشاء حساب
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="text-xl md:text-2xl text-[#665446] hover:underline font-[Almarai]"
            >
              تسجيل الخروج
            </button>
          )}
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
