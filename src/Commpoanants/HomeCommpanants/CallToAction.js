import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import img1 from '../../assets/Pic/Book.png';

const CallToAction = () => {
  const navigate = useNavigate(); // Initialize the navigate function

  const handleButtonClick = () => {
    navigate('/courses');  // Navigate to the /courses route on button click
  };

  return (
    <div className="bg-[#CDC0B6] text-[#665446] py-16 text-center">
      <div className="max-w-screen-xl mx-auto px-4">
        {/* الفكتور (صورة أو أيقونة) */}
        <div className="mb-6">
          <img
            src={img1} // استبدل الرابط بصورة الفكتور أو الأيقونة الخاصة بك
            alt="Call to Action"
            className="mx-auto w-32 h-32" // تم تكبير حجم الصورة هنا
          />
        </div>
        
        {/* العنوان والنص */}
        <h2 className="text-4xl font-bold mb-4">هل أنت مستعد للانطلاق في مسيرتك التعليمية الشرعية؟</h2>
        <p className="text-xl mb-6">انضم الآن إلى منصتنا التعليمية وابدأ رحلتك في تعلم العلوم الشرعية ورفع معرفتك بالدين الحنيف، لتكون عونًا لنفسك ولأمتك.</p>
        
        {/* زر دعوة للعمل */}
        <button
          onClick={handleButtonClick}  // Trigger navigation on button click
          className="bg-[#665446] text-white text-lg font-semibold px-8 py-4 rounded-md transition-all hover:bg-[#8C6D51] focus:outline-none"
        >
          ابدأ الآن في تعلم العلم الشرعي
        </button>
      </div>
    </div>
  );
};

export default CallToAction;
