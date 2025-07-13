import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../Utilities/supabaseClient';
import ExamForm from './ExamForm';

// دالة لتحويل رابط YouTube إلى صيغة embed
const getYoutubeEmbedUrl = (url) => {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/;
  const match = url?.match(regex);
  return match ? `https://www.youtube.com/embed/${match[1]}` : '';
};

const LessonPage = () => {
  const { id } = useParams(); // استخدام `id` بدل `lessonId`
  const lessonId = parseInt(id); // تحويله إلى عدد صحيح
  const [lesson, setLesson] = useState(null);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessonAndExam = async () => {
      if (isNaN(lessonId)) return;

      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (lessonError) {
        console.error('Error fetching lesson:', lessonError);
        setLoading(false);
        return;
      }

      setLesson(lessonData);

      const { data: examData } = await supabase
        .from('exams')
        .select('*')
        .eq('lesson_id', lessonId)
        .maybeSingle();

      setExam(examData);
      setLoading(false);
    };

    fetchLessonAndExam();
  }, [lessonId]);

  if (loading) {
    return <p className="text-[#665446] text-center mt-10">جاري تحميل المحاضرة...</p>;
  }

  if (!lesson) {
    return <p className="text-[#665446] text-center mt-10">لم يتم العثور على المحاضرة.</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-[#665446]">{lesson.title}</h2>

      {lesson.description && (
        <div className="text-[#665446]">{lesson.description}</div>
      )}

      {lesson.youtube_link ? (
          <div className="aspect-video w-full max-w-[1000px] mx-auto">
          <iframe
            className="w-full h-full"
            src={getYoutubeEmbedUrl(lesson.youtube_link)}
            title={lesson.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="text-[#665446] italic">لا يوجد فيديو متاح للمحاضرة</div>
      )}

      <div className="text-sm text-[#665446]">المدة: {lesson.duration || 0} دقيقة</div>
      <div className="text-sm text-[#665446]">المعلم: {lesson.teacher_name || 'غير محدد'}</div>

      <ExamForm exam={exam} lessonId={lesson.id} />
    </div>
  );
};

export default LessonPage;
