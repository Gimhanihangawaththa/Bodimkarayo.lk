import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ImageUploadBox } from "../components/ImageUploadBox";
import { FormInput } from "../components/FormInput";
import { FormSection } from "../components/FormSection";
import { propertyService } from "../services";
import { useAuth } from "../context/AuthContext";
import { MapSelector } from "../components/MapSelector";

const extractCoordinates = (url) => {
  if (!url) return null;
  const match = url.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match) {
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  }
  return null;
};

const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024;
const MAX_TOTAL_IMAGE_SIZE_BYTES = 80 * 1024 * 1024;

export default function AddProperty() {
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const { user } = useAuth();
  
  const isEditMode = !!propertyId;
  
  const [loading, setLoading] = useState(false);
  const [isLoadingProperty, setIsLoadingProperty] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([null, null, null, null, null]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    propertyType: "",
    price: "",
    availableFrom: "",
    location: "",
    address: "",
    numberOfPeople: "1 Person",
    genderPreference: "Both",
    suitableFor: "Any",
    description: "",
    bedrooms: "",
    kitchens: "",
    bathrooms: "",
    floor: "",
    furnished: "",
    parking: "",
    petsAllowed: "",
    offers: ["", "", "", "", "", ""],
    highlights: ["", "", ""],
    rules: ["", "", ""],
    nearby: ["", "", ""],
    mapEmbedUrl: "",
    images: [null, null, null, null, null],
  });

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => {
        if (preview) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [imagePreviews]);

  // Load property data if in edit mode
  useEffect(() => {
    if (isEditMode && propertyId) {
      const loadProperty = async () => {
        try {
          const property = await propertyService.getPropertyById(propertyId);
          
          setFormData({
            title: property.title || "",
            propertyType: property.propertyType || "",
            price: property.rent || "",
            availableFrom: property.availableFrom || "",
            location: property.location || "",
            address: property.address || "",
            numberOfPeople: property.numberOfPeople || "1 Person",
            genderPreference: property.genderPreference || "Both",
            suitableFor: property.suitableFor || "Any",
            description: property.description || "",
            bedrooms: property.bedrooms || "",
            kitchens: property.kitchens || "",
            bathrooms: property.bathrooms || "",
            floor: property.floor || "",
            furnished: property.furnished || "",
            parking: property.parking || "",
            petsAllowed: property.petsAllowed || "",
            offers: property.offers || [],
            highlights: property.highlights || [],
            rules: property.rules || [],
            nearby: property.nearby || [],
            mapEmbedUrl: property.mapEmbedUrl || "",
            images: [null, null, null, null, null],
          });

          if (property.images && property.images.length > 0) {
            const newPreviews = [...imagePreviews];
            property.images.slice(0, 5).forEach((url, index) => {
              newPreviews[index] = url;
            });
            setImagePreviews(newPreviews);
          }
          setImagesToDelete([]);
        } catch (err) {
          console.error("Error loading property:", err);
          setError("Failed to load property details");
        } finally {
          setIsLoadingProperty(false);
        }
      };

      loadProperty();
    } else {
      setIsLoadingProperty(false);
    }
  }, [propertyId, isEditMode]);

  const isExistingImageUrl = (value) => typeof value === "string" && value.startsWith("http");

  const queueImageForDeletion = (imageUrl) => {
    if (!isExistingImageUrl(imageUrl)) {
      return;
    }

    setImagesToDelete((prev) => {
      if (prev.includes(imageUrl)) {
        return prev;
      }
      return [...prev, imageUrl];
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOffersChange = (index, value) => {
    const newOffers = [...formData.offers];
    newOffers[index] = value;
    setFormData((prev) => ({
      ...prev,
      offers: newOffers,
    }));
  };

  const handleListChange = (listName, index, value) => {
    const updatedList = [...formData[listName]];
    updatedList[index] = value;
    setFormData((prev) => ({
      ...prev,
      [listName]: updatedList,
    }));
  };

  const handleAddOffer = () => {
    setFormData((prev) => ({
      ...prev,
      offers: [...prev.offers, ""],
    }));
  };

  const handleAddListItem = (listName) => {
    setFormData((prev) => ({
      ...prev,
      [listName]: [...prev[listName], ""],
    }));
  };

  const handleImageClick = (index) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (!file.type.startsWith("image/")) {
          const message = "Please select a valid image file.";
          setError(message);
          alert(message);
          return;
        }

        if (file.size > MAX_IMAGE_SIZE_BYTES) {
          const message = "Each image must be smaller than 15MB.";
          setError(message);
          alert(message);
          return;
        }

        const newImages = [...formData.images];
        newImages[index] = file;

        const totalImageSize = newImages.reduce((total, image) => {
          if (!image) {
            return total;
          }
          return total + image.size;
        }, 0);

        if (totalImageSize > MAX_TOTAL_IMAGE_SIZE_BYTES) {
          const message = "Total image upload size must be smaller than 80MB.";
          setError(message);
          alert(message);
          return;
        }

        setImagePreviews((prev) => {
          const next = [...prev];
          if (isExistingImageUrl(next[index])) {
            queueImageForDeletion(next[index]);
          }
          if (next[index]) {
            if (typeof next[index] === "string" && next[index].startsWith("blob:")) {
              URL.revokeObjectURL(next[index]);
            }
          }
          next[index] = URL.createObjectURL(file);
          return next;
        });

        setFormData((prev) => ({
          ...prev,
          images: newImages,
        }));
        setError(null);
      }
    };
    input.click();
  };

  const handleRemoveImage = (index) => {
    setImagePreviews((prev) => {
      const next = [...prev];
      const currentPreview = next[index];

      if (isExistingImageUrl(currentPreview)) {
        queueImageForDeletion(currentPreview);
      }

      if (typeof currentPreview === "string" && currentPreview.startsWith("blob:")) {
        URL.revokeObjectURL(currentPreview);
      }

      next[index] = null;
      return next;
    });

    setFormData((prev) => {
      const nextImages = [...prev.images];
      nextImages[index] = null;
      return {
        ...prev,
        images: nextImages,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const hasNewImages = formData.images.some(img => img !== null);
      const hasImagesToDelete = imagesToDelete.length > 0;
      
      const propertyData = {
        title: formData.title,
        propertyType: formData.propertyType,
        rent: parseFloat(formData.price) || 0,
        availableFrom: formData.availableFrom,
        location: formData.location,
        address: formData.address,
        numberOfPeople: formData.numberOfPeople,
        genderPreference: formData.genderPreference || "Both",
        suitableFor: formData.suitableFor || "Any",
        description: formData.description,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        kitchens: formData.kitchens ? parseInt(formData.kitchens) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        floor: formData.floor,
        furnished: formData.furnished,
        parking: formData.parking,
        petsAllowed: formData.petsAllowed,
        mapEmbedUrl: formData.mapEmbedUrl,
        offers: formData.offers.filter((o) => o.trim() !== ""),
        highlights: formData.highlights.filter((h) => h.trim() !== ""),
        rules: formData.rules.filter((r) => r.trim() !== ""),
        nearby: formData.nearby.filter((n) => n.trim() !== ""),
        owner: user ? { id: user.id } : null,
      };

      let savedProperty;
      let isNewProperty = false;

      if (isEditMode) {
        savedProperty = await propertyService.updateProperty(propertyId, propertyData);
        console.log("Property updated successfully:", savedProperty);

        if (hasImagesToDelete) {
          await Promise.all(
            imagesToDelete.map((imageUrl) =>
              propertyService.deletePropertyImage(savedProperty.id, imageUrl)
            )
          );
        }
      } else {
        savedProperty = await propertyService.createProperty(propertyData);
        console.log("Property created successfully:", savedProperty);
        isNewProperty = true;
      }

      if (hasNewImages) {
        const imageFormData = new FormData();
        formData.images.forEach((image) => {
          if (image) {
            imageFormData.append("images", image);
          }
        });

        try {
          await propertyService.uploadPropertyImages(savedProperty.id, imageFormData);
        } catch (imgErr) {
          console.error("Error uploading images:", imgErr);
          if (isNewProperty) {
            alert("Property created but some images failed to upload. You can edit the property to add them later.");
          } else {
            alert("Property updated but some images failed to upload. You can try again later.");
          }
        }
      }

      const successMessage = isEditMode
        ? "Property updated successfully!"
        : "Property added successfully!";
      alert(successMessage);

      if (isEditMode) {
        navigate(`/property/${savedProperty.id}`);
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Error saving property:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        `Failed to ${isEditMode ? "update" : "create"} property. Please try again.`;
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderImageTile = (idx, tileClassName) => (
    <div key={idx} className={tileClassName}>
      <ImageUploadBox
        onClick={() => handleImageClick(idx)}
        previewSrc={imagePreviews[idx]}
      />
      {imagePreviews[idx] && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveImage(idx);
          }}
          className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-2.5 py-1 rounded-xl shadow-md transition cursor-pointer"
        >
          Remove
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-12">
      {/* Error Message */}
      {error && (
        <div className="w-full lg:w-[85%] max-w-6xl mx-auto px-4 mb-6">
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-5 py-4 rounded-2xl font-semibold text-sm flex items-center gap-3 shadow-xs">
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      {isLoadingProperty ? (
        <div className="w-full lg:w-[85%] max-w-6xl mx-auto px-4 py-16 text-center space-y-3">
          <div className="inline-block animate-spin text-3xl text-[#3488c3]">⏳</div>
          <p className="text-slate-600 font-bold text-sm">Loading property details...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full lg:w-[85%] max-w-6xl mx-auto px-4 space-y-8">
          
          {/* Header Banner Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-[0_12px_40px_rgba(15,23,42,0.06)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#3488c3]/15 text-[#3488c3] mb-2 border border-[#3488c3]/20">
                PROPERTY MANAGEMENT
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                {isEditMode ? "Edit Property Listing" : "Publish New Property"}
              </h1>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                Fill in the details below to publish your boarding, annex, or apartment listing on Bodimkarayo.lk
              </p>
            </div>
          </div>

          {/* Image Upload Section */}
          <FormSection title="Property Photos (Up to 5 Photos)">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {[0, 1, 2, 3, 4].map((idx) => renderImageTile(idx, "relative aspect-square w-full"))}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-3">
              💡 Tip: Upload high-quality photos of bedrooms, bathrooms, and living areas to maximize inquiry rates.
            </p>
          </FormSection>

          {/* Basic Information */}
          <FormSection title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Property Title *"
                placeholder="e.g., Luxury Annex Studio near UOC"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              />
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Property Type <span className="text-rose-500">*</span>
                </label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-slate-50/60 border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3] outline-none transition shadow-xs cursor-pointer"
                >
                  <option value="" disabled>Select Property Type</option>
                  <option value="Room">Room</option>
                  <option value="Annex">Annex</option>
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Hostel">Hostel</option>
                </select>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Room", "Annex", "Apartment", "House", "Hostel"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, propertyType: type }))}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        formData.propertyType === type
                          ? "bg-[#3488c3] text-white shadow-xs scale-105"
                          : "bg-slate-100 hover:bg-slate-200/90 text-slate-600"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <FormInput
                label="Monthly Rent (LKR) *"
                placeholder="e.g., 25000"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
              />
              <FormInput
                label="Available From *"
                name="availableFrom"
                type="date"
                value={formData.availableFrom}
                onChange={handleInputChange}
              />
              <FormInput
                label="Location / Area *"
                placeholder="e.g., Colombo 07, Katubedda"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
              />
              <FormInput
                label="Full Address *"
                placeholder="e.g., No. 45/2, Reid Avenue, Colombo 07"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
          </FormSection>

          {/* Tenant Eligibility & Capacity Guidelines */}
          <FormSection title="Tenant Eligibility & Capacity Guidelines">
            <div className="space-y-6">
              {/* Gender Preference */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Gender Requirement / Preference <span className="text-rose-500">*</span>
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Specify whether this boarding/property is strictly for males, females, or open to both.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { value: "Both", label: "Both / Any (Male & Female)", icon: "🚻", desc: "Open to all genders" },
                    { value: "Male", label: "Male Only", icon: "👨", desc: "Gentlemen / Boys only" },
                    { value: "Female", label: "Female Only", icon: "👩", desc: "Ladies / Girls only" },
                  ].map((item) => {
                    const isSelected = (formData.genderPreference || "Both").toLowerCase() === item.value.toLowerCase();
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, genderPreference: item.value }))}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-[#eaf4fb] border-[#3488c3] ring-2 ring-[#3488c3]/30 shadow-sm"
                            : "bg-slate-50/70 hover:bg-slate-100 border-slate-200/90 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-2xl">{item.icon}</span>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-[#3488c3] bg-[#3488c3] text-white text-xs" : "border-slate-300 bg-white"
                          }`}>
                            {isSelected && "✓"}
                          </div>
                        </div>
                        <span className={`text-sm font-extrabold ${isSelected ? "text-[#1b4b6d]" : "text-slate-800"}`}>
                          {item.label}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {item.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Suitable For / Target Tenant */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Suitable For / Target Tenants <span className="text-rose-500">*</span>
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Highlight who this accommodation is best suited for (select one or multiple target groups, e.g. Students + Working Professionals).
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {[
                    { value: "University Students", label: "University Students", icon: "🎓" },
                    { value: "Working Professionals", label: "Working Professionals", icon: "💼" },
                    { value: "Couples", label: "Couples", icon: "💑" },
                    { value: "Family", label: "Families", icon: "👨‍👩‍👧‍👦" },
                    { value: "Any", label: "Any / Anyone", icon: "🌐" },
                  ].map((item) => {
                    const currentParts = (formData.suitableFor || "Any")
                      .split(",")
                      .map((s) => s.trim().toLowerCase())
                      .filter(Boolean);

                    const isSelected = item.value === "Any"
                      ? currentParts.includes("any") || currentParts.length === 0
                      : currentParts.includes(item.value.toLowerCase());

                    const handleToggle = () => {
                      if (item.value === "Any") {
                        setFormData((prev) => ({ ...prev, suitableFor: "Any" }));
                        return;
                      }

                      const withoutAny = (formData.suitableFor || "Any")
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => Boolean(s) && s.toLowerCase() !== "any");

                      const exists = withoutAny.some((s) => s.toLowerCase() === item.value.toLowerCase());
                      let updated;

                      if (exists) {
                        updated = withoutAny.filter((s) => s.toLowerCase() !== item.value.toLowerCase());
                      } else {
                        updated = [...withoutAny, item.value];
                      }

                      if (updated.length === 0) {
                        setFormData((prev) => ({ ...prev, suitableFor: "Any" }));
                      } else {
                        setFormData((prev) => ({ ...prev, suitableFor: updated.join(", ") }));
                      }
                    };

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={handleToggle}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-[#eaf4fb] border-[#3488c3] ring-2 ring-[#3488c3]/30 shadow-sm"
                            : "bg-slate-50/70 hover:bg-slate-100 border-slate-200/90 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xl">{item.icon}</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected ? "border-[#3488c3] bg-[#3488c3] text-white text-[10px]" : "border-slate-300 bg-white"
                          }`}>
                            {isSelected && "✓"}
                          </div>
                        </div>
                        <span className={`text-xs font-extrabold leading-snug ${isSelected ? "text-[#1b4b6d]" : "text-slate-800"}`}>
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Number of Persons / Capacity */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Capacity / Number of Persons <span className="text-rose-500">*</span>
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  How many people can comfortably stay in this boarding / room / annex?
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {["1 Person", "2 Persons", "3 Persons", "4 Persons", "5+ Persons"].map((cap) => {
                    const isSelected = formData.numberOfPeople === cap;
                    return (
                      <button
                        key={cap}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, numberOfPeople: cap }))}
                        className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-[#3488c3] text-white border-[#3488c3] shadow-md shadow-[#3488c3]/20 scale-105"
                            : "bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-transparent"
                        }`}
                      >
                        <span>👥</span>
                        <span>{cap}</span>
                      </button>
                    );
                  })}
                </div>
                <FormInput
                  label="Or specify custom occupant capacity"
                  placeholder="e.g., 2 Persons, 4-6 Students, or Single Occupancy"
                  name="numberOfPeople"
                  value={formData.numberOfPeople}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </FormSection>

          {/* Description */}
          <FormSection title="Detailed Description">
            <textarea
              placeholder="Describe your property, nearby landmarks, security, utilities included, etc."
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-4 py-3 bg-slate-50/60 border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3] outline-none transition shadow-xs resize-none"
            />
          </FormSection>

          {/* Specifications */}
          <FormSection title="Rooms & Layout Specifications">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormInput
                label="Number of Bedrooms"
                placeholder="0"
                name="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={handleInputChange}
              />
              <FormInput
                label="Number of Kitchens"
                placeholder="0"
                name="kitchens"
                type="number"
                value={formData.kitchens}
                onChange={handleInputChange}
              />
              <FormInput
                label="Number of Bathrooms"
                placeholder="0"
                name="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={handleInputChange}
              />
            </div>
          </FormSection>

          {/* Property Details */}
          <FormSection title="Property Amenities & Features">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FormInput
                label="Floor Level"
                placeholder="e.g., Ground Floor, 2nd Floor"
                name="floor"
                value={formData.floor}
                onChange={handleInputChange}
              />
              <FormInput
                label="Furnishing Status"
                placeholder="e.g., Fully Furnished, Semi-Furnished"
                name="furnished"
                value={formData.furnished}
                onChange={handleInputChange}
              />
              <FormInput
                label="Parking Availability"
                placeholder="e.g., 1 Bike Slot, Car Parking"
                name="parking"
                value={formData.parking}
                onChange={handleInputChange}
              />
              <FormInput
                label="Pets Allowed"
                placeholder="e.g., Yes / No / Cats Only"
                name="petsAllowed"
                value={formData.petsAllowed}
                onChange={handleInputChange}
              />
            </div>
          </FormSection>

          {/* Property Offers */}
          <FormSection title="Key Offerings & Facilities">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {formData.offers.map((offer, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={`Facility / Offer ${idx + 1}`}
                  value={offer}
                  onChange={(e) => handleOffersChange(idx, e.target.value)}
                  className="px-4 py-3 bg-slate-50/60 border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3] outline-none transition shadow-xs"
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddOffer}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition cursor-pointer"
            >
              + Add More Offerings
            </button>
          </FormSection>

          {/* Highlights */}
          <FormSection title="Key Highlights">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {formData.highlights.map((highlight, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={`Highlight ${idx + 1}`}
                  value={highlight}
                  onChange={(e) => handleListChange("highlights", idx, e.target.value)}
                  className="px-4 py-3 bg-slate-50/60 border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3] outline-none transition shadow-xs"
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleAddListItem("highlights")}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition cursor-pointer"
            >
              + Add More Highlights
            </button>
          </FormSection>

          {/* House Rules */}
          <FormSection title="House Rules & Guidelines">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {formData.rules.map((rule, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={`House Rule ${idx + 1}`}
                  value={rule}
                  onChange={(e) => handleListChange("rules", idx, e.target.value)}
                  className="px-4 py-3 bg-slate-50/60 border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3] outline-none transition shadow-xs"
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleAddListItem("rules")}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition cursor-pointer"
            >
              + Add More Rules
            </button>
          </FormSection>

          {/* Nearby Places */}
          <FormSection title="Nearby Places & Transport Links">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {formData.nearby.map((spot, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={`Nearby Landmark ${idx + 1}`}
                  value={spot}
                  onChange={(e) => handleListChange("nearby", idx, e.target.value)}
                  className="px-4 py-3 bg-slate-50/60 border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#3488c3] focus:border-[#3488c3] outline-none transition shadow-xs"
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleAddListItem("nearby")}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition cursor-pointer"
            >
              + Add More Places
            </button>
          </FormSection>

          {/* Map Section */}
          <FormSection title="Pin Location on Map">
            <FormInput
              label="Map Location Embed URL"
              placeholder="Click on the map below to auto-generate pin location"
              name="mapEmbedUrl"
              value={formData.mapEmbedUrl}
              onChange={handleInputChange}
            />
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-slate-500">Click on the map to pin your exact property location:</p>
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
                <MapSelector 
                  initialPosition={extractCoordinates(formData.mapEmbedUrl)}
                  onLocationSelect={(lat, lng) => {
                    const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
                    setFormData(prev => ({ ...prev, mapEmbedUrl: embedUrl }));
                  }}
                />
              </div>
            </div>
          </FormSection>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 pb-12">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#3488c3] hover:bg-[#2978b3] text-white font-extrabold py-4 rounded-2xl text-sm transition shadow-lg shadow-[#3488c3]/20 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Publishing Property...</span>
                </>
              ) : (
                <span>{isEditMode ? "Update Property" : "Publish Property"}</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={loading}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-4 rounded-2xl text-sm transition border border-slate-200 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
