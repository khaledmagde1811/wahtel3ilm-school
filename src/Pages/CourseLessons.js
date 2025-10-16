import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../Utilities/supabaseClient';

const CourseLessons = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setAuthLoading(false);
    };

    checkAuth();

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
        // جلب جميع المحاضرات في الدورة (كلها مفتوحة)
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

        // عرض جميع المحاضرات بدون قيود
        setLessons(courseLessons || []);

      } catch (error) {
        console.error('Error in fetchLessons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [id, user, authLoading]);

  if (authLoading || (user && loading)) {
    return (
      <div className="min-h-screen py-10 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#CDC0B6] via-[#B8A99C] to-[#A69589]">
          <div className="absolute inset-0">
            <div className="absolute w-40 h-40 bg-gradient-to-r from-[#FFF9EF]/30 to-[#E8D5C4]/30 rounded-full blur-xl animate-pulse" style={{top: '20%', left: '20%', animationDuration: '2s'}}></div>
            <div className="absolute w-32 h-32 bg-gradient-to-l from-[#665446]/20 to-[#5A4633]/20 rounded-full blur-lg animate-pulse" style={{bottom: '30%', right: '25%', animationDuration: '2.5s'}}></div>
            <div className="absolute w-24 h-24 bg-gradient-to-t from-[#FFF9EF]/25 to-[#CDC0B6]/25 rounded-full blur-md animate-pulse" style={{top: '60%', right: '15%', animationDuration: '1.8s'}}></div>
            
            <div className="absolute w-4 h-4 bg-[#FFF9EF] rounded-full opacity-60 animate-bounce" style={{top: '25%', left: '15%', animationDelay: '0s', animationDuration: '2s'}}></div>
            <div className="absolute w-3 h-3 bg-[#665446] rounded-full opacity-50 animate-bounce" style={{top: '45%', right: '20%', animationDelay: '0.5s', animationDuration: '2.2s'}}></div>
            <div className="absolute w-5 h-5 bg-[#E8D5C4] rounded-full opacity-40 animate-bounce" style={{bottom: '40%', left: '30%', animationDelay: '1s', animationDuration: '1.8s'}}></div>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-[#665446] text-center text-xl font-semibold bg-[#FFF9EF]/90 backdrop-blur-sm px-8 py-6 rounded-xl shadow-lg relative z-10">
            جاري التحميل...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen py-10 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#CDC0B6] via-[#B8A99C] to-[#A69589]">
          <div className="absolute inset-0">
            <div className="absolute w-80 h-80 bg-gradient-to-r from-[#FFF9EF]/20 to-[#E8D5C4]/20 rounded-full blur-3xl animate-pulse" style={{top: '-15%', left: '-15%', animationDuration: '6s'}}></div>
            <div className="absolute w-64 h-64 bg-gradient-to-l from-[#665446]/15 to-[#5A4633]/15 rounded-full blur-3xl animate-pulse" style={{bottom: '-10%', right: '-10%', animationDuration: '8s'}}></div>
            <div className="absolute w-48 h-48 bg-gradient-to-t from-[#FFF9EF]/25 to-[#CDC0B6]/25 rounded-full blur-2xl animate-pulse" style={{top: '20%', right: '15%', animationDuration: '7s'}}></div>
            
            <div className="absolute w-6 h-6 bg-[#FFF9EF] rounded-full opacity-60 animate-bounce" style={{top: '15%', left: '10%', animationDelay: '0s', animationDuration: '4s'}}></div>
            <div className="absolute w-4 h-4 bg-[#665446] rounded-full opacity-50 animate-bounce" style={{top: '35%', right: '12%', animationDelay: '1s', animationDuration: '5s'}}></div>
            <div className="absolute w-8 h-8 bg-[#E8D5C4] rounded-full opacity-40 animate-bounce" style={{bottom: '30%', left: '20%', animationDelay: '2s', animationDuration: '4.5s'}}></div>
            <div className="absolute w-3 h-3 bg-[#5A4633] rounded-full opacity-70 animate-bounce" style={{top: '65%', left: '35%', animationDelay: '0.5s', animationDuration: '3.5s'}}></div>
            <div className="absolute w-5 h-5 bg-[#FFF9EF] rounded-full opacity-55 animate-bounce" style={{bottom: '25%', right: '30%', animationDelay: '1.8s', animationDuration: '4.2s'}}></div>
          </div>
        </div>

        <div className="max-w-md mx-auto text-center mt-20 relative z-10">
          <div className="bg-[#FFF9EF]/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-white/20">
            <h2 className="text-[#665446] text-3xl font-bold mb-4">
              تسجيل الدخول مطلوب
            </h2>
            <p className="text-[#665446] mb-6">
              يجب عليك تسجيل الدخول لمشاهدة محاضرات هذه الدورة
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/login')}
                className="bg-[#665446] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#554437] hover:scale-105 transition-all duration-300 shadow-lg"
              >
                تسجيل الدخول
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-transparent border-2 border-[#665446] text-[#665446] py-3 px-6 rounded-lg font-semibold hover:bg-[#665446] hover:text-white hover:scale-105 transition-all duration-300"
              >
                إنشاء حساب جديد
              </button>
              <button
                onClick={() => navigate('/')}
                className="text-[#665446] underline hover:no-underline hover:scale-105 transition-all duration-300"
              >
                العودة للصفحة الرئيسية
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#CDC0B6] via-[#B8A99C] to-[#A69589]">
        <div className="absolute inset-0">
          <div className="absolute w-96 h-96 bg-gradient-to-r from-[#FFF9EF]/18 to-[#E8D5C4]/18 rounded-full blur-3xl animate-pulse" style={{top: '-20%', left: '-20%', animationDuration: '8s'}}></div>
          <div className="absolute w-80 h-80 bg-gradient-to-l from-[#665446]/12 to-[#5A4633]/12 rounded-full blur-3xl animate-pulse" style={{bottom: '-15%', right: '-15%', animationDuration: '10s'}}></div>
          <div className="absolute w-64 h-64 bg-gradient-to-t from-[#FFF9EF]/22 to-[#CDC0B6]/22 rounded-full blur-2xl animate-pulse" style={{top: '15%', right: '10%', animationDuration: '9s'}}></div>
          <div className="absolute w-72 h-72 bg-gradient-to-b from-[#E8D5C4]/15 to-[#CDC0B6]/15 rounded-full blur-3xl animate-pulse" style={{bottom: '20%', left: '15%', animationDuration: '11s'}}></div>
          
          <div className="absolute w-48 h-48 bg-gradient-to-tr from-[#FFF9EF]/25 to-[#665446]/8 rounded-full blur-xl animate-pulse" style={{top: '35%', left: '25%', animationDuration: '7s'}}></div>
          <div className="absolute w-56 h-56 bg-gradient-to-bl from-[#CDC0B6]/20 to-[#5A4633]/12 rounded-full blur-xl animate-pulse" style={{top: '55%', right: '20%', animationDuration: '8.5s'}}></div>
          
          <div className="absolute w-6 h-6 bg-[#FFF9EF] rounded-full opacity-50 animate-bounce" style={{top: '18%', left: '12%', animationDelay: '0s', animationDuration: '5s'}}></div>
          <div className="absolute w-4 h-4 bg-[#665446] rounded-full opacity-40 animate-bounce" style={{top: '28%', right: '14%', animationDelay: '1s', animationDuration: '6s'}}></div>
          <div className="absolute w-8 h-8 bg-[#FFF9EF] rounded-full opacity-35 animate-bounce" style={{bottom: '42%', left: '18%', animationDelay: '2s', animationDuration: '5.5s'}}></div>
          <div className="absolute w-3 h-3 bg-[#5A4633] rounded-full opacity-60 animate-bounce" style={{top: '72%', left: '35%', animationDelay: '0.5s', animationDuration: '4.5s'}}></div>
          <div className="absolute w-5 h-5 bg-[#FFF9EF] rounded-full opacity-45 animate-bounce" style={{bottom: '32%', right: '28%', animationDelay: '1.8s', animationDuration: '6.2s'}}></div>
          <div className="absolute w-7 h-7 bg-[#665446] rounded-full opacity-35 animate-bounce" style={{top: '48%', right: '8%', animationDelay: '2.5s', animationDuration: '4.8s'}}></div>
          <div className="absolute w-4 h-4 bg-[#E8D5C4] rounded-full opacity-55 animate-bounce" style={{top: '82%', left: '50%', animationDelay: '1.2s', animationDuration: '5.2s'}}></div>
          <div className="absolute w-6 h-6 bg-[#FFF9EF] rounded-full opacity-40 animate-bounce" style={{bottom: '52%', right: '35%', animationDelay: '0.8s', animationDuration: '6.5s'}}></div>
          
          <div className="absolute bottom-0 left-0 w-full h-56 opacity-20">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z" fill="#FFF9EF">
                <animate attributeName="d" dur="14s" repeatCount="indefinite"
                  values="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z;
                          M0,80 C300,0 900,120 1200,80 L1200,120 L0,120 Z;
                          M0,40 C300,100 900,20 1200,40 L1200,120 L0,120 Z;
                          M0,70 C300,140 900,-20 1200,70 L1200,120 L0,120 Z;
                          M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z"/>
              </path>
            </svg>
          </div>
          
          <div className="absolute top-0 left-0 w-full h-48 opacity-15 transform rotate-180">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0,60 C300,120 900,0 1200,60 L1200,0 L0,0 Z" fill="#665446">
                <animate attributeName="d" dur="16s" repeatCount="indefinite"
                  values="M0,60 C300,120 900,0 1200,60 L1200,0 L0,0 Z;
                          M0,40 C300,0 900,80 1200,40 L1200,0 L0,0 Z;
                          M0,80 C300,160 900,-40 1200,80 L1200,0 L0,0 Z;
                          M0,50 C300,100 900,10 1200,50 L1200,0 L0,0 Z;
                          M0,60 C300,120 900,0 1200,60 L1200,0 L0,0 Z"/>
              </path>
            </svg>
          </div>

          <div className="absolute w-16 h-16 opacity-15 animate-spin" style={{top: '25%', left: '15%', animationDuration: '25s'}}>
            <div className="w-full h-full bg-[#FFF9EF] transform rotate-45 rounded-lg"></div>
          </div>
          <div className="absolute w-12 h-12 opacity-12 animate-spin" style={{bottom: '35%', right: '18%', animationDuration: '30s'}}>
            <div className="w-full h-full bg-[#665446] rounded-full"></div>
          </div>
          <div className="absolute w-10 h-10 opacity-20 animate-spin" style={{top: '65%', right: '12%', animationDuration: '20s'}}>
            <div className="w-full h-full bg-[#E8D5C4]" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}}></div>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <h1 className="text-center text-[#665446] text-4xl font-bold mb-10 drop-shadow-sm">
          المحاضرات الخاصة بالدورة 
        </h1>

        {lessons.length === 0 ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <p className="text-[#665446] text-center text-xl bg-[#FFF9EF]/90 backdrop-blur-sm px-8 py-6 rounded-xl shadow-lg">
              لا توجد محاضرات في هذه الدورة.
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="bg-[#FFF9EF]/95 backdrop-blur-sm rounded-xl shadow-lg p-4 mb-6 border border-white/20">
              <div className="flex justify-between items-center text-[#665446]">
                <span className="font-semibold">
                  إجمالي المحاضرات: {lessons.length}
                </span>
                <span className="text-sm bg-green-100/80 backdrop-blur-sm text-green-700 px-3 py-1 rounded-full font-medium">
                  ✅ جميع المحاضرات متاحة
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {lessons.map((lesson, index) => (
                <div key={lesson.id} className="relative" style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}>
                  <div
                    onClick={() => navigate(`/lesson/${lesson.id}`)}
                    className="cursor-pointer bg-[#FFF9EF]/95 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border border-white/20 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-[#665446] text-white rounded-full flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-[#665446] text-2xl font-bold mb-2 flex items-center gap-2 group-hover:text-[#5A4633] transition-colors duration-300">
                          {lesson.title}
                          <span className="text-xs bg-green-100/80 backdrop-blur-sm text-green-700 px-2 py-1 rounded-full font-normal">
                            متاحة
                          </span>
                        </h2>
                        <p className="text-[#665446] mb-3 group-hover:text-[#5A4633] transition-colors duration-300">
                          {lesson.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-[#665446] group-hover:text-[#5A4633] transition-colors duration-300">
                          <span className="flex items-center gap-1">
                            ⏱️ {lesson.duration || 'غير محدد'}
                          </span>
                          <span className="flex items-center gap-1">
                            🎯 انقر للمشاهدة
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-6 h-6 text-[#665446] transform group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default CourseLessons;