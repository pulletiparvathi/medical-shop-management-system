import api from './api';

export const inventoryService = {
  getInventory: async (params = {}) => {
    const response = await api.get('/inventory/', { params });
    return response.data;
  },

  getInventoryById: async (id) => {
    const response = await api.get(`/inventory/${id}/`);
    return response.data;
  },

  createInventory: async (data) => {
    const response = await api.post('/inventory/', data);
    return response.data;
  },

  updateInventory: async (id, data) => {
    const response = await api.put(`/inventory/${id}/`, data);
    return response.data;
  },

  deleteInventory: async (id) => {
    const response = await api.delete(`/inventory/${id}/`);
    return response.data;
  },

  getDashboardStats: async (shopId = '') => {
    const params = shopId ? { shop_id: shopId } : {};
    const response = await api.get('/inventory/dashboard_stats/', { params });
    return response.data;
  },

  getLowStock: async (shopId = '') => {
    const params = shopId ? { shop_id: shopId } : {};
    const response = await api.get('/inventory/low_stock/', { params });
    return response.data;
  },

  getExpiring: async (days = '30', shopId = '') => {
    const params = { days };
    if (shopId) params.shop_id = shopId;
    const response = await api.get('/inventory/expiring/', { params });
    return response.data;
  },

  searchMedicinesMediFinder: async (query = '', pincode = '', latitude = null, longitude = null) => {
    const params = {};
    if (query) params.q = query;
    if (pincode) params.pincode = pincode;
    if (latitude) params.latitude = latitude;
    if (longitude) params.longitude = longitude;
    const response = await api.get('/search/medicines/', { params });
    return response.data;
  },

  getAdminStats: async () => {
    const response = await api.get('/admin/stats/');
    return response.data;
  }
};

export default inventoryService;
