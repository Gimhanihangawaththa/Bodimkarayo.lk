import { apiClient } from '../config/api.config';

/**
 * Property Service - All property-related API calls
 * These endpoints should be implemented by your backend team member
 */

const propertyService = {
  /**
   * Get all properties
   * Backend endpoint: GET /api/properties
   */
  getAllProperties: async (params = {}) => {
    try {
      const response = await apiClient.get('/properties', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  },

  /**
   * Get a single property by ID
   * Backend endpoint: GET /api/properties/:id
   */
  getPropertyById: async (id) => {
    try {
      const response = await apiClient.get(`/properties/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching property ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new property
   * Backend endpoint: POST /api/properties
   * Accepts FormData for file uploads (images)
   */
  createProperty: async (propertyData) => {
    try {
      const response = await apiClient.post('/properties', propertyData);
      return response.data;
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  },

  /**
   * Update an existing property
   * Backend endpoint: PUT /api/properties/:id
   */
  updateProperty: async (id, propertyData) => {
    try {
      const response = await apiClient.put(`/properties/${id}`, propertyData);
      return response.data;
    } catch (error) {
      console.error(`Error updating property ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a property
   * Backend endpoint: DELETE /api/properties/:id
   */
  deleteProperty: async (id) => {
    try {
      const response = await apiClient.delete(`/properties/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting property ${id}:`, error);
      throw error;
    }
  },

  /**
   * Search properties
   * Backend endpoint: GET /api/properties/search
   */
  searchProperties: async (searchParams) => {
    try {
      const response = await apiClient.get('/properties/search', {
        params: searchParams,
      });
      return response.data;
    } catch (error) {
      console.error('Error searching properties:', error);
      throw error;
    }
  },

  /**
   * Get properties by location
   * Backend endpoint: GET /api/properties/location
   */
  getPropertiesByLocation: async (location) => {
    try {
      const response = await apiClient.get('/properties/location', {
        params: { location },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching properties by location ${location}:`, error);
      throw error;
    }
  },

  /**
   * Get featured/recommended properties
   * Backend endpoint: GET /api/properties/featured
   */
  getFeaturedProperties: async () => {
    try {
      const response = await apiClient.get('/properties/featured');
      return response.data;
    } catch (error) {
      console.error('Error fetching featured properties:', error);
      throw error;
    }
  },
};

export default propertyService;
