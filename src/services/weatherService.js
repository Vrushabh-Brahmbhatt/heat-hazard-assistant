// src/services/weatherService.js
import axios from 'axios';

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const NASA_POWER_API_BASE_URL = 'https://power.larc.nasa.gov/api/temporal/daily/point';

/**
 * Get current weather data from OpenWeather API
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise} - Weather data
 */
export const getCurrentWeather = async (lat, lon) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw error;
  }
};

/**
 * Get 5-day weather forecast from OpenWeather API
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise} - Forecast data
 */
export const getWeatherForecast = async (lat, lon) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw error;
  }
};

/**
 * Get historical weather data from NASA POWER API
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} startDate - Start date in YYYYMMDD format
 * @param {string} endDate - End date in YYYYMMDD format
 * @returns {Promise} - Historical weather data
 */
export const getHistoricalWeather = async (lat, lon, startDate, endDate) => {
  try {
    const params = {
      parameters: 'T2M,RH2M,ALLSKY_SFC_SW_DWN', // Temperature, Relative Humidity, Solar Radiation
      community: 'RE',
      longitude: lon,
      latitude: lat,
      start: startDate,
      end: endDate,
      format: 'JSON'
    };
    
    const response = await axios.get(NASA_POWER_API_BASE_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching historical weather:', error);
    throw error;
  }
};

/**
 * Calculate heat index based on temperature and humidity
 * @param {number} temperature - Temperature in Celsius
 * @param {number} humidity - Relative humidity percentage
 * @returns {object} - Heat index value and risk level
 */
export const calculateHeatIndex = (temperature, humidity) => {
  // Convert Celsius to Fahrenheit for the standard heat index formula
  const tempF = (temperature * 9/5) + 32;
  
  // Simplified heat index calculation
  let heatIndexF = 0.5 * (tempF + 61.0 + ((tempF - 68.0) * 1.2) + (humidity * 0.094));
  
  if (heatIndexF > 79) {
    // More precise calculation for higher temperatures
    heatIndexF = -42.379 + 2.04901523 * tempF + 10.14333127 * humidity
                - 0.22475541 * tempF * humidity - 6.83783e-3 * tempF * tempF
                - 5.481717e-2 * humidity * humidity + 1.22874e-3 * tempF * tempF * humidity
                + 8.5282e-4 * tempF * humidity * humidity - 1.99e-6 * tempF * tempF * humidity * humidity;
  }
  
  // Convert back to Celsius
  const heatIndexC = (heatIndexF - 32) * 5/9;
  
  // Determine risk level
  let riskLevel = 'Low';
  let color = 'green';
  
  if (heatIndexC > 54) {
    riskLevel = 'Extreme Danger';
    color = 'darkred';
  } else if (heatIndexC > 41) {
    riskLevel = 'Danger';
    color = 'red';
  } else if (heatIndexC > 32) {
    riskLevel = 'Extreme Caution';
    color = 'orange';
  } else if (heatIndexC > 27) {
    riskLevel = 'Caution';
    color = 'yellow';
  }
  
  return {
    value: heatIndexC.toFixed(1),
    fahrenheit: heatIndexF.toFixed(1),
    riskLevel,
    color
  };
};

