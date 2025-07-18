import React from 'react';
import { Helmet } from 'react-helmet';
import './thankyou.css';

const ThankYou = () => {
  return (
    <div className="thankyou-container">
      <Helmet>
        <title>Thank You</title>
      </Helmet>

      {/* Background sunset image */}
      <img
        src="/external/image26203-alvu-1400w.png"
        alt="Background"
        className="thankyou-background"
      />

      {/* Centered content box */}
      <div className="thankyou-content">
        <h1>Thank You!</h1>
        <p>Your experience has been recorded. Have a blessed day ✨</p>
      </div>
    </div>
  );
};

export default ThankYou;

