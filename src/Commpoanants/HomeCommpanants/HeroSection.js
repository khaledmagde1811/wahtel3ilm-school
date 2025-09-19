import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate('/courses');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* خلفية الفيديو */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/sound/0_Dome_Architecture_3840x2160.mp4" type="video/mp4" />
      </video>

      {/* طبقة شفافة فوق الفيديو */}
      <div className="absolute inset-0 bg-black/75"></div>

      {/* المحتوى */}
      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 px-6 text-white font-['Almarai']">
        {/* النص */}
        <div className="text-center lg:text-right">
          <p className="text-3xl sm:text-4xl mb-6 font-bold leading-relaxed">
            واحة العلم منصة تعليمية تهدف إلى تبسيط العلوم الشرعية ونقلها بأسلوب عصري واضح، 
            يجمع بين أصالة المعرفة وروح الإيمان.
          </p>
          <p className="text-xl sm:text-2xl mb-6 font-medium leading-relaxed">
            نقدّم دروسًا ومحاضرات تجمع بين الدقة العلمية والروح الإيمانية، 
            لتصل إلى كل طالب علم، مهما كان مستواه أو خلفيته، في بيئة هادئة تليق بقدسية هذا العلم.
          </p>
          <p className="italic text-lg sm:text-xl mt-4">
            ❝ من سلك طريقًا يلتمس فيه علمًا، سهّل الله له به طريقًا إلى الجنة ❞ <br />– رواه مسلم
          </p>
        </div>

        {/* الزر */}
        <div className="flex items-center justify-center lg:justify-start">
          <button
            onClick={handleButtonClick}
            className="bg-[#FFF9EF] text-stone-700 text-xl font-semibold py-3 px-8 rounded-xl shadow-lg hover:bg-stone-300 transition-all duration-300"
          >
            جاهز للتعلم ؟
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
