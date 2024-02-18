import { Routes } from '@generouted/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './main.css';

// Hack for use-dark-mode
window.global = globalThis;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Routes />
  </React.StrictMode>,
);
