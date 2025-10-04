// src/Components/Navbar.js
import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate,useLocation } from "react-router-dom";
import { supabase } from "../Utilities/supabaseClient";
import {
  ChevronDown,
  User,
  LogOut,
  BookOpen,
  Target,
  FileText,
  Settings,
  BarChart3,
  Home,
  Menu,
  X,
  MessageSquare,
  Book,
  Search,
  Bell,BookOpenCheck
} from "lucide-react";
import SearchInput from "../Commpoanants/SearchInput";
import { useNotifications } from "../contexts/NotificationContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const [userName, setUserName] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // notifications from context (تأكد إن الـ App ملفوف بـ NotificationProvider)
 const { 
  notifications = { newArticles: 0, newPosts: 0, newExams: 0 }, 
   markArticlesAsVisited, 
   markCommunityAsVisited,
  markExamsAsVisited
} = useNotifications();
  const navigate = useNavigate();
  const mainMenuRef = useRef(null);
  const adminMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  const toggleNavbar = () => setIsOpen(!isOpen);

  useEffect(() => {
    function handleClickOutside(event) {
      if (mainMenuRef.current && !mainMenuRef.current.contains(event.target)) {
        setIsMainMenuOpen(false);
      }
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target)) {
        setIsAdminMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
useEffect(() => {
  const p = location.pathname || '';
  if (p.startsWith('/articles')) {
    markArticlesAsVisited();
  } else if (p.startsWith('/community')) {
    markCommunityAsVisited();
  } else if (p.startsWith('/monthlyExams') || p.startsWith('/exams')) {
    // غطي المسارين لو اسم الروت عندك مختلف
    markExamsAsVisited();
  }
}, [location.pathname, markArticlesAsVisited, markCommunityAsVisited, markExamsAsVisited]);

  // auth check (كما عندك)
  const checkAuth = async () => {
    const { data, error } = await supabase.auth.getUser();
    setIsLoggedIn(!!data?.user);

    if (data?.user) {
      const { data: userData, error: userError } = await supabase
        .from("students")
        .select("role, first_name")
        .eq("auth_id", data.user.id)
        .single();

      if (userError) {
        setUserName(data.user.email || "مرحبا بك");
        setRole("");
      } else {
        setRole(userData?.role || "");
        setUserName(userData?.first_name || "");
      }
    } else {
      setRole("");
      setUserName("");
    }
  };

  useEffect(() => {
    checkAuth();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });
    return () => {
      try {
        authListener.subscription.unsubscribe();
      } catch (e) {}
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setRole("");
    setUserName("");
    setIsUserMenuOpen(false);
    navigate("/login");
  };

  // هنا نضيف notifType علشان نعرض الأعداد
  const mainMenuItems = [
    { to: "/", label: "الصفحة الرئيسية", icon: Home },
    { to: "/courses", label: "المحاضرات", icon: BookOpen },
    { to: "/goals", label: "أهداف المدرسة", icon: Target },
    { to: "/articlesManagement", label: "المقالات و التكليف", icon: FileText, notifType: "newArticles" },
    { to: "/community", label: "المجتمع", icon: MessageSquare, notifType: "newPosts" },
{ to: "/monthlyExams", label: "اختبارات الشهر", icon: BookOpenCheck, notifType: "newExams" }   ];

  const adminMenuItems = [
    { to: "/admin-dashboard", label: "لوحة تحكم الأدمن", icon: Settings },
    { to: "/statistics", label: "الإحصائيات", icon: BarChart3 }
  ];

  return (
    <nav
      className={`relative top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md ${
        scrolled ? "bg-white/80 shadow-md" : "bg-gradient-to-r from-[#FFF9EF]/90 to-[#F5EBE0]/90"
      }`}
      dir="rtl"
    >
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center shadow-inner relative">
            <Book className="text-white" />
            <span className="absolute w-2 h-2 rounded-full bg-green-500 top-0 right-0 animate-pulse"></span>
          </div>
          <h1 className="text-[#5A4633] text-2xl md:text-3xl font-extrabold font-[Almarai] tracking-wide hover:scale-105 transition-transform">
            واحة العلم
          </h1>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <div className="relative" ref={mainMenuRef}>
            <button
              onClick={() => setIsMainMenuOpen(!isMainMenuOpen)}
              className="flex items-center gap-2 text-[#5A4633] hover:text-[#7B5E3E] font-[Inter] font-semibold text-lg transition-colors"
            >
              القوائم
              <ChevronDown className={`w-4 h-4 transition-transform ${isMainMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {isMainMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-fadeIn">
                {mainMenuItems.map((item, index) => {
                  const Icon = item.icon;
                  const notifCount = item.notifType ? (notifications?.[item.notifType] ?? 0) : 0;

                  return (
                    <Link
                      key={index}
                      to={item.to}
                      className="flex items-center justify-between gap-2 px-4 py-2 text-[#5A4633] hover:bg-gradient-to-r hover:from-[#fdf6ec] hover:to-[#f9ede1] rounded-md transition duration-200"
                      onClick={() => {
                        setIsMainMenuOpen(false);
                        // عند الضغط نصفر العداد في الcontext للصفحات المعينة
                        if (item.notifType === "newArticles") markArticlesAsVisited();
                        if (item.notifType === "newPosts") markCommunityAsVisited();
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" /> {item.label}
                      </div>

                      {notifCount > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                          {notifCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {isLoggedIn && role === "admin" && (
            <div className="relative" ref={adminMenuRef}>
              <button
                onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                className="flex items-center gap-2 text-[#5A4633] hover:text-[#7B5E3E] font-[Inter] font-semibold text-lg transition-colors"
              >
                إدارة النظام
                <ChevronDown className={`w-4 h-4 transition-transform ${isAdminMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {isAdminMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-fadeIn">
                  {adminMenuItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={index}
                        to={item.to}
                        className="flex items-center gap-2 px-4 py-2 text-[#5A4633] hover:bg-gradient-to-r hover:from-[#fdf6ec] hover:to-[#f9ede1] rounded-md transition duration-200"
                        onClick={() => setIsAdminMenuOpen(false)}
                      >
                        <Icon className="w-4 h-4" /> {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <SearchInput />
          </div>

          {/* user */}
          {isLoggedIn ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 text-[#5A4633] hover:text-[#7B5E3E] font-[Almarai] font-bold text-lg transition-colors"
              >
                <User className="w-5 h-5" />
                {userName}
                <ChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-500 font-[Almarai]">مسجل كـ</p>
                    <p className="text-[#5A4633] font-bold font-[Almarai]">{userName}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition duration-200 font-[Almarai] font-bold text-right"
                  >
                    <LogOut className="w-4 h-4" />
                    تسجيل الخروج
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-4 py-1 rounded-full text-sm font-semibold text-[#5A4633] border border-[#5A4633]/30 hover:bg-[#fdf6ec] transition">
                تسجيل الدخول
              </Link>
              <Link to="/signup" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full hover:opacity-90 transition font-bold">
                إنشاء حساب
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Button */}
        <button onClick={toggleNavbar} className="md:hidden text-[#5A4633] focus:outline-none p-2 bg-[#FFF3E0]/70 rounded-lg hover:shadow-md transition">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="mb-3 px-4">
          <div className="mb-2">
            <SearchInput />
          </div>

          {/* عرض اسم المستخدم في الموبايل */}
          {isLoggedIn && (
            <div className="mb-3 px-4 py-3 bg-gradient-to-r from-[#FFF9EF] to-[#F5EBE0] rounded-lg border border-[#5A4633]/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-[Almarai]">مرحباً</p>
                  <p className="text-[#5A4633] font-bold font-[Almarai] text-sm">{userName}</p>
                </div>
              </div>
            </div>
          )}

          <ul className="space-y-2">
            {mainMenuItems.map((item, index) => {
              const Icon = item.icon;
              const notifCount = item.notifType ? (notifications?.[item.notifType] ?? 0) : 0;

              return (
                <li key={index}>
                  <Link
                    to={item.to}
                    className="flex items-center justify-between gap-3 px-4 py-2 text-[#5A4633] hover:bg-gradient-to-r hover:from-[#fdf6ec] hover:to-[#f9ede1] rounded-md transition"
                    onClick={() => {
                      toggleNavbar();
                      if (item.notifType === "newArticles") markArticlesAsVisited();
                      if (item.notifType === "newPosts") markCommunityAsVisited();
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" /> {item.label}
                    </div>

                    {notifCount > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                        {notifCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}

            {isLoggedIn && role === "admin" && adminMenuItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.to}
                  className="flex items-center gap-3 px-4 py-2 text-[#5A4633] hover:bg-gradient-to-r hover:from-[#fdf6ec] hover:to-[#f9ede1] rounded-md transition"
                  onClick={toggleNavbar}
                >
                  <item.icon className="w-5 h-5" /> {item.label}
                </Link>
              </li>
            ))}

            {isLoggedIn ? (
              <li>
                <button onClick={handleLogout} className="flex items-center gap-3 w-full text-right px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition">
                  <LogOut className="w-5 h-5" /> تسجيل الخروج
                </button>
              </li>
            ) : (
              <>
                <li>
                  <Link to="/login" onClick={toggleNavbar} className="block px-4 py-2 text-[#5A4633] hover:bg-gradient-to-r hover:from-[#fdf6ec] hover:to-[#f9ede1] rounded-md transition">تسجيل الدخول</Link>
                </li>
                <li>
                  <Link to="/signup" onClick={toggleNavbar} className="block px-4 py-2 text-[#5A4633] hover:bg-gradient-to-r hover:from-[#fdf6ec] hover:to-[#f9ede1] rounded-md transition">إنشاء حساب</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;