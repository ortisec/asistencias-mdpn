// src/pages/Personas/usePersonas.js
import { useState, useEffect } from 'react';
import { getPersonas } from '../../services/personas';
import { getCargos, getCondiciones, getConceptos } from '../../services/configNomina';

export const usePersonas = () => {
  const [data, setData] = useState({ personas: [], cargos: [], condiciones: [], conceptos: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [personas, cargos, condiciones, conceptos] = await Promise.all([
        getPersonas(), getCargos(), getCondiciones(), getConceptos()
      ]);
      setData({ personas: personas.sort((a, b) => b.id - a.id), cargos, condiciones, conceptos });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);
  return { ...data, loading, refresh: fetchData };
};