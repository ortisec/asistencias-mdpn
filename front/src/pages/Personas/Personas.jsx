// src/pages/Personas/Personas.jsx
import { useState } from 'react';
import { usePersonas } from './usePersonas';
import { PersonasModal } from './PersonasModal';
import { Button } from '../../components/ui/Button';
import { createPersona, updatePersona } from '../../services/personas';

export default function Personas() {
  const { personas, loading, refresh, ...catalogs } = usePersonas();
  const [modal, setModal] = useState({ isOpen: false, data: null, id: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (modal.id) await updatePersona(modal.id, modal.data);
    else await createPersona(modal.data);
    refresh();
    setModal({ isOpen: false, data: null, id: null });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Personal</h1>
        <Button onClick={() => setModal({ isOpen: true, data: { dni: '' }, id: null })}>+ Nuevo</Button>
      </div>

      {loading ? <p>Cargando...</p> : (
        <table className="w-full">
            {/* Aquí tu tabla mapeando 'personas' */}
        </table>
      )}

      <PersonasModal 
        isOpen={modal.isOpen}
        catalogs={catalogs}
        formData={modal.data}
        setFormData={(d) => setModal({...modal, data: d})}
        onClose={() => setModal({...modal, isOpen: false})}
        onSubmit={handleSubmit}
        editingId={modal.id}
      />
    </div>
  );
}