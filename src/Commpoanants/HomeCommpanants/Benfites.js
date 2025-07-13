import React from 'react';
import img from '../../assets/Pic/Oclock.png';
import img1 from '../../assets/Pic/Right.png';
import img2 from '../../assets/Pic/HandShak.png';
import img3 from '../../assets/Pic/Screenshot__320_-removebg-preview.png';

const Benfites = () => {
  return (
    <div className="bg-[#] min-h-screen py-8 mt-12">
      <div className="container mx-auto px-4">
        {/* العنوان الرئيسي */}
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#665446] font-['Almarai']">
            مميزات المنصة
          </h1>
        </div>

        {/* الصف الأول من الصور والنصوص */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
          <div className="text-center">
            <img className="w-full h-72 object-contain mb-4" src={img} alt="Benefit 1" />
            <p className="text-xl sm:text-2xl text-[#665446] font-bold">دروس متاحة 24 ساعة</p>
          </div>

          <div className="text-center">
            <img className="w-full h-72 object-contain mb-4" src={img1} alt="Benefit 2" />
            <p className="text-xl sm:text-2xl text-[#665446] font-bold">تحت اشراف افضل المعلمين</p>
          </div>

          <div className="text-center">
            <img className="w-full h-72 object-contain mb-4" src={img2} alt="Benefit 3" />
            <p className="text-xl sm:text-2xl text-[#665446] font-bold">محتوي موثوق</p>
          </div>

          <div className="text-center">
            <img className="w-full h-72 object-contain mb-4" src={img3} alt="Benefit 4" />
            <p className="text-xl sm:text-2xl text-[#665446] font-bold">شرح مبسط</p>
          </div>
        </div>

        {/* النص الإضافي */}
        <div className="text-center mt-12">
          <p className="text-lg sm:text-xl text-[#665446]">
            منصة تقدم لك مجموعة من المميزات التي تجعل من تعلمك تجربة مميزة وسهلة.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Benfites;
