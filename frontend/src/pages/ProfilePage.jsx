import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../config/api.config";
import { useAuth } from "../context/AuthContext";
import { propertyService } from "../services";
import { UpgradeAdvertisement } from "../components/UpgradeAdvertisement";

const EMPTY_USER = {
  id: null,
  name: "",
  avatarUrl: "",
  email: "",
  role: null,
  interests: [],
  roommateApplicationStatus: "notApplied",
  userProperties: [],
  favoriteProperties: [],
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

  useEffect(() => {
    const loadUserProperties = async () => {
      if (!authUser?.id) {
        return;
      }

      try {
        const allProperties = await propertyService.getAllProperties();
        const userProps = Array.isArray(allProperties)
          ? allProperties.filter((prop) => prop.owner && prop.owner.id === authUser.id)
          : [];

        // Transform properties for display
        const transformedProperties = userProps.map((prop) => ({
          id: prop.id,
          image: prop.images && prop.images.length > 0 ? prop.images[0] : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
          title: prop.title || 'Property',
          location: prop.location || 'Location not specified',
          price: prop.rent || 0,
          type: prop.propertyType || 'Property',
          bedrooms: prop.bedrooms || 0,
          bathrooms: prop.bathrooms || 0,
          available: prop.availableFrom || 'TBD',
        }));

        setUser((prev) => ({
          ...prev,
          userProperties: transformedProperties,
        }));
      } catch (error) {
        console.error("Error loading user properties:", error);
      }
    };

    loadUserProperties();
  }, [authUser]);

  useEffect(() => {
    const loadFavoriteProperties = async () => {
      if (!authUser?.id) {
        return;
      }

      try {
        const favorites = await propertyService.getFavoriteProperties(authUser.id);
        const list = Array.isArray(favorites) ? favorites : [];
        const transformed = list.map((prop) => ({
          id: prop.id,
          image:
            prop.images && prop.images.length > 0
              ? prop.images[0]
              : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
          title: prop.title || "Property",
          location: prop.location || "Location not specified",
          price: prop.rent || 0,
          type: prop.propertyType || "Property",
          bedrooms: prop.bedrooms || 0,
          bathrooms: prop.bathrooms || 0,
          available: prop.availableFrom || "TBD",
        }));

        setUser((prev) => ({
          ...prev,
          favoriteProperties: transformed,
        }));
      } catch (error) {
        console.error("Error loading favorite properties:", error);
      }
    };

    loadFavoriteProperties();
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
        try {
          const imageFormData = new FormData();
          imageFormData.append("image", profileImageFile);

          const imageUploadResponse = await apiClient.post(
            `/users/${authUser.id}/profile-image`,
            imageFormData
          );

          profilePictureUrl =
            imageUploadResponse.data?.profilePictureUrl || profilePictureUrl;
        } catch (imageError) {
          console.error("Error uploading profile image:", imageError);
        }
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

  const handleDeleteProperty = async (propertyId, propertyTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${propertyTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await propertyService.deleteProperty(propertyId);
      
      // Remove property from the list
      setUser((prev) => ({
        ...prev,
        userProperties: prev.userProperties.filter((prop) => prop.id !== propertyId),
      }));
      
      alert("Property deleted successfully.");
    } catch (error) {
      console.error("Error deleting property:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete property. Please try again.";
      alert(message);
    }
  };

  const handleRemoveFavorite = async (propertyId, propertyTitle) => {
    if (!authUser?.id) {
      return;
    }
    if (!window.confirm(`Remove "${propertyTitle}" from your saved properties?`)) {
      return;
    }

    try {
      await propertyService.removeFavoriteProperty(authUser.id, propertyId);
      setUser((prev) => ({
        ...prev,
        favoriteProperties: (prev.favoriteProperties || []).filter((p) => p.id !== propertyId),
      }));
    } catch (error) {
      console.error("Error removing favorite:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to remove from favorites.";
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
          ? "Your roommate application was updated."
          : "You are now applied as a roommate and visible in the roommate section."
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

  // Keyboard Escape listener for closing active modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsEditModalOpen(false);
        setIsApplyModalOpen(false);
      }
    };
    if (isEditModalOpen || isApplyModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditModalOpen, isApplyModalOpen]);

  const getStatusBadge = () => {
    const statusConfig = {
      notApplied: { text: "Not Applied", color: "bg-slate-100 text-slate-700 border border-slate-200" },
      applied: { text: "Applied", color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
    };

    const config = statusConfig[roommateStatus] || statusConfig.notApplied;
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getRoleLabel = (role) => {
    if (!role) return "User";
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                alt={user.name}
                className="w-28 h-28 md:w-32 md:h-32 rounded-3xl object-cover border-4 border-slate-100 shadow-xl bg-slate-100"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400';
                }}
              />
              <span className="absolute -bottom-1 -right-1 bg-[#3488c3] text-white text-xs w-7 h-7 rounded-full flex items-center justify-center font-bold shadow-md">
                ✓
              </span>
            </div>

            {/* Basic Info */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#eaf4fb] text-[#246fa8] border border-[#d2e7f6]">
                  👤 {getRoleLabel(user.role)}
                </span>
                {getStatusBadge()}
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{user.name || 'User Profile'}</h1>
              <p className="text-slate-500 font-medium text-sm">{user.email}</p>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 flex-wrap justify-center md:justify-start">
                <button
                  type="button"
                  onClick={handleEditProfile}
                  className="bg-[#3488c3] hover:bg-[#2978b3] text-white px-6 py-2.5 rounded-2xl font-extrabold text-xs md:text-sm transition shadow-lg shadow-[#3488c3]/25 active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <span>✏️</span> Edit Profile
                </button>
                {roommateStatus === "notApplied" && (
                  <button
                    type="button"
                    onClick={handleOpenApplyModal}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-2xl font-extrabold text-xs md:text-sm transition shadow-lg shadow-emerald-600/25 active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <span>🏠</span> Apply as Roommate
                  </button>
                )}
                {roommateStatus === "applied" && (
                  <>
                    <button
                      type="button"
                      onClick={handleEditApplication}
                      className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-bold text-xs md:text-sm transition cursor-pointer"
                    >
                      Edit Application
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveApplication}
                      className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2.5 rounded-2xl font-bold text-xs md:text-sm transition cursor-pointer"
                    >
                      Remove Application
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Saved properties (favorites) */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-[0_12px_40px_rgba(15,23,42,0.06)] space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>❤️</span> Saved Properties
            </h2>
            <span className="text-xs font-bold text-slate-500">
              {user.favoriteProperties ? `${user.favoriteProperties.length} Saved` : '0 Saved'}
            </span>
          </div>

          {user.favoriteProperties && user.favoriteProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {user.favoriteProperties.map((property) => (
                <div
                  key={property.id}
                  className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-md hover:shadow-2xl hover:border-[#3488c3]/40 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  onClick={() => navigate(`/property/${property.id}`)}
                >
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400";
                      }}
                    />
                    <span className="absolute top-3 right-3 bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                      Saved
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-extrabold text-[#3488c3] tracking-wide uppercase">{property.location}</span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5 group-hover:text-[#3488c3] transition-colors line-clamp-1">{property.title}</h3>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <p className="font-extrabold text-slate-900 text-base">Rs {property.price.toLocaleString()}<span className="text-xs font-normal text-slate-500"> /mo</span></p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFavorite(property.id, property.title);
                        }}
                        className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        Remove ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200 p-8">
              <span className="text-4xl block mb-3">🏡</span>
              <h3 className="text-base font-bold text-slate-800">No saved properties yet</h3>
              <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
                Open any property listing and tap &quot;Save to Favorites&quot; to bookmark it here.
              </p>
            </div>
          )}
        </div>

        {/* My Properties Section - Only visible for property owners */}
        {user.role === 'OWNER' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-[0_12px_40px_rgba(15,23,42,0.06)] space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>🏢</span> My Listed Properties
              </h2>
              <button
                type="button"
                onClick={() => navigate("/add-property")}
                className="bg-[#3488c3] hover:bg-[#2978b3] text-white px-5 py-2.5 rounded-2xl font-extrabold text-xs md:text-sm transition shadow-lg shadow-[#3488c3]/25 cursor-pointer flex items-center gap-1.5"
              >
                <span>+</span> Add Property
              </button>
            </div>

            {user.userProperties && user.userProperties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {user.userProperties.map((property) => (
                  <div
                    key={property.id}
                    className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-md hover:shadow-2xl hover:border-[#3488c3]/40 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                    onClick={() => navigate(`/property/${property.id}`)}
                  >
                    <div className="relative h-48 overflow-hidden bg-slate-100">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 right-3 bg-[#3488c3] text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                        {property.type}
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-extrabold text-[#3488c3] tracking-wide uppercase">{property.location}</span>
                        <h3 className="text-base font-bold text-slate-900 mt-0.5 group-hover:text-[#3488c3] transition-colors line-clamp-1">{property.title}</h3>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <p className="font-extrabold text-slate-900 text-base">Rs {property.price.toLocaleString()}<span className="text-xs font-normal text-slate-500"> /mo</span></p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/edit-property/${property.id}`);
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200 p-8">
                <p className="text-slate-500 text-xs mb-4">You haven't added any property listings yet.</p>
                <button
                  type="button"
                  onClick={() => navigate("/add-property")}
                  className="bg-[#3488c3] hover:bg-[#2978b3] text-white px-6 py-2.5 rounded-2xl font-extrabold text-xs transition shadow-lg shadow-[#3488c3]/25 cursor-pointer"
                >
                  + Add Your First Property
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <UpgradeAdvertisement />

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div 
          onClick={() => setIsEditModalOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200/80 cursor-default transform transition-all"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-[#1b4b6d] px-6 py-5 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 text-xl shadow-inner">
                  ✏️
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white tracking-tight">Edit Profile</h3>
                  <p className="text-xs text-slate-300 font-medium">Update your account information & avatar</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition cursor-pointer"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 space-y-6">
              {/* Profile Image Upload Section */}
              <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/70">
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3">
                  Profile Picture
                </label>
                <div className="flex items-center gap-5">
                  <div className="relative group w-24 h-24 rounded-3xl overflow-hidden border-2 border-white shadow-xl bg-slate-200 shrink-0">
                    <img
                      src={previewImage || user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                      alt="Profile preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400';
                      }}
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200">
                      <span className="text-white text-xs font-bold">Preview</span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3488c3] hover:bg-[#2978b3] text-white rounded-xl font-extrabold text-xs shadow-md shadow-[#3488c3]/20 transition cursor-pointer hover:-translate-y-0.5 active:translate-y-0">
                      <span>📷</span> Upload New Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-400 mt-2 font-medium">Recommended: Square JPG, PNG or GIF (Max 5MB)</p>
                  </div>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full Name</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">👤</span>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                      className="w-full pl-11 pr-4 py-3 border border-slate-200/90 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3] outline-none transition bg-slate-50/50 focus:bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">✉️</span>
                    <input
                      type="email"
                      name="email"
                      value={editFormData.email}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                      className="w-full pl-11 pr-4 py-3 border border-slate-200/90 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3] outline-none transition bg-slate-50/50 focus:bg-white text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/80 flex gap-3 justify-end items-center">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-6 py-2.5 bg-slate-200/70 hover:bg-slate-200 rounded-2xl font-bold text-xs text-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="px-7 py-2.5 bg-[#3488c3] hover:bg-[#2978b3] text-white rounded-2xl font-extrabold text-xs transition shadow-lg shadow-[#3488c3]/25 cursor-pointer disabled:opacity-60 flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
              >
                {isSavingProfile ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>✓</span> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Roommate Application Modal */}
      {isApplyModalOpen && (
        <div 
          onClick={() => {
            setIsApplyModalOpen(false);
            setIsEditingApplication(false);
          }}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200/80 cursor-default transform transition-all flex flex-col justify-between"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-[#1b4b6d] px-6 md:px-8 py-6 flex justify-between items-center text-white sticky top-0 z-10 shadow-md">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 text-2xl shadow-inner shrink-0">
                  👤
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    {isEditingApplication ? "Edit Roommate Application" : "Apply as a Roommate"}
                  </h3>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">Complete your profile to get discovered by compatible flatmates</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setIsApplyModalOpen(false);
                  setIsEditingApplication(false);
                }}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition cursor-pointer"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 md:p-8 space-y-7">
              {/* Sleek Info Callout Banner */}
              <div className="bg-[#3488c3]/10 border border-[#3488c3]/20 rounded-2xl p-4 text-[#20689b] font-medium text-xs flex items-start gap-3 shadow-xs">
                <span className="text-lg shrink-0 mt-0.5">ℹ️</span>
                <p className="leading-relaxed">
                  Your profile details will be listed on <strong className="font-extrabold text-[#1b4b6d]">Bodimkarayo.lk Roommates</strong> so potential flatmates can contact you. Complete all required fields to maximize your AI match rate!
                </p>
              </div>

              {/* Section 1: Basic Info */}
              <div className="space-y-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-base">📋</span>
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Basic Information</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Gender <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <select
                        name="gender"
                        value={applicationData.gender}
                        onChange={handleApplicationChange}
                        className="w-full px-4 py-3 border border-slate-200/90 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3] outline-none transition bg-slate-50/50 focus:bg-white text-slate-900 cursor-pointer"
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Age <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <input
                        type="number"
                        name="age"
                        value={applicationData.age}
                        onChange={handleApplicationChange}
                        placeholder="e.g., 24"
                        className="w-full px-4 py-3 border border-slate-200/90 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3] outline-none transition bg-slate-50/50 focus:bg-white text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Occupation <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">💼</span>
                      <input
                        type="text"
                        name="occupation"
                        value={applicationData.occupation}
                        onChange={handleApplicationChange}
                        placeholder="e.g., Software Engineer, Student"
                        className="w-full pl-11 pr-4 py-3 border border-slate-200/90 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3] outline-none transition bg-slate-50/50 focus:bg-white text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Current Location <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">📍</span>
                      <input
                        type="text"
                        name="location"
                        value={applicationData.location}
                        onChange={handleApplicationChange}
                        placeholder="e.g., Colombo 3, Katubedda"
                        className="w-full pl-11 pr-4 py-3 border border-slate-200/90 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3] outline-none transition bg-slate-50/50 focus:bg-white text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: About You */}
              <div className="space-y-4 pb-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">✍️</span>
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">About You</h4>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Short Bio / Headline <span className="text-rose-500">*</span></label>
                    <textarea
                      name="bio"
                      value={applicationData.bio}
                      onChange={handleApplicationChange}
                      placeholder="A catchy tagline about your lifestyle (e.g. Quiet engineering student looking for a clean place)"
                      rows="2"
                      className="w-full px-4 py-3 border border-slate-200/90 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3] outline-none transition bg-slate-50/50 focus:bg-white resize-none text-slate-900"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Detailed Description <span className="text-rose-500">*</span></label>
                      <span className="text-[11px] font-bold text-slate-400">{applicationData.about.length}/500</span>
                    </div>
                    <textarea
                      name="about"
                      value={applicationData.about}
                      onChange={handleApplicationChange}
                      placeholder="Share about your personality, daily routine, study/work hours, and what you expect from a flatmate..."
                      rows="4"
                      maxLength={500}
                      className="w-full px-4 py-3 border border-slate-200/90 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3] outline-none transition bg-slate-50/50 focus:bg-white resize-none text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Interests */}
              <div className="space-y-3 pb-6 border-b border-slate-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎯</span>
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Your Interests <span className="text-rose-500">*</span></h4>
                  </div>
                  <span className="text-[11px] text-[#3488c3] font-bold">Select all that apply</span>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    "Cooking", "Reading", "Yoga", "Writing", "Hiking", "Photography",
                    "Gaming", "Music", "Sports", "Travel", "Art", "Movies",
                    "Fitness", "Technology", "Gardening", "Meditation"
                  ].map((interest) => {
                    const isSelected = applicationData.interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleInterestToggle(interest)}
                        className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all duration-200 border cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-[#3488c3] text-white border-[#3488c3] shadow-md shadow-[#3488c3]/20 scale-105"
                            : "bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-transparent"
                        }`}
                      >
                        {isSelected && <span className="text-[10px]">✓</span>}
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 4: Move-In & Budget */}
              <div className="space-y-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-base">💰</span>
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Move-In & Budget</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Move-In Date <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <input
                        type="month"
                        name="moveInDate"
                        value={applicationData.moveInDate}
                        onChange={handleApplicationChange}
                        className="w-full px-4 py-3 border border-slate-200/90 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3] outline-none transition bg-slate-50/50 focus:bg-white text-slate-900 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Monthly Budget <span className="text-rose-500">*</span></label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 font-extrabold text-xs text-[#3488c3] bg-[#3488c3]/15 px-2 py-1 rounded-lg">LKR</span>
                      <input
                        type="number"
                        name="budget"
                        value={applicationData.budget}
                        onChange={handleApplicationChange}
                        placeholder="e.g., 25000"
                        className="w-full pl-16 pr-4 py-3 border border-slate-200/90 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3] outline-none transition bg-slate-50/50 focus:bg-white text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 5: Roommate Preferences */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-base">🔍</span>
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Roommate Preferences</h4>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Preferred Location / Area <span className="text-rose-500">*</span></label>
                  <div className="relative mb-3">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">📍</span>
                    <input
                      type="text"
                      name="preferredLocation"
                      value={applicationData.preferredLocation}
                      onChange={handleApplicationChange}
                      placeholder="e.g., Colombo 4-7, Moratuwa, Malabe"
                      className="w-full pl-11 pr-4 py-3 border border-slate-200/90 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3] outline-none transition bg-slate-50/50 focus:bg-white text-slate-900"
                    />
                  </div>

                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Specific Roommate Preferences (Optional)</label>
                  <textarea
                    name="preferences"
                    value={applicationData.preferences}
                    onChange={handleApplicationChange}
                    placeholder="e.g., Prefer quiet non-smoker, early riser, pet-friendly, vegetarian, etc."
                    rows="3"
                    className="w-full px-4 py-3 border border-slate-200/90 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3] outline-none transition bg-slate-50/50 focus:bg-white resize-none text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/80 flex gap-3 justify-end items-center sticky bottom-0 z-10 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setIsApplyModalOpen(false);
                  setIsEditingApplication(false);
                }}
                className="px-6 py-2.5 bg-slate-200/70 hover:bg-slate-200 rounded-2xl font-bold text-xs text-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitApplication}
                className="px-7 py-2.5 bg-[#3488c3] hover:bg-[#2978b3] text-white rounded-2xl font-extrabold text-xs transition shadow-lg shadow-[#3488c3]/25 cursor-pointer flex items-center gap-1.5 hover:-translate-y-0.5 active:translate-y-0"
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
