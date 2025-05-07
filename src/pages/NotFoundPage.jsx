// src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-6xl font-bold text-navy-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-navy-800 mb-6">Page Not Found</h2>
      <p className="text-lg text-gray-600 max-w-md mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full inline-block transition duration-300"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;