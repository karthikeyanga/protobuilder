import React from 'react';
import ReactDOM from 'react-dom/client';
import { RuntimeShell } from './ui/RuntimeShell';
import './styles.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <RuntimeShell />
  </React.StrictMode>
);


