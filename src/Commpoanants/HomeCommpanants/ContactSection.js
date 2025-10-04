
import React, { useState } from "react";
import { MessageSquare, Phone, Mail, ChevronDown, CheckCircle, Send, Users } from "lucide-react";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const message = `
      *رسالة جديدة من النموذج:*
      
      *الاسم:* ${formData.name}
      *البريد الإلكتروني:* ${formData.email}
      *الرسالة:* ${formData.message}
    `;

    const encodedMessage = encodeURIComponent(message);
    const whatsappLink = `https://wa.me/201117379661?text=${encodedMessage}`;

    setFormSubmitted(true);
    setFormData({ name: "", email: "", message: "" });
    window.open(whatsappLink, "_blank");
  };

  return (
    <div className="bg-gradient-to-br from-[#FFF9EF] via-white to-amber-50/30 py-20 text-[#665446] relative overflow-hidden">
      
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-amber-200/20 to-orange-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-br from-blue-200/15 to-purple-300/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          <div className="inline-block relative">
            <h2 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#665446] via-[#8B7355] to-[#665446] font-['Almarai'] animate-gradient">
              اتصل بنا
            </h2>
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" />
          </div>
          <p className="text-center text-xl md:text-2xl mt-6 font-['Almarai'] text-[#8B7355] max-w-3xl mx-auto leading-relaxed">
            نحن هنا لمساعدتك. إذا كان لديك أي استفسارات، لا تتردد في التواصل معنا
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Contact Info - Right Side */}
          <div className="order-2 lg:order-1 space-y-8">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50">
              <h3 className="text-3xl font-bold text-[#665446] font-['Almarai'] mb-6 flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-amber-500" />
                طرق التواصل
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-200/50">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#665446] font-['Almarai']">اتصال أو واتساب</h4>
                    <p className="text-[#8B7355] font-['Almarai']">01117379661</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200/50">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#665446] font-['Almarai']">البريد الإلكتروني</h4>
                    <p className="text-[#8B7355] font-['Almarai']">wa7at.al3lm@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-200/50">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#665446] font-['Almarai']">الدعم الفني</h4>
                    <p className="text-[#8B7355] font-['Almarai']">متاح 24/7</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="text-4xl font-bold text-[#665446] font-['Almarai']">24</div>
                <div className="text-sm text-[#8B7355] font-['Almarai']">ساعة دعم</div>
              </div>
              <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="text-4xl font-bold text-[#665446] font-['Almarai']">100%</div>
                <div className="text-sm text-[#8B7355] font-['Almarai']">استجابة سريعة</div>
              </div>
            </div>
          </div>

          {/* Contact Form - Left Side */}
          <div className="order-1 lg:order-2">
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50">
              <h3 className="text-3xl font-bold text-[#665446] font-['Almarai'] mb-6 text-center">
                أرسل رسالتك
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <label htmlFor="name" className="block text-lg font-semibold mb-3 text-[#665446] font-['Almarai']">
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-[#665446]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B7355] focus:border-transparent transition-all duration-300 font-['Almarai'] bg-white/80 backdrop-blur-sm"
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>

                {/* Email field commented out as requested */}
                {/* <div className="relative">
                  <label htmlFor="email" className="block text-lg font-semibold mb-3 text-[#665446] font-['Almarai']">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-[#665446]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B7355] focus:border-transparent transition-all duration-300 font-['Almarai'] bg-white/80 backdrop-blur-sm"
                    placeholder="أدخل بريدك الإلكتروني"
                  />
                </div> */}

                <div className="relative">
                  <label htmlFor="message" className="block text-lg font-semibold mb-3 text-[#665446] font-['Almarai']">
                    الرسالة
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows="5"
                    className="w-full px-4 py-3 border-2 border-[#665446]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B7355] focus:border-transparent transition-all duration-300 font-['Almarai'] bg-white/80 backdrop-blur-sm resize-none"
                    placeholder="اكتب رسالتك هنا..."
                  />
                </div>

                <button
                  type="submit"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className="w-full py-4 bg-gradient-to-r from-[#665446] to-[#8B7355] hover:from-[#8B7355] hover:to-[#665446] text-white font-bold text-lg rounded-xl transition-all duration-500 transform hover:scale-105 shadow-xl hover:shadow-2xl font-['Almarai'] relative overflow-hidden"
                >
                  <div className="relative flex items-center justify-center gap-3">
                    <Send className={`w-5 h-5 transition-all duration-300 ${isHovered ? 'translate-x-2' : ''}`} />
                    <span>إرسال الرسالة عبر واتساب</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] hover:translate-x-[200%] transition-transform duration-700" />
                </button>
              </form>

              {formSubmitted && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-3 text-green-600">
                    <CheckCircle className="w-6 h-6" />
                    <p className="font-semibold font-['Almarai']">تم إرسال رسالتك بنجاح!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ContactSection;