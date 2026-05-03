import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../config/api.config';
import { useAuth } from '../context/AuthContext';

export default function AIRecommendations() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [preferences, setPreferences] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');
  const [autoMatched, setAutoMatched] = useState(false);

  // Auto-fill preferences if the user is logged in and has a profile
  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user) return;
      
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch('http://localhost:4000/api/roommates', { headers });
        if (res.ok) {
          const roommates = await res.json();
          const myPost = roommates.find(r => r.poster?.id === user.id);
          
          if (myPost) {
            const prefText = `I am a ${myPost.gender || ''} ${myPost.age ? myPost.age + ' year old' : ''} ${myPost.occupation || ''}. ${myPost.bio || ''}. I'm interested in: ${myPost.interests || ''}. My preferences are: ${myPost.preferences || 'Not specified'}`;
            setPreferences(prefText);
            if (myPost.budget) setMaxBudget(myPost.budget.toString());
            if (myPost.preferredLocation || myPost.location) setPreferredLocation(myPost.preferredLocation || myPost.location);
            setAutoMatched(true);
            
            // Auto-trigger recommendations based on their profile
            fetchRecommendations(prefText, myPost.budget, myPost.preferredLocation || myPost.location);
          }
        }
      } catch (err) {
        console.error("Failed to fetch user preferences for AI Matchmaker", err);
      }
    };
    
    fetchUserPreferences();
  }, [user, token]);

  const fetchRecommendations = async (prefs, budget, location) => {
    if (!prefs?.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await apiClient.post('/recommendations', {
        preferences: prefs,
        maxBudget: budget ? parseFloat(budget) : null,
        preferredLocation: location || null
      });
      
      if (response.data && response.data.length > 0) {
        setRecommendations(response.data);
      } else {
        if (!autoMatched) setError('No perfect matches found. Try adjusting your preferences.');
        setRecommendations([]);
      }
    } catch (err) {
      if (!autoMatched) setError('Failed to fetch recommendations. Make sure the AI service is configured.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetRecommendations = (e) => {
    e.preventDefault();
    if (!preferences.trim()) {
      setError('Please tell us a bit about what you are looking for.');
      return;
    }
    fetchRecommendations(preferences, maxBudget, preferredLocation);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className={`rounded-3xl p-10 relative overflow-hidden transition-all duration-500 ${
          autoMatched ? 'bg-gradient-to-br from-indigo-50 via-white to-blue-50 border border-indigo-100 shadow-xl' : 'bg-gray-50 border border-gray-200'
        }`}>
          {/* Decorative elements */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <span className="text-xl">✨</span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">AI Matchmaker</h2>
                  {autoMatched && (
                    <span className="bg-indigo-600 text-white text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-full shadow-sm ml-2">
                      Personalized
                    </span>
                  )}
                </div>
                {!autoMatched && (
                  <p className="text-gray-600 font-medium max-w-xl">
                    Describe your ideal boarding place, we will find the perfect matches for your lifestyle and budget.
                  </p>
                )}
                {autoMatched && recommendations.length > 0 && (
                  <p className="text-gray-500 font-medium">
                    Based on your profile, we've found these perfect matches for you.
                  </p>
                )}
              </div>
              
              {autoMatched && (
                <button 
                  onClick={() => setAutoMatched(false)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-indigo-50 transition-colors"
                >
                  <span>Edit Preferences</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
            </div>
            
            {!autoMatched && (
              <form onSubmit={handleGetRecommendations} className="space-y-6 mb-12 bg-white/60 backdrop-blur-md p-8 rounded-2xl border border-white shadow-inner">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Your Preferences</label>
                  <textarea 
                    value={preferences}
                    onChange={(e) => setPreferences(e.target.value)}
                    placeholder="e.g. I am a vegetarian student looking for a quiet place with WiFi and a friendly environment..."
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none shadow-sm text-gray-700 placeholder-gray-300 resize-none"
                    rows="3"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Location</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📍</span>
                      <input 
                        type="text"
                        value={preferredLocation}
                        onChange={(e) => setPreferredLocation(e.target.value)}
                        placeholder="e.g. Colombo 07"
                        className="w-full pl-10 pr-5 py-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none shadow-sm text-gray-700"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Max Budget</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">Rs</span>
                      <input 
                        type="number"
                        value={maxBudget}
                        onChange={(e) => setMaxBudget(e.target.value)}
                        placeholder="e.g. 25000"
                        className="w-full pl-12 pr-5 py-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none shadow-sm text-gray-700"
                      />
                    </div>
                  </div>
                </div>
                
                {error && <p className="text-red-500 text-sm font-bold flex items-center gap-2 animate-bounce">
                  <span>⚠️</span> {error}
                </p>}
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full md:w-auto px-10 py-4 rounded-xl font-black text-white shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 ${
                    loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 shadow-indigo-100'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Thinking...</span>
                    </>
                  ) : (
                    <>
                      <span>Find My Match</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}

            {loading && autoMatched && (
              <div className="py-20 flex flex-col items-center justify-center animate-pulse">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <div className="w-8 h-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
                <p className="text-indigo-600 font-black uppercase tracking-widest text-xs">Curating your matches...</p>
              </div>
            )}

            {!loading && recommendations.length > 0 && (
              <div className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                      <div key={index} className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col border border-gray-100 overflow-hidden transform hover:-translate-y-2">
                        <div className="relative h-56 overflow-hidden">
                          <img 
                            src={image} 
                            alt={title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute top-4 right-4 z-10">
                            <span className="bg-white/90 backdrop-blur-md text-indigo-600 text-[10px] font-black px-3 py-1.5 rounded-lg shadow-sm border border-indigo-50 uppercase tracking-tighter">
                              {isProperty ? 'Boarding' : 'Roommate'}
                            </span>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                            <p className="text-white font-black text-xl">
                              Rs {price?.toLocaleString()}
                              <span className="text-xs font-normal opacity-80 ml-1">/mo</span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="p-6 flex-grow flex flex-col">
                          <h4 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">{title}</h4>
                          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-1">
                            <span className="text-indigo-500">📍</span> {location}
                          </p>
                          
                          <div className="bg-gray-50 p-4 rounded-xl text-sm mb-6 border border-gray-100 flex-grow relative group-hover:bg-indigo-50/30 transition-colors">
                            <svg className="absolute -top-2 -left-2 w-6 h-6 text-indigo-200 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C20.1216 16 21.017 16.8954 21.017 18V21C21.017 22.1046 20.1216 23 19.017 23H16.017C14.9124 23 14.017 22.1046 14.017 21ZM14.017 21C14.017 22.1046 14.9124 23 16.017 23H19.017C20.1216 23 21.017 22.1046 21.017 21V18C21.017 16.8954 20.1216 16 19.017 16H16.017C14.9124 16 14.017 16.8954 14.017 18V21ZM5.017 21L5.017 18C5.017 16.8954 5.91243 16 7.017 16H10.017C11.1216 16 12.017 16.8954 12.017 18V21C12.017 22.1046 11.1216 23 10.017 23H7.017C5.91243 23 5.017 22.1046 5.017 21ZM5.017 21C5.017 22.1046 5.91243 23 7.017 23H10.017C11.1216 23 12.017 22.1046 12.017 21V18C12.017 16.8954 11.1216 16 10.017 16H7.017C5.91243 16 5.017 16.8954 5.017 18V21ZM12.017 0L12.017 3C12.017 4.10457 11.1216 5 10.017 5H7.017C5.91243 5 5.017 4.10457 5.017 3V0C5.017 -1.10457 5.91243 -2 7.017 -2H10.017C11.1216 -2 12.017 -1.10457 12.017 0ZM12.017 0C12.017 -1.10457 11.1216 -2 10.017 -2H7.017C5.91243 -2 5.017 -1.10457 5.017 0V3C5.017 4.10457 5.91243 5 7.017 5H10.017C11.1216 5 12.017 4.10457 12.017 3V0Z" />
                            </svg>
                            <p className="italic text-gray-600 leading-relaxed">"{rec.aiExplanation}"</p>
                          </div>
                          
                          <button 
                            onClick={() => navigate(targetUrl)}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-100 hover:shadow-indigo-200"
                          >
                            Explore Match
                          </button>
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
