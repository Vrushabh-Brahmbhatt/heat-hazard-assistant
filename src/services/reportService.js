// src/services/reportService.js
import { db } from '../config/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, GeoPoint, Timestamp } from 'firebase/firestore';

/**
 * Submit a new heat hazard report
 * @param {object} reportData - Report data
 * @returns {Promise} - Result of the submission
 */
export const submitHeatHazardReport = async (reportData) => {
  try {
    // Parse location string to get latitude and longitude
    let geoPoint = null;
    if (reportData.latitude && reportData.longitude) {
      geoPoint = new GeoPoint(reportData.latitude, reportData.longitude);
    }
    
    const reportWithMetadata = {
      ...reportData,
      location: geoPoint,
      timestamp: Timestamp.now(),
      status: 'pending' // pending, confirmed, resolved
    };
    
    const docRef = await addDoc(collection(db, 'heatHazardReports'), reportWithMetadata);
    return { id: docRef.id, ...reportWithMetadata };
  } catch (error) {
    console.error('Error submitting report:', error);
    throw error;
  }
};

/**
 * Get heat hazard reports for a specific area
 * @param {number} lat - Latitude of center point
 * @param {number} lng - Longitude of center point
 * @param {number} radiusKm - Radius in kilometers
 * @returns {Promise} - Array of reports
 */
export const getAreaHeatHazardReports = async (lat, lng, radiusKm = 5) => {
  try {
    // Note: This is a simplified approach. For production, 
    // you would use Firebase GeoFirestore or a similar solution for geo-queries
    
    // For now, we'll get all reports and filter on the client side
    const reportsRef = collection(db, 'heatHazardReports');
    const q = query(reportsRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const reports = [];
    querySnapshot.forEach((doc) => {
      reports.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Client-side filtering based on distance (simple approximation)
    return reports.filter(report => {
      // Skip reports without location data
      if (!report.location) return false;
      
      // Calculate distance using the Haversine formula
      const R = 6371; // Radius of the Earth in km
      const dLat = (report.location.latitude - lat) * Math.PI / 180;
      const dLon = (report.location.longitude - lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat * Math.PI / 180) * Math.cos(report.location.latitude * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      return distance <= radiusKm;
    });
  } catch (error) {
    console.error('Error getting area reports:', error);
    throw error;
  }
};