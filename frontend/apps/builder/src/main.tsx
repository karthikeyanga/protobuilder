import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './ui/App';
import { BrowserRouter } from 'react-router-dom';
import './styles.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter basename="/builder">
      <App />
    </BrowserRouter>
  </React.StrictMode>
);


