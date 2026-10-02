import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../config/api.config";

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400";

export default function RoommateView() {
  const { roommateId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [roommate, setRoommate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRoommate = async () => {
      if (!roommateId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await apiClient.get(`/roommates/${roommateId}`);
        const post = response?.data;

        if (!post) {
          setRoommate(null);
          setError("Roommate profile not found.");
          return;
        }

        const interests = post.interests
          ? post.interests.split(",").map((interest) => interest.trim()).filter(Boolean)
          : [];

        setRoommate({
          id: post.id,
          name: post.poster?.fullName || post.poster?.email || "Anonymous Profile",
          posterId: post.poster?.id,
          gender: post.gender || post.poster?.gender || "Not specified",
          age: post.age || post.poster?.age || null,
          occupation: post.occupation || post.poster?.occupation || "Verified Tenant",
          location: post.location || "Location not specified",
          rating: post.rating || 4.9,
          bio: post.bio || "",
          about: post.about || post.bio || "Looking for a clean, friendly roommate for shared living.",
          avatarUrl: post.poster?.profilePictureUrl || DEFAULT_AVATAR,
          verified: Boolean(post.poster?.verified),
          interests,
          preferences: {
            lookingFor: post.preferences || "Kind & Non-Smoking",
            budget: post.budget ? `LKR ${post.budget.toLocaleString()}/mo` : "Flex Budget",
            preferredLocation: post.preferredLocation || post.location || "Flexible",
            moveInDate: post.moveInDate || "Immediate",
          },
          reviews: Array.isArray(post.reviews) ? post.reviews : [],
        });
      } catch (err) {
        console.error("Error loading roommate:", err);
        const message = err?.response?.data?.message || err?.message || "Failed to load roommate profile.";
        setError(message);
        setRoommate(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadRoommate();
  }, [roommateId]);

  const handleConnect = () => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }
    
    if (roommate?.posterId) {
      navigate('/chat', { state: { recipientId: roommate.posterId } });
    } else {
      alert("Poster information not available for messaging.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-12 h-12 border-4 border-[#3488c3] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-500 font-medium text-sm">Loading roommate profile...</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 py-16 text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-3xl max-w-md mx-auto shadow-sm">
            <span className="text-3xl block mb-2">⚠️</span>
            <p className="font-extrabold text-sm">{error}</p>
          </div>
        </div>
      )}

      {!isLoading && !error && roommate && (
        <>
          {/* Hero Header Section */}
          <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-[#1b4b6d] text-white">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#3488c3]/25 blur-3xl pointer-events-none" />
            <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 py-10 md:py-14">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Avatar with Verified Badge */}
                <div className="relative shrink-0">
                  <img
                    src={roommate.avatarUrl}
                    alt={roommate.name}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover border-4 border-white/20 shadow-2xl bg-slate-800"
                    onError={(e) => {
                      e.target.src = DEFAULT_AVATAR;
                    }}
                  />
                  {roommate.verified && (
                    <span className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-sm w-8 h-8 rounded-full flex items-center justify-center font-black shadow-lg">
                      ✓
                    </span>
                  )}
                </div>

                {/* Profile Header Details */}
                <div className="flex-1 text-center md:text-left space-y-2.5">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <span className="bg-[#3488c3] text-white text-xs font-extrabold px-3.5 py-1 rounded-full shadow-xs">
                      ✨ 95% Match
                    </span>
                    {roommate.gender && (
                      <span className="bg-indigo-500/90 text-white text-xs font-bold px-3.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                        <span>{roommate.gender.toLowerCase() === 'male' ? '👨' : roommate.gender.toLowerCase() === 'female' ? '👩' : '👤'}</span>
                        <span>Gender: {roommate.gender}</span>
                      </span>
                    )}
                    <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3.5 py-1 rounded-full border border-white/30">
                      💼 {roommate.occupation}
                    </span>
                    <span className="bg-emerald-500/90 text-white text-xs font-bold px-3.5 py-1 rounded-full shadow-xs">
                      📍 {roommate.location}
                    </span>
                  </div>

                  <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                    {roommate.name}{roommate.age ? `, ${roommate.age}` : ''}
                  </h1>

                  <p className="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed font-medium">
                    {roommate.about}
                  </p>

                  <div className="pt-3 flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <button
                      type="button"
                      onClick={handleConnect}
                      className="bg-[#3488c3] hover:bg-[#2978b3] text-white px-7 py-3.5 rounded-2xl font-extrabold text-sm shadow-lg shadow-[#3488c3]/30 transition active:scale-95 cursor-pointer flex items-center gap-2"
                    >
                      <span>💬</span>
                      <span>Send Connection Request</span>
                    </button>
                    <div className="bg-white/15 backdrop-blur-md text-white px-5 py-3 rounded-2xl font-bold text-sm border border-white/20 flex items-center gap-2">
                      <span className="text-amber-400">⭐</span>
                      <span>{roommate.rating} Rating</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column (2/3 width) */}
              <div className="lg:col-span-2 space-y-8">
                {/* About Section */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-[0_12px_40px_rgba(15,23,42,0.04)] space-y-4">
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3 border-b border-slate-100 pb-4">
                    <span className="w-9 h-9 rounded-2xl bg-[#3488c3]/10 text-[#3488c3] flex items-center justify-center text-lg font-bold border border-[#3488c3]/20">
                      ✨
                    </span>
                    <span>About {roommate.name.split(' ')[0]}</span>
                  </h3>
                  <div className="bg-slate-50/80 p-5 rounded-2xl border-l-4 border-l-[#3488c3] border border-slate-200/60 text-slate-700 text-sm md:text-base leading-relaxed font-medium">
                    {roommate.about}
                  </div>
                </div>

                {/* Living Preferences Section */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-[0_12px_40px_rgba(15,23,42,0.04)] space-y-5">
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3 border-b border-slate-100 pb-4">
                    <span className="w-9 h-9 rounded-2xl bg-[#3488c3]/10 text-[#3488c3] flex items-center justify-center text-lg font-bold border border-[#3488c3]/20">
                      🎯
                    </span>
                    <span>Living Preferences & Details</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50/90 border border-slate-200/70 hover:bg-[#eaf4fb]/50 transition">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-lg shrink-0">
                        {roommate.gender?.toLowerCase() === 'male' ? '👨' : roommate.gender?.toLowerCase() === 'female' ? '👩' : '👤'}
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Gender</span>
                        <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">{roommate.gender || 'Not specified'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50/90 border border-slate-200/70 hover:bg-[#eaf4fb]/50 transition">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-lg shrink-0">
                        🔍
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Looking For</span>
                        <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">{roommate.preferences.lookingFor || 'Kind & Respectful'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50/90 border border-slate-200/70 hover:bg-[#eaf4fb]/50 transition">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-lg shrink-0">
                        💰
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Max Budget</span>
                        <span className="text-sm font-extrabold text-[#3488c3] mt-0.5 block">{roommate.preferences.budget}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50/90 border border-slate-200/70 hover:bg-[#eaf4fb]/50 transition">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-lg shrink-0">
                        📍
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Preferred Area</span>
                        <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">{roommate.preferences.preferredLocation}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50/90 border border-slate-200/70 hover:bg-[#eaf4fb]/50 transition">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-lg shrink-0">
                        📅
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Move-In Date</span>
                        <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">{roommate.preferences.moveInDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interests Section */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-[0_12px_40px_rgba(15,23,42,0.04)] space-y-4">
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3 border-b border-slate-100 pb-4">
                    <span className="w-9 h-9 rounded-2xl bg-[#3488c3]/10 text-[#3488c3] flex items-center justify-center text-lg font-bold border border-[#3488c3]/20">
                      🎨
                    </span>
                    <span>Interests & Hobbies</span>
                  </h3>
                  {roommate.interests.length > 0 ? (
                    <div className="flex flex-wrap gap-2.5">
                      {roommate.interests.map((interest) => (
                        <span
                          key={interest}
                          className="bg-[#eaf4fb] text-[#246fa8] border border-[#d2e7f6] px-4 py-2 rounded-full text-xs font-bold transition hover:bg-[#3488c3] hover:text-white"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No interests listed.</p>
                  )}
                </div>

                {/* Reviews Section */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-[0_12px_40px_rgba(15,23,42,0.04)] space-y-6">
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3 border-b border-slate-100 pb-4">
                    <span className="w-9 h-9 rounded-2xl bg-[#3488c3]/10 text-[#3488c3] flex items-center justify-center text-lg font-bold border border-[#3488c3]/20">
                      ⭐
                    </span>
                    <span>Reviews ({roommate.reviews.length})</span>
                  </h3>

                  {roommate.reviews.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <span className="text-3xl block mb-2">⭐</span>
                      <p className="text-slate-500 font-medium text-sm">No reviews yet for this roommate.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {roommate.reviews.map((review) => (
                        <div key={review.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-extrabold text-slate-900 text-sm">{review.author}</p>
                            <div className="flex text-amber-400 text-xs">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < review.rating ? "" : "opacity-30"}>
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className="text-slate-700 text-xs md:text-sm leading-relaxed">{review.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Sidebar Column (1/3 width) */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_12px_40px_rgba(15,23,42,0.06)] space-y-5 sticky top-6">
                  <span className="text-xs font-extrabold text-[#3488c3] uppercase tracking-wider block border-b border-slate-100 pb-3">
                    Quick Profile Summary
                  </span>
                  <div className="space-y-3.5 text-xs md:text-sm">
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Max Budget</span>
                      <span className="font-extrabold text-[#3488c3]">{roommate.preferences.budget}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Occupation</span>
                      <span className="font-extrabold text-slate-900">{roommate.occupation}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Status</span>
                      <span className="font-extrabold text-emerald-600">✓ Verified Profile</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Move-In</span>
                      <span className="font-extrabold text-slate-900">{roommate.preferences.moveInDate}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleConnect}
                    className="w-full py-3.5 bg-[#3488c3] hover:bg-[#2978b3] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-[#3488c3]/30 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>💬</span>
                    <span>Send Message</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
