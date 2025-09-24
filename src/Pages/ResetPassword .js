import React, { useState, useEffect } from 'react';
import { supabase } from '../Utilities/supabaseClient';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [validSession, setValidSession] = useState(false);

  useEffect(() => {
    // عند فتح الصفحة، Supabase بيرجع التوكينات في URL hash (#access_token=...)
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (access_token && refresh_token) {
        supabase.auth.setSession({ access_token, refresh_token })
          .then(({ data, error }) => {
            if (error) {
              console.error("setSession error:", error.message);
              setMessage("❌ رابط غير صالح أو انتهت صلاحيته.");
            } else {
              setValidSession(true);
            }
          });
      }
    }
  }, []);

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
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) throw error;

      setMessage('✅ تم تحديث كلمة المرور بنجاح!');
      
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

        {!validSession ? (
          <p className="text-center text-red-600">
            ⚠️ برجاء فتح هذه الصفحة من خلال الرابط المرسل على بريدك الإلكتروني.
          </p>
        ) : (
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
        )}
        
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
