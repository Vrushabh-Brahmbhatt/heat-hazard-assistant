// src/components/data/HistoricalHeatData.jsx
import React, { useState, useEffect } from 'react';
import { getHistoricalWeather } from '../../services/weatherService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const HistoricalHeatData = ({ location }) => {
  const [historicalData, setHistoricalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week'); // week, month, year
  const [dataType, setDataType] = useState('temperature'); // temperature, humidity, heatIndex

  useEffect(() => {
    if (!location || !location.lat || !location.lng) return;

    const fetchHistoricalData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Calculate date range based on selected time range
        const endDate = new Date();
        let startDate;

        if (timeRange === 'week') {
          startDate = new Date();
          startDate.setDate(endDate.getDate() - 7);
        } else if (timeRange === 'month') {
          startDate = new Date();
          startDate.setMonth(endDate.getMonth() - 1);
        } else if (timeRange === 'year') {
          startDate = new Date();
          startDate.setFullYear(endDate.getFullYear() - 1);
        }

        // Format dates for API call (YYYYMMDD)
        const formatDate = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}${month}${day}`;
        };

        const data = await getHistoricalWeather(
          location.lat,
          location.lng,
          formatDate(startDate),
          formatDate(endDate)
        );

        // Process data for chart
        const processedData = processHistoricalData(data, timeRange, dataType);
        setHistoricalData(processedData);
      } catch (err) {
        console.error('Error fetching historical data:', err);
        setError('Unable to load historical data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [location, timeRange, dataType]);

  // Process raw historical data into chart-friendly format
  const processHistoricalData = (rawData, timeRange, dataType) => {
    // This is a simplified example. In a real application, you would
    // process the actual data returned by the NASA POWER API.
    
    // For demo purposes, let's generate some sample data
    const generateSampleData = () => {
      const data = [];
      const now = new Date();
      let daysToGenerate;
      
      if (timeRange === 'week') {
        daysToGenerate = 7;
      } else if (timeRange === 'month') {
        daysToGenerate = 30;
      } else {
        daysToGenerate = 12; // For year, we'll do monthly averages
      }
      
      for (let i = daysToGenerate - 1; i >= 0; i--) {
        const date = new Date();
        
        if (timeRange === 'year') {
          // For yearly view, go back by months
          date.setMonth(now.getMonth() - i);
          const monthName = date.toLocaleString('default', { month: 'short' });
          
          // Generate temperature in a realistic range with seasonal variation
          const seasonalFactor = Math.sin((date.getMonth() / 12) * 2 * Math.PI);
          const baseTemp = 25; // Base temperature in °C
          const tempVariation = 10; // Temperature variation amplitude
          const tempValue = baseTemp + (seasonalFactor * tempVariation) + (Math.random() * 2 - 1);
          
          // Generate humidity inversely related to temperature
          const humidityValue = 70 - (seasonalFactor * 20) + (Math.random() * 10 - 5);
          
          // Calculate heat index
          const heatIndexValue = calculateHeatIndex(tempValue, humidityValue);
          
          data.push({
            date: monthName,
            temperature: tempValue.toFixed(1),
            humidity: humidityValue.toFixed(1),
            heatIndex: heatIndexValue.toFixed(1)
          });
        } else {
          // For week or month view, go back by days
          date.setDate(now.getDate() - i);
          
          let dateLabel;
          if (timeRange === 'week') {
            dateLabel = date.toLocaleString('default', { weekday: 'short' });
          } else {
            dateLabel = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
          }
          
          // Generate temperature with daily variation
          const hourlyVariation = Math.sin((date.getDate() / 30) * 2 * Math.PI);
          const baseTemp = 28; // Base temperature in °C
          const tempVariation = 5; // Temperature variation amplitude
          const tempValue = baseTemp + (hourlyVariation * tempVariation) + (Math.random() * 3 - 1.5);
          
          // Generate humidity inversely related to temperature
          const humidityValue = 65 - (hourlyVariation * 15) + (Math.random() * 10 - 5);
          
          // Calculate heat index
          const heatIndexValue = calculateHeatIndex(tempValue, humidityValue);
          
          data.push({
            date: dateLabel,
            temperature: tempValue.toFixed(1),
            humidity: humidityValue.toFixed(1),
            heatIndex: heatIndexValue.toFixed(1)
          });
        }
      }
      
      return data;
    };
    
    // Simple heat index calculation
    const calculateHeatIndex = (temperature, humidity) => {
      if (temperature < 20) return temperature; // Heat index only relevant at higher temperatures
      
      // Convert to Fahrenheit for the standard heat index formula
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
      return heatIndexC;
    };
    
    // Generate sample data
    return generateSampleData();
  };

  // Get color for data type
  const getDataTypeColor = (type) => {
    switch (type) {
      case 'temperature':
        return '#ef4444'; // red-500
      case 'humidity':
        return '#3b82f6'; // blue-500
      case 'heatIndex':
        return '#f59e0b'; // amber-500
      default:
        return '#6b7280'; // gray-500
    }
  };

  // Get label for data type
  const getDataTypeLabel = (type) => {
    switch (type) {
      case 'temperature':
        return 'Temperature (°C)';
      case 'humidity':
        return 'Humidity (%)';
      case 'heatIndex':
        return 'Heat Index (°C)';
      default:
        return type;
    }
  };

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium text-gray-700">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name === 'temperature' ? 'Temperature: ' : 
               entry.name === 'humidity' ? 'Humidity: ' : 
               'Heat Index: '}
              {entry.value} {entry.name === 'temperature' || entry.name === 'heatIndex' ? '°C' : '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Determine which lines to show based on data type
  const shouldShowLine = (type) => {
    if (dataType === 'all') return true;
    return dataType === type;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-indigo-600 p-4">
        <h2 className="text-xl font-semibold text-white">Historical Heat Data</h2>
        <p className="text-indigo-100">Analyze past temperature, humidity, and heat index trends</p>
      </div>
      
      <div className="p-4">
        {/* Controls */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-3 md:space-y-0">
          <div>
            <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
            <select
              id="timeRange"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="year">Past Year</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="dataType" className="block text-sm font-medium text-gray-700 mb-1">Data Type</label>
            <select
              id="dataType"
              value={dataType}
              onChange={(e) => setDataType(e.target.value)}
              className="border border-gray-300 rounded-lg py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Data</option>
              <option value="temperature">Temperature</option>
              <option value="humidity">Humidity</option>
              <option value="heatIndex">Heat Index</option>
            </select>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {/* Chart */}
        <div className="h-80">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : historicalData ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={historicalData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#4B5563' }}
                />
                <YAxis 
                  yAxisId="left"
                  orientation="left"
                  tick={{ fill: '#4B5563' }}
                  label={{ 
                    value: dataType === 'all' ? 'Temperature & Heat Index (°C)' : getDataTypeLabel(dataType),
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: '#4B5563' }
                  }}
                />
                {(dataType === 'all' || dataType === 'humidity') && (
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: '#4B5563' }}
                    domain={[0, 100]}
                    label={{ 
                      value: 'Humidity (%)', 
                      angle: 90, 
                      position: 'insideRight',
                      style: { textAnchor: 'middle', fill: '#4B5563' }
                    }}
                  />
                )}
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {(dataType === 'all' || dataType === 'temperature') && (
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    name="Temperature"
                    stroke={getDataTypeColor('temperature')}
                    yAxisId="left"
                    activeDot={{ r: 8 }}
                  />
                )}
                {(dataType === 'all' || dataType === 'humidity') && (
                  <Line
                    type="monotone"
                    dataKey="humidity"
                    name="Humidity"
                    stroke={getDataTypeColor('humidity')}
                    yAxisId="right"
                  />
                )}
                {(dataType === 'all' || dataType === 'heatIndex') && (
                  <Line
                    type="monotone"
                    dataKey="heatIndex"
                    name="Heat Index"
                    stroke={getDataTypeColor('heatIndex')}
                    yAxisId="left"
                    strokeDasharray="5 5"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">No historical data available</p>
            </div>
          )}
        </div>
        
        {/* Data Analysis */}
        {historicalData && (
          <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-3">Heat Pattern Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-amber-50 p-3 rounded-lg">
                <h4 className="font-medium text-amber-800">Average Temperature</h4>
                <p className="text-xl font-bold text-amber-700">
                  {(historicalData.reduce((sum, item) => sum + parseFloat(item.temperature), 0) / historicalData.length).toFixed(1)}°C
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {timeRange === 'week' ? 'Past 7 days' : timeRange === 'month' ? 'Past 30 days' : 'Past 12 months'}
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-medium text-blue-800">Average Humidity</h4>
                <p className="text-xl font-bold text-blue-700">
                  {(historicalData.reduce((sum, item) => sum + parseFloat(item.humidity), 0) / historicalData.length).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {timeRange === 'week' ? 'Past 7 days' : timeRange === 'month' ? 'Past 30 days' : 'Past 12 months'}
                </p>
              </div>
              
              <div className="bg-red-50 p-3 rounded-lg">
                <h4 className="font-medium text-red-800">Maximum Heat Index</h4>
                <p className="text-xl font-bold text-red-700">
                  {Math.max(...historicalData.map(item => parseFloat(item.heatIndex))).toFixed(1)}°C
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {timeRange === 'week' ? 'Past 7 days' : timeRange === 'month' ? 'Past 30 days' : 'Past 12 months'}
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium text-gray-800 mb-2">Heat Insights</h4>
              <ul className="space-y-1 text-gray-700">
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">•</span>
                  <span>
                    {timeRange === 'week' 
                      ? 'Daily temperature variations show highest heat risk during mid-afternoon hours.'
                      : timeRange === 'month'
                      ? 'Recent trend shows temperature fluctuations with periodic heat waves.'
                      : 'Seasonal pattern shows higher heat stress during summer months.'}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>
                    {timeRange === 'week'
                      ? 'Humidity tends to be highest in early morning and evening hours.'
                      : timeRange === 'month'
                      ? 'Humidity patterns show correlation with recent precipitation events.'
                      : 'Humidity levels vary seasonally, with different patterns of heat risk.'}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>
                    {timeRange === 'week'
                      ? 'Heat index exceeded caution levels on ' + (historicalData.filter(item => parseFloat(item.heatIndex) > 27).length) + ' days this week.'
                      : timeRange === 'month'
                      ? 'Heat index shows ' + (historicalData.filter(item => parseFloat(item.heatIndex) > 27).length) + ' days of elevated risk this month.'
                      : 'Annual data shows extended periods of heat risk during ' + (historicalData.filter(item => parseFloat(item.heatIndex) > 27).length > 6 ? 'summer and early fall' : 'summer months') + '.'}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoricalHeatData;