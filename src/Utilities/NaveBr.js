import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../Utilities/supabaseClient";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('');
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  const toggleNavbar = () => setIsOpen(!isOpen);

  const checkAuth = async () => {
    const { data, error } = await supabase.auth.getUser();
    setIsLoggedIn(!!data?.user);

    if (data?.user) {
      console.log("User ID:", data.user.id); // تأكد من جلب الـ id
      const { data: userData, error: userError } = await supabase
        .from('students') // جدول الطلاب
        .select('role, first_name') // بدل name نجيب first_name
        .eq('auth_id', data.user.id)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError.message || userError);
        // لو فيه مشكلة في جلب الاسم من جدول الطلاب، نعرض الاسم من الـ auth نفسه
        setUserName(data.user.email || 'مرحبا بك');
        setRole(''); // ممكن تترك الدور فاضي
      } else {
        setRole(userData?.role || '');
        setUserName(userData?.first_name || ''); // استخدم first_name هنا
      }
    } else {
      setRole('');
      setUserName('');
    }
  };


  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setRole('');
    setUserName('');
    navigate("/login");
  };

  useEffect(() => {
    checkAuth();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
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
          className={`${isOpen ? "flex" : "hidden"
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
          <Link to="/articlesManagement" className="text-xl md:text-2xl">
            المقالات و التكليف
          </Link>




          {/* روابط الأدمن فقط */}
          {isLoggedIn && role === 'admin' && (
            <>
              <Link to="/admin-dashboard" className="text-xl md:text-2xl">
                لوحة تحكم الأدمن
              </Link>
              <Link to="/statistics" className="text-xl md:text-2xl">
                الإحصائيات
              </Link>
            </>
          )}
                    {/* عرض اسم المستخدم بدون لينك */}
                    {isLoggedIn && userName && (
            <span className="text-xl md:text-2xl font-[Almarai] ml-4">
              مرحباً، {userName}
            </span>
          )}

          {/* تسجيل الدخول / الخروج */}
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
