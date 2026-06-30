import { useState, useRef } from 'react';
import { useAsistencias } from './useAsistencias';
import { AsistenciaEditModal } from './AsistenciaEditModal';
import { Button, Input, Select, Table } from '../../components/ui';
import { createAsistencia, markSalida, updateAsistenciaAdmin } from '../../services/asistencias';

export default function Asistencias() {
  const { asistencias, personas, loading, error, refresh } = useAsistencias();
  const [modal, setModal] = useState({ isOpen: false, data: {} });
  const [dni, setDni] = useState('');

  const handleRegistro = async (e) => {
    e.preventDefault();
    const persona = personas.find(p => p.dni === dni);
    if (!persona) return alert("DNI no encontrado");
    await createAsistencia({ persona_id: persona.id });
    refresh();
    setDni('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await updateAsistenciaAdmin(modal.data.id, modal.data);
    setModal({ isOpen: false, data: {} });
    refresh();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Control Operativo</h1>
      
      {/* Sección de Registro */}
      <form onSubmit={handleRegistro} className="flex gap-4">
        <Input placeholder="DNI..." value={dni} onChange={(e) => setDni(e.target.value)} />
        <Button type="submit">Registrar Entrada</Button>
      </form>

      {/* Renderizado de Tabla y Modal */}
      <AsistenciaEditModal 
        isOpen={modal.isOpen} 
        onClose={() => setModal({ ...modal, isOpen: false })}
        form={modal.data}
        setForm={(data) => setModal({ ...modal, data })}
        onSubmit={handleUpdate}
      />
    </div>
  );
}