// src/pages/Configuraciones/useConfiguraciones.js
import { useState, useEffect } from 'react';
import { getHorarios, getFeriados } from '../../services/configuraciones';
import { getCargos, getCondiciones, getConceptos } from '../../services/configNomina';

export const useConfiguraciones = () => {
  const [data, setData] = useState({ horarios: [], feriados: [], cargos: [], condiciones: [], conceptos: [] });
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      setLoading(true);
      const [horarios, feriados, cargos, condiciones, conceptos] = await Promise.all([
        getHorarios(), getFeriados(), getCargos(), getCondiciones(), getConceptos()
      ]);
      setData({ horarios, feriados, cargos, condiciones, conceptos });
    } finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, []);
  return { ...data, loading, refresh };
};