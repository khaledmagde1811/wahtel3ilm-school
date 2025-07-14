// src/App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
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
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import ContantLevel from "./Pages/ContantLevel";

function App() {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = document.getElementById("background-audio");
    if (audio) {
      audio.muted = isMuted;
    }
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div className="min-h-screen bg-[#CDC0B6] text-[#665446] flex flex-col">
        <NaveBr />

        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<HomeLand />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:courseId/levels/:levelId/lessons" element={<CourseLessons />} />
            <Route path="/lessons/:lessonId" element={<LessonPage />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/levels/:levelId" element={<ContantLevel />} />
          </Routes>
        </div>

        <button
          onClick={toggleMute}
          className="fixed top-5 right-5 p-3 mt-12 bg-[#665446] text-white rounded-md z-50"
        >
          {isMuted ? "تشغيل الصوت" : "إيقاف الصوت"}
        </button>

        <Footer />
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;
