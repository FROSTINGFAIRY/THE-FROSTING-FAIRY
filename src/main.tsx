import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

// Gracefully prevent unhandled popup dismissal exceptions from crashing the browser runtime
window.addEventListener('unhandledrejection', (event) => {
  const reason = event?.reason;
  const msg = typeof reason === 'string' ? reason : (reason?.message || '');
  const code = reason?.code || '';
  if (
    code === 'auth/popup-closed-by-user' ||
    code === 'auth/cancelled-popup-request' ||
    code === 'auth/user-cancelled' ||
    msg.includes('popup-closed-by-user') ||
    msg.includes('cancelled-popup-request') ||
    msg.includes('Pending promise was never set')
  ) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

