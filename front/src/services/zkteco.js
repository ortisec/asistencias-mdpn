import { api } from './api';

export const checkDeviceStatus = async (config) => {
  const response = await api.post('/zkteco/status', config);
  return response.data;
};

export const syncUsers = async (config) => {
  const response = await api.post('/zkteco/sync-users', config);
  return response.data;
};

export const syncAttendance = async (config) => {
  const response = await api.post('/zkteco/sync-attendance', config);
  return response.data;
};

export const syncAll = async (config) => {
  const response = await api.post('/zkteco/sync-all', config);
  return response.data;
};
