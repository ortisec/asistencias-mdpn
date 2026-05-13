import { api } from './api';

// --- HORARIOS ---
export const getHorarios = async () => {
  const response = await api.get('/configuraciones/horarios');
  return response.data; // Ahora esto devuelve un Array con los 3 regímenes
};

export const updateHorarios = async (regimen, horariosData) => {
  // Ahora pasamos el régimen en la URL
  const response = await api.put(`/configuraciones/horarios/${regimen}`, horariosData);
  return response.data;
};

// --- FERIADOS ---
export const getFeriados = async () => {
  const response = await api.get('/configuraciones/feriados');
  return response.data;
};

export const createFeriado = async (feriadoData) => {
  const response = await api.post('/configuraciones/feriados', feriadoData);
  return response.data;
};

export const deleteFeriado = async (feriadoId) => {
  const response = await api.delete(`/configuraciones/feriados/${feriadoId}`);
  return response.data;
};