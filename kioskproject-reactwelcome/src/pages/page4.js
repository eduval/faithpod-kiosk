import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory, useLocation } from 'react-router-dom';
import { ref, onValue, update } from 'firebase/database';
import { database } from '../firebase';
import './page4.css';

const Page4 = () => {
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const history = useHistory();
  const location = useLocation();

  // Get userId and sessionId from location.state
  const { userId, sessionId } = location.state || {};

  useEffect(() => {
    const experienceRef = ref(database, 'ExperienceOpSelect');
    const unsubscribe = onValue(experienceRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.values(data).filter(item => item.Enable);
        setOptions(formatted);
      } else {
        setOptions([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSelect = (item) => {
    setSelected(item.id);
    if (userId && sessionId) {
      const sessionRef = ref(database, `userSessions/${userId}/${sessionId}/frame4`);
      update(sessionRef, {
        experience: item.Experience,
        experienceId: item.id,
        timestamp: Date.now(),
      });
    }
  };

  const handleNext = () => {
    if (selected && userId && sessionId) {
      history.push('/start', { userId, sessionId });
    } else {
      console.error('Missing selected, userId or sessionId');
    }
  };

  const handleBack = () => {
    history.push('/page3', { userId, sessionId });
  };

  const getHardcodedIconPath = (experience) => {
    if (!experience) return ['/external/default-icon.svg'];

    const exp = experience.trim().toLowerCase();

    if (exp.includes('video')) {
      return ['/external/vector4146-8yb4.svg', '/external/vector4147-omgc.svg'];
    }

    if (exp.includes('bible quiz') || exp.includes('quiz')) {
      return ['/external/arcticonsbible4148-ypst.svg'];
    }

    if (exp.includes('mood') && exp.includes('verse')) {
      return ['/external/iconoirfaceid4151-z3nf.svg'];
    }

    return ['/external/default-icon.svg'];
  };

  return (
    <div className="page4-container">
      <Helmet>
        <title>Choose Experience</title>
      </Helmet>

      <div className="page4-content">
        <h1 className="page4-title">Choose your experience</h1>

        <div className="page4-options">
          {options.map((item) => {
            const iconPaths = getHardcodedIconPath(item.Experience);
            return (
              <div
                key={item.id}
                className={`page4-option ${selected === item.id ? 'selected' : ''}`}
                onClick={() => handleSelect(item)}
              >
                <div className="page4-icon-stack">
                  {iconPaths.map((path, index) => (
                    <img
                      key={index}
                      src={path}
                      alt={`${item.Experience} icon ${index + 1}`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/external/default-icon.svg';
                      }}
                      className="page4-icon-layer"
                    />
                  ))}
                </div>
                <span>{item.Experience}</span>
              </div>
            );
          })}
        </div>

        <p className="page4-note">
          Your information is only used to personalize your worship experience and will not be shared outside this church.
        </p>

        <div className="page4-buttons">
          <button onClick={handleBack} className="back-btn">Back</button>
          <button onClick={handleNext} className="next-btn" disabled={!selected}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default Page4;
