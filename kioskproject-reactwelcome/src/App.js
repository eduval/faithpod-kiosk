import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom';
import { loadModels, startWebcam, analyzeMood } from './moodDetector';

import './style.css';
import Welcome from './pages/welcome';
import Frame2 from './pages/frame2';
import Frame3 from './pages/frame3';
import Frame4 from './pages/frame4';
import Start from './pages/start';
import ThankYou from './pages/thankyou';

// Create a wrapper component to use hooks like useHistory inside Router
function AppWrapper() {
  const history = useHistory();

  useEffect(() => {
    // Check if this is a reload navigation event
    const navEntries = window.performance.getEntriesByType("navigation");
    if (navEntries.length > 0 && navEntries[0].type === 'reload') {
      // Redirect to welcome page on reload
      if (window.location.pathname !== '/') {
        history.replace('/');
      }
    }
  }, [history]);

  useEffect(() => {
    const init = async () => {
      await loadModels();
      await startWebcam();

      // wait 2s, then analyze mood quietly (logs only)
      setTimeout(async () => {
        await analyzeMood();
      }, 2000);
    };

    init();
  }, []);

  return (
    <Switch>
      <Route exact path="/" component={Welcome} />
      <Route path="/page2" component={Frame2} />
      <Route path="/page3" component={Frame3} />
      <Route path="/page4" component={Frame4} />
      <Route path="/start" component={Start} />
      <Route path="/thankyou" component={ThankYou} />
    </Switch>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
