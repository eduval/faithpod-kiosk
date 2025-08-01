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

  useEffect(() => {
    if (!userId || !sessionId) {
      console.error('Missing userId or sessionId!');
      return;
    }

    const sessionRef = ref(db, `userSessions/${userId}/${sessionId}/confirmation`);
    set(sessionRef, {
      confirmed: true,
      timestamp: Date.now(),
    });

    (async () => {
      await startWebcam();
      const result = await analyzeMood();

      if (result && !moodSaved) {
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

  const handleStartClick = () => {
    if (!sessionId) {
      alert('Session ID missing, please start over.');
      history.push('/');
      return;
    }
    history.push('/thankyou', { sessionId });
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
          “Now head into the kiosk and your experience will begin”
        </p>
        <button className="start-button" onClick={handleStartClick}>
          Start
        </button>
      </div>
    </div>
  );
};

export default Start;
