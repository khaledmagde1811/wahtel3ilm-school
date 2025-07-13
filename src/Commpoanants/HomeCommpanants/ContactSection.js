import React, { useState } from "react";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // تكوين رسالة WhatsApp مع البيانات المدخلة
    const message = `
      *رسالة جديدة من النموذج:*
      
      *الاسم:* ${formData.name}
      *البريد الإلكتروني:* ${formData.email}
      *الرسالة:* ${formData.message}
    `;

    // تشفير الرسالة لاستخدامها في الرابط
    const encodedMessage = encodeURIComponent(message);

    // إنشاء رابط WhatsApp مع رمز البلد +20 لمصر
    const whatsappLink = `https://wa.me/201117379661?text=${encodedMessage}`;

    setFormSubmitted(true);
    setFormData({ name: "", email: "", message: "" }); // إعادة تعيين النموذج بعد الإرسال

    // عرض الرابط للمستخدم
    window.open(whatsappLink, "_blank");
  };

  return (
    <div className="bg-[#FFF9EF] py-16 text-[#665446]">
      <div className="max-w-screen-xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-6">اتصل بنا</h2>
        <p className="text-center text-xl mb-8">نحن هنا لمساعدتك. إذا كان لديك أي استفسارات، لا تتردد في التواصل معنا.</p>

        {/* نموذج الاتصال */}
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
          <div className="mb-4">
            <label htmlFor="name" className="block text-lg font-semibold mb-2">
              الاسم الكامل
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-[#665446] rounded-md focus:outline-none focus:ring-2 focus:ring-[#8C6D51]"
            />
          </div>
{/* 
          <div className="mb-4">
            <label htmlFor="email" className="block text-lg font-semibold mb-2">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-[#665446] rounded-md focus:outline-none focus:ring-2 focus:ring-[#8C6D51]"
            />
          </div> */}

          <div className="mb-6">
            <label htmlFor="message" className="block text-lg font-semibold mb-2">
              الرسالة
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              rows="4"
              className="w-full px-4 py-2 border border-[#665446] rounded-md focus:outline-none focus:ring-2 focus:ring-[#8C6D51]"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#665446] text-white font-semibold text-lg rounded-md hover:bg-[#8C6D51] transition-all"
          >
            إرسال الرسالة
          </button>
        </form>

        {/* رسالة تأكيد بعد الإرسال */}
        {formSubmitted && (
          <div className="mt-6 text-center text-green-500 font-semibold">
            <p>تم إرسال رسالتك بنجاح! يمكنك <a href={`https://wa.me/201117379661?text=${encodeURIComponent(`
              *رسالة جديدة من النموذج:*

              *الاسم:* ${formData.name}
              *البريد الإلكتروني:* ${formData.email}
              *الرسالة:* ${formData.message}
            `)}`} target="_blank" rel="noopener noreferrer" className="text-blue-500">فتح WhatsApp هنا</a>.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactSection;
