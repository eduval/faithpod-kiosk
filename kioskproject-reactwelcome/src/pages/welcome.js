import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, set } from 'firebase/database';
import './welcome.css';

const Welcome = () => {
  const history = useHistory();
  const [sessionId, setSessionId] = useState(null);
  const db = getDatabase();

  useEffect(() => {
    signInWithEmailAndPassword(auth, 'eperezr@uni.pe', '12@23#34$')
      .then(async (userCredential) => {
        const user = userCredential.user;

        // Sanitize ISO timestamp for sessionId (replace ':' and '.' with '-')
        const iso = new Date().toISOString();
        const sanitizedIso = iso.replace(/[:.]/g, '-');
        const newSessionId = `session_${sanitizedIso}`;

        setSessionId(newSessionId);

        // Save session start in Firebase under sanitized sessionId
        await set(ref(db, `userSessions/${user.uid}/${newSessionId}/sessionStart`), {
          timestamp: Date.now(),
        });

        console.log('User logged in and session started:', newSessionId);
      })
      .catch((error) => {
        console.error('Login error:', error.message);
      });
  }, [db]);

  const handleBeginClick = () => {
    if (sessionId) {
      // Pass sanitized sessionId to next page
      history.push('/page2', { sessionId });
    } else {
      history.push('/page2');
    }
  };

  return (
    <>
      <Helmet>
        <title>Faithpod Welcome</title>
      </Helmet>

      <div className="welcome-container">
        <div className="welcome-welcome">
          <img
            src="/external/image1012103-oiv7-900h.png"
            alt="Background"
            className="welcome-image101"
          />
          <div className="welcome-rectangle1">
            <img
              src="/external/image124-bjdn-400w.png"
              alt="Faith Logo"
              className="welcome-image1"
            />
            <span className="welcome-text1">
              “Begin your spiritual journey before today’s service”
            </span>
            <div className="welcome-frame9" onClick={handleBeginClick}>
              <span className="welcome-text2">Begin</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Welcome;
