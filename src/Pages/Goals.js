// src/Pages/Goals.js
import React, { useState } from 'react';
import { 
  BookOpen, 
  Target, 
  Star, 
  Users, 
  Heart, 
  Award, 
  Lightbulb, 
  Quote,
  CheckCircle,
  Sparkles,
  GraduationCap,
  Crown,
  Scroll,
  Zap
} from 'lucide-react';
import AnimatedBackground from '../Utilities/AnimatedBackground'; // Import الخلفية المتحركة الجاهزة

const Goals = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const benefits = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      text: "فهم صحيح لأحكام الشريعة الإسلامية في العبادات والمعاملات"
    },
    {
      icon: <Scroll className="w-6 h-6" />,
      text: "تمكن من تفسير القرآن الكريم بشكل عميق وفهم معانيه وتطبيقه في الحياة"
    },
    {
      icon: <Star className="w-6 h-6" />,
      text: "التعرف على السنة النبوية الصحيحة وكيفية تطبيقها في العصر الحالي"
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      text: "تنمية مهارات التفكير النقدي في فهم النصوص الشرعية وتحليلها"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      text: "تعلم الأخلاق الإسلامية وتعليمها للآخرين"
    },
    {
      icon: <Award className="w-6 h-6" />,
      text: "القدرة على إصدار الفتاوى بناءً على الأدلة الشرعية"
    },
    {
      icon: <GraduationCap className="w-6 h-6" />,
      text: "إعداد الطالب ليكون مؤهلاً للعمل في مجال الدعوة والتعليم الشرعي"
    }
  ];

  const quotes = [
    {
      text: "يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ",
      source: "المجادلة: 11",
      type: "قرآن"
    },
    {
      text: "من سلك طريقًا يلتمس فيه علمًا سهل الله له به طريقًا إلى الجنة",
      source: "رواه مسلم",
      type: "حديث"
    },
    {
      text: "من تعلم القرآن فهو عالم، ومن تعلم الحديث فهو فقيه",
      source: "الإمام الشافعي رحمه الله",
      type: "قول"
    },
    {
      text: "العلم نور، وإذا لم تجد من ينير لك هذا الطريق، فقد أصبحت في الظلام",
      source: "الإمام مالك رحمه الله",
      type: "قول"
    },
    {
      text: "العلماء هم ورثة الأنبياء، لأنهم يبلغون العلم للناس كما بلغها الأنبياء",
      source: "الإمام ابن القيم رحمه الله",
      type: "قول"
    }
  ];

  return (
<AnimatedBackground className="min-h-screen" dir="rtl">      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-32 left-16 w-80 h-80 bg-amber-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-orange-200/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 py-16 px-6 max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-4 mb-8">
            <Target className="w-12 h-12 text-amber-500 animate-bounce" />
            <h1 className="text-6xl md:text-7xl text-[#665446] font-bold font-['Almarai'] relative">
              أهداف المدرسة
              <div className="absolute -bottom-2 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-pulse" />
            </h1>
            <Crown className="w-12 h-12 text-amber-500 animate-bounce" style={{ animationDelay: '0.5s' }} />
          </div>
          <p className="text-xl text-[#8B7355] font-['Almarai'] max-w-3xl mx-auto leading-relaxed">
            نحو تحقيق الامتياز في التعليم الشرعي وإعداد جيل واعٍ ومؤهل
          </p>
        </div>

        {/* Main Goal Card */}
        <div 
          className={`bg-gradient-to-br from-white/95 to-amber-50/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 mb-12 border border-white/30 relative overflow-hidden transition-all duration-700 ${
            hoveredCard === 'main' ? 'scale-[1.02] shadow-3xl' : ''
          }`}
          onMouseEnter={() => setHoveredCard('main')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-200/20 to-transparent rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-orange-200/15 to-transparent rounded-full blur-2xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl text-[#665446] font-bold font-['Almarai']">الهدف العام</h2>
            </div>
            
            <p className="text-[#665446] text-lg leading-relaxed font-['Almarai']">
              تسعى هذه المدرسة إلى تحقيق الأهداف السامية في نشر العلم الشرعي، وتربية الأجيال على الفهم الصحيح
              لأحكام الدين، وتزويد الطلاب بالمعرفة التي تمكنهم من خدمة مجتمعهم ونشر الحق.
              <span className="font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {" "}العلم أساس التقدم والرقي في جميع المجالات.
              </span>
            </p>
          </div>
        </div>

        {/* Quotes Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              {/* <Quote className="w-8 h-8 text-amber-500" /> */}
              <h2 className="text-4xl text-[#665446] font-bold font-['Almarai']">أقوال مأثورة</h2>
              {/* <Sparkles className="w-8 h-8 text-amber-500 animate-pulse" /> */}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {quotes.map((quote, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br from-white/90 to-slate-50/60 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/40 relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] group`}
                >
                {/* Type Badge */}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold font-['Almarai'] ${
                  quote.type === 'قرآن' 
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : quote.type === 'حديث'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-purple-100 text-purple-800 border border-purple-200'
                }`}>
                  {quote.type}
                </div>

                {/* Quote Icon */}
                <div className="mb-4">
                  {/* <Quote className="w-6 h-6 text-amber-500 opacity-60" /> */}
                </div>

                {/* Quote Text */}
                <p className="text-[#665446] text-lg font-['Almarai'] font-semibold leading-relaxed mb-4 pr-16">
                  "{quote.text}"
                </p>

                {/* Source */}
                <div className="flex items-center gap-2 text-[#8B7355] text-sm font-['Almarai']">
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                  <span className="font-medium">{quote.source}</span>
                </div>

                {/* Hover Effect */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div 
          className={`bg-gradient-to-br from-white/95 to-orange-50/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 mb-12 border border-white/30 relative overflow-hidden transition-all duration-700 ${
            hoveredCard === 'benefits' ? 'scale-[1.02] shadow-3xl' : ''
          }`}
          onMouseEnter={() => setHoveredCard('benefits')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 right-10 w-24 h-24 bg-amber-400 rounded-full blur-2xl" />
            <div className="absolute bottom-10 left-10 w-32 h-32 bg-orange-400 rounded-full blur-2xl" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl text-[#665446] font-bold font-['Almarai']">
                ما الذي سيستفيده الطالب؟
              </h2>
            </div>

            <p className="text-[#665446] text-lg font-['Almarai'] leading-relaxed mb-8">
              من خلال طلب العلم الشرعي في هذه المدرسة، سيكتسب الطالب العديد من المهارات والمعرفة التي تفيده في حياته اليومية:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50 transition-all duration-500 hover:shadow-xl hover:scale-[1.02] hover:bg-white/80 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl p-3 shadow-md group-hover:scale-110 transition-transform duration-300">
                      {benefit.icon}
                      <div className="text-white" />
                    </div>
                    <p className="text-[#665446] font-['Almarai'] leading-relaxed flex-1 pt-2">
                      {benefit.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-l-4 border-amber-400">
              <p className="text-[#665446] text-lg font-['Almarai'] leading-relaxed">
                كما أن المدرسة تهدف إلى تربية الطالب على 
                <span className="font-bold text-amber-700 mx-2 px-2 py-1 bg-amber-100 rounded-lg">الاستقامة</span> 
                و
                <span className="font-bold text-orange-700 mx-2 px-2 py-1 bg-orange-100 rounded-lg">الالتزام بالقيم الإسلامية</span>
                ، مما يساعده في التأثير الإيجابي على مجتمعه.
              </p>
            </div>
          </div>
        </div>

        {/* Final Message */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-white/90 to-amber-50/70 backdrop-blur-md rounded-3xl shadow-2xl p-10 border border-white/40 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 animate-pulse" />
            
            <div className="flex items-center justify-center gap-4 mb-6">
              <Zap className="w-8 h-8 text-amber-500 animate-bounce" />
              <Sparkles className="w-6 h-6 text-orange-500 animate-pulse" />
              <Zap className="w-8 h-8 text-amber-500 animate-bounce" style={{ animationDelay: '0.5s' }} />
            </div>
            
            <p className="text-2xl md:text-3xl text-[#665446] font-bold font-['Almarai'] leading-relaxed">
              طلب العلم ليس فقط عبادة ولكن أيضًا
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mx-2">
                مسؤولية عظيمة
              </span>
              على عاتقنا جميعًا
            </p>

            <div className="mt-6 flex justify-center">
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-full px-6 py-2 shadow-lg">
                <span className="text-white font-bold font-['Almarai']">✨ رحلة العلم تبدأ بخطوة ✨</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
};

export default Goals;