// src/services/heatSafetyService.js
/**
 * Get heat safety recommendations based on heat index
 * @param {number} heatIndex - Heat index in Celsius
 * @param {string} activityType - Type of activity (resting, light, moderate, vigorous)
 * @returns {object} - Safety recommendations
 */
export const getHeatSafetyRecommendations = (heatIndex, activityType = 'moderate') => {
    // Base recommendations that apply to all heat levels
    const baseRecommendations = {
      hydration: 'Stay hydrated by drinking water regularly, even if not thirsty.',
      clothing: 'Wear lightweight, light-colored, loose-fitting clothing.',
      sunProtection: 'Apply sunscreen with at least SPF 30 and wear a wide-brimmed hat.',
      awareness: 'Be aware of the signs of heat-related illness.',
    };
    
    // Activity-specific multipliers for risk
    const activityMultipliers = {
      resting: 1,
      light: 1.2,
      moderate: 1.5,
      vigorous: 2
    };
    
    // Adjust heat index based on activity level
    const adjustedHeatIndex = heatIndex * (activityMultipliers[activityType] || 1);
    
    let specificRecommendations = {};
    let activityRestrictions = '';
    let warningLevel = 'low';
    
    // Provide recommendations based on adjusted heat index
    if (adjustedHeatIndex > 54) {
      warningLevel = 'extreme';
      specificRecommendations = {
        outdoor: 'Avoid outdoor activities completely.',
        cooling: 'Stay in air-conditioned environments. Visit cooling centers if needed.',
        monitoring: 'Check on vulnerable individuals frequently.',
        emergency: 'Know the emergency symptoms of heat stroke and be ready to call for help.',
      };
      activityRestrictions = 'All outdoor physical activities should be canceled or moved indoors with air conditioning.';
    } else if (adjustedHeatIndex > 41) {
      warningLevel = 'high';
      specificRecommendations = {
        outdoor: 'Limit outdoor activities to early morning or after sunset.',
        cooling: 'Take frequent breaks in shaded or air-conditioned areas.',
        monitoring: 'Check on vulnerable individuals regularly.',
        hydration: 'Drink water every 15-20 minutes during activity.',
      };
      activityRestrictions = 'Avoid moderate to vigorous physical activity outdoors. Limit outdoor exposure to less than 30 minutes.';
    } else if (adjustedHeatIndex > 32) {
      warningLevel = 'moderate';
      specificRecommendations = {
        outdoor: 'Reduce intensity and duration of outdoor activities.',
        cooling: 'Take breaks in the shade every 30 minutes.',
        hydration: 'Increase water intake before, during, and after outdoor activity.',
        planning: 'Plan activities for cooler parts of the day.',
      };
      activityRestrictions = 'Take more frequent breaks during moderate or vigorous activity. Consider reducing intensity.';
    } else if (adjustedHeatIndex > 27) {
      warningLevel = 'low-moderate';
      specificRecommendations = {
        outdoor: 'Use caution when engaging in outdoor activities.',
        cooling: 'Take breaks in the shade as needed.',
        hydration: 'Drink water before, during, and after outdoor activity.',
        monitoring: 'Monitor how you feel and stop activity if experiencing discomfort.',
      };
      activityRestrictions = 'For vigorous activity, take regular breaks and monitor for signs of heat stress.';
    } else {
      warningLevel = 'low';
      specificRecommendations = {
        outdoor: 'Normal outdoor activities are generally safe.',
        hydration: 'Maintain regular hydration.',
        monitoring: 'Be mindful of personal comfort and limits.',
      };
      activityRestrictions = 'No specific restrictions, but always stay hydrated during activity.';
    }
    
    return {
      warningLevel,
      recommendations: {
        ...baseRecommendations,
        ...specificRecommendations
      },
      activityRestrictions
    };
  };
  
  