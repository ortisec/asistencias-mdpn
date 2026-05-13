import { api } from './api';

export const getAsistencias = async () => {
  const response = await api.get('/asistencias/');
  return response.data;
};

export const createAsistencia = async (asistenciaData) => {
  // asistenciaData debe tener: { persona_id } y opcionalmente { fecha_ingreso }
  const response = await api.post('/asistencias/', asistenciaData);
  return response.data;
};

export const markSalida = async (asistenciaId) => {
  // Llamamos al método PUT enviando el ID en la URL
  const response = await api.put(`/asistencias/${asistenciaId}/salida`);
  return response.data;
};