// src/Pages/MonthlyExams.js - FIXED COMPLETE VERSION
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../Utilities/supabaseClient';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../Utilities/AnimatedBackground';
import {
  FileText, Plus, Trash2, Eye, Clock, Calendar, Upload,
  CheckCircle, XCircle, Users, TrendingUp, X,
  Search, ChevronLeft, ChevronRight, Edit3, Save,
  MessageSquare, Award
} from 'lucide-react';
// داخل generateAllExamsCertificate()
const [{ default: html2canvas }, jspdfMod, { default: QRCode }] = await Promise.all([
  import('html2canvas'),
  import('jspdf'),
  import('qrcode')
]);
const { jsPDF } = jspdfMod;

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const TEXT_COLOR = '#806445';
const CARD_BG = '#F5EDE2';
const DEFAULT_DURATION_MIN = 60;
const RESULT_VISIBILITY_HOURS = 2;

// تصنيفات الأخطاء
const ERROR_TYPES = {
  CONCEPT_MISUNDERSTANDING: 'concept_misunderstanding', // خطأ في فهم المفهوم
  CALCULATION_ERROR: 'calculation_error', // خطأ حسابي
  CARELESS_MISTAKE: 'careless_mistake', // خطأ غير مقصود
  KNOWLEDGE_GAP: 'knowledge_gap', // فجوة معرفية
  LANGUAGE_BARRIER: 'language_barrier', // صعوبة لغوية
};

// ترجمة أنواع الأخطاء
const ERROR_TYPE_LABELS = {
  [ERROR_TYPES.CONCEPT_MISUNDERSTANDING]: 'خطأ في فهم المفهوم',
  [ERROR_TYPES.CALCULATION_ERROR]: 'خطأ حسابي',
  [ERROR_TYPES.CARELESS_MISTAKE]: 'خطأ غير مقصود',
  [ERROR_TYPES.KNOWLEDGE_GAP]: 'فجوة معرفية',
  [ERROR_TYPES.LANGUAGE_BARRIER]: 'صعوبة لغوية',
};

// أنواع الأسئلة
const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  TRUE_FALSE: 'true_false',
  CORRECT_UNDERLINED: 'correct_underlined',
  ESSAY: 'essay'
};

// مستويات الصعوبة
const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

// خيارات التقييم
const GRADING_OPTIONS = {
  AUTO: 'auto',
  MANUAL: 'manual',
  HYBRID: 'hybrid'
};

// ترجمة أنواع الأسئلة
const QUESTION_TYPE_LABELS = {
  [QUESTION_TYPES.MULTIPLE_CHOICE]: 'اختيار متعدد',
  [QUESTION_TYPES.TRUE_FALSE]: 'صح وخطأ',
  [QUESTION_TYPES.CORRECT_UNDERLINED]: 'تصحيح ما تحته خط',
  [QUESTION_TYPES.ESSAY]: 'مقالي'
};

const ENGLISH_OPTIONS = ['A', 'B', 'C', 'D'];
const OPTION_DISPLAY = { 'A': 'أ', 'B': 'ب', 'C': 'ج', 'D': 'د' };
const OPTION_TO_ENGLISH = { 'أ': 'A', 'ب': 'B', 'ج': 'C', 'د': 'D' };

// حالات المحاولة
const ATTEMPT_STATUS = {
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  GRADED: 'graded'
};

const MonthlyExams = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingExam, setEditingExam] = useState(null);

  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examAttempts, setExamAttempts] = useState([]);

  // حالة التقرير المفصل
  const [showDetailedReport, setShowDetailedReport] = useState(false);
  const [detailedPerformance, setDetailedPerformance] = useState(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const [takingExam, setTakingExam] = useState(null);
  const [takingAnswers, setTakingAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const [isCertGenerating, setIsCertGenerating] = useState(false);
  const certRef = useRef(null);

  // حالة التصحيح اليدوي
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [currentGradingAttempt, setCurrentGradingAttempt] = useState(null);
  const [gradingData, setGradingData] = useState({});
  const [gradingFeedback, setGradingFeedback] = useState({});
  const [isGradingSaving, setIsGradingSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // ✅ للتبويبات
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [studentAttempts, setStudentAttempts] = useState({});
  // ✅ إضافة هنا
  const [showLevelSelector, setShowLevelSelector] = useState(false); // ✅ أضف هنا
  const [selectedLevel, setSelectedLevel] = useState(''); // ✅ أ
  const [examForm, setExamForm] = useState({
    title: '',
    description: '',
    month: '',
    subject: '',
    course_id: null,
    lesson_id: null,
    duration_minutes: DEFAULT_DURATION_MIN,
    total_marks: 100,
    passing_score: 50,
    start_date: '',
    end_date: '',
    level_scope: 'shared',
    is_active: true,
    allow_review: true,
    shuffle_questions: false,
    shuffle_answers: false,
    attempts_allowed: 1,
    grading_scheme: {
      auto_grade: true,
      manual_review_needed: false,
      partial_credit: false
    },
    settings: {
      show_explanation: true,
      time_per_question: null,
      prevent_backward_navigation: false,
      randomize_options: true
    }
  });

  const formRef = useRef(null);

  const [questions, setQuestions] = useState([{
    question_text: '',
    question_type: 'multiple_choice',
    options: ['', '', '', ''],
    correct_answer: 'A',
    max_marks: 1,
    explanation: '',
    image_url: '',
    grading_rubric: '',
    model_answer: '',
    topic: '',
    difficulty_level: 'medium',
    time_limit: null,
    tags: [],
    feedback: {
      correct: '',
      incorrect: ''
    },
    metadata: {
      source: '',
      category: '',
      skill_level: 'beginner'
    }
  }]);
  const [numQuestions, setNumQuestions] = useState(1);



  useEffect(() => {
    if (showCreateForm && formRef.current) {
      setTimeout(() => {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 80);
    }
  }, [showCreateForm]);

  // جلب الكورسات والدروس
  const fetchCoursesAndLessons = async () => {
    try {
      // جلب الكورسات
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;
      setCourses(coursesData || []);

      // جلب الدروس إذا تم اختيار كورس
      if (examForm.course_id) {
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', examForm.course_id)
          .order('created_at', { ascending: false });

        if (lessonsError) throw lessonsError;
        setLessons(lessonsData || []);
      }
    } catch (error) {
      console.error('خطأ في جلب الكورسات والدروس:', error);
      toast.error('فشل في جلب الكورسات والدروس');
    }
  };

  useEffect(() => {
    getCurrentUser();
    if (userRole === 'admin') {
      fetchCoursesAndLessons();
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchExams();
    }
  }, [currentUser]);

  useEffect(() => {
    filterAndPaginateExams();
  }, [exams, searchTerm, filterMonth, filterSubject, filterStatus, activeTab, currentPage, selectedLevel, userRole]);
  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    const n = Math.max(1, Math.floor(Number(numQuestions) || 1));
    setNumQuestions(n);
    setQuestions(prev => {
      const copy = [...prev];
      if (n > copy.length) {
        for (let i = copy.length; i < n; i++) {
          copy.push({
            question_text: '',
            question_type: 'multiple_choice', // ✅ إضافة القيمة الافتراضية
            option_a: '',
            option_b: '',
            option_c: '',
            option_d: '',
            correct_answer: 'A',
            max_marks: 1
          });
        }
      } else if (n < copy.length) {
        copy.length = n;
      }
      return copy;
    });
  }, [numQuestions]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Object.keys(studentAttempts).length > 0) {
        setStudentAttempts(prev => ({ ...prev }));
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [studentAttempts]);

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
        .select('role, first_name, last_name')
        .eq('auth_id', user.id)
        .single();

      if (!error && userData) {
        setUserRole(userData.role || '');
        setUserName(`${userData.first_name} ${userData.last_name}`);
      }
    } catch (error) {
      console.error('خطأ في جلب بيانات المستخدم:', error);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  // جلب الإجابات المقالية التي تحتاج للتصحيح
  const fetchPendingEssayAnswers = async (examId) => {
    try {
      const { data, error } = await supabase
        .from('student_answers')
        .select(`
          *,
          exam_questions (
            question_text,
            model_answer,
            grading_rubric,
            max_marks
          ),
          exam_attempts (
            student_name,
            submitted_at
          )
        `)
        .eq('is_graded', false)
        .eq('exam_questions.question_type', QUESTION_TYPES.ESSAY)
        .order('exam_attempts.submitted_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('خطأ في جلب الإجابات المقالية:', error);
      toast.error('فشل في جلب الإجابات المقالية');
      return [];
    }
  };

  const fetchExams = async () => {
    try {
      const { data: examsData, error: examsError } = await supabase
        .from('monthly_exams')
        .select('*')
        .order('created_at', { ascending: false });

      if (examsError) throw examsError;
      const examsList = examsData || [];

      const examIds = examsList.map(e => e.id).filter(Boolean);

      if (examIds.length) {
        const { data: attempts, error: attErr } = await supabase
          .from('exam_attempts')
          .select('*')
          .in('exam_id', examIds);

        if (attErr) throw attErr;

        const byExam = {};
        attempts.forEach(a => {
          if (!byExam[a.exam_id]) byExam[a.exam_id] = { attempts: [] };
          byExam[a.exam_id].attempts.push(a);
        });

        if (currentUser && userRole !== 'admin') {
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

        const enriched = examsList.map(ex => {
          const info = byExam[ex.id] || { attempts: [] };
          const avg = info.attempts.length
            ? (info.attempts.reduce((s, it) => s + Number(it.percentage || 0), 0) / info.attempts.length)
            : 0;
          return { ...ex, attempts_count: info.attempts.length, attempts_avg: avg };
        });

        setExams(enriched);
      } else {
        setExams(examsList);
      }
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

    // ✅ فلتر المستوى - الامتحانات المشتركة تظهر في كل المستويات
    if (userRole !== 'admin' && activeTab !== 'all') {
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

    if (filterStatus === 'active') {
      filtered = filtered.filter(exam => exam.is_active);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(exam => !exam.is_active);
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

    setFilteredExams(paginated);
  };


  const inputToIso = (val) => {
    if (!val) return null;
    const d = new Date(val);
    if (isNaN(d.getTime())) return null;
    return d.toISOString();
  };

  // ✅ دالة توحيد صيغة الأسئلة قبل الحفظ في قاعدة البيانات
  const prepareQuestionForDatabase = (question, examId, index) => {
    const baseQuestion = {
      exam_id: examId,
      question_text: question.question_text,
      question_type: question.question_type || QUESTION_TYPES.MULTIPLE_CHOICE,
      question_order: index + 1,
      max_marks: Number(question.max_marks || 1),
      explanation: question.explanation || null,
      image_url: question.image_url || null,
      topic: question.topic || null
    };

    switch (question.question_type) {
      case QUESTION_TYPES.TRUE_FALSE:
        return {
          ...baseQuestion,
          options: JSON.stringify(['TRUE', 'FALSE']),
          correct_answer: question.correct_answer || 'TRUE',
          option_a: null,
          option_b: null,
          option_c: null,
          option_d: null,
          model_answer: null,
          grading_rubric: null
        };

      case QUESTION_TYPES.MULTIPLE_CHOICE:
        return {
          ...baseQuestion,
          option_a: question.option_a || '',
          option_b: question.option_b || '',
          option_c: question.option_c || '',
          option_d: question.option_d || '',
          options: JSON.stringify([
            question.option_a || '',
            question.option_b || '',
            question.option_c || '',
            question.option_d || ''
          ]),
          correct_answer: question.correct_answer || 'A',
          model_answer: null,
          grading_rubric: null
        };

      case QUESTION_TYPES.ESSAY:
        return {
          ...baseQuestion,
          model_answer: question.model_answer || '',
          grading_rubric: question.grading_rubric || '',
          correct_answer: null,
          options: null,
          option_a: null,
          option_b: null,
          option_c: null,
          option_d: null
        };

      case QUESTION_TYPES.CORRECT_UNDERLINED:
        return {
          ...baseQuestion,
          option_a: question.option_a || '',
          correct_answer: question.correct_answer || '',
          options: null,
          option_b: null,
          option_c: null,
          option_d: null,
          model_answer: null,
          grading_rubric: null
        };

      default:
        return baseQuestion;
    }
  };

  const isoToInput = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const tzOffset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - tzOffset * 60000);
    return local.toISOString().slice(0, 16);
  };

  const createExam = async () => {
    // التحقق من الحقول
    if (!examForm.title || !examForm.month || !examForm.subject) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (!examForm.start_date || !examForm.end_date) {
      toast.error('يرجى تحديد تاريخ البدء والانتهاء');
      return;
    }

    if (questions.length === 0 || !questions[0].question_text) {
      toast.error('يجب إضافة سؤال واحد على الأقل');
      return;
    }

    try {
      const payloadExam = {
        title: examForm.title,
        description: examForm.description || null,
        month: examForm.month,
        subject: examForm.subject,
        level_scope: examForm.level_scope || 'shared',
        duration_minutes: Number(examForm.duration_minutes) || DEFAULT_DURATION_MIN,
        total_marks: Number(examForm.total_marks) || 100,
        pass_marks: Number(examForm.pass_marks) || 50,
        start_date: examForm.start_date ? new Date(examForm.start_date).toISOString() : new Date().toISOString(),
        end_date: examForm.end_date ? new Date(examForm.end_date).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: examForm.is_active ?? true
      };

      if (editingExam) {
        // ========== تعديل امتحان موجود ==========
        const { error } = await supabase
          .from('monthly_exams')
          .update(payloadExam)
          .eq('id', editingExam.id);

        if (error) throw error;

        // حذف الأسئلة القديمة
        await supabase.from('exam_questions').delete().eq('exam_id', editingExam.id);

        // إضافة الأسئلة الجديدة (موحدة)
        const questionsToInsert = questions.map((q, index) => prepareQuestionForDatabase(q, editingExam.id, index));

        if (questionsToInsert.length) {
          const { error: qErr } = await supabase.from('exam_questions').insert(questionsToInsert);
          if (qErr) throw qErr;
        }

        toast.success('تم تحديث الامتحان بنجاح!');

      } else {
        // ========== إنشاء امتحان جديد ==========
        const { data: examDataArray, error: examError } = await supabase
          .from('monthly_exams')
          .insert([{ ...payloadExam, created_by: currentUser.id }])
          .select();

        if (examError) {
          console.error('❌ خطأ في إنشاء الامتحان:', examError);
          throw examError;
        }

        if (!examDataArray || examDataArray.length === 0) {
          console.error('❌ لم يتم إرجاع بيانات الامتحان');
          toast.error('فشل إنشاء الامتحان - تحقق من الصلاحيات في Supabase');
          return;
        }

        const examData = examDataArray[0];
        console.log('✅ تم إنشاء الامتحان - ID:', examData.id);

        // ✅ إنشاء الأسئلة بصيغة موحدة
        const questionsToInsert = questions.map((q, index) => prepareQuestionForDatabase(q, examData.id, index));

        const { error: questionsError } = await supabase
          .from('exam_questions')
          .insert(questionsToInsert);

        if (questionsError) {
          console.error('❌ خطأ في إضافة الأسئلة:', questionsError);
          throw questionsError;
        }

        console.log('✅ تم إضافة الأسئلة بنجاح');
        toast.success('تم إنشاء الامتحان بنجاح!');
      }

      // تنظيف النموذج
      setShowCreateForm(false);
      resetForm();
      setEditingExam(null);
      fetchExams();

    } catch (error) {
      console.error('خطأ في إنشاء/تحديث الامتحان:', error);
      toast.error('حدث خطأ: ' + (error.message || 'حاول مرة أخرى'));
    }
  };

  // ✅ دالة توحيد صيغة الأسئلة للعرض في واجهة الطالب
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
        // جلب الخيارات من الأعمدة المباشرة
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

  const deleteExam = async (examId) => {
    const userConfirmed = window.confirm('هل أنت متأكد من حذف هذا الامتحان؟');
    if (!userConfirmed) return;

    try {
      const { error } = await supabase
        .from('monthly_exams')
        .delete()
        .eq('id', examId);

      if (error) throw error;

      setExams(prev => prev.filter(exam => exam.id !== examId));
      toast.success('تم حذف الامتحان بنجاح');
    } catch (error) {
      console.error('خطأ في حذف الامتحان:', error);
      toast.error('حدث خطأ أثناء حذف الامتحان');
    }
  };

  // دالة جلب تقرير الأداء المفصل
  const fetchDetailedPerformance = async (studentId, examId) => {
    try {
      // جلب ملخص الأداء
      const { data: summary, error: summaryError } = await supabase
        .from('student_performance_summary')
        .select('*')
        .eq('student_id', studentId)
        .eq('exam_id', examId)
        .single();

      if (summaryError) throw summaryError;

      // جلب تحليل الأخطاء
      const { data: errors, error: errorsError } = await supabase
        .from('student_error_analytics')
        .select(`
          *,
          exam_questions (
            question_text,
            question_type,
            max_marks
          )
        `)
        .eq('student_id', studentId)
        .eq('exam_id', examId);

      if (errorsError) throw errorsError;

      // تحليل الأخطاء حسب النوع
      const errorsByType = errors.reduce((acc, error) => {
        const type = error.exam_questions.question_type;
        if (!acc[type]) {
          acc[type] = {
            total: 0,
            questions: []
          };
        }
        acc[type].total++;
        acc[type].questions.push(error);
        return acc;
      }, {});

      return {
        summary,
        errors: errorsByType,
        recommendations: summary.improvement_areas || []
      };
    } catch (error) {
      console.error('خطأ في جلب تقرير الأداء:', error);
      throw error;
    }
  };

  const viewExamResults = async (exam) => {
    try {
      const { data, error } = await supabase
        .from('exam_attempts')
        .select('*')
        .eq('exam_id', exam.id)
        .order('percentage', { ascending: false });

      if (error) throw error;

      setExamAttempts(data || []);
      setSelectedExam(exam);
      setShowResultsModal(true);
    } catch (error) {
      console.error('خطأ في جلب النتائج:', error);
      toast.error('حدث خطأ أثناء جلب النتائج');
    }
  };

  // دالة خلط المصفوفة
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // دالة خلط الأسئلة والإجابات
  const getShuffledQuestions = (questions, exam) => {
    let shuffledQuestions = [...questions];

    // خلط الأسئلة إذا كان مسموحاً
    if (exam.shuffle_questions) {
      shuffledQuestions = shuffleArray(shuffledQuestions);
    }

    // خلط الإجابات لكل سؤال إذا كان مسموحاً
    if (exam.shuffle_answers) {
      shuffledQuestions = shuffledQuestions.map(q => {
        if (q.question_type === QUESTION_TYPES.MULTIPLE_CHOICE) {
          const options = q.options || [];
          const shuffledIndices = shuffleArray([...Array(options.length).keys()]);

          // إنشاء نسخة من السؤال مع الخيارات المخلوطة
          const shuffledOptions = shuffledIndices.map(i => options[i]);

          // تحديث الإجابة الصحيحة لتتوافق مع الترتيب الجديد
          const oldCorrectIndex = ENGLISH_OPTIONS.indexOf(q.correct_answer);
          const newCorrectIndex = shuffledIndices.indexOf(oldCorrectIndex);
          const newCorrectAnswer = ENGLISH_OPTIONS[newCorrectIndex];

          return {
            ...q,
            options: shuffledOptions,
            correct_answer: newCorrectAnswer,
            originalOrder: {
              indices: shuffledIndices,
              correctAnswer: q.correct_answer
            }
          };
        }
        return q;
      });
    }

    return shuffledQuestions;
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

      // ✅ توحيد صيغة الأسئلة للعرض
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
          setTimeout(() => {
            const firstQuestion = panel.querySelector('article');
            if (firstQuestion) {
              firstQuestion.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 300);
        }
      }, 100);

    } catch (err) {
      console.error('خطأ في بدء الامتحان:', err);
      toast.error('تعذر بدء الامتحان');
    }
  };
  const autoSubmitExam = async (attempt, qs) => {
    try {
      // ✅ تحضير الإجابات كما هي (بدون تحويل)
      const answerRows = (qs || []).map(q => ({
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
      // ضِيفها فوق بلوك التصحيح
      const normalizeCorrectForLegacy = (q, raw) => {
        const type = String(q?.question_type || '').toLowerCase();
        let v = raw;
        if (type === 'true_false') {
          const up = String(raw ?? '').trim().toUpperCase();
          if (up === 'A') v = 'TRUE';
          else if (up === 'B') v = 'FALSE';
        }
        return normalizeAnswer(q, v);
      };

      // ======= داخل كود حساب الدرجات =======
      questions.forEach(async (q) => {
        const questionType = (q.question_type || 'multiple_choice').toLowerCase();
        const studentAnswerRaw = takingAnswers[q.id];
        const correctAnswerRaw = q.correct_answer;

        // تطبيع الإجابات
        const studentAns = normalizeAnswer(q, studentAnswerRaw);
        const correctAns = normalizeCorrectForLegacy(q, correctAnswerRaw);

        // تحليل الإجابة إذا كانت خاطئة
        if (studentAns !== correctAns) {
          const analysis = await analyzeError(
            q.id,
            studentAns,
            correctAns,
            questionType,
            q.topic
          );

          if (analysis) {
            errorAnalytics.push({
              questionId: q.id,
              analysis,
              questionType,
              studentAnswer: studentAns,
              correctAnswer: correctAns,
              marksLost: Number(q.max_marks || 1)
            });
          }
        }

        const isCorrect = studentAns !== null && correctAns !== null && studentAns === correctAns;
        const questionMarks = Number(q.max_marks || 1); // ✅ احترام درجات السؤال

        gradingDetails.push({
          order: q.question_order,
          type: questionType,
          studentAnswer: studentAnswerRaw || 'لم يجب',
          correctAnswer: correctAnswerRaw,
          normalizedStudent: studentAns,
          normalizedCorrect: correctAns,
          isCorrect,
          marks: isCorrect ? questionMarks : 0,
          totalMarks: questionMarks
        });

        if (isCorrect) {
          score += questionMarks; // ✅ إضافة درجات السؤال كاملة
        }
      });

      // حساب الوقت المستغرق والنسبة المئوية
      const timeTaken = Math.round((new Date() - new Date(attempt.started_at)) / (1000 * 60));
      const percentage = (score / attempt.total_marks) * 100;

      // تحديث محاولة الامتحان
      const { error: updateErr } = await supabase
        .from('exam_attempts')
        .update({
          status: questions.some(q => q.question_type === QUESTION_TYPES.ESSAY)
            ? ATTEMPT_STATUS.SUBMITTED
            : ATTEMPT_STATUS.GRADED,
          submitted_at: new Date().toISOString(),
          total_score: score,
          total_marks: attempt.total_marks,
          time_taken_minutes: timeTaken,
          is_passed: percentage >= (attempt.passing_score || 50),
          answers: takingAnswers // حفظ جميع الإجابات
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

  // توحيد الإجابات قبل الحفظ
  // ✅ دالة موحّدة لتطبيع الإجابات قبل الحفظ
  const normalizeAnswer = (question, raw) => {
    if (raw === undefined || raw === null || raw === '') return null;

    const val = raw.toString().trim();
    const qtype = question.question_type;

    switch (qtype) {
      case QUESTION_TYPES.TRUE_FALSE:
        const up = val.toUpperCase();

        // قائمة القيم المقبولة للصح
        if (['TRUE', 'T', '1', 'صح', 'صحيح', 'نعم', 'YES', 'Y', '✅'].includes(up) ||
          ['TRUE', 'T', '1', 'صح', 'صحيح', 'نعم', 'YES', 'Y', '✅'].includes(val)) {
          return 'TRUE';
        }

        // قائمة القيم المقبولة للخطأ
        if (['FALSE', 'F', '0', 'خطأ', 'خطا', 'لا', 'NO', 'N', '❌'].includes(up) ||
          ['FALSE', 'F', '0', 'خطأ', 'خطا', 'لا', 'NO', 'N', '❌'].includes(val)) {
          return 'FALSE';
        }

        return up;

      case QUESTION_TYPES.MULTIPLE_CHOICE:
        const answer = val.toUpperCase();
        if (ENGLISH_OPTIONS.includes(answer)) return answer;
        if (OPTION_TO_ENGLISH[val]) return OPTION_TO_ENGLISH[val];

        // البحث في النص الكامل للخيارات
        const options = question.options || [];
        const index = options.findIndex(opt => opt === val);
        if (index !== -1) return ENGLISH_OPTIONS[index];

        return answer;

      case QUESTION_TYPES.CORRECT_UNDERLINED:
        return val; // نقارن النص مباشرة

      case QUESTION_TYPES.ESSAY:
        return val; // سيتم تصحيحه يدوياً

      default:
        return val;
    }

    // ✅ أسئلة Multiple Choice
    const up = val.toUpperCase();

    // خريطة الأحرف العربية
    const arLetterToKey = {
      'أ': 'A', 'ا': 'A',
      'ب': 'B',
      'ج': 'C',
      'د': 'D',
    };

    // 1) لو بالفعل A/B/C/D
    if (['A', 'B', 'C', 'D'].includes(up)) return up;

    // 2) لو حرف عربي
    if (arLetterToKey[val]) return arLetterToKey[val];

    // 3) لو نص الخيار نفسه → حوّله لمفتاحه
    const a = (q.option_a ?? '').toString().trim();
    const b = (q.option_b ?? '').toString().trim();
    const c = (q.option_c ?? '').toString().trim();
    const d = (q.option_d ?? '').toString().trim();

    if (val === a) return 'A';
    if (val === b) return 'B';
    if (val === c) return 'C';
    if (val === d) return 'D';

    // 4) fallback
    return up;
  };



  const submitExamManually = async () => {
    if (!takingExam) return;

    try {
      console.log('🚀 بدء عملية تسليم الامتحان...');
      console.log('📝 معرف المحاولة:', takingExam.id);

      // 1) جلب أسئلة الامتحان بالترتيب
      const { data: questions, error: qErr } = await supabase
        .from('exam_questions')
        .select('*')
        .eq('exam_id', takingExam.exam_id)
        .order('question_order', { ascending: true });

      if (qErr) throw qErr;
      if (!questions || questions.length === 0) {
        throw new Error('لم يتم العثور على أسئلة للامتحان');
      }

      console.log('📚 عدد الأسئلة:', questions.length);

      // 2) قراءة الإجابات الموجودة (إن وجدت)
      const { data: existingAnswers } = await supabase
        .from('exam_answers')
        .select('question_id, selected_answer')
        .eq('attempt_id', takingExam.id);

      const existingAnswersMap = new Map(
        (existingAnswers || []).map(a => [a.question_id, a.selected_answer])
      );

      console.log('💾 الإجابات الموجودة مسبقًا:', existingAnswers?.length || 0);

      // 3) تحضير إدخالات/تحديثات الإجابات
      // 3) تحضير إدخالات/تحديثات الإجابات
      const newAnswers = [];
      const answersToUpdate = [];
      let answeredCount = 0;

      questions.forEach(q => {
        const studentAnswerRaw = takingAnswers[q.id];
        if (studentAnswerRaw === undefined || studentAnswerRaw === null || studentAnswerRaw === '') return;

        // ✅ تطبيع الإجابة
        const answerToStore = normalizeAnswer(q, studentAnswerRaw);
        if (!answerToStore) return;

        answeredCount++;

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

      console.log('✍ عدد الأسئلة المجابة:', answeredCount);
      console.log('➕ إجابات جديدة:', newAnswers.length);
      console.log('🔄 إجابات للتحديث:', answersToUpdate.length);

      // ⚠ تحذير إذا لم يتم الإجابة على كل الأسئلة
      if (answeredCount < questions.length) {
        const unanswered = questions.length - answeredCount;
        console.warn(`⚠️ تحذير: ${unanswered} سؤال بدون إجابة!`);
      }

      // إدخال إجابات جديدة
      if (newAnswers.length > 0) {
        console.log('📥 حفظ الإجابات الجديدة...');
        const { error: insertErr } = await supabase
          .from('exam_answers')
          .insert(newAnswers);
        if (insertErr) throw insertErr;
        console.log('✅ تم حفظ الإجابات الجديدة');
      }

      // تحديث إجابات موجودة
      if (answersToUpdate.length > 0) {
        console.log('🔄 تحديث الإجابات الموجودة...');
        for (const update of answersToUpdate) {
          const { error: updateErr } = await supabase
            .from('exam_answers')
            .update({ selected_answer: update.selected_answer })
            .eq('attempt_id', update.attempt_id)
            .eq('question_id', update.question_id);
          if (updateErr) throw updateErr;
        }
        console.log('✅ تم تحديث الإجابات');
      }

      // 4) حساب الدرجة والنسبة يدويًا (قبل التسليم)
      // 4) حساب الدرجة والنسبة وتحليل الأخطاء
      let score = 0;
      let totalMarks = Number(takingExam.total_marks) || 0;
      const errorAnalytics = [];

      if (!totalMarks) {
        totalMarks = questions.reduce((sum, q) => sum + Number(q.max_marks || 1), 0);
      }

      console.log('📊 بدء حساب الدرجات وتحليل الأخطاء:');
      console.log('  إجمالي الدرجات:', totalMarks); const gradingDetails = [];

      questions.forEach(q => {
        const studentAns = (takingAnswers[q.id] || '').toString().toUpperCase().trim();
        const correctAns = (q.correct_answer || '').toString().toUpperCase().trim();

        // ✅ المقارنة المباشرة بعد التطبيع
        const isCorrect = studentAns && studentAns === correctAns;
        const questionMarks = Number(q.max_marks || 1);

        gradingDetails.push({
          order: q.question_order,
          type: q.question_type,
          studentAnswer: takingAnswers[q.id] || 'لم يجب',
          correctAnswer: q.correct_answer,
          isCorrect,
          marks: isCorrect ? questionMarks : 0,
          totalMarks: questionMarks
        });

        if (isCorrect) {
          score += questionMarks;
        }
      });

      console.table(gradingDetails);

      const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;

      console.log('📊 النتيجة النهائية:');
      console.log('  ✅ الدرجة:', score, '/', totalMarks);
      console.log('  📈 النسبة:', percentage.toFixed(2), '%');

      // 5) تحديث attempt - الآن نحفظ النتيجة!
      console.log('💾 حفظ النتيجة في قاعدة البيانات...');

      const { error: updateAttemptErr } = await supabase
        .from('exam_attempts')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          score: score,              // ✅ نحفظ الدرجة
          percentage: percentage,    // ✅ نحفظ النسبة
          total_marks: totalMarks,   // ✅ نحفظ الإجمالي
          is_graded: true,           // ✅ تم التصحيح
        })
        .eq('id', takingExam.id);

      if (updateAttemptErr) throw updateAttemptErr;

      console.log('✅ تم حفظ النتيجة بنجاح!');

      console.log('✅ تم حفظ النتيجة بنجاح!');

      // 6) التحقق من النتيجة (اختياري - للتأكد)
      const { data: verifyResult } = await supabase
        .from('exam_attempts')
        .select('score, percentage, is_graded')
        .eq('id', takingExam.id)
        .single();

      console.log('🔍 التحقق من النتيجة المحفوظة:', verifyResult);

      // 7) تنظيف حالة الامتحان في الواجهة
      if (timerRef.current) clearInterval(timerRef.current);
      setTakingExam(null);
      setTakingAnswers({});

      // تسجيل تحليل الأخطاء
      if (errorAnalytics.length > 0) {
        console.log('📝 تسجيل تحليل الأخطاء...');
        for (const error of errorAnalytics) {
          await logError(takingExam.id, error.questionId, error.analysis);
        }
        console.log(`✅ تم تسجيل ${errorAnalytics.length} خطأ للتحليل`);
      }

      // إنشاء ملخص الأداء
      await supabase.from('student_performance_summary').upsert({
        student_id: currentUser.id,
        exam_id: takingExam.exam_id,
        total_questions: questions.length,
        correct_answers: questions.length - errorAnalytics.length,
        wrong_answers: errorAnalytics.length,
        unanswered: questions.length - Object.keys(takingAnswers).length,
        weak_topics: getWeakTopics(errorAnalytics),
        strong_topics: getStrongTopics(questions, errorAnalytics),
        improvement_areas: generateImprovementAreas(errorAnalytics)
      });

      // 8) رسالة نجاح محسّنة
      const passMarks = Number(takingExam.pass_marks) || (totalMarks * 0.5);
      const isPassed = score >= passMarks;

      toast.success(
        `✅ تم تسليم الامتحان بنجاح!
${errorAnalytics.length > 0 ? `\nعدد الأخطاء: ${errorAnalytics.length}` : '\nأداء ممتاز - لا توجد أخطاء! 🎉'}
\nيمكنك الاطلاع على التحليل التفصيلي في صفحة النتائج`
      );


      // 9) إعادة تحميل قائمة الامتحانات
      await fetchExams();

      console.log('✅ اكتملت عملية التسليم بنجاح!');

    } catch (err) {
      console.error('❌ خطأ في تسليم الامتحان:', err);
      toast.error('حدث خطأ أثناء تسليم الامتحان: ' + (err.message || ''), {
        autoClose: 5000
      });
    }
  };

  // ✅ دالة اختيارية لإعادة حساب النتيجة من الخادم
  // تحليل وتصنيف الأخطاء
  const analyzeError = async (questionId, studentAnswer, correctAnswer, questionType, topic) => {
    try {
      // تحديد نوع الخطأ
      let errorType = ERROR_TYPES.CONCEPT_MISUNDERSTANDING; // القيمة الافتراضية

      if (questionType === QUESTION_TYPES.MULTIPLE_CHOICE) {
        // تحليل الخطأ في الاختيار المتعدد
        const { data: previousAnswers } = await supabase
          .from('student_answers')
          .select('student_answer')
          .eq('question_id', questionId)
          .eq('is_correct', false);

        // إذا كان نفس الخطأ متكرر
        const isRepeatedError = previousAnswers?.some(a => a.student_answer === studentAnswer);

        if (isRepeatedError) {
          errorType = ERROR_TYPES.CONCEPT_MISUNDERSTANDING;
        } else {
          errorType = ERROR_TYPES.CARELESS_MISTAKE;
        }
      } else if (questionType === QUESTION_TYPES.TRUE_FALSE) {
        // خطأ في الصح والخطأ غالباً يكون عدم فهم المفهوم
        errorType = ERROR_TYPES.CONCEPT_MISUNDERSTANDING;
      }

      return {
        error_type: errorType,
        is_repeated_error: false, // سيتم تحديثه لاحقاً
        topic: topic || 'general'
      };
    } catch (error) {
      console.error('خطأ في تحليل الخطأ:', error);
      return null;
    }
  };

  // دالة تسجيل الخطأ في قاعدة البيانات
  const logError = async (attemptId, questionId, analysis) => {
    try {
      const { data: attempt } = await supabase
        .from('exam_attempts')
        .select('exam_id, student_id')
        .eq('id', attemptId)
        .single();

      if (!attempt) throw new Error('لم يتم العثور على المحاولة');

      const { error } = await supabase
        .from('student_error_analytics')
        .insert([{
          student_id: attempt.student_id,
          exam_id: attempt.exam_id,
          question_id: questionId,
          attempt_id: attemptId,
          ...analysis
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('خطأ في تسجيل تحليل الخطأ:', error);
    }
  };

  const recalculateScore = async (attemptId) => {
    try {
      console.log('🔄 إعادة حساب النتيجة من الخادم...');

      // 5.1) استدعاء التصحيح السيرفري
      const { data: recalcData, error: recalcErr } = await supabase
        .rpc('calculate_exam_score', { attempt_id_param: takingExam.id });

      if (recalcErr) throw recalcErr;
      console.log('✅ إعادة الحساب من السيرفر:', recalcData);


      toast.success('تم إعادة حساب النتيجة بنجاح!');

      return data;
    } catch (err) {
      console.error('❌ خطأ في إعادة الحساب:', err);
      toast.error('فشل إعادة حساب النتيجة');
    }
  };

  // ✅ دالة للتحقق من حالة التصحيح
  // دالة تحديد المواضيع الضعيفة
  const getWeakTopics = (errors) => {
    const topicErrors = {};
    errors.forEach(error => {
      const topic = error.analysis.topic || 'general';
      topicErrors[topic] = (topicErrors[topic] || 0) + 1;
    });

    // اعتبار الموضوع ضعيفاً إذا كان عدد الأخطاء أكثر من 2
    return Object.entries(topicErrors)
      .filter(([_, count]) => count > 2)
      .map(([topic]) => topic);
  };

  // دالة تحديد نقاط القوة
  const getStrongTopics = (questions, errors) => {
    const topics = {};
    const errorTopics = new Set(errors.map(e => e.analysis.topic));

    questions.forEach(q => {
      const topic = q.topic || 'general';
      if (!errorTopics.has(topic)) {
        topics[topic] = (topics[topic] || 0) + 1;
      }
    });

    // اعتبار الموضوع قوياً إذا كان عدد الإجابات الصحيحة أكثر من 3
    return Object.entries(topics)
      .filter(([_, count]) => count > 3)
      .map(([topic]) => topic);
  };

  // دالة توليد توصيات التحسين
  const generateImprovementAreas = (errors) => {
    const recommendations = new Set();

    errors.forEach(error => {
      switch (error.analysis.error_type) {
        case ERROR_TYPES.CONCEPT_MISUNDERSTANDING:
          recommendations.add(`مراجعة مفاهيم ${error.analysis.topic || 'الموضوع'}`);
          break;
        case ERROR_TYPES.CALCULATION_ERROR:
          recommendations.add('تحسين مهارات الحساب والتركيز');
          break;
        case ERROR_TYPES.KNOWLEDGE_GAP:
          recommendations.add(`دراسة ${error.analysis.topic || 'الموضوع'} بشكل أعمق`);
          break;
        case ERROR_TYPES.LANGUAGE_BARRIER:
          recommendations.add('تحسين فهم المصطلحات والتعبيرات');
          break;
      }
    });

    return Array.from(recommendations);
  };

  const checkGradingStatus = async (attemptId) => {
    const { data: verifyResult, error: verifyErr } = await supabase
      .from('exam_attempts')
      .select('score, percentage, is_graded')
      .eq('id', takingExam.id)
      .single();

    if (verifyErr) throw verifyErr;
    console.log('🔍 النتيجة من قاعدة البيانات:', verifyResult);
    if (error) {
      console.error('خطأ في جلب حالة التصحيح:', error);
      return null;
    }

    return {
      'الحالة': data.status,
      'تم التصحيح': data.is_graded ? 'نعم ✅' : 'لا ❌',
      'الدرجة': data.score !== null ? `${data.score}` : 'غير محسوبة',
      'النسبة': data.percentage !== null ? `${data.percentage}%` : 'غير محسوبة'
    };
  };


  const updateTakingAnswer = (questionId, answer) => {
    setTakingAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const addQuestion = () => {
    setQuestions(prev => [...prev, {
      question_text: '',
      question_type: QUESTION_TYPES.MULTIPLE_CHOICE,
      options: ['', '', '', ''],
      correct_answer: 'A',
      max_marks: 1,
      explanation: '',
      image_url: '',
      grading_rubric: '',
      model_answer: '',
      question_order: prev.length + 1,
      topic: '',
      difficulty_level: 'medium'
    }]);
    setNumQuestions(prev => prev + 1);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(prev => {
        const copy = [...prev];
        copy.splice(index, 1);
        return copy;
      });
      setNumQuestions(prev => Math.max(1, prev - 1));
    }
  };

  const updateQuestion = (index, field, value) => {
    setQuestions(prev => {
      const copy = [...prev];
      const question = { ...copy[index] };

      // Handle special field updates
      if (field === 'question_type') {
        // Reset options based on question type
        if (value === QUESTION_TYPES.TRUE_FALSE) {
          question.options = ['صح', 'خطأ'];
          question.correct_answer = 'TRUE';
        } else if (value === QUESTION_TYPES.MULTIPLE_CHOICE) {
          question.options = ['', '', '', ''];
          question.correct_answer = 'A';
        } else {
          question.options = [];
          question.correct_answer = '';
        }
      }

      // Update all fields, including nested ones
      const fieldParts = field.split('.');
      if (fieldParts.length > 1) {
        let current = question;
        for (let i = 0; i < fieldParts.length - 1; i++) {
          if (!current[fieldParts[i]]) {
            current[fieldParts[i]] = {};
          }
          current = current[fieldParts[i]];
        }
        current[fieldParts[fieldParts.length - 1]] = value;
      } else {
        question[field] = value;
      }

      copy[index] = question;
      return copy;
    });
  };

  // رفع صورة لكل سؤال في نموذج الإنشاء
  const handleQuestionImageUpload = async (questionIndex, file) => {
    try {
      if (!file) return;

      // تحقق من النوع والحجم
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowed.includes(file.type)) {
        toast.error('نوع الملف غير مدعوم. استخدم صورة (JPG, PNG, WebP, GIF)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم الصورة كبير جداً - الحد الأقصى 5 ميجابايت');
        return;
      }

      toast.info('جاري رفع الصورة...', { toastId: `upload-q-${questionIndex}`, autoClose: false });

      const ext = file.name.split('.').pop();
      const name = `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
      const path = `exam-images/${name}`;

      const { error: uploadError } = await supabase.storage
        .from('exam-assets')
        .upload(path, file, { contentType: file.type, cacheControl: '3600' });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('exam-assets')
        .getPublicUrl(path);

      const publicUrl = data?.publicUrl || null;

      updateQuestion(questionIndex, 'image_url', publicUrl);
      updateQuestion(questionIndex, 'image_metadata', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        storagePath: path,
        uploadedAt: new Date().toISOString()
      });

      toast.dismiss(`upload-q-${questionIndex}`);
      toast.success('تم رفع صورة السؤال');
    } catch (err) {
      console.error('خطأ رفع صورة السؤال:', err);
      toast.dismiss(`upload-q-${questionIndex}`);
      toast.error('فشل رفع الصورة');
    }
  };

  const resetForm = () => {
    setExamForm({
      title: '',
      description: '',
      month: '',
      subject: '',
      course_id: null,
      lesson_id: null,
      level_scope: 'shared',
      duration_minutes: DEFAULT_DURATION_MIN,
      total_marks: 100,
      passing_score: 50,
      start_date: '',
      end_date: '',
      is_active: true,
      allow_review: true,
      shuffle_questions: false,
      shuffle_answers: false,
      attempts_allowed: 1,
      grading_scheme: {
        auto_grade: true,
        manual_review_needed: false,
        partial_credit: false
      },
      settings: {
        show_explanation: true,
        time_per_question: null,
        prevent_backward_navigation: false,
        randomize_options: true
      }
    });
    setQuestions([{
      question_text: '',
      question_type: QUESTION_TYPES.MULTIPLE_CHOICE,
      options: ['', '', '', ''],
      correct_answer: 'A',
      max_marks: 1,
      explanation: '',
      image_url: '',
      grading_rubric: '',
      model_answer: '',
      topic: '',
      difficulty_level: 'medium',
      time_limit: null,
      tags: [],
      feedback: {
        correct: '',
        incorrect: ''
      },
      metadata: {
        source: '',
        category: '',
        skill_level: 'beginner'
      },
      question_order: 1
    }]);
    setNumQuestions(1);
  };

  const openCreateForm = (exam = null) => {
    if (exam) {
      setEditingExam(exam);
      setExamForm({
        title: exam.title || '',
        description: exam.description || '',
        month: exam.month || '',
        subject: exam.subject || '',
        level_scope: exam.level_scope || 'shared', // ✅ إضافة
        duration_minutes: exam.duration_minutes || DEFAULT_DURATION_MIN,
        total_marks: exam.total_marks || 100,
        pass_marks: exam.pass_marks || 50,
        start_date: isoToInput(exam.start_date || null),
        end_date: isoToInput(exam.end_date || null),
        is_active: exam.is_active ?? true
      });
      loadExamQuestions(exam.id);
    } else {
      setEditingExam(null);
      resetForm();
    }
    setShowCreateForm(true);
  };
  // ✅ إضافة state جديد لتخزين المستوى واختيار النافذة


  // ✅ تعديل useEffect لعرض النافذة للطالب فقط
  useEffect(() => {
    if (currentUser && userRole !== 'admin' && !selectedLevel) {
      setShowLevelSelector(true);
    }
  }, [currentUser, userRole, selectedLevel]);

  // ✅ تعديل filterAndPaginateExams لتطبيق فلتر المستوى المحفوظ
  useEffect(() => {
    filterAndPaginateExams();
  }, [exams, searchTerm, filterMonth, filterSubject, filterStatus, activeTab, currentPage, selectedLevel, userRole]);

  // ✅ دالة لحفظ المستوى وإخفاء النافذة
  const handleLevelSelection = (level) => {
    setSelectedLevel(level);
    setActiveTab(level); // ✅ مهم جداً - عشان يشتغل الفلتر
    setShowLevelSelector(false);
    setCurrentPage(1);
    toast.success(`تم اختيار ${level === 'level1' ? 'المستوى الأول' : 'التمهيدي'} بنجاح`);
  };

  const loadExamQuestions = async (examId) => {
    try {
      const { data, error } = await supabase
        .from('exam_questions')
        .select('*')
        .eq('exam_id', examId)
        .order('question_order', { ascending: true });

      if (error) throw error;

      if (data && data.length) {
        const normalizedQuestions = data.map(d => {
          const baseQ = {
            question_text: d.question_text || '',
            question_type: d.question_type || QUESTION_TYPES.MULTIPLE_CHOICE,
            correct_answer: d.correct_answer || 'A',
            max_marks: Number(d.max_marks || 1),
            explanation: d.explanation || '',
            image_url: d.image_url || '',
            topic: d.topic || '',
            difficulty_level: d.difficulty_level || 'medium'
          };

          if (d.question_type === QUESTION_TYPES.TRUE_FALSE) {
            return {
              ...baseQ,
              options: ['TRUE', 'FALSE']
            };
          } else if (d.question_type === QUESTION_TYPES.MULTIPLE_CHOICE) {
            return {
              ...baseQ,
              option_a: d.option_a || '',
              option_b: d.option_b || '',
              option_c: d.option_c || '',
              option_d: d.option_d || '',
              options: [
                d.option_a || '',
                d.option_b || '',
                d.option_c || '',
                d.option_d || ''
              ]
            };
          } else if (d.question_type === QUESTION_TYPES.ESSAY) {
            return {
              ...baseQ,
              model_answer: d.model_answer || '',
              grading_rubric: d.grading_rubric || ''
            };
          } else if (d.question_type === QUESTION_TYPES.CORRECT_UNDERLINED) {
            return {
              ...baseQ,
              option_a: d.option_a || ''
            };
          }

          return baseQ;
        });

        setQuestions(normalizedQuestions);
        setNumQuestions(data.length);
      } else {
        resetForm();
      }
    } catch (err) {
      console.error('خطأ في تحميل أسئلة الامتحان:', err);
      toast.error('فشل تحميل الأسئلة');
    }
  };

  const uniqueMonths = [...new Set(exams.map(exam => exam.month).filter(Boolean))];
  const uniqueSubjects = [...new Set(exams.map(exam => exam.subject).filter(Boolean))];

  const totalPages = Math.ceil(exams.length / itemsPerPage);
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // حفظ التصحيح اليدوي
  const saveEssayGrading = async () => {
    try {
      setIsGradingSaving(true);
      const updatedAnswers = Object.entries(gradingData).map(([answerId, marks]) => ({
        id: answerId,
        marks_obtained: Number(marks),
        teacher_feedback: gradingFeedback[answerId] || '',
        graded_by: currentUser.id,
        graded_at: new Date().toISOString(),
        is_graded: true
      }));

      const { error } = await supabase
        .from('student_answers')
        .upsert(updatedAnswers);

      if (error) throw error;

      // تحديث الدرجة الكلية للمحاولة
      await updateAttemptTotalScore(currentGradingAttempt.id);

      toast.success('تم حفظ التصحيح بنجاح');
      setShowGradingModal(false);
      setCurrentGradingAttempt(null);
      setGradingData({});
      setGradingFeedback({});
      fetchExams(); // تحديث القائمة

    } catch (error) {
      console.error('خطأ في حفظ التصحيح:', error);
      toast.error('فشل في حفظ التصحيح');
    } finally {
      setIsGradingSaving(false);
    }
  };

  // تحديث المجموع الكلي للمحاولة
  const updateAttemptTotalScore = async (attemptId) => {
    try {
      const { data: answers, error: answersError } = await supabase
        .from('student_answers')
        .select('marks_obtained')
        .eq('attempt_id', attemptId);

      if (answersError) throw answersError;

      const totalScore = answers.reduce((sum, ans) => sum + (Number(ans.marks_obtained) || 0), 0);

      const { error: updateError } = await supabase
        .from('exam_attempts')
        .update({
          total_score: totalScore,
          status: 'graded',
          updated_at: new Date().toISOString()
        })
        .eq('id', attemptId);

      if (updateError) throw updateError;

    } catch (error) {
      console.error('خطأ في تحديث الدرجة الكلية:', error);
      throw error;
    }
  };

  const formatTime = (s) => {
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const answeredCount = takingExam?.questions ?
    takingExam.questions.filter(q => takingAnswers[q.id]).length : 0;
  const totalQuestions = takingExam?.questions?.length || 0;

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
  // 1) محاولاتي المكتملة
  const getMyCompletedAttempts = () => {
    return exams
      .map(ex => {
        const att = studentAttempts[ex.id];
        if (att && att.status === 'submitted') return { exam: ex, att };
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a.att.submitted_at || 0) - new Date(b.att.submitted_at || 0));
  };

  // 2) ظهور الزر بعد ساعتين
  const isCertificateAvailable = () => {
    const rows = getMyCompletedAttempts();
    if (rows.length === 0) return false;
    return rows.some(r => canViewResult(r.att)); // يعتمد على RESULT_VISIBILITY_HOURS = 2
  };

  // 3) ملخص إجمالي
  const summarizeCompletedAttempts = (rows) => {
    const totalMarks = rows.reduce((s, r) => s + Number(r.exam.total_marks || 0), 0);
    const totalScore = rows.reduce((s, r) => s + Number(r.att.score || 0), 0);
    const percentage = totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0;
    return { totalMarks, totalScore, percentage: Number(percentage.toFixed(1)) };
  };

  // 4) توليد الشهادة
  const generateAllExamsCertificate = async () => {
    try {
      setIsCertGenerating(true);
      const rows = getMyCompletedAttempts();

      // ========== التحقق من البيانات ==========
      if (rows.length === 0) {
        toast.error('لا توجد امتحانات مكتملة لديك بعد.');
        return;
      }
      if (!rows.some(r => canViewResult(r.att))) {
        toast.info('الشهادة ستتاح بعد مرور ساعتين من تسليم أول امتحان.');
        return;
      }

      // ========== استيراد المكتبات بشكل متوازي ==========
      console.log('📦 جاري تحميل المكتبات...');
      const [{ default: html2canvas }, jspdfMod, { default: QRCode }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
        import('qrcode')
      ]);
      const { jsPDF } = jspdfMod;
      console.log('✅ تم تحميل المكتبات بنجاح');

      // ========== إعداد البيانات ==========
      const sum = summarizeCompletedAttempts(rows);
      const serial = `RL-ALL-${new Date().toISOString().slice(0, 10)}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const verifyUrl = `https://yourdomain.com/cert/verify?serial=${encodeURIComponent(serial)}`;
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        width: 180,
        margin: 1,
        errorCorrectionLevel: 'M'
      });

      // ========== صفحة 1: الشهادة ==========
      console.log('📄 جاري إنشاء صفحة الشهادة...');
      const el = certRef.current;
      if (!el) throw new Error('لم يتم العثور على عنصر القالب');

      // تعبئة البيانات الأساسية
      el.querySelector('[data-field="platform"]').textContent = 'واحة العلم التعليمية';
      el.querySelector('[data-field="student"]').textContent = userName || 'الطالب';
      el.querySelector('[data-field="date"]').textContent = new Date().toLocaleDateString('ar-EG');
      el.querySelector('[data-field="serial"]').textContent = serial;
      el.querySelector('[data-field="qr"]').src = qrDataUrl;
      el.querySelector('[data-field="total"]').textContent = `${sum.totalScore} / ${sum.totalMarks} (${sum.percentage}%)`;

      // بناء جدول الامتحانات
      const tbody = el.querySelector('[data-field="rows"]');
      tbody.innerHTML = rows.map(({ exam, att }, i) => {
        const passPct = (exam.pass_marks / (exam.total_marks || 1)) * 100;
        const isPass = (att.percentage || 0) >= passPct;
        const submitted = att.submitted_at
          ? new Date(att.submitted_at).toLocaleString('ar-EG', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
          })
          : '-';

        return `
        <tr>
          <td style="padding:6px;border:1px solid #ddd;text-align:center;">${i + 1}</td>
          <td style="padding:6px;border:1px solid #ddd;">${exam.title || '-'}</td>
          <td style="padding:6px;border:1px solid #ddd;">${exam.subject || '-'}</td>
          <td style="padding:6px;border:1px solid #ddd;text-align:center;font-weight:bold;">${att.score}/${exam.total_marks}</td>
          <td style="padding:6px;border:1px solid #ddd;text-align:center;">${(att.percentage || 0).toFixed(1)}%</td>
          <td style="padding:6px;border:1px solid #ddd;text-align:center;color:${isPass ? '#2e7d32' : '#c62828'};font-weight:bold;">
            ${isPass ? '✓ ناجح' : '✗ راسب'}
          </td>
          <td style="padding:6px;border:1px solid #ddd;font-size:10px;">${submitted}</td>
        </tr>
      `;
      }).join('');

      // ✅ انتظار تحميل الخطوط والصور قبل التصوير
      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 300));

      // تحويل الشهادة لصورة بجودة عالية
      console.log('📸 جاري تصوير صفحة الشهادة...');
      const canvas1 = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 0
      });
      const img1 = canvas1.toDataURL('image/png', 0.95);
      console.log('✅ تم تصوير الشهادة بنجاح');

      // ========== إنشاء PDF ==========
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
        compress: true
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // إضافة صفحة الشهادة
      pdf.addImage(img1, 'PNG', 0, 0, pageWidth, pageHeight, '', 'FAST');

      // ========== جلب الأخطاء ==========
      const attemptIds = rows.map(r => r.att.id);
      console.log(`🔍 جاري جلب الأخطاء لـ ${attemptIds.length} محاولة...`);

      const { data: wrongAnswers, error: wrongErr } = await supabase
        .from('exam_answers')
        .select(`
        id,
        attempt_id,
        question_id,
        selected_answer,
        exam_questions!inner (
          id,
          question_text,
          correct_answer,
          option_a,
          option_b,
          option_c,
          option_d,
          question_type
        )
      `)
        .in('attempt_id', attemptIds)
        .eq('is_correct', false)
        .order('attempt_id', { ascending: true });

      if (wrongErr) {
        console.error('❌ خطأ في جلب الأخطاء:', wrongErr);
        throw new Error(`فشل جلب الأخطاء: ${wrongErr.message}`);
      }

      // التحقق من وجود أخطاء
      const hasErrors = wrongAnswers?.length > 0;
      console.log(`📊 عدد الأخطاء المستردة: ${wrongAnswers?.length || 0}`);

      // ========== صفحة 2: تحليل الأخطاء ==========
      if (hasErrors) {
        console.log('📝 جاري إنشاء صفحة تحليل الأخطاء...');

        // تجميع الأخطاء حسب الامتحان
        const errorsByExam = new Map();

        wrongAnswers.forEach(ans => {
          const attempt = rows.find(r => r.att.id === ans.attempt_id);
          if (!attempt) {
            console.warn(`⚠️ محاولة غير موجودة: ${ans.attempt_id}`);
            return;
          }

          const examKey = attempt.exam.id;
          if (!errorsByExam.has(examKey)) {
            errorsByExam.set(examKey, {
              examTitle: attempt.exam.title,
              examSubject: attempt.exam.subject,
              submittedAt: attempt.att.submitted_at,
              errors: []
            });
          }

          errorsByExam.get(examKey).errors.push({
            ...ans,
            question: ans.exam_questions
          });
        });

        console.log(`📚 تم تجميع ${errorsByExam.size} امتحان بأخطاء`);

        // بناء صفحة HTML للأخطاء
        const errorsPage = document.createElement('div');
        errorsPage.style.cssText = `
        width: 794px;
        min-height: 1123px;
        background: white;
        padding: 40px;
        box-sizing: border-box;
        font-family: 'Almarai', 'Cairo', -apple-system, BlinkMacSystemFont, sans-serif;
        direction: rtl;
        position: fixed;
        left: -9999px;
        top: 0;
        z-index: -1;
      `;

        // Header مع تصميم محسّن
        errorsPage.innerHTML = `
        <div style="text-align: center; border-bottom: 3px solid #665446; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #665446; font-size: 32px; margin: 0 0 10px 0; font-weight: 700;">
            📋 تحليل تفصيلي للأخطاء
          </h1>
          <p style="color: #333; font-size: 18px; margin: 5px 0; font-weight: 600;">
            ${userName || 'الطالب'}
          </p>
          <div style="display: inline-flex; gap: 20px; margin-top: 10px; font-size: 14px; color: #666;">
            <span>📊 إجمالي الأخطاء: <strong style="color: #ef5350;">${wrongAnswers.length}</strong></span>
            <span>📚 عدد الامتحانات: <strong style="color: #665446;">${errorsByExam.size}</strong></span>
          </div>
        </div>
      `;

        // بناء محتوى الأخطاء
        let errorsHTML = '';
        let errorCounter = 0;

        Array.from(errorsByExam.values()).forEach((examData, examIdx) => {
          console.log(`✏️ معالجة امتحان ${examIdx + 1}: "${examData.examTitle}" - ${examData.errors.length} خطأ`);

          errorsHTML += `
          <div style="margin-bottom: 30px; page-break-inside: avoid;">
            <div style="background: linear-gradient(135deg, #665446 0%, #8b6f47 100%); 
                        padding: 15px 20px; border-radius: 12px; margin-bottom: 20px; 
                        box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
              <h2 style="color: white; font-size: 20px; margin: 0 0 8px 0; font-weight: 700;">
                ${examIdx + 1}. ${examData.examTitle}
              </h2>
              <div style="display: flex; gap: 15px; font-size: 13px; color: rgba(255,255,255,0.9);">
                <span>📚 ${examData.examSubject}</span>
                <span>❌ ${examData.errors.length} ${examData.errors.length === 1 ? 'خطأ' : 'أخطاء'}</span>
              </div>
            </div>
            <div style="display: grid; gap: 15px;">
        `;

          examData.errors.forEach((error) => {
            errorCounter++;
            const q = error.question;

            if (!q) {
              console.warn(`⚠️ سؤال مفقود للخطأ: ${error.id}`);
              return;
            }

            const isTrueFalse = q.question_type === 'true_false';

            // دالة محسّنة لعرض النص
            const getAnswerDisplay = (answer) => {
              if (!answer) return { text: 'لم يتم الإجابة', color: '#999' };

              if (isTrueFalse) {
                return answer === 'TRUE'
                  ? { text: '✓ صح', color: '#2e7d32' }
                  : { text: '✗ خطأ', color: '#c62828' };
              }

              const options = {
                'A': { text: q.option_a, label: 'أ' },
                'B': { text: q.option_b, label: 'ب' },
                'C': { text: q.option_c, label: 'ج' },
                'D': { text: q.option_d, label: 'د' }
              };

              const opt = options[answer];
              return opt
                ? { text: `${opt.label}) ${opt.text || 'نص غير متوفر'}`, color: '#333' }
                : { text: answer, color: '#666' };
            };

            const userAnswer = getAnswerDisplay(error.selected_answer);
            const correctAnswer = getAnswerDisplay(q.correct_answer);

            errorsHTML += `
            <div style="background: white; border: 2px solid #ffcdd2; border-radius: 10px; 
                        padding: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.08); 
                        transition: all 0.3s ease;">
              
              <div style="display: flex; gap: 12px; margin-bottom: 15px;">
                <span style="background: linear-gradient(135deg, #ef5350 0%, #e53935 100%); 
                             color: white; border-radius: 50%; width: 36px; height: 36px; 
                             display: flex; align-items: center; justify-content: center; 
                             font-weight: 700; font-size: 16px; flex-shrink: 0; 
                             box-shadow: 0 2px 4px rgba(239,83,80,0.3);">
                  ${errorCounter}
                </span>
                <div style="flex: 1;">
                  <p style="margin: 0; font-size: 16px; color: #222; font-weight: 600; 
                            line-height: 1.6; word-wrap: break-word;">
                    ${q.question_text || 'نص السؤال غير متوفر'}
                  </p>
                  <span style="display: inline-block; margin-top: 8px; padding: 4px 10px; 
                               background: ${isTrueFalse ? '#e3f2fd' : '#f3e5f5'}; 
                               color: ${isTrueFalse ? '#1565c0' : '#6a1b9a'}; 
                               font-size: 11px; border-radius: 12px; font-weight: 600;">
                    ${isTrueFalse ? '✓/✗ صح أو خطأ' : '🔘 اختيار متعدد'}
                  </span>
                </div>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; 
                          margin-top: 15px;">
                <div style="background: #ffebee; padding: 14px; border-radius: 8px; 
                            border-left: 4px solid #ef5350;">
                  <div style="color: #c62828; font-size: 12px; font-weight: 700; 
                             margin-bottom: 6px; letter-spacing: 0.3px;">
                    ❌ إجابتك الخاطئة
                  </div>
                  <div style="color: ${userAnswer.color}; font-size: 14px; 
                             font-weight: 500; line-height: 1.5; word-wrap: break-word;">
                    ${userAnswer.text}
                  </div>
                </div>
                
                <div style="background: #e8f5e9; padding: 14px; border-radius: 8px; 
                            border-left: 4px solid #4caf50;">
                  <div style="color: #2e7d32; font-size: 12px; font-weight: 700; 
                             margin-bottom: 6px; letter-spacing: 0.3px;">
                    ✓ الإجابة الصحيحة
                  </div>
                  <div style="color: ${correctAnswer.color}; font-size: 14px; 
                             font-weight: 500; line-height: 1.5; word-wrap: break-word;">
                    ${correctAnswer.text}
                  </div>
                </div>
              </div>
            </div>
          `;
          });

          errorsHTML += `
            </div>
          </div>
        `;
        });

        errorsPage.innerHTML += errorsHTML;

        // إضافة footer
        errorsPage.innerHTML += `
        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e0e0e0; 
                    text-align: center; color: #666; font-size: 12px;">
          <p style="margin: 5px 0;">
            💡 <strong>نصيحة:</strong> راجع هذه الأخطاء جيداً لتحسين أدائك في المستقبل
          </p>
          <p style="margin: 5px 0; color: #999;">
            تم إنشاء هذا التقرير بواسطة واحة العلم التعليمية
          </p>
        </div>
      `;

        // إضافة للـ DOM
        document.body.appendChild(errorsPage);

        // انتظار التحميل الكامل
        await document.fonts.ready;
        await new Promise(resolve => setTimeout(resolve, 500));

        // تصوير صفحة الأخطاء
        console.log('📸 جاري تصوير صفحة الأخطاء...');
        const canvas2 = await html2canvas(errorsPage, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          logging: false,
          imageTimeout: 0,
          onclone: (clonedDoc) => {
            // تأكد من تطبيق الأنماط على النسخة المستنسخة
            const clonedEl = clonedDoc.querySelector('[style*="left: -9999px"]');
            if (clonedEl) {
              clonedEl.style.left = '0';
              clonedEl.style.position = 'static';
            }
          }
        });

        const img2 = canvas2.toDataURL('image/png', 0.95);
        console.log('✅ تم تصوير صفحة الأخطاء بنجاح');

        // إضافة صفحة جديدة
        pdf.addPage();
        pdf.addImage(img2, 'PNG', 0, 0, pageWidth, pageHeight, '', 'FAST');
        console.log('✅ تم إضافة صفحة الأخطاء إلى PDF');

        // تنظيف
        document.body.removeChild(errorsPage);
        console.log('🧹 تم تنظيف DOM');
      } else {
        console.log('ℹ️ لا توجد أخطاء - تم إنشاء الشهادة فقط');
      }

      // ========== حفظ الملف ==========
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const fileName = `شهادة-${userName?.replace(/\s+/g, '-') || 'طالب'}-${timestamp}.pdf`;
      pdf.save(fileName);

      // رسالة نجاح مخصصة
      const successMessage = hasErrors
        ? `✅ تم تحميل الشهادة مع تحليل ${wrongAnswers.length} ${wrongAnswers.length === 1 ? 'خطأ' : 'خطأ'} بنجاح!`
        : '✅ تم تحميل الشهادة بنجاح! (أداء ممتاز بدون أخطاء 🎉)';

      console.log(`💾 تم حفظ الملف: ${fileName}`);
      toast.success(successMessage);

    } catch (error) {
      console.error('❌ خطأ حرج في توليد الشهادة:', error);

      // رسالة خطأ أكثر وضوحاً
      let errorMessage = 'تعذّر توليد الشهادة';
      if (error.message?.includes('fetch')) {
        errorMessage = 'خطأ في الاتصال بقاعدة البيانات';
      } else if (error.message?.includes('canvas')) {
        errorMessage = 'خطأ في معالجة الصورة';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(`${errorMessage} ❌`);
    } finally {
      setIsCertGenerating(false);
    }
  };

  return (
    <AnimatedBackground className="min-h-screen" dir="rtl">
      {/* قالب الشهادة - مخفي */}
      <div ref={certRef} style={{ position: 'fixed', left: '-9999px', direction: 'rtl' }} className="w-[794px] h-[1123px] bg-white p-8">
        <div className="border-8 border-double border-[#665446] h-full p-8">
          {/* رأس الشهادة */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#665446] mb-2" data-field="platform">واحة العلم التعليمية</h1>
            <div className="text-2xl font-bold text-[#806445]">شهادة إتمام الاختبارات الشهرية</div>
          </div>

          {/* محتوى الشهادة */}
          <div className="space-y-6">
            <p className="text-xl text-center">
              نشهد أن الطالب/ـة <strong className="text-[#665446]" data-field="student"></strong>
              <br />قد أتم/ت الاختبارات الشهرية بنجاح
            </p>

            {/* جدول النتائج */}
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

          {/* توقيع الشهادة */}
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
          enableMultiContainer={false}  // ✅ هذا السطر مهم
          containerId="main-toast"       // ✅ وهذا
          style={{ zIndex: 9999 }}
        />
        {/* ✅ بانِل حلّ الامتحان داخل الصفحة — بدون نافذة منبثقة */}
        {/* ✅ بانِل حلّ الامتحان داخل الصفحة — بدون نافذة منبثقة */}
        {takingExam && (
          <div
            className="flex-1 overflow-auto animate-fadeIn"
            id="exam-taking-panel"
            style={{
              animation: 'fadeInDown 0.5s ease-out'
            }}
          >
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
                {/* Header */}
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

                  {/* Progress */}
                  <div className="w-full h-2 bg-white/20">
                    <div
                      className="h-full bg-white transition-all duration-300"
                      style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                    />
                  </div>
                </header>

                {/* Body */}
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
                            // True/False Options
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
                            // Multiple Choice Options
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
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Footer */}
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


        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2 font-[Almarai]" style={{ color: TEXT_COLOR }}>
                  الامتحانات الشهرية
                </h1>
                <p className="text-sm sm:text-base opacity-80 font-[Almarai]" style={{ color: TEXT_COLOR }}>
                  مرحباً {userName} ({userRole === 'admin' ? 'مشرف' : 'طالب'})
                </p>
              </div>

              {/* ✅ تبويبات المستويات للطلاب فقط */}
              {userRole !== 'admin' && (
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
              )}

              {/* ✅ زر تحميل الشهادة للطالب فقط */}
              {userRole !== 'admin' && (
                <button
                  onClick={generateAllExamsCertificate}
                  disabled={!isCertificateAvailable() || isCertGenerating}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold font-[Almarai] transition-all ${(!isCertificateAvailable() || isCertGenerating)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                    }`}
                  title="تحميل الشهادة (تظهر بعد مرور ساعتين من أول امتحان مكتمل)"
                >
                  تحميل الشهادة PDF
                </button>
              )}
              {/* ⬆️ نهاية زر الطالب */}

              {userRole === 'admin' && (
                <button
                  onClick={() => openCreateForm()}
                  className="flex items-center gap-2 px-6 py-3 bg-[#665446] hover:bg-[#8B7355] text-white rounded-lg font-bold font-[Almarai] transition-all shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  إنشاء امتحان جديد
                </button>
              )}
            </div>


            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#665446] focus:outline-none font-[Almarai]"
                >
                  <option value="all">كل الحالات</option>
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
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
                          {userRole === 'admin' && (
                            <>
                              <div className="flex justify-between text-sm font-[Almarai]">
                                <span className="text-gray-600">عدد المحاولات:</span>
                                <span className="font-semibold" style={{ color: TEXT_COLOR }}>
                                  {exam.attempts_count || 0}
                                </span>
                              </div>
                              {exam.attempts_count > 0 && (
                                <div className="flex justify-between text-sm font-[Almarai]">
                                  <span className="text-gray-600">المتوسط:</span>
                                  <span className="font-semibold" style={{ color: TEXT_COLOR }}>
                                    {exam.attempts_avg?.toFixed(1)}%
                                  </span>
                                </div>
                              )}
                            </>
                          )}
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

                        {userRole !== 'admin' && hasCompleted && (
                          <div className="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                            <p className="text-sm font-bold text-blue-700 mb-1 font-[Almarai]">
                              ✅ تم إنهاء الامتحان
                            </p>
                            {canView ? (
                              <p className="text-xs text-blue-600 font-[Almarai]">
                                حمل الشهادة لتعلم نتيجه الاختبار
                              </p>
                            ) : (
                              <p className="text-xs text-blue-600 font-[Almarai]">
                                ستظهر النتيجة بعد: {timeUntil}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="flex gap-2">
                          {userRole === 'admin' ? (
                            <>
                              <button
                                onClick={() => viewExamResults(exam)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold font-[Almarai] transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                النتائج
                              </button>
                              <button
                                onClick={() => openCreateForm(exam)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#665446] hover:bg-[#8B7355] text-white rounded-lg font-bold font-[Almarai] transition-colors"
                              >
                                تعديل
                              </button>
                              <button
                                onClick={() => deleteExam(exam.id)}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
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
                          )}
                        </div>
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

        {/* ✅ نموذج محدث يدعم أسئلة الاختيار من متعدد وأسئلة صح/خطأ */}
        {showCreateForm && (
          <section className="max-w-7xl mx-auto mb-8 px-2 sm:px-4" ref={formRef} dir="rtl">
            <div className="relative rounded-2xl shadow-xl border border-[#E6D9C8] overflow-hidden bg-white/80 backdrop-blur">
              {/* Header */}
              <header className="sticky top-0 z-20 rounded-2xl bg-gradient-to-r from-[#665446] to-[#8B7355] text-white shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 sm:px-6 py-4">
                  <div className="min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold font-[Almarai] truncate">
                      {editingExam ? 'تعديل الامتحان' : 'إنشاء امتحان جديد'}
                    </h2>
                    <p className="text-xs sm:text-sm opacity-90 font-[Almarai]">
                      املأ الحقول المطلوبة ثم اضغط حفظ
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                      setEditingExam(null);
                    }}
                    className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-3 py-2 hover:bg-white/20 transition"
                    title="إغلاق"
                  >
                    <X className="w-5 h-5" />
                    <span className="hidden sm:inline font-[Almarai]">إغلاق</span>
                  </button>
                </div>
              </header>

              {/* Body */}
              <div className="p-4 sm:p-6">
                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                      عنوان الامتحان *
                    </label>
                    <input
                      type="text"
                      value={examForm.title ?? ''}
                      onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                      placeholder="مثال: امتحان شهر سبتمبر"
                      className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                      المادة *
                    </label>
                    <input
                      type="text"
                      value={examForm.subject ?? ''}
                      onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })}
                      placeholder="مثال: الرياضيات"
                      className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                      الشهر *
                    </label>
                    <input
                      type="text"
                      value={examForm.month ?? ''}
                      onChange={(e) => setExamForm({ ...examForm, month: e.target.value })}
                      placeholder="مثال: سبتمبر"
                      className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                    />
                    <div className="space-y-2">
                      <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                        المستوى *
                      </label>
                      <select
                        value={examForm.level_scope ?? 'shared'}
                        onChange={(e) => setExamForm({ ...examForm, level_scope: e.target.value })}
                        className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                      >
                        <option value="shared">مشترك (كل المستويات)</option>
                        <option value="level1">المستوى الأول</option>
                        <option value="level2">التمهيدي</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                      المدة (بالدقائق)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={examForm.duration_minutes ?? DEFAULT_DURATION_MIN}
                      onChange={(e) => setExamForm({ ...examForm, duration_minutes: e.target.value })}
                      className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                      الدرجة الكلية
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={examForm.total_marks ?? 100}
                      onChange={(e) => setExamForm({ ...examForm, total_marks: e.target.value })}
                      className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                      درجة النجاح
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={examForm.pass_marks ?? 50}
                      onChange={(e) => setExamForm({ ...examForm, pass_marks: e.target.value })}
                      className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                      تاريخ البدء *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={examForm.start_date ?? ''}
                      onChange={(e) => setExamForm({ ...examForm, start_date: e.target.value })}
                      className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                      تاريخ الانتهاء *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      min={examForm.start_date || undefined}
                      value={examForm.end_date ?? ''}
                      onChange={(e) => setExamForm({ ...examForm, end_date: e.target.value })}
                      className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                    />
                  </div>
                </div>

                {/* Description + Toggle */}
                <div className="mt-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
                  <div className="xl:col-span-2 space-y-2">
                    <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                      الوصف
                    </label>
                    <textarea
                      rows={3}
                      value={examForm.description ?? ''}
                      onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                      placeholder="وصف مختصر للامتحان..."
                      className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-3 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                    />
                  </div>

                  <div className="flex items-center justify-between xl:justify-start xl:gap-4 rounded-xl border-2 border-gray-200/80 bg-gray-50 px-4 py-3">
                    <label htmlFor="is_active" className="text-sm font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                      تفعيل الامتحان
                    </label>
                    <input
                      id="is_active"
                      type="checkbox"
                      checked={!!examForm.is_active}
                      onChange={(e) => setExamForm({ ...examForm, is_active: e.target.checked })}
                      className="h-5 w-5 accent-[#665446]"
                    />
                  </div>
                </div>

                {/* Questions Header */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <h3 className="text-lg sm:text-xl font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                    الأسئلة
                  </h3>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-[Almarai]" style={{ color: TEXT_COLOR }}>
                      عدد الأسئلة:
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(e.target.value)}
                      className="w-24 rounded-xl border-2 border-gray-200/80 bg-white px-3 py-2 text-center font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                    />
                    <button
                      onClick={addQuestion}
                      className="inline-flex items-center gap-2 rounded-xl bg-gray-200 hover:bg-gray-300 px-4 py-2 font-bold font-[Almarai] text-gray-800 transition"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة سؤال
                    </button>
                  </div>
                </div>

                {/* Questions List */}
                <div className="mt-4 space-y-4">
                  {questions.map((q, index) => (
                    <details key={index} open className="group rounded-2xl border-2 border-gray-200/80 bg-white">
                      <summary className="flex items-center justify-between gap-3 cursor-pointer rounded-2xl px-4 sm:px-5 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#665446] text-white font-bold text-sm">
                            {index + 1}
                          </span>
                          <span className="truncate font-[Almarai] text-sm" style={{ color: TEXT_COLOR }}>
                            {q.question_text?.trim() ? q.question_text : 'سؤال جديد'}
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg font-[Almarai]">
                            {q.question_type === 'true_false' ? 'صح/خطأ' : 'اختيار متعدد'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {questions.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                removeQuestion(index);
                              }}
                              className="rounded-lg bg-red-50 px-3 py-2 text-red-600 hover:bg-red-100 transition"
                              title="حذف السؤال"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <span className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-[Almarai] text-gray-600 group-open:rotate-180 transition">
                            ▼
                          </span>
                        </div>
                      </summary>

                      <div className="px-4 sm:px-5 pb-5 pt-1">
                        <div className="space-y-4">


                          <div className="space-y-4">
                            {/* نوع السؤال */}
                            <div className="space-y-2">
                              <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                                نوع السؤال *
                              </label>
                              <select
                                value={q.question_type ?? QUESTION_TYPES.MULTIPLE_CHOICE}
                                onChange={(e) => updateQuestion(index, 'question_type', e.target.value)}
                                className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                              >
                                <option value="multiple_choice">اختيار من متعدد</option>
                                <option value="true_false">صح أو خطأ</option>
                                <option value="essay">سؤال مقالي</option>
                                <option value="correct_underlined">تصحيح ما تحته خط</option>
                              </select>
                            </div>

                            {/* نص السؤال */}
                            <div className="space-y-2">
                              <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                                نص السؤال *
                              </label>
                              <textarea
                                rows={3}
                                value={q.question_text ?? ''}
                                onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                                placeholder="اكتب السؤال هنا..."
                                className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-3 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                              />
                            </div>

                            {/* درجة السؤال */}
                            <div className="space-y-2">
                              <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                                درجة السؤال *
                              </label>
                              <input
                                type="number"
                                value={q.max_marks ?? 1}
                                onChange={(e) => updateQuestion(index, 'max_marks', parseInt(e.target.value) || 1)}
                                min="1"
                                className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                              />
                            </div>

                            {/* مستوى الصعوبة */}
                            <div className="space-y-2">
                              <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                                مستوى الصعوبة
                              </label>
                              <select
                                value={q.difficulty_level ?? DIFFICULTY_LEVELS.MEDIUM}
                                onChange={(e) => updateQuestion(index, 'difficulty_level', e.target.value)}
                                className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                              >
                                <option value="easy">سهل</option>
                                <option value="medium">متوسط</option>
                                <option value="hard">صعب</option>
                              </select>
                            </div>

                            {/* ========== نماذج الإجابات حسب نوع السؤال ========== */}

                            {/* 1️⃣ صح أو خطأ */}
                            {q.question_type === 'true_false' && (
                              <div className="space-y-2 bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                                <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                                  الإجابة الصحيحة *
                                </label>
                                <select
                                  value={q.correct_answer ?? ''}
                                  onChange={(e) => updateQuestion(index, 'correct_answer', e.target.value)}
                                  className="w-full rounded-xl border-2 border-blue-300 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                                >
                                  <option value="TRUE">✓ صح</option>
                                  <option value="FALSE">✗ خطأ</option>
                                </select>
                              </div>
                            )}

                            {/* 2️⃣ اختيار من متعدد */}
                            {q.question_type === 'multiple_choice' && (
                              <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                                      الخيار أ *
                                    </label>
                                    <input
                                      type="text"
                                      value={q.option_a ?? ''}
                                      onChange={(e) => updateQuestion(index, 'option_a', e.target.value)}
                                      placeholder="النص هنا..."
                                      className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                                      الخيار ب *
                                    </label>
                                    <input
                                      type="text"
                                      value={q.option_b ?? ''}
                                      onChange={(e) => updateQuestion(index, 'option_b', e.target.value)}
                                      placeholder="النص هنا..."
                                      className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                                      الخيار ج *
                                    </label>
                                    <input
                                      type="text"
                                      value={q.option_c ?? ''}
                                      onChange={(e) => updateQuestion(index, 'option_c', e.target.value)}
                                      placeholder="النص هنا..."
                                      className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                                      الخيار د *
                                    </label>
                                    <input
                                      type="text"
                                      value={q.option_d ?? ''}
                                      onChange={(e) => updateQuestion(index, 'option_d', e.target.value)}
                                      placeholder="النص هنا..."
                                      className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                                    الإجابة الصحيحة *
                                  </label>
                                  <select
                                    value={q.correct_answer ?? 'A'}
                                    onChange={(e) => updateQuestion(index, 'correct_answer', e.target.value)}
                                    className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                                  >
                                    {ENGLISH_OPTIONS.map((opt) => (
                                      <option key={opt} value={opt}>
                                        {OPTION_DISPLAY[opt]}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </>
                            )}

                            {/* 3️⃣ تصحيح ما تحته خط */}
                            {q.question_type === 'correct_underlined' && (
                              <div className="space-y-3 bg-amber-50 p-4 rounded-xl border-2 border-amber-200">
                                <div className="space-y-2">
                                  <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                                    النص أو الكلمة الخاطئة *
                                  </label>
                                  <input
                                    type="text"
                                    value={q.option_a || ''}
                                    onChange={(e) => updateQuestion(index, 'option_a', e.target.value)}
                                    placeholder="مثال: القاهره عاصمة مصر"
                                    className="w-full rounded-xl border-2 border-amber-300 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                                  />
                                  <p className="text-xs text-gray-600 font-[Almarai]">
                                    💡 هذا هو النص الذي يحتوي على الخطأ المطلوب تصحيحه
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                                    التصحيح الصحيح *
                                  </label>
                                  <input
                                    type="text"
                                    value={q.correct_answer || ''}
                                    onChange={(e) => updateQuestion(index, 'correct_answer', e.target.value)}
                                    placeholder="مثال: القاهرة عاصمة مصر"
                                    className="w-full rounded-xl border-2 border-green-300 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                                  />
                                  <p className="text-xs text-gray-600 font-[Almarai]">
                                    ✅ هذه هي الإجابة الصحيحة بعد التصحيح
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                                    شرح الخطأ (اختياري)
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={q.explanation || ''}
                                    onChange={(e) => updateQuestion(index, 'explanation', e.target.value)}
                                    placeholder="مثال: الخطأ في كتابة التاء المربوطة بالهاء"
                                    className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-3 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                                  />
                                </div>
                              </div>
                            )}

                            {/* 4️⃣ سؤال مقالي */}
                            {q.question_type === 'essay' && (
                              <div className="space-y-3 bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
                                <div className="space-y-2">
                                  <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                                    الإجابة النموذجية (للمعلم فقط) *
                                  </label>
                                  <textarea
                                    rows={4}
                                    value={q.model_answer || ''}
                                    onChange={(e) => updateQuestion(index, 'model_answer', e.target.value)}
                                    placeholder="اكتب الإجابة المثالية التي تتوقعها من الطالب..."
                                    className="w-full rounded-xl border-2 border-purple-300 bg-white px-4 py-3 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                                    معايير التصحيح (Rubric) *
                                  </label>
                                  <textarea
                                    rows={3}
                                    value={q.grading_rubric || ''}
                                    onChange={(e) => updateQuestion(index, 'grading_rubric', e.target.value)}
                                    placeholder={"مثال:\n- الفكرة الرئيسية واضحة (3 درجات)\n- التنظيم والترتيب (2 درجة)\n- السلامة اللغوية (2 درجة)"}
                                    className="w-full rounded-xl border-2 border-purple-300 bg-white px-4 py-3 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                                  />
                                  <p className="text-xs text-gray-600 font-[Almarai]">
                                    📝 حدد كيف ستوزع الدرجات على عناصر الإجابة
                                  </p>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                                  <p className="text-xs text-yellow-800 font-[Almarai] flex items-center gap-2">
                                    <span className="text-lg">⚠️</span>
                                    <span>الأسئلة المقالية تحتاج تصحيح يدوي من المعلم بعد تسليم الطالب</span>
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                          {/* Image upload + preview for question */}
                          <div className="mt-4">
                            <label className="block text-xs font-bold font-[Almarai] mb-2" style={{ color: TEXT_COLOR }}>
                              صورة السؤال (اختياري)
                            </label>
                            <div className="flex items-center gap-3">
                              <input
                                id={`q-image-${index}`}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const f = e.target.files && e.target.files[0];
                                  if (f) handleQuestionImageUpload(index, f);
                                }}
                              />

                              <label htmlFor={`q-image-${index}`} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer">
                                <Upload className="w-4 h-4" />
                                <span className="text-sm font-[Almarai]">اختر صورة</span>
                              </label>

                              {q.image_url && (
                                <div className="flex items-center gap-2">
                                  <img src={q.image_url} alt="معاينة" className="w-16 h-16 object-cover rounded" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateQuestion(index, 'image_url', '');
                                      updateQuestion(index, 'image_metadata', null);
                                    }}
                                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                  >
                                    إزالة
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <footer className="sticky bottom-0 z-20 mt-6 bg-white/95 backdrop-blur rounded-2xl border border-gray-200 p-3 sm:p-4 shadow-lg">
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                      setEditingExam(null);
                    }}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold font-[Almarai] transition"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={createExam}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#665446] hover:bg-[#8B7355] text-white font-bold font-[Almarai] shadow-md hover:shadow-lg transition"
                  >
                    {editingExam ? 'حفظ التعديلات' : 'إنشاء الامتحان'}
                  </button>
                </div>
              </footer>
            </div>
          </section>
        )}



        {showResultsModal && selectedExam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-[#665446] to-[#8B7355] p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold font-[Almarai] mb-2">نتائج الامتحان</h2>
                    <p className="text-sm opacity-90 font-[Almarai]">{selectedExam.title}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowResultsModal(false);
                      setSelectedExam(null);
                      setExamAttempts([]);
                    }}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {examAttempts.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: TEXT_COLOR }} />
                    <p className="text-lg font-[Almarai]" style={{ color: TEXT_COLOR }}>
                      لا توجد محاولات لهذا الامتحان بعد
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                        <div className="flex items-center gap-3">
                          <Users className="w-8 h-8 text-blue-600" />
                          <div>
                            <p className="text-sm text-gray-600 font-[Almarai]">عدد المحاولات</p>
                            <p className="text-2xl font-bold text-blue-600 font-[Almarai]">{examAttempts.length}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="w-8 h-8 text-green-600" />
                          <div>
                            <p className="text-sm text-gray-600 font-[Almarai]">أعلى درجة</p>
                            <p className="text-2xl font-bold text-green-600 font-[Almarai]">
                              {Math.max(...examAttempts.map(a => a.percentage || 0)).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="w-8 h-8 text-purple-600" />
                          <div>
                            <p className="text-sm text-gray-600 font-[Almarai]">المتوسط</p>
                            <p className="text-2xl font-bold text-purple-600 font-[Almarai]">
                              {(examAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / examAttempts.length).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-4 py-3 text-right text-sm font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                              اسم الطالب
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                              الدرجة
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                              النسبة المئوية
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                              الحالة
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                              تاريخ التسليم
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {examAttempts.map((attempt, idx) => (
                            <tr key={attempt.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-4 py-3 text-right font-[Almarai]" style={{ color: TEXT_COLOR }}>
                                {attempt.student_name || 'غير معروف'}
                              </td>
                              <td className="px-4 py-3 text-center font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                                {attempt.score || 0} / {selectedExam.total_marks}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-3 py-1 rounded-full text-sm font-bold font-[Almarai] ${(attempt.percentage || 0) >= ((selectedExam.pass_marks / selectedExam.total_marks) * 100)
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                                  }`}>
                                  {(attempt.percentage || 0).toFixed(1)}%
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {(attempt.percentage || 0) >= ((selectedExam.pass_marks / selectedExam.total_marks) * 100) ? (
                                  <span className="flex items-center justify-center gap-1 text-green-600 text-sm font-bold font-[Almarai]">
                                    <CheckCircle className="w-4 h-4" />
                                    ناجح
                                  </span>
                                ) : (
                                  <span className="flex items-center justify-center gap-1 text-red-600 text-sm font-bold font-[Almarai]">
                                    <XCircle className="w-4 h-4" />
                                    راسب
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center text-sm font-[Almarai]" style={{ color: TEXT_COLOR }}>
                                {attempt.submitted_at
                                  ? new Date(attempt.submitted_at).toLocaleString('ar-EG', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                  : '-'
                                }
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>

              <div className="p-6 bg-gray-50 border-t">
                <button
                  onClick={() => {
                    setShowResultsModal(false);
                    setSelectedExam(null);
                    setExamAttempts([]);
                  }}
                  className="w-full px-6 py-3 bg-[#665446] hover:bg-[#8B7355] text-white rounded-lg font-bold font-[Almarai] transition-all"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}


        {/* ✅ قالب الشهادة المخفي للطباعة إلى PDF */}
        <div
          className="fixed -left-[9999px] -top-[9999px] bg-white"
          style={{ width: '794px', height: '1123px' }}
          ref={certRef}
          dir="rtl"
        >
          <div
            style={{
              boxSizing: 'border-box',
              width: '100%',
              height: '100%',
              padding: '26px',
              border: '8px solid #333',
              position: 'relative',
              fontFamily: 'Almarai, Cairo, system-ui, sans-serif',
              color: '#222'
            }}
          >
            <div style={{ textAlign: 'center', marginTop: 2 }}>
              <h1 style={{ margin: 0, fontSize: 28 }}>شهادة امتحانات الشهر</h1>
              <div style={{ marginTop: 4 }}>
                منصة: <span data-field="platform">—</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', margin: '10px 0 12px', lineHeight: 1.6 }}>
              <div>تُمنح هذه الشهادة إلى</div>
              <div style={{ fontSize: 24, fontWeight: 'bold' }} data-field="student">—</div>
              <div style={{ fontSize: 14, color: '#444', marginTop: 4 }}>
                تشمل الشهادة جميع الامتحانات التي قام الطالب بإتمامها على المنصة.
              </div>
              <div style={{ marginTop: 6, fontSize: 14 }}>
                الإجمالي: <span data-field="total">—</span> — تاريخ الإصدار: <span data-field="date">—</span>
              </div>
            </div>

            <div style={{ fontSize: 11, margin: '0 4px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <thead>
                  <tr>
                    {['#', 'المستوي', 'المادة', 'الدرجة', 'النسبة', 'الحالة', 'تاريخ التسليم'].map((h) => (
                      <th
                        key={h}
                        style={{ padding: '6px', border: '1px solid #000', background: '#f2f2f2', textAlign: 'right' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody data-field="rows"></tbody>
              </table>
            </div>

            <div
              style={{
                position: 'absolute',
                bottom: 26,
                left: 26,
                right: 26,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div>______________________</div>
                <div>واحة العلم </div>
              </div>
              <img data-field="qr" alt="QR" style={{ width: 90, height: 90 }} />
            </div>

            <div style={{ position: 'absolute', bottom: 8, left: 26, fontSize: 11, color: '#666' }}>
              رقم الشهادة: <span data-field="serial">—</span>
            </div>
          </div>
        </div>


      </div>
      {/* ✅ نافذة اختيار المستوى - تظهر للطالب فقط */}
      {showLevelSelector && userRole !== 'admin' && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          style={{
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <style jsx>{`
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `}</style>

          <div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            style={{
              animation: 'slideUp 0.4s ease-out'
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#665446] to-[#8B7355] p-6 text-white text-center">
              <h2 className="text-2xl sm:text-3xl font-bold font-[Almarai] mb-2">
                مرحبا بك في اختبرات الواحة        </h2>
              <p className="text-sm opacity-90 font-[Almarai]">
                اختر المستوى الدراسي الخاص بك
              </p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <button
                onClick={() => handleLevelSelection('level1')}
                className="w-full group relative overflow-hidden rounded-2xl border-3 border-[#665446] bg-gradient-to-br from-white to-gray-50 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                style={{
                  borderWidth: '3px'
                }}
              >
                <div
                  className="absolute inset-0 bg-[#665446] opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                ></div>
                <div className="relative flex items-center gap-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[#665446] text-white flex items-center justify-center text-2xl font-bold shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                    1
                  </div>
                  <div className="flex-1 text-right">
                    <h3 className="text-xl font-bold font-[Almarai] text-[#665446] mb-1 group-hover:text-[#8B7355] transition-colors">
                      المستوى الأول
                    </h3>
                    <p className="text-sm text-gray-600 font-[Almarai]">
                      المستوى الأول              </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[#665446]">
                    ←
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleLevelSelection('level2')}
                className="w-full group relative overflow-hidden rounded-2xl border-3 border-[#8B7355] bg-gradient-to-br from-white to-gray-50 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                style={{
                  borderWidth: '3px'
                }}
              >
                <div
                  className="absolute inset-0 bg-[#8B7355] opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                ></div>
                <div className="relative flex items-center gap-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[#8B7355] text-white flex items-center justify-center text-2xl font-bold shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                    2
                  </div>
                  <div className="flex-1 text-right">
                    <h3 className="text-xl font-bold font-[Almarai] text-[#8B7355] mb-1 group-hover:text-[#665446] transition-colors">
                      التمهيدي
                    </h3>
                    <p className="text-sm text-gray-600 font-[Almarai]">
                      المرحلة التمهيدية              </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[#8B7355]">
                    ←
                  </div>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                <p className="text-xs text-blue-700 font-[Almarai] flex items-center justify-center gap-2">
                  <span className="text-lg">💡</span>
                  <span>يمكنك تغيير المستوى لاحقاً من التبويبات أعلى الصفحة</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AnimatedBackground>
  );
};

export default MonthlyExams;