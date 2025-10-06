    import { useState } from 'react';
    import { Heart, Edit, Trash2, Eye, EyeOff, User, Calendar, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

    const ArticleCard = ({ article, isAdmin, handleLike, startEdit, toggleArticleStatus, deleteArticle }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    // تحديد طول النص المقطوع
    const PREVIEW_LENGTH = 150;
    const shouldShowReadMore = article.content.length > PREVIEW_LENGTH;

    // دالة نسخ النص
    const copyToClipboard = async () => {
        try {
        await navigator.clipboard.writeText(article.content);
        setIsCopied(true);
        // إخفاء رسالة النجاح بعد ثانيتين
        setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
        console.error('فشل في نسخ النص:', err);
        // طريقة بديلة للنسخ إذا فشلت الطريقة الحديثة
        const textArea = document.createElement('textarea');
        textArea.value = article.content;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
        <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
            <h3 className="text-xl font-bold mb-2" style={{ color: '#665446' }}>
                {article.title}
            </h3>
            <div className="flex items-center text-sm text-gray-500 mb-2">
                <User className="h-4 w-4 mr-1" />
                <span className="ml-2">
                {article.author_name}
                {article.author_type === 'student' && (
                    <span className="text-blue-600 text-xs mr-1">(أدمن)</span>
                )}
                {article.author_type === 'teacher' && (
                    <span className="text-green-600 text-xs mr-1">(معلم)</span>
                )}
                </span>
                <Calendar className="h-4 w-4 mr-1 ml-4" />
                <span className="ml-2">{new Date(article.created_at).toLocaleDateString('ar-EG')}</span>
            </div>
            </div>
            <div className="flex items-center gap-2">
            <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                article.status === 'مفتوح'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
            >
                {article.status}
            </span>
            </div>
        </div>

        {/* محتوى المقال مع إمكانية التوسيع */}
        <div className="mb-4">
           <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
  {isExpanded || !shouldShowReadMore
    ? article.content
    : `${article.content.substring(0, PREVIEW_LENGTH)}...`}
</p>

            
            {/* زر عرض المزيد/عرض أقل */}
            {shouldShowReadMore && (
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 mt-2 text-blue-600 hover:text-blue-800 transition-colors duration-200 text-sm font-medium"
            >
                {isExpanded ? (
                <>
                    <span>عرض أقل</span>
                    <ChevronUp className="h-4 w-4" />
                </>
                ) : (
                <>
                    <span>عرض المزيد</span>
                    <ChevronDown className="h-4 w-4" />
                </>
                )}
            </button>
            )}
        </div>

        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
            {/* زر الإعجاب */}
            <button
                onClick={() => handleLike(article.id)}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors duration-200 ${
                article.user_liked
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                }`}
            >
<Heart className={`h-4 w-4 ${article.user_liked ? 'fill-current' : ''}`} />
                <span>{article.likes_count}</span>
            </button>
            
            {/* زر نسخ النص */}
            <button
                onClick={copyToClipboard}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-all duration-200 ${
                isCopied 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
                title="نسخ النص"
            >
                {isCopied ? (
                <>
                    <Check className="h-4 w-4" />
                    <span className="text-sm">تم النسخ</span>
                </>
                ) : (
                <>
                    <Copy className="h-4 w-4" />
                    <span className="text-sm">نسخ</span>
                </>
                )}
            </button>
            </div>

            {/* أزرار التحكم تظهر للأدمن فقط */}
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
                    article.status === 'مفتوح'
                    ? 'text-orange-600 hover:bg-orange-50'
                    : 'text-green-600 hover:bg-green-50'
                }`}
                title={article.status === 'مفتوح' ? 'إغلاق' : 'فتح'}
                >
                {article.status === 'مفتوح' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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

    export default ArticleCard;
