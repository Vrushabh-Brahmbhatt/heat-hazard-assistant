// src/services/mapService.js
import axios from 'axios';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

/**
 * Geocode an address to coordinates
 * @param {string} address - Address to geocode
 * @returns {Promise} - Geocoding result
 */
export const geocodeAddress = async (address) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
        formattedAddress: response.data.results[0].formatted_address
      };
    } else {
      throw new Error('Geocoding failed: ' + response.data.status);
    }
  } catch (error) {
    console.error('Error geocoding address:', error);
    throw error;
  }
};

/**
 * Reverse geocode coordinates to an address
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise} - Reverse geocoding result
 */
export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    if (response.data.status === 'OK' && response.data.results.length > 0) {
      return {
        formattedAddress: response.data.results[0].formatted_address,
        addressComponents: response.data.results[0].address_components
      };
    } else {
      throw new Error('Reverse geocoding failed: ' + response.data.status);
    }
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    throw error;
  }
};

/**
 * Get directions between two points
 * @param {object} origin - Origin location {lat, lng}
 * @param {object} destination - Destination location {lat, lng}
 * @param {string} mode - Travel mode (walking, bicycling, driving, transit)
 * @returns {Promise} - Directions result
 */
export const getDirections = async (origin, destination, mode = 'walking') => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    if (response.data.status === 'OK' && response.data.routes.length > 0) {
      return response.data.routes[0];
    } else {
      throw new Error('Directions request failed: ' + response.data.status);
    }
  } catch (error) {
    console.error('Error getting directions:', error);
    throw error;
  }
};

