import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';
import './frame4.css';

const Frame4 = () => {
  const history = useHistory();
  const [activeOption, setActiveOption] = useState(null);

  const handleOptionClick = (option) => {
    setActiveOption(option);
  };

  const handleNext = () => {
    if (activeOption) {
      history.push('/start');
    }
  };

  return (
    <div className="frame4-container">
      <Helmet>
        <title>Choose Your Experience</title>
      </Helmet>

      <div className="frame4-frame4">
        <span className="frame4-text10">Choose your experience</span>

        <div
          className={`frame4-option ${activeOption === 'Video' ? 'active' : ''}`}
          onClick={() => handleOptionClick('Video')}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && handleOptionClick('Video')}
        >
          <span>Video</span>
          <div>
            <img src="/external/vector4146-yztx.svg" alt="Video Vector1" />
            <img src="/external/vector4147-o2ked.svg" alt="Video Vector2" />
          </div>
        </div>

        <div
          className={`frame4-option ${activeOption === 'Games' ? 'active' : ''}`}
          onClick={() => handleOptionClick('Games')}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && handleOptionClick('Games')}
        >
          <span>Games</span>
          <img src="/external/arcticonsgames4157-4f5.svg" alt="Games Icon" />
        </div>

        <div
          className={`frame4-option ${activeOption === 'Bible Quiz' ? 'active' : ''}`}
          onClick={() => handleOptionClick('Bible Quiz')}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && handleOptionClick('Bible Quiz')}
        >
          <span>Bible Quiz</span>
          <img src="/external/arcticonsbible4148-wgz.svg" alt="Bible Icon" />
        </div>

        <div
          className={`frame4-option ${activeOption === 'Mood detection' ? 'active' : ''}`}
          onClick={() => handleOptionClick('Mood detection')}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && handleOptionClick('Mood detection')}
        >
          <span>
            Mood detection
            <br />
            &amp; Verses
          </span>
          <img src="/external/iconoirfaceid4151-hhk.svg" alt="Face ID Icon" />
        </div>

        <img
          src="/external/line14127-5y4.svg"
          alt="Line Divider"
          className="frame4-line1"
        />

        <span className="frame4-text18">
          Your information is only used to personalize your worship experience
          and will not be shared outside this church.
        </span>

        <span className="frame4-text21">What do you want to see inside?</span>

        <div className="frame4-footer">
          <div className="frame4-frame10" onClick={() => history.goBack()}>
            Back
          </div>
          <div
            className="frame4-frame9"
            onClick={handleNext}
            style={{
              cursor: activeOption ? 'pointer' : 'not-allowed',
              opacity: activeOption ? 1 : 0.5,
              pointerEvents: activeOption ? 'auto' : 'none',
            }}
            aria-disabled={!activeOption}
          >
            Next
          </div>
        </div>
      </div>
    </div>
  );
};

export default Frame4;
