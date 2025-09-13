// src/Pages/CourseLessons.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../Utilities/supabaseClient';

const CourseLessons = () => {
  const { id } = useParams();           // رقم الدورة من الـ URL
  const navigate = useNavigate();       // للتنقل بين الصفحات
  const [lessons, setLessons] = useState([]);
  const [allLessons, setAllLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // التحقق من حالة تسجيل الدخول
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setAuthLoading(false);
    };

    checkAuth();

    // الاستماع لتغييرات حالة المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setAuthLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchLessons = async () => {
      if (!user || authLoading) {
        if (!authLoading) {
          setLoading(false);
        }
        return;
      }

      try {
        // الخطوة 1: جلب جميع المحاضرات في الدورة
        const { data: courseLessons, error: courseLessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', id)
          .order('id', { ascending: true });

        if (courseLessonsError) {
          console.error('Error fetching course lessons:', courseLessonsError);
          setLoading(false);
          return;
        }

        setAllLessons(courseLessons || []);

        // الخطوة 2: الحصول على student_id من جدول students
        const { data: studentRecord, error: studentError } = await supabase
          .from('students')
          .select('id')
          .eq('auth_id', user.id)
          .maybeSingle();

        if (studentError || !studentRecord) {
          console.error('Error fetching student ID:', studentError);
          setLoading(false);
          return;
        }

        // الخطوة 3: جلب المحاضرات المسموح بها للطالب
        const { data: accessibleLessons, error: accessError } = await supabase
          .from('student_lesson_access')
          .select('lesson_id')
          .eq('student_id', user.id) // استخدام auth_id
          .eq('is_open', true);

        if (accessError) {
          console.error('Error fetching access list:', accessError);
          setLoading(false);
          return;
        }

        const accessibleLessonIds = accessibleLessons.map((item) => item.lesson_id);

        // الخطوة 4: إضافة المحاضرة الأولى دائماً (إذا وجدت)
        const firstLesson = courseLessons.length > 0 ? courseLessons[0] : null;
        if (firstLesson && !accessibleLessonIds.includes(firstLesson.id)) {
          accessibleLessonIds.push(firstLesson.id);
        }

        // الخطوة 5: فلترة المحاضرات حسب الوصول المسموح
        const filteredLessons = courseLessons.filter(lesson => 
          accessibleLessonIds.includes(lesson.id)
        );

        setLessons(filteredLessons);

      } catch (error) {
        console.error('Error in fetchLessons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [id, user, authLoading]);

  // إظهار شاشة التحميل أثناء التحقق من المصادقة
  if (authLoading || (user && loading)) {
    return (
      <div className="bg-[#CDC0B6] min-h-screen py-10 px-4">
        <p className="text-[#665446] text-center mt-10">
          جاري التحميل...
        </p>
      </div>
    );
  }

  // إذا لم يكن المستخدم مسجل الدخول
  if (!user) {
    return (
      <div className="bg-[#CDC0B6] min-h-screen py-10 px-4">
      <div className="max-w-md mx-auto text-center mt-20">
        <div className="bg-[#FFF9EF] rounded-xl shadow-md p-8">
          <h2 className="text-[#665446] text-3xl font-bold mb-4">
            تسجيل الدخول مطلوب
          </h2>
          <p className="text-[#665446] mb-6">
            يجب عليك تسجيل الدخول لمشاهدة محاضرات هذه الدورة
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/login')}
              className="bg-[#665446] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#554437] transition"
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="bg-transparent border-2 border-[#665446] text-[#665446] py-3 px-6 rounded-lg font-semibold hover:bg-[#665446] hover:text-white transition"
            >
              إنشاء حساب جديد
            </button>
            <button
              onClick={() => navigate('/')}
              className="text-[#665446] underline hover:no-underline"
            >
              العودة للصفحة الرئيسية
            </button>
          </div>
        </div>
      </div>
    </div>
    );
  }

  // إذا كان المستخدم مسجل الدخول - عرض المحاضرات
  return (
    <div className="bg-[#CDC0B6] min-h-screen py-10 px-4">
      <h1 className="text-center text-[#665446] text-4xl font-bold mb-10">
        المحاضرات الخاصة بالدورة {id}
      </h1>

      {allLessons.length === 0 ? (
        <p className="text-[#665446] text-center">
          لا توجد محاضرات في هذه الدورة.
        </p>
      ) : lessons.length === 0 ? (
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-[#FFF9EF] rounded-xl shadow-md p-8">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-[#665446] text-2xl font-bold mb-4">
              المحاضرات غير متاحة بعد
            </h2>
            <p className="text-[#665446] mb-6">
              لم يتم فتح أي محاضرات لك في هذه الدورة بعد. 
              يرجى التواصل مع المدرب أو إكمال المتطلبات السابقة.
            </p>
            <div className="bg-[#CDC0B6] rounded-lg p-4 mb-4">
              <p className="text-[#665446] text-sm">
                📋 إجمالي المحاضرات في الدورة: {allLessons.length}
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="bg-[#665446] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#554437] transition"
            >
              العودة للصفحة الرئيسية
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          {/* إحصائيات المحاضرات */}
          <div className="bg-[#FFF9EF] rounded-xl shadow-md p-4 mb-6">
            <div className="flex justify-between items-center text-[#665446]">
              <span className="font-semibold">
                المحاضرات المتاحة: {lessons.length} من {allLessons.length}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-full bg-[#CDC0B6] rounded-full h-2 w-32">
                  <div 
                    className="bg-[#665446] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(lessons.length / allLessons.length) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm">
                  {Math.round((lessons.length / allLessons.length) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* قائمة المحاضرات */}
          <div className="flex flex-col gap-6">
            {lessons.map((lesson, index) => (
              <div key={lesson.id} className="relative">
                <div
                  onClick={() => navigate(`/lesson/${lesson.id}`)}
                  className="cursor-pointer bg-[#FFF9EF] rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#665446] text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-[#665446] text-2xl font-bold mb-2 flex items-center gap-2">
                        {lesson.title}
                        {lesson.id === allLessons[0]?.id && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-normal">
                            مفتوحة دائماً
                          </span>
                        )}
                      </h2>
                      <p className="text-[#665446] mb-3">
                        {lesson.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-[#665446]">
                        <span className="flex items-center gap-1">
                          ⏱️ {lesson.duration || 'غير محدد'}
                        </span>
                        <span className="flex items-center gap-1">
                          {lesson.id === allLessons[0]?.id ? '🆓 مجانية' : '🎯 متاح الآن'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                     
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* المحاضرات المقفلة */}
          {allLessons.length > lessons.length && (
            <div className="mt-8">
              <h3 className="text-[#665446] text-xl font-bold mb-4 text-center">
                المحاضرات القادمة
              </h3>
              <div className="flex flex-col gap-4">
                {allLessons
                  .filter(lesson => !lessons.find(l => l.id === lesson.id))
                  .slice(0, 3)
                  .map((lesson, index) => (
                  <div key={lesson.id} className="opacity-60">
                    <div className="bg-[#FFF9EF] rounded-xl shadow-md p-6 border border-dashed border-[#CDC0B6]">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-[#CDC0B6] text-[#665446] rounded-full flex items-center justify-center font-bold text-lg">
                          🔒
                        </div>
                        <div className="flex-1">
                          <h2 className="text-[#665446] text-xl font-bold mb-2">
                            {lesson.title}
                          </h2>
                          <p className="text-[#665446] text-sm">
                            سيتم فتح هذه المحاضرة بعد إكمال المحاضرات السابقة
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseLessons;