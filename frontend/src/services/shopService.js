import api from './api';

export const shopService = {
  getShops: async (params = {}) => {
    const response = await api.get('/shops/', { params });
    return response.data;
  },

  getMyShops: async () => {
    const response = await api.get('/shops/?my_shops=true');
    return response.data;
  },

  getShopById: async (id) => {
    const response = await api.get(`/shops/${id}/`);
    return response.data;
  },

  createShop: async (shopData) => {
    const response = await api.post('/shops/', shopData);
    return response.data;
  },

  updateShop: async (id, shopData) => {
    const response = await api.put(`/shops/${id}/`, shopData);
    return response.data;
  },

  getNearbyShops: async (latitude, longitude, radius = 50) => {
    const response = await api.get(`/shops/nearby/`, {
      params: { latitude, longitude, radius }
    });
    return response.data;
  },

  getShopMedicines: async (shopId) => {
    const response = await api.get(`/shops/${shopId}/medicines/`);
    return response.data;
  },

  approveShop: async (id) => {
    const response = await api.post(`/shops/${id}/approve/`);
    return response.data;
  },

  rejectShop: async (id) => {
    const response = await api.post(`/shops/${id}/reject/`);
    return response.data;
  },

  toggleShopActive: async (id) => {
    const response = await api.post(`/shops/${id}/toggle_active/`);
    return response.data;
  }
};

export default shopService;
