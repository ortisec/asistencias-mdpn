import axios from 'axios';

const getBaseURL = () => {
  // 1. Prioridad máxima: Variable de entorno (útil para el VPS)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // 2. Si estamos en desarrollo local (tu PC)
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:8000/api/v1';
  }

  // 3. Si estamos en el VPS con Cloudflare
  // Al usar un túnel, la API suele estar en la misma raíz que el front
  // o en un subdominio que el navegador ya interpreta como seguro.
  // IMPORTANTE: Aquí quitamos el ":8000" porque el túnel de Cloudflare
  // ya hace el puente hacia el puerto 8000 internamente.
  return `https://${window.location.hostname}/api/v1`;
};

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor (mantenlo igual)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);