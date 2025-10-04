// src/Pages/MonthlyExams.js - FIXED COMPLETE VERSION
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../Utilities/supabaseClient';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../Utilities/AnimatedBackground';
import {
  FileText, Plus, Trash2, Eye, Clock, Calendar,
  CheckCircle, XCircle, Users, TrendingUp, X,
  Search, ChevronLeft, ChevronRight
} from 'lucide-react';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TEXT_COLOR = '#806445';
const CARD_BG = '#F5EDE2';
const DEFAULT_DURATION_MIN = 60;
const RESULT_VISIBILITY_HOURS = 2;

const ENGLISH_OPTIONS = ['A', 'B', 'C', 'D'];
const OPTION_DISPLAY = { 'A': 'أ', 'B': 'ب', 'C': 'ج', 'D': 'د' };
const OPTION_TO_ENGLISH = { 'أ': 'A', 'ب': 'B', 'ج': 'C', 'د': 'D' };

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

  const [takingExam, setTakingExam] = useState(null);
  const [takingAnswers, setTakingAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [studentAttempts, setStudentAttempts] = useState({});

  const [examForm, setExamForm] = useState({
    title: '',
    description: '',
    month: '',
    subject: '',
    duration_minutes: DEFAULT_DURATION_MIN,
    total_marks: 100,
    pass_marks: 50,
    start_date: '',
    end_date: '',
    is_active: true
  });

  const formRef = useRef(null);

  const [questions, setQuestions] = useState([{
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    marks: 1
  }]);
  const [numQuestions, setNumQuestions] = useState(1);

  useEffect(() => {
    if (showCreateForm && formRef.current) {
      setTimeout(() => {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 80);
    }
  }, [showCreateForm]);

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
  }, [exams, searchTerm, filterMonth, filterSubject, filterStatus, currentPage]);

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
            option_a: '',
            option_b: '',
            option_c: '',
            option_d: '',
            correct_answer: 'A',
            marks: 1
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

  const isoToInput = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const tzOffset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - tzOffset * 60000);
    return local.toISOString().slice(0, 16);
  };

  const createExam = async () => {
    if (!examForm.title || !examForm.month || !examForm.subject) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
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
        duration_minutes: Number(examForm.duration_minutes) || DEFAULT_DURATION_MIN,
        total_marks: Number(examForm.total_marks) || 100,
        pass_marks: Number(examForm.pass_marks) || 50,
        start_date: inputToIso(examForm.start_date),
        end_date: inputToIso(examForm.end_date),
        is_active: examForm.is_active ?? true
      };

      if (editingExam) {
        const { error } = await supabase
          .from('monthly_exams')
          .update(payloadExam)
          .eq('id', editingExam.id);

        if (error) throw error;

        await supabase.from('exam_questions').delete().eq('exam_id', editingExam.id);

        const questionsToInsert = questions.map((q, index) => ({
          exam_id: editingExam.id,
          question_text: q.question_text,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          correct_answer: q.correct_answer,
          marks: Number(q.marks || 1),
          question_order: index + 1
        }));

        if (questionsToInsert.length) {
          const { error: qErr } = await supabase.from('exam_questions').insert(questionsToInsert);
          if (qErr) throw qErr;
        }

        toast.success('تم تحديث الامتحان بنجاح!');
      } else {
        const { data: examData, error: examError } = await supabase
          .from('monthly_exams')
          .insert([{ ...payloadExam, created_by: currentUser.id }])
          .select()
          .single();

        if (examError) throw examError;

        const questionsToInsert = questions.map((q, index) => ({
          exam_id: examData.id,
          question_text: q.question_text,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          correct_answer: q.correct_answer,
          marks: Number(q.marks || 1),
          question_order: index + 1
        }));

        const { error: questionsError } = await supabase
          .from('exam_questions')
          .insert(questionsToInsert);

        if (questionsError) throw questionsError;

        toast.success('تم إنشاء الامتحان بنجاح!');
      }

      setShowCreateForm(false);
      resetForm();
      setEditingExam(null);
      fetchExams();
    } catch (error) {
      console.error('خطأ في إنشاء/تحديث الامتحان:', error);
      toast.error('حدث خطأ أثناء إنشاء/تحديث الامتحان');
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
        score: 0,
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

      setTakingExam({ 
        ...attempt, 
        questions: qs, 
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
            autoSubmitExam(attempt, qs);
            return 0;
          }
          return t - 1;
        });
      }, 1000);

      toast.success('تم بدء الامتحان بنجاح!');

    } catch (err) {
      console.error('خطأ في بدء الامتحان:', err);
      toast.error('تعذر بدء الامتحان');
    }
  };

  const autoSubmitExam = async (attempt, qs) => {
    try {
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

      let score = 0;
      qs.forEach(q => {
        const studentAnswer = takingAnswers[q.id];
        if (studentAnswer && studentAnswer === q.correct_answer) {
          score += Number(q.marks || 1);
        }
      });

      const percentage = (score / attempt.total_marks) * 100;

      const { error: updateErr } = await supabase
        .from('exam_attempts')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          score: score,
          percentage: percentage
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

 // ✅ بدّل دالة submitExamManually بالكامل بهذا الإصدار
const submitExamManually = async () => {
  if (!takingExam) return;

  try {
    // 1) جلب أسئلة الامتحان بالترتيب
    const { data: qs, error: qErr } = await supabase
      .from('exam_questions')
      .select('*')
      .eq('exam_id', takingExam.exam_id)
      .order('question_order', { ascending: true });

    if (qErr) throw qErr;

    // 2) قراءة الإجابات الموجودة (لو في)
    const { data: existingAnswers } = await supabase
      .from('exam_answers')
      .select('question_id, selected_answer')
      .eq('attempt_id', takingExam.id);

    const existingAnswersMap = new Map(
      (existingAnswers || []).map(a => [a.question_id, a.selected_answer])
    );

    // تحويل الإجابة الإنجليزية للعربي فقط للتخزين (الإظهار)
    const convertAnswerToArabic = (ans) => {
      const map = { 
        'A': 'أ', 'a': 'أ',
        'B': 'ب', 'b': 'ب',
        'C': 'ج', 'c': 'ج',
        'D': 'د', 'd': 'د'
      };
      return map[ans] || null;
    };

    // 3) تحضير إدخالات/تحديثات الإجابات في exam_answers
    const newAnswers = [];
    const answersToUpdate = [];

    qs.forEach(q => {
      const studentAnswerRaw = takingAnswers[q.id];          // A/B/C/D
      const convertedAnswer = convertAnswerToArabic(studentAnswerRaw); // أ/ب/ج/د (للتخزين)

      if (!convertedAnswer) return;

      const existingAnswer = existingAnswersMap.get(q.id);
      if (!existingAnswer) {
        newAnswers.push({
          attempt_id: takingExam.id,
          question_id: q.id,
          selected_answer: convertedAnswer,
        });
      } else if (existingAnswer !== convertedAnswer) {
        answersToUpdate.push({
          question_id: q.id,
          attempt_id: takingExam.id,
          selected_answer: convertedAnswer,
        });
      }
    });

    if (newAnswers.length > 0) {
      const { error: insertErr } = await supabase
        .from('exam_answers')
        .insert(newAnswers);
      if (insertErr) throw insertErr;
    }

    for (const update of answersToUpdate) {
      const { error: updateErr } = await supabase
        .from('exam_answers')
        .update({ selected_answer: update.selected_answer })
        .eq('attempt_id', update.attempt_id)
        .eq('question_id', update.question_id);
      if (updateErr) throw updateErr;
    }

    // 4) ✅ حساب الدرجة والنسبة (محليًا) بالاعتماد على A/B/C/D
    // correct_answer في الجدول محفوظ بالإنجليزي (A-D)، لذلك نقارن على الإنجليزي
    let score = 0;
    let totalMarks = Number(takingExam.total_marks) || 0;

    // لو total_marks مش متسجل بشكل صحيح، احسبه من مجموع marks للأسئلة
    if (!totalMarks) {
      totalMarks = qs.reduce((s, q) => s + Number(q.marks || 1), 0);
    }

    qs.forEach(q => {
      const studentAns = (takingAnswers[q.id] || '').toString().toUpperCase(); // A-D
      // لو حصل إن correct_answer متخزن عربي بالخطأ، حوله لإنجليزي عبر OPTION_TO_ENGLISH
      let correct = (q.correct_answer || '').toString().toUpperCase();
      if (!['A', 'B', 'C', 'D'].includes(correct)) {
        const mapBack = { 'أ': 'A', 'ب': 'B', 'ج': 'C', 'د': 'D' };
        correct = mapBack[correct] || correct;
      }
      if (studentAns && studentAns === correct) {
        score += Number(q.marks || 1);
      }
    });

    const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;

    // 5) تحديث attempt بالنتيجة والحالة ووقت التسليم
    const { error: updateAttemptErr } = await supabase
      .from('exam_attempts')
      .update({
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        score: score,
        percentage: percentage,
      })
      .eq('id', takingExam.id);

    if (updateAttemptErr) throw updateAttemptErr;

    // 6) تنظيف حالة الامتحان في الواجهة
    if (timerRef.current) clearInterval(timerRef.current);
    setTakingExam(null);
    setTakingAnswers({});

    toast.success(` تم تسليم الامتحان بنجاح`);
    await fetchExams();

  } catch (err) {
    console.error('خطأ في تسليم الامتحان:', err);
    toast.error('حدث خطأ أثناء تسليم الامتحان: ' + (err.message || ''));
  }
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
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A',
      marks: 1
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
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const resetForm = () => {
    setExamForm({
      title: '',
      description: '',
      month: '',
      subject: '',
      duration_minutes: DEFAULT_DURATION_MIN,
      total_marks: 100,
      pass_marks: 50,
      start_date: '',
      end_date: '',
      is_active: true
    });
    setQuestions([{
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A',
      marks: 1
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

  const loadExamQuestions = async (examId) => {
    try {
      const { data, error } = await supabase
        .from('exam_questions')
        .select('*')
        .eq('exam_id', examId)
        .order('question_order', { ascending: true });

      if (error) throw error;
      if (data && data.length) {
        setQuestions(data.map(d => ({
          question_text: d.question_text,
          option_a: d.option_a,
          option_b: d.option_b,
          option_c: d.option_c,
          option_d: d.option_d,
          correct_answer: d.correct_answer || 'A',
          marks: Number(d.marks || 1)
        })));
        setNumQuestions(data.length);
      } else {
        setQuestions([{
          question_text: '',
          option_a: '',
          option_b: '',
          option_c: '',
          option_d: '',
          correct_answer: 'A',
          marks: 1
        }]);
        setNumQuestions(1);
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

  return (
    <AnimatedBackground className="min-h-screen" dir="rtl">
<div className="min-h-screen flex flex-col px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 overflow-visible">
        <ToastContainer 
          position="top-right" 
          autoClose={3500} 
          hideProgressBar={false} 
          newestOnTop 
          closeOnClick 
          rtl 
          style={{ zIndex: 9999 }} 
        />

       {/* ✅ بانِل حلّ الامتحان داخل الصفحة — بدون نافذة منبثقة */}
{takingExam && (
  <div className="flex-1 overflow-auto">
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
          className="h-2 bg-white transition-all duration-300"
          style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
        />
      </div>
    </header>

    {/* Body */}
    <div className="mt-4 sm:mt-6 space-y-6">
      {(takingExam.questions || []).map((q, idx) => (
        <article
          key={q.id}
          className="rounded-2xl border-2 border-gray-200 hover:border-[#665446] bg-white p-4 sm:p-5 transition"
        >
          <div className="flex items-start gap-3 mb-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#665446] text-white flex items-center justify-center font-bold">
              {idx + 1}
            </span>
            <div className="flex-1">
              <p className="text-base sm:text-lg font-semibold text-gray-800 font-[Almarai] mb-1">
                {q.question_text}
              </p>
              <span className="text-xs sm:text-sm text-gray-500 font-[Almarai]">
                ({q.marks} {q.marks === 1 ? 'درجة' : 'درجات'})
              </span>
            </div>
          </div>

          <div className="space-y-3 sm:mr-10">
            {ENGLISH_OPTIONS.map((opt) => (
              <label
                key={opt}
                className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition ${
                  takingAnswers[q.id] === opt
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
            ))}
          </div>
        </article>
      ))}
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
          className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold font-[Almarai] transition ${
            answeredCount === 0
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
                                النتيجة: {studentAttempt.score}/{exam.total_marks} ({studentAttempt.percentage?.toFixed(1)}%)
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
                              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold font-[Almarai] transition-all ${
                                !exam.is_active || hasCompleted
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

       {/* ✅ استبدل كتلة المودال القديمة الخاصة بإنشاء/تعديل الامتحان بهذه اللوحة الداخلية (Inline) */}
{/* ✅ استبدل كتلة showCreateForm الحالية بالكامل بهذا الكود (Inline, مودرن، ومتجاوب) */}
{showCreateForm && (
  <section className="max-w-7xl mx-auto mb-8 px-2 sm:px-4" ref={formRef} dir="rtl">
    <div className="relative rounded-2xl shadow-xl border border-[#E6D9C8] overflow-hidden bg-white/80 backdrop-blur">
      {/* Header (Sticky داخل البانِل لسهولة الوصول على الشاشات الصغيرة) */}
      <header className="sticky top-0 z-10 bg-gradient-to-r from-[#665446] to-[#8B7355] text-white">
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
              value={examForm.title}
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
              value={examForm.subject}
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
              value={examForm.month}
              onChange={(e) => setExamForm({ ...examForm, month: e.target.value })}
              placeholder="مثال: سبتمبر"
              className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
              المدة (بالدقائق)
            </label>
            <input
              type="number"
              min="1"
              value={examForm.duration_minutes}
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
              value={examForm.total_marks}
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
              value={examForm.pass_marks}
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
              value={examForm.start_date}
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
              value={examForm.end_date}
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
              value={examForm.description}
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
              checked={examForm.is_active}
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

        {/* Questions List (متجاوب + قابل للطي عبر <details>) */}
        <div className="mt-4 space-y-4">
          {questions.map((q, index) => (
            <details key={index} open className="group rounded-2xl border-2 border-gray-200/80 bg-white">
              <summary className="flex items-center justify-between gap-3 cursor-pointer rounded-2xl px-4 sm:px-5 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#665446] text-white font-bold">
                    {index + 1}
                  </span>
                  <span className="truncate font-[Almarai]" style={{ color: TEXT_COLOR }}>
                    {q.question_text?.trim() ? q.question_text : 'سؤال جديد'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
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
                  <div className="space-y-2">
                    <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                      نص السؤال *
                    </label>
                    <textarea
                      rows={2}
                      value={q.question_text}
                      onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                      placeholder="اكتب السؤال هنا..."
                      className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-3 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                        الخيار أ *
                      </label>
                      <input
                        type="text"
                        value={q.option_a}
                        onChange={(e) => updateQuestion(index, 'option_a', e.target.value)}
                        className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                        الخيار ب *
                      </label>
                      <input
                        type="text"
                        value={q.option_b}
                        onChange={(e) => updateQuestion(index, 'option_b', e.target.value)}
                        className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                        الخيار ج *
                      </label>
                      <input
                        type="text"
                        value={q.option_c}
                        onChange={(e) => updateQuestion(index, 'option_c', e.target.value)}
                        className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                        الخيار د *
                      </label>
                      <input
                        type="text"
                        value={q.option_d}
                        onChange={(e) => updateQuestion(index, 'option_d', e.target.value)}
                        className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                        الإجابة الصحيحة *
                      </label>
                      <select
                        value={q.correct_answer}
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

                    <div className="space-y-2">
                      <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                        الدرجات
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={q.marks}
                        onChange={(e) => updateQuestion(index, 'marks', e.target.value)}
                        className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Footer (Sticky أسفل للهواتف) */}
      <footer className="sticky bottom-0 inset-x-0 bg-white border-t border-gray-200/80 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
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
                                <span className={`px-3 py-1 rounded-full text-sm font-bold font-[Almarai] ${
                                  (attempt.percentage || 0) >= ((selectedExam.pass_marks / selectedExam.total_marks) * 100)
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
      </div>
    </AnimatedBackground>
  );
};

export default MonthlyExams;