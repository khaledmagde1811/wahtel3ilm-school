import React, { useState } from 'react';
import { supabase } from '../Utilities/supabaseClient';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (newPassword !== confirmPassword) {
      setMessage('❌ كلمات المرور غير متطابقة');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage('❌ كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setMessage('✅ تم تحديث كلمة المرور بنجاح!');
      
      // إعادة توجيه إلى صفحة تسجيل الدخول بعد 3 ثواني
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setMessage(`❌ خطأ: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#CDC0B6] min-h-screen flex items-center justify-center px-4">
      <div className="bg-[#FFF9EF] p-8 rounded-xl shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold text-[#665446] mb-6 text-center">
          تحديث كلمة المرور
        </h2>
        
        <form onSubmit={handleUpdatePassword}>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="كلمة المرور الجديدة"
            className="w-full p-3 mb-4 border rounded"
            required
          />
          
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="تأكيد كلمة المرور الجديدة"
            className="w-full p-3 mb-4 border rounded"
            required
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#665446] text-white rounded-xl hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
          </button>
        </form>
        
        {message && (
          <p className={`mt-4 text-center ${message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;