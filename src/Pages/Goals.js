// src/Pages/Goals.js
import React from 'react';

const Goals = () => {
  return (
    <div className="bg-[#FFF9EF] min-h-screen py-12 px-6">
      <h1 className="text-4xl text-[#665446] text-center font-bold mb-8">أهداف المدرسة</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-xl mb-8">
        <h2 className="text-2xl text-[#665446] font-semibold mb-4">الهدف العام</h2>
        <p className="text-[#665446] text-lg leading-relaxed">
          تسعى هذه المدرسة إلى تحقيق الأهداف السامية في نشر العلم الشرعي، وتربية الأجيال على الفهم الصحيح
          لأحكام الدين، وتزويد الطلاب بالمعرفة التي تمكنهم من خدمة مجتمعهم ونشر الحق. 
          <span className="font-semibold"> العلم أساس التقدم والرقي في جميع المجالات.</span>
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-xl mb-8">
        <h2 className="text-2xl text-[#665446] font-semibold mb-4">أهمية طلب العلم في الإسلام</h2>
        <p className="text-[#665446] text-lg leading-relaxed mb-4">
          قال الله تعالى: 
          <span className="font-bold text-[#665446]">{" (يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ) "}</span> 
          (المجادلة: 11).
          هذه الآية الكريمة تبين لنا فضل العلماء في الإسلام، وأن العلم في الإسلام له مكانة عظيمة. 
        </p>
        <p className="text-[#665446] text-lg leading-relaxed mb-4">
          وقال النبي صلى الله عليه وسلم: 
          <span className="font-bold text-[#665446]">"من سلك طريقًا يلتمس فيه علمًا سهل الله له به طريقًا إلى الجنة." </span> 
          (رواه مسلم).
        </p>
        <p className="text-[#665446] text-lg leading-relaxed">
          وقال الإمام الشافعي رحمه الله: 
          <span className="font-bold text-[#665446]">"من تعلم القرآن فهو عالم، ومن تعلم الحديث فهو فقيه."</span>
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-xl mb-8">
        <h2 className="text-2xl text-[#665446] font-semibold mb-4">أقوال العلماء عن طلب العلم</h2>
        <p className="text-[#665446] text-lg leading-relaxed mb-4">
          قال الإمام مالك رحمه الله: 
          <span className="font-bold text-[#665446]">"العلم نور، وإذا لم تجد من ينير لك هذا الطريق، فقد أصبحت في الظلام."</span>
        </p>
        <p className="text-[#665446] text-lg leading-relaxed mb-4">
          وقال الإمام ابن القيم رحمه الله:
          <span className="font-bold text-[#665446]">"العلماء هم ورثة الأنبياء، لأنهم يبلغون العلم للناس كما بلغها الأنبياء." </span>
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-xl mb-8">
        <h2 className="text-2xl text-[#665446] font-semibold mb-4">ما الذي سيستفيده الطالب من طلب العلم في هذه المدرسة؟</h2>
        <p className="text-[#665446] text-lg leading-relaxed mb-4">
          من خلال طلب العلم الشرعي في هذه المدرسة، سيكتسب الطالب العديد من المهارات والمعرفة التي تفيده في حياته اليومية:
        </p>
        <ul className="text-[#665446] text-lg leading-relaxed list-disc pl-6 mb-4">
          <li>فهم صحيح لأحكام الشريعة الإسلامية في العبادات والمعاملات.</li>
          <li>تمكن من تفسير القرآن الكريم بشكل عميق وفهم معانيه وتطبيقه في الحياة.</li>
          <li>التعرف على السنة النبوية الصحيحة وكيفية تطبيقها في العصر الحالي.</li>
          <li>تنمية مهارات التفكير النقدي في فهم النصوص الشرعية وتحليلها.</li>
          <li>تعلم الأخلاق الإسلامية وتعليمها للآخرين.</li>
          <li>القدرة على إصدار الفتاوى بناءً على الأدلة الشرعية.</li>
          <li>إعداد الطالب ليكون مؤهلاً للعمل في مجال الدعوة والتعليم الشرعي.</li>
        </ul>
        <p className="text-[#665446] text-lg leading-relaxed">
          كما أن المدرسة تهدف إلى تربية الطالب على <span className="font-semibold">الاستقامة</span> و<sub className="font-semibold">الالتزام بالقيم الإسلامية</sub>، مما يساعده في التأثير الإيجابي على مجتمعه.
        </p>
      </div>

      <div className="text-center mt-8">
        <p className="text-xl text-[#665446] font-semibold">
          طلب العلم ليس فقط عبادة ولكن أيضًا مسؤولية عظيمة على عاتقنا جميعًا.
        </p>
      </div>
    </div>
  );
};

export default Goals;
