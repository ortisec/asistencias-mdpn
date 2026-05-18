import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUsuario } from '../services/auth'; // <-- 1. Importa la nueva función

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');
    if (token && rol) {
      setUser({ token, rol });
    }
    setLoading(false);
  }, []);

  const login = (token, rol) => {
    localStorage.setItem('token', token);
    localStorage.setItem('rol', rol);
    setUser({ token, rol });
    navigate('/');
  };

  // --- 2. FUNCIÓN LOGOUT MEJORADA ---
  const logout = async () => {
    try {
      // Avisamos al backend (opcional, pero buena práctica)
      await logoutUsuario();
    } catch (error) {
      console.error("Error al notificar el cierre de sesión al servidor", error);
    } finally {
      // Siempre destruimos la sesión local, incluso si el servidor da error
      localStorage.removeItem('token');
      localStorage.removeItem('rol');
      setUser(null);
      navigate('/login'); 
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Cargando sistema...</div>;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};