import React, { useState } from "react";
import { 
  Facebook, Twitter, Instagram, MessageCircle, Mail, Home, BookOpen, Target,Send,Heart,Code,FileText,Users 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const navigate = useNavigate();

  const handleLinkClick = (path) => {
    navigate(path); // هنا بيروح فعلاً للصفحة
  };
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail("");
      // هنا يمكن إضافة API call للاشتراك
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

 

  return (
    <footer className="bg-gradient-to-br from-[#665446] to-[#534139] text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" 
             style={{
               backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                                radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)`
             }}
        />
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            
            {/* قسم عن الموقع */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-amber-100 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-amber-300" />
                  عن الموقع
                </h3>
                <p className="text-amber-50/90 leading-relaxed">
                  نقدم لك منصة تعليمية شرعية متكاملة تتيح لك الوصول إلى أفضل الدورات التعليمية وتساعدك في تنمية معرفتك الدينية.
                </p>
              </div>
            </div>

            {/* قسم الروابط السريعة */}
            <div className="space-y-6">
      <h3 className="text-2xl font-bold mb-4 text-amber-100">روابط سريعة</h3>
      <ul className="space-y-3">
        <li>
          <button
            onClick={() => handleLinkClick("/")}
            className="flex items-center gap-3 text-amber-50/80 hover:text-amber-300 transition-colors duration-300 group cursor-pointer"
          >
            <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
            الصفحة الرئيسية
          </button>
        </li>
        <li>
          <button
            onClick={() => handleLinkClick("/courses")}
            className="flex items-center gap-3 text-amber-50/80 hover:text-amber-300 transition-colors duration-300 group cursor-pointer"
          >
            <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
            الدورات التعليمية
          </button>
        </li>
        <li>
          <button
            onClick={() => handleLinkClick("/goals")}
            className="flex items-center gap-3 text-amber-50/80 hover:text-amber-300 transition-colors duration-300 group cursor-pointer"
          >
            <Target className="w-4 h-4 group-hover:scale-110 transition-transform" />
            أهداف المدرسة
          </button>
        </li>
        <li>
          <button
            onClick={() => handleLinkClick("/articlesManagement")}
            className="flex items-center gap-3 text-amber-50/80 hover:text-amber-300 transition-colors duration-300 group cursor-pointer"
          >
            <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
            المقالات
          </button>
        </li>
        <li>
          <button
            onClick={() => handleLinkClick("/community")}
            className="flex items-center gap-3 text-amber-50/80 hover:text-amber-300 transition-colors duration-300 group cursor-pointer"
          >
            <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />
            المجتمع
          </button>
        </li>
      </ul>
    </div>

            {/* قسم التواصل الاجتماعي */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold mb-4 text-amber-100">تواصل معنا</h3>
              
              {/* Social Media Icons */}
              {/* <div className="flex gap-4">
                <a 
                  href="#" 
                  className="group bg-white/10 backdrop-blur-sm p-3 rounded-full hover:bg-amber-500/20 transition-all duration-300 hover:scale-110"
                >
                  <Facebook className="w-5 h-5 text-amber-200 group-hover:text-white transition-colors" />
                </a>
                <a 
                  href="#" 
                  className="group bg-white/10 backdrop-blur-sm p-3 rounded-full hover:bg-amber-500/20 transition-all duration-300 hover:scale-110"
                >
                  <Twitter className="w-5 h-5 text-amber-200 group-hover:text-white transition-colors" />
                </a>
                <a 
                  href="#" 
                  className="group bg-white/10 backdrop-blur-sm p-3 rounded-full hover:bg-amber-500/20 transition-all duration-300 hover:scale-110"
                >
                  <Instagram className="w-5 h-5 text-amber-200 group-hover:text-white transition-colors" />
                </a>
              </div> */}

              {/* WhatsApp Section */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                <h4 className="font-bold text-amber-100 mb-2 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-green-400" />
                  WhatsApp
                </h4>
                <a
                  href="https://wa.me/201117379661"
                  className="inline-flex items-center gap-2 text-green-300 hover:text-green-200 transition-colors group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="group-hover:translate-x-1 transition-transform">
                    تواصل معنا الآن
                  </span>
                  <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>

            {/* قسم النشرة البريدية */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold mb-4 text-amber-100 flex items-center gap-2">
                <Mail className="w-6 h-6 text-amber-300" />
                النشرة البريدية
              </h3>
              <p className="text-amber-50/80 text-sm leading-relaxed">
                احصل على أحدث الدورات التعليمية والعروض عبر البريد الإلكتروني
              </p>
              
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="أدخل بريدك الإلكتروني"
                    className="w-full px-4 py-3 text-[#665446] rounded-xl bg-white/95 backdrop-blur-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all placeholder-gray-500"
                  />
                </div>
                <button 
                  onClick={handleSubscribe}
                  disabled={isSubscribed}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    isSubscribed 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white hover:scale-105'
                  }`}
                >
                  {isSubscribed ? (
                    <>
                      <Heart className="w-4 h-4" />
                      تم الاشتراك بنجاح!
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      اشترك الآن
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 bg-black/20">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              
              {/* Copyright */}
              <div className="text-center lg:text-right">
                <p className="text-amber-100/80 text-lg leading-relaxed">
                  © 2025 جميع الحقوق محفوظة لمنصة العلم الشرعي
                </p>
                <p className="text-amber-200/60 text-sm mt-1">
                  تم تطوير هذا الموقع لتقديم أفضل تجربة تعليمية
                </p>
              </div>

              {/* Developer Credit */}
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <Code className="w-4 h-4 text-amber-300" />
                <span className="text-amber-100/90 text-sm">
                  تصميم وبرمجة: <strong className="text-amber-200">المهندس خالد مجدي</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;