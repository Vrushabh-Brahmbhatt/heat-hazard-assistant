// src/main.jsx
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css'; // Important: This line must be present
import { AuthProvider } from './contexts/AuthContext';

// Import i18n configuration - must be imported before the App component
import './i18n';

// Loading component while translations are being loaded
const Loading = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-amber-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={<Loading />}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </Suspense>
  </React.StrictMode>,
);