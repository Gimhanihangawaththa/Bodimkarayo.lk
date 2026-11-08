import { apiClient } from '../config/api.config';

/**
 * Normalize API review to the shape expected by ReviewItem / PropertyView
 */
export function mapReviewFromApi(raw) {
  if (!raw) return null;
  const author = raw.author ?? 'Anonymous';
  return {
    id: raw.id,
    author,
    avatar:
      raw.avatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(author)}`,
    rating: raw.rating,
    text: raw.text ?? raw.comment ?? '',
    date: raw.date ?? '',
    reviewerId: raw.reviewerId ?? null,
  };
}

const reviewService = {
  // ─── Roommate reviews ────────────────────────────────────────────────────────

  getReviewsByRoommateId: async (roommatePostId) => {
    try {
      const response = await apiClient.get(`/roommates/${roommatePostId}/reviews`);
      const data = response.data;
      return Array.isArray(data) ? data.map(mapReviewFromApi) : [];
    } catch (error) {
      console.error(`Error fetching reviews for roommate ${roommatePostId}:`, error);
      throw error;
    }
  },

  createRoommateReview: async (roommatePostId, reviewData) => {
    try {
      const response = await apiClient.post(`/roommates/${roommatePostId}/reviews`, {
        rating: reviewData.rating,
        comment: reviewData.text,
      });
      return mapReviewFromApi(response.data);
    } catch (error) {
      console.error(`Error creating review for roommate ${roommatePostId}:`, error);
      throw error;
    }
  },

  deleteRoommateReview: async (roommatePostId, reviewId) => {
    try {
      const response = await apiClient.delete(`/roommates/${roommatePostId}/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting roommate review ${reviewId}:`, error);
      throw error;
    }
  },

  getRoommateRating: async (roommatePostId) => {
    try {
      const response = await apiClient.get(`/roommates/${roommatePostId}/rating`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching rating for roommate ${roommatePostId}:`, error);
      throw error;
    }
  },

  // ─── Property reviews ────────────────────────────────────────────────────────
  getReviewsByPropertyId: async (propertyId) => {
    try {
      const response = await apiClient.get(`/properties/${propertyId}/reviews`);
      const data = response.data;
      return Array.isArray(data) ? data.map(mapReviewFromApi) : [];
    } catch (error) {
      console.error(`Error fetching reviews for property ${propertyId}:`, error);
      throw error;
    }
  },

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
   * @param {string|number} propertyId
   * @param {{ rating: number, text: string }} reviewData
   */
  createReview: async (propertyId, reviewData) => {
    try {
      const response = await apiClient.post(`/properties/${propertyId}/reviews`, {
        rating: reviewData.rating,
        comment: reviewData.text,
      });
      return mapReviewFromApi(response.data);
    } catch (error) {
      console.error(`Error creating review for property ${propertyId}:`, error);
      throw error;
    }
  },

  updateReview: async (reviewId, reviewData) => {
    try {
      const response = await apiClient.put(`/reviews/${reviewId}`, reviewData);
      return response.data;
    } catch (error) {
      console.error(`Error updating review ${reviewId}:`, error);
      throw error;
    }
  },

  deleteReview: async (reviewId) => {
    try {
      const response = await apiClient.delete(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting review ${reviewId}:`, error);
      throw error;
    }
  },

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
