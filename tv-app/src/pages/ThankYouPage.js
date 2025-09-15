import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getDatabase, ref, update } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import './ThankyouPage.css'; // use the refined CSS

function ThankYouPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const sessionId = location.state?.sessionId;

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && sessionId) {
        const db = getDatabase();
        const confirmationRef = ref(db, `userSessions/${user.uid}/${sessionId}/confirmation`);

        update(confirmationRef, { completed: true })
          .then(() => {
            console.log('✅ Session marked as complete.');
          })
          .catch((error) => {
            console.error('❌ Error marking session complete:', error);
          });
      } else {
        console.warn('⚠️ Missing user or sessionId. Cannot mark session complete.');
      }
    });

    const timeout = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => {
      clearTimeout(timeout);
      unsubscribe(); // cleanup auth listener
    };
  }, [navigate, sessionId]);

  return (
    <div className="thankyou-container">
      <img
        src="/image1012103-b1wj-900h.png"
        alt="Background"
        className="thankyou-bg"
      />
      <div className="thankyou-rectangle">
        <img
          src="/image124-zjov-400w.png"
          alt="Thank You Icon"
          className="thankyou-icon"
        />
        <h1 className="thankyou-title">Thank You!</h1>
        <p className="thankyou-message">We hope you had fun!</p>
        <p className="thankyou-subtext">
          See you again soon.<br />God bless you
        </p>
      </div>
    </div>
  );
}

export default ThankYouPage;
