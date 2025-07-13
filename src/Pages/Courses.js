import React, { useState, useEffect } from 'react';
import { supabase } from '../Utilities/supabaseClient';  // تأكد من المسار الصحيح لـ supabaseClient
import { useNavigate } from 'react-router-dom';

const Courses = () => {
  const [levels, setLevels] = useState([]);  // لحفظ المستويات
  const [loading, setLoading] = useState(true);  // حالة التحميل
  const navigate = useNavigate();  // التوجيه إلى صفحة جديدة

  // جلب المستويات من قاعدة البيانات
  const fetchLevels = async () => {
    const { data, error } = await supabase.from('levels').select('*');
    if (error) {
      console.error('Error fetching levels:', error);
    } else {
      setLevels(data);  // تخزين المستويات في الحالة
    }
    setLoading(false);  // إنهاء حالة التحميل
  };

  useEffect(() => {
    fetchLevels();  // جلب المستويات عند تحميل الصفحة
  }, []);

  if (loading) {
    return <div className="text-center text-[#665446]">جاري تحميل المستويات...</div>;
  }

  return (
    <div className="bg-[#CDC0B6] min-h-screen py-10 px-4">
      <h1 className="text-center text-[#665446] text-4xl font-bold mb-10">المستويات الدراسية</h1>

      <div className="flex flex-col gap-6 max-w-3xl mx-auto">
        {levels.map((level) => (
          <div
            key={level.id}
            onClick={() => navigate(`/contentLevel/${level.id}`)}  // تصحيح المسار ليتوافق مع الراوت في App.js
            className="cursor-pointer bg-[#FFF9EF] rounded-2xl shadow-md p-6 hover:shadow-lg transition"
          >
            <h2 className="text-[#665446] text-2xl font-bold mb-2">{level.name}</h2>
            <p className="text-[#665446] text-base">{level.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;
