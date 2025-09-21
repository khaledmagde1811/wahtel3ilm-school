import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import { ChevronLeft, ChevronRight, Play, BookOpen, Users, Clock, Star, ArrowRight, Loader, GraduationCap, Calendar } from 'lucide-react';
import { supabase } from '../../Utilities/supabaseClient';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Custom Arrow Components
const CustomPrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute right-6 top-1/2 z-10 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-110 hover:shadow-xl group"
  >
    <ChevronRight className="w-6 h-6 text-[#665446] group-hover:text-[#8B7355] transition-colors" />
  </button>
);

const CustomNextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute left-6 top-1/2 z-10 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-110 hover:shadow-xl group"
  >
    <ChevronLeft className="w-6 h-6 text-[#665446] group-hover:text-[#8B7355] transition-colors" />
  </button>
);

// Course Card Component
const CourseCard = ({ course, totalStudents, totalLessons }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(true);
  const navigate = useNavigate();

  // Default images for different course types
  const getCourseImage = (courseName) => {
    const name = courseName.toLowerCase();
    if (name.includes('حديث') || name.includes('مصطلح')) return '/api/placeholder/120/120';
    if (name.includes('فقه') || name.includes('فقة')) return '/api/placeholder/120/120';
    if (name.includes('سيرة')) return '/api/placeholder/120/120';
    if (name.includes('عقيدة')) return '/api/placeholder/120/120';
    if (name.includes('نحو') || name.includes('عرب')) return '/api/placeholder/120/120';
    if (name.includes('أصول')) return '/api/placeholder/120/120';
    return '/api/placeholder/120/120';
  };

  const getLevelColor = (levelName) => {
    if (levelName?.includes('تمهيدي')) return 'bg-green-100 text-green-800';
    if (levelName?.includes('الأول')) return 'bg-blue-100 text-blue-800';
    if (levelName?.includes('الثاني')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Handle navigation to course lessons page
  const handleCourseClick = () => {
    navigate(`/course/${course.id}`);
  };

  return (
    <div className="px-4">
      <div
        className={`relative bg-gradient-to-br from-white to-amber-50/50 rounded-2xl shadow-lg overflow-hidden transition-all duration-500 h-96 group cursor-pointer ${
          isHovered ? 'shadow-2xl scale-[1.02] -translate-y-2' : 'hover:shadow-xl'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCourseClick}
      >
        {/* Background Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Floating Particles Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-amber-300/30 rounded-full animate-bounce opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>

        {/* Level Badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className={`px-3 py-1 rounded-full text-xs font-bold font-['Almarai'] ${getLevelColor(course.level_name)}`}>
            {course.level_name}
          </span>
        </div>

        {/* Image Container */}
        <div className="relative h-48 flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 overflow-hidden">
          <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-[#665446] to-[#8B7355] flex items-center justify-center text-white text-2xl font-bold font-['Almarai'] transition-all duration-700 ${
            isHovered ? 'scale-110 rotate-3' : ''
          }`}>
            {course.name.charAt(0)}
          </div>
          
          {/* Play Button Overlay */}
          <div className={`absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm transition-all duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="bg-white/90 rounded-full p-3 shadow-lg transform transition-transform duration-300 hover:scale-110">
              <Play className="w-6 h-6 text-[#665446] ml-1" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <h3 className={`text-[#665446] text-xl font-bold font-['Almarai'] transition-all duration-300 line-clamp-2 ${
            isHovered ? 'text-[#8B7355] transform translate-x-1' : ''
          }`}>
            {course.name}
          </h3>
          
          {course.description && (
            <p className={`text-gray-600 text-sm font-['Almarai'] line-clamp-2 transition-all duration-500 ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-2'
            }`}>
              {course.description}
            </p>
          )}
          
          {/* Stats Row */}
          <div className={`flex items-center justify-between text-xs text-gray-500 transition-all duration-500 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{totalStudents || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              <span>{totalLessons || 0} درس</span>
            </div>
            <div className="flex items-center gap-1">
              <GraduationCap className="w-3 h-3" />
              <span>متاح</span>
            </div>
          </div>
        </div>

        {/* Bottom Shine Effect */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 transition-all duration-500 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`} />

        {/* Click Indicator */}
        <div className={`absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg transition-all duration-300 ${
          isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        }`}>
          <ArrowRight className="w-4 h-4 text-[#665446] rotate-180" />
        </div>
      </div>
    </div>
  );
};

const AboutCourse = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalLessons: 0,
    totalLevels: 0
  });
  const sliderRef = useRef(null);

  useEffect(() => {
    fetchCoursesData();
  }, []);

  const fetchCoursesData = async () => {
    try {
      setLoading(true);

      // Fetch courses with levels
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          *,
          levels (
            name,
            description
          )
        `)
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;

      // Fetch lessons count for each course
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
            lessons_count: lessonsCount || 0
          };
        })
      );

      setCourses(coursesWithStats);

      // Fetch general stats
      const [
        { count: studentsCount },
        { count: lessonsCount },
        { count: levelsCount }
      ] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('lessons').select('*', { count: 'exact', head: true }),
        supabase.from('levels').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        totalStudents: studentsCount || 0,
        totalCourses: coursesWithStats.length,
        totalLessons: lessonsCount || 0,
        totalLevels: levelsCount || 0
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
    speed: 800,
    slidesToShow: Math.min(3, courses.length),
    slidesToScroll: 1,
    autoplay: courses.length > 3,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    dots: true,
    centerMode: courses.length > 3,
    centerPadding: '0px',
    prevArrow: courses.length > 3 ? <CustomPrevArrow /> : false,
    nextArrow: courses.length > 3 ? <CustomNextArrow /> : false,
    beforeChange: (current, next) => setCurrentSlide(next),
    customPaging: (i) => (
      <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
        i === currentSlide ? 'bg-[#665446] scale-125' : 'bg-gray-300 hover:bg-gray-400'
      }`} />
    ),
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(2, courses.length),
          centerMode: false,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          centerMode: false,
          arrows: false,
        },
      },
    ],
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-[#CDC0B6] via-[#D4C7BC] to-[#CDC0B6] py-20 px-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader className="w-12 h-12 text-[#665446] animate-spin mx-auto" />
          <p className="text-[#665446] text-xl font-['Almarai'] font-bold">جاري تحميل الدورات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-[#CDC0B6] via-[#D4C7BC] to-[#CDC0B6] py-20 px-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 text-xl font-['Almarai'] font-bold">{error}</p>
          <button 
            onClick={fetchCoursesData}
            className="bg-[#665446] text-white px-6 py-2 rounded-lg hover:bg-[#8B7355] transition-colors font-['Almarai']"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#CDC0B6] via-[#D4C7BC] to-[#CDC0B6] py-20 px-4 relative overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-amber-200/20 rounded-full blur-2xl" />
        <div className="absolute top-1/3 left-1/4 w-24 h-24 bg-orange-200/15 rounded-full blur-xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-block">
            <h2 className="text-[#665446] text-6xl md:text-7xl font-bold font-['Almarai'] relative">
              الدورات المتاحة
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transform origin-center animate-pulse" />
            </h2>
          </div>
          <p className="text-[#8B7355] text-xl font-['Almarai'] max-w-2xl mx-auto leading-relaxed">
            ادرس العلوم الشرعية مع نخبة من المتخصصين في بيئة تعليمية تفاعلية ومتطورة
          </p>
          
          {/* Stats Counter */}
          <div className="flex justify-center items-center gap-8 mt-8 flex-wrap">
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <div className="text-3xl font-bold text-[#665446] font-['Almarai']">{stats.totalCourses}</div>
              <div className="text-sm text-[#8B7355] font-['Almarai']">دورة متاحة</div>
            </div>
            <div className="w-px h-12 bg-[#8B7355]/30" />
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <div className="text-3xl font-bold text-[#665446] font-['Almarai']">{stats.totalStudents}</div>
              <div className="text-sm text-[#8B7355] font-['Almarai']">طالب مسجل</div>
            </div>
            <div className="w-px h-12 bg-[#8B7355]/30" />
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <div className="text-3xl font-bold text-[#665446] font-['Almarai']">{stats.totalLessons}</div>
              <div className="text-sm text-[#8B7355] font-['Almarai']">محاضرة</div>
            </div>
            <div className="w-px h-12 bg-[#8B7355]/30" />
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <div className="text-3xl font-bold text-[#665446] font-['Almarai']">{stats.totalLevels}</div>
              <div className="text-sm text-[#8B7355] font-['Almarai']">مستوى دراسي</div>
            </div>
          </div>
        </div>

        {/* Courses Display */}
        {courses.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-[#665446] text-2xl font-['Almarai'] font-bold">لا توجد دورات متاحة حالياً</p>
            <p className="text-[#8B7355] font-['Almarai'] mt-2">ترقب إضافة دورات جديدة قريباً</p>
          </div>
        ) : courses.length <= 3 ? (
          // Display in grid if 3 or fewer courses
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                totalStudents={Math.floor(stats.totalStudents / stats.totalCourses)}
                totalLessons={course.lessons_count}
              />
            ))}
          </div>
        ) : (
          // Use slider for more than 3 courses
          <div className="relative">
            <Slider ref={sliderRef} {...settings}>
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  totalStudents={Math.floor(stats.totalStudents / stats.totalCourses)}
                  totalLessons={course.lessons_count}
                />
              ))}
            </Slider>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-[#665446] font-['Almarai'] mb-4">
              ابدأ رحلتك التعليمية اليوم
            </h3>
            <p className="text-[#8B7355] font-['Almarai'] mb-6">
              انضم إلى {stats.totalStudents} طالب واكتسب المعرفة الشرعية الأصيلة
            </p>
            <Link 
              to="/courses"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#665446] to-[#8B7355] hover:from-[#8B7355] hover:to-[#665446] text-white px-8 py-3 rounded-xl font-bold font-['Almarai'] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              تصفح جميع الدورات
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutCourse;