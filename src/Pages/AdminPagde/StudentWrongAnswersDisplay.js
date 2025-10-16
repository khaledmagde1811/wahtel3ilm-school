import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, AlertCircle, CheckCircle, XCircle, User, Calendar, BookOpen, TrendingDown, RefreshCw, Filter, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';

import { supabase } from '../../Utilities/supabaseClient';

const StudentWrongAnswersDisplay = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('wrong_answers'); // wrong_answers, attempts, score
  const [filterMinWrong, setFilterMinWrong] = useState(0);

  useEffect(() => {
    fetchStudentsWithWrongAnswers();
  }, []);

const fetchStudentsWithWrongAnswers = async () => {
  try {
    setLoading(true);
    setError(null);

    // 1) محاولات Submitted فقط
    const { data: attempts, error: attemptsError } = await supabase
      .from('exam_attempts')
      .select('id, student_id, student_name, exam_id, score, total_marks, percentage, submitted_at')
      .eq('status', 'submitted')
      .order('submitted_at', { ascending: false });

    if (attemptsError) throw attemptsError;
    if (!attempts?.length) {
      setStudents([]);
      setLoading(false);
      return;
    }

    // IDs المحاولات عشان نفلتر بيها الإجابات
    const attemptIds = attempts.map(a => a.id);

    // 2) إجابات خاطئة للمحاولات دي فقط
    const { data: answers, error: answersError } = await supabase
      .from('exam_answers')
      .select('id, attempt_id, question_id, selected_answer, is_correct, answered_at')
      .in('attempt_id', attemptIds)
      .eq('is_correct', false);

    if (answersError) throw answersError;

    // 3) الأسئلة المرتبطة بس
    const questionIds = [...new Set((answers || []).map(a => a.question_id))];
    let questions = [];
    if (questionIds.length) {
      const { data: questionsData, error: questionsError } = await supabase
        .from('exam_questions')
        .select('id, question_text, correct_answer, exam_id, option_a, option_b, option_c, option_d')
        .in('id', questionIds);
      if (questionsError) throw questionsError;
      questions = questionsData || [];
    }

    // 4) بيانات الاختبارات (monthly_exams -> fallback إلى exams لو فاضي)
    const examIds = [...new Set(attempts.map(a => a.exam_id))];
    let exams = [];
    if (examIds.length) {
      let { data: examsData, error: examsError } = await supabase
        .from('monthly_exams')
        .select('id, title, subject, month')
        .in('id', examIds);
      if (examsError) throw examsError;
      exams = examsData || [];
      if (!exams.length) {
        // fallback للجدول العام لو عندك
        const { data: fallbackExams } = await supabase
          .from('exams')
          .select('id, title, subject, month')
          .in('id', examIds);
        exams = fallbackExams || [];
      }
    }

    // 5) تجميع ذكي
    const questionsMap = new Map(questions.map(q => [q.id, q]));
    const examsMap = new Map(exams.map(e => [e.id, e]));
    const answersByAttempt = (answers || []).reduce((acc, a) => {
      (acc[a.attempt_id] ||= []).push(a);
      return acc;
    }, {});

    const studentsMap = new Map();

    attempts.forEach(attempt => {
      const wrong = (answersByAttempt[attempt.id] || [])
        .sort((a, b) => new Date(a.answered_at) - new Date(b.answered_at));

      const wrongWithDetails = wrong.map(ans => {
        const q = questionsMap.get(ans.question_id);
        return {
          ...ans,
          question_text: q?.question_text || 'السؤال غير متوفر',
          correct_answer: q?.correct_answer || 'غير متوفر',
          option_a: q?.option_a,
          option_b: q?.option_b,
          option_c: q?.option_c,
          option_d: q?.option_d,
        };
      });

      if (!studentsMap.has(attempt.student_id)) {
        studentsMap.set(attempt.student_id, {
          student_id: attempt.student_id,
          student_name: attempt.student_name || 'طالب غير معروف',
          attempts: [],
        });
      }

      const examInfo = examsMap.get(attempt.exam_id);

      studentsMap.get(attempt.student_id).attempts.push({
        attempt_id: attempt.id,
        exam_id: attempt.exam_id,
        exam_title: examInfo?.title || 'اختبار غير معروف',
        exam_subject: examInfo?.subject || '',
        exam_month: examInfo?.month || '',
        score: attempt.score ?? 0,
        total_marks: attempt.total_marks ?? 100,
        percentage: attempt.percentage ?? 0,
        submitted_at: attempt.submitted_at,
        wrong_answers: wrongWithDetails,
        wrong_count: wrongWithDetails.length,
      });
    });

    const studentsArray = Array.from(studentsMap.values()).map(student => {
      const totalWrong = student.attempts.reduce((sum, att) => sum + att.wrong_count, 0);
      const totalAttempts = student.attempts.length;
      const avgScore = totalAttempts
        ? student.attempts.reduce((sum, att) => sum + (att.percentage || 0), 0) / totalAttempts
        : 0;

      return {
        ...student,
        total_wrong_answers: totalWrong,
        total_attempts: totalAttempts,
        average_score: avgScore,
      };
    });

    setStudents(studentsArray);
    setLoading(false);
  } catch (err) {
    console.error('Error fetching data:', err);
    setError(err.message || 'حدث خطأ غير متوقع');
    setLoading(false);
  }
};

  const cardRefs = useRef({});

  // Memoized filtering and sorting
  const processedStudents = useMemo(() => {
    let filtered = students.filter(student =>
      student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      student.total_wrong_answers >= filterMinWrong
    );

    // الترتيب
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'wrong_answers':
          return b.total_wrong_answers - a.total_wrong_answers;
        case 'attempts':
          return b.total_attempts - a.total_attempts;
        case 'score':
          return a.average_score - b.average_score;
        case 'name':
          return a.student_name.localeCompare(b.student_name, 'ar');
        default:
          return 0;
      }
    });

    return filtered;
  }, [students, searchTerm, sortBy, filterMinWrong]);

  const getScoreColor = (percentage) => {
    if (percentage >= 85) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (percentage) => {
    if (percentage >= 85) return 'bg-green-50 border-green-200';
    if (percentage >= 70) return 'bg-blue-50 border-blue-200';
    if (percentage >= 50) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getAnswerText = (answerLetter, questionData) => {
    if (answerLetter === 'TRUE') return 'صح ✓';
    if (answerLetter === 'FALSE') return 'خطأ ✗';
    
    const answerMap = {
      'A': questionData?.option_a,
      'B': questionData?.option_b,
      'C': questionData?.option_c,
      'D': questionData?.option_d
    };
    
    return answerMap[answerLetter] || answerLetter;
  };

  const totalStats = useMemo(() => ({
    totalStudents: students.length,
    totalAttempts: students.reduce((sum, s) => sum + s.total_attempts, 0),
    totalWrong: students.reduce((sum, s) => sum + s.total_wrong_answers, 0),
    avgScore: students.length > 0 
      ? (students.reduce((sum, s) => sum + s.average_score, 0) / students.length).toFixed(1)
      : 0
  }), [students]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">حدث خطأ</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchStudentsWithWrongAnswers}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={18} />
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }
const downloadStudentPDF = async (student) => {
  try {
    const element = cardRefs.current[student.student_id];
    if (!element) return;

    const opt = {
      margin: [10, 10, 10, 10],                 // mm
      filename: `${student.student_name?.replace(/\s+/g, '_') || 'student'}_اخطاء.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }   // يمنع تقطيع غير لطيف
    };

    // هنستخدم الكارت الظاهر حاليًا (لازم تكون فاتح الطالب)
    await html2pdf().set(opt).from(element).save();
  } catch (e) {
    console.error('PDF error:', e);
    alert('تعذّر إنشاء ملف الـ PDF. حاول مرة أخرى.');
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <TrendingDown className="text-red-600" size={32} />
                <h1 className="text-3xl font-bold text-gray-800">
                  تحليل الإجابات الخاطئة
                </h1>
              </div>
              <p className="text-gray-600">
                عرض تفصيلي لأخطاء كل طالب في الاختبارات الشهرية
              </p>
            </div>
            <button
              onClick={fetchStudentsWithWrongAnswers}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              تحديث
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-3">
              <User className="text-blue-600" size={24} />
              <div>
                <div className="text-2xl font-bold text-gray-800">{totalStats.totalStudents}</div>
                <div className="text-sm text-gray-600">إجمالي الطلاب</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="text-green-600" size={24} />
              <div>
                <div className="text-2xl font-bold text-gray-800">{totalStats.totalAttempts}</div>
                <div className="text-sm text-gray-600">إجمالي المحاولات</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-3">
              <XCircle className="text-red-600" size={24} />
              <div>
                <div className="text-2xl font-bold text-gray-800">{totalStats.totalWrong}</div>
                <div className="text-sm text-gray-600">إجمالي الأخطاء</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-600" size={24} />
              <div>
                <div className="text-2xl font-bold text-gray-800">{totalStats.avgScore}%</div>
                <div className="text-sm text-gray-600">متوسط الدرجات</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="ابحث عن طالب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute right-3 top-3 text-gray-400" size={20} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none bg-white"
              >
                <option value="wrong_answers">الأكثر أخطاءً</option>
                <option value="attempts">الأكثر محاولات</option>
                <option value="score">الأقل درجات</option>
                <option value="name">الترتيب الأبجدي</option>
              </select>
            </div>

            <div>
              <input
                type="number"
                min="0"
                placeholder="الحد الأدنى للأخطاء"
                value={filterMinWrong}
                onChange={(e) => setFilterMinWrong(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="space-y-4">
          {processedStudents.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 text-lg">
                {searchTerm || filterMinWrong > 0 ? 'لا توجد نتائج تطابق البحث' : 'لا توجد بيانات متاحة'}
              </p>
            </div>
          ) : (
            processedStudents.map((student) => (
              <div
                key={student.student_id}
                  ref={(el) => (cardRefs.current[student.student_id] = el)}

                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow"
              >
                {/* Student Header */}
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() =>
                    setSelectedStudent(
                      selectedStudent?.student_id === student.student_id
                        ? null
                        : student
                    )
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {student.student_name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {student.total_attempts} محاولة • متوسط الدرجة: {student.average_score.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-red-600">
                        {student.total_wrong_answers}
                      </div>
                      <div className="text-sm text-gray-600">إجابة خاطئة</div>
                    </div>
                  </div>
                </div>

                {/* Attempts Details */}
               {selectedStudent?.student_id === student.student_id && (
  <div className="border-t border-gray-200 bg-gray-50 p-6">
    <div className="flex items-center justify-between mb-4">
      <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2 m-0">
        <BookOpen size={20} />
        تفاصيل المحاولات والأخطاء
      </h4>

      <button
        onClick={(e) => { e.stopPropagation(); downloadStudentPDF(student); }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        <Download size={18} />
        تنزيل PDF
      </button>
    </div>
                    <div className="space-y-4">
                      {student.attempts.map((attempt) => (
                        <div
                          key={attempt.attempt_id}
                          className={`p-4 rounded-lg border-2 ${getScoreBg(attempt.percentage)}`}
                        >
                          {/* Attempt Header */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h5 className="font-bold text-gray-800 text-lg">
                                  {attempt.exam_title}
                                </h5>
                                <p className="text-sm text-gray-600">
                                  {attempt.exam_subject} • {attempt.exam_month}
                                </p>
                              </div>
                              <div className="text-center">
                                <div className={`text-3xl font-bold ${getScoreColor(attempt.percentage)}`}>
                                  {attempt.percentage.toFixed(1)}%
                                </div>
                                <div className="text-xs text-gray-600">
                                  {attempt.score}/{attempt.total_marks}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar size={14} />
                              <span>
                                {new Date(attempt.submitted_at).toLocaleDateString('ar-EG', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Wrong Answers */}
                          {attempt.wrong_count > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-300">
                              <h6 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <XCircle className="text-red-600" size={20} />
                                الإجابات الخاطئة ({attempt.wrong_count})
                              </h6>
                              <div className="space-y-3">
                                {attempt.wrong_answers.map((answer, idx) => (
                                  <div
                                    key={answer.id}
                                    className="bg-white p-4 rounded-lg border-2 border-red-200"
                                        style={{ breakInside: 'avoid' }}

                                  >
                                    <div className="flex items-start gap-2 mb-3">
                                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">
                                        {idx + 1}
                                      </span>
                                      <p className="font-medium text-gray-800 flex-1">
                                        {answer.question_text}
                                      </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <div className="bg-red-50 p-3 rounded">
                                        <span className="text-red-700 font-semibold text-sm">
                                          ❌ إجابة الطالب:
                                        </span>
                                        <p className="text-gray-800 mt-1 font-medium">
                                          {getAnswerText(answer.selected_answer, answer) || 'لم يجب'}
                                        </p>
                                      </div>
                                      <div className="bg-green-50 p-3 rounded">
                                        <span className="text-green-700 font-semibold text-sm">
                                          ✓ الإجابة الصحيحة:
                                        </span>
                                        <p className="text-gray-800 mt-1 font-medium">
                                          {getAnswerText(answer.correct_answer, answer)}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Perfect Score */}
                          {attempt.wrong_count === 0 && (
                            <div className="mt-4 pt-4 border-t border-green-300 text-center">
                              <CheckCircle className="mx-auto text-green-600 mb-2" size={32} />
                              <p className="text-green-700 font-semibold text-lg">
                                جميع الإجابات صحيحة! 🎉
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentWrongAnswersDisplay;