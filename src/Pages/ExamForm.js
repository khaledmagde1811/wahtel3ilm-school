import React, { useState, useEffect } from 'react';
import { supabase } from '../Utilities/supabaseClient';
import { useNavigate } from 'react-router-dom';

const ExamForm = ({ exam, lessonId }) => {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  // إعادة تهيئة الكومبوننت عند تغيير lessonId أو exam
  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
    setScore(null);
    setCurrentQuestion(0);
    setProcessing(false);
  }, [lessonId, exam]);

  if (!exam || !exam.questions) {
    return (
      <div className="bg-[#FFF9EF] p-6 rounded-xl shadow-md text-[#665446] text-center font-bold">
        لا يوجد اختبار لهذه المحاضرة حاليًا.
      </div>
    );
  }

  let questions = [];
  try {
    questions = JSON.parse(exam.questions);
  } catch (err) {
    questions = [];
  }

  if (!questions.length) {
    return (
      <div className="bg-[#FFF9EF] p-6 rounded-xl shadow-md text-[#665446] text-center font-bold">
        صيغة الأسئلة غير صحيحة أو لا توجد أسئلة.
      </div>
    );
  }

  const handleChange = (i, choice) => {
    setAnswers((prev) => ({ ...prev, [i]: choice }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setProcessing(true);
    
    try {
      // حساب النتيجة
      const correct = questions.reduce(
        (cnt, q, i) => (answers[i] === q.answer ? cnt + 1 : cnt),
        0
      );
      const percentage = (correct / questions.length) * 100;
      setScore(percentage);
      setSubmitted(true);

      // الحصول على بيانات المستخدم
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user?.id) {
        console.error('Error getting user:', userError);
        setProcessing(false);
        return;
      }

      const authId = userData.user.id;

      // الحصول على student_id من جدول students
      const { data: studentRecord, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('auth_id', authId)
        .maybeSingle();

      if (studentError || !studentRecord) {
        console.error('Error getting student record:', studentError);
        setProcessing(false);
        return;
      }

      const studentIntId = studentRecord.id;

      // حفظ نتيجة الامتحان في جدول student_lessons (يستخدم integer student_id)
      const { error: lessonError } = await supabase
        .from('student_lessons')
        .upsert(
          [{
            student_id: studentIntId, // ✅ هنا نستخدم integer student_id
            lesson_id: parseInt(lessonId),
            passed: percentage >= exam.passing_score,
            score: percentage
          }],
          { onConflict: ['student_id', 'lesson_id'] }
        );

      if (lessonError) {
        console.error('Error saving lesson progress:', lessonError);
      }

      // إذا نجح الطالب، فتح المحاضرة التالية
      if (percentage >= exam.passing_score) {
        // الحصول على course_id للمحاضرة الحالية
        const { data: lessonData, error: lessonFetchError } = await supabase
          .from('lessons')
          .select('course_id')
          .eq('id', lessonId)
          .single();

        if (lessonFetchError || !lessonData) {
          console.error('Error getting lesson data:', lessonFetchError);
          setProcessing(false);
          return;
        }

        // الحصول على قائمة جميع المحاضرات في الدورة مرتبة
        const { data: allLessons, error: lessonsError } = await supabase
          .from('lessons')
          .select('id, title')
          .eq('course_id', lessonData.course_id)
          .order('id', { ascending: true });

        if (lessonsError || !allLessons) {
          console.error('Error getting lessons list:', lessonsError);
          setProcessing(false);
          return;
        }

        // العثور على المحاضرة التالية
        const currentIndex = allLessons.findIndex((l) => l.id === parseInt(lessonId));
        const nextLesson = allLessons[currentIndex + 1];

        if (nextLesson) {
          // فتح المحاضرة التالية للطالب - استخدام authId لأن الجدول يتوقع UUID
          const { error: accessError } = await supabase
            .from('student_lesson_access')
            .upsert(
              [{
                student_id: authId, // ✅ صحيح: الجدول يتوقع UUID (auth_id) مش integer
                lesson_id: nextLesson.id,
                is_open: true
              }],
              { onConflict: ['student_id', 'lesson_id'] }
            );

          if (accessError) {
            console.error('Error granting access to next lesson:', accessError);
          } else {
            console.log(`Access granted to lesson ${nextLesson.id}: ${nextLesson.title}`);
            
            // التنقل إلى المحاضرة التالية مع الهاش
            setTimeout(() => {
              window.location.href = `${window.location.origin}/#/lesson/${nextLesson.id}`;
            }, 3000);
          }
        } else {
          console.log('This is the last lesson in the course');
        }
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-[#FFF9EF] p-6 rounded-xl shadow-md">
      {!submitted ? (
        <>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[#665446] font-bold text-lg">
                السؤال {currentQuestion + 1} من {questions.length}
              </h3>
              <div className="text-sm text-[#665446]">
                النجاح: {exam.passing_score}%
              </div>
            </div>
            <div className="w-full bg-[#CDC0B6] rounded-full h-2 mb-4">
              <div 
                className="bg-[#665446] h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <h4 className="text-[#665446] font-semibold text-lg mb-4">
            {questions[currentQuestion].question}
          </h4>
          
          <div className="space-y-3 mb-6">
            {questions[currentQuestion].choices.map((choice, i) => (
              <label
                key={i}
                className="flex items-center space-x-3 space-x-reverse cursor-pointer text-[#665446] p-3 rounded-lg hover:bg-[#CDC0B6] transition-colors"
              >
                <input
                  type="radio"
                  name={`q${currentQuestion}`}
                  value={choice}
                  checked={answers[currentQuestion] === choice}
                  onChange={() => handleChange(currentQuestion, choice)}
                  className="accent-[#665446] scale-125"
                />
                <span className="flex-1">{choice}</span>
              </label>
            ))}
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-2 bg-[#CDC0B6] text-[#665446] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#B8AB9F] transition-colors"
            >
              السابق
            </button>
            
            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!answers[currentQuestion]}
                className="px-6 py-2 bg-[#665446] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#554437] transition-colors"
              >
                التالي
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={processing || !answers[currentQuestion]}
                className="px-6 py-2 bg-[#665446] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#554437] transition-colors"
              >
                {processing ? 'جاري المعالجة...' : 'إرسال الإجابات'}
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="text-center">
          <div className="mb-6">
            <div className={`text-6xl mb-4 ${score >= exam.passing_score ? 'text-green-500' : 'text-red-500'}`}>
              {score >= exam.passing_score ? '🎉' : '😔'}
            </div>
            <h3 className="text-2xl font-bold text-[#665446] mb-2">
              نتيجتك: {Math.round(score)}%
            </h3>
            <p className={`text-lg font-semibold ${score >= exam.passing_score ? 'text-green-600' : 'text-red-600'}`}>
              {score >= exam.passing_score ? '✅ مبروك! لقد نجحت في الامتحان' : '❌ للأسف لم تنجح في الامتحان'}
            </p>
          </div>
          
          {score >= exam.passing_score ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-700 font-medium">
                🚀 تم فتح المحاضرة التالية! سيتم توجيهك إليها خلال ثوان...
              </p>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700 font-medium">
                يمكنك إعادة المحاولة لاحقاً. الدرجة المطلوبة للنجاح: {exam.passing_score}%
              </p>
            </div>
          )}
          
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[#665446] text-white rounded-xl hover:bg-[#554437] transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      )}
    </div>
  );
};

export default ExamForm;