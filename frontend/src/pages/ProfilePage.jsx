import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../config/api.config";
import { useAuth } from "../context/AuthContext";

const EMPTY_USER = {
  id: null,
  name: "",
  avatarUrl: "",
  email: "",
  role: null,
  interests: [],
  roommateApplicationStatus: "notApplied",
  isPropertyOwner: false,
  userProperties: [],
};

const createEmptyApplicationData = (interests = []) => ({
  gender: "",
  age: "",
  occupation: "",
  location: "",
  bio: "",
  about: "",
  interests,
  preferredLocation: "",
  moveInDate: "",
  budget: "",
  preferences: "",
  additionalInfo: "",
});

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(EMPTY_USER);
  const [roommateStatus, setRoommateStatus] = useState(user.roommateApplicationStatus);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [currentApplicationId, setCurrentApplicationId] = useState(null);
  const [currentApplication, setCurrentApplication] = useState(null);
  const [isEditingApplication, setIsEditingApplication] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(user.avatarUrl);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applicationData, setApplicationData] = useState(createEmptyApplicationData(EMPTY_USER.interests));

  const mapPostToApplicationData = (post) => ({
    gender: post?.gender ?? "",
    age: post?.age != null ? String(post.age) : "",
    occupation: post?.occupation ?? "",
    location: post?.location ?? "",
    bio: post?.bio ?? "",
    about: post?.about ?? "",
    interests: post?.interests
      ? post.interests.split(",").map((value) => value.trim()).filter(Boolean)
      : user.interests || [],
    preferredLocation: post?.preferredLocation ?? "",
    moveInDate: post?.moveInDate ?? "",
    budget: post?.budget != null ? String(post.budget) : "",
    preferences: post?.preferences ?? "",
    additionalInfo: "",
  });

  useEffect(() => {
    if (!authUser) {
      return;
    }

    setUser((prev) => ({
      ...prev,
      id: authUser.id ?? prev.id,
      name: authUser.fullName ?? authUser.name ?? prev.name,
      email: authUser.email ?? prev.email,
      role: authUser.role ?? prev.role,
      avatarUrl: authUser.profilePictureUrl ?? prev.avatarUrl,
    }));
  }, [authUser]);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!authUser?.id) {
        return;
      }

      try {
        const response = await apiClient.get(`/users/${authUser.id}/profile`);
        const profile = response.data;

        const mappedUser = {
          id: profile.id,
          name: profile.fullName ?? "",
          email: profile.email ?? "",
          role: profile.role ?? authUser?.role ?? null,
          avatarUrl: profile.profilePictureUrl ?? "",
        };

        setUser((prev) => ({
          ...prev,
          ...mappedUser,
        }));

        setEditFormData({
          name: mappedUser.name,
          email: mappedUser.email,
          avatarUrl: mappedUser.avatarUrl,
        });

        setPreviewImage(mappedUser.avatarUrl);
      } catch (error) {
        console.error("Error loading profile details:", error);
      }
    };

    loadUserProfile();
  }, [authUser]);

  useEffect(() => {
    const loadApplicationStatus = async () => {
      try {
        const response = await apiClient.get("/roommates");
        const posts = Array.isArray(response.data) ? response.data : [];

        const matchedPost = posts.find((post) => {
          const poster = post?.poster;
          if (!poster) return false;

          if (authUser?.id && poster.id === authUser.id) {
            return true;
          }

          if (authUser?.email && poster.email === authUser.email) {
            return true;
          }

          return false;
        });

        if (matchedPost) {
          setRoommateStatus("applied");
          setCurrentApplicationId(matchedPost.id ?? null);
          setCurrentApplication(matchedPost);
        } else {
          setRoommateStatus("notApplied");
          setCurrentApplicationId(null);
          setCurrentApplication(null);
        }
      } catch (error) {
        console.error("Error loading roommate application status:", error);
      }
    };

    loadApplicationStatus();
  }, [authUser]);

  const handleEditProfile = () => {
    setProfileImageFile(null);
    setPreviewImage(user.avatarUrl);
    setEditFormData({
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!authUser?.id) {
      alert("Unable to update profile. Please sign in again.");
      return;
    }

    try {
      setIsSavingProfile(true);

      let profilePictureUrl = editFormData.avatarUrl;

      if (profileImageFile) {
        const imageFormData = new FormData();
        imageFormData.append("image", profileImageFile);

        const imageUploadResponse = await apiClient.post(
          `/users/${authUser.id}/profile-image`,
          imageFormData
        );

        profilePictureUrl =
          imageUploadResponse.data?.profilePictureUrl || profilePictureUrl;
      }

      const payload = {
        fullName: editFormData.name,
        email: editFormData.email,
        profilePictureUrl,
      };

      const response = await apiClient.put(`/users/${authUser.id}/profile`, payload);
      const updatedProfile = response.data;

      const updatedUser = {
        id: updatedProfile.id,
        name: updatedProfile.fullName ?? editFormData.name,
        email: updatedProfile.email ?? editFormData.email,
        avatarUrl: updatedProfile.profilePictureUrl ?? editFormData.avatarUrl,
      };

      setUser((prev) => ({
        ...prev,
        ...updatedUser,
      }));

      setEditFormData({
        name: updatedUser.name,
        email: updatedUser.email,
        avatarUrl: updatedUser.avatarUrl,
      });

      setPreviewImage(updatedUser.avatarUrl);
      setProfileImageFile(null);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update profile. Please try again.";
      alert(message);
    } finally {
      setIsSavingProfile(false);
    }
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

      setProfileImageFile(file);

      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
    }
  };

  const handleOpenApplyModal = () => {
    if (roommateStatus === "notApplied") {
      setApplicationData(createEmptyApplicationData(user.interests || []));
      setIsEditingApplication(false);
      setIsApplyModalOpen(true);
    }
  };

  const handleEditApplication = () => {
    if (!currentApplication) {
      return;
    }

    setApplicationData(mapPostToApplicationData(currentApplication));
    setIsEditingApplication(true);
    setIsApplyModalOpen(true);
  };

  const handleRemoveApplication = async () => {
    if (!currentApplicationId) {
      alert("No submitted application found.");
      return;
    }

    if (!window.confirm("Are you sure you want to remove your roommate application?")) {
      return;
    }

    try {
      await apiClient.delete(`/roommates/${currentApplicationId}`);
      setRoommateStatus("notApplied");
      setCurrentApplicationId(null);
      setCurrentApplication(null);
      setIsEditingApplication(false);
      setApplicationData(createEmptyApplicationData(user.interests || []));
      alert("Your roommate application was removed.");
    } catch (error) {
      console.error("Error removing roommate application:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to remove application. Please try again.";
      alert(message);
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

  const handleSubmitApplication = async () => {
    if (
      !applicationData.gender ||
      !applicationData.age ||
      !applicationData.occupation ||
      !applicationData.location ||
      !applicationData.bio ||
      !applicationData.about ||
      !applicationData.preferredLocation ||
      !applicationData.moveInDate ||
      !applicationData.budget
    ) {
      alert("Please fill in all required fields marked with *");
      return;
    }

    if (applicationData.interests.length === 0) {
      alert("Please select at least one interest");
      return;
    }

    try {
      const preferenceParts = [applicationData.preferences, applicationData.additionalInfo]
        .map((value) => value?.trim())
        .filter(Boolean);

      const payload = {
        gender: applicationData.gender,
        age: applicationData.age ? Number(applicationData.age) : null,
        occupation: applicationData.occupation,
        location: applicationData.location,
        bio: applicationData.bio,
        about: applicationData.about,
        interests: applicationData.interests.join(", "),
        preferences: preferenceParts.join(" | "),
        preferredLocation: applicationData.preferredLocation,
        moveInDate: applicationData.moveInDate,
        budget: applicationData.budget ? Number(applicationData.budget) : null,
      };

      if (authUser?.id) {
        payload.poster = { id: authUser.id };
      }

      const response = isEditingApplication && currentApplicationId
        ? await apiClient.put(`/roommates/${currentApplicationId}`, payload)
        : await apiClient.post("/roommates", payload);

      const savedPost = response?.data;

      setRoommateStatus("applied");
      setCurrentApplication(savedPost || null);
      if (savedPost?.id) {
        setCurrentApplicationId(savedPost.id);
      }
      setIsApplyModalOpen(false);
      setIsEditingApplication(false);
      setApplicationData(createEmptyApplicationData(user.interests || []));

      alert(
        isEditingApplication
          ? "✅ Your roommate application was updated."
          : "🎉 You are now applied as a roommate and visible in the roommate section."
      );
    } catch (error) {
      console.error("Error creating roommate application:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to apply as roommate. Please try again.";
      alert(message);
    }
  };

  const getStatusBadge = () => {
    const statusConfig = {
      notApplied: { text: "Not Applied", color: "bg-gray-100 text-gray-800" },
      applied: { text: "Applied", color: "bg-blue-100 text-blue-800" },
    };

    const config = statusConfig[roommateStatus] || statusConfig.notApplied;
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getRoleLabel = (role) => {
    if (!role) return "User";
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
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
              <p className="text-gray-600 mt-2">{user.email}</p>
              <div className="mt-2">
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  {getRoleLabel(user.role)}
                </span>
              </div>

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
                <button
                  onClick={() => navigate("/add-property")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium transition"
                >
                  + Add Property
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
                  <>
                    <button
                      onClick={handleEditApplication}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-md font-medium transition"
                    >
                      Edit Application
                    </button>
                    <button
                      onClick={handleRemoveApplication}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium transition"
                    >
                      Remove Application
                    </button>
                  </>
                )}
              </div>
            </div>
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
                disabled={isSavingProfile}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition"
              >
                {isSavingProfile ? "Saving..." : "Save Changes"}
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
                <span>🏠</span> {isEditingApplication ? "Edit Roommate Application" : "Apply as a Roommate"}
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
                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={applicationData.gender}
                      onChange={handleApplicationChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={applicationData.age}
                      onChange={handleApplicationChange}
                      placeholder="e.g., 24"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Occupation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Occupation <span className="text-red-500">*</span>
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Location <span className="text-red-500">*</span>
                    </label>
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
                    Short bio <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="bio"
                    value={applicationData.bio}
                    onChange={handleApplicationChange}
                    placeholder="A short description about you"
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none mb-4"
                  />

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed about <span className="text-red-500">*</span>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred boarding location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="preferredLocation"
                    value={applicationData.preferredLocation}
                    onChange={handleApplicationChange}
                    placeholder="e.g., Colombo 4-7"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

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
                  if (isEditingApplication && currentApplication) {
                    setApplicationData(mapPostToApplicationData(currentApplication));
                  } else {
                    setApplicationData(createEmptyApplicationData(user.interests || []));
                  }
                  setIsEditingApplication(false);
                }}
                className="px-6 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitApplication}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition flex items-center gap-2"
              >
                <span>✓</span> {isEditingApplication ? "Save Changes" : "Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
