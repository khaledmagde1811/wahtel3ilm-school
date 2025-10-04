import React, { useState, useEffect } from 'react';
import { Users, BookOpen, GraduationCap, FileText, Heart, Award, UserCheck, Clock, TrendingUp, BarChart3 } from 'lucide-react';
import { supabase } from '../../Utilities/supabaseClient';

const DatabaseStatistics = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalTeachers: 0,
    activeTeachers: 0,
    totalCourses: 0,
    totalLevels: 0,
    totalLessons: 0,
    openLessons: 0,
    closedLessons: 0,
    totalArticles: 0,
    openArticles: 0,
    totalExams: 0,
    totalRegistrations: 0,
    totalLikes: 0,
    passedLessons: 0,
    failedLessons: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // جلب الإحصائيات من Supabase
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError(null);

        // جلب إحصائيات الطلاب
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('status');
        
        if (studentsError) throw studentsError;

        const totalStudents = studentsData?.length || 0;
        const activeStudents = studentsData?.filter(student => student.status === 'نشط')?.length || 0;

        // جلب إحصائيات المعلمين
        const { data: teachersData, error: teachersError } = await supabase
          .from('teachers')
          .select('status');
        
        if (teachersError) throw teachersError;

        const totalTeachers = teachersData?.length || 0;
        const activeTeachers = teachersData?.filter(teacher => teacher.status === 'نشط')?.length || 0;

        // جلب إحصائيات الكورسات
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('id');
        
        if (coursesError) throw coursesError;

        const totalCourses = coursesData?.length || 0;

        // جلب إحصائيات المستويات
        const { data: levelsData, error: levelsError } = await supabase
          .from('levels')
          .select('id');
        
        if (levelsError) throw levelsError;

        const totalLevels = levelsData?.length || 0;

        // جلب إحصائيات الدروس
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('status');
        
        if (lessonsError) throw lessonsError;

        const totalLessons = lessonsData?.length || 0;
        const openLessons = lessonsData?.filter(lesson => lesson.status === 'مفتوحة')?.length || 0;
        const closedLessons = lessonsData?.filter(lesson => lesson.status === 'مغلقة')?.length || 0;

        // جلب إحصائيات المقالات
        const { data: articlesData, error: articlesError } = await supabase
          .from('articles')
          .select('status');
        
        if (articlesError) throw articlesError;

        const totalArticles = articlesData?.length || 0;
        const openArticles = articlesData?.filter(article => article.status === 'مفتوح')?.length || 0;

        // جلب إحصائيات الامتحانات
        const { data: examsData, error: examsError } = await supabase
          .from('exams')
          .select('id');
        
        if (examsError) throw examsError;

        const totalExams = examsData?.length || 0;

        // جلب إحصائيات التسجيلات
        const { data: registrationsData, error: registrationsError } = await supabase
          .from('course_registration')
          .select('id');
        
        if (registrationsError) throw registrationsError;

        const totalRegistrations = registrationsData?.length || 0;

        // جلب إحصائيات الإعجابات
        const { data: likesData, error: likesError } = await supabase
          .from('likes')
          .select('id');
        
        if (likesError) throw likesError;

        const totalLikes = likesData?.length || 0;

        // جلب إحصائيات الدروس المجتازة
        const { data: studentLessonsData, error: studentLessonsError } = await supabase
          .from('student_lessons')
          .select('passed');
        
        if (studentLessonsError) throw studentLessonsError;

        const passedLessons = studentLessonsData?.filter(sl => sl.passed === true)?.length || 0;
        const failedLessons = studentLessonsData?.filter(sl => sl.passed === false)?.length || 0;

        // تحديث الحالة بالبيانات الحقيقية
        setStats({
          totalStudents,
          activeStudents,
          totalTeachers,
          activeTeachers,
          totalCourses,
          totalLevels,
          totalLessons,
          openLessons,
          closedLessons,
          totalArticles,
          openArticles,
          totalExams,
          totalRegistrations,
          totalLikes,
          passedLessons,
          failedLessons
        });

      } catch (err) {
        console.error('خطأ في جلب الإحصائيات:', err);
        setError('حدث خطأ في تحميل الإحصائيات. يرجى المحاولة مرة أخرى.');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  // دالة إعادة تحميل الإحصائيات
  const refreshStatistics = () => {
    setLoading(true);
    window.location.reload();
  };

  const StatCard = ({ title, value, icon: Icon, color = "#665446", subtitle }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
          <p className="text-3xl font-bold" style={{ color }}>
            {loading ? '...' : value.toLocaleString()}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <Icon className="h-8 w-8" style={{ color }} />
      </div>
    </div>
  );

  const ProgressBar = ({ label, current, total, color = "#665446" }) => {
    const percentage = total > 0 ? (current / total) * 100 : 0;
    
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium" style={{ color: "#665446" }}>{label}</span>
          <span className="text-sm" style={{ color: "#665446" }}>
            {current.toLocaleString()} / {total.toLocaleString()} ({percentage.toFixed(1)}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-300" 
            style={{ 
              backgroundColor: color, 
              width: `${Math.min(percentage, 100)}%` 
            }}
          ></div>
        </div>
      </div>
    );
  };

  if (error && !loading) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: '#FFF9EF' }}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-red-800 mb-4">خطأ في تحميل البيانات</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={refreshStatistics}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
            >
              إعادة المحاولة
            </button>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-bold text-yellow-800 mb-3">تأكد من وجود هذه المتغيرات في ملف .env:</h3>
            <div className="text-yellow-700 space-y-2">
              <p className="font-medium">للـ React:</p>
              <pre className="bg-gray-100 p-3 rounded text-sm">
{`REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here`}
              </pre>
              <p className="text-sm text-yellow-600 mt-3">
                تأكد من إعادة تشغيل الخادم بعد تعديل ملف .env
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#FFF9EF' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#665446' }}>
              لوحة الإحصائيات
            </h1>
            <p className="text-lg" style={{ color: '#665446' }}>
              نظرة شاملة على إحصائيات قاعدة البيانات
            </p>
          </div>
          
          <button
            onClick={refreshStatistics}
            disabled={loading}
            className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-md border border-gray-200 transition-colors duration-200 disabled:opacity-50"
            style={{ color: '#665446' }}
          >
            {loading ? 'جاري التحميل...' : 'تحديث البيانات'}
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#665446' }}></div>
            <span className="ml-3 text-lg" style={{ color: '#665446' }}>جاري تحميل الإحصائيات...</span>
          </div>
        )}

        {!loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="إجمالي الطلاب"
                value={stats.totalStudents}
                icon={Users}
                subtitle={`${stats.activeStudents} نشط`}
              />
              <StatCard
                title="إجمالي المعلمين"
                value={stats.totalTeachers}
                icon={GraduationCap}
                subtitle={`${stats.activeTeachers} نشط`}
              />
              <StatCard
                title="إجمالي الكورسات"
                value={stats.totalCourses}
                icon={BookOpen}
              />
              <StatCard
                title="إجمالي المستويات"
                value={stats.totalLevels}
                icon={BarChart3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="إجمالي الدروس"
                value={stats.totalLessons}
                icon={BookOpen}
                subtitle={`${stats.openLessons} مفتوح، ${stats.closedLessons} مغلق`}
              />
              <StatCard
                title="إجمالي المقالات"
                value={stats.totalArticles}
                icon={FileText}
                subtitle={`${stats.openArticles} مفتوح`}
              />
              <StatCard
                title="إجمالي الامتحانات"
                value={stats.totalExams}
                icon={Award}
              />
              <StatCard
                title="إجمالي الإعجابات"
                value={stats.totalLikes}
                icon={Heart}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                title="إجمالي التسجيلات"
                value={stats.totalRegistrations}
                icon={UserCheck}
              />
              <StatCard
                title="الدروس المجتازة"
                value={stats.passedLessons}
                icon={TrendingUp}
              />
              <StatCard
                title="الدروس غير المجتازة"
                value={stats.failedLessons}
                icon={Clock}
              />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#665446' }}>
                تحليل الأداء
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: '#665446' }}>
                    إحصائيات المستخدمين
                  </h3>
                  <ProgressBar
                    label="الطلاب النشطون"
                    current={stats.activeStudents}
                    total={stats.totalStudents}
                    color="#10B981"
                  />
                  <ProgressBar
                    label="المعلمون النشطون"
                    current={stats.activeTeachers}
                    total={stats.totalTeachers}
                    color="#3B82F6"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: '#665446' }}>
                    إحصائيات المحتوى
                  </h3>
                  <ProgressBar
                    label="الدروس المفتوحة"
                    current={stats.openLessons}
                    total={stats.totalLessons}
                    color="#F59E0B"
                  />
                  <ProgressBar
                    label="المقالات المفتوحة"
                    current={stats.openArticles}
                    total={stats.totalArticles}
                    color="#EF4444"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#665446' }}>
                الأداء الأكاديمي
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: '#665446' }}>
                    نتائج الدروس
                  </h3>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg mb-4">
                    <div>
                      <p className="text-green-800 font-medium">الدروس المجتازة</p>
                      <p className="text-2xl font-bold text-green-600">
                        {stats.passedLessons.toLocaleString()}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div>
                      <p className="text-red-800 font-medium">الدروس غير المجتازة</p>
                      <p className="text-2xl font-bold text-red-600">
                        {stats.failedLessons.toLocaleString()}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-red-600" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: '#665446' }}>
                    معدل النجاح
                  </h3>
                  <div className="text-center">
                    <div 
                      className="inline-flex items-center justify-center w-32 h-32 rounded-full text-white text-3xl font-bold mb-4"
                      style={{ backgroundColor: '#665446' }}
                    >
                      {stats.passedLessons + stats.failedLessons > 0 
                        ? Math.round((stats.passedLessons / (stats.passedLessons + stats.failedLessons)) * 100)
                        : 0
                      }%
                    </div>
                    <p className="text-lg" style={{ color: '#665446' }}>
                      معدل النجاح الإجمالي
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <p className="text-sm" style={{ color: '#665446' }}>
                آخر تحديث: {new Date().toLocaleDateString('ar-EG')} - {new Date().toLocaleTimeString('ar-EG')}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DatabaseStatistics;