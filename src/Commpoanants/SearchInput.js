// src/Components/SearchInput.js
import React, { useState } from "react";
import { supabase } from "../Utilities/supabaseClient";
import { useNavigate } from "react-router-dom";

const SearchInput = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);

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
          ...lessonsData.map(item => ({ ...item, type: "lesson" })),
          ...coursesData.map(item => ({ ...item, type: "course" }))
        ];

        setResults(mergedResults);
      } catch (error) {
        console.error(error);
      }
    } else {
      setResults([]);
    }
  };

  const handleSelect = (item) => {
    // توجيه حسب نوع العنصر
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
        placeholder="ابحث..."
        value={searchTerm}
        onChange={handleSearch}
        className="w-full pr-10 pl-4 py-2 rounded-full bg-white/70 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FFD580] font-[Almarai]"
      />
      <span className="absolute left-3 top-2 text-gray-500">🔍</span>

      {results.length > 0 && (
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
              {item.description && (
                <p className="text-sm text-gray-600">{item.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
