import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./CountdownMood.css";

const CountdownMood = () => {
  const [count, setCount] = useState(7);
  const navigate = useNavigate();
  const location = useLocation();
  const sessionId = location.state?.sessionId;
  console.log(sessionId);
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev === 1) {
          clearInterval(timer);
          setTimeout(() => navigate("/mood", { state: { sessionId: sessionId } }), 1000); // wait a sec before routing
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, sessionId]);

  return (
    <div className="countdown-container">
      <h1 className="countdown-title">Welcome to the<br /> <span>Mood Detection</span></h1>
      <p className="countdown-subtitle">The place where you get an animation of your mood!!</p>
      <p className="countdown-ready">Are you ready?<br />The capture is going to start in...</p>
      <div className="countdown-number">{String(count).padStart(2, "0")}</div>
    </div>
  );
};

export default CountdownMood;
