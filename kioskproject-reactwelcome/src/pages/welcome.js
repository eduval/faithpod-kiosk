import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './welcome.css';

const Welcome = () => {
  return (
    <div className="welcome-container">
      <Helmet>
        <title>Faith App</title>
      </Helmet>
      <div className="welcome-welcome">
        <img
          src="/external/rectangle1314-sn4n-600h.png"
          alt="Background Overlay"
          className="welcome-rectangle1"
        />
        <img
          src="/external/image124-zjov-400w.png"
          alt="Faith Logo"
          className="welcome-image1"
        />
        <span className="welcome-text1">
          ‘’Begin your spiritual journey before today’s service’’
        </span>
        <Link to="/page2" className="welcome-frame9">
          <span className="welcome-text2">Begin</span>
        </Link>
      </div>
    </div>
  );
};

export default Welcome;
