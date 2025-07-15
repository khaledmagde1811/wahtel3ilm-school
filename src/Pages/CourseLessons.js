// src/Pages/CourseLessons.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../Utilities/supabaseClient';

const CourseLessons = () => {
  const { id } = useParams();           // رقم الدورة من الـ URL
  const navigate = useNavigate();       // للتنقل بين الصفحات
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', id);

      if (error) {
        console.error('Error fetching lessons:', error);
      } else {
        setLessons(data);
      }
      setLoading(false);
    };

    fetchLessons();
  }, [id]);

  if (loading) {
    return (
      <p className="text-[#665446] text-center mt-10">
        جاري تحميل المحاضرات...
      </p>
    );
  }

  return (
    <div className="bg-[#CDC0B6] min-h-screen py-10 px-4">
      <h1 className="text-center text-[#665446] text-4xl font-bold mb-10">
        المحاضرات الخاصة بالدورة {id}
      </h1>

      {lessons.length === 0 ? (
        <p className="text-[#665446] text-center">
          لا توجد محاضرات لهذه الدورة.
        </p>
      ) : (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              onClick={() => navigate(`/lesson/${lesson.id}`)}
              className="cursor-pointer bg-[#FFF9EF] rounded-xl shadow-md p-6 hover:shadow-lg transition"
            >
              <h2 className="text-[#665446] text-2xl font-bold mb-2">
                {lesson.title}
              </h2>
              <p className="text-[#665446]">
                {lesson.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseLessons;
