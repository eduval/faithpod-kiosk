import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { ref, onValue, set, get } from 'firebase/database';
import { database } from '../firebase';
import './page3.css';

function Page3() {
  const feelingsList = [
    { key: 'peaceful', word: 'Peaceful', emoji: '🕊️' },
    { key: 'overwhelmed', word: 'Overwhelmed', emoji: '😰' },
    { key: 'grateful', word: 'Grateful', emoji: '🙏' },
    { key: 'hopeful', word: 'Hopeful', emoji: '🌟' },
    { key: 'confused', word: 'Confused', emoji: '😕' },
    { key: 'seeking', word: 'Seeking', emoji: '🔍' },
    { key: 'troubled', word: 'Troubled', emoji: '😟' },
    { key: 'joyful', word: 'Joyful', emoji: '😄' },
  ];

  const [intentions, setIntentions] = useState([]);
  const [selectedFeeling, setSelectedFeeling] = useState(null);
  const [selectedIntention, setSelectedIntention] = useState(null);

  const history = useHistory();
  const location = useLocation();

  // Get userId and sessionId from location.state
  const { userId, sessionId } = location.state || {};

  useEffect(() => {
    const fetchIntentions = () => {
      const dbRef = ref(database, 'IntentionSelect');
      onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const filtered = Object.values(data)
            .filter((item) => item.Enable)
            .map((item) => item.Focus);
          setIntentions(filtered);
        } else {
          setIntentions([]);
        }
      });
    };

    fetchIntentions();
  }, []);

  const handleNext = async () => {
    if (!selectedFeeling || !selectedIntention) return;

    if (!userId || !sessionId) {
      alert('User ID or Session ID missing. Please restart the process.');
      return;
    }

    try {
      const userRef = ref(database, `userSessions/${userId}/${sessionId}/frame3`);

      const snapshot = await get(userRef);
      const existingData = snapshot.val() || {};

      const updatedData = {
        ...existingData,
        FeelingToday: selectedFeeling,
        FocusToday: selectedIntention,
        timestamp: Date.now(),
      };

      await set(userRef, updatedData);
      console.log('Page 3 selections saved.');
      history.push('/page4', { userId, sessionId });
    } catch (err) {
      console.error('Error saving to Firebase:', err);
    }
  };

  const handleBack = () => {
    history.push('/page2', { userId, sessionId });
  };

  return (
    <div className="page3-container">
      <h2>Tell us about yourself</h2>
      <p className="subtitle">This will help us personalize your experience</p>

      <div className="section">
        <h3>How are you feeling today?</h3>
        <div className="options-row">
          {feelingsList.map(({ key, word, emoji }) => (
            <button
              key={key}
              className={`option-btn ${selectedFeeling === word ? 'selected' : ''}`}
              onClick={() => setSelectedFeeling(word)}
              type="button"
            >
              <span style={{ marginRight: 8 }}>{emoji}</span> {word}
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <h3>Choose your focus for today</h3>
        <div className="options-row">
          {intentions.map((focus, idx) => (
            <button
              key={idx}
              className={`option-btn ${selectedIntention === focus ? 'selected' : ''}`}
              onClick={() => setSelectedIntention(focus)}
              type="button"
            >
              {focus}
            </button>
          ))}
        </div>
      </div>

      <p className="footer-note">
        Your information is only used to personalize your worship experience and will not be shared outside this church.
      </p>

      <div className="nav-buttons">
        <button className="back-btn" onClick={handleBack} type="button">Back</button>
        <button
          className="next-btn"
          onClick={handleNext}
          disabled={!selectedFeeling || !selectedIntention}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Page3;
