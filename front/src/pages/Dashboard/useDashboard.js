// src/pages/Dashboard/useDashboard.js
import { useState, useEffect } from 'react';
import { getPersonas } from '../../services/personas';
import { getAsistencias } from '../../services/asistencias';

export const useDashboard = () => {
  const [data, setData] = useState({ 
    metricas: {}, datosPuntualidad: [], datosRegimen: [], actividadReciente: [] 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const procesarDatos = async () => {
      setLoading(true);
      const [personas, asistencias] = await Promise.all([getPersonas(), getAsistencias()]);
      
      const hoy = new Date().toISOString().split('T')[0];
      const activas = personas.filter(p => p.is_active);
      const regHoy = asistencias.filter(a => a.fecha_ingreso?.startsWith(hoy));
      
      // Cálculos simplificados
      const presentesIds = new Set(regHoy.map(a => a.persona_id));
      
      // Puntualidad
      let [aT, tol, tard] = [0, 0, 0];
      regHoy.forEach(a => {
        const h = new Date(a.fecha_ingreso).getHours();
        const m = new Date(a.fecha_ingreso).getMinutes();
        const totalMin = h * 60 + m;
        const meta = h < 13 ? 480 : 840; // 8:00 o 14:00
        if (totalMin <= meta) aT++; else if (totalMin <= meta + 15) tol++; else tard++;
      });

      setData({
        metricas: { 
          total: activas.length, presentes: presentesIds.size, 
          ausentes: activas.length - presentesIds.size, trabajando: regHoy.filter(a => !a.fecha_salida).length 
        },
        datosPuntualidad: [{ name: 'A Tiempo', value: aT }, { name: 'Tolerancia', value: tol }, { name: 'Tardanza', value: tard }],
        datosRegimen: [
            { name: 'CAS', total: activas.filter(p => p.tipo_trabajador === 1057).length },
            { name: '728', total: activas.filter(p => p.tipo_trabajador === 728).length }
        ],
        actividadReciente: asistencias.sort((a,b) => b.id - a.id).slice(0, 5).map(a => ({
            ...a, persona: personas.find(p => p.id === a.persona_id)
        }))
      });
      setLoading(false);
    };
    procesarDatos();
  }, []);

  return { ...data, loading };
};