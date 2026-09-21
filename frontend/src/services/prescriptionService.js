import api from './api';

export const scanPrescription = async (formData) => {
  const response = await api.post('/prescriptions/scan/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getPrescriptionDetails = async (id) => {
  const response = await api.get(`/prescriptions/${id}/`);
  return response.data;
};

export const searchPrescriptionMedicines = async (params) => {
  const response = await api.get('/search/medicines/', { params });
  return response.data;
};
