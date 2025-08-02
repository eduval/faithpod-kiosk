import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ThankyouPage.css';
import { getDatabase, ref, update } from 'firebase/database';

function ThankYouPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Get the userId and sessionKey (adjust if you're storing it differently)
    const userId = localStorage.getItem('userId');
    const sessionKey = localStorage.getItem('sessionKey');

    if (userId && sessionKey) {
      const db = getDatabase();
      const confirmationRef = ref(db, `userSessions/${userId}/${sessionKey}/confirmation`);

      update(confirmationRef, { completed: true })
        .then(() => {
          console.log('✅ Session marked as complete.');
        })
        .catch((error) => {
          console.error('❌ Error marking complete:', error);
        });
    }

    // Redirect back to start after 15 seconds
    const timeout = setTimeout(() => {
      navigate('/');
    }, 15000);
    return () => clearTimeout(timeout);
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
