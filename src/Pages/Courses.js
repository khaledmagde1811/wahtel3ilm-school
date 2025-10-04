import React, { useState, useEffect } from 'react';
import { supabase } from '../Utilities/supabaseClient';  // تأكد من المسار الصحيح لـ supabaseClient
import { useNavigate } from 'react-router-dom';

const Courses = () => {
  const [levels, setLevels] = useState([]);  // لحفظ المستويات
  const [loading, setLoading] = useState(true);  // حالة التحميل
  const navigate = useNavigate();  // التوجيه إلى صفحة جديدة

  // جلب المستويات من قاعدة البيانات
  const fetchLevels = async () => {
    const { data, error } = await supabase.from('levels').select('*');
    if (error) {
      console.error('Error fetching levels:', error);
    } else {
      setLevels(data);  // تخزين المستويات في الحالة
    }
    setLoading(false);  // إنهاء حالة التحميل
  };

  useEffect(() => {
    fetchLevels();  // جلب المستويات عند تحميل الصفحة
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated Background for Loading */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#CDC0B6] via-[#B8A99C] to-[#A69589]">
          <div className="absolute inset-0">
            {/* Loading animation circles */}
            <div className="absolute w-32 h-32 bg-gradient-to-r from-[#FFF9EF]/30 to-[#E8D5C4]/30 rounded-full blur-xl animate-pulse" style={{top: '20%', left: '20%', animationDuration: '2s'}}></div>
            <div className="absolute w-24 h-24 bg-gradient-to-l from-[#665446]/20 to-[#5A4633]/20 rounded-full blur-lg animate-pulse" style={{bottom: '30%', right: '25%', animationDuration: '2.5s'}}></div>
            <div className="absolute w-16 h-16 bg-gradient-to-t from-[#FFF9EF]/25 to-[#CDC0B6]/25 rounded-full blur-md animate-pulse" style={{top: '60%', right: '15%', animationDuration: '1.8s'}}></div>
          </div>
        </div>
        <div className="text-center text-[#665446] text-xl font-semibold bg-[#FFF9EF]/90 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg relative z-10">
          جاري تحميل المستويات...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#CDC0B6] via-[#B8A99C] to-[#A69589]">
        {/* Animated geometric shapes */}
        <div className="absolute inset-0">
          {/* Large floating circles */}
          <div className="absolute w-96 h-96 bg-gradient-to-r from-[#FFF9EF]/20 to-[#E8D5C4]/20 rounded-full blur-3xl animate-pulse" style={{top: '-20%', left: '-20%', animationDuration: '8s'}}></div>
          <div className="absolute w-80 h-80 bg-gradient-to-l from-[#665446]/15 to-[#5A4633]/15 rounded-full blur-3xl animate-pulse" style={{bottom: '-15%', right: '-15%', animationDuration: '10s'}}></div>
          <div className="absolute w-64 h-64 bg-gradient-to-t from-[#FFF9EF]/25 to-[#CDC0B6]/25 rounded-full blur-2xl animate-pulse" style={{top: '20%', right: '10%', animationDuration: '7s'}}></div>
          <div className="absolute w-72 h-72 bg-gradient-to-b from-[#E8D5C4]/18 to-[#CDC0B6]/18 rounded-full blur-3xl animate-pulse" style={{bottom: '25%', left: '15%', animationDuration: '9s'}}></div>
          
          {/* Medium floating elements */}
          <div className="absolute w-48 h-48 bg-gradient-to-tr from-[#FFF9EF]/30 to-[#665446]/10 rounded-full blur-xl animate-pulse" style={{top: '40%', left: '25%', animationDuration: '6s'}}></div>
          <div className="absolute w-56 h-56 bg-gradient-to-bl from-[#CDC0B6]/25 to-[#5A4633]/15 rounded-full blur-xl animate-pulse" style={{top: '60%', right: '30%', animationDuration: '7.5s'}}></div>
          
          {/* Floating particles */}
          <div className="absolute w-6 h-6 bg-[#FFF9EF] rounded-full opacity-60 animate-bounce" style={{top: '15%', left: '10%', animationDelay: '0s', animationDuration: '4s'}}></div>
          <div className="absolute w-4 h-4 bg-[#665446] rounded-full opacity-50 animate-bounce" style={{top: '25%', right: '12%', animationDelay: '1s', animationDuration: '5s'}}></div>
          <div className="absolute w-8 h-8 bg-[#FFF9EF] rounded-full opacity-40 animate-bounce" style={{bottom: '40%', left: '18%', animationDelay: '2s', animationDuration: '4.5s'}}></div>
          <div className="absolute w-3 h-3 bg-[#5A4633] rounded-full opacity-70 animate-bounce" style={{top: '70%', left: '35%', animationDelay: '0.5s', animationDuration: '3.5s'}}></div>
          <div className="absolute w-5 h-5 bg-[#FFF9EF] rounded-full opacity-55 animate-bounce" style={{bottom: '30%', right: '40%', animationDelay: '1.8s', animationDuration: '5.2s'}}></div>
          <div className="absolute w-7 h-7 bg-[#665446] rounded-full opacity-45 animate-bounce" style={{top: '55%', right: '5%', animationDelay: '2.5s', animationDuration: '4.8s'}}></div>
          <div className="absolute w-4 h-4 bg-[#E8D5C4] rounded-full opacity-65 animate-bounce" style={{top: '80%', left: '50%', animationDelay: '1.2s', animationDuration: '4.2s'}}></div>
          <div className="absolute w-6 h-6 bg-[#FFF9EF] rounded-full opacity-50 animate-bounce" style={{bottom: '50%', right: '20%', animationDelay: '0.8s', animationDuration: '5.5s'}}></div>
          
          {/* Animated waves */}
          <div className="absolute bottom-0 left-0 w-full h-52 opacity-25">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z" fill="#FFF9EF">
                <animate attributeName="d" dur="12s" repeatCount="indefinite"
                  values="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z;
                          M0,80 C300,0 900,120 1200,80 L1200,120 L0,120 Z;
                          M0,40 C300,100 900,20 1200,40 L1200,120 L0,120 Z;
                          M0,70 C300,140 900,-20 1200,70 L1200,120 L0,120 Z;
                          M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z"/>
              </path>
            </svg>
          </div>
          
          {/* Top wave */}
          <div className="absolute top-0 left-0 w-full h-44 opacity-20 transform rotate-180">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0,60 C300,120 900,0 1200,60 L1200,0 L0,0 Z" fill="#665446">
                <animate attributeName="d" dur="15s" repeatCount="indefinite"
                  values="M0,60 C300,120 900,0 1200,60 L1200,0 L0,0 Z;
                          M0,40 C300,0 900,80 1200,40 L1200,0 L0,0 Z;
                          M0,80 C300,160 900,-40 1200,80 L1200,0 L0,0 Z;
                          M0,50 C300,100 900,10 1200,50 L1200,0 L0,0 Z;
                          M0,60 C300,120 900,0 1200,60 L1200,0 L0,0 Z"/>
              </path>
            </svg>
          </div>

          {/* Side decorative elements */}
          <div className="absolute left-0 top-1/4 w-32 h-80 opacity-15 transform -translate-y-1/2">
            <svg viewBox="0 0 100 200" className="w-full h-full">
              <path d="M0,100 Q50,0 100,100 Q50,200 0,100 Z" fill="#FFF9EF">
                <animate attributeName="d" dur="8s" repeatCount="indefinite"
                  values="M0,100 Q50,0 100,100 Q50,200 0,100 Z;
                          M0,100 Q30,50 100,100 Q70,150 0,100 Z;
                          M0,100 Q70,30 100,100 Q30,170 0,100 Z;
                          M0,100 Q50,0 100,100 Q50,200 0,100 Z"/>
              </path>
            </svg>
          </div>

          <div className="absolute right-0 top-1/3 w-28 h-64 opacity-12 transform">
            <svg viewBox="0 0 100 200" className="w-full h-full">
              <path d="M100,100 Q50,0 0,100 Q50,200 100,100 Z" fill="#665446">
                <animate attributeName="d" dur="10s" repeatCount="indefinite"
                  values="M100,100 Q50,0 0,100 Q50,200 100,100 Z;
                          M100,100 Q70,50 0,100 Q30,150 100,100 Z;
                          M100,100 Q30,30 0,100 Q70,170 100,100 Z;
                          M100,100 Q50,0 0,100 Q50,200 100,100 Z"/>
              </path>
            </svg>
          </div>

          {/* Floating academic icons represented as geometric shapes */}
          <div className="absolute w-12 h-12 opacity-20 animate-spin" style={{top: '30%', left: '15%', animationDuration: '20s'}}>
            <div className="w-full h-full bg-[#FFF9EF] transform rotate-45"></div>
          </div>
          <div className="absolute w-10 h-10 opacity-15 animate-spin" style={{bottom: '35%', right: '18%', animationDuration: '25s'}}>
            <div className="w-full h-full bg-[#665446] rounded-full"></div>
          </div>
          <div className="absolute w-8 h-8 opacity-25 animate-spin" style={{top: '65%', right: '12%', animationDuration: '18s'}}>
            <div className="w-full h-full bg-[#E8D5C4]" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}}></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h1 className="text-center text-[#665446] text-4xl font-bold mb-10 drop-shadow-sm">المستويات الدراسية</h1>

        <div className="flex flex-col gap-6 max-w-3xl mx-auto">
          {levels.map((level, index) => (
            <div
              key={level.id}
              onClick={() => navigate(`/contentLevel/${level.id}`)}  // تصحيح المسار ليتوافق مع الراوت في App.js
              className="cursor-pointer bg-[#FFF9EF]/95 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-white/30 group"
              style={{
                animationDelay: `${index * 0.1}s`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              <h2 className="text-[#665446] text-2xl font-bold mb-2 group-hover:text-[#5A4633] transition-colors duration-300">
                {level.name}
              </h2>
              <p className="text-[#665446] text-base group-hover:text-[#5A4633] transition-colors duration-300">
                {level.description}
              </p>
              
              {/* Hover effect indicator */}
              <div className="mt-4 flex items-center text-[#665446] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-sm">انقر للدخول</span>
                <svg className="w-4 h-4 mr-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Courses;