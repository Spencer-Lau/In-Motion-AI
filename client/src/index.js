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
