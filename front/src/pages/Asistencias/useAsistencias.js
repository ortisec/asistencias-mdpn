import { useState, useEffect } from 'react';
import { getAsistencias, getPersonas } from '../../services/asistencias';

export const useAsistencias = () => {
  const [data, setData] = useState({ asistencias: [], personas: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [asistencias, personas] = await Promise.all([getAsistencias(), getPersonas()]);
      setData({ 
        asistencias: asistencias.sort((a, b) => b.id - a.id), 
        personas 
      });
      setError(null);
    } catch {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return { ...data, loading, error, refresh: fetchData };
};