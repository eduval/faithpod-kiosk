import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ref, update } from 'firebase/database';
import { auth, database } from '../firebase';
import './thankyou.css';

const ThankYou = () => {
  const location = useLocation();
  const sessionId = location.state?.sessionId || null;
  const userId = auth.currentUser?.uid || null;

  useEffect(() => {
    if (userId && sessionId) {
      const sessionRef = ref(database, `userSessions/${userId}/${sessionId}/thankYou`);
      update(sessionRef, {
        thankYouTimestamp: Date.now(),
      });
    }
  }, [userId, sessionId]);

  return (
    <div className="thankyou-container">
      <img
        src="/external/image1012103-b1wj-900h.png"
        alt="Background"
        className="thankyou-bg"
      />
      <div className="welcome-rectangle1 thankyou-rectangle">
        <img
          src="/external/image124-bjdn-400w.png"
          alt="Thank You Icon"
          className="thankyou-icon"
        />
        <h1 className="thankyou-title">Thank You!!!</h1>
        <p className="thankyou-message">You can now head into the kiosk</p>
        <p className="thankyou-subtext">
          Enjoy your experience and have a good day.<br />God Bless you
        </p>
      </div>
    </div>
  );
};

export default ThankYou;
