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
  const [matchType, setMatchType] = useState('PROPERTY');
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

  const fetchRecommendations = async (prefs, budget, location, type = matchType) => {
    if (!prefs?.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await apiClient.post('/recommendations', {
        preferences: prefs,
        maxBudget: budget ? parseFloat(budget) : null,
        preferredLocation: location || null,
        matchType: type
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
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-4">
        <div className={`rounded-3xl p-6 md:p-10 relative overflow-hidden transition-all duration-500 ${
          autoMatched ? 'bg-gradient-to-br from-blue-50/80 via-white to-sky-50/60 border border-blue-100 shadow-xl' : 'bg-gradient-to-br from-slate-50/80 via-white to-blue-50/40 border border-slate-200/80 shadow-md'
        }`}>
          {/* Decorative ambient lighting */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#3488c3]/15 rounded-full blur-3xl opacity-70 pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-sky-300/20 rounded-full blur-3xl opacity-60 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-tr from-[#3488c3] to-[#2978b3] rounded-2xl flex items-center justify-center text-white shadow-md shadow-[#3488c3]/25 shrink-0">
                    <span className="text-xl">✨</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">AI Matchmaker</h2>
                    <span className="bg-[#3488c3]/10 text-[#3488c3] border border-[#3488c3]/20 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                      Smart Search
                    </span>
                  </div>
                </div>
                {!autoMatched && (
                  <p className="text-slate-600 font-medium text-sm md:text-base max-w-xl">
                    Describe your ideal boarding place or lifestyle, and our AI will find the perfect matches for your budget.
                  </p>
                )}
                {autoMatched && recommendations.length > 0 && (
                  <p className="text-slate-500 font-medium text-sm">
                    Based on your profile, we've found these perfect matches for you.
                  </p>
                )}
              </div>
              
              {autoMatched && (
                <button 
                  onClick={() => setAutoMatched(false)}
                  className="text-[#3488c3] hover:text-[#2978b3] text-sm font-bold flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  <span>Edit Preferences</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
            </div>
            
            {!autoMatched && (
              <form onSubmit={handleGetRecommendations} className="space-y-6 bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                  <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">I am looking for</label>
                  <div className="inline-flex p-1 bg-slate-100 rounded-2xl w-fit border border-slate-200/80 mb-2">
                    <button
                      type="button"
                      onClick={() => setMatchType('PROPERTY')}
                      className={`px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                        matchType === 'PROPERTY'
                          ? 'bg-white text-[#3488c3] shadow-sm scale-[1.02]'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <span>🏠</span> Boarding Places
                    </button>
                    <button
                      type="button"
                      onClick={() => setMatchType('ROOMMATE')}
                      className={`px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                        matchType === 'ROOMMATE'
                          ? 'bg-white text-[#3488c3] shadow-sm scale-[1.02]'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <span>👥</span> Roommates
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">Your Preferences</label>
                  <textarea 
                    value={preferences}
                    onChange={(e) => setPreferences(e.target.value)}
                    placeholder="e.g. I am a vegetarian engineering student looking for a quiet boarding room with WiFi and friendly flatmates..."
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-[#3488c3]/15 focus:border-[#3488c3] transition-all outline-none shadow-xs text-slate-800 text-sm placeholder:text-slate-400 resize-none font-medium"
                    rows="3"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">Preferred Location</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">📍</span>
                      <input 
                        type="text"
                        value={preferredLocation}
                        onChange={(e) => setPreferredLocation(e.target.value)}
                        placeholder="e.g. Katubedda, Colombo 07, Malabe"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-[#3488c3]/15 focus:border-[#3488c3] transition-all outline-none shadow-xs text-slate-800 text-sm font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">Max Budget (LKR)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">Rs</span>
                      <input 
                        type="number"
                        value={maxBudget}
                        onChange={(e) => setMaxBudget(e.target.value)}
                        placeholder="e.g. 25000"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-[#3488c3]/15 focus:border-[#3488c3] transition-all outline-none shadow-xs text-slate-800 text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
                
                {error && <p className="text-red-600 text-xs font-bold flex items-center gap-2">
                  <span>⚠️</span> {error}
                </p>}
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full md:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-white shadow-md transition-all flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer ${
                    loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#3488c3] hover:bg-[#2978b3] shadow-[#3488c3]/25'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Finding Matches...</span>
                    </>
                  ) : (
                    <>
                      <span>Find My Match</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
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
                      <div key={index} className="group bg-white rounded-xl shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-100 overflow-hidden transform hover:-translate-y-1">
                        <div className="relative h-36 overflow-hidden">
                          <img 
                            src={image} 
                            alt={title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute top-2.5 right-2.5 z-10">
                            <span className="bg-white/95 backdrop-blur-md text-indigo-600 text-[9px] font-black px-2 py-0.5 rounded-md shadow-xs border border-indigo-50 uppercase tracking-tight">
                              {isProperty ? 'Boarding' : 'Roommate'}
                            </span>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                            <p className="text-white font-black text-sm">
                              Rs {price?.toLocaleString()}
                              <span className="text-[10px] font-normal opacity-80 ml-1">/mo</span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="p-3.5 flex-grow flex flex-col">
                          <h4 className="font-bold text-gray-900 text-xs mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1" title={title}>
                            {title}
                          </h4>
                          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                            <span className="text-indigo-500">📍</span> {location}
                          </p>
                          
                          <div className="bg-gray-50/80 p-2.5 rounded-lg text-xs mb-3 border border-gray-100 flex-grow relative group-hover:bg-indigo-50/30 transition-colors">
                            <p className="italic text-gray-600 text-[11px] leading-relaxed line-clamp-3">"{rec.aiExplanation}"</p>
                          </div>
                          
                          <button 
                            onClick={() => navigate(targetUrl)}
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all shadow-sm shadow-indigo-100 hover:shadow-indigo-200"
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
