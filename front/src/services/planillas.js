import { api } from './api';

export const getPlanillas = async () => {
  const response = await api.get('/planillas/');
  return response.data;
};

export const getPlanillaById = async (id) => {
  const response = await api.get(`/planillas/${id}`);
  return response.data;
};

export const createPlanilla = async (planillaData) => {
  const response = await api.post('/planillas/', planillaData);
  return response.data;
};