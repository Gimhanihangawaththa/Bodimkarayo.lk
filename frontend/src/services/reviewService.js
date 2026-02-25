import { apiClient } from '../config/api.config';

/**
 * Review Service - All review-related API calls
 * These endpoints should be implemented by your backend team member
 */

const reviewService = {
  /**
   * Get all reviews for a property
   * Backend endpoint: GET /api/properties/:propertyId/reviews
   */
  getReviewsByPropertyId: async (propertyId) => {
    try {
      const response = await apiClient.get(`/properties/${propertyId}/reviews`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching reviews for property ${propertyId}:`, error);
      throw error;
    }
  },

  /**
   * Get a single review by ID
   * Backend endpoint: GET /api/reviews/:reviewId
   */
  getReviewById: async (reviewId) => {
    try {
      const response = await apiClient.get(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching review ${reviewId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new review
   * Backend endpoint: POST /api/properties/:propertyId/reviews
   */
  createReview: async (propertyId, reviewData) => {
    try {
      const response = await apiClient.post(
        `/properties/${propertyId}/reviews`,
        reviewData
      );
      return response.data;
    } catch (error) {
      console.error(`Error creating review for property ${propertyId}:`, error);
      throw error;
    }
  },

  /**
   * Update an existing review
   * Backend endpoint: PUT /api/reviews/:reviewId
   */
  updateReview: async (reviewId, reviewData) => {
    try {
      const response = await apiClient.put(`/reviews/${reviewId}`, reviewData);
      return response.data;
    } catch (error) {
      console.error(`Error updating review ${reviewId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a review
   * Backend endpoint: DELETE /api/reviews/:reviewId
   */
  deleteReview: async (reviewId) => {
    try {
      const response = await apiClient.delete(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting review ${reviewId}:`, error);
      throw error;
    }
  },

  /**
   * Get average rating for a property
   * Backend endpoint: GET /api/properties/:propertyId/rating
   */
  getPropertyRating: async (propertyId) => {
    try {
      const response = await apiClient.get(`/properties/${propertyId}/rating`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching rating for property ${propertyId}:`, error);
      throw error;
    }
  },
};

export default reviewService;
