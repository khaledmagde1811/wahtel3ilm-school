import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../Utilities/supabaseClient';
import { toast } from 'react-toastify';

const ExamResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    loadResults();
  }, [attemptId]);

  const loadResults = async () => {
    try {
      // تحميل بيانات المحاولة
      const { data: attemptData, error: attemptError } = await supabase
        .from('exam_attempts')
        .select(`
          *,
          exam:exam_id (
            title,
            description,
            total_marks,
            passing_score,
            allow_review
          )
        `)
        .eq('id', attemptId)
        .single();

      if (attemptError) throw attemptError;

      // تحميل الأسئلة والإجابات
      const { data: answersData, error: answersError } = await supabase
        .from('student_answers')
        .select(`
          *,
          question:question_id (
            question_text,
            question_type,
            correct_answer,
            options,
            max_marks,
            explanation
          )
        `)
        .eq('attempt_id', attemptId);

      if (answersError) throw answersError;

      // تحميل التحليل
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('student_error_analytics')
        .select('*')
        .eq('attempt_id', attemptId);

      if (analyticsError) throw analyticsError;

      setResult({
        ...attemptData,
        analytics: analyticsData
      });
      setAnswers(answersData);
      setLoading(false);
    } catch (error) {
      toast.error('حدث خطأ في تحميل النتيجة');
      navigate('/exams');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">جاري تحميل النتيجة...</div>
      </div>
    );
  }

  const isPassed = result.total_score >= result.exam.passing_score;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* ملخص النتيجة */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold text-[#665446] mb-4">{result.exam.title}</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600">الدرجة الكلية</div>
            <div className="text-2xl font-bold">{result.total_score}/{result.exam.total_marks}</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600">النسبة المئوية</div>
            <div className="text-2xl font-bold">{result.percentage}%</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600">الحالة</div>
            <div className={`text-2xl font-bold ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
              {isPassed ? 'ناجح' : 'راسب'}
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600">الوقت المستغرق</div>
            <div className="text-2xl font-bold">{result.time_taken_minutes} دقيقة</div>
          </div>
        </div>
      </div>

      {/* تحليل الأخطاء */}
      {result.analytics && result.analytics.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-[#665446] mb-4">تحليل الأخطاء</h2>
          
          <div className="space-y-4">
            {result.analytics.map((error, index) => (
              <div key={index} className="border-r-4 border-red-500 bg-red-50 p-4">
                <div className="font-semibold">السؤال {index + 1}</div>
                <div className="text-sm text-gray-600 mt-1">نوع الخطأ: {error.error_type}</div>
                <div className="mt-2">
                  <div>إجابتك: {error.student_answer}</div>
                  <div className="text-green-600">الإجابة الصحيحة: {error.correct_answer}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* تفاصيل الإجابات */}
      {result.exam.allow_review && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[#665446]">تفاصيل الإجابات</h2>
          
          {answers.map((answer, index) => (
            <div key={answer.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between mb-4">
                <h3 className="font-semibold">السؤال {index + 1}</h3>
                <div className="text-sm">
                  {answer.marks_obtained}/{answer.question.max_marks} درجة
                </div>
              </div>

              <div className="space-y-4">
                <p>{answer.question.question_text}</p>

                <div className="bg-gray-50 p-4 rounded">
                  <div className="text-sm text-gray-600">إجابتك:</div>
                  <div className="mt-1">{answer.student_answer}</div>
                </div>

                <div className="bg-green-50 p-4 rounded">
                  <div className="text-sm text-green-600">الإجابة الصحيحة:</div>
                  <div className="mt-1">{answer.question.correct_answer}</div>
                </div>

                {answer.question.explanation && (
                  <div className="bg-blue-50 p-4 rounded">
                    <div className="text-sm text-blue-600">الشرح:</div>
                    <div className="mt-1">{answer.question.explanation}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* زر العودة */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => navigate('/exams')}
          className="px-6 py-3 bg-[#665446] text-white rounded-lg font-semibold hover:bg-[#554437]"
        >
          العودة إلى قائمة الاختبارات
        </button>
      </div>
    </div>
  );
};

export default ExamResult;