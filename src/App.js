// src/App.js
import React, { useEffect, useState } from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import './App.css';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import Goals from './Pages/Goals';
import HomeLand from './Pages/HomeLand';
import Footer from './Utilities/Footer';
import NaveBr from './Utilities/NaveBr';
import Courses from "./Pages/Courses";
import CourseLessons from './Pages/CourseLessons';
import LessonPage from './Pages/LessonPage';
import AdminDashboard from "./Pages/AdminPagde/AdminDashboard";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import ContantLevel from "./Pages/ContantLevel";

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

  const playSound = () => {
    if (!isMuted && userHasInteracted) {
      const sound = new Audio('/sound/notification-sound-effect-372475.mp3');
      sound.play().catch((e) => {
        console.warn("المتصفح منع تشغيل الصوت:", e.message);
      });
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  // Spinner loading simulation
  useEffect(() => {
    const fakeLoad = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(fakeLoad);
  }, []);

  // Detect first user interaction
  useEffect(() => {
    const handleInteraction = () => {
      setUserHasInteracted(true);
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("scroll", handleInteraction);
    };
    window.addEventListener("click", handleInteraction);
    window.addEventListener("scroll", handleInteraction);
  }, []);

  // Toasts with delay
  useEffect(() => {
    const prayerToast = setTimeout(() => {
      toast.info('صلي على النبي ﷺ', {
        onOpen: playSound,
        onClick: () => setIsMuted(true),
      });
    }, 0);

    const dhikrToast = setTimeout(() => {
      toast.info('سبحان الله وبحمده، سبحان الله العظيم', {
        onOpen: playSound,
        onClick: () => setIsMuted(true),
      });
    }, 420000); // 7 min

    const saphToast = setTimeout(() => {
      toast.info('سبح لله ما في السموات و الأرض', {
        onOpen: playSound,
        onClick: () => setIsMuted(true),
      });
    }, 840000); // 14 min

    return () => {
      clearTimeout(prayerToast);
      clearTimeout(dhikrToast);
      clearTimeout(saphToast);
    };
  }, [isMuted, userHasInteracted]);

  return (
    <Router>
      {isLoading && <Spinner />}
      <ToastContainer />
      <div className="App bg-[#FFF9EF] min-h-screen relative flex flex-col">
        <NaveBr />
        <div className="flex-grow">
          <Routes>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/" element={<HomeLand />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/contentLevel/:id" element={<ContantLevel />} />
            <Route path="/lesson/:id" element={<LessonPage />} />
            <Route path="/course/:id" element={<CourseLessons />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </div>

        <button
          onClick={toggleMute}
          className="fixed top-5 right-5 p-3 mt-12 bg-[#665446] text-white rounded-md z-50"
        >
          {isMuted ? 'تشغيل الصوت' : 'إيقاف الصوت'}
        </button>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
