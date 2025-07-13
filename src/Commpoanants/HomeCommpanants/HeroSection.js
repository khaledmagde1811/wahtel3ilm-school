import React from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate hook
import Book from '../../assets/Pic/Book.png';

const HeroSection = () => {
  const navigate = useNavigate();  // Initialize the navigate function

  const handleButtonClick = () => {
    navigate('/courses');  // Navigate to /courses route when the button is clicked
  };

  return (
    <div className="bg-[#] min-h-screen grid place-items-center">
      <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 max-w-7xl px-4">
        {/* الكتاب */}
        <div className="flex justify-center">
          <img 
            className="w-[80%] max-w-[500px] rotate-[5deg]" 
            src={Book}
            alt="Hero Image"
          />
        </div>
        
        {/* النص */}
        <div className="text-center lg:text-right text-stone-600 font-bold font-['Almarai']">
          <p className="text-3xl sm:text-4xl mb-6">
            واحة العلم منصة تعليمية تهدف إلى تبسيط العلوم الشرعية ونقلها بأسلوب عصري واضح، يجمع بين أصالة المعرفة وروح الإيمان.
          </p>
          <p className="text-xl sm:text-2xl mb-6">
            نقدّم دروسًا ومحاضرات تجمع بين الدقة العلمية والروح الإيمانية، لتصل إلى كل طالب علم، مهما كان مستواه أو خلفيته، في بيئة هادئة تليق بقدسية هذا العلم.
          </p>
          <br />
          <p className="italic text-lg sm:text-xl">
            ❝ من سلك طريقًا يلتمس فيه علمًا، سهّل الله له به طريقًا إلى الجنة ❞ - رواه مسلم
          </p>
        </div>

        {/* الزر */}
        <div className="col-span-2 text-center">
          <button 
            onClick={handleButtonClick}  // Trigger navigation on button click
            className="text-stone-600 text-xl font-normal font-['Roboto'] leading-7 cursor-pointer bg-[#FFF9EF] hover:bg-stone-300 transition-all duration-300 py-3 px-6 rounded-xl outline-none shadow-lg"
          >
            جاهز للتعلم ؟
          </button>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
