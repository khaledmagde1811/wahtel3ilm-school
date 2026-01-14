// src/App.js
import React, { useEffect, useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import { NotificationProvider } from './contexts/NotificationContext';

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
import ContantLevel from "./Pages/ContantLevel";
import ResetPassword from "./Pages/ResetPassword ";


import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import DatabaseStatistics from "./Pages/AdminPagde/DatabaseStatistics";
import ArticlesManagement from "./Pages/createArticle ";
import Community from "./Pages/Community";
import MonthlyExams from "./Pages/MonthlyExams";
import UpdatePassword from "./Pages/UpdatePassword";

const Spinner = () => (
  <div className="fixed inset-0 bg-[#FFF9EF] flex items-center justify-center z-50">
    <div className="w-16 h-16 border-4 border-[#665446] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userHasInteracted, setUserHasInteracted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onFirst = () => {
      setUserHasInteracted(true);
      window.removeEventListener("click", onFirst);
      window.removeEventListener("scroll", onFirst);
    };
    window.addEventListener("click", onFirst);
    window.addEventListener("scroll", onFirst);
    return () => {
      window.removeEventListener("click", onFirst);
      window.removeEventListener("scroll", onFirst);
    };
  }, []);

  useEffect(() => {
    if (!userHasInteracted) return;
    const p = toast.info('صلي على النبي ﷺ');
    const d = setTimeout(() =>
      toast.info('سبحان الله وبحمده، سبحان الله العظيم'),
      420000
    );
    const s = setTimeout(() =>
      toast.info('سبح لله ما في السموات و الأرض'),
      840000
    );
    // تسبيح إضافي
    const extra = setTimeout(() =>
      toast.info('لا حول ولا قوة إلا بالله'),
      1260000
    );

    return () => {
      toast.dismiss(p);
      clearTimeout(d);
      clearTimeout(s);
      clearTimeout(extra);
    };
  }, [userHasInteracted]);

  return (
    <Router>
          <NotificationProvider>
      {isLoading && <Spinner />}
      <ToastContainer />
      <div className="App bg-[#CDC0B6] min-h-screen flex flex-col">
        <NaveBr />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<HomeLand />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/course/:id" element={<CourseLessons />} />
            <Route path="/lesson/:id" element={<LessonPage />} />
            <Route path="/contentLevel/:id" element={<ContantLevel />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/statistics" element={<DatabaseStatistics />} />
            <Route path="/articlesManagement" element={<ArticlesManagement />} />
            <Route path="/community" element={<Community />} />
            <Route path="/monthlyExams" element={<MonthlyExams/>} />
            <Route path="/update-password" element={<UpdatePassword />} />
            

          </Routes>
        </div>
        <Footer />
      </div>
      </NotificationProvider>
    </Router>
  );
}

export default App;
