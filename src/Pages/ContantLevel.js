import React, { useEffect, useState } from 'react';
import { supabase } from '../Utilities/supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';
import AnimatedBackground from '../Utilities/AnimatedBackground'; // تأكد من المسار الصحيح

const ContantLevel = () => {
  const { id } = useParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // جلب الدورات الخاصة بالمستوى بناءً على id
  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('level_id', id);

    if (error) {
      console.error('Error fetching courses:', error);
    } else {
      setCourses(data);
    }
    setLoading(false);
  };

  // استدعاء الدالة عند تحميل الصفحة أو تغير id
  useEffect(() => {
    fetchCourses();
  }, [id]);

  return (
    <AnimatedBackground className="min-h-screen py-10 px-4">
      <h1 className="text-center text-[#665446] text-4xl font-bold mb-10 drop-shadow-sm">
        الدورات الخاصة بالمستوى
      </h1>

      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-[#665446] text-center text-xl font-semibold bg-[#FFF9EF]/90 backdrop-blur-sm px-8 py-6 rounded-xl shadow-lg">
            جاري تحميل الدورات...
          </p>
        </div>
      ) : courses.length === 0 ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-[#FFF9EF]/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-white/20">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-[#665446] text-2xl font-bold mb-4">
                لا توجد دورات متاحة
              </h2>
              <p className="text-[#665446] mb-6">
                لا توجد دورات لهذا المستوى حالياً
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-[#665446] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#554437] hover:scale-105 transition-all duration-300 shadow-lg"
              >
                العودة للصفحة الرئيسية
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto">
          {courses.map((course, index) => (
            <div
              key={course.id}
              className="relative"
              style={{
                animationDelay: `${index * 0.1}s`, // backticks مهمة هنا
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
              
            >
              <div
onClick={() => navigate(`/course/${course.id}`)}
className="cursor-pointer bg-[#FFF9EF]/95 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border border-white/20 group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#665446] text-white rounded-full flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-[#665446] text-2xl font-bold mb-2 group-hover:text-[#5A4633] transition-colors duration-300">
                      {course.name}
                    </h2>
                    <p className="text-[#665446] group-hover:text-[#5A4633] transition-colors duration-300">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-[#665446] group-hover:text-[#5A4633] transition-colors duration-300 mt-3">
                      <span className="flex items-center gap-1">
                        🎯 الدورة رقم {index + 1}
                      </span>
                      <span className="flex items-center gap-1">
                        📖 انقر للاستكشاف
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
      )}

      {/* CSS Animation Keyframes */}
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
    </AnimatedBackground>
  );
};

export default ContantLevel;