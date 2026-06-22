import axios from 'axios';

// Detectamos automáticamente la IP o dominio desde donde el usuario abrió la página.
// Si entras por http://localhost, apuntará a localhost:8000
// Si entras por la IP de tu VPS, apuntará a esa IP:8000
const CURRENT_HOST = window.location.hostname;
const DEFAULT_API = `http://${CURRENT_HOST}:8000/api/v1`;

// Usamos la variable de entorno si existe, sino usamos la ruta dinámica
const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar el token de seguridad
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);