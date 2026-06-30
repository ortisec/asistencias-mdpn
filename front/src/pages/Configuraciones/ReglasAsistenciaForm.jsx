// src/pages/Configuraciones/ReglasAsistenciaForm.jsx
import { useState, useEffect } from 'react';
import { Button, Input } from '../../components/ui';
import { updateHorarios, getHorarios } from '../../services/configuraciones';

export const ReglasAsistenciaForm = ({ horarios, onUpdate }) => {
  const [activeRegimen, setActiveRegimen] = useState(1057);
  const [form, setForm] = useState({ es_horario_partido: true, hora_ingreso_manana: '', hora_salida_manana: '', hora_ingreso_tarde: '', hora_salida_tarde: '', min_tol: 15 });

  useEffect(() => {
    const config = horarios.find(h => h.regimen === activeRegimen);
    if (config) {
      setForm({
        es_horario_partido: config.es_horario_partido,
        hora_ingreso_manana: config.hora_ingreso_manana?.substring(0, 5) || '',
        hora_salida_manana: config.hora_salida_manana?.substring(0, 5) || '',
        hora_ingreso_tarde: config.hora_ingreso_tarde?.substring(0, 5) || '',
        hora_salida_tarde: config.hora_salida_tarde?.substring(0, 5) || '',
        min_tol: config.minutos_tolerancia_manana || 15
      });
    }
  }, [activeRegimen, horarios]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateHorarios(activeRegimen, form);
    onUpdate();
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h2 className="text-lg font-bold text-white mb-4">Reglas de Asistencia</h2>
      <div className="flex gap-2 mb-4">
        {[1057, 728, 276].map(r => (
          <Button key={r} variant={activeRegimen === r ? 'primary' : 'secondary'} onClick={() => setActiveRegimen(r)}>
            {r === 1057 ? 'CAS 1057' : `D.L. ${r}`}
          </Button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Hora Ingreso" type="time" value={form.hora_ingreso_manana} onChange={(e) => setForm({...form, hora_ingreso_manana: e.target.value})} />
        <Input label="Hora Salida" type="time" value={form.hora_salida_manana} onChange={(e) => setForm({...form, hora_salida_manana: e.target.value})} />
        {/* Agrega aquí los campos de tarde condicionales */}
        <Button type="submit" className="w-full">Guardar Cambios</Button>
      </form>
    </div>
  );
};