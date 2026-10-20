import { apiClient } from '../config/api.config';

const reportService = {
  submitReport: async (reportData) => {
    try {
      const response = await apiClient.post('/reports', reportData);
      return response.data;
    } catch (error) {
      console.error('Error submitting report:', error);
      throw error;
    }
  },
};

export default reportService;
