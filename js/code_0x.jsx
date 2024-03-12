import React, { useState } from 'react';

const Article = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const repo = 'ponyfoo';

  let loginButton;
  if (loggedIn) {
    loginButton = <LogoutButton />;
  } else {
    loginButton = <LoginButton />;
  }

  const conditionalRender = (
    <nav>
      <Home />
      {loggedIn && <LogoutButton /> || <LoginButton />}
    </nav>
  );

  const comments = `<!--[if lte IE 8]>
    <script src="/js/html5shim.js"></script>
  <![endif]-->`;

  return (
    <div>
      <h1>React, JSX, and ES6: The Weird Parts</h1>
      <p>By Nicolás Bevacqua | Aug 25th, 2015</p>
      <p>11m | 0</p>
      <div>
        <span>foo {'bar'} {'baz'}</span>
        <head dangerouslySetInnerHTML={{ __html: comments }} />
      </div>
      <p>JSX is the new XHTML.</p>
      <p>React being one of the communities that push ES6 most aggressively...</p>
      <p>Unexpected and automatic DOM element insertion...</p>
      <p>Using conditionals in your view components...</p>
      <p>Declaring a doctype...</p>
      <p>Components coupled to client-side code and ES6...</p>
      <p>Wrapping Up...</p>
      {loginButton}
      {conditionalRender}
      <FetchData repo={repo} />
    </div>
  );
};

const LogoutButton = () => <button>Logout</button>;
const LoginButton = () => <button>Login</button>;
const Home = () => <span>Home</span>;

const FetchData = ({ repo }) => {
  const fetchData = async () => {
    try {
      const response = await fetch(`/repos/${repo}`);
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  fetchData();

  return <div>Loading...</div>;
};

export default Article;
