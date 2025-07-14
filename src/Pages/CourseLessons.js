// src/App.js
import React, { useEffect, useState } from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom"
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Goals from "./Pages/Goals";
import HomeLand from "./Pages/HomeLand";
import Footer from "./Utilities/Footer";
import NaveBr from "./Utilities/NaveBr";
import Courses from "./Pages/Courses";
import CourseLessons from "./Pages/CourseLessons";
import LessonPage from "./Pages/LessonPage";
import AdminDashboard from "./Pages/AdminPagde/AdminDashboard";
import ContantLevel from "./Pages/ContantLevel";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import './App.css';
// Spinner Component
const Spinner = () => (
  <div className="fixed inset-0 bg-[#FFF9EF] flex items-center justify-center z-50">
    <div className="w-16 h-16 border-4 border-[#665446] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userHasInteracted, setUserHasInteracted] = useState(false);

  // Play sound if unmuted and user has interacted
  const playSound = () => {
    if (!isMuted && userHasInteracted) {
      const sound = new Audio(process.env.PUBLIC_URL + "/sound/notification-sound-effect-372475.mp3");
      sound.play().catch((e) => {
        console.warn("المتصفح منع تشغيل الصوت:", e.message);
      });
    }
  };

  // Toggle mute on/off
  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  // Simulate loading for spinner
  useEffect(() => {
    const fakeLoad = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(fakeLoad);
  }, []);

  // Detect first user interaction to allow sound
  useEffect(() => {
    const handleInteraction = () => {
      setUserHasInteracted(true);
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("scroll", handleInteraction);
    };
    window.addEventListener("click", handleInteraction);
    window.addEventListener("scroll", handleInteraction);
  }, []);

  // Schedule toasts with delays
  useEffect(() => {
    const prayerToast = setTimeout(() => {
      toast.info("صلي على النبي ﷺ", { onOpen: playSound });
    }, 0);

    const dhikrToast = setTimeout(() => {
      toast.info("سبحان الله وبحمده، سبحان الله العظيم", { onOpen: playSound });
    }, 420000); // after 7 minutes

    const saphToast = setTimeout(() => {
      toast.info("سبح لله ما في السموات و الأرض", { onOpen: playSound });
    }, 840000); // after 14 minutes

    return () => {
      clearTimeout(prayerToast);
      clearTimeout(dhikrToast);
      clearTimeout(saphToast);
    };
  }, [isMuted, userHasInteracted]);

  return (
    <Router>
      {isLoading && <Spinner />}
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="App bg-[#FFF9EF] min-h-screen flex flex-col relative">
        <NaveBr />

        <div className="flex-grow">
          <Routes>
            {/* default (index) route */}
            <Route index element={<HomeLand />} />

            {/* explicit routes */}
            <Route path="/courses" element={<Courses />} />
            <Route path="/course/:id" element={<CourseLessons />} />
            <Route path="/contentLevel/:id" element={<ContantLevel />} />
            <Route path="/lesson/:id" element={<LessonPage />} />

            <Route path="/goals" element={<Goals />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />

            {/* catch-all: redirect to home */}
            <Route path="*" element={<HomeLand />} />
          </Routes>
        </div>

        {/* mute/unmute button */}
        <button
          onClick={toggleMute}
          className="fixed top-5 right-5 z-50 p-3 mt-12 bg-[#665446] text-white rounded-md"
        >
          {isMuted ? "تشغيل الصوت" : "إيقاف الصوت"}
        </button>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
