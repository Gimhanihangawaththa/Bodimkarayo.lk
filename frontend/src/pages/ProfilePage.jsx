import { useState } from "react";
import { useNavigate } from "react-router-dom";

const sampleUser = {
  id: 1,
  name: "John Doe",
  age: 28,
  occupation: "Software Engineer",
  location: "Colombo 3",
  bio: "Friendly and professional. Looking for a comfortable living space.",
  avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
  about: "I'm a software engineer with a passion for building great products. I'm organized, clean, and respectful of shared spaces. Currently looking for a roommate to share a 2-3 bedroom apartment.",
  email: "john.doe@example.com",
  phone: "+94 71 234 5678",
  interests: ["Technology", "Cooking", "Reading", "Fitness", "Travel"],
  roommateApplicationStatus: "notApplied", // "notApplied", "applied", "pending", "approved", "rejected"
  isPropertyOwner: true,
  userProperties: [
    {
      id: 1,
      title: "Cozy Apartment Near University",
      price: "35,000",
      location: "Colombo 5",
      type: "Apartment",
      image: "https://images.unsplash.com/photo-1453227427063-bf47ddb8af6f?w=400&h=300&fit=crop",
      bedrooms: 2,
      bathrooms: 1,
    },
    {
      id: 2,
      title: "Modern Studio with City View",
      price: "28,000",
      location: "Colombo 7",
      type: "Studio",
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
      bedrooms: 1,
      bathrooms: 1,
    },
    {
      id: 3,
      title: "Spacious Family House",
      price: "75,000",
      location: "Colombo 4",
      type: "House",
      image: "https://images.unsplash.com/photo-1564013799919-ab600027e384?w=400&h=300&fit=crop",
      bedrooms: 4,
      bathrooms: 2,
    },
  ],
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(sampleUser);
  const [roommateStatus, setRoommateStatus] = useState(user.roommateApplicationStatus);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: user.name,
    age: user.age,
    occupation: user.occupation,
    location: user.location,
    bio: user.bio,
    email: user.email,
    phone: user.phone,
    about: user.about,
    avatarUrl: user.avatarUrl,
  });
  const [previewImage, setPreviewImage] = useState(user.avatarUrl);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applicationData, setApplicationData] = useState({
    occupation: user.occupation,
    location: user.location,
    about: user.about,
    interests: user.interests || [],
    moveInDate: "",
    budget: "",
    preferences: "",
    additionalInfo: "",
  });

  const handleEditProfile = () => {
    setPreviewImage(user.avatarUrl);
    setEditFormData({
      name: user.name,
      age: user.age,
      occupation: user.occupation,
      location: user.location,
      bio: user.bio,
      email: user.email,
      phone: user.phone,
      about: user.about,
      avatarUrl: user.avatarUrl,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = () => {
    setUser((prev) => ({
      ...prev,
      ...editFormData,
    }));
    setIsEditModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target.result;
        setPreviewImage(imageUrl);
        setEditFormData((prev) => ({
          ...prev,
          avatarUrl: imageUrl,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenApplyModal = () => {
    if (roommateStatus === "notApplied") {
      setIsApplyModalOpen(true);
    }
  };

  const handleApplicationChange = (e) => {
    const { name, value } = e.target;
    setApplicationData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInterestToggle = (interest) => {
    setApplicationData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmitApplication = () => {
    if (!applicationData.moveInDate || !applicationData.budget || !applicationData.about) {
      alert("Please fill in all required fields marked with *");
      return;
    }

    if (applicationData.interests.length === 0) {
      alert("Please select at least one interest");
      return;
    }

    setRoommateStatus("pending");
    setIsApplyModalOpen(false);
    setApplicationData({
      occupation: user.occupation,
      location: user.location,
      about: user.about,
      interests: user.interests || [],
      moveInDate: "",
      budget: "",
      preferences: "",
      additionalInfo: "",
    });
    alert("🎉 Your roommate application has been submitted! We'll review your profile and get back to you soon.");
  };

  const handleApplyRoommate = () => {
    if (roommateStatus === "notApplied") {
      setRoommateStatus("pending");
      alert("Roommate application submitted! We'll review your profile.");
    }
  };

  const getStatusBadge = () => {
    const statusConfig = {
      notApplied: { text: "Not Applied", color: "bg-gray-100 text-gray-800" },
      pending: { text: "Application Pending", color: "bg-yellow-100 text-yellow-800" },
      applied: { text: "Registered as Roommate", color: "bg-blue-100 text-blue-800" },
      approved: { text: "Approved", color: "bg-green-100 text-green-800" },
      rejected: { text: "Rejected", color: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[roommateStatus] || statusConfig.notApplied;
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-32 h-32 rounded-full object-cover ring-2 ring-blue-500"
              />
            </div>

            {/* Basic Info */}
            <div className="flex-grow">
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600 mt-2">{user.occupation}</p>
              <p className="text-gray-500 text-sm">📍 {user.location}</p>
              <p className="text-gray-600 mt-2">{user.email}</p>
              <p className="text-gray-600">{user.phone}</p>

              {/* Roommate Status Badge */}
              <div className="mt-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">Roommate Status:</p>
                {getStatusBadge()}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4 flex-wrap">
                <button
                  onClick={handleEditProfile}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition"
                >
                  Edit Profile
                </button>
                {roommateStatus === "notApplied" && (
                  <button
                    onClick={handleOpenApplyModal}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition flex items-center gap-2"
                  >
                    <span>🏠</span> Apply as Roommate
                  </button>
                )}
                {roommateStatus === "applied" && (
                  <button
                    disabled
                    className="bg-gray-400 text-white px-6 py-2 rounded-md font-medium cursor-not-allowed"
                  >
                    Applied
                  </button>
                )}
                {roommateStatus === "pending" && (
                  <button
                    disabled
                    className="bg-yellow-500 text-white px-6 py-2 rounded-md font-medium cursor-not-allowed"
                  >
                    Application Pending
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
          <p className="text-gray-700 leading-relaxed mb-4">{user.about}</p>
          <p className="text-gray-700">{user.bio}</p>
        </div>

        {/* Interests */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Interests</h2>
          <div className="flex flex-wrap gap-2">
            {user.interests.map((interest) => (
              <span
                key={interest}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* My Properties Section - Only visible for property owners */}
        {user.isPropertyOwner && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Properties</h2>
              <button
                onClick={() => navigate("/add-property")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition"
              >
                + Add Property
              </button>
            </div>

            {user.userProperties && user.userProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {user.userProperties.map((property) => (
                  <div
                    key={property.id}
                    className="rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/property/${property.id}`)}
                  >
                    {/* Property Image */}
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                      <span className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium">
                        {property.type}
                      </span>
                    </div>

                    {/* Property Details */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{property.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">📍 {property.location}</p>

                      {/* Price */}
                      <p className="text-xl font-bold text-blue-600 mb-3">Rs {property.price}/month</p>

                      {/* Features */}
                      <div className="flex gap-4 text-sm text-gray-600 mb-4">
                        <span className="flex items-center gap-1">
                          🛏️ {property.bedrooms} Bed
                        </span>
                        <span className="flex items-center gap-1">
                          🚿 {property.bathrooms} Bath
                        </span>
                      </div>

                      {/* Action Button */}
                      <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-md font-medium transition">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">You haven't added any properties yet.</p>
                <button
                  onClick={() => navigate("/add-property")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium transition"
                >
                  Add Your First Property
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-2xl font-bold text-gray-900">Edit Profile</h3>
            </div>

            <div className="p-6">
              {/* Profile Image Upload Section */}
              <div className="mb-6 pb-6 border-b">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h4>
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image Preview */}
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 mb-3">
                      <img
                        src={previewImage}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-sm text-gray-600">Preview</p>
                  </div>

                  {/* Upload Input */}
                  <div className="flex-1 flex flex-col justify-center">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Change Profile Picture
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-medium
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100 file:cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-2">Supported formats: JPG, PNG, GIF (Max 5MB)</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={editFormData.age}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Occupation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                  <input
                    type="text"
                    name="occupation"
                    value={editFormData.occupation}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={editFormData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editFormData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Bio */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio (Short Description)</label>
                  <textarea
                    name="bio"
                    value={editFormData.bio}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* About */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">About (Detailed Description)</label>
                  <textarea
                    name="about"
                    value={editFormData.about}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="p-6 border-t flex gap-3 justify-end">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-6 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Roommate Application Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span>🏠</span> Apply as a Roommate
              </h3>
              <p className="text-gray-600 text-sm mt-2">Complete your roommate profile to start finding compatible roommates</p>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Info Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>ℹ️ Info:</strong> Your profile information will be shared with potential roommates. Complete this form to let them know about your preferences and timeline.
                </p>
              </div>

              {/* Occupation and Location Section */}
              <div className="mb-6 pb-6 border-b">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Occupation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                    <input
                      type="text"
                      name="occupation"
                      value={applicationData.occupation}
                      onChange={handleApplicationChange}
                      placeholder="e.g., Software Engineer, Accountant"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Location</label>
                    <input
                      type="text"
                      name="location"
                      value={applicationData.location}
                      onChange={handleApplicationChange}
                      placeholder="e.g., Colombo 3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div className="mb-6 pb-6 border-b">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">About You</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tell us about yourself <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="about"
                    value={applicationData.about}
                    onChange={handleApplicationChange}
                    placeholder="Share about your personality, lifestyle, habits, and what you're looking for in a living situation..."
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">{applicationData.about.length}/500 characters</p>
                </div>
              </div>

              {/* Interests Section */}
              <div className="mb-6 pb-6 border-b">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Your Interests <span className="text-red-500">*</span>
                </h4>
                <p className="text-sm text-gray-600 mb-3">Select at least one interest to help match with compatible roommates</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    "Cooking",
                    "Reading",
                    "Yoga",
                    "Writing",
                    "Hiking",
                    "Photography",
                    "Gaming",
                    "Music",
                    "Sports",
                    "Travel",
                    "Art",
                    "Movies",
                    "Fitness",
                    "Technology",
                    "Gardening",
                    "Meditation",
                  ].map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleInterestToggle(interest)}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition border ${
                        applicationData.interests.includes(interest)
                          ? "bg-green-500 text-white border-green-500"
                          : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Selected: {applicationData.interests.length > 0 ? applicationData.interests.join(", ") : "None"}
                </p>
              </div>

              {/* Move-in and Budget Section */}
              <div className="mb-6 pb-6 border-b">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Move-in Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Move-in Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      When are you looking to move in? <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="month"
                      name="moveInDate"
                      value={applicationData.moveInDate}
                      onChange={handleApplicationChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What's your monthly budget? <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center">
                      <span className="text-gray-600 mr-2">Rs</span>
                      <input
                        type="number"
                        name="budget"
                        value={applicationData.budget}
                        onChange={handleApplicationChange}
                        placeholder="e.g., 25000"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <span className="text-gray-600 ml-2">/month</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferences Section */}
              <div className="space-y-5">
                {/* Preferences */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What are you looking for in a roommate? (Optional)
                  </label>
                  <textarea
                    name="preferences"
                    value={applicationData.preferences}
                    onChange={handleApplicationChange}
                    placeholder="e.g., Quiet roommate, early riser, pet-friendly, vegetarian, etc."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Additional Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anything else you'd like to share? (Optional)
                  </label>
                  <textarea
                    name="additionalInfo"
                    value={applicationData.additionalInfo}
                    onChange={handleApplicationChange}
                    placeholder="Any other relevant information..."
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsApplyModalOpen(false);
                  setApplicationData({
                    occupation: user.occupation,
                    location: user.location,
                    about: user.about,
                    interests: user.interests || [],
                    moveInDate: "",
                    budget: "",
                    preferences: "",
                    additionalInfo: "",
                  });
                }}
                className="px-6 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitApplication}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition flex items-center gap-2"
              >
                <span>✓</span> Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
