import { apiClient } from '../config/api.config'

/**
 * Global Search Service - Search across properties and roommates
 */

const searchService = {
  /**
   * Global search across properties and roommates
   * Backend endpoint: GET /api/search/global
   */
  globalSearch: async (keyword) => {
    try {
      const response = await apiClient.get('/search/global', {
        params: { keyword },
      })
      return response.data
    } catch (error) {
      console.error('Error performing global search:', error)
      throw error
    }
  },
}

export default searchService
