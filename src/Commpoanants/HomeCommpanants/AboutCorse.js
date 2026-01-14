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
  Clock,
  Star,
} from 'lucide-react';
import { supabase } from '../../Utilities/supabaseClient';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// === Custom Arrows ===
const CustomPrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute left-2 sm:left-4 top-1/2 z-20 -translate-y-1/2 bg-white hover:bg-gray-50 shadow-xl rounded-full p-2 sm:p-3 transition-all duration-300 hover:scale-110 group border border-gray-200"
    aria-label="السابق"
  >
    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#665446] group-hover:text-[#8B7355]" />
  </button>
);

const CustomNextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute right-2 sm:right-4 top-1/2 z-20 -translate-y-1/2 bg-white hover:bg-gray-50 shadow-xl rounded-full p-2 sm:p-3 transition-all duration-300 hover:scale-110 group border border-gray-200"
    aria-label="التالي"
  >
    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#665446] group-hover:text-[#8B7355]" />
  </button>
);

// === Course Card ===
const CourseCard = ({ course, totalStudents, totalLessons }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const getCourseIcon = (courseName) => {
    const name = (courseName || '').toLowerCase();
    if (name.includes('حديث') || name.includes('مصطلح'))
      return { icon: <Book className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600" />, bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' };
    if (name.includes('فقه') || name.includes('فقة'))
      return { icon: <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />, bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
    if (name.includes('سيرة'))
      return { icon: <User className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />, bgColor: 'bg-purple-50', borderColor: 'border-purple-200' };
    if (name.includes('عقيدة'))
      return { icon: <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-rose-600" />, bgColor: 'bg-rose-50', borderColor: 'border-rose-200' };
    if (name.includes('نحو') || name.includes('عرب'))
      return { icon: <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600" />, bgColor: 'bg-amber-50', borderColor: 'border-amber-200' };
    if (name.includes('أصول'))
      return { icon: <Target className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600" />, bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' };
    if (name.includes('تفسير'))
      return { icon: <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />, bgColor: 'bg-green-50', borderColor: 'border-green-200' };
    if (name.includes('قرآن'))
      return { icon: <Scroll className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-600" />, bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' };
    return { icon: <Award className="w-7 h-7 sm:w-8 sm:h-8 text-gray-600" />, bgColor: 'bg-gray-50', borderColor: 'border-gray-200' };
  };

  const getLevelColor = (levelName) => {
    if (levelName?.includes('تمهيدي'))
      return 'bg-green-100 text-green-700 border-green-300';
    if (levelName?.includes('الأول'))
      return 'bg-blue-100 text-blue-700 border-blue-300';
    if (levelName?.includes('الثاني'))
      return 'bg-purple-100 text-purple-700 border-purple-300';
    if (levelName?.includes('الثالث'))
      return 'bg-orange-100 text-orange-700 border-orange-300';
    return 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const handleCourseClick = () => {
    navigate(`/course/${course.id}`);
  };

  const courseIconData = getCourseIcon(course.name);

  return (
    <div className="px-3 sm:px-4">
      <div
        className={`bg-gradient-to-br from-white via-amber-50/30 to-orange-50/20 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 h-[400px] sm:h-[420px] cursor-pointer border border-amber-100 overflow-hidden ${
          isHovered ? 'scale-[1.02] -translate-y-1 shadow-amber-500/20' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCourseClick}
      >
        {/* Header with icon */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-white border-b border-amber-100">
          <div className="flex items-start justify-between">
            <div className={`${courseIconData.bgColor} ${courseIconData.borderColor} border-2 rounded-xl p-3 sm:p-4 shadow-sm transition-transform duration-300 ${isHovered ? 'scale-110 shadow-md' : ''}`}>
              {courseIconData.icon}
            </div>
            <span className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold font-['Almarai'] border-2 ${getLevelColor(course.level_name)} shadow-sm`}>
              {course.level_name}
            </span>
          </div>
          
          {/* Play button overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br from-[#665446]/60 via-[#8B7355]/50 to-transparent flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-white rounded-full p-3 sm:p-4 shadow-2xl">
              <Play className="w-6 h-6 sm:w-7 sm:h-7 text-[#665446]" fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-3 sm:space-y-4">
          <div>
            <h3 className="text-[#665446] text-base sm:text-lg font-bold font-['Almarai'] line-clamp-2 leading-relaxed mb-2 min-h-[48px] sm:min-h-[56px]">
              {course.name}
            </h3>
            {course.description && (
              <p className="text-[#8B7355] text-xs sm:text-sm font-['Almarai'] line-clamp-2 leading-relaxed">
                {course.description}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-amber-100" />

          {/* Stats */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 sm:gap-2 text-[#665446]">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
                <span className="font-['Almarai'] font-semibold">{totalStudents || 0} طالب</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[#665446]">
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600" />
                <span className="font-['Almarai'] font-semibold">{totalLessons || 0} درس</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 sm:gap-2 text-[#665446]">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-600" />
                <span className="font-['Almarai'] font-semibold">متاح الآن</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" fill="currentColor" />
                <span className="font-['Almarai'] text-[#665446] font-semibold">4.8</span>
              </div>
            </div>
          </div>

          {/* Button */}
          <button className={`w-full bg-gradient-to-r from-[#665446] to-[#8B7355] hover:from-[#8B7355] hover:to-[#665446] text-white py-2.5 sm:py-3 rounded-xl font-['Almarai'] font-bold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 shadow-md ${isHovered ? 'shadow-lg shadow-amber-500/30' : ''}`}>
            <span>ابدأ التعلم</span>
            <ArrowRight className="w-4 h-4" />
          </button>
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
    dots: true,
    infinite: courses.length > 1,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: courses.length > 1,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    rtl: true,
    arrows: true,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    centerMode: false,
    variableWidth: false,
    adaptiveHeight: false,
    beforeChange: (current, next) => setCurrentSlide(next),
    dotsClass: "slick-dots !bottom-[-40px]",
    customPaging: (i) => (
      <button
        className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
          i === currentSlide
            ? 'bg-[#665446] scale-125'
            : 'bg-gray-300 hover:bg-gray-400'
        }`}
        aria-label={`الذهاب للشريحة ${i + 1}`}
      />
    ),
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          arrows: true,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          arrows: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: true,
          centerMode: false,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: true,
          centerMode: false,
          dots: true,
        },
      },
    ],
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-[#F5F1ED] via-[#FAF8F6] to-[#F5F1ED] py-12 px-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader className="w-12 h-12 sm:w-16 sm:h-16 text-[#665446] animate-spin mx-auto" />
          <p className="text-[#665446] text-lg sm:text-xl font-['Almarai'] font-bold">جاري تحميل الدورات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-[#F5F1ED] via-[#FAF8F6] to-[#F5F1ED] py-12 px-4 flex items-center justify-center">
        <div className="text-center space-y-4 sm:space-y-6 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl max-w-md mx-auto border border-amber-200">
          <div className="text-red-500 text-5xl sm:text-6xl">⚠</div>
          <p className="text-red-600 text-lg sm:text-xl font-['Almarai'] font-bold">{error}</p>
          <button
            onClick={fetchCoursesData}
            className="bg-gradient-to-r from-[#665446] to-[#8B7355] hover:from-[#8B7355] hover:to-[#665446] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl transition-all duration-300 font-['Almarai'] font-bold shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#F5F1ED] via-[#FAF8F6] to-[#F5F1ED] py-8 sm:py-12 md:py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16 space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full shadow-sm">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
            <span className="text-[#665446] font-['Almarai'] font-bold text-xs sm:text-sm">دورات مختارة بعناية</span>
          </div>
          
          <h2 className="text-[#665446] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-['Almarai'] px-4">
            ابدأ رحلتك التعليمية
          </h2>
          
          <p className="text-[#8B7355] text-sm sm:text-base md:text-lg lg:text-xl font-['Almarai'] max-w-2xl mx-auto leading-relaxed px-4">
            استكشف مجموعة متنوعة من الدورات الشرعية المصممة خصيصاً للمبتدئين والمتقدمين
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-6 sm:mt-8 max-w-4xl mx-auto px-4">
            {[
              { value: stats.totalCourses, label: 'دورة', icon: <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />, gradient: 'from-amber-500 to-orange-500', bgGradient: 'from-amber-50 to-orange-50', borderColor: 'border-amber-200' },
              { value: stats.totalStudents, label: 'طالب', icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" />, gradient: 'from-[#665446] to-[#8B7355]', bgGradient: 'from-amber-50/50 to-orange-50/50', borderColor: 'border-[#665446]/20' },
              { value: stats.totalLessons, label: 'درس', icon: <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />, gradient: 'from-yellow-600 to-amber-600', bgGradient: 'from-yellow-50 to-amber-50', borderColor: 'border-yellow-200' },
              { value: stats.totalLevels, label: 'مستوى', icon: <Target className="w-4 h-4 sm:w-5 sm:h-5" />, gradient: 'from-orange-600 to-red-500', bgGradient: 'from-orange-50 to-red-50', borderColor: 'border-orange-200' },
            ].map((stat, index) => (
              <div key={index} className={`bg-gradient-to-br ${stat.bgGradient} rounded-xl p-3 sm:p-4 md:p-6 shadow-md border ${stat.borderColor} hover:shadow-xl transition-all duration-300 hover:scale-105`}>
                <div className={`bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-1 sm:mb-2`}>{stat.icon}</div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#665446] font-['Almarai']">{stat.value}</div>
                <div className="text-xs sm:text-sm text-[#8B7355] font-['Almarai']">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Courses Slider */}
        {courses.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-gradient-to-br from-white via-amber-50/20 to-orange-50/20 rounded-2xl sm:rounded-3xl shadow-lg mx-4 border border-amber-100">
            <BookOpen className="w-16 h-16 sm:w-20 sm:h-20 text-amber-500 mx-auto mb-4 sm:mb-6" />
            <p className="text-[#665446] text-xl sm:text-2xl font-['Almarai'] font-bold mb-2">لا توجد دورات متاحة حالياً</p>
            <p className="text-[#8B7355] font-['Almarai'] text-sm sm:text-base">ترقب إضافة دورات جديدة قريباً</p>
          </div>
        ) : (
          <div className="relative pb-12 sm:pb-16">
            <div className="courses-slider-container">
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
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-8 sm:mt-12 md:mt-16 px-4">
          <div className="bg-gradient-to-br from-[#665446] to-[#8B7355] rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />
            
            <div className="relative z-10 space-y-4 sm:space-y-6">
              <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12 text-white mx-auto" />
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white font-['Almarai']">
                مستعد للبدء؟
              </h3>
              <p className="text-white/90 font-['Almarai'] text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
                انضم إلى مجتمعنا التعليمي واستفد من محتوى تعليمي عالي الجودة مع دعم مستمر من المختصين
              </p>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 sm:gap-3 bg-white text-[#665446] hover:bg-gray-50 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold font-['Almarai'] text-sm sm:text-base md:text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
              >
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>استكشف جميع الدورات</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .courses-slider-container .slick-slide > div {
          display: flex;
          justify-content: center;
        }
        
        .courses-slider-container .slick-track {
          display: flex;
          align-items: stretch;
        }
        
        @media (max-width: 640px) {
          .courses-slider-container .slick-slide {
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AboutCourse;