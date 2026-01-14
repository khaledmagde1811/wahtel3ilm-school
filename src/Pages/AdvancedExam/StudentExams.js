// src/Pages/StudentExams.js
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../Utilities/supabaseClient';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../../Utilities/AnimatedBackground';
import {
  FileText, Clock, Calendar, CheckCircle, XCircle, Search, 
  ChevronLeft, ChevronRight, X, Award
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TEXT_COLOR = '#806445';
const DEFAULT_DURATION_MIN = 60;
const RESULT_VISIBILITY_HOURS = 2;

const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  TRUE_FALSE: 'true_false',
  CORRECT_UNDERLINED: 'correct_underlined',
  ESSAY: 'essay'
};

const ENGLISH_OPTIONS = ['A', 'B', 'C', 'D'];
const OPTION_DISPLAY = { 'A': 'أ', 'B': 'ب', 'C': 'ج', 'D': 'د' };
const OPTION_TO_ENGLISH = { 'أ': 'A', 'ب': 'B', 'ج': 'C', 'د': 'D' };

const StudentExams = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [takingExam, setTakingExam] = useState(null);
  const [takingAnswers, setTakingAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const certRef = useRef(null);
  const [isCertGenerating, setIsCertGenerating] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [studentAttempts, setStudentAttempts] = useState({});
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('');

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchExams();
    }
  }, [currentUser]);

  useEffect(() => {
    filterAndPaginateExams();
  }, [exams, searchTerm, filterMonth, filterSubject, activeTab, currentPage, selectedLevel]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (currentUser && !selectedLevel) {
      setShowLevelSelector(true);
    }
  }, [currentUser, selectedLevel]);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setCurrentUser(user);
      const { data: userData, error } = await supabase
        .from('students')
        .select('first_name, last_name')
        .eq('auth_id', user.id)
        .single();

      if (!error && userData) {
        setUserName(`${userData.first_name} ${userData.last_name}`);
      }
    } catch (error) {
      console.error('خطأ في جلب بيانات المستخدم:', error);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExams = async () => {
    try {
      const { data: examsData, error: examsError } = await supabase
        .from('monthly_exams')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (examsError) throw examsError;

      const examsList = examsData || [];
      const examIds = examsList.map(e => e.id).filter(Boolean);

      if (examIds.length && currentUser) {
        const { data: myAttempts, error: myErr } = await supabase
          .from('exam_attempts')
          .select('*')
          .eq('student_id', currentUser.id)
          .in('exam_id', examIds)
          .eq('status', 'submitted');

        if (!myErr && myAttempts) {
          const attemptsMap = {};
          myAttempts.forEach(att => {
            attemptsMap[att.exam_id] = att;
          });
          setStudentAttempts(attemptsMap);
        }
      }

      setExams(examsList);
    } catch (error) {
      console.error('خطأ في جلب الامتحانات:', error);
      toast.error('فشل جلب الامتحانات');
    }
  };

  const canViewResult = (attempt) => {
    if (!attempt || !attempt.submitted_at) return false;
    const submittedTime = new Date(attempt.submitted_at).getTime();
    const currentTime = new Date().getTime();
    const hoursPassed = (currentTime - submittedTime) / (1000 * 60 * 60);
    return hoursPassed >= RESULT_VISIBILITY_HOURS;
  };

  const getTimeUntilResultAvailable = (attempt) => {
    if (!attempt || !attempt.submitted_at) return '';
    const submittedTime = new Date(attempt.submitted_at).getTime();
    const currentTime = new Date().getTime();
    const hoursNeeded = RESULT_VISIBILITY_HOURS * 60 * 60 * 1000;
    const timeRemaining = (submittedTime + hoursNeeded) - currentTime;

    if (timeRemaining <= 0) return '';

    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours} ساعة و ${minutes} دقيقة`;
    }
    return `${minutes} دقيقة`;
  };

  const filterAndPaginateExams = () => {
    let filtered = exams;

    if (searchTerm) {
      filtered = filtered.filter(exam =>
        exam.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.subject?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterMonth) {
      filtered = filtered.filter(exam => exam.month === filterMonth);
    }

    if (filterSubject) {
      filtered = filtered.filter(exam => exam.subject === filterSubject);
    }

    if (activeTab !== 'all') {
      if (activeTab === 'level1') {
        filtered = filtered.filter(exam =>
          exam.level_scope === 'level1' || exam.level_scope === 'shared'
        );
      } else if (activeTab === 'level2') {
        filtered = filtered.filter(exam =>
          exam.level_scope === 'level2' || exam.level_scope === 'shared'
        );
      }
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);
    setFilteredExams(paginated);
  };

  const normalizeQuestionForDisplay = (dbQuestion) => {
    const baseQuestion = {
      id: dbQuestion.id,
      question_text: dbQuestion.question_text,
      question_type: dbQuestion.question_type || QUESTION_TYPES.MULTIPLE_CHOICE,
      max_marks: Number(dbQuestion.max_marks || 1),
      explanation: dbQuestion.explanation,
      image_url: dbQuestion.image_url,
      correct_answer: dbQuestion.correct_answer,
      question_order: dbQuestion.question_order || 0
    };

    switch (dbQuestion.question_type) {
      case QUESTION_TYPES.TRUE_FALSE:
        return {
          ...baseQuestion,
          options: ['TRUE', 'FALSE']
        };

      case QUESTION_TYPES.MULTIPLE_CHOICE: {
        const option_a = dbQuestion.option_a || '';
        const option_b = dbQuestion.option_b || '';
        const option_c = dbQuestion.option_c || '';
        const option_d = dbQuestion.option_d || '';

        return {
          ...baseQuestion,
          option_a,
          option_b,
          option_c,
          option_d,
          options: [option_a, option_b, option_c, option_d]
        };
      }

      case QUESTION_TYPES.ESSAY:
        return {
          ...baseQuestion,
          model_answer: dbQuestion.model_answer,
          grading_rubric: dbQuestion.grading_rubric
        };

      case QUESTION_TYPES.CORRECT_UNDERLINED:
        return {
          ...baseQuestion,
          option_a: dbQuestion.option_a,
          correct_answer: dbQuestion.correct_answer
        };

      default:
        return baseQuestion;
    }
  };

  const startExam = async (exam) => {
    if (studentAttempts[exam.id]) {
      toast.warning('لقد أنهيت هذا الامتحان بالفعل!');
      return;
    }

    try {
      const duration = exam.duration_minutes || DEFAULT_DURATION_MIN;
      const startTime = new Date().toISOString();

      const insertBody = {
        exam_id: exam.id,
        student_id: currentUser?.id,
        student_name: userName || '',
        status: 'in_progress',
        started_at: startTime,
        total_marks: exam.total_marks || 100,
        total_score: 0,
        percentage: 0
      };

      const { data: attempt, error } = await supabase
        .from('exam_attempts')
        .insert([insertBody])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error('لديك محاولة قائمة بالفعل لهذا الامتحان!');
        } else {
          throw error;
        }
        return;
      }

      const { data: qs, error: qErr } = await supabase
        .from('exam_questions')
        .select('*')
        .eq('exam_id', exam.id)
        .order('question_order', { ascending: true });

      if (qErr) throw qErr;

      if (!qs || qs.length === 0) {
        toast.error('هذا الامتحان لا يحتوي على أسئلة!');
        return;
      }

      const normalizedQuestions = qs.map(q => normalizeQuestionForDisplay(q));

      setTakingExam({
        ...attempt,
        questions: normalizedQuestions,
        title: exam.title,
        duration_minutes: duration,
        total_marks: exam.total_marks || 100
      });
      setTakingAnswers({});
      setTimeLeft(duration * 60);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            autoSubmitExam(attempt, normalizedQuestions);
            return 0;
          }
          return t - 1;
        });
      }, 1000);

      toast.success('تم بدء الامتحان بنجاح!');

      setTimeout(() => {
        const panel = document.getElementById('exam-taking-panel');
        if (panel) {
          panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

    } catch (err) {
      console.error('خطأ في بدء الامتحان:', err);
      toast.error('تعذر بدء الامتحان');
    }
  };

  const normalizeAnswer = (question, raw) => {
    if (raw === undefined || raw === null || raw === '') return null;

    const val = raw.toString().trim();
    const qtype = question.question_type;

    switch (qtype) {
      case QUESTION_TYPES.TRUE_FALSE:
        const up = val.toUpperCase();
        if (['TRUE', 'T', '1', 'صح', 'صحيح', 'نعم', 'YES', 'Y', '✅'].includes(up)) {
          return 'TRUE';
        }
        if (['FALSE', 'F', '0', 'خطأ', 'خطا', 'لا', 'NO', 'N', '❌'].includes(up)) {
          return 'FALSE';
        }
        return up;

      case QUESTION_TYPES.MULTIPLE_CHOICE:
        const answer = val.toUpperCase();
        if (ENGLISH_OPTIONS.includes(answer)) return answer;
        if (OPTION_TO_ENGLISH[val]) return OPTION_TO_ENGLISH[val];

        const options = question.options || [];
        const index = options.findIndex(opt => opt === val);
        if (index !== -1) return ENGLISH_OPTIONS[index];

        return answer;

      case QUESTION_TYPES.CORRECT_UNDERLINED:
        return val;

      case QUESTION_TYPES.ESSAY:
        return val;

      default:
        return val;
    }
  };

  const autoSubmitExam = async (attempt, questions) => {
    try {
      const answerRows = (questions || []).map(q => ({
        attempt_id: attempt.id,
        question_id: q.id,
        selected_answer: takingAnswers[q.id] || null
      }));

      if (answerRows.length) {
        const { error: insertErr } = await supabase
          .from('exam_answers')
          .insert(answerRows);

        if (insertErr) throw insertErr;
      }

      let score = 0;
      const totalMarks = Number(attempt.total_marks) || 0;

      questions.forEach(q => {
        const studentAns = normalizeAnswer(q, takingAnswers[q.id]);
        const correctAns = normalizeAnswer(q, q.correct_answer);
        const isCorrect = studentAns !== null && correctAns !== null && studentAns === correctAns;
        const questionMarks = Number(q.max_marks || 1);

        if (isCorrect) {
          score += questionMarks;
        }
      });

      const timeTaken = Math.round((new Date() - new Date(attempt.started_at)) / (1000 * 60));
      const percentage = (score / totalMarks) * 100;

      const { error: updateErr } = await supabase
        .from('exam_attempts')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          score: score,
          percentage: percentage,
          total_marks: totalMarks,
          is_graded: true,
          time_taken_minutes: timeTaken
        })
        .eq('id', attempt.id);

      if (updateErr) throw updateErr;

      setTakingExam(null);
      setTakingAnswers({});
      fetchExams();
      toast.info('انتهى الوقت — تم تسليم الامتحان تلقائياً');
    } catch (err) {
      console.error('خطأ في التسليم التلقائي:', err);
      toast.error('فشل التسليم التلقائي');
    }
  };

  const submitExamManually = async () => {
    if (!takingExam) return;

    try {
      const { data: questions, error: qErr } = await supabase
        .from('exam_questions')
        .select('*')
        .eq('exam_id', takingExam.exam_id)
        .order('question_order', { ascending: true });

      if (qErr) throw qErr;
      if (!questions || questions.length === 0) {
        throw new Error('لم يتم العثور على أسئلة للامتحان');
      }

      const { data: existingAnswers } = await supabase
        .from('exam_answers')
        .select('question_id, selected_answer')
        .eq('attempt_id', takingExam.id);

      const existingAnswersMap = new Map(
        (existingAnswers || []).map(a => [a.question_id, a.selected_answer])
      );

      const newAnswers = [];
      const answersToUpdate = [];

      questions.forEach(q => {
        const studentAnswerRaw = takingAnswers[q.id];
        if (studentAnswerRaw === undefined || studentAnswerRaw === null || studentAnswerRaw === '') return;

        const answerToStore = normalizeAnswer(q, studentAnswerRaw);
        if (!answerToStore) return;

        const existingAnswer = existingAnswersMap.get(q.id);
        if (!existingAnswer) {
          newAnswers.push({
            attempt_id: takingExam.id,
            question_id: q.id,
            selected_answer: answerToStore,
          });
        } else if (existingAnswer !== answerToStore) {
          answersToUpdate.push({
            question_id: q.id,
            attempt_id: takingExam.id,
            selected_answer: answerToStore,
          });
        }
      });

      if (newAnswers.length > 0) {
        const { error: insertErr } = await supabase
          .from('exam_answers')
          .insert(newAnswers);
        if (insertErr) throw insertErr;
      }

      if (answersToUpdate.length > 0) {
        for (const update of answersToUpdate) {
          const { error: updateErr } = await supabase
            .from('exam_answers')
            .update({ selected_answer: update.selected_answer })
            .eq('attempt_id', update.attempt_id)
            .eq('question_id', update.question_id);
          if (updateErr) throw updateErr;
        }
      }

      let score = 0;
      let totalMarks = Number(takingExam.total_marks) || 0;

      if (!totalMarks) {
        totalMarks = questions.reduce((sum, q) => sum + Number(q.max_marks || 1), 0);
      }

      questions.forEach(q => {
        const studentAns = normalizeAnswer(q, takingAnswers[q.id]);
        const correctAns = normalizeAnswer(q, q.correct_answer);
        const isCorrect = studentAns && studentAns === correctAns;
        const questionMarks = Number(q.max_marks || 1);

        if (isCorrect) {
          score += questionMarks;
        }
      });

      const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;

      const { error: updateAttemptErr } = await supabase
        .from('exam_attempts')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          score: score,
          percentage: percentage,
          total_marks: totalMarks,
          is_graded: true,
        })
        .eq('id', takingExam.id);

      if (updateAttemptErr) throw updateAttemptErr;

      if (timerRef.current) clearInterval(timerRef.current);
      setTakingExam(null);
      setTakingAnswers({});

      toast.success('✅ تم تسليم الامتحان بنجاح!');
      await fetchExams();

    } catch (err) {
      console.error('❌ خطأ في تسليم الامتحان:', err);
      toast.error('حدث خطأ أثناء تسليم الامتحان: ' + (err.message || ''));
    }
  };

  const updateTakingAnswer = (questionId, answer) => {
    setTakingAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const formatTime = (s) => {
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const handleLevelSelection = (level) => {
    setSelectedLevel(level);
    setActiveTab(level);
    setShowLevelSelector(false);
    setCurrentPage(1);
    toast.success(`تم اختيار ${level === 'level1' ? 'المستوى الأول' : 'التمهيدي'} بنجاح`);
  };

  const generateAllExamsCertificate = async () => {
    try {
      setIsCertGenerating(true);
      
      const completedAttempts = Object.entries(studentAttempts)
        .map(([examId, attempt]) => {
          const exam = exams.find(e => e.id === examId);
          if (exam && attempt.status === 'submitted') {
            return { exam, attempt };
          }
          return null;
        })
        .filter(Boolean);

      if (completedAttempts.length === 0) {
        toast.error('لا توجد امتحانات مكتملة لديك بعد.');
        return;
      }

      if (!completedAttempts.some(({ attempt }) => canViewResult(attempt))) {
        toast.info('الشهادة ستتاح بعد مرور ساعتين من تسليم أول امتحان.');
        return;
      }

      const [{ default: html2canvas }, jspdfMod, { default: QRCode }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
        import('qrcode')
      ]);
      const { jsPDF } = jspdfMod;

      const totalMarks = completedAttempts.reduce((s, { exam }) => s + Number(exam.total_marks || 0), 0);
      const totalScore = completedAttempts.reduce((s, { attempt }) => s + Number(attempt.score || 0), 0);
      const percentage = totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0;

      const serial = `RL-ALL-${new Date().toISOString().slice(0, 10)}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const verifyUrl = `https://yourdomain.com/cert/verify?serial=${encodeURIComponent(serial)}`;
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        width: 180,
        margin: 1,
        errorCorrectionLevel: 'M'
      });

      const el = certRef.current;
      if (!el) throw new Error('لم يتم العثور على عنصر القالب');

      el.querySelector('[data-field="platform"]').textContent = 'واحة العلم التعليمية';
      el.querySelector('[data-field="student"]').textContent = userName || 'الطالب';
      el.querySelector('[data-field="date"]').textContent = new Date().toLocaleDateString('ar-EG');
      el.querySelector('[data-field="serial"]').textContent = serial;
      el.querySelector('[data-field="qr"]').src = qrDataUrl;
      el.querySelector('[data-field="total"]').textContent = `${totalScore} / ${totalMarks} (${percentage.toFixed(1)}%)`;

      const tbody = el.querySelector('[data-field="rows"]');
      tbody.innerHTML = completedAttempts.map(({ exam, attempt }, i) => {
        const passPct = (exam.pass_marks / (exam.total_marks || 1)) * 100;
        const isPass = (attempt.percentage || 0) >= passPct;
        const submitted = attempt.submitted_at
          ? new Date(attempt.submitted_at).toLocaleString('ar-EG', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
          })
          : '-';

        return `
        <tr>
          <td style="padding:6px;border:1px solid #ddd;text-align:center;">${i + 1}</td>
          <td style="padding:6px;border:1px solid #ddd;">${exam.title || '-'}</td>
          <td style="padding:6px;border:1px solid #ddd;">${exam.subject || '-'}</td>
          <td style="padding:6px;border:1px solid #ddd;text-align:center;font-weight:bold;">${attempt.score}/${exam.total_marks}</td>
          <td style="padding:6px;border:1px solid #ddd;text-align:center;">${(attempt.percentage || 0).toFixed(1)}%</td>
          <td style="padding:6px;border:1px solid #ddd;text-align:center;color:${isPass ? '#2e7d32' : '#c62828'};font-weight:bold;">
            ${isPass ? '✓ ناجح' : '✗ راسب'}
          </td>
          <td style="padding:6px;border:1px solid #ddd;font-size:10px;">${submitted}</td>
        </tr>
      `;
      }).join('');

      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas1 = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 0
      });
      const img1 = canvas1.toDataURL('image/png', 0.95);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
        compress: true
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(img1, 'PNG', 0, 0, pageWidth, pageHeight, '', 'FAST');

      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const fileName = `شهادة-${userName?.replace(/\s+/g, '-') || 'طالب'}-${timestamp}.pdf`;
      pdf.save(fileName);

      toast.success('✅ تم تحميل الشهادة بنجاح!');

    } catch (error) {
      console.error('❌ خطأ في توليد الشهادة:', error);
      toast.error('تعذّر توليد الشهادة');
    } finally {
      setIsCertGenerating(false);
    }
  };

  const answeredCount = takingExam?.questions ?
    takingExam.questions.filter(q => takingAnswers[q.id]).length : 0;
  const totalQuestions = takingExam?.questions?.length || 0;

  const uniqueMonths = [...new Set(exams.map(exam => exam.month).filter(Boolean))];
  const uniqueSubjects = [...new Set(exams.map(exam => exam.subject).filter(Boolean))];

  const totalPages = Math.ceil(exams.length / itemsPerPage);
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const isCertificateAvailable = () => {
    const completedAttempts = Object.entries(studentAttempts)
      .filter(([_, attempt]) => attempt.status === 'submitted')
      .map(([_, attempt]) => attempt);
    
    if (completedAttempts.length === 0) return false;
    return completedAttempts.some(att => canViewResult(att));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-24 sm:w-24 border-b-2 border-[#665446] mx-auto"></div>
          <p className="mt-4 text-sm sm:text-base" style={{ color: TEXT_COLOR }}>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatedBackground className="min-h-screen" dir="rtl">
      <div ref={certRef} style={{ position: 'fixed', left: '-9999px', direction: 'rtl' }} className="w-[794px] h-[1123px] bg-white p-8">
        <div className="border-8 border-double border-[#665446] h-full p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#665446] mb-2" data-field="platform">واحة العلم التعليمية</h1>
            <div className="text-2xl font-bold text-[#806445]">شهادة إتمام الاختبارات الشهرية</div>
          </div>

          <div className="space-y-6">
            <p className="text-xl text-center">
              نشهد أن الطالب/ـة <strong className="text-[#665446]" data-field="student"></strong>
              <br />قد أتم/ت الاختبارات الشهرية بنجاح
            </p>

            <table className="w-full border-collapse mt-6" style={{ direction: 'rtl' }}>
              <thead>
                <tr className="bg-[#665446] text-white text-sm">
                  <th className="border p-2">#</th>
                  <th className="border p-2">الامتحان</th>
                  <th className="border p-2">المادة</th>
                  <th className="border p-2">الدرجة</th>
                  <th className="border p-2">النسبة</th>
                  <th className="border p-2">النتيجة</th>
                  <th className="border p-2">التاريخ</th>
                </tr>
              </thead>
              <tbody data-field="rows"></tbody>
            </table>

            <div className="mt-4 text-center">
              <p className="font-bold text-lg">
                المجموع الكلي: <span data-field="total"></span>
              </p>
            </div>
          </div>

          <div className="absolute bottom-16 left-0 right-0 text-center space-y-4">
            <p className="text-sm text-gray-600">
              تاريخ الإصدار: <span data-field="date"></span>
            </p>
            <p className="text-sm text-gray-600">
              رقم الشهادة: <span data-field="serial"></span>
            </p>
            <div className="mt-4">
              <img data-field="qr" alt="QR Code" className="mx-auto w-32 h-32" />
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-screen flex flex-col px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 overflow-visible">
        <ToastContainer
          position="top-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl
          pauseOnHover
          draggable
          style={{ zIndex: 9999 }}
        />

        {takingExam && (
          <div className="flex-1 overflow-auto animate-fadeIn" id="exam-taking-panel">
            <style jsx>{`
              @keyframes fadeInDown {
                from {
                  opacity: 0;
                  transform: translateY(-20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
            <div className="max-w-7xl mx-auto">
              <section className="w-full max-w-5xl mx-auto my-4 sm:my-8" dir="rtl">
                <header className="sticky top-0 z-10 rounded-2xl bg-gradient-to-r from-[#665446] to-[#8B7355] text-white shadow-xl overflow-hidden">
                  <div className="px-4 sm:px-6 py-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-xl sm:text-2xl font-bold font-[Almarai] truncate">
                        {takingExam.title}
                      </h2>
                      <p className="text-xs sm:text-sm opacity-90 font-[Almarai]">
                        السؤال {answeredCount} من {totalQuestions}
                      </p>
                    </div>

                    <div className="bg-white/15 rounded-xl px-3 sm:px-4 py-2 text-center shrink-0">
                      <Clock className="w-5 h-5 mx-auto mb-1" />
                      <p className="text-lg sm:text-xl font-bold font-mono">
                        {formatTime(timeLeft)}
                      </p>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-white/20">
                    <div
                      className="h-full bg-white transition-all duration-300"
                      style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                    />
                  </div>
                </header>

                <div className="mt-4 sm:mt-6 space-y-6">
                  {(takingExam.questions || []).map((q, idx) => {
                    const questionType = q.question_type || 'multiple_choice';
                    const isTrueFalse = questionType === 'true_false';

                    return (
                      <article
                        key={q.id}
                        className="rounded-2xl border-2 border-gray-200 hover:border-[#665446] bg-white p-4 sm:p-5 transition"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#665446] text-white flex items-center justify-center font-bold text-sm">
                            {idx + 1}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-start gap-2 mb-1">
                              <p className="text-base sm:text-lg font-semibold text-gray-800 font-[Almarai] flex-1">
                                {q.question_text}
                              </p>
                              {q.image_url && (
                                <div className="mt-3">
                                  <img src={q.image_url} alt="صورة السؤال" className="w-full max-h-48 object-contain rounded" />
                                </div>
                              )}
                              <span className={`text-xs px-2 py-1 rounded-lg font-[Almarai] ${isTrueFalse
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                                }`}>
                                {isTrueFalse ? 'صح/خطأ' : 'اختيار متعدد'}
                              </span>
                            </div>
                            <span className="text-xs sm:text-sm text-gray-500 font-[Almarai]">
                              ({q.max_marks} {q.max_marks === 1 ? 'درجة' : 'درجات'})
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3 sm:mr-10">
                          {q.question_type === QUESTION_TYPES.TRUE_FALSE && (
                            <>
                              <label
                                className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition ${takingAnswers[q.id] === 'TRUE'
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-gray-300 hover:border-green-500 hover:bg-gray-50'
                                  }`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${q.id}`}
                                  value="TRUE"
                                  checked={takingAnswers[q.id] === 'TRUE'}
                                  onChange={(e) => updateTakingAnswer(q.id, e.target.value)}
                                  className="w-5 h-5 accent-green-600"
                                />
                                <span className="flex items-center gap-2 font-[Almarai]">
                                  <span className="text-2xl">✓</span>
                                  <span className="font-bold text-green-700 text-lg">صح</span>
                                </span>
                              </label>

                              <label
                                className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition ${takingAnswers[q.id] === 'FALSE'
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-gray-300 hover:border-red-500 hover:bg-gray-50'
                                  }`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${q.id}`}
                                  value="FALSE"
                                  checked={takingAnswers[q.id] === 'FALSE'}
                                  onChange={(e) => updateTakingAnswer(q.id, e.target.value)}
                                  className="w-5 h-5 accent-red-600"
                                />
                                <span className="flex items-center gap-2 font-[Almarai]">
                                  <span className="text-2xl">✗</span>
                                  <span className="font-bold text-red-700 text-lg">خطأ</span>
                                </span>
                              </label>
                            </>
                          )}

                          {q.question_type === QUESTION_TYPES.MULTIPLE_CHOICE && (
                            ENGLISH_OPTIONS.map((opt) => (
                              <label
                                key={opt}
                                className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition ${takingAnswers[q.id] === opt
                                  ? 'border-[#665446] bg-[#665446]/10'
                                  : 'border-gray-300 hover:border-[#665446] hover:bg-gray-50'
                                  }`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${q.id}`}
                                  value={opt}
                                  checked={takingAnswers[q.id] === opt}
                                  onChange={(e) => updateTakingAnswer(q.id, e.target.value)}
                                  className="w-5 h-5 accent-[#665446]"
                                />
                                <span className="flex items-center gap-2 font-[Almarai]">
                                  <span className="font-bold text-[#665446]">
                                    {OPTION_DISPLAY[opt]}.
                                  </span>
                                  <span className="text-gray-700">
                                    {q[`option_${opt.toLowerCase()}`]}
                                  </span>
                                </span>
                              </label>
                            ))
                          )}

                          {q.question_type === QUESTION_TYPES.ESSAY && (
                            <textarea
                              value={takingAnswers[q.id] || ''}
                              onChange={(e) => updateTakingAnswer(q.id, e.target.value)}
                              placeholder="اكتب إجابتك هنا..."
                              rows={6}
                              className="w-full rounded-xl border-2 border-gray-300 p-4 font-[Almarai] focus:border-[#665446] focus:outline-none"
                            />
                          )}

                          {q.question_type === QUESTION_TYPES.CORRECT_UNDERLINED && (
                            <input
                              type="text"
                              value={takingAnswers[q.id] || ''}
                              onChange={(e) => updateTakingAnswer(q.id, e.target.value)}
                              placeholder="اكتب التصحيح هنا..."
                              className="w-full rounded-xl border-2 border-gray-300 p-4 font-[Almarai] focus:border-[#665446] focus:outline-none"
                            />
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>

                <footer className="sticky bottom-4 mt-6">
                  <div className="bg-white/90 backdrop-blur rounded-2xl border border-gray-200 p-3 sm:p-4 shadow-lg flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => {
                        if (window.confirm('هل أنت متأكد من إلغاء الامتحان؟ سيتم فقدان جميع الإجابات.')) {
                          if (timerRef.current) clearInterval(timerRef.current);
                          setTakingExam(null);
                          setTakingAnswers({});
                        }
                      }}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold font-[Almarai] transition"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={submitExamManually}
                      disabled={answeredCount === 0}
                      className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold font-[Almarai] transition ${answeredCount === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#665446] hover:bg-[#8B7355] text-white shadow-md hover:shadow-lg'
                        }`}
                    >
                      تسليم الامتحان ({answeredCount}/{totalQuestions})
                    </button>
                  </div>
                </footer>
              </section>
            </div>
          </div>
        )}

        {!takingExam && (
          <div className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2 font-[Almarai]" style={{ color: TEXT_COLOR }}>
                    الامتحانات الشهرية
                  </h1>
                  <p className="text-sm sm:text-base opacity-80 font-[Almarai]" style={{ color: TEXT_COLOR }}>
                    مرحباً {userName}
                  </p>
                </div>

                <div className="flex gap-2 bg-white rounded-lg p-1 shadow-md">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-6 py-2 rounded-md font-bold font-[Almarai] transition ${activeTab === 'all'
                      ? 'bg-[#665446] text-white'
                      : 'bg-transparent text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    كل الامتحانات
                  </button>
                  <button
                    onClick={() => setActiveTab('level1')}
                    className={`px-6 py-2 rounded-md font-bold font-[Almarai] transition ${activeTab === 'level1'
                      ? 'bg-[#665446] text-white'
                      : 'bg-transparent text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    المستوى الأول
                  </button>
                  <button
                    onClick={() => setActiveTab('level2')}
                    className={`px-6 py-2 rounded-md font-bold font-[Almarai] transition ${activeTab === 'level2'
                      ? 'bg-[#665446] text-white'
                      : 'bg-transparent text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    التمهيدي
                  </button>
                </div>

                <button
                  onClick={generateAllExamsCertificate}
                  disabled={!isCertificateAvailable() || isCertGenerating}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold font-[Almarai] transition-all ${(!isCertificateAvailable() || isCertGenerating)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                    }`}
                  title="تحميل الشهادة (تظهر بعد مرور ساعتين من أول امتحان مكتمل)"
                >
                  <Award className="w-5 h-5" />
                  تحميل الشهادة PDF
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="بحث عن امتحان..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pr-10 pl-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#665446] focus:outline-none font-[Almarai]"
                    />
                  </div>

                  <select
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#665446] focus:outline-none font-[Almarai]"
                  >
                    <option value="">كل الشهور</option>
                    {uniqueMonths.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>

                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#665446] focus:outline-none font-[Almarai]"
                  >
                    <option value="">كل المواد</option>
                    {uniqueSubjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredExams.length === 0 ? (
                <div className="text-center py-16">
                  <FileText className="w-20 h-20 mx-auto mb-4 opacity-30" style={{ color: TEXT_COLOR }} />
                  <p className="text-xl font-[Almarai]" style={{ color: TEXT_COLOR }}>
                    لا توجد امتحانات متاحة
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {filteredExams.map(exam => {
                    const studentAttempt = studentAttempts[exam.id];
                    const hasCompleted = !!studentAttempt;
                    const canView = hasCompleted && canViewResult(studentAttempt);
                    const timeUntil = hasCompleted && !canView ? getTimeUntilResultAvailable(studentAttempt) : '';

                    return (
                      <div
                        key={exam.id}
                        className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border-2 border-transparent hover:border-[#665446]"
                      >
                        <div className="bg-gradient-to-r from-[#665446] to-[#8B7355] p-4 text-white">
                          <h3 className="text-xl font-bold mb-2 font-[Almarai]">{exam.title}</h3>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1 font-[Almarai]">
                              <Calendar className="w-4 h-4" />
                              {exam.month}
                            </span>
                            <span className="flex items-center gap-1 font-[Almarai]">
                              <Clock className="w-4 h-4" />
                              {exam.duration_minutes} دقيقة
                            </span>
                          </div>
                        </div>

                        <div className="p-4">
                          {exam.description && (
                            <p className="text-gray-600 mb-4 text-sm font-[Almarai]">{exam.description}</p>
                          )}

                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm font-[Almarai]">
                              <span className="text-gray-600">المادة:</span>
                              <span className="font-semibold" style={{ color: TEXT_COLOR }}>{exam.subject}</span>
                            </div>
                            <div className="flex justify-between text-sm font-[Almarai]">
                              <span className="text-gray-600">الدرجة الكلية:</span>
                              <span className="font-semibold" style={{ color: TEXT_COLOR }}>{exam.total_marks}</span>
                            </div>
                            <div className="flex justify-between text-sm font-[Almarai]">
                              <span className="text-gray-600">درجة النجاح:</span>
                              <span className="font-semibold" style={{ color: TEXT_COLOR }}>{exam.pass_marks}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-4">
                            {exam.is_active ? (
                              <span className="flex items-center gap-1 text-green-600 text-sm font-bold font-[Almarai]">
                                <CheckCircle className="w-4 h-4" />
                                نشط
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-red-600 text-sm font-bold font-[Almarai]">
                                <XCircle className="w-4 h-4" />
                                غير نشط
                              </span>
                            )}
                          </div>

                          {hasCompleted && (
                            <div className="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                              <p className="text-sm font-bold text-blue-700 mb-1 font-[Almarai]">
                                ✅ تم إنهاء الامتحان
                              </p>
                              {canView ? (
                                <p className="text-xs text-blue-600 font-[Almarai]">
                                  حمل الشهادة لتعلم نتيجة الاختبار
                                </p>
                              ) : (
                                <p className="text-xs text-blue-600 font-[Almarai]">
                                  ستظهر النتيجة بعد: {timeUntil}
                                </p>
                              )}
                            </div>
                          )}

                          <button
                            onClick={() => startExam(exam)}
                            disabled={!exam.is_active || hasCompleted}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold font-[Almarai] transition-all ${!exam.is_active || hasCompleted
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-[#665446] hover:bg-[#8B7355] text-white shadow-lg hover:shadow-xl'
                              }`}
                          >
                            {hasCompleted ? 'تم الإنهاء' : 'بدء الامتحان'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mb-6">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <span className="px-4 py-2 font-[Almarai]" style={{ color: TEXT_COLOR }}>
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showLevelSelector && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-[#665446] to-[#8B7355] p-6 text-white text-center">
              <h2 className="text-2xl sm:text-3xl font-bold font-[Almarai] mb-2">
                مرحبا بك في اختبارات الواحة
              </h2>
              <p className="text-sm opacity-90 font-[Almarai]">
                اختر المستوى الدراسي الخاص بك
              </p>
            </div>

            <div className="p-6 space-y-4">
              <button
                onClick={() => handleLevelSelection('level1')}
                className="w-full group relative overflow-hidden rounded-2xl border-3 border-[#665446] bg-gradient-to-br from-white to-gray-50 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                style={{ borderWidth: '3px' }}
              >
                <div className="relative flex items-center gap-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[#665446] text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                    1
                  </div>
                  <div className="flex-1 text-right">
                    <h3 className="text-xl font-bold font-[Almarai] text-[#665446] mb-1">
                      المستوى الأول
                    </h3>
                    <p className="text-sm text-gray-600 font-[Almarai]">
                      المستوى الأول
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleLevelSelection('level2')}
                className="w-full group relative overflow-hidden rounded-2xl border-3 border-[#8B7355] bg-gradient-to-br from-white to-gray-50 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                style={{ borderWidth: '3px' }}
              >
                <div className="relative flex items-center gap-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[#8B7355] text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                    2
                  </div>
                  <div className="flex-1 text-right">
                    <h3 className="text-xl font-bold font-[Almarai] text-[#8B7355] mb-1">
                      التمهيدي
                    </h3>
                    <p className="text-sm text-gray-600 font-[Almarai]">
                      المرحلة التمهيدية
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <div className="px-6 pb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                <p className="text-xs text-blue-700 font-[Almarai]">
                  💡 يمكنك تغيير المستوى لاحقاً من التبويبات أعلى الصفحة
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AnimatedBackground>
  );
};

export default StudentExams;