const CoursesList = ({ levels }) => {
    const [courses, setCourses] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState('');
  
    useEffect(() => {
      const fetchCourses = async () => {
        if (!selectedLevel) return; // إذا لم يتم اختيار مستوى، لا نعرض الدورات
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('level_id', selectedLevel);
  
        if (error) {
          console.error('Error fetching courses:', error);
        } else {
          setCourses(data);
        }
      };
  
      fetchCourses();
    }, [selectedLevel]);
  
    return (
      <div>
        <h3 className="text-2xl font-bold mb-4 text-[#665446]">الدورات حسب المستوى</h3>
        <select
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#665446]"
        >
          <option value="">اختر مستوى</option>
          {levels.map((level) => (
            <option key={level.id} value={level.id}>
              {level.name}
            </option>
          ))}
        </select>
  
        {courses.length > 0 ? (
          <ul className="mt-6">
            {courses.map((course) => (
              <li key={course.id} className="my-4">
                <h4 className="text-xl font-semibold text-[#665446]">{course.name}</h4>
                <p>{course.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>لا توجد دورات لهذا المستوى.</p>
        )}
      </div>
    );
  };
  