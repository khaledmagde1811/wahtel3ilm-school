import React, { useEffect, useMemo, useState } from 'react';
import { Users, BookOpen, GraduationCap, BarChart3, Search, RefreshCw, Download } from 'lucide-react';
import { supabase } from '../../Utilities/supabaseClient';
import StudentWrongAnswersDisplay from './StudentWrongAnswersDisplay';

/**
 * DatabaseStatistics (Enhanced)
 * - إجماليات مختصرة
 * - فلترة حسب المستوى والكورس
 * - تفاعل الدروس (open_students + open_times + unique_users) مع Views إن وجدت + Fallback
 * - Real-time تحديث تلقائي
 * - بحث Debounced + حد أقصى للعرض + تصدير CSV
 * - رسم بياني Top 5 (بدون مكتبات)
 * - ثيم Amber/Brownish/Yellow/Orange
 */

const PALETTE = {
  amberA: '#FFBF00',
  amberB: '#FFC107',
  yellow: '#FFD54F',
  orange: '#FB8C00',
  brown: '#665446',
  brownSoft: '#8B7355',
  grayBorder: '#F3E6D4',
};

const DatabaseStatistics = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalLessons: 0,
  });

  // دروس + تفاعل
  const [lessonRows, setLessonRows] = useState([]); // [{id,title,openStudents,openTimes,uniqueUsers, course_id?, level_id?}]
  const [loading, setLoading] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [err, setErr] = useState(null);

  // فلترة/بحث/عرض
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(15);
  const debouncedQ = useDebouncedValue(q, 250);

  // فلترة إضافية: المستوى والكورس
  const [levels, setLevels] = useState([]);     // [{id,name}]
  const [courses, setCourses] = useState([]);   // [{id,name,level_id}]
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');

  // --- تحميل الإجماليات ---
  const loadTotals = async () => {
    try {
      setErr(null);
      const [students, teachers, coursesQ, lessons] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('teachers').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('lessons').select('id', { count: 'exact', head: true }),
      ]);
      if (students.error) throw students.error;
      if (teachers.error) throw teachers.error;
      if (coursesQ.error) throw coursesQ.error;
      if (lessons.error) throw lessons.error;

      setStats({
        totalStudents: students.count || 0,
        totalTeachers: teachers.count || 0,
        totalCourses: coursesQ.count || 0,
        totalLessons: lessons.count || 0,
      });
    } catch (e) {
      console.error('Totals error:', e);
      setErr('تعذّر تحميل الإجماليات.');
    }
  };

  // --- تحميل القوائم (Levels/Courses) ---
  const loadTaxonomies = async () => {
    try {
      const [{ data: lv, error: lvErr }, { data: cs, error: csErr }] = await Promise.all([
        supabase.from('levels').select('id,name'),
        supabase.from('courses').select('id,name,level_id'),
      ]);
      if (lvErr) throw lvErr;
      if (csErr) throw csErr;
      setLevels(lv || []);
      setCourses(cs || []);
    } catch (e) {
      console.error('Taxonomies error:', e);
      // مش مانع رئيسي؛ نكمّل بدون فلترة هرمية
    }
  };

  // --- تحميل تفاعل الدروس (View أولًا، مع Fallback) ---
  const loadLessonEngagement = async () => {
    setLoadingLessons(true);
    try {
      setErr(null);

      // 1) حاول تجيب من الفيوز مباشرة (تشمل العنوان + open_students + views)
      const { data: viewData, error: viewErr } = await supabase
        .from('lesson_open_summary')
        .select(`
          lesson_id,
          title,
          open_students,
          lesson_views_summary!left(open_times, unique_users)
        `)
        .order('open_students', { ascending: false })
        .range(0, 999);

      if (!viewErr && Array.isArray(viewData)) {
        // محتاجين course_id و level_id للفلاتر --> نجيبهم من lessons/courses
        const { data: lessonsMeta, error: lessonsErr } = await supabase
          .from('lessons')
          .select('id, course_id');
        if (lessonsErr) throw lessonsErr;

        const { data: coursesMeta, error: coursesErr } = await supabase
          .from('courses')
          .select('id, level_id');
        if (coursesErr) throw coursesErr;

        const courseToLevel = new Map(coursesMeta?.map(c => [c.id, c.level_id]) || []);
        const lessonToCourse = new Map(lessonsMeta?.map(l => [l.id, l.course_id]) || []);

        const rows = (viewData || []).map((r) => {
          const course_id = lessonToCourse.get(r.lesson_id) ?? null;
          const level_id  = (course_id != null ? courseToLevel.get(course_id) : null) ?? null;
          return {
            id: r.lesson_id,
            title: r.title,
            openStudents: r.open_students ?? 0,
            openTimes: r.lesson_views_summary?.open_times ?? null,
            uniqueUsers: r.lesson_views_summary?.unique_users ?? null,
            course_id,
            level_id,
          };
        });

        setLessonRows(rows);
        setLoadingLessons(false);
        return;
      }

      // 2) Fallback: نجلب من الجداول ونُجمّع في الواجهة
      const [{ data: lessonsData, error: lessonsErr }, { data: sla, error: slaErr }] = await Promise.all([
        supabase.from('lessons').select('id,title,course_id'),
        supabase.from('student_lesson_access').select('lesson_id,is_open'),
      ]);
      if (lessonsErr) throw lessonsErr;
      if (slaErr) throw slaErr;

      // جرّب lesson_views: لو خطأ، تجاهله
      let views = [];
      const { data: lv, error: lvErr } = await supabase
        .from('lesson_views')
        .select('lesson_id,student_id');
      if (!lvErr && Array.isArray(lv)) views = lv;

      // جلب level_id عبر الكورسات
      const { data: coursesMeta, error: cErr } = await supabase
        .from('courses')
        .select('id, level_id');
      if (cErr) throw cErr;
      const courseToLevel = new Map(coursesMeta?.map(c => [c.id, c.level_id]) || []);

      const openMap = new Map(); // lesson_id -> open_students
      sla?.forEach((r) => {
        if (r.is_open) {
          openMap.set(r.lesson_id, (openMap.get(r.lesson_id) || 0) + 1);
        }
      });

      const viewsTotal = new Map(); // lesson_id -> open_times
      const viewsUnique = new Map(); // lesson_id -> Set(student_id)
      views.forEach((v) => {
        viewsTotal.set(v.lesson_id, (viewsTotal.get(v.lesson_id) || 0) + 1);
        if (!viewsUnique.has(v.lesson_id)) viewsUnique.set(v.lesson_id, new Set());
        if (v.student_id) viewsUnique.get(v.lesson_id).add(v.student_id);
      });

      const rows = (lessonsData || []).map((l) => {
        const level_id = courseToLevel.get(l.course_id) ?? null;
        return {
          id: l.id,
          title: l.title,
          openStudents: openMap.get(l.id) || 0,
          openTimes: views.length ? viewsTotal.get(l.id) || 0 : null,
          uniqueUsers: views.length ? (viewsUnique.get(l.id)?.size || 0) : null,
          course_id: l.course_id ?? null,
          level_id,
        };
      });

      rows.sort((a, b) => {
        if (b.openStudents !== a.openStudents) return b.openStudents - a.openStudents;
        return (b.openTimes || 0) - (a.openTimes || 0);
      });

      setLessonRows(rows);
    } catch (e) {
      console.error('Lessons error:', e);
      setErr((prev) => prev || 'تعذّر تحميل تفاعل الدروس.');
    } finally {
      setLoadingLessons(false);
    }
  };

  // مُحمّل أولي
  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadTotals(), loadTaxonomies(), loadLessonEngagement()]);
      setLoading(false);
    })();
  }, []);

  // Real-time: تحديث تلقائي عند تغيّر الجداول
  useEffect(() => {
    const ch = supabase
      .channel('stats-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_lesson_access' }, () => {
        loadLessonEngagement();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lesson_views' }, () => {
        loadLessonEngagement();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  // تطبيق الفلاتر + البحث + الحد
  const filteredLessons = useMemo(() => {
    let list = lessonRows;

    if (selectedLevel !== 'all') {
      const levelId = Number(selectedLevel);
      list = list.filter(r => r.level_id === levelId);
    }
    if (selectedCourse !== 'all') {
      const courseId = Number(selectedCourse);
      list = list.filter(r => r.course_id === courseId);
    }

    const needle = debouncedQ.trim().toLowerCase();
    if (needle) {
      list = list.filter(
        (r) => r.title.toLowerCase().includes(needle) || String(r.id).includes(needle)
      );
    }

    return list.slice(0, limit);
  }, [lessonRows, selectedLevel, selectedCourse, debouncedQ, limit]);

  // Top 5 (من كل البيانات بعد الفلاتر الهرمية فقط؛ بدون حد/بحث)
  const top5 = useMemo(() => {
    let list = lessonRows;
    if (selectedLevel !== 'all') {
      const levelId = Number(selectedLevel);
      list = list.filter(r => r.level_id === levelId);
    }
    if (selectedCourse !== 'all') {
      const courseId = Number(selectedCourse);
      list = list.filter(r => r.course_id === courseId);
    }
    const sorted = [...list].sort((a, b) => {
      if (b.openStudents !== a.openStudents) return b.openStudents - a.openStudents;
      return (b.openTimes || 0) - (a.openTimes || 0);
    });
    return sorted.slice(0, 5);
  }, [lessonRows, selectedLevel, selectedCourse]);

  // UI
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFF9EF' }}>
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: PALETTE.brown }} />
          <span className="text-lg" style={{ color: PALETTE.brown }}>جاري تحميل البيانات…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#FFF9EF' }}>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* رأس + تحديث */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold" style={{ color: PALETTE.brown }}>لوحة الإحصائيات</h1>
            <p className="text-sm md:text-base" style={{ color: PALETTE.brownSoft }}>
              إجماليات + فلترة المستويات/الكورسات + تفاعل الدروس + Top 5 + تصدير CSV
            </p>
          </div>
          <button
            onClick={() => { loadTotals(); loadLessonEngagement(); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 transition"
            style={{ borderColor: '#eee', color: PALETTE.brown }}
            title="تحديث يدوي"
          >
            <RefreshCw className="w-4 h-4" />
            تحديث
          </button>
        </header>

        {/* كروت إجماليات */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="الطلاب" value={stats.totalStudents} color={PALETTE.brown} icon={Users} />
          <StatCard title="المعلمين" value={stats.totalTeachers} color={PALETTE.orange} icon={GraduationCap} />
          <StatCard title="الكورسات" value={stats.totalCourses} color={PALETTE.amberB} icon={BookOpen} />
          <StatCard title="الدروس" value={stats.totalLessons} color={PALETTE.yellow} icon={BarChart3} />
        </section>

        {/* فلاتر المستوى/الكورس + بحث + حد */}
        <section className="bg-white rounded-xl border p-4" style={{ borderColor: PALETTE.grayBorder }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs mb-1" style={{ color: PALETTE.brownSoft }}>المستوى</label>
              <select
                value={selectedLevel}
                onChange={(e) => { setSelectedLevel(e.target.value); setSelectedCourse('all'); }}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                style={{ borderColor: '#F0E0C8', color: PALETTE.brown }}
              >
                <option value="all">الكل</option>
                {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs mb-1" style={{ color: PALETTE.brownSoft }}>الكورس</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                style={{ borderColor: '#F0E0C8', color: PALETTE.brown }}
              >
                <option value="all">الكل</option>
                {courses
                  .filter(c => selectedLevel === 'all' || c.level_id === Number(selectedLevel))
                  .map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white"
                 style={{ borderColor: '#F0E0C8' }}>
              <Search className="w-4 h-4" style={{ color: PALETTE.orange }} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ابحث باسم الدرس أو رقمه…"
                className="w-full outline-none text-sm bg-transparent"
                style={{ color: PALETTE.brown }}
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <label className="text-xs" style={{ color: PALETTE.brownSoft }}>صفوف:</label>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="border rounded px-2 py-1 text-sm"
                  style={{ borderColor: '#F0E0C8', color: PALETTE.brown }}
                >
                  {[10, 15, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              <button
                onClick={() => downloadCSV(filteredLessons, 'lessons_engagement.csv')}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 transition"
                style={{ borderColor: '#eee', color: PALETTE.orange }}
                title="تصدير CSV للعرض الحالي"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
            </div>
          </div>
        </section>

        {/* Top 5 Chart */}
        <section className="bg-white rounded-xl border p-4" style={{ borderColor: PALETTE.grayBorder }}>
          <h2 className="text-lg md:text-xl font-bold mb-4" style={{ color: PALETTE.brown }}>
            أعلى 5 دروس تفاعلًا
          </h2>

          {top5.length === 0 ? (
            <p className="text-sm" style={{ color: PALETTE.brownSoft }}>لا توجد بيانات متاحة للرسم.</p>
          ) : (
            <div className="space-y-3">
              {top5.map((item, idx) => {
                const max = top5[0].openStudents || 1;
                const width = Math.max(6, Math.round((item.openStudents / max) * 100)); // %
                return (
                  <div key={item.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold truncate pr-2" style={{ color: PALETTE.brown }}>
                        {idx + 1}. {item.title}
                      </div>
                      <div className="text-xs" style={{ color: PALETTE.brownSoft }}>
                        طلاب فُتح لهم: <b style={{ color: PALETTE.orange }}>{item.openStudents}</b>
                      </div>
                    </div>
                    <div className="w-full bg-amber-50 rounded-full h-3 border" style={{ borderColor: '#F9F1E4' }}>
                      <div
                        className="h-3 rounded-full"
                        style={{
                          width: `${width}%`,
                          background: `linear-gradient(90deg, ${PALETTE.amberA}, ${PALETTE.orange})`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* جدول تفاعل الدروس */}
        <section className="bg-white rounded-xl border p-4 md:p-6" style={{ borderColor: PALETTE.grayBorder }}>
          <h2 className="text-xl md:text-2xl font-bold mb-4" style={{ color: PALETTE.brown }}>تفاعل الدروس</h2>

          {loadingLessons ? (
            <div className="py-10 text-center" style={{ color: PALETTE.brownSoft }}>
              جاري تحميل تفاعل الدروس…
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-amber-50">
                    <Th>الدرس</Th>
                    <Th>طلاب فُتح لهم</Th>
                    <Th>مرات الفتح</Th>
                    <Th>طلاب مميزون (views)</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLessons.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-6" style={{ color: PALETTE.brownSoft }}>
                        لا توجد بيانات مطابقة.
                      </td>
                    </tr>
                  ) : (
                    filteredLessons.map((r) => (
                      <tr key={r.id} className="odd:bg-white even:bg-amber-50/30">
                        <Td>
                          <div className="font-semibold" style={{ color: PALETTE.brown }}>
                            {r.title}
                          </div>
                          <div className="text-xs" style={{ color: PALETTE.brownSoft }}>#{r.id}</div>
                        </Td>
                        <Td><StrongNumber>{r.openStudents}</StrongNumber></Td>
                        <Td>{r.openTimes != null ? <StrongNumber>{r.openTimes}</StrongNumber> : <Dash />}</Td>
                        <Td>{r.uniqueUsers != null ? <StrongNumber>{r.uniqueUsers}</StrongNumber> : <Dash />}</Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* فوتر */}
        <div className="text-right text-xs" style={{ color: PALETTE.brownSoft }}>
          آخر تحديث: {new Date().toLocaleString('ar-EG')}
        </div>

        {err && (
          <div className="text-center text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            {err}
          </div>
        )}
      </div>
      <StudentWrongAnswersDisplay/>
    </div>
  );
};

export default DatabaseStatistics;

/* ----------------- UI Helpers ----------------- */

const StatCard = ({ title, value, icon: Icon, color = '#665446' }) => (
  <div className="bg-white rounded-lg shadow-sm p-4 border" style={{ borderColor: '#F3E6D4' }}>
    <div className="flex items-center justify-between">
      <div>
        <div className="text-xs" style={{ color: '#8B7355' }}>{title}</div>
        <div className="text-2xl font-bold" style={{ color }}>
          {Number(value).toLocaleString()}
        </div>
      </div>
      {Icon && <Icon className="w-7 h-7" style={{ color }} />}
    </div>
  </div>
);

const Th = ({ children }) => (
  <th className="text-right px-3 py-2 font-bold whitespace-nowrap" style={{ color: '#665446', borderBottom: '1px solid #F3E6D4' }}>
    {children}
  </th>
);

const Td = ({ children }) => (
  <td className="px-3 py-2 align-top border-b" style={{ borderColor: '#F9F1E4', color: '#665446' }}>
    {children}
  </td>
);

const StrongNumber = ({ children }) => (
  <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700">
    {Number(children).toLocaleString()}
  </span>
);

const Dash = () => <span className="text-gray-400">—</span>;

/* ----------------- Hooks & Utils ----------------- */

function useDebouncedValue(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function downloadCSV(rows, filename = 'data.csv') {
  if (!rows || rows.length === 0) return;
  const cols = inferColumns(rows);
  const header = cols.join(',');
  const lines = rows.map((r) =>
    cols.map((c) => csvEscape(r?.[c])).join(',')
  );
  const csv = [header, ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function inferColumns(rows) {
  const set = new Set();
  rows.forEach((r) => Object.keys(r || {}).forEach((k) => set.add(k)));
  return Array.from(set);
}

function csvEscape(val) {
  if (val === null || val === undefined) return '';
  let s = typeof val === 'object' ? JSON.stringify(val) : String(val);
  s = s.replace(/"/g, '""');
  if (s.includes(',') || s.includes('\n') || s.includes('"')) {
    s = `"${s}"`;
  }
  return s;
}
