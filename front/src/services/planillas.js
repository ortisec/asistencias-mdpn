import { api } from './api';

// Listar todas las planillas generadas históricamente
export const getPlanillas = async () => {
  const response = await api.get('/planillas/');
  return response.data;
};

// Obtener los detalles de una planilla y sus boletas calculadas
export const getPlanillaById = async (id) => {
  const response = await api.get(`/planillas/${id}`);
  return response.data;
};

// Disparar el motor matemático en el backend para calcular un mes
export const createPlanilla = async (planillaData) => {
  // planillaData enviará: { periodo: "MAYO 2026", tipo_trabajador: 1057 }
  const response = await api.post('/planillas/generar', planillaData);
  return response.data;
};