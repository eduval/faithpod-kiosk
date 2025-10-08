// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage.js";
import QuizPage from "./pages/QuizPage.js";
import VideoPage from "./pages/VideoPage.js";
import MoodPage from "./pages/MoodPage.js";
import CountdownPage from "./pages/CountdownPage.js";
import ThankYouPage from './pages/ThankYouPage.js';
import ResultPageQuiz from './pages/ResultPageQuiz.js';
import CountdownPageVideo from "./pages/CountdownPageVideo.js";
import CountdownMood from "./pages/CountdownMood.js"
import LevelSelectPage from "./pages/LevelSelectPage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/countdown" element={<CountdownPage />} /> {/* 👈 NEW ROUTE */}
      <Route path="/quiz" element={<QuizPage />} />
      <Route path="/video" element={<VideoPage />} />
      <Route path="/countdownMood" element={<CountdownMood />} />
      <Route path="/level-select" element={<LevelSelectPage />} />
      <Route path="/mood" element={<MoodPage />} />
      <Route path="/thankyou" element={<ThankYouPage />} />
      <Route path="/quiz-result" element={<ResultPageQuiz />} />
      <Route path="/countdownVideo" element={<CountdownPageVideo />} />
    </Routes>
  );
};

export default App;
