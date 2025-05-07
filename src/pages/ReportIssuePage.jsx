// src/pages/ReportIssuePage.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, addDoc, Timestamp, GeoPoint } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const ReportIssuePage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    issueType: '',
    location: '',
    description: '',
    severity: 'medium',
    contactEmail: user ? user.email : '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [locationCoords, setLocationCoords] = useState(null);

  // Initialize Google Maps Places Autocomplete
  useEffect(() => {
    // Load Google Maps script with Places library if not already loaded
    if (!window.google && !document.getElementById('google-maps-script')) {
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;

      // Initialize autocomplete when script loads
      script.onload = initializeAutocomplete;

      document.head.appendChild(script);
    } else if (window.google) {
      // Script already loaded, just initialize autocomplete
      initializeAutocomplete();
    }
  }, []);

  const initializeAutocomplete = () => {
    if (!window.google || !window.google.maps || !window.google.maps.places) return;

    const input = document.getElementById('location');
    if (!input) return;

    const autocompleteOptions = {
      types: ['geocode']
    };

    const autocomplete = new window.google.maps.places.Autocomplete(input, autocompleteOptions);

    // Listen for place selection
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();

      if (place.geometry && place.geometry.location) {
        // Store coordinates for submission
        setLocationCoords({
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng()
        });

        // Update location field with formatted address
        setFormData(prev => ({
          ...prev,
          location: place.formatted_address
        }));
      }
    });
  };

  const issueTypes = [
    { value: 'broken_water', label: 'Broken Water Fountain' },
    { value: 'no_shade', label: 'No Shade Available' },
    { value: 'hot_pavement', label: 'Dangerously Hot Pavement' },
    { value: 'cooling_center', label: 'Cooling Center Issue' },
    { value: 'other', label: 'Other' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationDetection = () => {
    if (navigator.geolocation) {
      setUseCurrentLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocationCoords({ latitude, longitude });

          // Use reverse geocoding to get a human-readable address
          try {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
              if (status === 'OK' && results[0]) {
                setFormData(prev => ({
                  ...prev,
                  location: results[0].formatted_address
                }));
              } else {
                // Fallback to coordinates if geocoding fails
                setFormData(prev => ({
                  ...prev,
                  location: `Lat: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)}`
                }));
              }
              setUseCurrentLocation(false);
            });
          } catch (err) {
            // Fallback if geocoder fails
            setFormData(prev => ({
              ...prev,
              location: `Lat: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)}`
            }));
            setUseCurrentLocation(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to detect location. Please enter manually.');
          setUseCurrentLocation(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.issueType || !formData.location || !formData.description) {
      setError('Please fill out all required fields.');
      return;
    }

    if (!user) {
      setError('You must be logged in to submit a report.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Create report object
      // In handleSubmit function, modify the reportData object:
      const reportData = {
        issueType: formData.issueType,
        description: formData.description,
        severity: formData.severity,
        contactEmail: formData.contactEmail,
        location: formData.location,
        // Store the coordinates as a GeoPoint if available
        coordinates: locationCoords
          ? new GeoPoint(locationCoords.latitude, locationCoords.longitude)
          : null,
        // Add user ID and timestamps
        userId: user.uid,
        userName: user.displayName || user.email,
        timestamp: Timestamp.now(),
        status: 'pending',
        // Add initial status update
        statusUpdates: [{
          status: 'pending',
          timestamp: Timestamp.now(),
          updatedBy: 'system',
          updaterName: 'System',
          note: 'Report submitted'
        }]
      };
      // Save to Firestore
      const docRef = await addDoc(collection(db, "heatHazardReports"), reportData);
      console.log('Report submitted with these details:', {
        id: docRef.id,
        userId: reportData.userId,
        collection: "heatHazardReports"
      });

      setSubmitted(true);

      // Reset form
      setFormData({
        issueType: '',
        location: '',
        description: '',
        severity: 'medium',
        contactEmail: user ? user.email : '',
      });
      setLocationCoords(null);
      setUseCurrentLocation(false);
    } catch (err) {
      console.error('Error submitting report:', err);
      setError('Failed to submit report. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-navy-900">Report Heat Issue</h1>
          <Link
            to="/"
            className="bg-white hover:bg-gray-100 text-navy-900 font-semibold py-2 px-4 rounded-lg border border-gray-300 transition duration-300 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <p className="text-lg">
            Help make your community safer by reporting heat-related issues. Your reports help
            us identify areas that need attention and resources.
          </p>
        </div>

        {submitted ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p className="font-semibold">Thank you for your report!</p>
            <p>Your submission helps make our community safer during extreme heat events.</p>
            <div className="mt-4 flex space-x-4">
              <button
                onClick={() => setSubmitted(false)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
              >
                Submit Another Report
              </button>
              <Link
                to="/profile"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
              >
                View My Reports
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {!user && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                <p className="font-semibold">You need to be logged in to submit a report.</p>
                <p>Please <Link to="/" className="underline font-medium">sign in or create an account</Link> first.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Issue Type */}
              <div>
                <label htmlFor="issueType" className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Type <span className="text-red-600">*</span>
                </label>
                <select
                  id="issueType"
                  name="issueType"
                  value={formData.issueType}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select an issue type</option>
                  {issueTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location <span className="text-red-600">*</span>
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter location or address"
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={useCurrentLocation && !formData.location}
                  />
                  <button
                    type="button"
                    onClick={handleLocationDetection}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg flex items-center"
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Use My Location
                  </button>
                </div>
                {useCurrentLocation && !formData.location && (
                  <p className="mt-1 text-sm text-gray-500">Detecting your location...</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Type an address to see suggestions or use your current location.
                </p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Please describe the issue in detail"
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                ></textarea>
              </div>

              {/* Severity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity
                </label>
                <div className="flex space-x-4">
                  {['low', 'medium', 'high'].map((severity) => (
                    <label key={severity} className="flex items-center">
                      <input
                        type="radio"
                        name="severity"
                        value={severity}
                        checked={formData.severity === severity}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700 capitalize">{severity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Contact Email */}
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="Your email (optional)"
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  We'll only use this to follow up about this specific report if needed.
                </p>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={submitting || !user}
                  className={`w-full ${user ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'} text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center`}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Submit Report'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportIssuePage;