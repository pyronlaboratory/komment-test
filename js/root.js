import React, { useEffect } from 'react';
import {
  Switch,
  Route,
  useLocation
} from 'react-router-dom';

import './css/style.scss';

import AOS from 'aos';
import { focusHandling } from 'cruip-js-toolkit';

import Home from './pages/Home';
import SignIn from './pages/SignIn';
import Donate from './pages/Donate';
import ResetPassword from './pages/ResetPassword';

/**
 * @description This component initialization establishes an AOS (Animate on Scrolling)
 * instance.
 * 
 * @returns { Component } Function returns a JSX element built from routes rendered
 * within a Switch component.
 */
function App() {

  const location = useLocation();

  useEffect(() => {
    AOS.init({
      once: true,
      disable: 'phone',
      duration: 700,
      easing: 'ease-out-cubic',
    });
  });

  useEffect(() => {
    document.querySelector('html').style.scrollBehavior = 'auto'
    window.scroll({ top: 0 })
    document.querySelector('html').style.scrollBehavior = ''
    focusHandling('outline');
  }, [location.pathname]); // triggered on route change

  return (
    <>
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/signin">
          <SignIn />
        </Route>
        <Route path="/donate">
          <Donate />
        </Route>
        <Route path="/reset-password">
          <ResetPassword />
        </Route>
      </Switch>
    </>
  );
}

export default App;
