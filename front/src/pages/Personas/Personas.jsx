import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select'; // <-- Importamos el Select
import { Table } from '../../components/ui/Table';
import { getPersonas, createPersona, updatePersona } from '../../services/personas';

export default function Personas() {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    dni: '',
    nombre_completo: '',
    tipo_trabajador: '' // Estará vacío al inicio para forzar la selección
  });

  const cargarPersonas = async () => {
    try {
      setLoading(true);
      const data = await getPersonas();
      setPersonas(data.sort((a, b) => b.id - a.id));
      setError(null);
    } catch (err) {
      setError('Error al cargar las personas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPersonas();
  }, []);

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.id]: e.target.value.toUpperCase() 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const datosAEnviar = {
        ...formData,
        tipo_trabajador: Number(formData.tipo_trabajador)
      };

      if (editingId) {
        await updatePersona(editingId, datosAEnviar);
        setEditingId(null);
      } else {
        await createPersona(datosAEnviar);
      }

      cargarPersonas();
      setFormData({ dni: '', nombre_completo: '', tipo_trabajador: '' });
      setError(null);
    } catch (err) {
      // --- SOLUCIÓN AL CRASH DE REACT ---
      const detalleError = err.response?.data?.detail;
      if (Array.isArray(detalleError)) {
        // Si FastAPI devuelve un array de errores de validación, extraemos solo los mensajes
        setError("Error en los datos ingresados: Revise el formulario.");
      } else {
        // Si es un error normal en texto (ej. "DNI ya existe")
        setError(detalleError || 'Error al guardar la persona');
      }
    }
  };

  const handleEditClick = (persona) => {
    setEditingId(persona.id);
    setFormData({
      dni: persona.dni,
      nombre_completo: persona.nombre_completo,
      tipo_trabajador: persona.tipo_trabajador.toString() // Convertimos a string para que el Select lo reconozca
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ dni: '', nombre_completo: '', tipo_trabajador: '' });
    setError(null);
  };

  const handleToggleStatus = async (persona) => {
    try {
      await updatePersona(persona.id, { is_active: !persona.is_active });
      cargarPersonas(); 
    } catch (err) {
      setError('Error al actualizar el estado del empleado.');
    }
  };

  const verHistorial = (dni) => {
    navigate(`/reportes?dni=${dni}`);
  };

  // Opciones para nuestro nuevo Select de Regímenes
  const opcionesRegimen = [
    { value: '1057', label: 'D.L. 1057' },
    { value: '728', label: 'D.L. 728' },
    { value: '276', label: 'D.L. 276' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestión de Personal</h1>
      
      {error && (
        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 border border-red-200 dark:border-red-900">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col lg:flex-row gap-4 items-end border-t-4 border-blue-500 transition-colors">
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input 
            label="DNI" 
            id="dni" 
            placeholder="Ej: 12345678" 
            value={formData.dni} 
            onChange={handleChange} 
            required 
            disabled={editingId !== null} // Opcional: Bloquea el cambio de DNI al editar
          />
          <Input 
            label="Nombre Completo" 
            id="nombre_completo" 
            placeholder="Ej: Juan Pérez" 
            value={formData.nombre_completo} 
            onChange={handleChange} 
            required 
          />
          
          {/* --- AQUI IMPLEMENTAMOS EL SELECT --- */}
          <Select 
            label="Régimen" 
            id="tipo_trabajador" 
            value={formData.tipo_trabajador} 
            onChange={handleChange} 
            options={opcionesRegimen}
            required 
          />
        </div>
        
        <div className="flex gap-2 w-full lg:w-auto">
          <Button type="submit" variant="primary" className="w-full lg:w-auto">
            {editingId ? 'Actualizar' : 'Guardar'}
          </Button>
          
          {editingId && (
            <Button type="button" variant="secondary" onClick={handleCancelEdit} className="w-full lg:w-auto">
              Cancelar
            </Button>
          )}
        </div>
      </form>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-x-auto transition-colors">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando personal...</div>
        ) : (
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">DNI</th>
                <th className="px-6 py-4 font-semibold">Nombre Completo</th>
                <th className="px-6 py-4 font-semibold">Régimen</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-800 dark:text-gray-200">
              {personas.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No hay personal registrado aún.</td>
                </tr>
              ) : (
                personas.map((persona) => (
                  <tr key={persona.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 font-medium dark:text-white">{persona.dni}</td>
                    <td className="px-6 py-4 dark:text-gray-300">{persona.nombre_completo}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-md text-xs font-semibold">
                        D.L. {persona.tipo_trabajador}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide ${
                        persona.is_active 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' 
                          : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                      }`}>
                        {persona.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    <td className="px-6 py-4 flex gap-2">
                      <Button 
                        type="button"
                        variant="secondary" 
                        className="text-xs py-1.5 px-3 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:hover:bg-blue-900/60"
                        onClick={() => handleEditClick(persona)}
                      >
                        Editar
                      </Button>

                      <Button 
                        type="button"
                        variant={persona.is_active ? "danger" : "primary"} 
                        className={`text-xs py-1.5 px-3 ${!persona.is_active && 'bg-emerald-600 hover:bg-emerald-700'}`}
                        onClick={() => handleToggleStatus(persona)}
                      >
                        {persona.is_active ? 'Desactivar' : 'Activar'}
                      </Button>
                      
                      <Button 
                        type="button"
                        variant="secondary" 
                        className="text-xs py-1.5 px-3 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-400 dark:hover:bg-indigo-900/60 flex items-center gap-1"
                        onClick={() => verHistorial(persona.dni)}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Historial
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}