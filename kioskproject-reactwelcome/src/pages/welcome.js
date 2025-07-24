// src/pages/Welcome.js
import React from 'react';
import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './welcome.css';

// 🔁 Extracted into a reusable function for use in other frames too
const getOrCreateSessionId = () => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    const raw = new Date().toISOString();
    sessionId = 'session_' + raw.replace(/[:.#$/\[\]]/g, '-');
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

const Welcome = () => {
  const history = useHistory();

  const handleBegin = () => {
    getOrCreateSessionId(); // Set sessionId once at beginning
    history.push('/page2');
  };

  return (
    <div className="welcome-container">
      <Helmet>
        <title>Faith App</title>
      </Helmet>

      <div className="welcome-welcome">
        <img
          src="/external/rectangle1314-sn4n-600h.png"
          alt="Background Overlay"
          className="welcome-rectangle1"
        />
        <img
          src="/external/image124-zjov-400w.png"
          alt="Faith Logo"
          className="welcome-image1"
        />
        <span className="welcome-text1">
          ‘’Begin your spiritual journey before today’s service’’
        </span>

        <div
          onClick={handleBegin}
          className="welcome-frame9"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleBegin()}
        >
          <span className="welcome-text2">Begin</span>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
