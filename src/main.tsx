import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
// Self-hosted so no visitor's browser has to contact a third-party font CDN
// before they have consented to anything. Variable faces, 100-900, matching the
// axis the Google Fonts URL used to request.
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './globals.css';

// Last-resort fallback. Deliberately styled with literal inline values rather
// than Tailwind classes or theme custom properties: if the failure being
// caught is itself a stylesheet problem, anything that reads from the design
// tokens would render invisibly and we would be back to a blank page.
const rootFallback = (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      padding: '2rem',
      textAlign: 'center',
      backgroundColor: '#0a0e17',
      color: '#c9d1d9',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    }}
  >
    <p style={{ fontSize: '1.125rem' }}>This page failed to load in your browser.</p>
    <p style={{ color: '#8b96a5' }}>
      Reloading may fix it. If it keeps happening, email{' '}
      <a href="mailto:corbinmeier.solutions@gmail.com" style={{ color: '#3b82f6' }}>
        corbinmeier.solutions@gmail.com
      </a>{' '}
      with your device and browser version.
    </p>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary label="root" fallback={rootFallback}>
      <HelmetProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
