import React, { useState, useEffect } from 'react';
import { supabase } from '../../Utilities/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, Minus, Upload, AlertTriangle } from 'lucide-react';

const QUESTION_TYPES = {
  multiple_choice: 'اختيار من متعدد',
  true_false: 'صح وخطأ',
  correct_underlined: 'تصحيح ما تحته خط',
  essay: 'سؤال مقالي'
};

const ExamForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);

  // نموذج الامتحان الأساسي
  const [examForm, setExamForm] = useState({
    title: '',
    description: '',
    course_id: '',
    lesson_id: '',
    duration_minutes: 60,
    total_marks: 100,
    passing_score: 50,
    start_date: '',
    end_date: '',
    is_active: true,
    allow_review: true,
    shuffle_questions: false,
    shuffle_answers: false,
    attempts_allowed: 1
  });

  // الأسئلة
  const [questions, setQuestions] = useState([{
    question_type: 'multiple_choice',
    question_text: '',
    question_order: 1,
    options: ['', '', '', ''],
    correct_answer: '',
    model_answer: '',
    grading_rubric: '',
    max_marks: 10,
    explanation: '',
    image_url: '',
    topic: '',
    difficulty_level: 'متوسط'
  }]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title');
      if (error) throw error;
      setCourses(data);
    } catch (error) {
      toast.error('خطأ في تحميل المقررات');
    }
  };

  const fetchLessons = async (courseId) => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title')
        .eq('course_id', courseId);
      if (error) throw error;
      setLessons(data);
    } catch (error) {
      toast.error('خطأ في تحميل المحاضرات');
    }
  };

  const handleExamFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExamForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'course_id') {
      fetchLessons(value);
      setExamForm(prev => ({ ...prev, lesson_id: '' }));
    }
  };

  const addQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        question_type: 'multiple_choice',
        question_text: '',
        question_order: prev.length + 1,
        options: ['', '', '', ''],
        correct_answer: '',
        model_answer: '',
        grading_rubric: '',
        max_marks: 10,
        explanation: '',
        image_url: '',
        topic: '',
        difficulty_level: 'متوسط'
      }
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleQuestionChange = (index, field, value) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // تحديث الخيارات تلقائياً لأسئلة الصح والخطأ
      if (field === 'question_type' && value === 'true_false') {
        updated[index].options = ['صح', 'خطأ'];
      } else if (field === 'question_type' && value === 'multiple_choice') {
        updated[index].options = ['', '', '', ''];
      }

      return updated;
    });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setQuestions(prev => {
      const updated = [...prev];
      const options = [...updated[questionIndex].options];
      options[optionIndex] = value;
      updated[questionIndex].options = options;
      return updated;
    });
  };

  const handleImageUpload = async (questionIndex, file) => {
    try {
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `exam-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('exam-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('exam-assets')
        .getPublicUrl(filePath);

      handleQuestionChange(questionIndex, 'image_url', publicUrl);
      toast.success('تم رفع الصورة بنجاح');
    } catch (error) {
      toast.error('فشل رفع الصورة');
    }
  };

  const validateForm = () => {
    if (!examForm.title || !examForm.course_id || !examForm.start_date || !examForm.end_date) {
      toast.error('يرجى ملء جميع الحقول المطلوبة للامتحان');
      return false;
    }

    for (let q of questions) {
      if (!q.question_text || !q.max_marks) {
        toast.error('يرجى ملء جميع حقول الأسئلة المطلوبة');
        return false;
      }

      if (q.question_type === 'multiple_choice' && 
          (!q.options.every(opt => opt.trim()) || !q.correct_answer)) {
        toast.error('يرجى إكمال جميع الخيارات وتحديد الإجابة الصحيحة');
        return false;
      }

      if (q.question_type === 'essay' && !q.model_answer) {
        toast.error('يرجى إضافة نموذج إجابة للأسئلة المقالية');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('يجب تسجيل الدخول');

      // 1. إنشاء الامتحان
      const { data: exam, error: examError } = await supabase
        .from('advanced_exams')
        .insert([{
          ...examForm,
          created_by: user.id
        }])
        .select()
        .single();

      if (examError) throw examError;

      // 2. إضافة الأسئلة
      const formattedQuestions = questions.map((q, idx) => ({
        exam_id: exam.id,
        question_type: q.question_type,
        question_text: q.question_text,
        question_order: idx + 1,
        correct_answer: q.correct_answer,
        options: q.options && q.question_type !== 'essay' ? q.options : null,
        model_answer: q.model_answer,
        grading_rubric: q.grading_rubric,
        max_marks: q.max_marks,
        explanation: q.explanation,
        image_url: q.image_url,
        topic: q.topic,
        difficulty_level: q.difficulty_level
      }));

      const { error: questionsError } = await supabase
        .from('exam_questions')
        .insert(formattedQuestions);

      if (questionsError) throw questionsError;

      toast.success('تم إنشاء الامتحان بنجاح');
      navigate('/monthlyExams');

    } catch (error) {
      toast.error(error.message || 'حدث خطأ أثناء إنشاء الامتحان');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6" dir="rtl">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* معلومات الامتحان الأساسية */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-[#665446] mb-6">معلومات الامتحان</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">عنوان الامتحان*</label>
              <input
                type="text"
                name="title"
                value={examForm.title}
                onChange={handleExamFormChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#665446]"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">المقرر*</label>
              <select
                name="course_id"
                value={examForm.course_id}
                onChange={handleExamFormChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#665446]"
                required
              >
                <option value="">اختر المقرر</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">المحاضرة</label>
              <select
                name="lesson_id"
                value={examForm.lesson_id}
                onChange={handleExamFormChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#665446]"
                disabled={!examForm.course_id}
              >
                <option value="">اختر المحاضرة (اختياري)</option>
                {lessons.map(lesson => (
                  <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">الوصف</label>
              <textarea
                name="description"
                value={examForm.description}
                onChange={handleExamFormChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#665446]"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">تاريخ البداية*</label>
              <input
                type="datetime-local"
                name="start_date"
                value={examForm.start_date}
                onChange={handleExamFormChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#665446]"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">تاريخ النهاية*</label>
              <input
                type="datetime-local"
                name="end_date"
                value={examForm.end_date}
                onChange={handleExamFormChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#665446]"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">مدة الامتحان (دقيقة)</label>
              <input
                type="number"
                name="duration_minutes"
                value={examForm.duration_minutes}
                onChange={handleExamFormChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#665446]"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">عدد المحاولات المسموحة</label>
              <input
                type="number"
                name="attempts_allowed"
                value={examForm.attempts_allowed}
                onChange={handleExamFormChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#665446]"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">الدرجة الكلية</label>
              <input
                type="number"
                name="total_marks"
                value={examForm.total_marks}
                onChange={handleExamFormChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#665446]"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">درجة النجاح</label>
              <input
                type="number"
                name="passing_score"
                value={examForm.passing_score}
                onChange={handleExamFormChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#665446]"
                min="0"
                max={examForm.total_marks}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <label className="flex items-center space-x-2 space-x-reverse">
              <input
                type="checkbox"
                name="is_active"
                checked={examForm.is_active}
                onChange={handleExamFormChange}
                className="form-checkbox text-[#665446]"
              />
              <span className="text-gray-700">نشط</span>
            </label>

            <label className="flex items-center space-x-2 space-x-reverse">
              <input
                type="checkbox"
                name="allow_review"
                checked={examForm.allow_review}
                onChange={handleExamFormChange}
                className="form-checkbox text-[#665446]"
              />
              <span className="text-gray-700">السماح بالمراجعة</span>
            </label>

            <label className="flex items-center space-x-2 space-x-reverse">
              <input
                type="checkbox"
                name="shuffle_questions"
                checked={examForm.shuffle_questions}
                onChange={handleExamFormChange}
                className="form-checkbox text-[#665446]"
              />
              <span className="text-gray-700">خلط الأسئلة</span>
            </label>

            <label className="flex items-center space-x-2 space-x-reverse">
              <input
                type="checkbox"
                name="shuffle_answers"
                checked={examForm.shuffle_answers}
                onChange={handleExamFormChange}
                className="form-checkbox text-[#665446]"
              />
              <span className="text-gray-700">خلط الإجابات</span>
            </label>
          </div>
        </div>

        {/* الأسئلة */}
        <div className="space-y-6">
          {questions.map((question, questionIndex) => (
            <div key={questionIndex} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#665446]">
                  السؤال {questionIndex + 1}
                </h3>
                <button
                  type="button"
                  onClick={() => removeQuestion(questionIndex)}
                  className="text-red-500 hover:text-red-700"
                  disabled={questions.length === 1}
                >
                  <Minus className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2">نوع السؤال*</label>
                  <select
                    value={question.question_type}
                    onChange={(e) => handleQuestionChange(questionIndex, 'question_type', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#665446]"
                    required
                  >
                    {Object.entries(QUESTION_TYPES).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2">نص السؤال*</label>
                  <textarea
                    value={question.question_text}
                    onChange={(e) => handleQuestionChange(questionIndex, 'question_text', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#665446]"
                    rows="3"
                    required
                  />
                </div>

                {/* حقول خاصة حسب نوع السؤال */}
                {question.question_type === 'multiple_choice' && (
                  <div className="md:col-span-2 space-y-4">
                    <label className="block text-gray-700">الخيارات*</label>
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-4">
                        <input
                          type="radio"
                          name={`correct_${questionIndex}`}
                          checked={question.correct_answer === option}
                          onChange={() => handleQuestionChange(questionIndex, 'correct_answer', option)}
                          className="form-radio text-[#665446]"
                          required
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                          className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-[#665446]"
                          placeholder={`الخيار ${optionIndex + 1}`}
                          required
                        />
                      </div>
                    ))}
                  </div>
                )}

                {question.question_type === 'true_false' && (
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 mb-2">الإجابة الصحيحة*</label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct_${questionIndex}`}
                          value="TRUE"
                          checked={question.correct_answer === 'TRUE'}
                          onChange={(e) => handleQuestionChange(questionIndex, 'correct_answer', e.target.value)}
                          className="form-radio text-[#665446]"
                          required
                        />
                        <span>صح</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct_${questionIndex}`}
                          value="FALSE"
                          checked={question.correct_answer === 'FALSE'}
                          onChange={(e) => handleQuestionChange(questionIndex, 'correct_answer', e.target.value)}
                          className="form-radio text-[#665446]"
                          required
                        />
                        <span>خطأ</span>
                      </label>
                    </div>
                  </div>
                )}

                {question.question_type === 'correct_underlined' && (
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 mb-2">الإجابة الصحيحة*</label>
                    <input
                      type="text"
                      value={question.correct_answer}
                      onChange={(e) => handleQuestionChange(questionIndex, 'correct_answer', e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#665446]"
                      required
                    />
                  </div>
                )}

                {question.question_type === 'essay' && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-gray-700 mb-2">نموذج الإجابة*</label>
                      <textarea
                        value={question.model_answer}
                        onChange={(e) => handleQuestionChange(questionIndex, 'model_answer', e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#665446]"
                        rows="4"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-gray-700 mb-2">معايير التصحيح</label>
                      <textarea
                        value={question.grading_rubric}
                        onChange={(e) => handleQuestionChange(questionIndex, 'grading_rubric', e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#665446]"
                        rows="3"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-gray-700 mb-2">الدرجة*</label>
                  <input
                    type="number"
                    value={question.max_marks}
                    onChange={(e) => handleQuestionChange(questionIndex, 'max_marks', Number(e.target.value))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#665446]"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">الموضوع</label>
                  <input
                    type="text"
                    value={question.topic}
                    onChange={(e) => handleQuestionChange(questionIndex, 'topic', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#665446]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">مستوى الصعوبة</label>
                  <select
                    value={question.difficulty_level}
                    onChange={(e) => handleQuestionChange(questionIndex, 'difficulty_level', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#665446]"
                  >
                    <option value="سهل">سهل</option>
                    <option value="متوسط">متوسط</option>
                    <option value="صعب">صعب</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2">شرح الإجابة</label>
                  <textarea
                    value={question.explanation}
                    onChange={(e) => handleQuestionChange(questionIndex, 'explanation', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#665446]"
                    rows="2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2">صورة السؤال (اختياري)</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(questionIndex, e.target.files[0])}
                      className="hidden"
                      id={`image-upload-${questionIndex}`}
                    />
                    <label
                      htmlFor={`image-upload-${questionIndex}`}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer"
                    >
                      <Upload className="w-5 h-5" />
                      <span>اختر صورة</span>
                    </label>
                    {question.image_url && (
                      <img
                        src={question.image_url}
                        alt="صورة السؤال"
                        className="h-16 w-16 object-cover rounded"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* إضافة سؤال */}
        <button
          type="button"
          onClick={addQuestion}
          className="w-full p-4 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة سؤال جديد</span>
        </button>

        {/* أزرار التحكم */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => navigate('/monthlyExams')}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#665446] hover:bg-[#4A3F33] text-white rounded-lg flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>جاري الحفظ...</span>
              </>
            ) : (
              'حفظ الامتحان'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExamForm;