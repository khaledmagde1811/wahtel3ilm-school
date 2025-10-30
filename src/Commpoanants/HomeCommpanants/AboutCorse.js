import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  BookOpen,
  Users,
  ArrowRight,
  Loader,
  GraduationCap,
  Book,
  FileText,
  User,
  Heart,
  MessageSquare,
  Target,
  Award,
  Scroll,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { supabase } from '../../Utilities/supabaseClient';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// === Custom Arrows ===
const CustomPrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute right-8 top-1/2 z-20 -translate-y-1/2 bg-gradient-to-r from-white/95 to-white/85 backdrop-blur-md hover:from-white hover:to-white/95 shadow-2xl rounded-full p-4 transition-all duration-500 hover:scale-125 hover:shadow-amber-500/25 group border border-white/20"
  >
    <ChevronRight className="w-5 h-5 text-[#665446] group-hover:text-[#8B7355] transition-all duration-300 group-hover:scale-110" />
  </button>
);

const CustomNextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute left-8 top-1/2 z-20 -translate-y-1/2 bg-gradient-to-r from-white/95 to-white/85 backdrop-blur-md hover:from-white hover:to-white/95 shadow-2xl rounded-full p-4 transition-all duration-500 hover:scale-125 hover:shadow-amber-500/25 group border border-white/20"
  >
    <ChevronLeft className="w-5 h-5 text-[#665446] group-hover:text-[#8B7355] transition-all duration-300 group-hover:scale-110" />
  </button>
);

// === Course Card ===
const CourseCard = ({ course, totalStudents, totalLessons }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const getCourseIcon = (courseName) => {
    const name = (courseName || '').toLowerCase();
    if (name.includes('حديث') || name.includes('مصطلح'))
      return { icon: <Book className="w-10 h-10 text-white drop-shadow-lg" />, gradient: 'from-emerald-500 to-teal-600' };
    if (name.includes('فقه') || name.includes('فقة'))
      return { icon: <FileText className="w-10 h-10 text-white drop-shadow-lg" />, gradient: 'from-blue-500 to-cyan-600' };
    if (name.includes('سيرة'))
      return { icon: <User className="w-10 h-10 text-white drop-shadow-lg" />, gradient: 'from-purple-500 to-violet-600' };
    if (name.includes('عقيدة'))
      return { icon: <Heart className="w-10 h-10 text-white drop-shadow-lg" />, gradient: 'from-rose-500 to-pink-600' };
    if (name.includes('نحو') || name.includes('عرب'))
      return { icon: <MessageSquare className="w-10 h-10 text-white drop-shadow-lg" />, gradient: 'from-amber-500 to-orange-600' };
    if (name.includes('أصول'))
      return { icon: <Target className="w-10 h-10 text-white drop-shadow-lg" />, gradient: 'from-indigo-500 to-purple-600' };
    if (name.includes('تفسير'))
      return { icon: <BookOpen className="w-10 h-10 text-white drop-shadow-lg" />, gradient: 'from-green-500 to-emerald-600' };
    if (name.includes('قرآن'))
      return { icon: <Scroll className="w-10 h-10 text-white drop-shadow-lg" />, gradient: 'from-yellow-500 to-amber-600' };
    return { icon: <Award className="w-10 h-10 text-white drop-shadow-lg" />, gradient: 'from-slate-500 to-gray-600' };
  };

  const getLevelColor = (levelName) => {
    if (levelName?.includes('تمهيدي'))
      return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200';
    if (levelName?.includes('الأول'))
      return 'bg-gradient-to-r from-blue-100 to-sky-100 text-blue-800 border border-blue-200';
    if (levelName?.includes('الثاني'))
      return 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border border-purple-200';
    if (levelName?.includes('الثالث'))
      return 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border border-orange-200';
    return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200';
  };

  const handleCourseClick = () => {
    navigate(`/course/${course.id}`);
  };

  const courseIconData = getCourseIcon(course.name);

  return (
    <div className="px-2 group/container">
      <div
        className={`relative bg-gradient-to-br from-white via-white/98 to-amber-50/30 rounded-3xl shadow-lg overflow-hidden transition-all duration-700 h-[380px] sm:h-[400px] md:h-[420px] cursor-pointer border border-white/60 backdrop-blur-sm ${
          isHovered ? 'shadow-2xl scale-[1.03] -translate-y-2 shadow-amber-500/20' : 'hover:shadow-xl'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCourseClick}
      >
        {/* background effects (hidden on very small screens) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
          <div
            className={`absolute inset-0 bg-gradient-to-br from-transparent via-amber-50/20 to-orange-50/30 opacity-0 transition-all duration-700 ${
              isHovered ? 'opacity-100' : ''
            }`}
          />
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 bg-amber-400 rounded-full transition-all duration-1000 ${
                isHovered ? 'opacity-100 animate-pulse' : 'opacity-0'
              }`}
              style={{
                left: `${15 + i * 12}%`,
                top: `${20 + (i % 4) * 18}%`,
                animationDelay: `${i * 0.15}s`,
                animationDuration: `${1.5 + i * 0.2}s`,
              }}
            />
          ))}
          <div
            className={`absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-r from-amber-200/30 to-orange-300/30 rounded-full blur-2xl transition-all duration-1000 ${
              isHovered ? 'scale-150 opacity-60' : 'scale-100 opacity-0'
            }`}
          />
          <div
            className={`absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-l from-yellow-200/30 to-amber-300/30 rounded-full blur-2xl transition-all duration-1000 ${
              isHovered ? 'scale-150 opacity-60' : 'scale-100 opacity-0'
            }`}
          />
        </div>

        {/* level badge */}
        <div className="absolute top-4 right-4 z-10">
          <span
            className={`px-3 py-1.5 rounded-2xl text-xs sm:text-sm font-bold font-['Almarai'] backdrop-blur-sm shadow-lg transition-all duration-500 ${getLevelColor(
              course.level_name
            )} ${isHovered ? 'scale-110 shadow-xl' : ''}`}
          >
            {course.level_name}
          </span>
        </div>

        {/* premium badge */}
        <div
          className={`absolute top-4 left-4 z-10 transition-all duration-500 ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
        >
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold font-['Almarai'] shadow-lg flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            مميز
          </div>
        </div>

        {/* icon area */}
        <div className="relative h-40 sm:h-44 md:h-56 flex items-center justify-center bg-gradient-to-br from-slate-50/50 via-amber-50/30 to-orange-50/40 overflow-hidden">
          <div
            className={`absolute w-40 h-40 bg-gradient-to-br ${courseIconData.gradient} rounded-full opacity-10 transition-all duration-1000 ${
              isHovered ? 'scale-150 rotate-180' : 'scale-100 rotate-0'
            }`}
          />
          <div
            className={`relative w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-br ${
              courseIconData.gradient
            } flex items-center justify-center transition-all duration-700 shadow-2xl ${
              isHovered ? 'scale-125 rotate-12 shadow-3xl' : 'shadow-xl'
            }`}
          >
            {courseIconData.icon}
            <div
              className={`absolute inset-0 rounded-full bg-white/20 transition-opacity duration-700 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </div>

          {/* play overlay */}
          <div
            className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black/10 via-black/5 to-transparent backdrop-blur-[2px] transition-all duration-500 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="bg-white/95 backdrop-blur-md rounded-full p-4 shadow-2xl border border-white/30">
              <Play className="w-7 h-7 text-[#665446] ml-1" />
            </div>
          </div>
        </div>

        {/* content */}
        <div className="p-5 space-y-3">
          <h3
            className={`text-[#665446] text-base sm:text-lg md:text-xl font-bold font-['Almarai'] transition-all duration-500 line-clamp-2 leading-relaxed ${
              isHovered ? 'text-[#8B7355] translate-x-1' : ''
            }`}
          >
            {course.name}
          </h3>

          {course.description && (
            <p
              className={`text-gray-600 text-sm font-['Almarai'] line-clamp-2 leading-relaxed transition-all duration-700 ${
                isHovered ? 'opacity-100 translate-y-0' : 'opacity-80 translate-y-1'
              }`}
            >
              {course.description}
            </p>
          )}

          {/* stats always visible on mobile */}
          <div className="flex items-center justify-between text-[11px] sm:text-xs gap-2 mt-2">
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-sky-50 text-blue-600 px-2.5 py-1.5 rounded-xl shadow-sm border border-blue-100">
              <Users className="w-4 h-4" />
              <span className="font-semibold">{totalStudents || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 px-2.5 py-1.5 rounded-xl shadow-sm border border-green-100">
              <BookOpen className="w-4 h-4" />
              <span className="font-semibold">{totalLessons || 0} درس</span>
            </div>
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-600 px-2.5 py-1.5 rounded-xl shadow-sm border border-amber-100">
              <GraduationCap className="w-4 h-4" />
              <span className="font-semibold">متاح</span>
            </div>
          </div>
        </div>

        {/* bottom line */}
        <div
            className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 transition-all duration-500 ${
              isHovered ? 'opacity-100 h-2' : 'opacity-0 h-1'
            }`}
        />

        {/* arrow */}
        <div
          className={`absolute bottom-4 right-6 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg transition-all duration-500 ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
        >
          <ArrowRight className="w-4 h-4 text-[#665446] rotate-180" />
        </div>
      </div>
    </div>
  );
};

// === Main Component ===
const AboutCourse = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalLessons: 0,
    totalLevels: 0,
  });
  const sliderRef = useRef(null);

  useEffect(() => {
    fetchCoursesData();
  }, []);

  const fetchCoursesData = async () => {
    try {
      setLoading(true);

      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(
          `
          *,
          levels (
            name,
            description
          )
        `
        )
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;

      const coursesWithStats = await Promise.all(
        (coursesData || []).map(async (course) => {
          const { count: lessonsCount } = await supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id);

          return {
            ...course,
            level_name: course.levels?.name || 'غير محدد',
            level_description: course.levels?.description || '',
            lessons_count: lessonsCount || 0,
          };
        })
      );

      // filter specific levels
      const filteredCourses = [];
      const tamheediCourses = coursesWithStats.filter((course) => course.level_name?.includes('تمهيدي')).slice(0, 3);
      const level1Courses = coursesWithStats.filter((course) => course.level_name?.includes('الأول')).slice(0, 3);
      filteredCourses.push(...tamheediCourses, ...level1Courses);

      setCourses(filteredCourses);

      const [{ count: studentsCount }, { count: lessonsCount }, { count: levelsCount }] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('lessons').select('*', { count: 'exact', head: true }),
        supabase.from('levels').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        totalStudents: studentsCount || 0,
        totalCourses: coursesWithStats.length,
        totalLessons: lessonsCount || 0,
        totalLevels: levelsCount || 0,
      });
    } catch (err) {
      console.error('خطأ في جلب بيانات الدورات:', err);
      setError('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const settings = {
    infinite: true,
    speed: 1000,
    slidesToShow: Math.min(3, courses.length),
    slidesToScroll: 1,
    autoplay: courses.length > 3,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    dots: true,
    centerMode: courses.length > 3,
    centerPadding: '40px',
    prevArrow: courses.length > 3 ? <CustomPrevArrow /> : false,
    nextArrow: courses.length > 3 ? <CustomNextArrow /> : false,
    beforeChange: (current, next) => setCurrentSlide(next),
    customPaging: (i) => (
      <div
        className={`w-4 h-4 rounded-full transition-all duration-500 border-2 ${
          i === currentSlide
            ? 'bg-gradient-to-r from-[#665446] to-[#8B7355] border-transparent scale-125 shadow-lg'
            : 'bg-white/60 border-gray-300 hover:bg-gray-100 hover:border-gray-400 hover:scale-110'
        }`}
      />
    ),
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(2, courses.length),
          centerMode: false,
          centerPadding: '20px',
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          centerMode: false,
          arrows: false,
          centerPadding: '0px', // مهم عشان 360px
        },
      },
    ],
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] sm:min-h-screen bg-gradient-to-br from-[#CDC0B6] via-[#D4C7BC] to-[#CDC0B6] py-12 px-4 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <Loader className="w-16 h-16 text-[#665446] animate-spin mx-auto" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-amber-200 rounded-full animate-pulse mx-auto" />
          </div>
          <p className="text-[#665446] text-xl sm:text-2xl font-['Almarai'] font-bold animate-pulse">جاري تحميل الدورات المميزة...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-[60vh] sm:min-h-screen bg-gradient-to-br from-[#CDC0B6] via-[#D4C7BC] to-[#CDC0B6] py-12 px-4 flex items-center justify-center">
        <div className="text-center space-y-6 bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
          <div className="text-red-500 text-6xl sm:text-8xl mb-6 animate-bounce">⚠</div>
          <p className="text-red-600 text-xl sm:text-2xl font-['Almarai'] font-bold">{error}</p>
          <button
            onClick={fetchCoursesData}
            className="bg-gradient-to-r from-[#665446] to-[#8B7355] hover:from-[#8B7355] hover:to-[#665446] text-white px-8 py-3 rounded-2xl transition-all duration-300 font-['Almarai'] font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[60vh] sm:min-h-screen bg-gradient-to-br from-[#CDC0B6] via-[#D4C7BC] to-[#CDC0B6] py-10 sm:py-12 md:py-20 px-3 sm:px-4 relative overflow-hidden">
      {/* background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-40 sm:w-64 h-40 sm:h-64 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-4 sm:left-10 w-52 sm:w-80 h-52 sm:h-80 bg-amber-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 left-1/4 w-32 sm:w-48 h-32 sm:h-48 bg-orange-200/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/4 right-1/3 w-28 sm:w-32 h-28 sm:h-32 bg-yellow-200/12 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* header */}
        <div className="text-center mb-10 md:mb-16 space-y-5 md:space-y-8">
          <div className="inline-block relative">
            <h2 className="text-[#665446] text-3xl sm:text-4xl md:text-6xl font-bold font-['Almarai'] relative">
              الدورات المميزة
              <div className="absolute -bottom-3 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 rounded-full animate-pulse shadow-lg" />
              <Sparkles className="absolute -top-4 -right-8 w-7 h-7 text-amber-400 animate-bounce" />
              <TrendingUp className="absolute -top-6 -left-6 w-6 h-6 text-orange-500 animate-pulse" />
            </h2>
          </div>
          <p className="text-[#8B7355] text-base sm:text-lg md:text-2xl font-['Almarai'] max-w-3xl mx-auto leading-relaxed">
            مجموعة مختارة بعناية من أفضل دوراتنا للمستوى التمهيدي والمستوى الأول
          </p>

          {/* stats */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-12 mt-6 md:mt-10">
            {[
              { value: stats.totalCourses, label: 'دورة متاحة', color: 'from-blue-500 to-cyan-500' },
              { value: stats.totalStudents, label: 'طالب مسجل', color: 'from-green-500 to-emerald-500' },
              { value: stats.totalLessons, label: 'محاضرة', color: 'from-purple-500 to-violet-500' },
              { value: stats.totalLevels, label: 'مستوى دراسي', color: 'from-orange-500 to-amber-500' },
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div
                  className={`bg-gradient-to-r ${stat.color} text-white rounded-2xl p-4 sm:p-6 shadow-xl transform transition-all duration-500 hover:scale-110 hover:shadow-2xl border border-white/20 backdrop-blur-sm`}
                >
                  <div className="text-2xl sm:text-4xl font-bold font-['Almarai'] mb-1 sm:mb-2">{stat.value}</div>
                  <div className="text-xs sm:text-sm font-['Almarai'] opacity-90">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* courses */}
        {courses.length === 0 ? (
          <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-3xl shadow-2xl">
            <BookOpen className="w-20 h-20 text-gray-400 mx-auto mb-6 animate-bounce" />
            <p className="text-[#665446] text-2xl sm:text-3xl font-['Almarai'] font-bold mb-4">لا توجد دورات متاحة حالياً</p>
            <p className="text-[#8B7355] font-['Almarai'] text-base sm:text-lg">ترقب إضافة دورات جديدة قريباً</p>
          </div>
        ) : courses.length <= 3 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                totalStudents={Math.floor((stats.totalStudents || 0) / courses.length)}
                totalLessons={course.lessons_count}
              />
            ))}
          </div>
        ) : (
          <div className="relative">
            <Slider ref={sliderRef} {...settings}>
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  totalStudents={Math.floor((stats.totalStudents || 0) / courses.length)}
                  totalLessons={course.lessons_count}
                />
              ))}
            </Slider>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-12 md:mt-20">
          <div className="bg-gradient-to-br from-white/90 via-white/80 to-amber-50/60 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-2xl max-w-4xl mx-auto border border-white/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-100/20 via-transparent to-orange-100/20" />
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Sparkles className="w-7 h-7 text-amber-500 animate-pulse" />
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#665446] font-['Almarai']">ابدأ رحلتك التعليمية اليوم</h3>
                <Sparkles className="w-7 h-7 text-amber-500 animate-pulse" />
              </div>
              <p className="text-[#8B7355] font-['Almarai'] text-base sm:text-lg md:text-xl mb-6 md:mb-8 leading-relaxed">
                انضم إلى آلاف الطلاب واكتسب المعرفة الشرعية على أيدي نخبة من المتخصصين في بيئة تفاعلية متطورة
              </p>
              <Link
                to="/courses"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-[#665446] via-[#8B7355] to-[#665446] hover:from-[#8B7355] hover:via-[#665446] hover:to-[#8B7355] text-white px-8 sm:px-10 py-3 sm:py-4 rounded-2xl font-bold font-['Almarai'] text-base sm:text-lg transition-all duration-500 transform hover:scale-105 shadow-2xl hover:shadow-3xl border border-white/20 backdrop-blur-sm"
              >
                <BookOpen className="w-5 h-5" />
                تصفح جميع الدورات
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutCourse;
