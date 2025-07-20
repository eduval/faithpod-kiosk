// src/pages/start.js
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';
import './start.css';

import { startWebcam, capturePicture, detectMood } from '../moodDetector';

const Start = () => {
  const history = useHistory();

  useEffect(() => {
    // Start webcam as soon as this component mounts
    startWebcam().catch((err) => {
      console.error('Error starting webcam:', err);
    });
  }, []);

  const handleStart = async () => {
    try {
      const canvas = capturePicture();
      const expressions = await detectMood(canvas);

      if (expressions) {
        const topMood = Object.entries(expressions).reduce((a, b) =>
          a[1] > b[1] ? a : b
        );
        console.log(
          `Detected mood: ${topMood[0]} (${(topMood[1] * 100).toFixed(2)}%)`
        );
      } else {
        console.log('No face detected');
      }
    } catch (error) {
      console.error('Mood detection failed:', error);
    }

    // Navigate to thank you page regardless of mood detection outcome
    history.push('/thankyou');
  };

  return (
    <div className="start-container">
      <Helmet>
        <title>exported project</title>
      </Helmet>

      {/* Background image */}
      <img
        src="/external/image26203-alvu-1400w.png"
        alt="Background"
        className="start-image2"
      />

      {/* Transparent container */}
      <div className="start-start">
        {/* White content box inside */}
        <div className="start-content-box">
          {/* Logo at top */}
          <img
            src="/external/image16214-vsgj-200h.png"
            alt="Logo"
            className="start-image1"
          />

          <span className="start-text2">You’re all set! ✨</span>
          <span className="start-text1">
            “Now head into the kiosk and your experience will begin”
          </span>

          <div
            className="start-frame9"
            onClick={handleStart}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
          >
            Start
          </div>
        </div>
      </div>
    </div>
  );
};

export default Start;
