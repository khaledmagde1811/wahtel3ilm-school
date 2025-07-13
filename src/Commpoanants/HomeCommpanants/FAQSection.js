import React, { useState } from "react";

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleQuestion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqData = [
    {
      question: "كيف يتم تنظيم المناهج؟",
      answer:
        "يتم تسجيل المناهج مسبقًا من قبل المشايخ والمسؤولين المعنيين، حيث يتكون كل مستوى من مجموعة من المحاضرات التي تحتوي على محتوى تعليمي شامل.",
    },
    {
      question: "هل يجب عليّ اجتياز اختبار بعد كل محاضرة؟",
      answer:
        "نعم، يجب على الطالب حل اختبار بعد كل محاضرة من أجل الانتقال إلى المحاضرة التالية. لا يمكن للطالب مشاهدة المحاضرة التالية إلا بعد اجتيازه للاختبار بنجاح.",
    },
    {
      question: "ماذا يحدث بعد إتمام المستوى؟",
      answer:
        "بعد إتمام جميع المحاضرات في المستوى، يجب على الطالب اجتياز امتحان شامل يغطي جميع المواد التي تمت دراستها. يجب أن يحصل الطالب على نسبة 85% على الأقل في هذا الامتحان لكي يتمكن من الانتقال إلى المستوى التالي.",
    },
    {
      question: "هل يمكنني العودة إلى المحاضرات السابقة؟",
      answer:
        "نعم، بعد اجتياز الاختبارات الخاصة بالمحاضرات، يمكن للطالب العودة إلى المحاضرات السابقة لمراجعتها إذا كان بحاجة لذلك.",
    },
    {
      question: "هل هناك دعم إضافي أثناء الدراسة؟",
      answer:
        "نعم، يتم توفير الدعم للطلاب عبر جلسات استشارية مع المعلمين والمشايخ، بالإضافة إلى مجموعات نقاش عبر الإنترنت لمساعدتهم في فهم المحتوى بشكل أفضل.",
    },
  ];

  return (
    <div className="bg-[#FFF9EF] py-12">
      <div className="max-w-screen-xl mx-auto px-4">
        <h2 className="text-[#665446] text-3xl md:text-4xl font-bold text-center mb-8">
          الأسئلة الشائعة
        </h2>
        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div key={index} className="bg-white shadow-md rounded-md">
              <button
                className="w-full text-left px-6 py-4 text-[#665446] font-semibold text-xl focus:outline-none"
                onClick={() => toggleQuestion(index)}
              >
                {item.question}
              </button>
              {activeIndex === index && (
                <div className="px-6 pb-4 text-[#665446] text-lg">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQSection;
