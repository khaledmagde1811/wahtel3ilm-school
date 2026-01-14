import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Heart,
  Sparkles,
  Star,
  ChevronDown,
  Droplet
} from 'lucide-react';

const TazkiyahSection = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [currentWord, setCurrentWord] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const highlightWords = ['القلب', 'النفس', 'الروح', ];

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
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollToNext = () => {
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
  };

  const handleNavigate = () => {
    navigate('/contentLevel/15');
    window.scrollTo(0, 0);
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #7d6c57 0%, #6f5f4d 50%, #8a7962 100%)'
      }}
    >
 {/* Floating Icons */}
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
            {i % 3 === 0 && <Heart className="w-6 h-6 md:w-8 md:h-8 text-[#fde25d]" />}
            {i % 3 === 1 && <Star className="w-4 h-4 md:w-6 md:h-6 text-[#fde25d]" />}
            {i % 3 === 2 && <Sparkles className="w-3 h-3 md:w-5 md:h-5 text-[#fde25d]" />}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-16 items-center w-full py-20">

          {/* Visual */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}
          >
            <div className="relative w-full aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 rounded-full blur-3xl"
                style={{ backgroundColor: 'rgba(253,226,93,0.25)' }}
              />
              <Droplet
                className="relative w-32 h-32 mx-auto text-[#fde25d]"
                strokeWidth={1.2}
                fill="currentColor"
              />
            </div>
          </div>

          {/* Text */}
          <div
            className={`space-y-8 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border"
              style={{
                borderColor: 'rgba(253,226,93,0.4)',
                backgroundColor: 'rgba(253,226,93,0.08)',
                color: '#fde25d'
              }}
            >
              <Sparkles className="w-4 h-4" />
              رحلة التطهير والنقاء
            </div>

            {/* Title */}
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, #fde25d, #fff2a8)'
                }}
              >
                التزكية
              </span>
              <br />
              <span className="text-3xl lg:text-5xl text-[#fde25d]">
                طريق الطهارة والنقاء
              </span>
            </h1>

            {/* Animated Word */}
            <div className="text-2xl font-semibold text-[#fde25d] flex items-center gap-3">
              <Heart className="w-6 h-6 animate-pulse" />
              تطهير {highlightWords[currentWord]}
            </div>

            {/* Description */}
            <div className="space-y-4 text-lg text-[#fde25d]/90 leading-relaxed">
              <p>
                التزكية هي تطهير القلب من أدران الذنوب، وتنقية النفس من الشوائب،
                وتصفية الروح لتسمو نحو الكمال الإنساني.
              </p>
              <p>
                في واحة العلم، نقدّم لك مسارًا متكاملاً في علم التزكية، يجمع بين
                الأصول الشرعية والتطبيق العملي لتحقيق السكينة.
              </p>
            </div>

            {/* Quote */}
            <div
              className="p-6 rounded-2xl border text-center"
              style={{
                backgroundColor: 'rgba(253,226,93,0.08)',
                borderColor: 'rgba(253,226,93,0.4)',
                color: '#fde25d'
              }}
            >
              <p className="text-2xl">
                ❝ قد أفلح من زكّاها، وقد خاب من دسّاها ❞
              </p>
              {/* <p className="text-sm mt-2 opacity-80">
                سورة الشمس – 9،10
              </p> */}
            </div>

            {/* Button */}
            <button
              className="px-10 py-5 rounded-2xl font-bold text-xl transition hover:scale-105"
              style={{
                backgroundColor: '#fde25d',
                color: '#7d6c57'
              }}
              onClick={handleNavigate}
            >
              <div className="flex items-center gap-3">
                <Droplet />
                ابدأ رحلة التزكية
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Scroll */}
      <div
        onClick={scrollToNext}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer animate-bounce text-[#fde25d]"
      >
        <span className="text-sm">تابع القراءة</span>
        <ChevronDown />
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default TazkiyahSection;