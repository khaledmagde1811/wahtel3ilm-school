import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams } from 'react-router-dom';
import { supabase } from '../../Utilities/supabaseClient';


const AdminDashboard = () => {
  const [selectedPage, setSelectedPage] = useState(null);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-extrabold text-[#665446] mb-6">لوحة تحكم الأدمن</h2>
      <p className="text-lg text-[#665446] mb-6">مرحباً بك في لوحة تحكم الأدمن. اختر الصفحة التي تريد إدارتها من الكروت التالية:</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="المستويات" description="إدارة المستويات (إضافة، تعديل، حذف)" onClick={() => setSelectedPage('levels')} />
        <Card title="الدورات" description="إدارة الدورات (إضافة، تعديل، حذف)" onClick={() => setSelectedPage('courses')} />
        <Card title="المحاضرات" description="إضافة وتعديل المحاضرات" onClick={() => setSelectedPage('lessons')} />
        <Card title="الاختبارات" description="إضافة وتعديل الاختبارات" onClick={() => setSelectedPage('exams')} />
      </div>

      {selectedPage && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-[#665446]">إدارة {selectedPage}</h3>
            <button
              onClick={() => setSelectedPage(null)}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              إغلاق
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            {selectedPage === 'levels' && <LevelsPage />}
            {selectedPage === 'courses' && <CoursesPage />}
            {selectedPage === 'lessons' && <LessonsPage />}
            {selectedPage === 'exams' && <ExamsPage />}
          </div>
        </div>
      )}
    </div>
  );
};

const Card = ({ title, description, onClick }) => (
  <div className="bg-[#CDC0B6] p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105" onClick={onClick}>
    <h3 className="text-2xl font-bold text-[#665446] mb-3">{title}</h3>
    <p className="text-lg text-[#665446]">{description}</p>
  </div>
);


const LevelsPage = () => {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newLevel, setNewLevel] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [editedLevel, setEditedLevel] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    const { data, error } = await supabase.from('levels').select('*');
    if (error) {
      toast.error('فشل في جلب المستويات');
    } else {
      setLevels(data);
    }
    setLoading(false);
  };

  const handleAddLevel = async () => {
    if (!newLevel.name.trim()) {
      toast.error('الاسم مطلوب');
      return;
    }

    const { error } = await supabase.from('levels').insert([newLevel]);
    if (error) {
      toast.error('خطأ أثناء الإضافة');
    } else {
      toast.success('تمت الإضافة بنجاح');
      setNewLevel({ name: '', description: '' });
      fetchLevels();
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('هل أنت متأكد من الحذف؟');
    if (!confirmDelete) return;
  
    // التحقق من وجود دورات مرتبطة بهذا المستوى
    const { data: coursesData, error: coursesError } = await supabase
      .from('courses')
      .select('id')
      .eq('level_id', id);
  
    if (coursesError) {
      toast.error('حدث خطأ أثناء التحقق من الدورات المرتبطة');
      console.log(coursesError);
      return;
    }
  
    if (coursesData.length > 0) {
      // في حالة وجود دورات مرتبطة بالمستوى
      toast.error('لا يمكن حذف هذا المستوى لأنه يحتوي على دورات');
      return;
    }
  
    // إذا لم يكن هناك ارتباطات، نقوم بحذف المستوى
    const { error } = await supabase.from('levels').delete().eq('id', id);
    if (error) {
      toast.error('فشل في حذف المستوى');
      console.log(error);
    } else {
      toast.success('تم حذف المستوى بنجاح');
      fetchLevels(); // استرجاع قائمة المستويات المحدثة بعد الحذف
    }
  };
  
  const handleEditClick = (level) => {
    setEditingId(level.id);
    setEditedLevel({ name: level.name, description: level.description });
  };

  const handleUpdateLevel = async (id) => {
    if (!editedLevel.name.trim()) {
      toast.error('الاسم مطلوب');
      return;
    }

    const { error } = await supabase
      .from('levels')
      .update({ name: editedLevel.name, description: editedLevel.description })
      .eq('id', id);

    if (error) {
      toast.error('فشل في التحديث');
    } else {
      toast.success('تم التحديث بنجاح');
      setEditingId(null);
      setEditedLevel({ name: '', description: '' });
      fetchLevels();
    }
  };

  return (
    <div className="space-y-6">
      {/* إضافة مستوى */}
      <div className="bg-[#FFF9EF] p-6 rounded-xl shadow-md">
        <h4 className="text-xl font-bold text-[#665446] mb-4">إضافة مستوى جديد</h4>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="text"
            placeholder="اسم المستوى"
            value={newLevel.name}
            onChange={(e) => setNewLevel({ ...newLevel, name: e.target.value })}
            className="p-2 rounded-md border w-full sm:w-1/3"
          />
          <input
            type="text"
            placeholder="وصف المستوى"
            value={newLevel.description}
            onChange={(e) => setNewLevel({ ...newLevel, description: e.target.value })}
            className="p-2 rounded-md border w-full sm:w-1/2"
          />
          <button
            onClick={handleAddLevel}
            className="bg-[#665446] text-white px-4 py-2 rounded-md hover:bg-opacity-80"
          >
            إضافة
          </button>
        </div>
      </div>

      {/* عرض المستويات */}
      {loading ? (
        <p className="text-[#665446]">جاري التحميل...</p>
      ) : (
        <div className="flex flex-col gap-4">
          {levels.map((level) => (
            <div
              key={level.id}
              className="bg-[#FFF9EF] p-5 rounded-xl shadow-md space-y-3"
            >
              {editingId === level.id ? (
                <>
                  <input
                    type="text"
                    value={editedLevel.name}
                    onChange={(e) =>
                      setEditedLevel({ ...editedLevel, name: e.target.value })
                    }
                    className="p-2 rounded-md border w-full"
                  />
                  <textarea
                    value={editedLevel.description}
                    onChange={(e) =>
                      setEditedLevel({ ...editedLevel, description: e.target.value })
                    }
                    className="p-2 rounded-md border w-full"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateLevel(level.id)}
                      className="bg-green-600 text-white px-4 py-1 rounded-md"
                    >
                      حفظ
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-500 text-white px-4 py-1 rounded-md"
                    >
                      إلغاء
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h4 className="text-xl font-bold text-[#665446]">{level.name}</h4>
                  <p className="text-[#665446]">{level.description}</p>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleEditClick(level)}
                      className="bg-yellow-500 text-white px-4 py-1 rounded-md"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(level.id)}
                      className="bg-red-500 text-white px-4 py-1 rounded-md"
                    >
                      حذف
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
// انتهاء صفحة المستويات


// بدايه  المحاضرات
const LessonsPage = () => {
  const [levels, setLevels] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [loading, setLoading] = useState(false);

  const [newLesson, setNewLesson] = useState({
    id: '',
    title: '',
    description: '',
    duration: '',
    youtube_link: '',
    course_id: '',
    teacher_name: '',
  });

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    const { data, error } = await supabase.from('levels').select('id, name');
    if (!error) setLevels(data);
  };

  const fetchCoursesByLevel = async (levelId) => {
    const { data, error } = await supabase
      .from('courses')
      .select('id, name')
      .eq('level_id', levelId);
    if (!error) setCourses(data);
  };

  const fetchLessons = async (courseId) => {
    if (!courseId) {
      setLessons([]);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('lessons')
      .select('id, title, description, duration, status, youtube_link, teacher_name')
      .eq('course_id', courseId);
    if (!error) setLessons(data);
    setLoading(false);
  };

  const handleLevelChange = (e) => {
    const levelId = e.target.value;
    setSelectedLevel(levelId);
    setCourses([]);
    setLessons([]);
    setNewLesson({ ...newLesson, course_id: '', teacher_name: '' });
    fetchCoursesByLevel(levelId);
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setNewLesson({ ...newLesson, course_id: courseId });
    fetchLessons(courseId);
  };

  const handleAddOrUpdateLesson = async () => {
    if (!newLesson.title || !newLesson.teacher_name) {
      toast.error('العنوان واسم المعلم مطلوبان');
      return;
    }

    const duration = parseInt(newLesson.duration);
    if (isNaN(duration) || duration <= 0) {
      toast.error('المدة يجب أن تكون عدد صحيح أكبر من صفر');
      return;
    }

    if (!newLesson.course_id) {
      toast.error('يجب اختيار الدورة');
      return;
    }

    if (newLesson.id) {
      // تعديل محاضرة
      const { data, error } = await supabase
        .from('lessons')
        .update({
          title: newLesson.title,
          description: newLesson.description || null,
          duration,
          youtube_link: newLesson.youtube_link || null,
          course_id: parseInt(newLesson.course_id),
          teacher_name: newLesson.teacher_name,
        })
        .eq('id', newLesson.id);

      if (error) {
        console.log('Error updating lesson:', error.message);
        toast.error('فشل في تحديث المحاضرة');
      } else {
        toast.success('تم تحديث المحاضرة');
        resetForm();
        fetchLessons(newLesson.course_id);
      }
    } else {
      // إضافة محاضرة جديدة
      const { data, error } = await supabase.from('lessons').insert([{
        title: newLesson.title,
        description: newLesson.description || null,
        youtube_link: newLesson.youtube_link || null,
        teacher_name: newLesson.teacher_name || null,
        status: 'مغلقة',
        duration: duration,
        course_id: parseInt(newLesson.course_id),
      }]);

      if (error) {
        console.log('Error adding lesson:', error.message);
        toast.error('فشل في إضافة المحاضرة');
      } else {
        toast.success('تمت إضافة المحاضرة');
        resetForm();
        fetchLessons(newLesson.course_id);
      }
    }
  };

  const resetForm = () => {
    setNewLesson({
      id: '',
      title: '',
      description: '',
      duration: '',
      youtube_link: '',
      course_id: newLesson.course_id,
      teacher_name: '',
    });
  };

  const handleDeleteLesson = async (lessonId) => {
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId);

    if (error) {
      console.log('Error deleting lesson:', error.message);
      toast.error('فشل في حذف المحاضرة');
    } else {
      toast.success('تم حذف المحاضرة');
      fetchLessons(newLesson.course_id);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-[#665446]">إدارة المحاضرات</h3>

      <div className="bg-[#FFF9EF] p-6 rounded-xl shadow-md space-y-4">
        <h4 className="text-xl font-semibold text-[#665446]">
          {newLesson.id ? 'تعديل محاضرة' : 'إضافة محاضرة'}
        </h4>

        <select
          value={selectedLevel}
          onChange={handleLevelChange}
          className="w-full p-2 border rounded-md"
        >
          <option value="">اختر المستوى</option>
          {levels.map((level) => (
            <option key={level.id} value={level.id}>{level.name}</option>
          ))}
        </select>

        <select
          value={newLesson.course_id}
          onChange={handleCourseChange}
          disabled={!selectedLevel}
          className="w-full p-2 border rounded-md"
        >
          <option value="">اختر الدورة</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>{course.name}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="عنوان المحاضرة"
          value={newLesson.title}
          onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
          className="w-full p-2 border rounded-md"
        />
        <textarea
          placeholder="وصف المحاضرة"
          value={newLesson.description}
          onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
          className="w-full p-2 border rounded-md"
        />
        <input
          type="number"
          placeholder="المدة بالدقائق"
          value={newLesson.duration}
          onChange={(e) => setNewLesson({ ...newLesson, duration: e.target.value })}
          className="w-full p-2 border rounded-md"
        />
        <input
          type="text"
          placeholder="رابط اليوتيوب"
          value={newLesson.youtube_link}
          onChange={(e) => setNewLesson({ ...newLesson, youtube_link: e.target.value })}
          className="w-full p-2 border rounded-md"
        />
        <input
          type="text"
          placeholder="اسم المعلم"
          value={newLesson.teacher_name}
          onChange={(e) => setNewLesson({ ...newLesson, teacher_name: e.target.value })}
          className="w-full p-2 border rounded-md"
        />

        <button
          onClick={handleAddOrUpdateLesson}
          className="bg-[#665446] text-white px-4 py-2 rounded-md hover:bg-opacity-90"
        >
          {newLesson.id ? 'تحديث المحاضرة' : 'إضافة المحاضرة'}
        </button>
      </div>

      {loading ? (
        <p className="text-[#665446]">جاري تحميل المحاضرات...</p>
      ) : lessons.length > 0 ? (
        <div className="flex flex-col gap-4">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="bg-[#FFF9EF] p-5 rounded-xl shadow-md space-y-2">
              <h4 className="text-xl font-bold text-[#665446]">{lesson.title}</h4>
              <p className="text-[#665446]">{lesson.description}</p>
              <div className="text-sm text-[#665446]">المدة: {lesson.duration} دقيقة</div>
              <div className="text-sm text-[#665446]">الحالة: {lesson.status}</div>
              <div className="text-sm text-[#665446]">المعلم: {lesson.teacher_name}</div>
              {lesson.youtube_link && (
                <a href={lesson.youtube_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                  مشاهدة على يوتيوب
                </a>
              )}
              <button onClick={() => setNewLesson(lesson)} className="text-blue-600 hover:underline text-sm">
                تعديل
              </button>
              <button onClick={() => handleDeleteLesson(lesson.id)} className="text-red-600 hover:underline text-sm">
                حذف
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[#665446]">لا توجد محاضرات لهذه الدورة.</p>
      )}
    </div>
  );
};



// ابدأ صفحة الدورات
const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCourse, setNewCourse] = useState({ name: '', description: '', level_id: '' });
  const [editingId, setEditingId] = useState(null);
  const [editedCourse, setEditedCourse] = useState({ name: '', description: '', level_id: '' });

  useEffect(() => {
    fetchCourses();
    fetchLevels();
  }, []);

  const fetchCourses = async () => {
    const { data, error } = await supabase.from('courses').select('id, name, description, level_id');
    if (error) toast.error('فشل في جلب الدورات');
    else setCourses(data);
    setLoading(false);
  };

  const fetchLevels = async () => {
    const { data, error } = await supabase.from('levels').select('id, name');
    if (!error) setLevels(data);
  };

  const handleAddCourse = async () => {
    if (!newCourse.name.trim() || !newCourse.level_id) {
      toast.error('الاسم والمستوى مطلوبان');
      return;
    }

    const { error } = await supabase.from('courses').insert([newCourse]);
    if (error) toast.error('فشل في إضافة الدورة');
    else {
      toast.success('تمت إضافة الدورة');
      setNewCourse({ name: '', description: '', level_id: '' });
      fetchCourses();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل تريد حذف الدورة؟')) return;
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) toast.error('فشل في الحذف');
    else {
      toast.success('تم الحذف');
      fetchCourses();
    }
  };

  const handleEditClick = (course) => {
    setEditingId(course.id);
    setEditedCourse({ name: course.name, description: course.description, level_id: course.level_id });
  };

  const handleUpdate = async (id) => {
    if (!editedCourse.name.trim() || !editedCourse.level_id) {
      toast.error('الاسم والمستوى مطلوبان');
      return;
    }

    const { error } = await supabase.from('courses').update(editedCourse).eq('id', id);
    if (error) toast.error('فشل في التحديث');
    else {
      toast.success('تم التحديث بنجاح');
      setEditingId(null);
      setEditedCourse({ name: '', description: '', level_id: '' });
      fetchCourses();
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-[#665446]">إدارة الدورات</h3>

      {/* إضافة دورة */}
      <div className="bg-[#FFF9EF] p-6 rounded-xl shadow-md space-y-4">
        <h4 className="text-xl font-semibold text-[#665446]">إضافة دورة</h4>
        <input type="text" placeholder="اسم الدورة" value={newCourse.name}
          onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
          className="w-full p-2 border rounded-md" />
        <textarea placeholder="وصف الدورة" value={newCourse.description}
          onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
          className="w-full p-2 border rounded-md" />
        <select value={newCourse.level_id}
          onChange={(e) => setNewCourse({ ...newCourse, level_id: e.target.value })}
          className="w-full p-2 border rounded-md">
          <option value="">اختر المستوى</option>
          {levels.map(level => (
            <option key={level.id} value={level.id}>{level.name}</option>
          ))}
        </select>
        <button onClick={handleAddCourse}
          className="bg-[#665446] text-white px-4 py-2 rounded-md hover:bg-opacity-90">
          إضافة الدورة
        </button>
      </div>

      {/* عرض الدورات */}
      {loading ? (
        <p className="text-[#665446]">جاري تحميل الدورات...</p>
      ) : (
        <div className="flex flex-col gap-4">
          {courses.map((course) => (
            <div key={course.id} className="bg-[#FFF9EF] p-5 rounded-xl shadow-md space-y-2">
              {editingId === course.id ? (
                <>
                  <input value={editedCourse.name}
                    onChange={(e) => setEditedCourse({ ...editedCourse, name: e.target.value })}
                    className="w-full p-2 border rounded-md" />
                  <textarea value={editedCourse.description}
                    onChange={(e) => setEditedCourse({ ...editedCourse, description: e.target.value })}
                    className="w-full p-2 border rounded-md" />
                  <select value={editedCourse.level_id}
                    onChange={(e) => setEditedCourse({ ...editedCourse, level_id: e.target.value })}
                    className="w-full p-2 border rounded-md">
                    <option value="">اختر المستوى</option>
                    {levels.map(level => (
                      <option key={level.id} value={level.id}>{level.name}</option>
                    ))}
                  </select>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => handleUpdate(course.id)}
                      className="bg-green-600 text-white px-4 py-1 rounded-md">حفظ</button>
                    <button onClick={() => setEditingId(null)}
                      className="bg-gray-500 text-white px-4 py-1 rounded-md">إلغاء</button>
                  </div>
                </>
              ) : (
                <>
                  <h4 className="text-xl font-bold text-[#665446]">{course.name}</h4>
                  <p className="text-[#665446]">{course.description}</p>
                  <div className="text-sm text-[#665446]">
                    المستوى: {levels.find(l => l.id === course.level_id)?.name || 'غير محدد'}
                  </div>
                  <div className="flex gap-2 justify-end mt-2">
                    <button onClick={() => handleEditClick(course)}
                      className="bg-yellow-500 text-white px-4 py-1 rounded-md">تعديل</button>
                    <button onClick={() => handleDelete(course.id)}
                      className="bg-red-500 text-white px-4 py-1 rounded-md">حذف</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


const ExamsPage = () => {
  const [levels, setLevels] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [examTitle, setExamTitle] = useState('');
  const [passingScore, setPassingScore] = useState(85);
  const [questions, setQuestions] = useState([]);
  const [question, setQuestion] = useState('');
  const [choices, setChoices] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [existingExam, setExistingExam] = useState(null);

  // جلب المستويات
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const { data, error } = await supabase.from('levels').select('id, name');
        if (error) {
          console.error('Error fetching levels:', error);
          toast.error('فشل في جلب المستويات');
        } else {
          setLevels(data || []);
        }
      } catch (error) {
        console.error('Error in fetchLevels:', error);
        toast.error('حدث خطأ في جلب المستويات');
      }
    };
    fetchLevels();
  }, []);

  // جلب الدورات عند اختيار المستوى
  useEffect(() => {
    if (selectedLevel) {
      const fetchCourses = async () => {
        try {
          const { data, error } = await supabase
            .from('courses')
            .select('id, name')
            .eq('level_id', selectedLevel);
          
          if (error) {
            console.error('Error fetching courses:', error);
            toast.error('فشل في جلب الدورات');
          } else {
            setCourses(data || []);
          }
        } catch (error) {
          console.error('Error in fetchCourses:', error);
          toast.error('حدث خطأ في جلب الدورات');
        }
      };
      fetchCourses();
      setSelectedCourse('');
      setLessons([]);
      setSelectedLesson('');
      resetExamData();
    }
  }, [selectedLevel]);

  // جلب المحاضرات عند اختيار الدورة
  useEffect(() => {
    if (selectedCourse) {
      const fetchLessons = async () => {
        try {
          const { data, error } = await supabase
            .from('lessons')
            .select('id, title')
            .eq('course_id', selectedCourse)
            .order('id', { ascending: true });
          
          if (error) {
            console.error('Error fetching lessons:', error);
            toast.error('فشل في جلب المحاضرات');
          } else {
            setLessons(data || []);
          }
        } catch (error) {
          console.error('Error in fetchLessons:', error);
          toast.error('حدث خطأ في جلب المحاضرات');
        }
      };
      fetchLessons();
      setSelectedLesson('');
      resetExamData();
    }
  }, [selectedCourse]);

  // جلب الاختبار الموجود عند اختيار المحاضرة
  useEffect(() => {
    if (selectedLesson) {
      const fetchExamQuestions = async () => {
        try {
          const { data, error } = await supabase
            .from('exams')
            .select('*')
            .eq('lesson_id', selectedLesson)
            .maybeSingle(); // استخدام maybeSingle بدلاً من single
          
          if (error) {
            console.error('Error fetching exam:', error);
            if (error.code !== 'PGRST116') { // تجاهل خطأ "no rows returned"
              toast.error('فشل في جلب بيانات الاختبار');
            }
          }
          
          if (data) {
            console.log('Existing exam found:', data);
            setExistingExam(data);
            setExamTitle(data.title || '');
            setPassingScore(data.passing_score || 85);
            
            if (data.questions) {
              try {
                const parsedQuestions = JSON.parse(data.questions);
                setQuestions(Array.isArray(parsedQuestions) ? parsedQuestions : []);
              } catch (parseError) {
                console.error('Error parsing questions:', parseError);
                setQuestions([]);
              }
            } else {
              setQuestions([]);
            }
          } else {
            console.log('No existing exam found for lesson:', selectedLesson);
            resetExamData();
          }
        } catch (error) {
          console.error('Error in fetchExamQuestions:', error);
          toast.error('حدث خطأ في جلب بيانات الاختبار');
          resetExamData();
        }
      };
      fetchExamQuestions();
    } else {
      resetExamData();
    }
  }, [selectedLesson]);

  // دالة لإعادة تعيين بيانات الاختبار
  const resetExamData = () => {
    setExistingExam(null);
    setExamTitle('');
    setPassingScore(85);
    setQuestions([]);
    setQuestion('');
    setChoices(['', '', '', '']);
    setCorrectAnswer('');
    setEditIndex(null);
  };

  // إضافة أو تعديل سؤال
  const addOrEditQuestion = async () => {
    // التحقق من صحة البيانات
    if (!question.trim()) {
      toast.error('يرجى كتابة نص السؤال');
      return;
    }

    if (choices.some(choice => choice.trim() === '')) {
      toast.error('يرجى تعبئة جميع الخيارات');
      return;
    }

    if (!correctAnswer.trim()) {
      toast.error('يرجى تحديد الإجابة الصحيحة');
      return;
    }

    // التحقق من أن الإجابة الصحيحة موجودة في الخيارات
    if (!choices.includes(correctAnswer)) {
      toast.error('الإجابة الصحيحة يجب أن تكون إحدى الخيارات المكتوبة');
      return;
    }

    let newQuestions;
    
    if (editIndex !== null) {
      newQuestions = [...questions];
      newQuestions[editIndex] = { 
        question: question.trim(), 
        choices: choices.map(c => c.trim()), 
        answer: correctAnswer.trim() 
      };
    } else {
      newQuestions = [...questions, { 
        question: question.trim(), 
        choices: choices.map(c => c.trim()), 
        answer: correctAnswer.trim() 
      }];
    }

    setQuestions(newQuestions);

    // تحديث قاعدة البيانات فوراً إذا كان هناك اختبار موجود
    if (existingExam) {
      try {
        const { error } = await supabase
          .from('exams')
          .update({
            questions: JSON.stringify(newQuestions),
            title: examTitle || 'اختبار المحاضرة',
            passing_score: parseInt(passingScore) || 85
          })
          .eq('id', existingExam.id);

        if (error) {
          console.error('Error updating question:', error);
          toast.error('فشل في حفظ السؤال في قاعدة البيانات');
          setQuestions(questions); // إرجاع الحالة السابقة
          return;
        }
      } catch (error) {
        console.error('Error in updating question:', error);
        toast.error('حدث خطأ أثناء حفظ السؤال');
        setQuestions(questions);
        return;
      }
    }

    if (editIndex !== null) {
      setEditIndex(null);
      toast.success('تم تعديل السؤال بنجاح');
    } else {
      toast.success('تمت إضافة السؤال بنجاح');
    }
    
    // مسح النموذج
    setQuestion('');
    setChoices(['', '', '', '']);
    setCorrectAnswer('');
  };

  // بدء التعديل على سؤال
  const handleEdit = (idx) => {
    if (idx >= 0 && idx < questions.length) {
      setEditIndex(idx);
      setQuestion(questions[idx].question);
      setChoices([...questions[idx].choices]);
      setCorrectAnswer(questions[idx].answer);
      // التمرير إلى نموذج إضافة السؤال
      setTimeout(() => {
        document.getElementById('question-form')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // حذف سؤال
  const handleDelete = async (idx) => {
    if (idx < 0 || idx >= questions.length) return;
    
    if (window.confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
      const newQuestions = questions.filter((_, i) => i !== idx);
      setQuestions(newQuestions);
      
      // تحديث قاعدة البيانات فوراً
      if (existingExam) {
        try {
          const { error } = await supabase
            .from('exams')
            .update({
              questions: JSON.stringify(newQuestions)
            })
            .eq('id', existingExam.id);

          if (error) {
            console.error('Error deleting question:', error);
            toast.error('فشل في حذف السؤال من قاعدة البيانات');
            setQuestions(questions); // إرجاع السؤال
            return;
          }
        } catch (error) {
          console.error('Error in deleting question:', error);
          toast.error('حدث خطأ أثناء حذف السؤال');
          setQuestions(questions);
          return;
        }
      }
      
      toast.success('تم حذف السؤال بنجاح');
      
      // إذا كان السؤال المحذوف هو المُعدَّل حالياً
      if (editIndex === idx) {
        setEditIndex(null);
        setQuestion('');
        setChoices(['', '', '', '']);
        setCorrectAnswer('');
      } else if (editIndex !== null && editIndex > idx) {
        // تعديل فهرس التعديل إذا كان السؤال المحذوف قبله
        setEditIndex(editIndex - 1);
      }
    }
  };

  const handleChoiceChange = (index, value) => {
    if (index >= 0 && index < 4) {
      const newChoices = [...choices];
      newChoices[index] = value;
      setChoices(newChoices);
    }
  };

  // إلغاء التعديل
  const handleCancelEdit = () => {
    setEditIndex(null);
    setQuestion('');
    setChoices(['', '', '', '']);
    setCorrectAnswer('');
  };

  // حفظ تعديلات العنوان ودرجة النجاح
  const updateExamInfo = async () => {
    if (!existingExam) return;
    
    try {
      const { error } = await supabase
        .from('exams')
        .update({
          title: examTitle || 'اختبار المحاضرة',
          passing_score: parseInt(passingScore) || 85
        })
        .eq('id', existingExam.id);

      if (error) {
        console.error('Error updating exam info:', error);
        toast.error('فشل في حفظ معلومات الاختبار');
      } else {
        toast.success('تم حفظ معلومات الاختبار');
      }
    } catch (error) {
      console.error('Error in updateExamInfo:', error);
      toast.error('حدث خطأ أثناء حفظ معلومات الاختبار');
    }
  };

  // إضافة أو تحديث الامتحان في قاعدة البيانات
  const handleSubmitExam = async () => {
    console.log('handleSubmitExam called');
    console.log('selectedLesson:', selectedLesson);
    console.log('examTitle:', examTitle);
    console.log('questions.length:', questions.length);
    console.log('existingExam:', existingExam);

    // التحقق من صحة البيانات
    if (!selectedLesson) {
      toast.error('يرجى اختيار المحاضرة');
      return;
    }

    if (!examTitle.trim()) {
      toast.error('يرجى كتابة عنوان الاختبار');
      return;
    }

    if (questions.length === 0) {
      toast.error('يرجى إضافة أسئلة للاختبار');
      return;
    }

    const finalPassingScore = parseInt(passingScore);
    if (isNaN(finalPassingScore) || finalPassingScore < 1 || finalPassingScore > 100) {
      toast.error('يرجى إدخال درجة نجاح صحيحة (1-100)');
      return;
    }

    const examData = {
      title: examTitle.trim(),
      questions: JSON.stringify(questions),
      lesson_id: parseInt(selectedLesson),
      passing_score: finalPassingScore,
    };

    console.log('examData:', examData);

    setLoading(true);

    try {
      if (existingExam) {
        console.log('Updating existing exam with ID:', existingExam.id);
        // تحديث الاختبار الموجود
        const { data, error } = await supabase
          .from('exams')
          .update(examData)
          .eq('id', existingExam.id)
          .select();

        console.log('Update result:', { data, error });

        if (error) {
          console.error('Error updating exam:', error);
          toast.error(`فشل في تحديث الاختبار: ${error.message}`);
        } else {
          console.log('Exam updated successfully:', data);
          toast.success('تم تحديث الاختبار بنجاح');
        }
      } else {
        console.log('Creating new exam');
        // إضافة اختبار جديد
        const { data, error } = await supabase
          .from('exams')
          .insert([examData])
          .select();

        console.log('Insert result:', { data, error });

        if (error) {
          console.error('Error inserting exam:', error);
          toast.error(`فشل في إضافة الاختبار: ${error.message}`);
        } else {
          console.log('Exam created successfully:', data);
          if (data && data.length > 0) {
            setExistingExam(data[0]);
            toast.success('تم إضافة الاختبار بنجاح');
          } else {
            toast.error('تم إضافة الاختبار لكن لم يتم الحصول على البيانات المرجعة');
          }
        }
      }
    } catch (error) {
      console.error('Error in handleSubmitExam:', error);
      toast.error(`حدث خطأ أثناء حفظ الاختبار: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 min-h-screen">
      <div className="w-full mx-auto bg-[#FFF9EF] p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-[#665446] mb-6">إدارة اختبارات المحاضرات</h2>

        {/* اختيار المستوى */}
        <div className="mb-4">
          <label className="block text-sm text-[#665446] mb-2">اختر المستوى</label>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665446]"
          >
            <option value="">-- اختر المستوى --</option>
            {levels.map((lvl) => (
              <option key={lvl.id} value={lvl.id}>{lvl.name}</option>
            ))}
          </select>
        </div>

        {/* اختيار الدورة */}
        <div className="mb-4">
          <label className="block text-sm text-[#665446] mb-2">اختر الدورة</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            disabled={!selectedLevel}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665446] disabled:bg-gray-100"
          >
            <option value="">-- اختر الدورة --</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>
        </div>

        {/* اختيار المحاضرة */}
        <div className="mb-6">
          <label className="block text-sm text-[#665446] mb-2">اختر المحاضرة</label>
          <select
            value={selectedLesson}
            onChange={(e) => setSelectedLesson(e.target.value)}
            disabled={!selectedCourse}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665446] disabled:bg-gray-100"
          >
            <option value="">-- اختر المحاضرة --</option>
            {lessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
            ))}
          </select>
        </div>

        {/* معلومات الاختبار الموجود */}
        {selectedLesson && existingExam && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              🔍 اختبار موجود لهذه المحاضرة
            </h3>
            <p className="text-blue-700">
              العنوان: {existingExam.title} | درجة النجاح: {existingExam.passing_score}% | عدد الأسئلة: {questions.length}
            </p>
          </div>
        )}

        {/* عرض الأسئلة الموجودة */}
        {selectedLesson && questions.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-[#665446] mb-4">
              الأسئلة الموجودة ({questions.length} سؤال)
            </h3>
            <div className="space-y-4">
              {questions.map((q, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-[#665446] text-right flex-1">
                      السؤال {index + 1}: {q.question}
                    </h4>
                    <div className="flex space-x-2 space-x-reverse">
                      <button
                        onClick={() => handleEdit(index)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {q.choices.map((choice, choiceIndex) => (
                      <div
                        key={choiceIndex}
                        className={`p-2 rounded text-sm ${
                          choice === q.answer
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-gray-50 text-gray-700'
                        }`}
                      >
                        {choice === q.answer && '✓ '}{choice}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-green-600 font-medium">
                    الإجابة الصحيحة: {q.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* نموذج إضافة/تعديل السؤال */}
        {selectedLesson && (
          <div id="question-form" className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-[#665446] mb-4">
              {editIndex !== null ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
            </h3>

            {/* عنوان الاختبار */}
            <div className="mb-4">
              <label className="block text-sm text-[#665446] mb-2">عنوان الاختبار</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665446]"
                  placeholder="عنوان الاختبار"
                />
                {existingExam && (
                  <button
                    onClick={updateExamInfo}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    حفظ
                  </button>
                )}
              </div>
            </div>

            {/* درجة النجاح */}
            <div className="mb-4">
              <label className="block text-sm text-[#665446] mb-2">درجة النجاح (%)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={passingScore}
                  onChange={(e) => setPassingScore(e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665446]"
                  min={1}
                  max={100}
                  placeholder="85"
                />
                {existingExam && (
                  <button
                    onClick={updateExamInfo}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    حفظ
                  </button>
                )}
              </div>
            </div>

            {/* السؤال */}
            <div className="mb-4">
              <label className="block text-sm text-[#665446] mb-2">السؤال</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665446]"
                rows={3}
                placeholder="اكتب نص السؤال هنا..."
              />
            </div>

            {/* الخيارات */}
            <div className="mb-4">
              <label className="block text-sm text-[#665446] mb-2">الخيارات</label>
              <div className="grid grid-cols-1 gap-3">
                {choices.map((choice, index) => (
                  <input
                    key={index}
                    type="text"
                    value={choice}
                    onChange={(e) => handleChoiceChange(index, e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665446]"
                    placeholder={`الخيار ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* الإجابة الصحيحة */}
            <div className="mb-6">
              <label className="block text-sm text-[#665446] mb-2">الإجابة الصحيحة</label>
              <select
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665446]"
              >
                <option value="">-- اختر الإجابة الصحيحة --</option>
                {choices.filter(choice => choice.trim()).map((choice, index) => (
                  <option key={index} value={choice}>
                    {choice}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-600 mt-1">
                اكتب الخيارات أولاً، ثم اختر الإجابة الصحيحة من القائمة
              </p>
            </div>

            {/* أزرار إضافة/تعديل السؤال */}
            <div className="flex space-x-4 space-x-reverse">
              <button
                onClick={addOrEditQuestion}
                className="bg-[#665446] text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors"
                disabled={loading}
              >
                {editIndex !== null ? 'حفظ التعديل' : 'إضافة سؤال'}
              </button>
              {editIndex !== null && (
                <button
                  onClick={handleCancelEdit}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  إلغاء التعديل
                </button>
              )}
            </div>
          </div>
        )}

        {/* زر حفظ الاختبار */}
        {selectedLesson && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-yellow-800 mb-2">📝 معلومات الحفظ:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• الأسئلة يتم حفظها تلقائياً عند إضافتها أو تعديلها</li>
                <li>• هذا الزر يحفظ معلومات الاختبار العامة (العنوان ودرجة النجاح)</li>
                <li>• إذا لم يكن هناك اختبار موجود، سيتم إنشاء اختبار جديد</li>
              </ul>
            </div>
            <button
              onClick={handleSubmitExam}
              className="w-full bg-[#665446] text-white px-6 py-4 rounded-lg hover:bg-opacity-90 transition-colors text-lg font-semibold"
              disabled={loading}
            >
              {loading ? 'جارٍ الحفظ...' : (existingExam ? 'تحديث معلومات الاختبار' : 'إنشاء اختبار جديد')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};



export default AdminDashboard;