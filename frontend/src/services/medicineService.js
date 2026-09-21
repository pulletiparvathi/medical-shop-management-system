import api from './api';

export const medicineService = {
  getMedicines: async (params = {}) => {
    const response = await api.get('/medicines/', { params });
    return response.data;
  },

  getMedicineById: async (id) => {
    const response = await api.get(`/medicines/${id}/`);
    return response.data;
  },

  createMedicine: async (medicineData) => {
    const response = await api.post('/medicines/', medicineData);
    return response.data;
  },

  updateMedicine: async (id, medicineData) => {
    const response = await api.put(`/medicines/${id}/`, medicineData);
    return response.data;
  },

  deleteMedicine: async (id) => {
    const response = await api.delete(`/medicines/${id}/`);
    return response.data;
  }
};

export default medicineService;
