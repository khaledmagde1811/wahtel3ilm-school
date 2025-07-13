const AddLesson = ({ courses }) => {
    const [courseId, setCourseId] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [youtubeLink, setYoutubeLink] = useState('');
    const [loading, setLoading] = useState(false);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
  
      try {
        const { data, error } = await supabase
          .from('lessons')
          .insert([{ title, description, course_id: courseId, youtube_link: youtubeLink }]);
  
        if (error) throw error;
  
        setTitle('');
        setDescription('');
        setCourseId('');
        setYoutubeLink('');
      } catch (error) {
        console.error("Error adding lesson:", error);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="my-6 p-6 bg-white rounded-lg shadow-lg">
        <h3 className="text-2xl font-bold mb-4 text-[#665446]">إضافة محاضرة جديدة</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#665446]"
              required
            >
              <option value="">اختر الدورة</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="text"
              placeholder="عنوان المحاضرة"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#665446]"
              required
            />
          </div>
          <div>
            <textarea
              placeholder="وصف المحاضرة"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#665446]"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="رابط فيديو يوتيوب"
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#665446]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 bg-[#665446] text-white font-semibold rounded-md ${loading ? 'opacity-50' : 'hover:bg-[#4e4231]'}`}
          >
            {loading ? 'جاري إضافة المحاضرة...' : 'إضافة المحاضرة'}
          </button>
        </form>
      </div>
    );
  };
  