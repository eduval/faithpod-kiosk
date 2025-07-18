import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import './style.css';
import Welcome from './pages/welcome';
import Frame2 from './pages/frame2';
import Frame3 from './pages/frame3';
import Frame4 from './pages/frame4';
import Start from './pages/start';
import ThankYou from './pages/thankyou';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route component={Welcome} exact path="/" />
        <Route component={Frame2} path="/page2" />
        <Route component={Frame3} path="/page3" />
        <Route component={Frame4} path="/page4" />
        <Route component={Start} path="/start" />
        <Route component={ThankYou} path="/thankyou" />
      </Switch>
    </Router>
  );
};

ReactDOM.render(<App />, document.getElementById('app'));
