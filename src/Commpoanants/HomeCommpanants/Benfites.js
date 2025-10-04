import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle, Users, BookOpen, Star, Zap, Award, Globe, Heart, Shield } from 'lucide-react';

const Benfites = () => {
  const [isVisible, setIsVisible] = useState({});
  const [activeCard, setActiveCard] = useState(null);
  const sectionRef = useRef(null);

  // Mock images - replace with your actual image imports
  const benefits = [
    {
      id: 1,
      title: "دروس متاحة 24 ساعة",
      description: "تعلم في أي وقت يناسبك مع دروس متاحة على مدار الساعة",
      icon: Clock,
      color: "from-blue-400 to-blue-600",
      bgColor: "bg-blue-50",
      delay: "0ms"
    },
    {
      id: 2,
      title: "تحت إشراف أفضل المعلمين",
      description: "نخبة من الأساتذة المتخصصين في العلوم الشرعية",
      icon: Users,
      color: "from-green-400 to-green-600",
      bgColor: "bg-green-50",
      delay: "200ms"
    },
    {
      id: 3,
      title: "محتوى موثوق",
      description: "محتوى علمي دقيق مراجع من قبل المتخصصين",
      icon: Shield,
      color: "from-purple-400 to-purple-600",
      bgColor: "bg-purple-50",
      delay: "400ms"
    },
    {
      id: 4,
      title: "شرح مبسط",
      description: "أسلوب تعليمي سهل ومفهوم يناسب جميع المستويات",
      icon: BookOpen,
      color: "from-orange-400 to-orange-600",
      bgColor: "bg-orange-50",
      delay: "600ms"
    }
  ];

  const additionalFeatures = [
    { icon: Star, text: "تقييم تفاعلي", color: "text-yellow-500" },
    { icon: Heart, text: "مجتمع داعم", color: "text-red-500" }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.dataset.id;
            setTimeout(() => {
              setIsVisible(prev => ({ ...prev, [id]: true }));
            }, parseInt(entry.target.dataset.delay) || 0);
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const elements = document.querySelectorAll('.benefit-card');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-[#665446] min-h-screen py-16 mt-12 relative overflow-hidden">
      
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-amber-200/20 to-orange-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-white/10 to-amber-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-orange-200/15 to-amber-300/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-amber-400/40 rounded-full animate-float`}
            style={{
              left: `${10 + (i * 8) % 80}%`,
              top: `${20 + (i * 12) % 60}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + (i % 3)}s`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10" ref={sectionRef}>
        
        {/* Enhanced Header */}
        <div className="text-center mb-20">
          <div className="inline-block relative">
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-white font-['Almarai'] relative z-10 animate-gradient">
              مميزات المنصة
            </h1>
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-400/20 via-orange-500/20 to-amber-400/20 blur-2xl rounded-full animate-pulse" />
          </div>
          
          <div className="mt-8 max-w-3xl mx-auto">
            <p className="text-xl sm:text-2xl text-white/90 font-['Almarai'] leading-relaxed">
              اكتشف عالماً من التعلم الرقمي المتطور مع منصتنا التعليمية
            </p>
            <div className="flex justify-center mt-6 gap-2">
              {additionalFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-white/20">
                  <feature.icon className={`w-4 h-4 ${feature.color}`} />
                  <span className="text-sm font-['Almarai'] text-white">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.id}
                className={`benefit-card group relative transform transition-all duration-1000 ${
                  isVisible[benefit.id] 
                    ? 'translate-y-0 opacity-100 scale-100' 
                    : 'translate-y-20 opacity-0 scale-95'
                }`}
                data-id={benefit.id}
                data-delay={benefit.delay}
                onMouseEnter={() => setActiveCard(benefit.id)}
                onMouseLeave={() => setActiveCard(null)}
              >
                
                {/* Main Card */}
                <div className={`relative ${benefit.bgColor} rounded-3xl p-8 shadow-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-4xl hover:-translate-y-2 border border-white/50`}>
                  
                  {/* Animated Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${benefit.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  {/* Icon Container */}
                  <div className="relative mb-6">
                    <div className={`w-24 h-24 mx-auto bg-gradient-to-br ${benefit.color} rounded-2xl flex items-center justify-center shadow-xl transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                      <Icon className="w-12 h-12 text-white" />
                    </div>
                    
                    {/* Floating Ring */}
                    <div className={`absolute inset-0 w-24 h-24 mx-auto rounded-2xl border-4 border-gradient-to-r ${benefit.color.replace('to-', 'to-transparent from-')} opacity-0 group-hover:opacity-50 scale-150 group-hover:scale-175 transition-all duration-700`} />
                  </div>

                  {/* Content */}
                  <div className="text-center relative z-10">
                    <h3 className="text-2xl sm:text-3xl font-bold text-[#665446] font-['Almarai'] mb-4 group-hover:text-[#8B7355] transition-colors duration-300">
                      {benefit.title}
                    </h3>
                    <p className="text-lg text-[#665446]/70 font-['Almarai'] leading-relaxed group-hover:text-[#665446] transition-colors duration-300">
                      {benefit.description}
                    </p>
                  </div>

                  {/* Hover Effects */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Zap className="w-6 h-6 text-yellow-500 animate-bounce" />
                  </div>

                  {/* Bottom Shine Effect */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${benefit.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />
                  
                  {/* Particle Effect */}
                  {activeCard === benefit.id && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className={`absolute w-1 h-1 bg-gradient-to-r ${benefit.color} rounded-full animate-ping`}
                          style={{
                            left: `${20 + i * 10}%`,
                            top: `${30 + (i % 3) * 20}%`,
                            animationDelay: `${i * 0.1}s`
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Bottom Section */}
        <div className="text-center mt-20">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-12 shadow-2xl max-w-4xl mx-auto border border-white/50">
            <div className="mb-8">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-full font-['Almarai'] font-bold shadow-lg">
                <Star className="w-5 h-5" />
                <span>تجربة تعليمية استثنائية</span>
                <Star className="w-5 h-5" />
              </div>
            </div>
            
            <h3 className="text-3xl sm:text-4xl font-bold text-[#665446] font-['Almarai'] mb-6">
              منصة تقدم لك مجموعة من المميزات
            </h3>
            <p className="text-xl sm:text-2xl text-[#665446]/80 font-['Almarai'] leading-relaxed mb-8">
              التي تجعل من تعلمك تجربة مميزة وسهلة في عالم العلوم الشرعية
            </p>
            
            {/* Progress Indicators */}
            <div className="flex justify-center items-center gap-8 flex-wrap">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#665446] font-['Almarai']">24/7</div>
                <div className="text-sm text-[#8B7355] font-['Almarai']">متاح دائماً</div>
              </div>
              <div className="w-px h-12 bg-[#8B7355]/30" />
              <div className="text-center">
                <div className="text-4xl font-bold text-[#665446] font-['Almarai']">100%</div>
                <div className="text-sm text-[#8B7355] font-['Almarai']">محتوى موثوق</div>
              </div>
              <div className="w-px h-12 bg-[#8B7355]/30" />
              <div className="text-center">
                <div className="text-4xl font-bold text-[#665446] font-['Almarai']">∞</div>
                <div className="text-sm text-[#8B7355] font-['Almarai']">إمكانيات لا محدودة</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(120deg); }
          66% { transform: translateY(5px) rotate(240deg); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 4s ease infinite;
        }
        
        .shadow-4xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
};

export default Benfites;