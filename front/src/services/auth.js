import { api } from './api';

export const loginUsuario = async (username, password) => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  const response = await api.post('/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
};
export const logoutUsuario = async () => {
  // El interceptor que creamos antes automáticamente le pegará el token a esta petición
  const response = await api.post('/auth/logout');
  return response.data;
};