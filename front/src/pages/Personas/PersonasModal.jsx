// src/pages/Personas/PersonasModal.jsx
import { Button, Input, Select } from '../../components/ui';

export const PersonasModal = ({ isOpen, onClose, formData, setFormData, onSubmit, catalogs, editingId }) => {
  if (!isOpen) return null;
  
  const { cargos, condiciones, conceptos } = catalogs;
  const diasSemana = [
    { id: '1', letra: 'L' }, { id: '2', letra: 'M' }, { id: '3', letra: 'X' }, 
    { id: '4', letra: 'J' }, { id: '5', letra: 'V' }, { id: '6', letra: 'S' }, { id: '0', letra: 'D' }
  ];

  const handleConceptoToggle = (id) => {
    const ids = formData.conceptos_ids.includes(id) 
      ? formData.conceptos_ids.filter(i => i !== id) 
      : [...formData.conceptos_ids, id];
    setFormData({ ...formData, conceptos_ids: ids });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <form onSubmit={onSubmit} className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="p-6 border-b dark:border-gray-800 flex justify-between">
          <h2 className="text-lg font-bold">{editingId ? 'Editar Trabajador' : 'Registrar Trabajador'}</h2>
          <button onClick={onClose}>✕</button>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Formulario Izquierda */}
          <div className="w-1/2 p-6 overflow-y-auto space-y-4">
            <Input label="DNI" value={formData.dni} onChange={(e) => setFormData({...formData, dni: e.target.value})} disabled={!!editingId} required />
            <Input label="Nombre" value={formData.nombre_completo} onChange={(e) => setFormData({...formData, nombre_completo: e.target.value.toUpperCase()})} required />
            <Select label="Régimen" value={formData.tipo_trabajador} onChange={(e) => setFormData({...formData, tipo_trabajador: e.target.value})} options={[{label:'CAS 1057', value:'1057'}, {label:'D.L. 728', value:'728'}]} required />
            {/* Agrega aquí los selects de Cargo y Condición */}
          </div>

          {/* Reglas Salariales Derecha */}
          <div className="w-1/2 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-950">
            <h3 className="font-bold text-sm mb-4">Reglas Salariales</h3>
            {conceptos.map(c => (
              <label key={c.id} className="flex gap-2 text-sm p-1">
                <input type="checkbox" checked={formData.conceptos_ids.includes(c.id)} onChange={() => handleConceptoToggle(c.id)} />
                {c.nombre}
              </label>
            ))}
          </div>
        </div>
        <div className="p-6 border-t flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </div>
  );
};