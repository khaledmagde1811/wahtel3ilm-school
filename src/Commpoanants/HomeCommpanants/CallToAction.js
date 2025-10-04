import React, { useState, useEffect } from "react";
import { BookOpen, ArrowRight, Sparkles, Users, Award, Clock } from "lucide-react";
import { Link } from "react-router-dom";
const CallToAction = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const handleButtonClick = () => {
    // Add your navigation logic here
    console.log('Navigate to courses');
    // navigate('/courses');
  };

  const features = [
    { icon: BookOpen, text: "محتوى شرعي موثوق", color: "text-amber-600" },
    { icon: Users, text: "مجتمع علمي متميز", color: "text-blue-600" },
    { icon: Clock, text: "تعلم في أي وقت", color: "text-green-600" }
  ];

  return (
    <div className="bg-gradient-to-br from-[#CDC0B6] via-[#D4C7BC] to-[#CDC0B6] text-[#665446] py-20 text-center relative overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-56 h-56 bg-amber-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-orange-200/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Floating Elements */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-amber-400/30 rounded-full animate-float"
            style={{
              left: `${10 + (i * 12) % 80}%`,
              top: `${20 + (i * 15) % 60}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${4 + (i % 2)}s`
            }}
          />
        ))}
      </div>

      <div className={`max-w-6xl mx-auto px-4 relative z-10 transition-all duration-1000 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        
        {/* Enhanced Icon/Image Container */}
        <div className="mb-12 relative">
          <div className="inline-block relative">
            {/* Main Icon Container */}
            <div className="w-40 h-40 mx-auto bg-gradient-to-br from-[#665446] to-[#8B7355] rounded-3xl flex items-center justify-center shadow-2xl transform transition-all duration-700 hover:scale-110 hover:rotate-3 relative overflow-hidden">
              <BookOpen className="w-20 h-20 text-white" />
              
              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] hover:translate-x-[200%] transition-transform duration-1000" />
            </div>
            
            {/* Floating Ring */}
            <div className="absolute inset-0 w-40 h-40 mx-auto rounded-3xl border-4 border-amber-400/30 animate-ping" />
            
            {/* Sparkles */}
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-amber-500 animate-bounce" />
            <Sparkles className="absolute -bottom-2 -left-2 w-6 h-6 text-orange-500 animate-bounce" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>

        {/* Enhanced Title */}
        <div className="mb-8">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 font-['Almarai'] leading-tight">
            <span className="bg-gradient-to-r from-[#665446] via-[#8B7355] to-[#665446] bg-clip-text text-transparent">
              هل أنت مستعد للانطلاق
            </span>
            <br />
            <span className="text-[#665446]">
              في مسيرتك التعليمية الشرعية؟
            </span>
          </h2>
        </div>

        {/* Features Pills */}
        <div className="flex justify-center items-center gap-4 mb-8 flex-wrap">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-white/50 transform transition-all duration-300 hover:scale-105"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <feature.icon className={`w-4 h-4 ${feature.color}`} />
              <span className="text-sm font-['Almarai'] font-medium text-[#665446]">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Enhanced Description */}
        <div className="mb-12 max-w-4xl mx-auto">
          <p className="text-xl sm:text-2xl mb-6 font-['Almarai'] leading-relaxed text-[#665446]/90">
            انضم الآن إلى منصتنا التعليمية وابدأ رحلتك في تعلم العلوم الشرعية
          </p>
          <p className="text-lg font-['Almarai'] text-[#8B7355]">
            ورفع معرفتك بالدين الحنيف، لتكون عونًا لنفسك ولأمتك
          </p>
        </div>

        {/* Enhanced Call-to-Action Button */}
        <div className="relative inline-block">
          <button
            onClick={handleButtonClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative group bg-gradient-to-r from-[#665446] to-[#8B7355] hover:from-[#8B7355] hover:to-[#665446] text-white text-xl font-bold px-12 py-5 rounded-2xl transition-all duration-500 transform hover:scale-105 shadow-2xl hover:shadow-3xl font-['Almarai'] overflow-hidden"
          >
            {/* Button Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Button Content */}
           

<Link 
  to="/courses" 
  className="relative flex items-center gap-3 cursor-pointer group"
>
  <span className="transition-all duration-300 group-hover:text-[#8B7355]">
    ابدأ الآن في تعلم العلم الشرعي
  </span>
  <ArrowRight 
    className={`w-6 h-6 transition-all duration-300 ${
      isHovered ? "translate-x-2 scale-110" : ""
    }`} 
  />
</Link>

            
            {/* Shine Effect on Hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700" />
          </button>

          {/* Button Glow Effect */}
          <div className={`absolute inset-0 bg-gradient-to-r from-[#665446] to-[#8B7355] rounded-2xl blur-lg opacity-0 transition-opacity duration-300 -z-10 ${
            isHovered ? 'opacity-30' : ''
          }`} />
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="text-3xl font-bold text-[#665446] font-['Almarai'] mb-2">24/7</div>
            <div className="text-sm text-[#8B7355] font-['Almarai']">تعلم متواصل</div>
          </div>
          <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="text-3xl font-bold text-[#665446] font-['Almarai'] mb-2">100%</div>
            <div className="text-sm text-[#8B7355] font-['Almarai']">محتوى مجاني</div>
          </div>
          <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="text-3xl font-bold text-[#665446] font-['Almarai'] mb-2">∞</div>
            <div className="text-sm text-[#8B7355] font-['Almarai']">فرص التعلم</div>
          </div>
        </div>

        {/* Additional Encouragement */}
        <div className="mt-12 bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl max-w-2xl mx-auto border border-white/50">
          <p className="text-lg font-['Almarai'] text-[#665446] mb-4">
            <span className="font-bold">﴿وَقُل رَّبِّ زِدْنِي عِلْمًا﴾</span>
          </p>
          <p className="text-sm font-['Almarai'] text-[#8B7355]">
            ابدأ رحلتك اليوم وكن جزءًا من مجتمع طلاب العلم
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-15px) rotate(120deg); }
          66% { transform: translateY(8px) rotate(240deg); }
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default CallToAction;