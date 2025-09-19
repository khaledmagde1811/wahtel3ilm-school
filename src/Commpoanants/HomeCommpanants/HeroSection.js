import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeroImage from '../../assets/Pic/5093021.jpg'; // ضع مسار الصورة هنا

const HeroSection = () => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate('/courses');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* الخلفية */}
      <img
        src={HeroImage}
        alt="Hero Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* طبقة شفافة */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* المحتوى */}
      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 px-6 text-white font-['Almarai']">
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
