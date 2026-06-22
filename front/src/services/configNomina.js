import { api } from './api';

// --- CARGOS ---
export const getCargos = async () => {
  const response = await api.get('/config-nomina/cargos');
  return response.data;
};

export const createCargo = async (cargoData) => {
  const response = await api.post('/config-nomina/cargos', cargoData);
  return response.data;
};

// --- CONDICIONES LABORALES ---
export const getCondiciones = async () => {
  const response = await api.get('/config-nomina/condiciones');
  return response.data;
};

export const createCondicion = async (condicionData) => {
  const response = await api.post('/config-nomina/condiciones', condicionData);
  return response.data;
};

// --- CONCEPTOS DE NÓMINA ---
export const getConceptos = async () => {
  const response = await api.get('/config-nomina/conceptos');
  return response.data;
};

export const createConcepto = async (conceptoData) => {
  const response = await api.post('/config-nomina/conceptos', conceptoData);
  return response.data;
};