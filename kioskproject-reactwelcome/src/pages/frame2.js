// src/pages/Frame2.js
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';
import { getDatabase, ref, set } from 'firebase/database';
import firebaseApp from '../firebase';
import './frame2.css';

// ✅ Reuse the session ID from localStorage and sanitize once
const getSessionId = () => {
  const id = localStorage.getItem('sessionId');
  return id ? id.replace(/[:.#$/\[\]]/g, '-') : null;
};

const Frame2 = () => {
  const history = useHistory();
  const [churchSelection, setChurchSelection] = useState(null);
  const [ageSelection, setAgeSelection] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const db = getDatabase(firebaseApp);

  useEffect(() => {
    const id = getSessionId();
    if (id) {
      setSessionId(id);
    } else {
      console.error('No session ID found. Redirecting to start...');
      history.push('/'); // redirect to welcome if session is missing
    }
  }, [history]);

  const isNextEnabled = churchSelection && ageSelection;

  const saveSelectionsAndContinue = () => {
    if (!sessionId) return;

    set(ref(db, `userSessions/${sessionId}/frame2`), {
      churchSelection,
      ageSelection,
      timestamp: new Date().toISOString(),
    })
      .then(() => {
        history.push('/page3');
      })
      .catch((error) => {
        console.error('Error saving selections:', error);
        alert('Failed to save data. Please try again.');
      });
  };

  const churchOptions = ['0 - 1', '1 - 5', '5 - 10', '10+'];
  const ageOptions = ['0 - 12', '13 - 25', '26 - 50', '51+'];

  return (
    <div className="frame2-container">
      <Helmet><title>Survey Page</title></Helmet>

      <div className="frame2-box container">
        <h1 className="frame2-heading">Tell us about yourself</h1>
        <p className="frame2-subheading subtitle">This will help us personalize your experience</p>

        <div className="frame2-section section">
          <h3>⛪ How long have you been part of this/a church?</h3>
          <div className="frame2-options options">
            {churchOptions.map((option) => (
              <button
                key={option}
                className={`frame2-option ${churchSelection === option ? 'selected' : ''}`}
                onClick={() => setChurchSelection(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="frame2-section section">
          <h3>🧍 How old are you?</h3>
          <div className="frame2-options options">
            {ageOptions.map((option) => (
              <button
                key={option}
                className={`frame2-option ${ageSelection === option ? 'selected' : ''}`}
                onClick={() => setAgeSelection(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <p className="frame2-note disclaimer">
          Your information is only used to personalize your worship experience and will not be shared outside this church.
        </p>

        <div className="frame2-buttons footer">
          <button className="frame2-back" onClick={() => history.push('/')}>
            Back
          </button>
          <button className="frame2-next" disabled={!isNextEnabled} onClick={saveSelectionsAndContinue}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Frame2;
