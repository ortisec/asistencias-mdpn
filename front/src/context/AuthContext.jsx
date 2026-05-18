import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Al cargar la app, revisamos si ya había una sesión guardada
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
    navigate('/'); // Redirige al Dashboard tras iniciar sesión
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    setUser(null);
    navigate('/login'); // Expulsa al usuario al login
  };

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Cargando sistema...</div>;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};