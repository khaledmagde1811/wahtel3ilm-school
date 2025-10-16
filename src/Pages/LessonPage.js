import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../Utilities/supabaseClient';
import ExamForm from './ExamForm';
import AnimatedBackground from '../Utilities/AnimatedBackground';

// دالة لتحويل رابط YouTube إلى صيغة embed مع parameters للموبايل
const getYoutubeEmbedUrl = (url) => {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/;
  const match = url?.match(regex);
  if (!match) return '';
  
  // إضافة parameters لجعل الفيديو يشتغل على الموبايل
  const videoId = match[1];
  const params = new URLSearchParams({
    autoplay: '0',
    rel: '0',
    modestbranding: '1',
    playsinline: '1', // مهم جداً للموبايل
    enablejsapi: '1'
  });
  
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

const LessonPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const lessonId = parseInt(id);  
  const [lesson, setLesson] = useState(null);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allLessons, setAllLessons] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

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

      // جلب جميع محاضرات نفس الدورة
      if (lessonData?.course_id) {
        const { data: courseLessons, error: courseLessonsError } = await supabase
          .from('lessons')
          .select('id, title')
          .eq('course_id', lessonData.course_id)
          .order('id', { ascending: true });

        if (!courseLessonsError && courseLessons) {
          setAllLessons(courseLessons);
          const index = courseLessons.findIndex(l => l.id === lessonId);
          setCurrentIndex(index);
        }
      }
      
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

  const handleNavigateToLesson = (targetLessonId) => {
    if (targetLessonId) {
      navigate(`/lesson/${targetLessonId}`);
    }
  };

  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  if (loading) {
    return (
      <AnimatedBackground className="min-h-screen">
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-[#665446] text-center text-xl font-semibold bg-[#FFF9EF]/90 backdrop-blur-sm px-8 py-6 rounded-xl shadow-lg">
            جاري تحميل المحاضرة...
          </p>
        </div>
      </AnimatedBackground>
    );
  }

  if (!lesson) {
    return (
      <AnimatedBackground className="min-h-screen">
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-[#FFF9EF]/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-white/20 max-w-md mx-4">
            <div className="text-6xl mb-4 text-center">😕</div>
            <p className="text-[#665446] text-center text-xl font-bold mb-4">
              لم يتم العثور على المحاضرة
            </p>
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-[#665446] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#554437] transition-all duration-300"
            >
              العودة للخلف
            </button>
          </div>
        </div>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground className="min-h-screen">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* عنوان المحاضرة */}
        <div className="bg-[#FFF9EF]/95 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-[#665446] mb-2">{lesson.title}</h2>
              {allLessons.length > 0 && (
                <p className="text-sm text-[#665446]/70">
                  المحاضرة {currentIndex + 1} من {allLessons.length}
                </p>
              )}
            </div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-[#CDC0B6] text-[#665446] rounded-lg font-semibold hover:bg-[#B8AB9F] transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              رجوع
            </button>
          </div>
          
          {lesson.description && (
            <p className="text-[#665446] leading-relaxed">{lesson.description}</p>
          )}
          
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-[#665446]">
            <span className="flex items-center gap-2 bg-[#CDC0B6]/30 px-3 py-1 rounded-full">
              ⏱️ المدة: {lesson.duration || 'غير محدد'}
            </span>
            <span className="flex items-center gap-2 bg-[#CDC0B6]/30 px-3 py-1 rounded-full">
              👨‍🏫 المعلم: {lesson.teacher_name || 'غير محدد'}
            </span>
          </div>
        </div>

        {/* الفيديو */}
        <div className="bg-[#FFF9EF]/95 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/20">
          {lesson.youtube_link ? (
            <div className="aspect-video w-full">
              <iframe
                className="w-full h-full"
                src={getYoutubeEmbedUrl(lesson.youtube_link)}
                title={lesson.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                playsInline
                style={{ border: 'none' }}
              />
            </div>
          ) : (
            <div className="aspect-video w-full flex items-center justify-center bg-[#CDC0B6]/20">
              <div className="text-center">
                <div className="text-6xl mb-4">📹</div>
                <p className="text-[#665446] text-lg font-semibold">لا يوجد فيديو متاح للمحاضرة</p>
              </div>
            </div>
          )}
        </div>

        {/* أزرار التنقل بين المحاضرات */}
     {allLessons.length > 1 && (
  <div className="bg-[#FFF9EF]/95 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
    {/* على الموبايل: صف قابل للّف (wrap) فيظهر الزرين أولاً والأسلايدر يتحرّك للسطر التالي */}
    {/* على md+: بدون لف بالترتيب المعتاد: السابق - المؤشر - التالي */}
    <div className="flex flex-wrap md:flex-nowrap items-stretch md:items-center justify-between gap-4">
      
      {/* زر المحاضرة السابقة */}
      <button
        onClick={() => handleNavigateToLesson(previousLesson?.id)}
        disabled={!previousLesson}
        className="order-1 md:order-none flex items-center gap-3 px-6 py-3 bg-[#CDC0B6] text-[#665446] rounded-xl font-semibold hover:bg-[#B8AB9F] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 disabled:hover:scale-100 flex-1 md:max-w-xs min-w-[140px]"
      >
        <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <div className="text-right flex-1">
          <div className="text-xs opacity-70">السابقة</div>
          <div className="text-sm font-bold truncate">
            {/* {previousLesson?.title || 'لا توجد'} */}
          </div>
        </div>
      </button>

      {/* المؤشر (الأسلايدر) */}
      <div className="order-3 md:order-none w-full md:w-auto flex flex-col items-center gap-2 px-2 md:px-4">
        <div className="flex items-center gap-2">
          {allLessons.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'w-8 bg-[#665446]' : 'w-2 bg-[#CDC0B6]'
              }`}
            />
          ))}
        </div>
        <span className="text-[#665446] text-sm font-medium whitespace-nowrap">
          {currentIndex + 1} من {allLessons.length}
        </span>
      </div>

      {/* زر المحاضرة التالية */}
      <button
        onClick={() => handleNavigateToLesson(nextLesson?.id)}
        disabled={!nextLesson}
        className="order-2 md:order-none flex items-center gap-3 px-6 py-3 bg-[#665446] text-white rounded-xl font-semibold hover:bg-[#554437] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 disabled:hover:scale-100 flex-1 md:max-w-xs min-w-[140px]"
      >
        <div className="text-left flex-1">
          <div className="text-xs opacity-70">التالية</div>
          <div className="text-sm font-bold truncate"></div>
        </div>
        <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>

    </div>
  </div>
)}


        {/* الاختبار */}
        <ExamForm exam={exam} lessonId={lesson.id} />
      </div>
    </AnimatedBackground>
  );
};

export default LessonPage;