import React from "react";
import { Link } from "react-router-dom";  // استيراد Link لاستخدام الروابط الداخلية

const Footer = () => {
  return (
    <div className="bg-[#665446] text-white py-12">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* قسم عن الموقع */}
          <div>
            <h3 className="text-2xl font-bold mb-4">عن الموقع</h3>
            <p className="text-lg">
              نقدم لك منصة تعليمية شرعية متكاملة تتيح لك الوصول إلى أفضل الدورات التعليمية وتساعدك في تنمية معرفتك الدينية.
            </p>
          </div>

          {/* قسم الروابط السريعة */}
          <div>
            <h3 className="text-2xl font-bold mb-4">روابط سريعة</h3>
            <ul>
              <li><Link to="/" className="hover:text-[#8C6D51]">الصفحة الرئيسية</Link></li>
              <li><Link to="/courses" className="hover:text-[#8C6D51]">الدورات التعليمية</Link></li>
              <li><Link to="/goals" className="hover:text-[#8C6D51]">أهداف المدرسة</Link></li>
            </ul>
          </div>

          {/* قسم تواصل اجتماعي */}
          <div>
            <h3 className="text-2xl font-bold mb-4">تواصل معنا</h3>
            <div className="flex space-x-6">
              <a href="#" className="text-xl hover:text-[#8C6D51]">
                <i className="fab fa-facebook"></i> {/* أضف الأيقونة هنا */}
              </a>
              <a href="#" className="text-xl hover:text-[#8C6D51]">
                <i className="fab fa-twitter"></i> {/* أضف الأيقونة هنا */}
              </a>
              <a href="#" className="text-xl hover:text-[#8C6D51]">
                <i className="fab fa-instagram"></i> {/* أضف الأيقونة هنا */}
              </a>
            </div>
            {/* إضافة رابط WhatsApp */}
            <div className="mt-4">
              <h3 className="text-2xl font-bold mb-4">تواصل عبر WhatsApp</h3>
              <a
                href="https://wa.me/201117379661"
                className="text-lg text-[#8C6D51] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                اضغط هنا للتواصل معنا عبر WhatsApp
              </a>
            </div>
          </div>

          {/* قسم حقوق الملكية */}
          <div>
            <h3 className="text-2xl font-bold mb-4">حقوق الملكية</h3>
            <p className="text-lg">© 2025 جميع الحقوق محفوظة لمنصة العلم الشرعي. تم تطوير هذا الموقع لتقديم أفضل تجربة تعليمية.</p>
          </div>
        </div>

        {/* قسم تسجيل الاشتراك في النشرة البريدية */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold mb-4">اشترك في النشرة البريدية</h3>
          <p className="text-lg mb-6">احصل على أحدث الدورات التعليمية والعروض عبر البريد الإلكتروني.</p>
          <form className="flex justify-center">
            <input
              type="email"
              placeholder="أدخل بريدك الإلكتروني"
              className="px-4 py-2 text-[#665446] rounded-l-md"
            />
            <button className="bg-[#8C6D51] text-white px-6 py-2 rounded-r-md">
              اشترك الآن
            </button>
          </form>
        </div>

        {/* قسم القائم على البرمجة والتصميم */}
        <div className="text-center mt-12">
          <p className="text-lg">
            الموقع من تصميم وبرمجة المهندس <strong>خالد مجدي</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
