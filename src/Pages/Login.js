import React, { useState, useEffect } from 'react';
import { supabase } from '../Utilities/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();

  // فورم + حالات الواجهات
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [showResendForm, setShowResendForm] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [unconfirmedEmail, setUnconfirmedEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // المستخدم والبيانات المحمَّلة
  const [user, setUser] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [articles, setArticles] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    // تحقق عند تحميل الصفحة إن في جلسة حالية -> جلب المستخدم والداتا
    const init = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData?.session;
        if (session?.user) {
          setUser(session.user);
          await fetchProtectedData(); // جلب الداتا عند وجود جلسة
        }
      } catch (err) {
        console.error('init session err', err);
      }
    };

    init();

    // استمع لتغييرات المصادقة (SIGN IN / SIGN OUT) وحدّث الحالة تلقائياً
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, payload) => {
      if (event === 'SIGNED_IN') {
        setUser(payload.session?.user ?? null);
        fetchProtectedData();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        clearProtectedData();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const clearProtectedData = () => {
    setLessons([]);
    setCourses([]);
    setArticles([]);
    setIsLoadingData(false);
  };

  const fetchProtectedData = async () => {
    setIsLoadingData(true);
    try {
      // جلب الداتا الأساسية - عدل الأعمدة/الشروط حسب حاجتك
      const [lessonsRes, coursesRes, articlesRes] = await Promise.all([
        supabase.from('lessons').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('courses').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('articles').select('*').order('created_at', { ascending: false }).limit(50),
      ]);

      if (lessonsRes.error) throw lessonsRes.error;
      if (coursesRes.error) throw coursesRes.error;
      if (articlesRes.error) throw articlesRes.error;

      setLessons(lessonsRes.data || []);
      setCourses(coursesRes.data || []);
      setArticles(articlesRes.data || []);
    } catch (err) {
      console.error('fetchProtectedData error', err);
      setError('حدث خطأ أثناء جلب البيانات. جرب لاحقًا.');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const { email, password } = formData;
  
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
  
      if (loginError) {
        setError('❌ البريد أو كلمة المرور غير صحيحة');
        return;
      }
  
      // تأكد إن البريد مؤكد (لو تستخدم التحقق بالبريد)
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) console.error('getUser err', userError);
  
      if (!userData?.user?.email_confirmed_at) {
        await supabase.auth.signOut();
        setUnconfirmedEmail(email);
        setError('📩 من فضلك قم بتأكيد بريدك الإلكتروني أولاً قبل تسجيل الدخول.');
        return;
      }
  
      // هنا نريد إعادة تحميل كاملة حتى تُعاد قراءة كل contexts والـ state من الصوبابيز
      // الخيار A: اذهب للـ home واعمل reload
      window.location.href = '/';
  
      // أو الخيار B: لو تريّدت تبقى في نفس المسار ثم تعيد تحميله
      // window.location.reload();
  
    } catch (err) {
      console.error('handleLogin err', err);
      setError('حدث خطأ أثناء تسجيل الدخول. جرب لاحقًا.');
    }
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
      setTimeout(() => { setShowResetForm(false); setResetMessage(''); }, 3000);
    } catch (error) {
      setResetMessage(`❌ خطأ: ${error.message}`);
    }
  };

  // إعادة إرسال رسالة التفعيل
  const handleResendConfirmation = async (e) => {
    e.preventDefault();
    setResendMessage('');
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: resendEmail,
        options: { emailRedirectTo: `${window.location.origin}/confirm` }
      });
      if (error) throw error;
      setResendMessage('✅ تم إعادة إرسال رسالة التفعيل إلى بريدك الإلكتروني!');
      setResendEmail('');
      setTimeout(() => { setShowResendForm(false); setResendMessage(''); }, 3000);
    } catch (error) {
      setResendMessage(`❌ خطأ: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    clearProtectedData();
    navigate('/'); // أو اترك المستخدم في نفس الصفحة
  };

  // --- واجهة العرض: لو المستخدم موجود نعرض الداتا مباشرة ---
  if (user) {
    return (
      <div className="min-h-screen p-6 relative overflow-hidden">
        {/* Animated Background for logged in user */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFF9EF] via-[#F5E6D3] to-[#E8D5C4]">
          <div className="absolute inset-0">
            {/* Floating particles */}
            <div className="absolute w-2 h-2 bg-[#CDC0B6] rounded-full opacity-30 animate-pulse" style={{top: '10%', left: '20%', animationDelay: '0s'}}></div>
            <div className="absolute w-1 h-1 bg-[#665446] rounded-full opacity-40 animate-bounce" style={{top: '30%', right: '15%', animationDelay: '1s'}}></div>
            <div className="absolute w-3 h-3 bg-[#CDC0B6] rounded-full opacity-20 animate-pulse" style={{bottom: '20%', left: '10%', animationDelay: '2s'}}></div>
            <div className="absolute w-1 h-1 bg-[#5A4633] rounded-full opacity-50 animate-bounce" style={{top: '60%', right: '25%', animationDelay: '0.5s'}}></div>
            <div className="absolute w-2 h-2 bg-[#CDC0B6] rounded-full opacity-30 animate-pulse" style={{bottom: '40%', right: '10%', animationDelay: '1.5s'}}></div>
            
            {/* Animated waves */}
            <div className="absolute bottom-0 left-0 w-full h-32 opacity-10">
              <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
                <path d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z" fill="#665446" className="animate-pulse">
                  <animate attributeName="d" dur="10s" repeatCount="indefinite"
                    values="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z;
                            M0,80 C300,0 900,120 1200,80 L1200,120 L0,120 Z;
                            M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z"/>
                </path>
              </svg>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#665446]">مرحبًا، {user.email}</h2>
              <p className="text-sm text-gray-600">تم تحميل محتوى الموقع المحمي بعد تسجيل الدخول.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:opacity-90 transition-all duration-300 hover:scale-105"
              >
                تسجيل خروج
              </button>
            </div>
          </div>

          {isLoadingData ? (
            <div className="p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow text-center">جاري تحميل البيانات...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* الدروس */}
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow hover:shadow-lg transition-all duration-300 hover:scale-105">
                <h3 className="font-bold mb-3 text-[#5A4633]">الدروس ({lessons.length})</h3>
                <ul className="space-y-2 max-h-64 overflow-y-auto">
                  {lessons.map(l => (
                    <li key={l.id} className="border-b pb-2">
                      <Link to={`/lesson/${l.id}`} className="text-sm font-semibold text-[#665446] hover:underline">
                        {l.title}
                      </Link>
                      <div className="text-xs text-gray-500">{l.teacher_name || l.description?.slice(0, 80)}</div>
                    </li>
                  ))}
                  {lessons.length === 0 && <li className="text-sm text-gray-500">لا توجد دروس.</li>}
                </ul>
              </div>

              {/* الكورسات */}
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow hover:shadow-lg transition-all duration-300 hover:scale-105">
                <h3 className="font-bold mb-3 text-[#5A4633]">الكورسات ({courses.length})</h3>
                <ul className="space-y-2 max-h-64 overflow-y-auto">
                  {courses.map(c => (
                    <li key={c.id} className="border-b pb-2">
                      <Link to={`/course/${c.id}`} className="text-sm font-semibold text-[#665446] hover:underline">
                        {c.name}
                      </Link>
                      <div className="text-xs text-gray-500">{c.description?.slice(0, 80)}</div>
                    </li>
                  ))}
                  {courses.length === 0 && <li className="text-sm text-gray-500">لا توجد كورسات.</li>}
                </ul>
              </div>

              {/* المقالات */}
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow hover:shadow-lg transition-all duration-300 hover:scale-105">
                <h3 className="font-bold mb-3 text-[#5A4633]">المقالات ({articles.length})</h3>
                <ul className="space-y-2 max-h-64 overflow-y-auto">
                  {articles.map(a => (
                    <li key={a.id} className="border-b pb-2">
                      <Link to={`/articles/${a.id}`} className="text-sm font-semibold text-[#665446] hover:underline">
                        {a.title}
                      </Link>
                      <div className="text-xs text-gray-500">نُشر: {new Date(a.created_at).toLocaleDateString()}</div>
                    </li>
                  ))}
                  {articles.length === 0 && <li className="text-sm text-gray-500">لا توجد مقالات.</li>}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- لو المستخدم مش مسجل => نموذج تسجيل الدخول (مع Reset/Resend) ---
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#CDC0B6] via-[#B8A99C] to-[#A69589]">
        {/* Animated geometric shapes */}
        <div className="absolute inset-0">
          {/* Large floating circles */}
          <div className="absolute w-64 h-64 bg-gradient-to-r from-[#FFF9EF]/20 to-[#E8D5C4]/20 rounded-full blur-3xl animate-pulse" style={{top: '-10%', left: '-10%', animationDuration: '4s'}}></div>
          <div className="absolute w-96 h-96 bg-gradient-to-l from-[#665446]/10 to-[#5A4633]/10 rounded-full blur-3xl animate-pulse" style={{bottom: '-20%', right: '-15%', animationDuration: '6s'}}></div>
          <div className="absolute w-48 h-48 bg-gradient-to-t from-[#FFF9EF]/15 to-[#CDC0B6]/15 rounded-full blur-2xl animate-pulse" style={{top: '20%', right: '10%', animationDuration: '5s'}}></div>
          
          {/* Floating particles */}
          <div className="absolute w-3 h-3 bg-[#FFF9EF] rounded-full opacity-60 animate-bounce" style={{top: '15%', left: '10%', animationDelay: '0s', animationDuration: '3s'}}></div>
          <div className="absolute w-2 h-2 bg-[#665446] rounded-full opacity-40 animate-bounce" style={{top: '25%', right: '20%', animationDelay: '1s', animationDuration: '4s'}}></div>
          <div className="absolute w-4 h-4 bg-[#FFF9EF] rounded-full opacity-30 animate-bounce" style={{bottom: '30%', left: '15%', animationDelay: '2s', animationDuration: '3.5s'}}></div>
          <div className="absolute w-1 h-1 bg-[#5A4633] rounded-full opacity-70 animate-bounce" style={{top: '60%', left: '25%', animationDelay: '0.5s', animationDuration: '2.5s'}}></div>
          <div className="absolute w-2 h-2 bg-[#FFF9EF] rounded-full opacity-50 animate-bounce" style={{bottom: '20%', right: '30%', animationDelay: '1.5s', animationDuration: '4s'}}></div>
          <div className="absolute w-3 h-3 bg-[#665446] rounded-full opacity-35 animate-bounce" style={{top: '40%', right: '5%', animationDelay: '2.5s', animationDuration: '3s'}}></div>
          
          {/* Animated waves */}
          <div className="absolute bottom-0 left-0 w-full h-40 opacity-20">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z" fill="#FFF9EF">
                <animate attributeName="d" dur="8s" repeatCount="indefinite"
                  values="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z;
                          M0,80 C300,0 900,120 1200,80 L1200,120 L0,120 Z;
                          M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z"/>
              </path>
            </svg>
          </div>
          
          {/* Top wave */}
          <div className="absolute top-0 left-0 w-full h-32 opacity-15 transform rotate-180">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0,60 C300,120 900,0 1200,60 L1200,0 L0,0 Z" fill="#665446">
                <animate attributeName="d" dur="12s" repeatCount="indefinite"
                  values="M0,60 C300,120 900,0 1200,60 L1200,0 L0,0 Z;
                          M0,40 C300,0 900,80 1200,40 L1200,0 L0,0 Z;
                          M0,60 C300,120 900,0 1200,60 L1200,0 L0,0 Z"/>
              </path>
            </svg>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="bg-[#FFF9EF]/95 backdrop-blur-sm p-8 rounded-xl shadow-2xl max-w-md w-full relative z-10 border border-white/20 hover:shadow-3xl transition-all duration-500">
        <h2 className="text-2xl font-bold text-[#665446] mb-6 text-center">تسجيل الدخول</h2>

        <input
          type="email"
          name="email"
          placeholder="البريد الإلكتروني"
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded border border-[#CDC0B6]/30 bg-white/80 backdrop-blur-sm focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/20 transition-all duration-300"
          required
        />

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

        {error && (
          <div className="mb-4">
            <p className="text-red-600 mb-2">{error}</p>
            {error.includes('تأكيد بريدك') && (
              <button
                type="button"
                onClick={() => {
                  setResendEmail(unconfirmedEmail);
                  setShowResendForm(true);
                }}
                className="text-blue-600 underline text-sm hover:text-blue-800 transition-colors duration-200"
              >
                إعادة إرسال رسالة التفعيل
              </button>
            )}
          </div>
        )}

        <button type="submit" className="w-full py-3 bg-[#665446] text-white rounded-xl hover:bg-[#5A4633] hover:scale-105 transition-all duration-300 mb-4 shadow-lg hover:shadow-xl">
          تسجيل الدخول
        </button>

        <div className="text-center space-y-2">
          <div>
            <button type="button" onClick={() => setShowResetForm(true)} className="text-orange-600 underline text-sm hover:text-orange-800 transition-colors duration-200">
              نسيت كلمة المرور؟
            </button>
          </div>
          <div>
            <button type="button" onClick={() => setShowResendForm(true)} className="text-blue-600 underline text-sm hover:text-blue-800 transition-colors duration-200">
              إعادة إرسال رسالة التفعيل
            </button>
          </div>
        </div>
      </form>

      {/* Reset Password Modal */}
      {showResetForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#FFF9EF]/95 backdrop-blur-sm p-6 rounded-xl shadow-2xl max-w-md w-full border border-white/20 animate-in fade-in-0 zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#665446]">إعادة تعيين كلمة المرور</h3>
              <button onClick={() => setShowResetForm(false)} className="text-gray-500 hover:text-gray-700 text-2xl hover:scale-110 transition-all duration-200">✕</button>
            </div>

            <form onSubmit={handleResetPassword}>
              <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="أدخل بريدك الإلكتروني" className="w-full p-3 mb-4 border border-[#CDC0B6]/30 rounded bg-white/80 backdrop-blur-sm focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/20 transition-all duration-300" required />
              <button type="submit" className="w-full py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 hover:scale-105 transition-all duration-300 shadow-lg">إرسال رابط إعادة التعيين</button>
            </form>

            {resetMessage && <p className={`mt-4 text-center ${resetMessage.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>{resetMessage}</p>}
          </div>
        </div>
      )}

      {/* Resend Confirmation Modal */}
      {showResendForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#FFF9EF]/95 backdrop-blur-sm p-6 rounded-xl shadow-2xl max-w-md w-full border border-white/20 animate-in fade-in-0 zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#665446]">إعادة إرسال رسالة التفعيل</h3>
              <button onClick={() => setShowResendForm(false)} className="text-gray-500 hover:text-gray-700 text-2xl hover:scale-110 transition-all duration-200">✕</button>
            </div>

            <form onSubmit={handleResendConfirmation}>
              <input type="email" value={resendEmail} onChange={(e) => setResendEmail(e.target.value)} placeholder="أدخل بريدك الإلكتروني" className="w-full p-3 mb-4 border border-[#CDC0B6]/30 rounded bg-white/80 backdrop-blur-sm focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/20 transition-all duration-300" required />
              <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:scale-105 transition-all duration-300 shadow-lg">إعادة إرسال رسالة التفعيل</button>
            </form>

            {resendMessage && <p className={`mt-4 text-center ${resendMessage.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>{resendMessage}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;