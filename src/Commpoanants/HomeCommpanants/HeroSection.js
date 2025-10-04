import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Users, Star, Sparkles, Play, ChevronDown } from 'lucide-react';
import { useNavigate } from "react-router-dom";
const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentWord, setCurrentWord] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const highlightWords = ['العلم', 'الإيمان', 'المعرفة', 'التعلم'];

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const wordTimer = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % highlightWords.length);
    }, 2000);
    return () => clearInterval(wordTimer);
  }, []);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const handleMouseMove = (e) => {
      // Only apply parallax effect on desktop
      if (!isMobile) {
        setMousePosition({
          x: (e.clientX / window.innerWidth) * 20,
          y: (e.clientY / window.innerHeight) * 20
        });
      }
    };
    
    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', checkMobile);
    };
  }, [isMobile]);

  const handleButtonClick = () => {
    console.log('Navigate to courses');
    // Add navigation logic here
  };

  const scrollToNext = () => {
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      
      {/* Enhanced Background with Conditional Parallax */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-[#665446] via-[#8B7355] to-[#665446] transition-transform duration-100 ${
          isMobile ? '' : 'transform'
        }`}
        style={{
                      transform: isMobile 
                        ? 'scale(1.05)' 
                        : `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px) scale(1.05)`
                   }}
      />
      
      {/* Animated Background Pattern - Reduced animation on mobile */}
      <div 
  className={`absolute inset-0 ${isMobile ? '' : 'animate-pulse'}`}
  style={{
    backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, transparent 50%),
                      radial-gradient(circle at 70% 60%, rgba(255,255,255,0.05) 0%, transparent 50%),
                      radial-gradient(circle at 40% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)`,
    animation: isMobile ? 'none' : 'float 20s ease-in-out infinite'
  }}
/>

      {/* Floating Elements - Reduced on mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
  {[...Array(isMobile ? 8 : 15)].map((_, i) => (
    <div
      key={i}
      className="absolute opacity-20"
      style={{
        left: `${(10 + (i * 6)) % 90}%`,
        top: `${(15 + (i * 8)) % 70}%`,
        animation: isMobile 
          ? `float ${12 + (i % 2) * 4}s ease-in-out infinite`
          : `float ${8 + (i % 4)}s ease-in-out infinite`,
        animationDelay: `${i * 0.5}s`
      }}
    >
      {i % 3 === 0 && <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-amber-300" />}
      {i % 3 === 1 && <Star className="w-4 h-4 md:w-6 md:h-6 text-yellow-300" />}
      {i % 3 === 2 && <Sparkles className="w-3 h-3 md:w-5 md:h-5 text-orange-300" />}
    </div>
  ))}
</div>


      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 via-transparent to-orange-900/20"></div>

      {/* Main Content */}
      <div className={`relative z-10 max-w-7xl mx-auto px-6 text-white font-['Almarai'] transition-all duration-1500 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        
        {/* Hero Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <div className="text-center lg:text-right space-y-8">
            
            {/* Main Title with Animation */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className={`block text-transparent bg-clip-text bg-gradient-to-l from-amber-200 via-yellow-300 to-amber-200 ${
                  isMobile ? 'animate-pulse' : 'animate-gradient'
                }`}>
                  واحة العلم
                </span>
                <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl mt-2 text-amber-100">
                  منصة تعليمية شرعية
                </span>
              </h1>
              
              {/* Animated Highlight Word */}
              <div className="text-xl sm:text-2xl md:text-3xl font-bold">
                <span className="text-white">نحو </span>
                <span className="relative">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-300 animate-pulse">
                    {highlightWords[currentWord]}
                  </span>
                  <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-amber-400 transform origin-right animate-pulse"></span>
                </span>
                <span className="text-white"> بإذن الله</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-6">
              <p className="text-lg sm:text-xl md:text-2xl font-medium leading-relaxed text-amber-50 max-w-3xl">
                منصة تعليمية تهدف إلى تبسيط العلوم الشرعية ونقلها بأسلوب عصري واضح، 
                يجمع بين أصالة المعرفة وروح الإيمان.
              </p>
              
              <p className="text-base sm:text-lg md:text-xl leading-relaxed text-amber-100/90 max-w-3xl">
                نقدّم دروسًا ومحاضرات تجمع بين الدقة العلمية والروح الإيمانية، 
                لتصل إلى كل طالب علم، مهما كان مستواه أو خلفيته.
              </p>
            </div>

            {/* Hadith Quote with Enhanced Styling */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-white/20 shadow-2xl">
              <p className="italic text-base sm:text-lg md:text-xl text-amber-100 leading-relaxed">
                <span className="text-2xl md:text-3xl text-yellow-300">❝</span>
                <br />
                <span className="font-semibold">من سلك طريقًا يلتمس فيه علمًا، سهّل الله له به طريقًا إلى الجنة</span>
                <br />
                <span className="text-2xl md:text-3xl text-yellow-300 float-right">❞</span>
              </p>
              <p className="text-amber-200 text-sm md:text-base mt-4 text-right">
                – رواه مسلم
              </p>
            </div>

            {/* Fixed Stats Row - Center on mobile, start from right on desktop */}
            <div className="flex w-full justify-center lg:justify-start gap-4 md:gap-8 flex-wrap">
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/20 min-w-[100px]">
                <div className="text-2xl md:text-3xl font-bold text-yellow-300">24/7</div>
                <div className="text-xs md:text-sm text-amber-100">متاح دائماً</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/20 min-w-[100px]">
                <div className="text-2xl md:text-3xl font-bold text-yellow-300">100%</div>
                <div className="text-xs md:text-sm text-amber-100">محتوى موثوق</div>
              </div>
            </div>

          </div>

          {/* CTA Section */}
          <div className="flex flex-col items-center lg:items-start space-y-8">
            
            {/* Enhanced Button */}
            <div className="relative group">
              <button
                onClick={handleButtonClick}
                className={`relative overflow-hidden bg-gradient-to-r from-amber-400 to-orange-500 hover:from-orange-500 hover:to-amber-400 text-[#665446] text-xl md:text-2xl font-bold py-4 md:py-5 px-8 md:px-12 rounded-2xl shadow-2xl transform transition-all duration-500 ${
                  isMobile ? 'hover:scale-105' : 'hover:scale-110 hover:rotate-1'
                } group`}
              >
                {/* Button Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/50 to-orange-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Button Content */}
                                          <div
                                onClick={() => navigate("/courses")}
                                className="relative flex items-center gap-3 cursor-pointer"
                              >
                                <Play className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-125 transition-transform duration-300" />
                                <span>جاهز للتعلم ؟</span>
                                <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 transform group-hover:translate-x-2 transition-transform duration-300" />
                              </div>
                                          
                {/* Shine Effect - Disabled on mobile to prevent shake */}
                {!isMobile && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                )}
              </button>
              
              {/* Button Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 md:px-4 py-2 border border-white/20">
                <BookOpen className="w-3 h-3 md:w-4 md:h-4 text-amber-300" />
                <span className="text-xs md:text-sm font-medium">دروس تفاعلية</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 md:px-4 py-2 border border-white/20">
                <Users className="w-3 h-3 md:w-4 md:h-4 text-amber-300" />
                <span className="text-xs md:text-sm font-medium">مجتمع علمي</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 md:px-4 py-2 border border-white/20">
                <Star className="w-3 h-3 md:w-4 md:h-4 text-amber-300" />
                <span className="text-xs md:text-sm font-medium">محتوى معتمد</span>
              </div>
            </div>

            {/* Visual Element - Reduced animation on mobile */}
            <div className="relative">
              <div className={`w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-xl ${
                isMobile ? 'animate-pulse' : 'animate-pulse'
              }`}></div>
              <div className={`absolute inset-0 w-24 h-24 md:w-32 md:h-32 border-2 border-amber-300/30 rounded-full ${
                isMobile ? 'animate-pulse' : 'animate-ping'
              }`}></div>
              <BookOpen className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 text-amber-300" />
            </div>
          </div>
        </div>
      </div>
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer" onClick={scrollToNext}>
        <div className="flex flex-col items-center gap-2 text-amber-200 hover:text-amber-100 transition-colors">
          <span className="text-sm font-['Almarai']">تابع القراءة</span>
          <ChevronDown className="w-6 h-6" />
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(60deg); }
          66% { transform: translateY(5px) rotate(120deg); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        @media (max-width: 768px) {
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
          }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;