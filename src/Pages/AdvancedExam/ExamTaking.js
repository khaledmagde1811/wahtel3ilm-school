import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../Utilities/supabaseClient';
import { toast } from 'react-toastify';

const ExamTaking = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [attemptId, setAttemptId] = useState(null);

  useEffect(() => {
    loadExam();
  }, [examId]);

  useEffect(() => {
    if (timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const loadExam = async () => {
    try {
      // تحميل بيانات الاختبار
      const { data: examData, error: examError } = await supabase
        .from('advanced_exams')
        .select('*')
        .eq('id', examId)
        .single();

      if (examError) throw examError;

      // التحقق من إمكانية بدء الاختبار
      const now = new Date();
      if (examData.start_date && new Date(examData.start_date) > now) {
        toast.error('لم يبدأ وقت الاختبار بعد');
        navigate('/exams');
        return;
      }
      if (examData.end_date && new Date(examData.end_date) < now) {
        toast.error('انتهى وقت الاختبار');
        navigate('/exams');
        return;
      }

      // تحميل الأسئلة
      let { data: questionsData, error: questionsError } = await supabase
        .from('exam_questions')
        .select('*')
        .eq('exam_id', examId)
        .order('question_order', { ascending: true });

      if (questionsError) throw questionsError;

      // خلط الأسئلة إذا كان مطلوباً
      if (examData.shuffle_questions) {
        questionsData = questionsData.sort(() => Math.random() - 0.5);
      }

      // خلط الإجابات للأسئلة متعددة الاختيارات
      if (examData.shuffle_answers) {
        questionsData = questionsData.map(q => {
          if (q.question_type === 'multiple_choice' && q.options) {
            const options = JSON.parse(q.options);
            const correctAnswer = q.correct_answer;
            const shuffledOptions = options.sort(() => Math.random() - 0.5);
            return {
              ...q,
              options: JSON.stringify(shuffledOptions),
              correct_answer: correctAnswer
            };
          }
          return q;
        });
      }

      // إنشاء محاولة جديدة
      const user = supabase.auth.user();
      const { data: attemptData, error: attemptError } = await supabase
        .from('exam_attempts')
        .insert([{
          exam_id: examId,
          student_id: user.id,
          student_name: user.user_metadata?.full_name || user.email,
          total_marks: examData.total_marks
        }])
        .single();

      if (attemptError) throw attemptError;

      setExam(examData);
      setQuestions(questionsData);
      setTimeLeft(examData.duration_minutes * 60);
      setAttemptId(attemptData.id);
      setLoading(false);
    } catch (error) {
      toast.error(error.message);
      navigate('/exams');
    }
  };

  const handleAnswerChange = async (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));

    try {
      // حفظ الإجابة مباشرة في قاعدة البيانات
      const question = questions.find(q => q.id === questionId);
      const { error } = await supabase
        .from('student_answers')
        .upsert({
          attempt_id: attemptId,
          question_id: questionId,
          student_answer: answer,
          max_marks: question.max_marks
        });

      if (error) throw error;
    } catch (error) {
      toast.error('حدث خطأ في حفظ الإجابة');
    }
  };

  const submitExam = async () => {
    try {
      const { error } = await supabase
        .from('exam_attempts')
        .update({
          submitted_at: new Date().toISOString(),
          status: 'submitted',
          time_taken_minutes: Math.ceil((exam.duration_minutes * 60 - timeLeft) / 60)
        })
        .eq('id', attemptId);

      if (error) throw error;

      toast.success('تم تسليم الاختبار بنجاح');
      navigate(`/exam-result/${attemptId}`);
    } catch (error) {
      toast.error('حدث خطأ في تسليم الاختبار');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">جاري تحميل الاختبار...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* رأس الاختبار */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold text-[#665446] mb-4">{exam.title}</h1>
        <div className="flex justify-between items-center">
          <div className="text-lg">
            الدرجة الكلية: {exam.total_marks}
          </div>
          <div className="text-xl font-bold">
            الوقت المتبقي: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* الأسئلة */}
      <div className="space-y-6">
        {questions.map((question, index) => (
          <div key={question.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">السؤال {index + 1}</h2>
              <span>{question.max_marks} درجة</span>
            </div>

            <div className="mb-4">
              <p className="text-lg mb-4">{question.question_text}</p>

              {question.question_type === 'multiple_choice' && (
                <div className="space-y-2">
                  {JSON.parse(question.options).map((option, i) => (
                    <label key={i} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name={`question_${question.id}`}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="form-radio"
                      />
                      <span className="mr-2">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.question_type === 'true_false' && (
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`question_${question.id}`}
                      value="true"
                      checked={answers[question.id] === 'true'}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="form-radio"
                    />
                    <span className="mr-2">صح</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`question_${question.id}`}
                      value="false"
                      checked={answers[question.id] === 'false'}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="form-radio"
                    />
                    <span className="mr-2">خطأ</span>
                  </label>
                </div>
              )}

              {question.question_type === 'correct_underlined' && (
                <input
                  type="text"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="اكتب الإجابة الصحيحة هنا"
                />
              )}

              {question.question_type === 'essay' && (
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full p-2 border rounded"
                  rows="6"
                  placeholder="اكتب إجابتك هنا"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* زر التسليم */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4">
        <div className="max-w-4xl mx-auto flex justify-end">
          <button
            onClick={submitExam}
            className="px-6 py-3 bg-[#665446] text-white rounded-lg font-semibold hover:bg-[#554437]"
          >
            تسليم الاختبار
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamTaking;