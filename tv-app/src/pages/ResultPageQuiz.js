import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ResultPageQuiz.css';

const ResultPageQuiz = () => {
  const location = useLocation();
  const navigate = useNavigate(); // <--- rename here

  const { score = 0, total = 0 } = location.state || {};
  const percentage = Math.round((score / total) * 100);

  const getMessage = () => {
    if (percentage === 100) return "Wow! Bible genius alert 🚨 — 2 Timothy 2:15!";
    if (percentage >= 80) return "Nice! You've got that Sunday school wisdom — Proverbs 4:7!";
    if (percentage >= 50) return "Not bad! Brush up a little — Hosea 4:6!";
    return "You need Jesus... and a Bible 😂 — John 8:32.";
  };

  return (
    <div className="result-container">
      <h1 className="result-title">Quiz Complete!</h1>
      <div className="score-box">
        <p>You scored</p>
        <h2>{score} / {total}</h2>
        <p className="message">{getMessage()}</p>
      </div>

      <div className="play-again">
        <button onClick={() => navigate('/countdown')}>Play Again</button>
        <button onClick={() => navigate('/thankyou')}>No, Thanks</button>
      </div>
    </div>
  );
};

export default ResultPageQuiz;
