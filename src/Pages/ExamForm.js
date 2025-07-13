import React, { useState } from 'react';
import { supabase } from '../Utilities/supabaseClient';
import { useNavigate } from 'react-router-dom';

const ExamForm = ({ exam, lessonId }) => {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const navigate = useNavigate();

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
    const correct = questions.reduce(
      (cnt, q, i) => (answers[i] === q.answer ? cnt + 1 : cnt),
      0
    );
    const percentage = (correct / questions.length) * 100;
    setScore(percentage);
    setSubmitted(true);

    if (percentage < exam.passing_score) return;

    const { data: userData } = await supabase.auth.getUser();
    const authId = userData?.user?.id;

    const { data: studentRecord, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('auth_id', authId)
      .maybeSingle();

    if (studentError || !studentRecord) return;

    const studentIntId = studentRecord.id;

    await supabase
      .from('student_lessons')
      .upsert(
        [{ student_id: studentIntId, lesson_id: lessonId, passed: true }],
        { onConflict: ['student_id', 'lesson_id'] }
      );

    const { data: lessonData } = await supabase
      .from('lessons')
      .select('course_id')
      .eq('id', lessonId)
      .single();

    const { data: listLessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', lessonData.course_id)
      .order('id', { ascending: true });

    const idx = listLessons.findIndex((l) => l.id === lessonId);
    const next = listLessons[idx + 1];

    if (next) {
      await supabase
        .from('student_lesson_access')
        .upsert(
          [{ student_id: authId, lesson_id: next.id, is_open: true }],
          { onConflict: ['student_id', 'lesson_id'] }
        );

      const checkSaved = async () => {
        const { data: progress } = await supabase
          .from('student_lessons')
          .select('passed')
          .eq('lesson_id', lessonId)
          .eq('student_id', studentIntId)
          .maybeSingle();

        if (progress?.passed) {
          navigate(`/lesson/${next.id}`);
        } else {
          setTimeout(checkSaved, 1000);
        }
      };
      checkSaved();
    }
  };

  return (
    <div className="bg-[#FFF9EF] p-6 rounded-xl shadow-md">
      {!submitted ? (
        <>
          <h3 className="text-[#665446] font-bold text-lg mb-4">
            {currentQuestion + 1}. {questions[currentQuestion].question}
          </h3>
          <div className="space-y-2 mb-6">
            {questions[currentQuestion].choices.map((choice, i) => (
              <label
                key={i}
                className="flex items-center space-x-2 cursor-pointer text-[#665446]"
              >
                <input
                  type="radio"
                  name={`q${currentQuestion}`}
                  value={choice}
                  checked={answers[currentQuestion] === choice}
                  onChange={() => handleChange(currentQuestion, choice)}
                  className="accent-[#665446]"
                />
                <span>{choice}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-4 py-2 bg-[#CDC0B6] text-[#665446] rounded-xl disabled:opacity-50"
            >
              السابق
            </button>
            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-[#665446] text-white rounded-xl"
              >
                التالي
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-[#665446] text-white rounded-xl"
              >
                إرسال الإجابات
              </button>
            )}
          </div>
        </>
      ) : (
        <p className="text-center text-xl font-bold text-[#665446] mt-6">
          نتيجتك: {Math.round(score)}%{' '}
          {score >= exam.passing_score ? '✅ ناجح' : '❌ راسب'}
        </p>
      )}
    </div>
  );
};

export default ExamForm;
