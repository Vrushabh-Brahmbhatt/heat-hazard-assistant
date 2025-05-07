// src/services/OpenAIService.js
import axios from 'axios';

// This service handles communication with the OpenAI API
// You'll need to set up a server-side proxy to securely handle API keys
// For a production app, don't expose your OpenAI API key directly in the client

// In a production environment, you would configure this properly with environment variables
// For development purposes, we're using a direct value
const BACKEND_API_URL = 'https://your-backend-api.com';

/**
 * Generate personalized heat safety recommendations based on user data and current conditions
 * @param {Object} data - Object containing route and weather data
 * @param {Object} data.user - User profile information (optional)
 * @param {Object} data.route - Selected route information
 * @param {Object} data.weather - Current weather conditions
 * @param {number} data.heatIndex - Calculated heat index
 * @returns {Promise<Object>} OpenAI API response with recommendations
 */
export const generateHeatSafetyRecommendations = async (data) => {
  try {
    // In a production app, you would send this request to your backend
    // which would then make the actual OpenAI API call with your API key
    const response = await axios.post(`${BACKEND_API_URL}/api/openai/recommendations`, {
      data
    });
    
    return response.data;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw error;
  }
};

/**
 * Generates fallback recommendations when API is unavailable
 * @param {number} heatIndex - Current heat index in Fahrenheit
 * @param {string} routeType - Type of route (e.g., 'shaded', 'direct', etc.)
 * @param {number} duration - Estimated duration of the journey in minutes
 * @returns {Array<string>} Array of recommendation strings
 */
export const getFallbackRecommendations = (heatIndex, routeType, duration) => {
  const recommendations = [
    "Stay hydrated by drinking water before, during, and after your journey.",
    "Wear lightweight, light-colored, loose-fitting clothing.",
    "Apply sunscreen with SPF 30+ to exposed skin.",
    "Wear a wide-brimmed hat and sunglasses."
  ];
  
  // Add heat index specific recommendations
  if (heatIndex >= 105) {
    recommendations.push(
      "EXTREME DANGER: Consider postponing your journey if possible.",
      "If you must go outside, take frequent breaks in air-conditioned spaces.",
      "Watch for signs of heat stroke: high body temperature, altered mental state, nausea.",
      "Call emergency services immediately if you or someone else shows signs of heat stroke."
    );
  } else if (heatIndex >= 90) {
    recommendations.push(
      "DANGER: Limit outdoor activity during the hottest part of the day (10am-4pm).",
      "Take frequent breaks in shaded or air-conditioned areas.",
      "Watch for signs of heat exhaustion: heavy sweating, weakness, dizziness.",
      "Consider using public transportation for part of your journey to reduce exposure."
    );
  } else if (heatIndex >= 80) {
    recommendations.push(
      "CAUTION: Take breaks in shaded areas as needed.",
      "Consider carrying a personal fan or cooling towel.",
      "Pay attention to how you feel and slow down if necessary."
    );
  }
  
  // Add route-specific recommendations
  if (routeType === 'shaded') {
    recommendations.push(
      "Your selected route maximizes shade coverage.",
      "Even in shaded areas, remember that heat can still affect you."
    );
  } else if (routeType === 'direct') {
    recommendations.push(
      "This direct route has limited shade coverage.",
      "Consider carrying an umbrella for additional sun protection."
    );
  }
  
  // Add duration-specific recommendations
  if (duration > 45) {
    recommendations.push(
      "For journeys over 45 minutes, bring extra water and electrolyte drinks.",
      "Plan for rest stops along the way.",
      "Consider breaking your journey into smaller segments."
    );
  }
  
  return recommendations;
};

export default {
  generateHeatSafetyRecommendations,
  getFallbackRecommendations
};