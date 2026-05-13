import { api } from './api';

export const getPersonas = async () => {
  const response = await api.get('/personas/');
  return response.data;
};

export const createPersona = async (personaData) => {
  const response = await api.post('/personas/', personaData);
  return response.data;
};

// --- NUEVA FUNCIÓN PARA ACTUALIZAR ---
export const updatePersona = async (id, personaData) => {
  // Usamos PATCH y pasamos el ID en la URL
  const response = await api.patch(`/personas/${id}`, personaData);
  return response.data;
};