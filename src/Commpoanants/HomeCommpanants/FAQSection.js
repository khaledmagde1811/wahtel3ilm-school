
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleQuestion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqData = [
    {
      question: "كيف يتم تنظيم المناهج؟",
      answer: "يتم تسجيل المناهج مسبقًا من قبل المشايخ والمسؤولين المعنيين، حيث يتكون كل مستوى من مجموعة من المحاضرات التي تحتوي على محتوى تعليمي شامل.",
    },
    {
      question: "هل يجب عليّ اجتياز اختبار بعد كل محاضرة؟",
      answer: "نعم، يجب على الطالب حل اختبار بعد كل محاضرة من أجل الانتقال إلى المحاضرة التالية. لا يمكن للطالب مشاهدة المحاضرة التالية إلا بعد اجتيازه للاختبار بنجاح.",
    },
    {
      question: "ماذا يحدث بعد إتمام المستوى؟",
      answer: "بعد إتمام جميع المحاضرات في المستوى، يجب على الطالب اجتياز امتحان شامل يغطي جميع المواد التي تمت دراستها. يجب أن يحصل الطالب على نسبة 85% على الأقل في هذا الامتحان لكي يتمكن من الانتقال إلى المستوى التالي.",
    },
    {
      question: "هل يمكنني العودة إلى المحاضرات السابقة؟",
      answer: "نعم، بعد اجتياز الاختبارات الخاصة بالمحاضرات، يمكن للطالب العودة إلى المحاضرات السابقة لمراجعتها إذا كان بحاجة لذلك.",
    },
    {
      question: "هل هناك دعم إضافي أثناء الدراسة؟",
      answer: "نعم، يتم توفير الدعم للطلاب عبر جلسات استشارية مع المعلمين والمشايخ، بالإضافة إلى مجموعات نقاش عبر الإنترنت لمساعدتهم في فهم المحتوى بشكل أفضل.",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-[#FFF9EF] via-white to-amber-50/30 py-20 relative overflow-hidden">
      
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-purple-200/20 to-blue-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-amber-200/15 to-orange-300/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          <div className="inline-block relative">
            <h2 className="text-[#665446] text-5xl md:text-6xl font-bold font-['Almarai'] relative">
              الأسئلة الشائعة
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" />
            </h2>
          </div>
          <p className="text-xl text-[#8B7355] font-['Almarai'] mt-6 max-w-3xl mx-auto">
            إجابات على أكثر الأسئلة شيوعاً حول منصتنا التعليمية
          </p>
        </div>
        
        <div className="space-y-6 max-w-4xl mx-auto">
          {faqData.map((item, index) => (
            <div 
              key={index} 
              className="bg-white/90 backdrop-blur-lg shadow-xl rounded-2xl border border-white/50 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              <button
                className="w-full text-right px-8 py-6 text-[#665446] font-bold text-xl md:text-2xl focus:outline-none font-['Almarai'] flex items-center justify-between group transition-colors duration-300 hover:bg-amber-50/50"
                onClick={() => toggleQuestion(index)}
              >
                <ChevronDown 
                  className={`w-6 h-6 text-amber-500 transition-all duration-300 flex-shrink-0 ${
                    activeIndex === index ? 'rotate-180 text-[#665446]' : 'group-hover:text-[#8B7355]'
                  }`} 
                />
                <span className="text-right leading-relaxed">{item.question}</span>
              </button>
              
              {activeIndex === index && (
                <div className="px-8 pb-6 text-[#665446] text-lg md:text-xl font-['Almarai'] leading-relaxed text-right border-t border-amber-200/30 bg-gradient-to-r from-amber-50/30 to-transparent animate-slideDown">
                  <div className="pt-4">
                    {item.answer}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

// Export both components
export default FAQSection;
