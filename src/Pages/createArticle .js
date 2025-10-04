import React, { useState, useEffect } from "react";
import { supabase } from "../Utilities/supabaseClient";
import {
  Heart,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  User,
  Calendar,
  MessageSquare,
  Copy,
} from "lucide-react";
import { Link } from "react-router-dom";

const ArticlesManagement = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [articleForm, setArticleForm] = useState({
    title: "",
    content: "",
    status: "مفتوح",
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkUserAuth();
  }, []);

  useEffect(() => {
    if (!loading && currentUser) {
      fetchArticles();
    }
  }, [currentUser, loading]);

  const checkUserAuth = async () => {
    try {
      setLoading(true);
      const { data: getUserData, error: getUserError } =
        await supabase.auth.getUser();

      if (getUserError) {
        console.error("خطأ في التحقق من المستخدم:", getUserError);
        setCurrentUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const user = getUserData?.user;

      if (!user) {
        console.log("لا يوجد مستخدم مسجل");
        setCurrentUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      let { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("*")
        .eq("auth_id", user.id)
        .maybeSingle();

      if (studentData && !studentError) {
        const userData = {
          id: studentData.id,
          name: `${studentData.first_name || ""} ${
            studentData.last_name || ""
          }`.trim(),
          email: studentData.email,
          role: studentData.role || "student",
          auth_id: user.id,
          user_type: "student",
        };
        setCurrentUser(userData);
        setIsAdmin(studentData.role === "admin");
        setLoading(false);
        return;
      }

      let { data: teacherData, error: teacherError } = await supabase
        .from("teachers")
        .select("*")
        .eq("auth_id", user.id)
        .maybeSingle();

      if (teacherData && !teacherError) {
        const userData = {
          id: teacherData.id,
          name: `${teacherData.first_name || ""} ${
            teacherData.last_name || ""
          }`.trim(),
          email: teacherData.email,
          role: teacherData.role || "teacher",
          auth_id: user.id,
          user_type: "teacher",
        };
        setCurrentUser(userData);
        setIsAdmin(
          teacherData.role === "admin" || teacherData.role === "teacher"
        );
        setLoading(false);
        return;
      }

      console.log("المستخدم غير موجود في قاعدة البيانات");
      setCurrentUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error("خطأ في جلب بيانات المستخدم:", error);
      setCurrentUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("خطأ في جلب المقالات:", error);
        setError("حدث خطأ أثناء جلب المقالات");
        return;
      }

      if (!data || data.length === 0) {
        setArticles([]);
        return;
      }

      const articlesWithDetails = await Promise.all(
        data.map(async (article) => {
          const { data: likesData } = await supabase
            .from("likes")
            .select("id")
            .eq("article_id", article.id);

          let userLiked = false;
          if (currentUser) {
            const { data: userLikeData } = await supabase
              .from("likes")
              .select("id")
              .eq("article_id", article.id)
              .eq("student_id", currentUser.id)
              .maybeSingle();

            userLiked = !!userLikeData;
          }

          let authorName = "غير معروف";
          let authorType = "unknown";

          if (article.author_id) {
            const { data: teacherData } = await supabase
              .from("teachers")
              .select("first_name, last_name")
              .eq("id", article.author_id)
              .maybeSingle();

            if (teacherData) {
              authorName = `${teacherData.first_name || ""} ${
                teacherData.last_name || ""
              }`.trim();
              authorType = "teacher";
            } else {
              const { data: studentData } = await supabase
                .from("students")
                .select("first_name, last_name")
                .eq("id", article.author_id)
                .maybeSingle();

              if (studentData) {
                authorName = `${studentData.first_name || ""} ${
                  studentData.last_name || ""
                }`.trim();
                authorType = "student";
              }
            }
          }

          return {
            ...article,
            likes_count: likesData?.length || 0,
            user_liked: userLiked,
            author_name: authorName,
            author_type: authorType,
          };
        })
      );

      setArticles(articlesWithDetails);
      setError(null);
    } catch (error) {
      console.error("خطأ غير متوقع:", error);
      setError("حدث خطأ غير متوقع في جلب المقالات");
    }
  };

  const createArticle = async () => {
    if (!articleForm.title.trim() || !articleForm.content.trim()) {
      alert("يرجى ملء جميع الحقول");
      return;
    }

    if (!isAdmin) {
      alert("لا تملك صلاحية إنشاء المقالات");
      return;
    }

    try {
      const articleData = {
        title: articleForm.title,
        content: articleForm.content,
        status: articleForm.status,
        author_id: currentUser.id,
      };

      const { data, error } = await supabase
        .from("articles")
        .insert([articleData])
        .select();

      if (error) {
        console.error("خطأ في إضافة المقال:", error);
        alert("خطأ في إضافة المقال");
      } else {
        const newArticle = {
          ...data[0],
          likes_count: 0,
          user_liked: false,
          author_name: currentUser.name,
          author_type: currentUser.user_type,
        };
        setArticles((prev) => [newArticle, ...prev]);
        setArticleForm({ title: "", content: "", status: "مفتوح" });
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error("خطأ غير متوقع في إنشاء المقال:", error);
      alert("حدث خطأ غير متوقع");
    }
  };

  const updateArticle = async () => {
    if (!isAdmin) {
      alert("لا تملك صلاحية تعديل المقالات");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("articles")
        .update({
          title: articleForm.title,
          content: articleForm.content,
          status: articleForm.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingArticle.id)
        .select();

      if (error) {
        console.error("خطأ في تحديث المقال:", error);
        alert("خطأ في تحديث المقال");
      } else {
        setArticles((prev) =>
          prev.map((article) =>
            article.id === editingArticle.id
              ? {
                  ...data[0],
                  likes_count: article.likes_count,
                  user_liked: article.user_liked,
                }
              : article
          )
        );
        setEditingArticle(null);
        setArticleForm({ title: "", content: "", status: "مفتوح" });
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error("خطأ غير متوقع في تحديث المقال:", error);
      alert("حدث خطأ غير متوقع");
    }
  };

  const deleteArticle = async (articleId) => {
    if (!isAdmin) {
      alert("لا تملك صلاحية حذف المقالات");
      return;
    }

    if (!window.confirm("هل أنت متأكد من حذف هذا المقال؟")) return;

    try {
      await supabase.from("likes").delete().eq("article_id", articleId);

      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", articleId);

      if (error) {
        console.error("خطأ في حذف المقال:", error);
        alert("خطأ في حذف المقال");
      } else {
        setArticles((prev) => prev.filter((a) => a.id !== articleId));
      }
    } catch (error) {
      console.error("خطأ غير متوقع في حذف المقال:", error);
      alert("حدث خطأ غير متوقع");
    }
  };

  const startEdit = (article) => {
    if (!isAdmin) {
      alert("لا تملك صلاحية تعديل المقالات");
      return;
    }
    setEditingArticle(article);
    setArticleForm({
      title: article.title,
      content: article.content,
      status: article.status,
    });
    setShowCreateForm(true);
  };

  const handleLike = async (articleId) => {
    if (!currentUser) {
      alert("يجب تسجيل الدخول للإعجاب بالمقالات");
      return;
    }

    try {
      const article = articles.find((a) => a.id === articleId);

      if (article.user_liked) {
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("article_id", articleId)
          .eq("student_id", currentUser.id);

        if (!error) {
          setArticles((prev) =>
            prev.map((a) =>
              a.id === articleId
                ? { ...a, likes_count: a.likes_count - 1, user_liked: false }
                : a
            )
          );
        }
      } else {
        const { error } = await supabase
          .from("likes")
          .insert([{ article_id: articleId, student_id: currentUser.id }]);

        if (!error) {
          setArticles((prev) =>
            prev.map((a) =>
              a.id === articleId
                ? { ...a, likes_count: a.likes_count + 1, user_liked: true }
                : a
            )
          );
        }
      }
    } catch (error) {
      console.error("خطأ في الإعجاب:", error);
      alert("حدث خطأ في الإعجاب");
    }
  };

  const toggleArticleStatus = async (articleId) => {
    if (!isAdmin) {
      alert("لا تملك صلاحية تغيير حالة المقال");
      return;
    }

    try {
      const article = articles.find((a) => a.id === articleId);
      const newStatus = article.status === "مفتوح" ? "مغلق" : "مفتوح";

      const { error } = await supabase
        .from("articles")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", articleId)
        .select();

      if (!error) {
        setArticles((prev) =>
          prev.map((a) =>
            a.id === articleId ? { ...a, status: newStatus } : a
          )
        );
      } else {
        console.error("خطأ في تغيير حالة المقال:", error);
        alert("خطأ في تغيير حالة المقال");
      }
    } catch (error) {
      console.error("خطأ غير متوقع:", error);
      alert("حدث خطأ غير متوقع");
    }
  };

  const filteredArticles =
    activeTab === "my-articles" && currentUser
      ? articles.filter((a) => a.author_id === currentUser.id)
      : articles;

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#FFF9EF" }}
      >
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: "#665446" }}
        ></div>
      </div>
    );
  }

  if (!currentUser && !loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#FFF9EF" }}
      >
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
          <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-4" style={{ color: "#665446" }}>
            تسجيل الدخول مطلوب
          </h2>
          <p className="text-gray-600 mb-6">
            يجب تسجيل الدخول أولاً لتتمكن من مشاهدة محتوى الصفحة
          </p>
          <Link
            to="/login"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 inline-block"
          >
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#FFF9EF" }}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">خطأ</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const ArticleCard = ({ article }) => {
    const [expanded, setExpanded] = useState(false);
    const [copied, setCopied] = useState(false);

    const contentText = article.content || "";
    const truncated =
      contentText.length > 150
        ? `${contentText.substring(0, 150)}...`
        : contentText;

    const handleCopy = async (text) => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          const textarea = document.createElement("textarea");
          textarea.value = text;
          textarea.setAttribute("readonly", "");
          textarea.style.position = "absolute";
          textarea.style.left = "-9999px";
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("نسخ النص فشل:", err);
        alert("تعذر نسخ النص");
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2" style={{ color: "#665446" }}>
              {article.title}
            </h3>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <User className="h-4 w-4 mr-1" />
              <span className="ml-2">
                {article.author_name}
                {article.author_type === "student" && (
                  <span className="text-blue-600 text-xs mr-1">(أدمن)</span>
                )}
                {article.author_type === "teacher" && (
                  <span className="text-green-600 text-xs mr-1">(معلم)</span>
                )}
              </span>
              <Calendar className="h-4 w-4 mr-1 ml-4" />
              <span className="ml-2">
                {new Date(article.created_at).toLocaleDateString("ar-EG")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                article.status === "مفتوح"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {article.status}
            </span>
          </div>
        </div>

        <p className="text-gray-600 mb-4">
          {expanded ? contentText : truncated}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleLike(article.id)}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors duration-200 ${
                article.user_liked
                  ? "bg-red-100 text-red-600"
                  : "bg-gray-100 text-gray-600 hover:bg-red-50"
              }`}
            >
              <Heart
                className={`h-4 w-4 ${
                  article.user_liked ? "fill-current" : ""
                }`}
              />
              <span>{article.likes_count}</span>
            </button>

            {contentText.length > 150 && (
              <button
                onClick={() => setExpanded((prev) => !prev)}
                className="px-3 py-1 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-sm transition-colors duration-150"
              >
                {expanded ? "عرض أقل" : "عرض المزيد"}
              </button>
            )}

            <button
              onClick={() => handleCopy(contentText)}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg border text-sm transition-all duration-300 
                ${copied 
                  ? "bg-green-100 border-green-400 text-green-700 shadow-[0_0_10px_rgba(34,197,94,0.7)]" 
                  : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                }`}
              title="نسخ النص"
            >
              <Copy className="h-4 w-4" />
              <span>{copied ? "تم النسخ" : "نسخ النص"}</span>
            </button>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => startEdit(article)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                title="تحرير"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => toggleArticleStatus(article.id)}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  article.status === "مفتوح"
                    ? "text-orange-600 hover:bg-orange-50"
                    : "text-green-600 hover:bg-green-50"
                }`}
                title={article.status === "مفتوح" ? "إغلاق" : "فتح"}
              >
                {article.status === "مفتوح" ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => deleteArticle(article.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                title="حذف"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-[#FFF9EF]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: "#665446" }}>
            إدارة المقالات
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {isAdmin ? "إنشاء ومشاركة المقالات التعليمية" : "مشاركة المقالات التعليمية"}
          </p>
        </div>

        {isAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">إجمالي المقالات</p>
                <p className="text-xl sm:text-2xl font-bold" style={{ color: "#665446" }}>{articles.length}</p>
              </div>
              <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-[#665446]" />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">المقالات المفتوحة</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{articles.filter(a => a.status === "مفتوح").length}</p>
              </div>
              <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">إجمالي الإعجابات</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">{articles.reduce((sum, a) => sum + (a.likes_count || 0), 0)}</p>
              </div>
              <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">مقالاتي</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">
                  {articles.filter(a => a.author_id === currentUser?.id).length}
                </p>
              </div>
              <User className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-2 rounded-lg transition-colors duration-200 text-sm sm:text-base ${
                activeTab === "all" ? "bg-white text-gray-800 shadow-md" : "text-gray-600 hover:bg-white hover:bg-opacity-50"
              }`}
            >
              جميع المقالات
            </button>
            <button
              onClick={() => setActiveTab("my-articles")}
              className={`px-3 py-2 rounded-lg transition-colors duration-200 text-sm sm:text-base ${
                activeTab === "my-articles" ? "bg-white text-gray-800 shadow-md" : "text-gray-600 hover:bg-white hover:bg-opacity-50"
              }`}
            >
              مقالاتي
            </button>
          </div>

          {isAdmin && (
            <div className="flex-shrink-0">
              <button
                onClick={() => {
                  setShowCreateForm(true);
                  setEditingArticle(null);
                  setArticleForm({ title: "", content: "", status: "مفتوح" });
                }}
                className="w-full sm:w-auto flex items-center gap-2 px-3 py-2 bg-white text-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-sm sm:text-base"
              >
                <Plus className="h-4 w-4" />
                إنشاء مقال جديد
              </button>
            </div>
          )}
        </div>

        {showCreateForm && isAdmin && (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
            <h2 className="text-lg sm:text-2xl font-bold mb-4" style={{ color: "#665446" }}>
              {editingArticle ? "تحرير المقال" : "إنشاء مقال جديد"}
            </h2>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">عنوان المقال</label>
                <input
                  type="text"
                  value={articleForm.title}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل عنوان المقال"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">محتوى المقال</label>
                <textarea
                  value={articleForm.content}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, content: e.target.value }))}
                  rows="8"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  placeholder="اكتب محتوى المقال هنا..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">حالة المقال</label>
                <select
                  value={articleForm.status}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="مفتوح">مفتوح</option>
                  <option value="مغلق">مغلق</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={editingArticle ? updateArticle : createArticle}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  {editingArticle ? "تحديث المقال" : "نشر المقال"}
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingArticle(null);
                    setArticleForm({ title: "", content: "", status: "مفتوح" });
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors duration-200"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {activeTab === "my-articles" ? "لا توجد مقالات" : "لا يوجد مقالات حتى الآن"}
              </h3>
              <p className="text-gray-500">
                {activeTab === "my-articles" ? "لم تنشر أي مقال بعد." : "لم يتم نشر أي مقالات حتى الآن."}
              </p>
            </div>
          ) : (
            filteredArticles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticlesManagement;