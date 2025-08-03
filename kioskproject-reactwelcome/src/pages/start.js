import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory, useLocation } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, set } from 'firebase/database';

import { startWebcam, analyzeMood } from '../moodDetector';

import './start.css';

const Start = () => {
  const history = useHistory();
  const location = useLocation();
  const auth = getAuth();
  const db = getDatabase();
  const [moodSaved, setMoodSaved] = useState(false);

  const sessionId = location.state?.sessionId || null;
  const user = auth.currentUser;
  const userId = user?.uid || null;

  const [started, setStarted] = useState(false);

  useEffect(() => {
    (async () => {
      await startWebcam();
      const result = await analyzeMood();

      if (result && !moodSaved && userId && sessionId) {
        const moodRef = ref(db, `userSessions/${userId}/${sessionId}/mood`);
        await set(moodRef, {
          mood: result.mood,
          confidence: result.confidence,
          timestamp: Date.now(),
        });
        setMoodSaved(true);
        console.log('Mood saved:', result);
      }
    })();
  }, [userId, sessionId, db, moodSaved]);

  const handleStartClick = async () => {
    if (!sessionId || !userId) {
      alert('Session ID or user ID missing, please start over.');
      history.push('/');
      return;
    }

    const sessionRef = ref(db, `userSessions/${userId}/${sessionId}/confirmation`);
    await set(sessionRef, {
      confirmed: true,
      ready: true,
      claimed: false,
      completed: false,
      timestamp: Date.now(),
    });

    setStarted(true);

    // Optional: redirect to next page
    setTimeout(() => history.push('/'), 15000);
  };

  return (
    <div className="start-container">
      <Helmet>
        <title>You’re all set</title>
      </Helmet>
      <img
        src="/external/image1012103-b1wj-900h.png"
        alt="Background"
        className="start-bg"
      />
      <div className="start-rectangle">
        <img
          src="/external/image124-bjdn-400w.png"
          alt="Faith Logo"
          className="welcome-image1"
        />
        <h2 className="start-title">You’re all set! ✨</h2>
        <p className="start-subtext">
          Press Start to complete the environment
        </p>
        <button
          className="start-button"
          onClick={handleStartClick}
          disabled={started}
        >
          Start
        </button>

        {started && (
          <div className="start-move-message">
            <span>Please proceed to the kiosk now to begin your experience.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Start;
