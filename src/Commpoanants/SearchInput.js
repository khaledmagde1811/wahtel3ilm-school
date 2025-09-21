// src/Components/SearchInput.js
import React, { useState, useEffect } from "react";
import { supabase } from "../Utilities/supabaseClient";
import { useNavigate } from "react-router-dom";

const SearchInput = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // تحقق من حالة الدخول أول ما المكون يركّب
  useEffect(() => {
    let mounted = true;

    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!mounted) return;
        setIsLoggedIn(!!data?.user);
      } catch (err) {
        console.error("Auth check error:", err);
        if (mounted) setIsLoggedIn(false);
      }
    };

    checkUser();

    // استمع لتغييرات الحالة (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => {
      mounted = false;
      try {
        listener.subscription.unsubscribe();
      } catch (e) {}
    };
  }, []);

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    // لو مش مسجل: ما نعملش أي استعلامات
    if (!isLoggedIn) {
      setResults([]);
      return;
    }

    if (term.length > 0) {
      try {
        // البحث في جدول الدروس
        const { data: lessonsData, error: lessonsError } = await supabase
          .from("lessons")
          .select("*")
          .ilike("title", `%${term}%`);
        if (lessonsError) throw lessonsError;

        // البحث في جدول الكورسات
        const { data: coursesData, error: coursesError } = await supabase
          .from("courses")
          .select("*")
          .ilike("name", `%${term}%`);
        if (coursesError) throw coursesError;

        // دمج النتائج مع تحديد نوع العنصر
        const mergedResults = [
          ...(lessonsData || []).map((item) => ({ ...item, type: "lesson" })),
          ...(coursesData || []).map((item) => ({ ...item, type: "course" })),
        ];

        setResults(mergedResults);
      } catch (error) {
        console.error(error);
        setResults([]);
      }
    } else {
      setResults([]);
    }
  };

  const handleSelect = (item) => {
    // منع التوجيه لو مش مسجل (احتياطي)
    if (!isLoggedIn) {
      navigate("/login"); // لو حابب تروح لصفحة تسجيل الدخول عند الضغط
      return;
    }

    if (item.type === "lesson") {
      navigate(`/lesson/${item.id}`);
    } else if (item.type === "course") {
      navigate(`/course/${item.id}`);
    }

    // تفريغ النتائج بعد الاختيار
    setSearchTerm("");
    setResults([]);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <input
        type="text"
        placeholder={isLoggedIn ? "ابحث..." : "سجّل دخولك للبحث"}
        value={searchTerm}
        onChange={handleSearch}
        className="w-full pr-10 pl-10 py-2 rounded-full bg-white/70 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FFD580] font-[Almarai]"
        disabled={!isLoggedIn}
        aria-disabled={!isLoggedIn}
      />
      <span className="absolute left-3 top-2.5 text-gray-500">🔍</span>

      {/* زر تسجيل دخول صغير يظهر لو المستخدم غير مسجل ويفتح صفحة /login */}
      {!isLoggedIn && (
        <div className="absolute right-3 top-1.5">
          <button
            onClick={() => navigate("/login")}
            className="text-sm px-3 py-1 bg-yellow-400/90 rounded-full font-semibold shadow-sm hover:opacity-95"
          >
            تسجيل دخول
          </button>
        </div>
      )}

      {isLoggedIn && results.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 max-h-64 overflow-y-auto bg-white shadow-md rounded-lg z-50">
          {results.map((item) => (
            <div
              key={item.id + item.type}
              className="p-2 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
              onClick={() => handleSelect(item)}
            >
              <h3 className="font-bold">
                {item.type === "lesson" ? "درس: " : "كورس: "} {item.title || item.name}
              </h3>
              {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
