import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../config/api.config';

export default function AIRecommendations() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');

  const handleGetRecommendations = async (e) => {
    e.preventDefault();
    if (!preferences.trim()) {
      setError('Please tell us a bit about what you are looking for.');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      const response = await apiClient.post('/recommendations', {
        preferences,
        maxBudget: maxBudget ? parseFloat(maxBudget) : null,
        preferredLocation: preferredLocation || null
      });
      
      if (response.data && response.data.length > 0) {
        setRecommendations(response.data);
      } else {
        setError('No perfect matches found. Try adjusting your preferences.');
        setRecommendations([]);
      }
    } catch (err) {
      setError('Failed to fetch recommendations. Make sure the AI service is configured.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 shadow-sm relative overflow-hidden">
          {/* Background decorative element */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 text-blue-200 opacity-50 pointer-events-none">
            <svg width="150" height="150" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">✨</span>
              <h2 className="text-2xl font-bold text-gray-900">AI Matchmaker</h2>
            </div>
            <p className="text-gray-600 mb-8 font-medium">Describe your ideal boarding place, and our Gemini AI will find the perfect matches for your lifestyle and budget.</p>
            
            <form onSubmit={handleGetRecommendations} className="space-y-5 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Preferences</label>
                <textarea 
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  placeholder="e.g. I am a vegetarian student looking for a quiet place with WiFi and a friendly environment..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm bg-white"
                  rows="3"
                />
              </div>
              <div className="flex flex-col md:flex-row gap-5">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Location (Optional)</label>
                  <input 
                    type="text"
                    value={preferredLocation}
                    onChange={(e) => setPreferredLocation(e.target.value)}
                    placeholder="e.g. Colombo 07"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition shadow-sm bg-white"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Max Budget (Optional)</label>
                  <input 
                    type="number"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    placeholder="e.g. 25000"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition shadow-sm bg-white"
                  />
                </div>
              </div>
              
              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
              
              <button 
                type="submit" 
                disabled={loading}
                className={`px-8 py-3 rounded-lg font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                  loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Thinking...
                  </>
                ) : 'Find My Perfect Match'}
              </button>
            </form>

            {recommendations.length > 0 && (
              <div className="mt-12 animate-fade-in-up">
                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-4 mb-6">Top AI Matches for You</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recommendations.map((rec, index) => {
                    const isProperty = rec.type === 'PROPERTY' || rec.property;
                    const item = isProperty ? rec.property : rec.roommatePost;
                    
                    if (!item) return null;

                    const title = isProperty ? item.title : `${item.gender || 'Unknown'} Roommate, Age ${item.age || 'N/A'}`;
                    const location = item.location;
                    const price = isProperty ? item.rent : item.budget;
                    const image = isProperty 
                      ? (item.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400')
                      : (item.poster?.profilePictureUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400');
                    
                    const targetUrl = isProperty ? `/property/${item.id}` : `/roommate/${item.id}`;
                    
                    return (
                      <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col border border-indigo-50 transform hover:-translate-y-1">
                        <div className="relative">
                          <img 
                            src={image} 
                            alt={title} 
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute top-3 right-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                            Match #{index + 1}
                          </div>
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-indigo-700 text-xs font-bold px-2 py-1 rounded-md shadow uppercase">
                            {isProperty ? 'Property' : 'Roommate'}
                          </div>
                          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-900 text-sm font-bold px-3 py-1 rounded-md shadow">
                            Rs {price?.toLocaleString()}
                          </div>
                        </div>
                        <div className="p-5 flex-grow flex flex-col">
                          <h4 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">{title || 'Unknown'}</h4>
                          <p className="text-gray-500 text-sm mb-4">📍 {location}</p>
                          
                          <div className="bg-indigo-50 text-indigo-900 p-4 rounded-lg text-sm mb-5 border border-indigo-100 flex-grow shadow-inner">
                            <p className="italic">"{rec.aiExplanation}"</p>
                          </div>
                          
                          <div className="mt-auto pt-4 border-t border-gray-100">
                            <button 
                              onClick={() => navigate(targetUrl)}
                              className="w-full text-center py-2 bg-gray-50 hover:bg-gray-100 text-indigo-700 text-sm font-bold rounded-lg transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
