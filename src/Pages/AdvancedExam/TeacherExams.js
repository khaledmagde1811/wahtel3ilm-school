// src/Pages/TeacherExams.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../../Utilities/supabaseClient';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../../Utilities/AnimatedBackground';
import {
  FileText, Plus, Trash2, Eye, Users, TrendingUp, X,
  Search, ChevronLeft, ChevronRight, Edit3, CheckCircle, XCircle
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TEXT_COLOR = '#806445';

const TeacherExams = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examAttempts, setExamAttempts] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchExams();
    }
  }, [currentUser]);

  useEffect(() => {
    filterAndPaginateExams();
  }, [exams, searchTerm, filterMonth, filterSubject, filterStatus, currentPage]);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setCurrentUser(user);
      const { data: userData, error } = await supabase
        .from('students')
        .select('role, first_name, last_name')
        .eq('auth_id', user.id)
        .single();

      if (!error && userData) {
        if (userData.role !== 'admin') {
          toast.error('غير مصرح لك بالوصول لهذه الصفحة');
          navigate('/monthly-exams');
          return;
        }
        setUserName(`${userData.first_name} ${userData.last_name}`);
      }
    } catch (error) {
      console.error('خطأ في جلب بيانات المستخدم:', error);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExams = async () => {
    try {
      const { data: examsData, error: examsError } = await supabase
        .from('monthly_exams')
        .select('*')
        .order('created_at', { ascending: false });

      if (examsError) throw examsError;
      const examsList = examsData || [];

      const examIds = examsList.map(e => e.id).filter(Boolean);

      if (examIds.length) {
        const { data: attempts, error: attErr } = await supabase
          .from('exam_attempts')
          .select('*')
          .in('exam_id', examIds);

        if (attErr) throw attErr;

        const byExam = {};
        attempts.forEach(a => {
          if (!byExam[a.exam_id]) byExam[a.exam_id] = { attempts: [] };
          byExam[a.exam_id].attempts.push(a);
        });

        const enriched = examsList.map(ex => {
          const info = byExam[ex.id] || { attempts: [] };
          const avg = info.attempts.length
            ? (info.attempts.reduce((s, it) => s + Number(it.percentage || 0), 0) / info.attempts.length)
            : 0;
          return { ...ex, attempts_count: info.attempts.length, attempts_avg: avg };
        });

        setExams(enriched);
      } else {
        setExams(examsList);
      }
    } catch (error) {
      console.error('خطأ في جلب الامتحانات:', error);
      toast.error('فشل جلب الامتحانات');
    }
  };

  const filterAndPaginateExams = () => {
    let filtered = exams;

    if (searchTerm) {
      filtered = filtered.filter(exam =>
        exam.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.subject?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterMonth) {
      filtered = filtered.filter(exam => exam.month === filterMonth);
    }

    if (filterSubject) {
      filtered = filtered.filter(exam => exam.subject === filterSubject);
    }

    if (filterStatus === 'active') {
      filtered = filtered.filter(exam => exam.is_active);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(exam => !exam.is_active);
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

    setFilteredExams(paginated);
  };

  const deleteExam = async (examId) => {
    const userConfirmed = window.confirm('هل أنت متأكد من حذف هذا الامتحان؟');
    if (!userConfirmed) return;

    try {
      const { error } = await supabase
        .from('monthly_exams')
        .delete()
        .eq('id', examId);

      if (error) throw error;

      setExams(prev => prev.filter(exam => exam.id !== examId));
      toast.success('تم حذف الامتحان بنجاح');
    } catch (error) {
      console.error('خطأ في حذف الامتحان:', error);
      toast.error('حدث خطأ أثناء حذف الامتحان');
    }
  };

  const viewExamResults = async (exam) => {
    try {
      const { data, error } = await supabase
        .from('exam_attempts')
        .select('*')
        .eq('exam_id', exam.id)
        .order('percentage', { ascending: false });

      if (error) throw error;

      setExamAttempts(data || []);
      setSelectedExam(exam);
      setShowResultsModal(true);
    } catch (error) {
      console.error('خطأ في جلب النتائج:', error);
      toast.error('حدث خطأ أثناء جلب النتائج');
    }
  };

  const uniqueMonths = [...new Set(exams.map(exam => exam.month).filter(Boolean))];
  const uniqueSubjects = [...new Set(exams.map(exam => exam.subject).filter(Boolean))];

  const totalPages = Math.ceil(exams.length / itemsPerPage);
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-24 sm:w-24 border-b-2 border-[#665446] mx-auto"></div>
          <p className="mt-4 text-sm sm:text-base" style={{ color: TEXT_COLOR }}>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatedBackground className="min-h-screen" dir="rtl">
      <div className="min-h-screen flex flex-col px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 overflow-visible">
        <ToastContainer
          position="top-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl
          pauseOnHover
          draggable
          style={{ zIndex: 9999 }}
        />

        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2 font-[Almarai]" style={{ color: TEXT_COLOR }}>
                  إدارة الامتحانات
                </h1>
                <p className="text-sm sm:text-base opacity-80 font-[Almarai]" style={{ color: TEXT_COLOR }}>
                  مرحباً {userName} (مشرف)
                </p>
              </div>

              <button
                onClick={() => navigate('/create-exam')}
                className="flex items-center gap-2 px-6 py-3 bg-[#665446] hover:bg-[#8B7355] text-white rounded-lg font-bold font-[Almarai] transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                إنشاء امتحان جديد
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="بحث عن امتحان..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#665446] focus:outline-none font-[Almarai]"
                  />
                </div>

                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#665446] focus:outline-none font-[Almarai]"
                >
                  <option value="">كل الشهور</option>
                  {uniqueMonths.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>

                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#665446] focus:outline-none font-[Almarai]"
                >
                  <option value="">كل المواد</option>
                  {uniqueSubjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#665446] focus:outline-none font-[Almarai]"
                >
                  <option value="all">كل الحالات</option>
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                </select>
              </div>
            </div>

            {filteredExams.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-20 h-20 mx-auto mb-4 opacity-30" style={{ color: TEXT_COLOR }} />
                <p className="text-xl font-[Almarai]" style={{ color: TEXT_COLOR }}>
                  لا توجد امتحانات متاحة
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {filteredExams.map(exam => (
                  <div
                    key={exam.id}
                    className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border-2 border-transparent hover:border-[#665446]"
                  >
                    <div className="bg-gradient-to-r from-[#665446] to-[#8B7355] p-4 text-white">
                      <h3 className="text-xl font-bold mb-2 font-[Almarai]">{exam.title}</h3>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-[Almarai]">{exam.month}</span>
                        <span className="font-[Almarai]">{exam.duration_minutes} دقيقة</span>
                      </div>
                    </div>

                    <div className="p-4">
                      {exam.description && (
                        <p className="text-gray-600 mb-4 text-sm font-[Almarai]">{exam.description}</p>
                      )}

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm font-[Almarai]">
                          <span className="text-gray-600">المادة:</span>
                          <span className="font-semibold" style={{ color: TEXT_COLOR }}>{exam.subject}</span>
                        </div>
                        <div className="flex justify-between text-sm font-[Almarai]">
                          <span className="text-gray-600">الدرجة الكلية:</span>
                          <span className="font-semibold" style={{ color: TEXT_COLOR }}>{exam.total_marks}</span>
                        </div>
                        <div className="flex justify-between text-sm font-[Almarai]">
                          <span className="text-gray-600">درجة النجاح:</span>
                          <span className="font-semibold" style={{ color: TEXT_COLOR }}>{exam.pass_marks}</span>
                        </div>
                        <div className="flex justify-between text-sm font-[Almarai]">
                          <span className="text-gray-600">عدد المحاولات:</span>
                          <span className="font-semibold" style={{ color: TEXT_COLOR }}>
                            {exam.attempts_count || 0}
                          </span>
                        </div>
                        {exam.attempts_count > 0 && (
                          <div className="flex justify-between text-sm font-[Almarai]">
                            <span className="text-gray-600">المتوسط:</span>
                            <span className="font-semibold" style={{ color: TEXT_COLOR }}>
                              {exam.attempts_avg?.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        {exam.is_active ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm font-bold font-[Almarai]">
                            <CheckCircle className="w-4 h-4" />
                            نشط
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 text-sm font-bold font-[Almarai]">
                            <XCircle className="w-4 h-4" />
                            غير نشط
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => viewExamResults(exam)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold font-[Almarai] transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          النتائج
                        </button>
                        <button
                          onClick={() => navigate(`/edit-exam/${exam.id}`)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#665446] hover:bg-[#8B7355] text-white rounded-lg font-bold font-[Almarai] transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          تعديل
                        </button>
                        <button
                          onClick={() => deleteExam(exam.id)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mb-6">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 font-[Almarai]" style={{ color: TEXT_COLOR }}>
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {showResultsModal && selectedExam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-[#665446] to-[#8B7355] p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold font-[Almarai] mb-2">نتائج الامتحان</h2>
                    <p className="text-sm opacity-90 font-[Almarai]">{selectedExam.title}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowResultsModal(false);
                      setSelectedExam(null);
                      setExamAttempts([]);
                    }}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {examAttempts.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: TEXT_COLOR }} />
                    <p className="text-lg font-[Almarai]" style={{ color: TEXT_COLOR }}>
                      لا توجد محاولات لهذا الامتحان بعد
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                        <div className="flex items-center gap-3">
                          <Users className="w-8 h-8 text-blue-600" />
                          <div>
                            <p className="text-sm text-gray-600 font-[Almarai]">عدد المحاولات</p>
                            <p className="text-2xl font-bold text-blue-600 font-[Almarai]">{examAttempts.length}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="w-8 h-8 text-green-600" />
                          <div>
                            <p className="text-sm text-gray-600 font-[Almarai]">أعلى درجة</p>
                            <p className="text-2xl font-bold text-green-600 font-[Almarai]">
                              {Math.max(...examAttempts.map(a => a.percentage || 0)).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="w-8 h-8 text-purple-600" />
                          <div>
                            <p className="text-sm text-gray-600 font-[Almarai]">المتوسط</p>
                            <p className="text-2xl font-bold text-purple-600 font-[Almarai]">
                              {(examAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / examAttempts.length).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-4 py-3 text-right text-sm font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                              اسم الطالب
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                              الدرجة
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                              النسبة المئوية
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                              الحالة
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                              تاريخ التسليم
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {examAttempts.map((attempt, idx) => (
                            <tr key={attempt.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-4 py-3 text-right font-[Almarai]" style={{ color: TEXT_COLOR }}>
                                {attempt.student_name || 'غير معروف'}
                              </td>
                              <td className="px-4 py-3 text-center font-bold font-[Almarai]" style={{ color: TEXT_COLOR }}>
                                {attempt.score || 0} / {selectedExam.total_marks}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-3 py-1 rounded-full text-sm font-bold font-[Almarai] ${(attempt.percentage || 0) >= ((selectedExam.pass_marks / selectedExam.total_marks) * 100)
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                                  }`}>
                                  {(attempt.percentage || 0).toFixed(1)}%
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {(attempt.percentage || 0) >= ((selectedExam.pass_marks / selectedExam.total_marks) * 100) ? (
                                  <span className="flex items-center justify-center gap-1 text-green-600 text-sm font-bold font-[Almarai]">
                                    <CheckCircle className="w-4 h-4" />
                                    ناجح
                                  </span>
                                ) : (
                                  <span className="flex items-center justify-center gap-1 text-red-600 text-sm font-bold font-[Almarai]">
                                    <XCircle className="w-4 h-4" />
                                    راسب
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center text-sm font-[Almarai]" style={{ color: TEXT_COLOR }}>
                                {attempt.submitted_at
                                  ? new Date(attempt.submitted_at).toLocaleString('ar-EG', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                  : '-'
                                }
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>

              <div className="p-6 bg-gray-50 border-t">
                <button
                  onClick={() => {
                    setShowResultsModal(false);
                    setSelectedExam(null);
                    setExamAttempts([]);
                  }}
                  className="w-full px-6 py-3 bg-[#665446] hover:bg-[#8B7355] text-white rounded-lg font-bold font-[Almarai] transition-all"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AnimatedBackground>
  );
};

export default TeacherExams;