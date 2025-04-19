import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n'; // Import i18n configuration
import './index.css';
import './styles/global.css';
import { APP_CONFIG } from './config';

// Initialize the application
const initApp = () => {
  // Create root element
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Root element not found');
    return;
  }

  // Set application title
  document.title = APP_CONFIG.appName;

  // Render the application
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Start the application
initApp();
