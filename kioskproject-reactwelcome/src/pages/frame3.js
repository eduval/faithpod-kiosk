// src/pages/Frame3.js
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';
import { getDatabase, ref, set } from 'firebase/database';
import firebaseApp from '../firebase';
import './frame3.css';

const feelings = [
  '😌 Peaceful', '😵‍💫 Overwhelmed', '🙏🏻 Grateful',
  '✨ Hopeful', '🤔 Confused', '🔍 Seeking',
  '🥺 Troubled', '☺️ Joyful',
];

const focusOptions = [
  'Peace & Reflexion', 'Love & Encouragement',
  'Bible Study', 'Worship & Music', 'Nature & Gratitude',
];

const Frame3 = () => {
  const history = useHistory();
  const db = getDatabase(firebaseApp);

  const [selectedFeeling, setSelectedFeeling] = useState('');
  const [selectedFocus, setSelectedFocus] = useState('');
  const [canContinue, setCanContinue] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // 🔐 Sanitize function to make ID Firebase-safe
  const sanitizeForFirebase = (str) => str.replace(/[:.#$/\[\]]/g, '-');

  useEffect(() => {
    let id = localStorage.getItem('sessionId');
    if (!id) {
      const raw = new Date().toISOString();
      id = 'session_' + sanitizeForFirebase(raw);
      localStorage.setItem('sessionId', id);
    } else {
      id = sanitizeForFirebase(id); // Re-sanitize just in case
    }
    setSessionId(id);
  }, []);

  useEffect(() => {
    setCanContinue(selectedFeeling !== '' && selectedFocus !== '');
  }, [selectedFeeling, selectedFocus]);

  const saveSelectionsAndContinue = () => {
    if (!sessionId) return;

    const data = {
      feeling: selectedFeeling,
      focus: selectedFocus,
      timestamp: new Date().toISOString(),
    };

    set(ref(db, `userSessions/${sessionId}/frame3`), data)
      .then(() => {
        history.push('/page4');
      })
      .catch((error) => {
        console.error('Error saving data:', error);
        alert('Failed to save data. Please try again.');
      });
  };

  return (
    <div className="frame3-container">
      <Helmet><title>How Are You Feeling?</title></Helmet>

      <h1 className="main-title">Tell us about yourself</h1>
      <p className="sub-title">This will help us personalize your experience</p>

      <h2 className="section-title">⛪ How are you feeling today?</h2>
      <div className="button-grid">
        {feelings.map((feeling, idx) => (
          <div
            key={idx}
            className={`button ${selectedFeeling === feeling ? 'selected' : ''}`}
            onClick={() => setSelectedFeeling(feeling)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedFeeling(feeling)}
          >
            {feeling}
          </div>
        ))}
      </div>

      <h2 className="section-title">🧍 Choose your focus for today</h2>
      <div className="button-grid">
        {focusOptions.map((option, idx) => (
          <div
            key={idx}
            className={`button ${selectedFocus === option ? 'selected' : ''}`}
            onClick={() => setSelectedFocus(option)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedFocus(option)}
          >
            {option}
          </div>
        ))}
      </div>

      <p className="disclaimer">
        Your information is only used to personalize your worship experience and will not be shared outside this church.
      </p>

      <div className="nav-buttons">
        <button className="back-btn" onClick={() => history.push('/page2')}>
          Back
        </button>
        <button
          className={`next-btn ${canContinue ? 'enabled' : ''}`}
          disabled={!canContinue}
          onClick={saveSelectionsAndContinue}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Frame3;
