import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImageUploadBox } from "../components/ImageUploadBox";
import { FormInput } from "../components/FormInput";
import { FormSection } from "../components/FormSection";

export default function AddProperty() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    propertyType: "",
    price: "",
    location: "",
    numberOfPeople: "",
    description: "",
    bedrooms: "",
    kitchens: "",
    bathrooms: "",
    offers: ["", "", "", "", "", ""],
    images: [null, null, null, null, null],
  });

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

  const handleAddOffer = () => {
    setFormData((prev) => ({
      ...prev,
      offers: [...prev.offers, ""],
    }));
  };

  const handleImageClick = (index) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const newImages = [...formData.images];
        newImages[index] = file;
        setFormData((prev) => ({
          ...prev,
          images: newImages,
        }));
      }
    };
    input.click();
  };

  const handleMapClick = () => {
    alert("Map functionality will open here");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log("Form submitted:", formData);
    alert("Property added successfully!");
    // navigate("/properties");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - to be implemented by another developer */}
      <div className="bg-white shadow h-20"></div>

      {/* Main Content */}
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto px-4 py-8">
        {/* Image Upload Section */}
        <FormSection title="Add Property" isMainTitle={true}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[0, 1, 2, 3, 4].map((idx) => (
              <ImageUploadBox key={idx} onClick={() => handleImageClick(idx)} />
            ))}
          </div>
        </FormSection>

        {/* Basic Information */}
        <FormSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              label="Location"
              placeholder="Location Address"
              name="location"
              value={formData.location}
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

        {/* Map Section */}
        <FormSection title="Add location Pin">
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
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition"
          >
            Publish Property
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
