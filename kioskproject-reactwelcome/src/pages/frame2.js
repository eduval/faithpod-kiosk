import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom'; 
import { getDatabase, ref, set } from 'firebase/database';
import firebaseApp from '../firebase'; // adjust path if needed
import './frame2.css';

const Frame2 = () => {
  const history = useHistory();
  const [churchSelection, setChurchSelection] = useState(null);
  const [ageSelection, setAgeSelection] = useState(null);
  const db = getDatabase(firebaseApp);

  const handleChurchClick = (value) => setChurchSelection(value);
  const handleAgeClick = (value) => setAgeSelection(value);

  const isNextEnabled = churchSelection && ageSelection;

  const saveSelectionsAndContinue = () => {
    const userId = 'sessionTest001'; // replace with dynamic ID if available

    set(ref(db, `userSessions/${userId}/frame2`), {
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
                onClick={() => handleChurchClick(option)}
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
                onClick={() => handleAgeClick(option)}
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
          <button
            className="frame2-back"
            onClick={() => history.push('/')}
          >
            Back
          </button>

          <button
            className="frame2-next"
            disabled={!isNextEnabled}
            onClick={saveSelectionsAndContinue}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Frame2;
