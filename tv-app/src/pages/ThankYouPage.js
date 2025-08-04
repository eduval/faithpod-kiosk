import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ThankyouPage.css';
import { getDatabase, ref, update } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

function ThankYouPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const sessionId = location.state?.sessionId;
  console.log(sessionId);
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
        console.log(sessionId);
        console.log(user);
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
  }, [navigate]);

  return (
    <div className="thankyou-wrapper">
      <img src="/image1012103-b1wj-900h.png" alt="Background" className="background-image" />
      <div className="centered-rectangle">
        <img src="/rectangle1314-uyh-600h.png" alt="Message box" className="rectangle-image" />
        <img src="/image124-zjov-400w.png" alt="Inner decoration" className="inside-image" />
        <div className="thankyou-text">
          <h1>Thank you!</h1>
          <p>We hope you had fun!</p>
          <p>See you again soon.</p>
        </div>
      </div>
    </div>
  );
}

export default ThankYouPage;
