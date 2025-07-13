import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../Utilities/supabaseClient';
import { useNavigate } from 'react-router-dom';
const CourseLessons = () => {
  const { id } = useParams();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchLessons();
  }, [id]);
  
const navigate = useNavigate();

  return (
    <div className="bg-[#CDC0B6] min-h-screen py-10 px-4">
      <h1 className="text-center text-[#665446] text-4xl font-bold mb-8">محاضرات المادة</h1>

      {loading ? (
        <p className="text-center text-[#665446]">جاري تحميل المحاضرات...</p>
      ) : lessons.length === 0 ? (
        <p className="text-center text-[#665446]">لا توجد محاضرات متاحة حاليًا.</p>
      ) : (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto">
          {lessons.map((lesson) => (
           <div
           key={lesson.id}
           onClick={() => navigate(`/lesson/${lesson.id}`)}
           className="cursor-pointer bg-[#FFF9EF] rounded-xl shadow-md p-6 hover:shadow-lg transition"
         >
           <h2 className="text-[#665446] text-2xl font-bold mb-2">{lesson.title}</h2>
           <p className="text-[#665446]">{lesson.description}</p>
         </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseLessons;
