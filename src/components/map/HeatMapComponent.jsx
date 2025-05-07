// src/components/map/HeatMapComponent.jsx
import React, { useEffect, useRef, useState } from 'react';
import { getAreaHeatHazardReports } from '../../services/reportService';

const HeatMapComponent = ({ 
  googleMapsApiKey,
  center = { lat: 40.7128, lng: -74.006 }, // Default to NYC
  zoom = 13,
  weatherData,
  heatIndex
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [reports, setReports] = useState([]);
  const [heatMapLayer, setHeatMapLayer] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Google Maps
  useEffect(() => {
    // Load Google Maps script
    const loadGoogleMapsScript = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=visualization`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      script.onerror = () => setError('Failed to load Google Maps. Please try again later.');
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current) return;

      const mapOptions = {
        center: center,
        zoom: zoom,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        styles: [
          // Custom map styles to emphasize heat-related features
          {
            featureType: 'water',
            elementType: 'geometry.fill',
            stylers: [{ color: '#b1dcfa' }]
          },
          {
            featureType: 'landscape',
            elementType: 'geometry',
            stylers: [{ color: '#e9e5dc' }]
          },
          {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{ color: '#b3d9a9' }]
          }
        ]
      };

      const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
      setMap(newMap);

      // Add heat map layer
      const heatMapData = [];
      
      // Create heat map layer
      const newHeatMapLayer = new window.google.maps.visualization.HeatmapLayer({
        data: heatMapData,
        map: newMap,
        radius: 50,
        opacity: 0.7,
        gradient: [
          'rgba(0, 255, 255, 0)',
          'rgba(0, 255, 255, 1)',
          'rgba(0, 191, 255, 1)',
          'rgba(0, 127, 255, 1)',
          'rgba(0, 63, 255, 1)',
          'rgba(0, 0, 255, 1)',
          'rgba(0, 0, 223, 1)',
          'rgba(0, 0, 191, 1)',
          'rgba(0, 0, 159, 1)',
          'rgba(0, 0, 127, 1)',
          'rgba(63, 0, 91, 1)',
          'rgba(127, 0, 63, 1)',
          'rgba(191, 0, 31, 1)',
          'rgba(255, 0, 0, 1)'
        ]
      });
      
      setHeatMapLayer(newHeatMapLayer);
      setIsLoading(false);
    };

    loadGoogleMapsScript();

    return () => {
      // Clean up markers when component unmounts
      if (markers && markers.length) {
        markers.forEach(marker => marker.setMap(null));
      }
    };
  }, [center, zoom, googleMapsApiKey]);

  // Fetch heat hazard reports
  useEffect(() => {
    if (!map) return;

    const fetchReports = async () => {
      try {
        const areaReports = await getAreaHeatHazardReports(center.lat, center.lng, 10);
        setReports(areaReports);
      } catch (err) {
        console.error('Error fetching heat hazard reports:', err);
        setError('Unable to load heat hazard reports');
      }
    };

    fetchReports();
  }, [map, center]);

  // Update map markers based on reports
  useEffect(() => {
    if (!map || !reports.length) return;

    // Clear existing markers
    if (markers && markers.length) {
      markers.forEach(marker => marker.setMap(null));
    }

    const newMarkers = reports.map(report => {
      if (!report.location) return null;

      // Create marker with custom icon based on issue type
      const marker = new window.google.maps.Marker({
        position: {
          lat: report.location.latitude,
          lng: report.location.longitude
        },
        map: map,
        title: report.issueType,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: getMarkerColor(report.issueType),
          fillOpacity: 0.8,
          strokeWeight: 1,
          strokeColor: '#ffffff'
        }
      });

      // Add click listener for info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-bold">${getIssueTypeLabel(report.issueType)}</h3>
            <p>${report.description}</p>
            <p class="text-sm text-gray-500">Reported: ${new Date(report.timestamp.seconds * 1000).toLocaleDateString()}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      return marker;
    }).filter(Boolean);

    setMarkers(newMarkers);
  }, [map, reports]);

  // Update heat map visualization based on weather data
  useEffect(() => {
    if (!map || !heatMapLayer || !weatherData) return;

    // For a real implementation, you would use more sophisticated data
    // to create a heat map that shows temperature variations across the area
    
    // For now, we'll create a simple heat map centered on the current location
    const heatMapData = [
      {
        location: new window.google.maps.LatLng(center.lat, center.lng),
        weight: getHeatWeight(weatherData.main.temp)
      }
    ];

    // Add some random points around the center for visualization
    for (let i = 0; i < 20; i++) {
      const lat = center.lat + (Math.random() - 0.5) * 0.05;
      const lng = center.lng + (Math.random() - 0.5) * 0.05;
      const weight = getHeatWeight(weatherData.main.temp) * (0.5 + Math.random() * 0.5);
      
      heatMapData.push({
        location: new window.google.maps.LatLng(lat, lng),
        weight: weight
      });
    }

    heatMapLayer.setData(heatMapData);
  }, [map, heatMapLayer, weatherData, center]);

  // Helper function to get marker color based on issue type
  const getMarkerColor = (issueType) => {
    switch (issueType) {
      case 'broken_water':
        return '#3B82F6'; // blue
      case 'no_shade':
        return '#F59E0B'; // amber
      case 'hot_pavement':
        return '#EF4444'; // red
      case 'cooling_center':
        return '#10B981'; // green
      default:
        return '#6B7280'; // gray
    }
  };

  // Helper function to get issue type label
  const getIssueTypeLabel = (issueType) => {
    switch (issueType) {
      case 'broken_water':
        return 'Broken Water Fountain';
      case 'no_shade':
        return 'No Shade Available';
      case 'hot_pavement':
        return 'Dangerously Hot Pavement';
      case 'cooling_center':
        return 'Cooling Center Issue';
      default:
        return 'Other Issue';
    }
  };

  // Helper function to get heat weight based on temperature
  const getHeatWeight = (temperature) => {
    // Scale weight based on temperature
    // Higher temperatures = higher weight = more intense heat visualization
    if (temperature > 40) return 10;
    if (temperature > 35) return 8;
    if (temperature > 30) return 6;
    if (temperature > 25) return 4;
    if (temperature > 20) return 2;
    return 1;
  };

  // Render loading, error, or map
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-70 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg"
        style={{ minHeight: '400px' }}
      ></div>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded shadow-md z-10">
        <h4 className="font-semibold text-sm mb-2">Map Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
            <span className="text-xs">Water Fountain Issue</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
            <span className="text-xs">No Shade</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
            <span className="text-xs">Hot Pavement</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
            <span className="text-xs">Cooling Center Issue</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-gray-500 mr-2"></span>
            <span className="text-xs">Other Issue</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatMapComponent;