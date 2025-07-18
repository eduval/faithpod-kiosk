import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';
import './frame3.css';

const feelings = [
  '😌 Peaceful',
  '😵‍💫 Overwhelmed',
  '🙏🏻 Grateful',
  '✨ Hopeful',
  '🤔 Confused',
  '🔍 Seeking',
  '🥺 Troubled',
  '☺️ Joyful',
];

const focusOptions = [
  'Peace & Reflexion',
  'Love & Encouragement',
  'Bible Study',
  'Worship & Music',
  'Nature & Gratitude',
];

const Frame3 = () => {
  const history = useHistory();

  const [selectedFeeling, setSelectedFeeling] = useState('');
  const [selectedFocus, setSelectedFocus] = useState('');
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    setCanContinue(selectedFeeling !== '' && selectedFocus !== '');
  }, [selectedFeeling, selectedFocus]);

  return (
    <div className="frame3-container">
      <Helmet>
        <title>exported project</title>
      </Helmet>

      <h1 className="main-title">Tell us about yourself</h1>
      <p className="sub-title">This will help us personalize your experience</p>

      <h2 className="section-title">⛪ How are you feeling today?</h2>
      <div className="button-grid">
        {feelings.map((feeling, idx) => (
          <div
            className={`button ${selectedFeeling === feeling ? 'selected' : ''}`}
            key={idx}
            onClick={() => setSelectedFeeling(feeling)}
          >
            {feeling}
          </div>
        ))}
      </div>

      <h2 className="section-title">🧍 Choose your focus for today</h2>
      <div className="button-grid">
        {focusOptions.map((option, idx) => (
          <div
            className={`button ${selectedFocus === option ? 'selected' : ''}`}
            key={idx}
            onClick={() => setSelectedFocus(option)}
          >
            {option}
          </div>
        ))}
      </div>

      <p className="disclaimer">
        Your information is only used to personalize your worship experience
        and will not be shared outside this church.
      </p>

      <div className="nav-buttons">
        <button className="back-btn" onClick={() => history.push('/page2')}>
          Back
        </button>
        <button
          className={`next-btn ${canContinue ? 'enabled' : ''}`}
          disabled={!canContinue}
          onClick={() => history.push('/page4')}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Frame3;
