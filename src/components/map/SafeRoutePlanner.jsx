// src/components/map/SafeRoutePlanner.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../Navbar';
import { Link } from 'react-router-dom';
import { Loader } from '@googlemaps/js-api-loader';
import axios from 'axios';
import OpenAIService from '../../services/OpenAIService';

// Define libraries array outside the component to prevent unnecessary reloads
const GOOGLE_MAPS_LIBRARIES = ["places", "routes"];

const SafeRoutePlanner = () => {
  const { user } = useAuth();
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [map, setMap] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [currentHeatIndex, setCurrentHeatIndex] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [alternativeRoutes, setAlternativeRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(0);
  const [weatherData, setWeatherData] = useState(null);
  
  const mapRef = useRef(null);
  const sourceAutocompleteRef = useRef(null);
  const destAutocompleteRef = useRef(null);
  
  // Google Maps API key - In production, you should store this in an environment variable
  const googleMapsApiKey = "AIzaSyD0pKwxjGQvmdWgTAMOUVb-qgqpoXTJ5P0";
  // OpenWeatherMap API key - For getting current weather conditions
  const weatherApiKey = "c7438fac71c1c9abdd58c30073620321";
  
  useEffect(() => {
    // Initialize Google Maps
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: googleMapsApiKey,
          version: "weekly",
          libraries: GOOGLE_MAPS_LIBRARIES // Use the static array defined outside the component
        });
        
        const google = await loader.load();
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 40.7128, lng: -74.0060 }, // Default to New York City
          zoom: 12,
          mapTypeControl: false,
          styles: [
            {
              "featureType": "poi.park",
              "elementType": "geometry.fill",
              "stylers": [
                {
                  "color": "#a5b076"
                },
                {
                  "visibility": "on"
                }
              ]
            },
            {
              "featureType": "road",
              "elementType": "geometry.fill",
              "stylers": [
                {
                  "visibility": "on"
                }
              ]
            }
          ]
        });
        
        // Initialize DirectionsService and DirectionsRenderer
        const dirService = new google.maps.DirectionsService();
        const dirRenderer = new google.maps.DirectionsRenderer({
          map: mapInstance,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: '#FF8C00',
            strokeWeight: 5
          }
        });
        
        // Initialize Autocomplete for source and destination inputs
        const sourceAutocomplete = new google.maps.places.Autocomplete(
          document.getElementById('source-input'),
          { types: ['geocode'] }
        );
        
        const destAutocomplete = new google.maps.places.Autocomplete(
          document.getElementById('destination-input'),
          { types: ['geocode'] }
        );
        
        sourceAutocomplete.addListener('place_changed', () => {
          const place = sourceAutocomplete.getPlace();
          setSource(place.formatted_address);
          
          // If we already have a destination, calculate the route
          if (destination && place.formatted_address) {
            calculateRoute(place.formatted_address, destination);
          }
        });
        
        destAutocomplete.addListener('place_changed', () => {
          const place = destAutocomplete.getPlace();
          setDestination(place.formatted_address);
          
          // If we already have a source, calculate the route
          if (source && place.formatted_address) {
            calculateRoute(source, place.formatted_address);
          }
        });
        
        setMap(mapInstance);
        setDirectionsService(dirService);
        setDirectionsRenderer(dirRenderer);
        sourceAutocompleteRef.current = sourceAutocomplete;
        destAutocompleteRef.current = destAutocomplete;
        
        // Try to get user's current location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              
              mapInstance.setCenter(pos);
              
              // Reverse geocode to get address
              const geocoder = new google.maps.Geocoder();
              geocoder.geocode({ location: pos }, (results, status) => {
                if (status === "OK" && results[0]) {
                  setSource(results[0].formatted_address);
                  document.getElementById('source-input').value = results[0].formatted_address;
                  
                  // Fetch weather data for the current location
                  fetchWeatherData(position.coords.latitude, position.coords.longitude);
                }
              });
            },
            () => {
              setError("Error: The Geolocation service failed.");
            }
          );
        } else {
          setError("Error: Your browser doesn't support geolocation.");
        }
        
      } catch (err) {
        console.error("Error initializing map:", err);
        setError("Failed to load Google Maps. Please try again later.");
      }
    };
    
    initMap();
  }, []);
  
  // Function to fetch weather data
  const fetchWeatherData = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=imperial&appid=${weatherApiKey}`
      );
      
      const data = response.data;
      setWeatherData(data);
      
      // Calculate heat index
      const temp = data.main.temp;
      const humidity = data.main.humidity;
      
      // Simple heat index calculation - for more accuracy you'd use a more complex formula
      const heatIndex = calculateHeatIndex(temp, humidity);
      setCurrentHeatIndex(heatIndex);
      
      // Generate recommendations based on heat index
      generateRecommendations(heatIndex);
      
    } catch (err) {
      console.error("Error fetching weather data:", err);
    }
  };
  
  // Calculate heat index
  const calculateHeatIndex = (temperature, relativeHumidity) => {
    // Simple heat index calculation (Fahrenheit)
    if (temperature < 80) return temperature;
    
    let heatIndex = 0.5 * (temperature + 61.0 + ((temperature - 68.0) * 1.2) + (relativeHumidity * 0.094));
    
    if (heatIndex > 80) {
      heatIndex = -42.379 + 2.04901523 * temperature + 10.14333127 * relativeHumidity
        - 0.22475541 * temperature * relativeHumidity - 0.00683783 * temperature * temperature
        - 0.05481717 * relativeHumidity * relativeHumidity + 0.00122874 * temperature * temperature * relativeHumidity
        + 0.00085282 * temperature * relativeHumidity * relativeHumidity - 0.00000199 * temperature * temperature * relativeHumidity * relativeHumidity;
    }
    
    return Math.round(heatIndex);
  };
  
  // Generate recommendations based on heat index and selected route
  const generateRecommendations = async (heatIndex) => {
    // Start with fallback recommendations
    let routeType = 'direct';
    let duration = 30; // default 30 minutes
    
    // If we have a selected route, use its data
    if (selectedRoute !== null && alternativeRoutes.length > 0) {
      const route = alternativeRoutes[selectedRoute];
      routeType = route.shadeCoverage > 50 ? 'shaded' : 'direct';
      // Extract numeric duration in minutes from string like "25 mins"
      const durationMatch = route.duration.match(/(\d+)/);
      if (durationMatch) {
        duration = parseInt(durationMatch[1], 10);
      }
    }
    
    // Get fallback recommendations in case API call fails
    const fallbackRecs = OpenAIService.getFallbackRecommendations(heatIndex, routeType, duration);
    setRecommendations(fallbackRecs);
    
    // Only call OpenAI API if we have enough data and a selected route
    if (weatherData && selectedRoute !== null && alternativeRoutes.length > 0) {
      try {
        setLoading(true);
        
        // Prepare data for API
        const routeData = alternativeRoutes[selectedRoute];
        const userData = user ? {
          // Get any user profile data that might be relevant
          age: user.age || null,
          healthConditions: user.healthConditions || []
        } : null;
        
        // Call OpenAI service
        const response = await OpenAIService.generateHeatSafetyRecommendations({
          user: userData,
          route: {
            distance: routeData.distance,
            duration: routeData.duration,
            shadeCoverage: routeData.shadeCoverage,
            heatExposureRisk: routeData.heatExposureRisk
          },
          weather: weatherData,
          heatIndex
        });
        
        if (response && response.recommendations && response.recommendations.length > 0) {
          setRecommendations(response.recommendations);
        }
      } catch (error) {
        console.error("Error getting AI recommendations:", error);
        // We'll keep the fallback recommendations already set
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Function to calculate route with alternatives
  const calculateRoute = (start, end) => {
    if (!directionsService || !directionsRenderer) return;
    
    setLoading(true);
    setError('');
    
    const request = {
      origin: start,
      destination: end,
      travelMode: google.maps.TravelMode.WALKING,
      provideRouteAlternatives: true, // Request alternative routes
      unitSystem: google.maps.UnitSystem.IMPERIAL
    };
    
    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        setLoading(false);
        directionsRenderer.setDirections(result);
        directionsRenderer.setRouteIndex(0);
        setSelectedRoute(0);
        
        // Process route alternatives
        if (result.routes && result.routes.length > 0) {
          const routes = result.routes.map((route, index) => {
            // Extract key information about the route
            const distance = route.legs[0].distance.text;
            const duration = route.legs[0].duration.text;
            
            // Calculate shade score (simulated in this example)
            // In a real implementation, you would use tree coverage data, building shadows, etc.
            const shadeCoverage = calculateSimulatedShadeCoverage(route);
            
            // Calculate heat exposure risk based on distance and shade
            const heatExposureRisk = calculateHeatExposureRisk(route, shadeCoverage);
            
            return {
              index,
              distance,
              duration,
              shadeCoverage,
              heatExposureRisk,
              steps: route.legs[0].steps
            };
          });
          
          setAlternativeRoutes(routes);
        }
      } else {
        setLoading(false);
        setError("Directions request failed due to " + status);
      }
    });
  };
  
  // This function would ideally use real GIS data for tree canopy and building shadow coverage
  // For this prototype, we'll use a more sophisticated simulation that considers route factors
  const calculateSimulatedShadeCoverage = (route) => {
    // In a real implementation, you would:
    // 1. Use a tree canopy dataset from the city's GIS department
    // 2. Calculate sun position based on time of day
    // 3. Use building height data to estimate shadows
    // 4. Use satellite imagery analysis for vegetation coverage
    
    let baseShadeCoverage = 35; // Base value for an average urban area
    
    // Analyze route characteristics from Google's data
    if (route.legs && route.legs.length > 0) {
      const steps = route.legs[0].steps;
      
      // Look through steps for indicators of parks, tree-lined streets, etc.
      for (const step of steps) {
        const instructions = step.instructions.toLowerCase();
        
        // Increase shade score for parks and green areas
        if (instructions.includes('park') || instructions.includes('garden') || instructions.includes('trail')) {
          baseShadeCoverage += 15;
        }
        
        // Decrease for major roads which tend to have less shade
        if (instructions.includes('highway') || instructions.includes('major') || 
            instructions.includes('avenue') || instructions.includes('boulevard')) {
          baseShadeCoverage -= 10;
        }
        
        // Increase for residential areas which often have more trees
        if (instructions.includes('residential') || instructions.includes('neighborhood')) {
          baseShadeCoverage += 8;
        }
        
        // Downtown areas often have tall buildings (good for shadow, but less trees)
        if (instructions.includes('downtown') || instructions.includes('center')) {
          baseShadeCoverage += 5;
        }
      }
    }
    
    // Apply time-of-day factors - afternoon sun is strongest
    const currentHour = new Date().getHours();
    if (currentHour >= 10 && currentHour <= 14) {
      baseShadeCoverage -= 15; // Less effective shade during peak sun hours
    } else if (currentHour < 8 || currentHour > 18) {
      baseShadeCoverage += 20; // More effective shade during early morning/evening
    }
    
    // Ensure the final value is within reasonable bounds
    baseShadeCoverage = Math.max(5, Math.min(90, baseShadeCoverage));
    
    return Math.round(baseShadeCoverage);
  };
  
  // Calculate heat exposure risk based on route and shade coverage
  const calculateHeatExposureRisk = (route, shadeCoverage) => {
    // This is a simplified risk assessment
    // In a real app, you would factor in current temperature, humidity, UV index,
    // walking duration, shade, and potentially user health factors
    
    const distance = route.legs[0].distance.value; // Distance in meters
    const duration = route.legs[0].duration.value; // Duration in seconds
    
    // Risk increases with distance and decreases with shade
    let risk = (distance / 1000) * (1 - (shadeCoverage / 100));
    
    // Adjust risk based on current heat index if available
    if (currentHeatIndex) {
      if (currentHeatIndex >= 105) {
        risk *= 3;
      } else if (currentHeatIndex >= 90) {
        risk *= 2;
      } else if (currentHeatIndex >= 80) {
        risk *= 1.5;
      }
    }
    
    // Categorize risk
    if (risk < 0.5) return "Low";
    if (risk < 1.5) return "Moderate";
    if (risk < 3) return "High";
    return "Very High";
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (source && destination) {
      calculateRoute(source, destination);
    }
  };
  
  // Select an alternative route
  const selectRoute = (index) => {
    setSelectedRoute(index);
    if (directionsRenderer) {
      directionsRenderer.setRouteIndex(index);
    }
  };
  
  // Get heat risk color for UI elements
  const getHeatRiskColor = (risk) => {
    switch (risk) {
      case "Low":
        return "bg-green-100 text-green-800 border-green-200";
      case "Moderate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Very High":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  return (
    <div className="min-h-screen bg-amber-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-navy-900">Heat-Safe Route Planner</h1>
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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Route Input and Weather Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Plan Your Route</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="source-input" className="block text-sm font-medium text-gray-700 mb-1">
                    Starting Point
                  </label>
                  <input
                    id="source-input"
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Enter starting location"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="destination-input" className="block text-sm font-medium text-gray-700 mb-1">
                    Destination
                  </label>
                  <input
                    id="destination-input"
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Enter destination"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !source || !destination}
                  className={`w-full ${
                    !loading && source && destination
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : 'bg-gray-300 cursor-not-allowed'
                  } text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Finding Routes...
                    </>
                  ) : (
                    'Find Heat-Safe Routes'
                  )}
                </button>
              </form>
            </div>
            
            {/* Current Weather Information */}
            {weatherData && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Current Conditions</h2>
                
                <div className="flex items-center mb-4">
                  <img 
                    src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                    alt={weatherData.weather[0].description}
                    className="w-16 h-16 mr-2"
                  />
                  <div>
                    <p className="text-2xl font-bold">{Math.round(weatherData.main.temp)}°F</p>
                    <p className="text-gray-600 capitalize">{weatherData.weather[0].description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Feels Like</p>
                    <p className="font-medium">{Math.round(weatherData.main.feels_like)}°F</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Humidity</p>
                    <p className="font-medium">{weatherData.main.humidity}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Wind</p>
                    <p className="font-medium">{Math.round(weatherData.wind.speed)} mph</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Heat Index</p>
                    <p className="font-medium">{currentHeatIndex || "N/A"}°F</p>
                  </div>
                </div>
                
                {currentHeatIndex && (
                  <div className={`mt-4 p-3 rounded-lg border ${
                    currentHeatIndex >= 105
                      ? 'bg-red-100 border-red-300 text-red-800'
                      : currentHeatIndex >= 90
                      ? 'bg-orange-100 border-orange-300 text-orange-800'
                      : currentHeatIndex >= 80
                      ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
                      : 'bg-green-100 border-green-300 text-green-800'
                  }`}>
                    <p className="font-medium">
                      {currentHeatIndex >= 105
                        ? "Danger: Extreme heat conditions"
                        : currentHeatIndex >= 90
                        ? "Warning: High heat risk"
                        : currentHeatIndex >= 80
                        ? "Caution: Moderate heat risk"
                        : "Low heat risk"}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Heat Safety Recommendations */}
            {recommendations.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Heat Safety Tips</h2>
                
                <ul className="space-y-2">
                  {recommendations.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-amber-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                      </svg>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Right Column - Map and Routes */}
          <div className="lg:col-span-2">
            {/* Map Container */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div
                ref={mapRef}
                className="w-full h-96 rounded-lg"
                style={{ minHeight: "400px" }}
              ></div>
            </div>
            
            {/* Route Alternatives */}
            {alternativeRoutes.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Available Routes</h2>
                
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                )}
                
                <div className="space-y-4">
                  {alternativeRoutes.map((route, index) => (
                    <div 
                      key={index}
                      className={`border rounded-lg p-4 cursor-pointer transition duration-200 ${
                        selectedRoute === index 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => selectRoute(index)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">
                          Route {index + 1} {index === 0 ? " (Fastest)" : ""}
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full border ${getHeatRiskColor(route.heatExposureRisk)}`}>
                          {route.heatExposureRisk} Heat Risk
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <div>
                          <p className="text-xs text-gray-500">Distance</p>
                          <p className="font-medium">{route.distance}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Est. Time</p>
                          <p className="font-medium">{route.duration}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Shade Coverage</p>
                          <p className="font-medium">{route.shadeCoverage}%</p>
                        </div>
                      </div>
                      
                      {selectedRoute === index && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm font-medium mb-2">Route Overview:</p>
                          <ul className="space-y-1 text-sm text-gray-600">
                            {route.steps.slice(0, 3).map((step, stepIndex) => (
                              <li key={stepIndex} className="flex items-start">
                                <span className="inline-block bg-gray-200 text-gray-700 w-5 h-5 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5">
                                  {stepIndex + 1}
                                </span>
                                <span dangerouslySetInnerHTML={{ __html: step.instructions }}></span>
                              </li>
                            ))}
                            {route.steps.length > 3 && (
                              <li className="text-xs text-gray-500 italic pl-7">
                                + {route.steps.length - 3} more steps
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafeRoutePlanner;