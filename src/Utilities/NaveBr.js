import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../Utilities/supabaseClient";
import { ChevronDown, User, LogOut, BookOpen, Target, FileText, Settings, BarChart3, Home, Menu, X ,MessageSquare } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('');
  const [userName, setUserName] = useState('');
  
  const navigate = useNavigate();
  const mainMenuRef = useRef(null);
  const adminMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  const toggleNavbar = () => setIsOpen(!isOpen);

  // Close dropdowns when clicking outside
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

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const checkAuth = async () => {
    const { data, error } = await supabase.auth.getUser();
    setIsLoggedIn(!!data?.user);

    if (data?.user) {
      console.log("User ID:", data.user.id);
      const { data: userData, error: userError } = await supabase
        .from('students')
        .select('role, first_name')
        .eq('auth_id', data.user.id)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError.message || userError);
        setUserName(data.user.email || 'مرحبا بك');
        setRole('');
      } else {
        setRole(userData?.role || '');
        setUserName(userData?.first_name || '');
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
    setIsUserMenuOpen(false);
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

  const mainMenuItems = [
    { to: '/', label: 'الصفحة الرئيسية', icon: Home },
    { to: '/courses', label: 'المحاضرات', icon: BookOpen },
    { to: '/goals', label: 'أهداف المدرسة', icon: Target },
    { to: '/articlesManagement', label: 'المقالات و التكليف', icon: FileText },
    { to: '/community', label: 'المجتمع ', icon: MessageSquare },
  ];

  const adminMenuItems = [
    { to: '/admin-dashboard', label: 'لوحة تحكم الأدمن', icon: Settings },
    { to: '/statistics', label: 'الإحصائيات', icon: BarChart3 },
  ];

  return (
    <div className="bg-[#FFF9EF] shadow-md rounded-md w-full" dir="rtl">
      <div className="max-w-screen-xl mx-auto px-4 py-6 flex items-center justify-between">
        
        {/* Logo */}
        <h1 className="text-[#665446] text-3xl md:text-4xl font-bold font-[Almarai]">
          واحة العلم
        </h1>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          
          {/* Main Menu Dropdown */}
          <div className="relative" ref={mainMenuRef}>
            <button
              onClick={() => setIsMainMenuOpen(!isMainMenuOpen)}
              className="flex items-center gap-2 text-[#665446] hover:text-[#8B7355] font-[Inter] font-bold text-xl transition-colors duration-200"
            >
              القوائم الرئيسية
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMainMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isMainMenuOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {mainMenuItems.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={index}
                      to={item.to}
                      className="flex items-center gap-3 px-4 py-3 text-[#665446] hover:bg-[#FFF9EF] hover:text-[#8B7355] transition-colors duration-200 font-[Inter] font-bold"
                      onClick={() => setIsMainMenuOpen(false)}
                    >
                      <IconComponent className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Admin Menu Dropdown */}
          {isLoggedIn && role === 'admin' && (
            <div className="relative" ref={adminMenuRef}>
              <button
                onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                className="flex items-center gap-2 text-[#665446] hover:text-[#8B7355] font-[Inter] font-bold text-xl transition-colors duration-200"
              >
                إدارة النظام
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isAdminMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isAdminMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {adminMenuItems.map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <Link
                        key={index}
                        to={item.to}
                        className="flex items-center gap-3 px-4 py-3 text-[#665446] hover:bg-[#FFF9EF] hover:text-[#8B7355] transition-colors duration-200 font-[Inter] font-bold"
                        onClick={() => setIsAdminMenuOpen(false)}
                      >
                        <IconComponent className="w-5 h-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* User Menu */}
          {isLoggedIn ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 text-[#665446] hover:text-[#8B7355] font-[Almarai] font-bold text-xl transition-colors duration-200"
              >
                <User className="w-5 h-5" />
                مرحباً، {userName}
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute left-0 mt-3 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm text-gray-600 font-[Almarai]">مسجل دخول كـ</p>
                    <p className="text-[#665446] font-bold font-[Almarai]">{userName}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200 font-[Almarai] font-bold text-right"
                  >
                    <LogOut className="w-4 h-4" />
                    تسجيل الخروج
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="text-xl font-bold text-[#665446] hover:text-[#8B7355] transition-colors duration-200 font-[Inter]"
              >
                تسجيل الدخول
              </Link>
              <Link 
                to="/signup" 
                className="bg-[#665446] text-white px-6 py-2 rounded-lg hover:bg-[#8B7355] transition-colors duration-200 font-[Inter] font-bold"
              >
                إنشاء حساب
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleNavbar}
          className="md:hidden text-[#665446] focus:outline-none p-2"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-4">
            
            {/* Mobile Main Menu */}
            <div className="space-y-2">
              <h3 className="font-bold text-[#665446] font-[Almarai] text-lg border-b border-gray-200 pb-2">
                القوائم الرئيسية
              </h3>
              {mainMenuItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={index}
                    to={item.to}
                    className="flex items-center gap-3 px-4 py-3 text-[#665446] hover:bg-[#FFF9EF] rounded-lg transition-colors duration-200 font-[Inter] font-bold"
                    onClick={() => setIsOpen(false)}
                  >
                    <IconComponent className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Admin Menu */}
            {isLoggedIn && role === 'admin' && (
              <div className="space-y-2">
                <h3 className="font-bold text-[#665446] font-[Almarai] text-lg border-b border-gray-200 pb-2">
                  إدارة النظام
                </h3>
                {adminMenuItems.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={index}
                      to={item.to}
                      className="flex items-center gap-3 px-4 py-3 text-[#665446] hover:bg-[#FFF9EF] rounded-lg transition-colors duration-200 font-[Inter] font-bold"
                      onClick={() => setIsOpen(false)}
                    >
                      <IconComponent className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Mobile User Section */}
            <div className="space-y-2 border-t border-gray-200 pt-4">
              {isLoggedIn ? (
                <>
                  <div className="px-4 py-2">
                    <p className="text-sm text-gray-600 font-[Almarai]">مسجل دخول كـ</p>
                    <p className="text-[#665446] font-bold font-[Almarai] text-lg">{userName}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 font-[Almarai] font-bold"
                  >
                    <LogOut className="w-4 h-4" />
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    className="block px-4 py-3 text-[#665446] hover:bg-[#FFF9EF] rounded-lg transition-colors duration-200 font-[Inter] font-bold text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    تسجيل الدخول
                  </Link>
                  <Link
                    to="/signup"
                    className="block bg-[#665446] text-white px-4 py-3 rounded-lg hover:bg-[#8B7355] transition-colors duration-200 font-[Inter] font-bold text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    إنشاء حساب
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;