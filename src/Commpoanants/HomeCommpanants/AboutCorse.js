import React from 'react';
import Slider from 'react-slick';
import img1 from '../../assets/Pic/Mousic.png';
import img2 from '../../assets/Pic/maasge.png';
import img3 from '../../assets/Pic/Man.png';
import img4 from '../../assets/Pic/asoulfeqh.png';
import img5 from '../../assets/Pic/arapick.png';
// استيراد ملفات CSS الخاصة بـ slick
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const AboutCorse = () => {
  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 3, // عرض 3 كروت في شاشة الكمبيوتر
    slidesToScroll: 1,
    dots: true,
    arrows: true,
    centerMode: true, // لتوسيط الكروت في السلايدر
    responsive: [
      {
        breakpoint: 1024, // عندما تكون الشاشة بين 768px و 1024px (الأجهزة اللوحية)
        settings: {
          slidesToShow: 2, // عرض 2 كارت على الأجهزة اللوحية
        },
      },
      {
        breakpoint: 600, // عندما تكون الشاشة أصغر من 600px (الهواتف الذكية)
        settings: {
          slidesToShow: 1, // عرض كارت واحد فقط على الشاشات الصغيرة
        },
      },
    ],
  };

  return (
    <div className="w-full h-auto bg-[#CDC0B6] py-16 px-8">
      <div className="max-w-screen-xl mx-auto">
        {/* العنوان "الدورات" قبل السلايدر */}
        <div className="text-center mb-12">
          <h2 className="text-stone-600 text-5xl font-bold font-['Almarai']">الدورات</h2>
        </div>

        {/* السلايدر */}
        <Slider {...settings}>
          {/* القسم الأول */}
          <div className="relative bg-white p-6 flex flex-col items-center justify-between rounded-lg shadow-xl overflow-hidden transition-transform transform hover:scale-105 hover:shadow-2xl bg-amber-50 h-64">
            <div className="flex justify-center items-center h-2/3">
              <img className="object-contain" src={img1} alt="Image 1" />
            </div>
            <div className="text-stone-600 text-3xl font-bold font-['Almarai']">علوم الحديث</div>
          </div>

          {/* القسم الثاني */}
          <div className="relative bg-white p-6 flex flex-col items-center justify-between rounded-lg shadow-xl overflow-hidden transition-transform transform hover:scale-105 hover:shadow-2xl bg-amber-50 h-64">
            <div className="flex justify-center items-center h-2/3">
              <img className="object-contain" src={img2} alt="Image 2" />
            </div>
            <div className="text-stone-600 text-3xl font-bold font-['Almarai']">علوم فقة</div>
          </div>

          {/* القسم الثالث */}
          <div className="relative bg-white p-6 flex flex-col items-center justify-between rounded-lg shadow-xl overflow-hidden transition-transform transform hover:scale-105 hover:shadow-2xl bg-amber-50 h-64">
            <div className="flex justify-center items-center h-2/3">
              <img className="object-contain" src={img3} alt="Image 3" />
            </div>
            <div className="text-stone-600 text-3xl font-bold font-['Almarai']">سيرة</div>
          </div>

          {/* القسم الرابع */}
          <div className="relative bg-white p-6 flex flex-col items-center justify-between rounded-lg shadow-xl overflow-hidden transition-transform transform hover:scale-105 hover:shadow-2xl bg-amber-50 h-64">
            <div className="flex justify-center items-center h-2/3">
              <img className="object-contain" src={img4} alt="Image 4" />
            </div>
            <div className="text-stone-600 text-3xl font-bold font-['Almarai']">عقيدة</div>
          </div>

          {/* القسم الخامس */}
          <div className="relative bg-white p-6 flex flex-col items-center justify-between rounded-lg shadow-xl overflow-hidden transition-transform transform hover:scale-105 hover:shadow-2xl bg-amber-50 h-64">
            <div className="flex justify-center items-center h-2/3">
              <img className="object-contain" src={img5} alt="Image 5" />
            </div>
            <div className="text-stone-600 text-3xl font-bold font-['Almarai']">لغة عربية</div>
          </div>
        </Slider>
      </div>
    </div>
  );
};

export default AboutCorse;
