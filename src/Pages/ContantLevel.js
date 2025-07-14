import React, { useEffect, useState } from 'react';
import { supabase } from '../Utilities/supabaseClient';  // تأكد من المسار الصحيح
import { useParams, useNavigate } from 'react-router-dom';  // لاستخراج المعرف من URL
import '../App.css'; // ← هنا استيراد الأنماط
const ContantLevel = () => {
  const { id } = useParams();  // استخراج `id` من URL
  const [courses, setCourses] = useState([]);  // لتخزين الدورات الخاصة بالمستوى
  const [loading, setLoading] = useState(true);  // حالة التحميل
  const navigate = useNavigate();  // لاستخدام التوجيه

  // جلب الدورات الخاصة بالمستوى بناءً على `id`
  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('level_id', id);  // جلب الدورات التي تحتوي على `level_id`

    if (error) {
      console.error('Error fetching courses:', error);
    } else {
      setCourses(data);  // تخزين الدورات في الحالة
    }
    setLoading(false);  // إنهاء حالة التحميل
  };

  // استدعاء الدالة عند تحميل الصفحة أو تغير `id`
  useEffect(() => {
    fetchCourses();
  }, [id]);  // إعادة التوجيه عند تغير `id`

  return (
    <div className="bg-[#CDC0B6] min-h-screen py-10 px-4">
      <h1 className="text-center text-[#665446] text-4xl font-bold mb-10">الدورات الخاصة بالمستوى {id}</h1>

      {loading ? (
        <p className="text-center text-[#665446]">جاري تحميل الدورات...</p>
      ) : courses.length === 0 ? (
        <p className="text-center text-[#665446]">لا توجد دورات لهذا المستوى.</p>
      ) : (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto">
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() => navigate(`/course/${course.id}`)}  // التنقل إلى صفحة تفاصيل الدورة
              className="cursor-pointer bg-[#FFF9EF] rounded-xl shadow-md p-6 hover:shadow-lg transition"
            >
              <h2 className="text-[#665446] text-2xl font-bold mb-2">{course.name}</h2>
              <p className="text-[#665446] text-base">{course.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContantLevel;
