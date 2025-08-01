import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Welcome from './pages/welcome';
import Page2 from './pages/page2';
import Page3 from './pages/page3';
import Page4 from './pages/page4';
import Start from './pages/start';
import Thankyou from './pages/thankyou';
function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Welcome} />
        <Route path="/page2" component={Page2} />
        <Route path="/page3" component={Page3} />
        <Route path="/page4" component={Page4} />
        <Route path="/start" component={Start} />
        <Route path="/thankyou" component={Thankyou} />

      </Switch>
    </Router>
  );
}

export default App;
