// src/pages/Configuraciones/FeriadosList.jsx
import { useState } from 'react';
import { Button, Input } from '../../components/ui';
import { createFeriado, deleteFeriado } from '../../services/configuraciones';

export const FeriadosList = ({ feriados, onUpdate }) => {
  const [nuevo, setNuevo] = useState({ fecha: '', motivo: '' });

  const agregar = async (e) => {
    e.preventDefault();
    await createFeriado(nuevo);
    setNuevo({ fecha: '', motivo: '' });
    onUpdate();
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h2 className="text-lg font-bold text-white mb-4">Feriados</h2>
      <form onSubmit={agregar} className="flex gap-2 mb-4">
        <Input type="date" value={nuevo.fecha} onChange={(e) => setNuevo({...nuevo, fecha: e.target.value})} />
        <Input placeholder="Motivo" value={nuevo.motivo} onChange={(e) => setNuevo({...nuevo, motivo: e.target.value})} />
        <Button type="submit">Agregar</Button>
      </form>
      <ul className="text-gray-300 text-sm divide-y divide-gray-700">
        {feriados.map(f => (
          <li key={f.id} className="py-2 flex justify-between">
            {f.fecha} - {f.motivo}
            <button onClick={() => deleteFeriado(f.id).then(onUpdate)} className="text-red-400">Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};