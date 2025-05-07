// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // List of admin emails - keep this in sync with your AdminPanel component
  const adminEmails = ['vrushabhbhatt9123@gmail.com'];
  
  // Check if current user is an admin
  const isAdmin = user && adminEmails.includes(user.email);
  
  // Function to handle report issue click
  const handleReportIssueClick = (e) => {
    if (isAdmin) {
      e.preventDefault();
      navigate('/admin');
    }
    // For non-admins, the normal link behavior will work
  };

  return (
    <nav className="bg-transparent py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-navy-900 ml-4 font-bold text-xl">
            HeatSafe
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden mr-4 md:flex space-x-8">
            <Link to="/heat-map" className="text-navy-900 hover:text-blue-600 font-medium">
              Heat Map
            </Link>
            <Link to="/tips" className="text-navy-900 hover:text-blue-600 font-medium">
              Tips
            </Link>
            <Link 
              to="/report-issue" 
              className="text-navy-900 hover:text-blue-600 font-medium"
              onClick={handleReportIssueClick}
            >
              Report Issue
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-blue-600 hover:text-blue-800 font-medium">
                Admin Panel
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden focus:outline-none"
          >
            <svg className="w-6 h-6 text-navy-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 bg-white shadow-lg rounded-lg p-4">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/heat-map" 
                className="text-navy-900 hover:text-blue-600 font-medium p-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Heat Map
              </Link>
              <Link 
                to="/tips" 
                className="text-navy-900 hover:text-blue-600 font-medium p-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Tips
              </Link>
              <Link 
                to="/report-issue" 
                className="text-navy-900 hover:text-blue-600 font-medium p-2"
                onClick={(e) => {
                  setIsMenuOpen(false);
                  handleReportIssueClick(e);
                }}
              >
                Report Issue
              </Link>
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="text-blue-600 hover:text-blue-800 font-medium p-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;