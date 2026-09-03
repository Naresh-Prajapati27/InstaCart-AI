import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Suppress benign WebSocket / Vite HMR connection errors in preview container
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const reasonStr = String(reason || '');
  if (
    reasonStr.includes('WebSocket') ||
    reasonStr.includes('vite') ||
    (reason && typeof reason === 'object' && reason.message && String(reason.message).includes('WebSocket'))
  ) {
    event.preventDefault();
  }
});

window.addEventListener('error', (event) => {
  const msg = String(event.message || '');
  if (
    msg.includes('WebSocket') ||
    msg.includes('[vite]') ||
    msg.includes('vite')
  ) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
