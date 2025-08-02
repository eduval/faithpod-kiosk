import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue, set } from 'firebase/database';
import { auth, database } from '../firebase';
import './page2.css';

function Page2() {
  const [ageRanges, setAgeRanges] = useState([]);
  const [churchDurations, setChurchDurations] = useState([]);
  const [favColors, setFavColors] = useState([]);

  const [selectedAge, setSelectedAge] = useState(null);
  const [selectedChurch, setSelectedChurch] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  const [userId, setUserId] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    const { sessionId } = location.state || {};
    setSessionId(sessionId || null);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
      else history.push('/');
    });

    return () => unsubscribe();
  }, [history, location.state]);

  useEffect(() => {
    const fetchData = (path, setState, labelKey) => {
      const dbRef = ref(database, path);
      onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const filtered = Object.values(data)
            .filter(item => item.Enable)
            .map(item => item[labelKey]);
          setState(filtered);
        }
      });
    };

    fetchData('AgeSelect', setAgeRanges, 'AgeRange');
    fetchData('TimeChurchSelect', setChurchDurations, 'ChurchRange');
    fetchData('FavColorSelect', setFavColors, 'Color');
  }, []);

  const handleNext = () => {
    if (!selectedAge || !selectedChurch || !selectedColor || !userId || !sessionId) return;

    const userData = {
      AgeRange: selectedAge,
      ChurchDuration: selectedChurch,
      FavouriteColor: selectedColor,
      timestamp: new Date().toISOString(),
    };

    const page2Ref = ref(database, `userSessions/${userId}/${sessionId}/frame2`);
    set(page2Ref, userData)
      .then(() => {
        history.push('/page3', { userId, sessionId });
      })
      .catch(console.error);
  };

  const handleBack = () => history.push('/');

  // Helper to conditionally animate icons
  const shouldAnimate = (sectionNumber) => {
    if (sectionNumber === 1) return true;
    if (sectionNumber === 3) return !!selectedChurch;
    if (sectionNumber === 2) return !!selectedAge;
    return false;
  };

  // Color map for favColors
  const colorMap = {
    red: '#e74c3c',
    blue: '#3498db',
    green: '#27ae60',
    yellow: '#f1c40f',
    pink: '#fd79a8',
    purple: '#9b59b6',
    orange: '#e67e22',
    black: '#2d3436',
    white: '#ffffff',
    teal: '#1abc9c',
  };

  return (

    <div className="page2-container">
      <div>
        <h2>Tell Us About Yourself</h2>
        <p className="subtitle">This will help us personalize your experience</p>

        <div className={`section ${shouldAnimate(1) ? 'animate' : ''}`}>
          <h3>How old are you?</h3>
          <div className="options-row">
            {ageRanges.map((age, idx) => (
              <button
                key={idx}
                className={`option-btn ${selectedAge === age ? 'selected' : ''}`}
                onClick={() => setSelectedAge(age)}
              >
                {age}
              </button>
            ))}
          </div>
        </div>

        <div className={`section ${shouldAnimate(2) ? 'animate' : ''}`}>
          <h3>How long have you been part of this/a church?</h3>
          <div className="options-row">
            {churchDurations.map((duration, idx) => (
              <button
                key={idx}
                className={`option-btn ${selectedChurch === duration ? 'selected' : ''}`}
                onClick={() => setSelectedChurch(duration)}
              >
                {duration}
              </button>
            ))}
          </div>
        </div>

        <div className={`section ${shouldAnimate(3) ? 'animate' : ''}`}>
          <h3>What’s your favourite colour?</h3>
          <div className="options-row">
            {favColors.map((color, idx) => {
              const lower = color.toLowerCase();
              const isSelected = selectedColor === color;
              const backgroundColor = colorMap[lower] || '#bdc3c7';
              const textColor = lower === 'white' ? '#333' : '#fff';

              return (
                <button
                  key={idx}
                  className="color-btn"
                  onClick={() => setSelectedColor(color)}
                  style={{
                    backgroundColor,
                    color: textColor,
                    filter: isSelected ? 'brightness(110%)' : 'brightness(70%)',
                    boxShadow: isSelected ? '0 6px 12px rgba(0,0,0,0.3)' : 'none',
                  }}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <p className="footer-note">
        Your information is only used to personalize your worship experience and will not be shared outside this church.
      </p>

      <div className="nav-buttons">
        <button className="back-btn" onClick={handleBack}>Back</button>
        <button
          className="next-btn"
          onClick={handleNext}
          disabled={!selectedAge || !selectedChurch || !selectedColor}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Page2;
