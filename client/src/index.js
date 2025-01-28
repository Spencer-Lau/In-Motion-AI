// entry point to the app
// renders the root ReactDOM node into the DOM
// wraps the app with context providers, e.g., React, Redux, or theme providers

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode> // taken out to prevent components re-rendering a second time
    <App />
  // </React.StrictMode> // taken out to prevent components re-rendering a second time
);
