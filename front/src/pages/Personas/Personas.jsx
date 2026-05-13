import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { getPersonas, createPersona, updatePersona } from '../../services/personas';

export default function Personas() {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const [editingId, setEditingId] = useState(null);

  // --- 1. ACTUALIZAMOS EL ESTADO INICIAL ---
  const [formData, setFormData] = useState({
    dni: '',
    nombre_completo: '',
    tipo_trabajador: '',
    fecha_inicio_labores: '',
    dias_laborables: ['1', '2', '3', '4', '5'] // Lunes a Viernes por defecto
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
    const { id, value } = e.target;
    // Solo aplicamos mayúsculas si el campo es el nombre completo
    const valorFinal = id === 'nombre_completo' ? value.toUpperCase() : value;
    
    setFormData({ ...formData, [id]: valorFinal });
  };

  // --- 2. LÓGICA PARA LOS BOTONES DE DÍAS ---
  const handleDiaToggle = (diaId) => {
    setFormData((prev) => {
      const nuevosDias = prev.dias_laborables.includes(diaId)
        ? prev.dias_laborables.filter(d => d !== diaId) // Si está, lo quitamos
        : [...prev.dias_laborables, diaId]; // Si no está, lo agregamos

      return { ...prev, dias_laborables: nuevosDias.sort() }; // Mantenemos el orden
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // VALIDACIÓN MANUAL: Evita que viaje al backend si falta la fecha o el régimen
    if (!formData.fecha_inicio_labores) {
      setError("Por favor, seleccione correctamente la fecha de inicio de labores en el calendario.");
      return; // Detiene el proceso aquí mismo
    }
    if (!formData.tipo_trabajador) {
      setError("Por favor, seleccione un Régimen.");
      return;
    }

    try {
      const datosAEnviar = {
        ...formData,
        tipo_trabajador: Number(formData.tipo_trabajador),
        dias_laborables: formData.dias_laborables.join(',') 
      };

      if (editingId) {
        await updatePersona(editingId, datosAEnviar);
        setEditingId(null);
      } else {
        await createPersona(datosAEnviar);
      }

      cargarPersonas();
      // Limpiamos el formulario al terminar
      setFormData({ dni: '', nombre_completo: '', tipo_trabajador: '', fecha_inicio_labores: '', dias_laborables: ['1', '2', '3', '4', '5'] });
      setError(null);
    } catch (err) {
      const detalleError = err.response?.data?.detail;
      if (Array.isArray(detalleError)) {
        setError("Error de validación en el servidor: Revise que todos los datos sean correctos.");
      } else {
        setError(detalleError || 'Error al guardar la persona en la base de datos.');
      }
    }
  };

  const handleEditClick = (persona) => {
    setEditingId(persona.id);
    setFormData({
      dni: persona.dni,
      nombre_completo: persona.nombre_completo,
      tipo_trabajador: persona.tipo_trabajador.toString(),
      fecha_inicio_labores: persona.fecha_inicio_labores || '',
      dias_laborables: persona.dias_laborables ? persona.dias_laborables.split(',') : []
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ dni: '', nombre_completo: '', tipo_trabajador: '', fecha_inicio_labores: '', dias_laborables: ['1', '2', '3', '4', '5'] });
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

  const opcionesRegimen = [
    { value: '1057', label: 'CAS 1057' },
    { value: '728', label: 'D.L. 728' },
    { value: '276', label: 'D.L. 276' }
  ];

  // Catálogo de días de la semana
  const diasSemana = [
    { id: '1', letra: 'L', nombre: 'Lunes' },
    { id: '2', letra: 'M', nombre: 'Martes' },
    { id: '3', letra: 'X', nombre: 'Miércoles' }, // Usamos X para diferenciar de Martes
    { id: '4', letra: 'J', nombre: 'Jueves' },
    { id: '5', letra: 'V', nombre: 'Viernes' },
    { id: '6', letra: 'S', nombre: 'Sábado' },
    { id: '0', letra: 'D', nombre: 'Domingo' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestión de Personal</h1>

      {error && (
        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 border border-red-200 dark:border-red-900">
          {error}
        </div>
      )}

      {/* --- 3. FORMULARIO REDISEÑADO CON DOS FILAS --- */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col gap-6 border-t-4 border-blue-500 transition-colors">

        {/* Fila 1: Datos Personales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="DNI" id="dni" placeholder="Ej: 12345678" value={formData.dni} onChange={handleChange} required disabled={editingId !== null} />
          <Input label="Nombre Completo" id="nombre_completo" placeholder="Ej: JUAN PÉREZ" value={formData.nombre_completo} onChange={handleChange} required />
          <Select label="Régimen" id="tipo_trabajador" value={formData.tipo_trabajador} onChange={handleChange} options={opcionesRegimen} required />
        </div>

        {/* Fila 2: Perfil de Asistencia */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
          <div className="md:col-span-1">
            <Input label="Inicio de Labores" id="fecha_inicio_labores" type="date" value={formData.fecha_inicio_labores} onChange={handleChange} required />
          </div>

          <div className="md:col-span-2 flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-300">Días Laborables en Contrato</label>
            <div className="flex flex-wrap gap-2">
              {diasSemana.map((dia) => {
                const isSelected = formData.dias_laborables.includes(dia.id);
                return (
                  <button
                    key={dia.id}
                    type="button"
                    onClick={() => handleDiaToggle(dia.id)}
                    title={dia.nombre}
                    className={`w-10 h-10 rounded-full font-bold text-sm transition-all duration-200 border flex items-center justify-center
                      ${isSelected
                        ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                        : 'bg-gray-800 text-gray-400 border-gray-600 hover:bg-gray-700 hover:text-gray-200'
                      }
                    `}
                  >
                    {dia.letra}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-2 justify-end">
          {editingId && (
            <Button type="button" variant="secondary" onClick={handleCancelEdit}>
              Cancelar
            </Button>
          )}
          <Button type="submit" variant="primary" className="bg-blue-600 hover:bg-blue-700">
            {editingId ? 'Actualizar Expediente' : 'Registrar Personal'}
          </Button>
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
                <th className="px-6 py-4 font-semibold">Perfil Asistencia</th>
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
                    <td className="px-6 py-4 dark:text-gray-300">
                      {persona.nombre_completo}
                      <div className="text-xs text-gray-500 mt-1">
                        {persona.tipo_trabajador.toString() === '1057' ? 'CAS 1057' : `D.L. ${persona.tipo_trabajador}`}
                      </div>
                    </td>

                    {/* --- NUEVA COLUMNA VISUAL EN LA TABLA --- */}
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-400 mb-1">
                        Inició: <span className="text-gray-200">{persona.fecha_inicio_labores}</span>
                      </div>
                      <div className="flex gap-1">
                        {persona.dias_laborables.split(',').map(d => {
                          const diaEncontrado = diasSemana.find(ds => ds.id === d);
                          return diaEncontrado ? (
                            <span key={d} className="w-5 h-5 flex items-center justify-center rounded bg-blue-900/40 text-blue-400 border border-blue-800 text-[10px] font-bold">
                              {diaEncontrado.letra}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide ${persona.is_active
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                        }`}>
                        {persona.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    <td className="px-6 py-4 flex flex-col sm:flex-row gap-2">
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
                        className="text-xs py-1.5 px-3 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-400 dark:hover:bg-indigo-900/60 flex items-center gap-1 justify-center"
                        onClick={() => verHistorial(persona.dni)}
                      >
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