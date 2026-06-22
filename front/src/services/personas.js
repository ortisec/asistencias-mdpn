import { api } from './api';

export const getPersonas = async () => {
  const response = await api.get('/personas/');
  return response.data;
};

export const createPersona = async (personaData) => {
  const response = await api.post('/personas/', personaData);
  return response.data;
};

export const updatePersona = async (id, personaData) => {
  const response = await api.put(`/personas/${id}`, personaData);
  return response.data;
};

export const deletePersona = async (id) => {
  const response = await api.delete(`/personas/${id}`);
  return response.data;
};