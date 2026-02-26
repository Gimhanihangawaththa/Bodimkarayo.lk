import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImageUploadBox } from "../components/ImageUploadBox";
import { FormInput } from "../components/FormInput";
import { FormSection } from "../components/FormSection";
import { propertyService } from "../services";
import { useAuth } from "../context/AuthContext";

const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024;
const MAX_TOTAL_IMAGE_SIZE_BYTES = 80 * 1024 * 1024;

export default function AddProperty() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([null, null, null, null, null]);
  const [formData, setFormData] = useState({
    title: "",
    propertyType: "",
    price: "",
    availableFrom: "",
    location: "",
    address: "",
    numberOfPeople: "",
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
          if (next[index]) {
            URL.revokeObjectURL(next[index]);
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

  const handleMapClick = () => {
    alert("Map functionality will open here");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Separate images from other data
      const hasImages = formData.images.some(img => img !== null);
      
      // Create JSON payload for property data
      const propertyData = {
        title: formData.title,
        propertyType: formData.propertyType,
        rent: parseFloat(formData.price) || 0,
        availableFrom: formData.availableFrom,
        location: formData.location,
        address: formData.address,
        numberOfPeople: formData.numberOfPeople,
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

      // Create property first (without images)
      const response = await propertyService.createProperty(propertyData);
      console.log("Property created successfully:", response);

      // If there are images, upload them separately
      if (hasImages) {
        const imageFormData = new FormData();
        formData.images.forEach((image) => {
          if (image) {
            imageFormData.append("images", image);
          }
        });

        try {
          await propertyService.uploadPropertyImages(response.id, imageFormData);
          console.log("Images uploaded successfully");
        } catch (imgErr) {
          console.error("Error uploading images:", imgErr);
          alert("Property created but some images failed to upload. You can edit the property to add them later.");
        }
      }

      alert("Property added successfully!");
      navigate("/");
    } catch (err) {
      console.error("Error creating property:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to create property. Please try again.";
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - to be implemented by another developer */}
      <div className="bg-white shadow h-20"></div>

      {/* Error Message */}
      {error && (
        <div className="w-full lg:w-[80%] mx-auto px-4 pt-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <form onSubmit={handleSubmit} className="w-full lg:w-[80%] mx-auto px-4 py-8">
        {/* Image Upload Section */}
        <FormSection title="Add Property" isMainTitle={true}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[0, 1, 2, 3, 4].map((idx) => (
              <ImageUploadBox
                key={idx}
                onClick={() => handleImageClick(idx)}
                previewSrc={imagePreviews[idx]}
              />
            ))}
          </div>
        </FormSection>

        {/* Basic Information */}
        <FormSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Title"
              placeholder="Property title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
            />
            <FormInput
              label="Type"
              placeholder="Property type"
              name="propertyType"
              value={formData.propertyType}
              onChange={handleInputChange}
            />
            <FormInput
              label="Price"
              placeholder="Price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleInputChange}
            />
            <FormInput
              label="Available From"
              name="availableFrom"
              type="date"
              value={formData.availableFrom}
              onChange={handleInputChange}
            />
            <FormInput
              label="Location"
              placeholder="Location Address"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
            />
            <FormInput
              label="Full Address"
              placeholder="Full address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
            />
            <FormInput
              label="Number of People"
              placeholder="No. 1 of 2"
              name="numberOfPeople"
              value={formData.numberOfPeople}
              onChange={handleInputChange}
            />
          </div>
        </FormSection>

        {/* Description */}
        <FormSection title="Add Description">
          <textarea
            placeholder="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none h-32"
          />
        </FormSection>

        {/* Specifications */}
        <FormSection title="Specifications">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormInput
              label="Number of bedrooms"
              placeholder="0"
              name="bedrooms"
              type="number"
              value={formData.bedrooms}
              onChange={handleInputChange}
            />
            <FormInput
              label="Number of kitchens"
              placeholder="0"
              name="kitchens"
              type="number"
              value={formData.kitchens}
              onChange={handleInputChange}
            />
            <FormInput
              label="Number of bathrooms"
              placeholder="0"
              name="bathrooms"
              type="number"
              value={formData.bathrooms}
              onChange={handleInputChange}
            />
          </div>
        </FormSection>

        {/* Property Details */}
        <FormSection title="Property Details">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormInput
              label="Floor"
              placeholder="6th floor"
              name="floor"
              value={formData.floor}
              onChange={handleInputChange}
            />
            <FormInput
              label="Furnished"
              placeholder="Fully furnished"
              name="furnished"
              value={formData.furnished}
              onChange={handleInputChange}
            />
            <FormInput
              label="Parking"
              placeholder="1 reserved slot"
              name="parking"
              value={formData.parking}
              onChange={handleInputChange}
            />
            <FormInput
              label="Pets Allowed"
              placeholder="No pets"
              name="petsAllowed"
              value={formData.petsAllowed}
              onChange={handleInputChange}
            />
          </div>
        </FormSection>

        {/* Property Offers */}
        <FormSection title="What your property offers">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {formData.offers.map((offer, idx) => (
              <input
                key={idx}
                type="text"
                placeholder={`Offer${idx + 1}`}
                value={offer}
                onChange={(e) => handleOffersChange(idx, e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddOffer}
            className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
          >
            More...
          </button>
        </FormSection>

        {/* Highlights */}
        <FormSection title="Highlights">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {formData.highlights.map((highlight, idx) => (
              <input
                key={idx}
                type="text"
                placeholder={`Highlight ${idx + 1}`}
                value={highlight}
                onChange={(e) => handleListChange("highlights", idx, e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => handleAddListItem("highlights")}
            className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
          >
            More...
          </button>
        </FormSection>

        {/* House Rules */}
        <FormSection title="House Rules">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {formData.rules.map((rule, idx) => (
              <input
                key={idx}
                type="text"
                placeholder={`Rule ${idx + 1}`}
                value={rule}
                onChange={(e) => handleListChange("rules", idx, e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => handleAddListItem("rules")}
            className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
          >
            More...
          </button>
        </FormSection>

        {/* Nearby Places */}
        <FormSection title="Nearby Places">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {formData.nearby.map((spot, idx) => (
              <input
                key={idx}
                type="text"
                placeholder={`Place ${idx + 1}`}
                value={spot}
                onChange={(e) => handleListChange("nearby", idx, e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => handleAddListItem("nearby")}
            className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
          >
            More...
          </button>
        </FormSection>

        {/* Map Section */}
        <FormSection title="Add location Pin">
          <FormInput
            label="Map Embed URL"
            placeholder="Paste Google Maps embed URL"
            name="mapEmbedUrl"
            value={formData.mapEmbedUrl}
            onChange={handleInputChange}
          />
          <div
            onClick={handleMapClick}
            className="w-full h-64 bg-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-400 transition"
          >
            <div className="text-center">
              <svg
                className="w-12 h-12 text-gray-500 mx-auto mb-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
              </svg>
              <p className="text-gray-600">Map View</p>
            </div>
          </div>
        </FormSection>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-12">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {loading ? "Publishing..." : "Publish Property"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={loading}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition disabled:bg-gray-200 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
