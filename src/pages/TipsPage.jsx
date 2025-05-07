// src/pages/TipsPage.jsx
import React from 'react';
import Navbar from '../components/Navbar';

const TipsPage = () => {
  const heatSafetyTips = [
    {
      category: 'Hydration',
      tips: [
        'Drink plenty of water, even if you don\'t feel thirsty',
        'Avoid alcohol and caffeine, which can contribute to dehydration',
        'Carry a reusable water bottle when going outdoors',
        'Consider electrolyte-enhanced drinks during prolonged outdoor activities'
      ]
    },
    {
      category: 'Clothing',
      tips: [
        'Wear lightweight, light-colored, loose-fitting clothing',
        'Choose breathable fabrics like cotton or specially designed cooling fabrics',
        'Wear a wide-brimmed hat to protect your face and neck',
        'Use sunglasses with UV protection'
      ]
    },
    {
      category: 'Activity Planning',
      tips: [
        'Schedule outdoor activities during cooler hours (early morning or evening)',
        'Take frequent breaks in shaded or air-conditioned areas',
        'Pace yourself and reduce exercise intensity in hot weather',
        'Use the buddy system when exercising in extreme heat'
      ]
    },
    {
      category: 'Sun Protection',
      tips: [
        'Apply broad-spectrum sunscreen with at least SPF 30 regularly',
        'Seek shade whenever possible, especially during peak sun hours (10am-4pm)',
        'Use umbrellas or canopies when shade isn\'t available',
        'Remember that UV rays can penetrate clouds, so protection is needed even on overcast days'
      ]
    },
    {
      category: 'Home Safety',
      tips: [
        'Use fans and air conditioning to keep your home cool',
        'Close blinds or curtains during the hottest part of the day',
        'Take cool showers or baths to lower body temperature',
        'Never leave children or pets in parked vehicles, even with windows cracked'
      ]
    }
  ];

  const heatIllnessSigns = [
    {
      condition: 'Heat Cramps',
      symptoms: 'Muscle pain or spasms, usually in the abdomen, arms, or legs',
      treatment: 'Stop activity, move to a cool place, drink water or a sports drink, wait for cramps to subside before resuming activity'
    },
    {
      condition: 'Heat Exhaustion',
      symptoms: 'Heavy sweating, cold/pale/clammy skin, fast/weak pulse, nausea, muscle cramps, tiredness, weakness, dizziness, headache, fainting',
      treatment: 'Move to a cool place, loosen clothing, apply cool wet cloths to body or take a cool bath, sip water. Seek medical attention if symptoms worsen or last longer than 1 hour'
    },
    {
      condition: 'Heat Stroke',
      symptoms: 'High body temperature (above 103°F), hot/red/dry/damp skin, fast/strong pulse, headache, dizziness, nausea, confusion, losing consciousness',
      treatment: 'Call 911 immediately. Move person to a cooler place, help lower temperature with cool cloths or a cool bath. Do NOT give the person anything to drink'
    }
  ];

  return (
    <div className="min-h-screen bg-amber-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-navy-900 mb-6">Heat Safety Tips</h1>
        
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <p className="text-lg">
            Extreme heat can pose serious health risks. Follow these tips to stay safe during hot weather
            and recognize the signs of heat-related illness.
          </p>
        </div>
        
        {/* Heat Safety Tips Sections */}
        <h2 className="text-2xl font-semibold text-navy-900 mb-4">Prevention Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {heatSafetyTips.map((section, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-orange-500 py-2">
                <h3 className="text-white font-semibold text-lg text-center">{section.category}</h3>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {section.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        
        {/* Heat Illness Recognition */}
        <h2 className="text-2xl font-semibold text-navy-900 mb-4">Recognizing Heat Illness</h2>
        <div className="mb-10">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="bg-orange-500 text-white">
                  <th className="text-left py-3 px-4 font-semibold">Condition</th>
                  <th className="text-left py-3 px-4 font-semibold">Symptoms</th>
                  <th className="text-left py-3 px-4 font-semibold">What To Do</th>
                </tr>
              </thead>
              <tbody>
                {heatIllnessSigns.map((illness, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-3 px-4 border-b border-gray-200">
                      <span className="font-medium">{illness.condition}</span>
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200">{illness.symptoms}</td>
                    <td className="py-3 px-4 border-b border-gray-200">{illness.treatment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Additional Resources */}
        <h2 className="text-2xl font-semibold text-navy-900 mb-4">Additional Resources</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="mb-4">For more information on heat safety, visit these resources:</p>
          <ul className="space-y-2">
            <li>
              <a href="https://www.cdc.gov/disasters/extremeheat/index.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                CDC Extreme Heat Information
              </a>
            </li>
            <li>
              <a href="https://www.ready.gov/heat" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Ready.gov Heat Safety
              </a>
            </li>
            <li>
              <a href="https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/heat-wave-safety.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Red Cross Heat Wave Safety
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TipsPage;

