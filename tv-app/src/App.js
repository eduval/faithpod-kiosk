// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import QuizPage from "./pages/QuizPage";  // You can create these pages later
import VideoPage from "./pages/VideoPage";
import MoodPage from "./pages/MoodPage";
import CountdownPage from "./pages/CountdownPage";
import ThankYouPage from './pages/ThankYouPage';
import ResultPageQuiz from './pages/ResultPageQuiz.js';
const App = () => {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/countdown" element={<CountdownPage />} /> {/* 👈 NEW ROUTE */}
      <Route path="/quiz" element={<QuizPage />} />
      <Route path="/video" element={<VideoPage />} />
      
      <Route path="/mood" element={<MoodPage />} />
      <Route path="/thankyou" element={<ThankYouPage />} />
      <Route path="/quiz-result" element={<ResultPageQuiz />} />
    </Routes>
  );
};

export default App;
