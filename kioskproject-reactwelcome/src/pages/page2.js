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

  // Get sessionId from router state and watch auth state
  useEffect(() => {
    const { sessionId } = location.state || {};
    setSessionId(sessionId || null);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        console.log('User not authenticated, redirecting to Welcome.');
        history.push('/');
      }
    });

    return () => unsubscribe();
  }, [history, location.state]);

  // Fetch select options
  useEffect(() => {
    const fetchData = (path, setState, labelKey) => {
      const dbRef = ref(database, path);
      onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const filtered = Object.values(data)
            .filter((item) => item.Enable)
            .map((item) => item[labelKey]);
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
        console.log('Page 2 selections saved.');
        history.push('/page3', { userId, sessionId });
      })
      .catch((err) => console.error('Error saving to Firebase:', err));
  };

  const handleBack = () => {
    history.push('/');
  };

  return (
    <div className="page2-container">
      <div>
        <h2>Tell Us About Yourself</h2>
        <p className="subtitle">This will help us personalize your experience</p>

        <div className="section">
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

        <div className="section">
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

        <div className="section">
          <h3>What’s your favourite colour?</h3>
          <div className="options-row">
            {favColors.map((color, idx) => (
              <button
                key={idx}
                className={`option-btn ${selectedColor === color ? 'selected' : ''}`}
                onClick={() => setSelectedColor(color)}
              >
                {color}
              </button>
            ))}
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
