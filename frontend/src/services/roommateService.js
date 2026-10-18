import { apiClient } from '../config/api.config'

/**
 * Roommate Service - All roommate-related API calls
 */

const roommateService = {
  /**
   * Get all roommate posts
   * Backend endpoint: GET /api/roommates
   */
  getAllRoommates: async (params = {}) => {
    try {
      const response = await apiClient.get('/roommates', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching roommates:', error)
      throw error
    }
  },

  /**
   * Get a single roommate post by ID
   * Backend endpoint: GET /api/roommates/:id
   */
  getRoommateById: async (id) => {
    try {
      const response = await apiClient.get(`/roommates/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching roommate ${id}:`, error)
      throw error
    }
  },

  /**
   * Search roommate posts
   * Backend endpoint: GET /api/roommates/search
   */
  searchRoommates: async (searchParams) => {
    try {
      const response = await apiClient.get('/roommates/search', {
        params: searchParams,
      })
      return response.data
    } catch (error) {
      console.error('Error searching roommates:', error)
      throw error
    }
  },
}

export default roommateService
