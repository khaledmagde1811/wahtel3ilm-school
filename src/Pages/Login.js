// src/Pages/Login.js
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

  // المستخدم والبيانات المحمَّلة
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
      <div className="min-h-screen p-6 bg-[#FFF9EF]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#665446]">مرحبًا، {user.email}</h2>
              <p className="text-sm text-gray-600">تم تحميل محتوى الموقع المحمي بعد تسجيل الدخول.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:opacity-90"
              >
                تسجيل خروج
              </button>
            </div>
          </div>

          {isLoadingData ? (
            <div className="p-6 bg-white rounded-lg shadow text-center">جاري تحميل البيانات...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* الدروس */}
              <div className="bg-white p-4 rounded-lg shadow">
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
              <div className="bg-white p-4 rounded-lg shadow">
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
              <div className="bg-white p-4 rounded-lg shadow">
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
    <div className="bg-[#CDC0B6] min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleLogin} className="bg-[#FFF9EF] p-8 rounded-xl shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold text-[#665446] mb-6 text-center">تسجيل الدخول</h2>

        <input
          type="email"
          name="email"
          placeholder="البريد الإلكتروني"
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded border"
          required
        />

        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="كلمة المرور"
            onChange={handleChange}
            className="w-full p-3 rounded border pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
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
                className="text-blue-600 underline text-sm hover:text-blue-800"
              >
                إعادة إرسال رسالة التفعيل
              </button>
            )}
          </div>
        )}

        <button type="submit" className="w-full py-3 bg-[#665446] text-white rounded-xl hover:opacity-90 mb-4">
          تسجيل الدخول
        </button>

        <div className="text-center space-y-2">
          <div>
            <button type="button" onClick={() => setShowResetForm(true)} className="text-orange-600 underline text-sm hover:text-orange-800">
              نسيت كلمة المرور؟
            </button>
          </div>
          <div>
            <button type="button" onClick={() => setShowResendForm(true)} className="text-blue-600 underline text-sm hover:text-blue-800">
              إعادة إرسال رسالة التفعيل
            </button>
          </div>
        </div>
      </form>

      {/* Reset Password Modal */}
      {showResetForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-[#FFF9EF] p-6 rounded-xl shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#665446]">إعادة تعيين كلمة المرور</h3>
              <button onClick={() => setShowResetForm(false)} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>

            <form onSubmit={handleResetPassword}>
              <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="أدخل بريدك الإلكتروني" className="w-full p-3 mb-4 border rounded" required />
              <button type="submit" className="w-full py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700">إرسال رابط إعادة التعيين</button>
            </form>

            {resetMessage && <p className={`mt-4 text-center ${resetMessage.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>{resetMessage}</p>}
          </div>
        </div>
      )}

      {/* Resend Confirmation Modal */}
      {showResendForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-[#FFF9EF] p-6 rounded-xl shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#665446]">إعادة إرسال رسالة التفعيل</h3>
              <button onClick={() => setShowResendForm(false)} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>

            <form onSubmit={handleResendConfirmation}>
              <input type="email" value={resendEmail} onChange={(e) => setResendEmail(e.target.value)} placeholder="أدخل بريدك الإلكتروني" className="w-full p-3 mb-4 border rounded" required />
              <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">إعادة إرسال رسالة التفعيل</button>
            </form>

            {resendMessage && <p className={`mt-4 text-center ${resendMessage.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>{resendMessage}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
