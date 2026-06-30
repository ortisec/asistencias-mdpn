import { Button, Input } from '../../components/ui';

export const AsistenciaEditModal = ({ isOpen, onClose, form, setForm, onSubmit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <form onSubmit={onSubmit} className="bg-gray-800 rounded-xl border border-blue-500 w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-white mb-4">Editar Marcación</h2>
        <Input label="Ingreso" type="datetime-local" value={form.fecha_ingreso} onChange={(e) => setForm({...form, fecha_ingreso: e.target.value})} />
        <Input label="Salida" type="datetime-local" value={form.fecha_salida} onChange={(e) => setForm({...form, fecha_salida: e.target.value})} className="mt-4" />
        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </div>
  );
};