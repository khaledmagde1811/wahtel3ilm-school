// src/Pages/CreateEditExam.js
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../Utilities/supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';
import AnimatedBackground from '../../Utilities/AnimatedBackground';
import {
  Plus, Trash2, Upload, X, Save, ArrowLeft
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TEXT_COLOR = '#806445';
const DEFAULT_DURATION_MIN = 60;

const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  TRUE_FALSE: 'true_false',
  CORRECT_UNDERLINED: 'correct_underlined',
  ESSAY: 'essay'
};

const ENGLISH_OPTIONS = ['A', 'B', 'C', 'D'];
const OPTION_DISPLAY = { 'A': 'أ', 'B': 'ب', 'C': 'ج', 'D': 'د' };

const CreateEditExam = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  const formRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [examForm, setExamForm] = useState({
    title: '',
    description: '',
    month: '',
    subject: '',
    level_scope: 'shared',
    duration_minutes: DEFAULT_DURATION_MIN,
    total_marks: 100,
    pass_marks: 50,
    start_date: '',
    end_date: '',
    is_active: true
  });

  const [questions, setQuestions] = useState([{
    question_text: '',
    question_type: QUESTION_TYPES.MULTIPLE_CHOICE,
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    max_marks: 1,
    explanation: '',
    image_url: '',
    grading_rubric: '',
    model_answer: '',
    topic: '',
    difficulty_level: 'medium'
  }]);

  const [numQuestions, setNumQuestions] = useState(1);

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser && examId) {
      loadExam();
    }
  }, [currentUser, examId]);

  useEffect(() => {
    const n = Math.max(1, Math.floor(Number(numQuestions) || 1));
    setNumQuestions(n);
    setQuestions(prev => {
      const copy = [...prev];
      if (n > copy.length) {
        for (let i = copy.length; i < n; i++) {
          copy.push({
            question_text: '',
            question_type: QUESTION_TYPES.MULTIPLE_CHOICE,
            option_a: '',
            option_b: '',
            option_c: '',
            option_d: '',
            correct_answer: 'A',
            max_marks: 1,
            explanation: '',
            image_url: '',
            grading_rubric: '',
            model_answer: '',
            topic: '',
            difficulty_level: 'medium'
          });
        }
      } else if (n < copy.length) {
        copy.length = n;
      }
      return copy;
    });
  }, [numQuestions]);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      
      const { data: userData, error } = await supabase
        .from('students')
        .select('role')
        .eq('auth_id', user.id)
        .single();

      if (!error && userData) {
        if (userData.role !== 'admin') {
          toast.error('غير مصرح لك بالوصول لهذه الصفحة');
          navigate('/monthly-exams');
          return;
        }
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('خطأ في جلب بيانات المستخدم:', error);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const loadExam = async () => {
    try {
      const { data: examData, error: examError } = await supabase
        .from('monthly_exams')
        .select('*')
        .eq('id', examId)
        .single();

      if (examError) throw examError;

      setExamForm({
        title: examData.title || '',
        description: examData.description || '',
        month: examData.month || '',
        subject: examData.subject || '',
        level_scope: examData.level_scope || 'shared',
        duration_minutes: examData.duration_minutes || DEFAULT_DURATION_MIN,
        total_marks: examData.total_marks || 100,
        pass_marks: examData.pass_marks || 50,
        start_date: isoToInput(examData.start_date || null),
        end_date: isoToInput(examData.end_date || null),
        is_active: examData.is_active ?? true
      });

      const { data: questionsData, error: questionsError } = await supabase
        .from('exam_questions')
        .select('*')
        .eq('exam_id', examId)
        .order('question_order', { ascending: true });

      if (questionsError) throw questionsError;

      if (questionsData && questionsData.length) {
        const normalizedQuestions = questionsData.map(d => ({
          question_text: d.question_text || '',
          question_type: d.question_type || QUESTION_TYPES.MULTIPLE_CHOICE,
          option_a: d.option_a || '',
          option_b: d.option_b || '',
          option_c: d.option_c || '',
          option_d: d.option_d || '',
          correct_answer: d.correct_answer || 'A',
          max_marks: Number(d.max_marks || 1),
          explanation: d.explanation || '',
          image_url: d.image_url || '',
          grading_rubric: d.grading_rubric || '',
          model_answer: d.model_answer || '',
          topic: d.topic || '',
          difficulty_level: d.difficulty_level || 'medium'
        }));

        setQuestions(normalizedQuestions);
        setNumQuestions(questionsData.length);
      }

    } catch (error) {
      console.error('خطأ في تحميل الامتحان:', error);
      toast.error('فشل في تحميل بيانات الامتحان');
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

  const prepareQuestionForDatabase = (question, examId, index) => {
    const baseQuestion = {
      exam_id: examId,
      question_text: question.question_text,
      question_type: question.question_type || QUESTION_TYPES.MULTIPLE_CHOICE,
      question_order: index + 1,
      max_marks: Number(question.max_marks || 1),
      explanation: question.explanation || null,
      image_url: question.image_url || null,
      topic: question.topic || null,
      difficulty_level: question.difficulty_level || 'medium'
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

  const saveExam = async () => {
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

    setIsSaving(true);

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

      if (examId) {
        // تعديل امتحان موجود
        const { error } = await supabase
          .from('monthly_exams')
          .update(payloadExam)
          .eq('id', examId);

        if (error) throw error;

        // حذف الأسئلة القديمة
        await supabase.from('exam_questions').delete().eq('exam_id', examId);

        // إضافة الأسئلة الجديدة
        const questionsToInsert = questions.map((q, index) => 
          prepareQuestionForDatabase(q, examId, index)
        );

        if (questionsToInsert.length) {
          const { error: qErr } = await supabase
            .from('exam_questions')
            .insert(questionsToInsert);
          if (qErr) throw qErr;
        }

        toast.success('تم تحديث الامتحان بنجاح!');

      } else {
        // إنشاء امتحان جديد
        const { data: examDataArray, error: examError } = await supabase
          .from('monthly_exams')
          .insert([{ ...payloadExam, created_by: currentUser.id }])
          .select();

        if (examError) throw examError;

        if (!examDataArray || examDataArray.length === 0) {
          toast.error('فشل إنشاء الامتحان - تحقق من الصلاحيات');
          return;
        }

        const examData = examDataArray[0];

        const questionsToInsert = questions.map((q, index) => 
          prepareQuestionForDatabase(q, examData.id, index)
        );

        const { error: questionsError } = await supabase
          .from('exam_questions')
          .insert(questionsToInsert);

        if (questionsError) throw questionsError;

        toast.success('تم إنشاء الامتحان بنجاح!');
      }

      setTimeout(() => {
        navigate('/teacher-exams');
      }, 1500);

    } catch (error) {
      console.error('خطأ في حفظ الامتحان:', error);
      toast.error('حدث خطأ: ' + (error.message || 'حاول مرة أخرى'));
    } finally {
      setIsSaving(false);
    }
  };

  const addQuestion = () => {
    setQuestions(prev => [...prev, {
      question_text: '',
      question_type: QUESTION_TYPES.MULTIPLE_CHOICE,
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A',
      max_marks: 1,
      explanation: '',
      image_url: '',
      grading_rubric: '',
      model_answer: '',
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

      if (field === 'question_type') {
        if (value === QUESTION_TYPES.TRUE_FALSE) {
          question.correct_answer = 'TRUE';
          question.option_a = '';
          question.option_b = '';
          question.option_c = '';
          question.option_d = '';
        } else if (value === QUESTION_TYPES.MULTIPLE_CHOICE) {
          question.correct_answer = 'A';
        }
      }

      question[field] = value;
      copy[index] = question;
      return copy;
    });
  };

  const handleQuestionImageUpload = async (questionIndex, file) => {
    try {
      if (!file) return;

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

      toast.dismiss(`upload-q-${questionIndex}`);
      toast.success('تم رفع صورة السؤال');
    } catch (err) {
      console.error('خطأ رفع صورة السؤال:', err);
      toast.dismiss(`upload-q-${questionIndex}`);
      toast.error('فشل رفع الصورة');
    }
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
      <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10">
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

        <div className="max-w-7xl mx-auto">
          <section className="mb-8" ref={formRef}>
            <div className="relative rounded-2xl shadow-xl border border-[#E6D9C8] overflow-hidden bg-white/80 backdrop-blur">
              
              {/* Header */}
              <header className="sticky top-0 z-20 rounded-2xl bg-gradient-to-r from-[#665446] to-[#8B7355] text-white shadow-xl">
                <div className="flex items-center justify-between px-4 sm:px-6 py-4">
                  <div className="min-w-0 flex items-center gap-4">
                    <button
                      onClick={() => navigate('/teacher-exams')}
                      className="p-2 hover:bg-white/10 rounded-lg transition"
                      title="العودة"
                    >
                      <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold font-[Almarai] truncate">
                        {examId ? 'تعديل الامتحان' : 'إنشاء امتحان جديد'}
                      </h2>
                      <p className="text-xs sm:text-sm opacity-90 font-[Almarai]">
                        املأ الحقول المطلوبة ثم اضغط حفظ
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/teacher-exams')}
                    className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-3 py-2 hover:bg-white/20 transition"
                    title="إلغاء"
                  >
                    <X className="w-5 h-5" />
                    <span className="hidden sm:inline font-[Almarai]">إلغاء</span>
                  </button>
                </div>
              </header>

              {/* Body */}
              <div className="p-4 sm:p-6">
                
                {/* معلومات الامتحان */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold font-[Almarai] mb-4" style={{ color: TEXT_COLOR }}>
                    معلومات الامتحان
                  </h3>
                  
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
                    </div>

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
                </div>

                {/* الأسئلة */}
{/* الأسئلة */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
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
                        className="w-20 rounded-lg border-2 border-gray-200/80 bg-white px-3 py-1.5 font-[Almarai] text-center outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                      />
                      <button
                        onClick={addQuestion}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#665446] px-4 py-2 text-white hover:bg-[#554436] transition"
                      >
                        <Plus className="w-5 h-5" />
                        <span className="font-[Almarai]">إضافة سؤال</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {questions.map((q, index) => (
                      <div
                        key={index}
                        className="relative rounded-xl border-2 border-gray-200/80 bg-white/50 p-4 sm:p-6 shadow-sm hover:shadow-md transition"
                      >
                        {/* رأس السؤال */}
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-base font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                            السؤال {index + 1}
                          </h4>
                          {questions.length > 1 && (
                            <button
                              onClick={() => removeQuestion(index)}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                              title="حذف السؤال"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>

                        <div className="space-y-4">
                          {/* نوع السؤال والدرجة */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                                نوع السؤال
                              </label>
                              <select
                                value={q.question_type}
                                onChange={(e) => updateQuestion(index, 'question_type', e.target.value)}
                                className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                              >
                                <option value={QUESTION_TYPES.MULTIPLE_CHOICE}>اختيار من متعدد</option>
                                <option value={QUESTION_TYPES.TRUE_FALSE}>صح أم خطأ</option>
                                <option value={QUESTION_TYPES.CORRECT_UNDERLINED}>تصحيح الخطأ المسطر</option>
                                <option value={QUESTION_TYPES.ESSAY}>سؤال مقالي</option>
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                                الدرجة
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={q.max_marks}
                                onChange={(e) => updateQuestion(index, 'max_marks', e.target.value)}
                                className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                              />
                            </div>
                          </div>

                          {/* نص السؤال */}
                          <div className="space-y-2">
                            <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                              نص السؤال *
                            </label>
                            <textarea
                              rows={3}
                              value={q.question_text}
                              onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                              placeholder="اكتب نص السؤال هنا..."
                              className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-3 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                            />
                          </div>

                          {/* صورة السؤال */}
                          <div className="space-y-2">
                            <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                              صورة السؤال (اختياري)
                            </label>
                            <div className="flex items-center gap-3">
                              <label className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200/80 bg-white px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition">
                                <Upload className="w-5 h-5" style={{ color: TEXT_COLOR }} />
                                <span className="text-sm font-[Almarai]" style={{ color: TEXT_COLOR }}>
                                  رفع صورة
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleQuestionImageUpload(index, e.target.files[0])}
                                  className="hidden"
                                />
                              </label>
                              {q.image_url && (
                                <div className="flex items-center gap-2">
                                  <img
                                    src={q.image_url}
                                    alt="صورة السؤال"
                                    className="h-12 w-12 rounded-lg object-cover border-2 border-gray-200"
                                  />
                                  <button
                                    onClick={() => updateQuestion(index, 'image_url', '')}
                                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition"
                                    title="حذف الصورة"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* الخيارات حسب نوع السؤال */}
                          {q.question_type === QUESTION_TYPES.MULTIPLE_CHOICE && (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {ENGLISH_OPTIONS.map((opt) => (
                                  <div key={opt} className="space-y-2">
                                    <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                                      الخيار {OPTION_DISPLAY[opt]}
                                    </label>
                                    <input
                                      type="text"
                                      value={q[`option_${opt.toLowerCase()}`] || ''}
                                      onChange={(e) => updateQuestion(index, `option_${opt.toLowerCase()}`, e.target.value)}
                                      placeholder={`نص الخيار ${OPTION_DISPLAY[opt]}`}
                                      className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                                    />
                                  </div>
                                ))}
                              </div>
                              <div className="space-y-2">
                                <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                                  الإجابة الصحيحة
                                </label>
                                <select
                                  value={q.correct_answer}
                                  onChange={(e) => updateQuestion(index, 'correct_answer', e.target.value)}
                                  className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                                >
                                  {ENGLISH_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>
                                      الخيار {OPTION_DISPLAY[opt]}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </>
                          )}

                          {q.question_type === QUESTION_TYPES.TRUE_FALSE && (
                            <div className="space-y-2">
                              <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                                الإجابة الصحيحة
                              </label>
                              <select
                                value={q.correct_answer}
                                onChange={(e) => updateQuestion(index, 'correct_answer', e.target.value)}
                                className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                              >
                                <option value="TRUE">صح</option>
                                <option value="FALSE">خطأ</option>
                              </select>
                            </div>
                          )}

                          {q.question_type === QUESTION_TYPES.CORRECT_UNDERLINED && (
                            <>
                              <div className="space-y-2">
                                <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                                  الجزء المسطر (الخطأ)
                                </label>
                                <input
                                  type="text"
                                  value={q.option_a || ''}
                                  onChange={(e) => updateQuestion(index, 'option_a', e.target.value)}
                                  placeholder="اكتب الجزء المسطر الخطأ"
                                  className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                                  الإجابة الصحيحة (التصحيح)
                                </label>
                                <input
                                  type="text"
                                  value={q.correct_answer || ''}
                                  onChange={(e) => updateQuestion(index, 'correct_answer', e.target.value)}
                                  placeholder="اكتب التصحيح الصحيح"
                                  className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                                />
                              </div>
                            </>
                          )}

                          {q.question_type === QUESTION_TYPES.ESSAY && (
                            <>
                              <div className="space-y-2">
                                <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                                  الإجابة النموذجية
                                </label>
                                <textarea
                                  rows={4}
                                  value={q.model_answer || ''}
                                  onChange={(e) => updateQuestion(index, 'model_answer', e.target.value)}
                                  placeholder="اكتب الإجابة النموذجية للسؤال المقالي..."
                                  className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-3 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                                  معايير التصحيح
                                </label>
                                <textarea
                                  rows={3}
                                  value={q.grading_rubric || ''}
                                  onChange={(e) => updateQuestion(index, 'grading_rubric', e.target.value)}
                                  placeholder="اكتب معايير التصحيح والنقاط التي يجب توافرها..."
                                  className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-3 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                                />
                              </div>
                            </>
                          )}

                          {/* حقول إضافية */}
                          <div className="space-y-2">
                            <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                              الموضوع (اختياري)
                            </label>
                            <input
                              type="text"
                              value={q.topic || ''}
                              onChange={(e) => updateQuestion(index, 'topic', e.target.value)}
                              placeholder="مثال: الجبر"
                              className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-2.5 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                            />
                          </div>

                          {/* الشرح */}
                          <div className="space-y-2">
                            <label className="block text-xs font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                              شرح الإجابة (اختياري)
                            </label>
                            <textarea
                              rows={2}
                              value={q.explanation || ''}
                              onChange={(e) => updateQuestion(index, 'explanation', e.target.value)}
                              placeholder="اكتب شرحاً للإجابة الصحيحة..."
                              className="w-full rounded-xl border-2 border-gray-200/80 bg-white px-4 py-3 font-[Almarai] outline-none focus:border-[#665446] focus:ring-2 focus:ring-[#665446]/10 transition"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* أزرار الحفظ */}
                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end">
                  <button
                    onClick={() => navigate('/teacher-exams')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-6 py-3 font-[Almarai] hover:bg-gray-50 transition"
                    style={{ color: TEXT_COLOR }}
                  >
                    <X className="w-5 h-5" />
                    <span>إلغاء</span>
                  </button>
                  <button
                    onClick={saveExam}
                    disabled={isSaving}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#665446] px-6 py-3 text-white font-[Almarai] hover:bg-[#554436] disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>جاري الحفظ...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>{examId ? 'تحديث الامتحان' : 'حفظ الامتحان'}</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>
          </section>
        </div>
      </div>
    </AnimatedBackground>
  );
};

export default CreateEditExam;