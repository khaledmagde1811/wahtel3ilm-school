import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, Sparkles, Star } from "lucide-react";

/**
 * FAQSection (Creative v2)
 * - Parallax ناعم (يتعطّل تلقائيًا على الموبايل أو مع prefers-reduced-motion)
 * - Glassmorphism + Gradient Border
 * - فلترة لحظية للأسئلة + إبراز الكلمات المطابقة
 * - حركة دقيقة ومحترمة للوصولية
 * - ألوان: Amber (#FFBF00 – #FFC107) / Brownish (#665446) / Yellow (#FFD54F) / Orange (#FB8C00)
 */

const PALETTE = {
  amberA: "#FFBF00",
  amberB: "#FFC107",
  yellow: "#FFD54F",
  orange: "#FB8C00",
  brown: "#665446",
  brownSoft: "#8B7355",
};

const FAQSection = () => {
  const [active, setActive] = useState(null);
  const [q, setQ] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [mx, setMx] = useState(0);
  const [my, setMy] = useState(0);
  const containerRef = useRef(null);

  const data = useMemo(
    () => [
      {
        question: "كيف يتم تنظيم المناهج؟",
        answer:
          "يتم تسجيل المناهج مسبقًا من قبل المشايخ والمسؤولين المعنيين، حيث يتكون كل مستوى من مجموعة من المحاضرات التي تحتوي على محتوى تعليمي شامل.",
      },
      {
        question: "هل يجب عليّ اجتياز اختبار بعد كل محاضرة؟",
        answer:
          "نعم، يجب على الطالب حل اختبار بعد كل محاضرة من أجل الانتقال إلى المحاضرة التالية. لا يمكن للطالب مشاهدة المحاضرة التالية إلا بعد اجتيازه للاختبار بنجاح.",
      },
      {
        question: "ماذا يحدث بعد إتمام المستوى؟",
        answer:
          "بعد إتمام جميع المحاضرات في المستوى، يجب على الطالب اجتياز امتحان شامل يغطي جميع المواد التي تمت دراستها. يجب أن يحصل الطالب على نسبة 85% على الأقل في هذا الامتحان لكي يتمكن من الانتقال إلى المستوى التالي.",
      },
      {
        question: "هل يمكنني العودة إلى المحاضرات السابقة؟",
        answer:
          "نعم، بعد اجتياز الاختبارات الخاصة بالمحاضرات، يمكن للطالب العودة إلى المحاضرات السابقة لمراجعتها إذا كان بحاجة لذلك.",
      },
      {
        question: "هل هناك دعم إضافي أثناء الدراسة؟",
        answer:
          "نعم، يتم توفير الدعم للطلاب عبر جلسات استشارية مع المعلمين والمشايخ، بالإضافة إلى مجموعات نقاش عبر الإنترنت لمساعدتهم في فهم المحتوى بشكل أفضل.",
      },
    ],
    []
  );

  // فلترة الأسئلة
  const filtered = useMemo(() => {
    if (!q.trim()) return data;
    const k = q.trim().toLowerCase();
    return data.filter(
      (item) =>
        item.question.toLowerCase().includes(k) ||
        item.answer.toLowerCase().includes(k)
    );
  }, [q, data]);

  // إعدادات الحركة
  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(rm.matches);
    const onChange = (e) => setReduced(e.matches);
    rm.addEventListener?.("change", onChange);

    const checkMobile = () =>
      setIsMobile(window.innerWidth < 768 || "ontouchstart" in window);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      rm.removeEventListener?.("change", onChange);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Parallax خفيف
  useEffect(() => {
    if (isMobile || reduced) return;
    const onMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const nx = (e.clientX / innerWidth - 0.5) * 10; // -5..5
      const ny = (e.clientY / innerHeight - 0.5) * 10;
      setMx(nx);
      setMy(ny);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [isMobile, reduced]);

  // فتح/غلق باستخدام الكيبورد
  const onKeyToggle = (i) => (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActive(active === i ? null : i);
    }
  };

  // إبراز نص مطابق للبحث
  const highlight = (text) => {
    if (!q.trim()) return text;
    const k = q.trim();
    const parts = text.split(new RegExp(`(${escapeRegExp(k)})`, "gi"));
    return parts.map((p, i) =>
      p.toLowerCase() === k.toLowerCase() ? (
        <mark
          key={i}
          style={{
            background: `${PALETTE.yellow}55`,
            color: PALETTE.brown,
            padding: "0 2px",
            borderRadius: "4px",
          }}
        >
          {p}
        </mark>
      ) : (
        <span key={i}>{p}</span>
      )
    );
  };

  return (
    <section
      ref={containerRef}
      dir="rtl"
      className="relative py-20 overflow-hidden"
      style={{
        // خلفية رئيسية متدرجة + Noise خفيف
        background: `linear-gradient(135deg, #FFF9EF 0%, ${hexWithAlpha(
          PALETTE.yellow,
          0.18
        )} 20%, ${hexWithAlpha(PALETTE.amberB, 0.18)} 45%, ${hexWithAlpha(
          PALETTE.orange,
          0.12
        )} 70%, ${hexWithAlpha(PALETTE.brown, 0.06)} 100%)`,
      }}
      aria-labelledby="faq-title"
    >
      {/* زخارف Parallax */}
      <div
        className="pointer-events-none absolute inset-0 transition-transform duration-200 will-change-transform"
        style={{
          transform:
            isMobile || reduced ? "none" : `translate(${mx}px, ${my}px)`,
        }}
      >
        <GradBlob
          className="absolute -top-24 -left-20 w-96 h-96"
          from={PALETTE.amberA}
          to={PALETTE.amberB}
          delay="0s"
        />
        <GradBlob
          className="absolute -bottom-32 -right-20 w-[34rem] h-[34rem]"
          from={PALETTE.orange}
          to={PALETTE.yellow}
          delay="0.7s"
        />
        <GradBlob
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[26rem] h-[26rem]"
          from={PALETTE.brown}
          to={PALETTE.amberB}
          delay="1.1s"
          opacity={0.35}
        />
        {/* أيقونات ناعمة */}
        {[...Array(9)].map((_, i) => (
          <Floating key={i} i={i}>
            {i % 2 ? (
              <Sparkles style={{ color: PALETTE.amberB }} className="w-4 h-4" />
            ) : (
              <Star style={{ color: PALETTE.amberA }} className="w-4 h-4" />
            )}
          </Floating>
        ))}
      </div>

      {/* الرأس + البحث */}
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <header className="text-center mb-12">
          <h2
            id="faq-title"
            className="text-4xl md:text-6xl font-bold font-['Almarai']"
            style={{ color: PALETTE.brown }}
          >
            الأسئلة الشائعة
          </h2>
          <div
            className="mx-auto mt-3 h-[6px] w-48 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${PALETTE.amberA}, ${PALETTE.amberB}, ${PALETTE.yellow}, ${PALETTE.orange})`,
            }}
          />
          <p
            className="mt-6 text-lg md:text-xl font-['Almarai']"
            style={{ color: PALETTE.brownSoft }}
          >
            ابحث سريعًا أو استعرض أكثر الأسئلة تكرارًا حول منصتنا التعليمية
          </p>
        </header>

        <div className="max-w-3xl mx-auto mb-12">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0.7))",
              boxShadow:
                "0 8px 24px rgba(102,84,70,0.12), inset 0 0 0 1px rgba(255,255,255,0.6)",
              border: "1px solid rgba(255,255,255,0.55)",
              backdropFilter: "blur(8px)",
            }}
          >
            <Search className="w-5 h-5" style={{ color: PALETTE.orange }} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="اكتب كلمة للبحث داخل الأسئلة…"
              className="w-full bg-transparent outline-none text-base md:text-lg font-['Almarai']"
              style={{ color: PALETTE.brown }}
              aria-label="بحث داخل الأسئلة الشائعة"
            />
          </div>
        </div>

        {/* الأكورديون */}
        <ul className="max-w-4xl mx-auto space-y-5">
          {filtered.map((item, i) => {
            const idx = data.indexOf(item);
            const open = active === idx;
            return (
              <li key={idx}>
                <article
                  className="rounded-2xl overflow-hidden transition-transform duration-300"
                  style={{
                    transform: open ? "translateY(-1px)" : "none",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.86))",
                    boxShadow:
                      "0 10px 25px rgba(102,84,70,0.12), inset 0 0 0 1px rgba(255,255,255,0.6)",
                    border: "1px solid rgba(255,255,255,0.55)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <button
                    onClick={() => setActive(open ? null : idx)}
                    onKeyDown={onKeyToggle(idx)}
                    className="w-full text-right px-6 md:px-8 py-5 md:py-6 font-['Almarai'] flex items-center justify-between gap-4 focus:outline-none"
                    aria-expanded={open}
                    aria-controls={`faq-panel-${idx}`}
                    style={{ color: PALETTE.brown, fontWeight: 800 }}
                  >
                    <ChevronDown
                      className={`w-6 h-6 transition-transform duration-300 flex-shrink-0 ${
                        open ? "rotate-180" : ""
                      }`}
                      style={{ color: open ? PALETTE.brown : PALETTE.orange }}
                    />
                    <span className="leading-relaxed text-lg md:text-2xl">
                      {highlight(item.question)}
                    </span>
                  </button>

                  <div
                    id={`faq-panel-${idx}`}
                    className="grid transition-[grid-template-rows,opacity] duration-300"
                    style={{
                      gridTemplateRows: open ? "1fr" : "0fr",
                      opacity: open ? 1 : 0,
                    }}
                    role="region"
                    aria-hidden={!open}
                  >
                    <div className="overflow-hidden">
                      <div
                        className="px-6 md:px-8 pb-6 font-['Almarai'] leading-relaxed text-right text-base md:text-xl"
                        style={{
                          color: PALETTE.brown,
                          borderTop: `1px solid ${hexWithAlpha(
                            PALETTE.amberB,
                            0.35
                          )}`,
                          background: `linear-gradient(90deg, #FFF9EF, ${hexWithAlpha(
                            PALETTE.yellow,
                            0.14
                          )}, transparent)`,
                        }}
                      >
                        <div className="pt-4">{highlight(item.answer)}</div>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}

          {/* لا توجد نتائج */}
          {filtered.length === 0 && (
            <li className="text-center font-['Almarai'] text-lg md:text-xl"
                style={{ color: PALETTE.brownSoft }}>
              لا توجد نتائج مطابقة لبحثك.
            </li>
          )}
        </ul>
      </div>

      {/* أنماط مخصصة */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: scale(1) translate(0, 0);
          }
          50% {
            transform: scale(1.06) translate(3px, -4px);
          }
          100% {
            transform: scale(1) translate(0, 0);
          }
        }
        .blob {
          animation: blob 10s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .blob {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
};

export default FAQSection;

/* ---------- Helpers & Decorative Components ---------- */

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hexWithAlpha(hex, alpha = 1) {
  // hex #RRGGBB -> rgba
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const GradBlob = ({ className = "", from, to, delay = "0s", opacity = 0.6 }) => (
  <div
    className={`blob ${className}`}
    style={{
      opacity,
      filter: "blur(48px)",
      background: `radial-gradient(circle at 30% 30%, ${hexWithAlpha(
        from,
        0.65
      )} 0%, transparent 60%), radial-gradient(circle at 70% 70%, ${hexWithAlpha(
        to,
        0.6
      )} 0%, transparent 60%)`,
      animationDelay: delay,
      borderRadius: "999px",
    }}
  />
);

const Floating = ({ children, i }) => {
  const d = 7 + (i % 5); // المدة
  const a = 0.2 + (i % 3) * 0.1; // السعة
  return (
    <div
      className="absolute"
      style={{
        left: `${(i * 9) % 100}%`,
        top: `${(i * 13) % 85}%`,
        animation: `float-${i} ${d}s ease-in-out infinite`,
        opacity: 0.45,
      }}
    >
      <style jsx>{`
        @keyframes float-${i} {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
          }
          50% {
            transform: translateY(-${a}rem) rotate(15deg) scale(1.05);
          }
          100% {
            transform: translateY(0) rotate(0deg) scale(1);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes float-${i} {
            0%,100% { transform:none; }
            50% { transform:none; }
          }
        }
      `}</style>
      {children}
    </div>
  );
};
