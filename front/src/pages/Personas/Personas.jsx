import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useAuth } from '../../context/AuthContext';
import { getPersonas, createPersona, updatePersona } from '../../services/personas';
// Importamos los servicios de los catálogos de nómina
import { getCargos, getCondiciones, getConceptos } from '../../services/configNomina';

export default function Personas() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- ESTADOS PRINCIPALES ---
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- ESTADOS DE CATÁLOGOS DE NÓMINA ---
  const [cargos, setCargos] = useState([]);
  const [condiciones, setCondiciones] = useState([]);
  const [conceptos, setConceptos] = useState([]);

  // --- ESTADOS DEL MODAL Y FORMULARIO ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    dni: '',
    nombre_completo: '',
    tipo_trabajador: '',
    fecha_inicio_labores: '',
    dias_laborables: ['1', '2', '3', '4', '5'], // Lunes a Viernes por defecto
    // Nuevos campos financieros
    salario_basico: '',
    cargo_id: '',
    condicion_id: '',
    conceptos_ids: [] // IDs de bonos/descuentos
  });

  const cargarDatos = async () => {
    try {
      setLoading(true);
      // Cargamos personas y catálogos al mismo tiempo
      const [dataPersonas, dataCargos, dataCondiciones, dataConceptos] = await Promise.all([
        getPersonas(), getCargos(), getCondiciones(), getConceptos()
      ]);
      setPersonas(dataPersonas.sort((a, b) => b.id - a.id));
      setCargos(dataCargos);
      setCondiciones(dataCondiciones);
      setConceptos(dataConceptos);
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos del sistema.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  // --- MANEJADORES DEL FORMULARIO ---
  const handleChange = (e) => {
    const { id, value } = e.target;
    const valorFinal = id === 'nombre_completo' ? value.toUpperCase() : value;
    setFormData({ ...formData, [id]: valorFinal });
  };

  const handleDiaToggle = (diaId) => {
    setFormData((prev) => {
      const nuevosDias = prev.dias_laborables.includes(diaId)
        ? prev.dias_laborables.filter(d => d !== diaId)
        : [...prev.dias_laborables, diaId];
      return { ...prev, dias_laborables: nuevosDias.sort() };
    });
  };

  const handleConceptoToggle = (conceptoId) => {
    setFormData(prev => {
      const tieneConcepto = prev.conceptos_ids.includes(conceptoId);
      const nuevosConceptos = tieneConcepto 
        ? prev.conceptos_ids.filter(id => id !== conceptoId) 
        : [...prev.conceptos_ids, conceptoId];
      return { ...prev, conceptos_ids: nuevosConceptos };
    });
  };

  // --- APERTURA Y CIERRE DEL MODAL ---
  const openModal = (persona = null) => {
    if (persona) {
      setEditingId(persona.id);
      setFormData({
        dni: persona.dni,
        nombre_completo: persona.nombre_completo,
        tipo_trabajador: persona.tipo_trabajador.toString(),
        fecha_inicio_labores: persona.fecha_inicio_labores || '',
        dias_laborables: persona.dias_laborables ? persona.dias_laborables.split(',') : [],
        salario_basico: persona.salario_basico || '',
        cargo_id: persona.cargo_id || '',
        condicion_id: persona.condicion_id || '',
        conceptos_ids: persona.conceptos_asignados ? persona.conceptos_asignados.map(c => c.id) : []
      });
    } else {
      setEditingId(null);
      setFormData({
        dni: '', nombre_completo: '', tipo_trabajador: '', fecha_inicio_labores: '', 
        dias_laborables: ['1', '2', '3', '4', '5'],
        salario_basico: '', cargo_id: '', condicion_id: '', conceptos_ids: []
      });
    }
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fecha_inicio_labores) {
      setError("Seleccione correctamente la fecha de inicio de labores."); return;
    }
    if (!formData.tipo_trabajador) {
      setError("Por favor, seleccione un Régimen."); return;
    }

    try {
      const datosAEnviar = {
        ...formData,
        tipo_trabajador: Number(formData.tipo_trabajador),
        dias_laborables: formData.dias_laborables.join(','),
        salario_basico: formData.salario_basico ? parseFloat(formData.salario_basico) : 0,
        cargo_id: formData.cargo_id ? parseInt(formData.cargo_id) : null,
        condicion_id: formData.condicion_id ? parseInt(formData.condicion_id) : null,
      };

      if (editingId) {
        await updatePersona(editingId, datosAEnviar);
      } else {
        await createPersona(datosAEnviar);
      }

      cargarDatos();
      closeModal();
    } catch (err) {
      const detalleError = err.response?.data?.detail;
      setError(Array.isArray(detalleError) ? "Error de validación en el servidor." : (detalleError || 'Error al guardar la persona.'));
    }
  };

  // --- ACCIONES DE TABLA ---
  const handleToggleEstado = async (persona) => {
    const accion = persona.is_active ? 'dar de baja' : 'reactivar';
    if (!window.confirm(`¿Estás seguro de ${accion} al empleado ${persona.nombre_completo}?`)) return;

    try {
      await updatePersona(persona.id, { is_active: !persona.is_active });
      cargarDatos();
    } catch (err) { setError('Error al cambiar el estado del empleado.'); }
  };

  const verHistorial = (dni) => navigate(`/reportes?dni=${dni}`);

  // --- CATÁLOGOS ESTÁTICOS ---
  const opcionesRegimen = [
    { value: '1057', label: 'CAS 1057' },
    { value: '728', label: 'D.L. 728' },
    { value: '276', label: 'D.L. 276' }
  ];

  const diasSemana = [
    { id: '1', letra: 'L', nombre: 'Lunes' }, { id: '2', letra: 'M', nombre: 'Martes' },
    { id: '3', letra: 'X', nombre: 'Miércoles' }, { id: '4', letra: 'J', nombre: 'Jueves' },
    { id: '5', letra: 'V', nombre: 'Viernes' }, { id: '6', letra: 'S', nombre: 'Sábado' },
    { id: '0', letra: 'D', nombre: 'Domingo' }
  ];

  // Agrupamos conceptos para el modal
  const ingresos = conceptos.filter(c => c.tipo === 'INGRESO');
  const descuentos = conceptos.filter(c => c.tipo === 'DESCUENTO');
  const aportaciones = conceptos.filter(c => c.tipo === 'APORTACION');

  return (
    <div className="space-y-6">
      
      {/* CABECERA */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">Gestión de Personal</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Administración de expedientes, asistencia y nómina.</p>
        </div>
        <Button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-700 shadow-lg">
          + Nuevo Empleado
        </Button>
      </div>

      {error && !isModalOpen && (
        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-900">
          {error}
        </div>
      )}

      {/* --- TABLA DE PERSONAL --- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto custom-scrollbar">
          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Cargando personal...</div>
          ) : (
            <table className="min-w-full text-left text-sm whitespace-nowrap">
              <thead className="uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs">
                <tr>
                  <th className="px-6 py-4 font-semibold">DNI / Nombre</th>
                  <th className="px-6 py-4 font-semibold">Cargo y Salario</th>
                  <th className="px-6 py-4 font-semibold">Perfil Asistencia</th>
                  <th className="px-6 py-4 font-semibold text-center">Estado</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-800 dark:text-gray-200">
                {personas.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No hay personal registrado aún.</td></tr>
                ) : personas.map((persona) => (
                  <tr key={persona.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold dark:text-white">{persona.nombre_completo}</p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{persona.dni}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{persona.cargo?.nombre || 'Sin Cargo'}</p>
                      <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        S/. {persona.salario_basico?.toFixed(2) || '0.00'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="bg-gray-200 dark:bg-gray-900 px-2 py-0.5 rounded text-[10px] font-bold border border-gray-300 dark:border-gray-700">
                          {persona.tipo_trabajador.toString() === '1057' ? 'CAS 1057' : `D.L. ${persona.tipo_trabajador}`}
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">Desde: {persona.fecha_inicio_labores}</span>
                      </div>
                      <div className="flex gap-1">
                        {persona.dias_laborables.split(',').map(d => {
                          const dia = diasSemana.find(ds => ds.id === d);
                          return dia ? (
                            <span key={d} className="w-5 h-5 flex items-center justify-center rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-[10px] font-bold">
                              {dia.letra}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide border ${persona.is_active
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50'
                        : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50'
                        }`}>
                        {persona.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      {['superadmin', 'rrhh'].includes(user?.rol) && (
                        <>
                          <Button type="button" variant="secondary" className="text-xs py-1.5 px-3" onClick={() => openModal(persona)}>
                            Editar
                          </Button>
                          <Button 
                            type="button" 
                            variant={persona.is_active ? "danger" : "primary"} 
                            className={`text-xs py-1.5 px-3 ${!persona.is_active && 'bg-emerald-600 hover:bg-emerald-700'}`}
                            onClick={() => handleToggleEstado(persona)}
                          >
                            {persona.is_active ? 'Baja' : 'Activar'}
                          </Button>
                        </>
                      )}
                      <Button type="button" variant="secondary" className="text-xs py-1.5 px-3" onClick={() => verHistorial(persona.dni)}>
                        Historial
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* --- MODAL DE CREACIÓN / EDICIÓN --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh] border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-950 rounded-t-xl shrink-0">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                {editingId ? 'Modificar Expediente del Trabajador' : 'Registrar Nuevo Trabajador'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-xl leading-none">✕</button>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-3 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-900 shrink-0">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row flex-1 overflow-hidden">
              
              {/* COLUMNA 1: DATOS BÁSICOS Y ASISTENCIA */}
              <div className="md:w-1/2 p-6 overflow-y-auto border-r border-gray-200 dark:border-gray-800 space-y-5 custom-scrollbar">
                
                <div>
                  <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-gray-800 pb-2 mb-4">1. Identidad e Ingreso</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Input label="DNI" id="dni" value={formData.dni} onChange={handleChange} maxLength={8} required disabled={editingId !== null} />
                    <Input label="Fecha Ingreso" id="fecha_inicio_labores" type="date" value={formData.fecha_inicio_labores} onChange={handleChange} required />
                  </div>
                  <Input label="Apellidos y Nombres" id="nombre_completo" value={formData.nombre_completo} onChange={handleChange} required />
                </div>
                
                <div>
                  <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-gray-800 pb-2 mb-4">2. Perfil de Asistencia</h3>
                  <div className="mb-4">
                    <Select label="Régimen Laboral" id="tipo_trabajador" value={formData.tipo_trabajador} onChange={handleChange} options={opcionesRegimen} required />
                  </div>
                  <div className="flex flex-col space-y-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Días de Marcación Obligatoria</label>
                    <div className="flex flex-wrap gap-2">
                      {diasSemana.map((dia) => {
                        const isSelected = formData.dias_laborables.includes(dia.id);
                        return (
                          <button
                            key={dia.id} type="button" onClick={() => handleDiaToggle(dia.id)} title={dia.nombre}
                            className={`w-9 h-9 rounded-full font-bold text-xs transition-all duration-200 border flex items-center justify-center
                              ${isSelected
                                ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.4)]'
                                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }
                            `}
                          >{dia.letra}</button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-gray-800 pb-2 mb-4">3. Clasificación Financiera</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Cargo / Puesto</label>
                      <select value={formData.cargo_id} id="cargo_id" onChange={handleChange} className="w-full bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-white focus:border-blue-500 outline-none" required>
                        <option value="">-- Seleccionar Cargo --</option>
                        {cargos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Condición Laboral</label>
                      <select value={formData.condicion_id} id="condicion_id" onChange={handleChange} className="w-full bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-white focus:border-blue-500 outline-none" required>
                        <option value="">-- Seleccionar Condición --</option>
                        {condiciones.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                      </select>
                    </div>
                    <Input label="Salario Básico Mensual (S/.)" id="salario_basico" type="number" step="0.01" value={formData.salario_basico} onChange={handleChange} required />
                  </div>
                </div>

              </div>

              {/* COLUMNA 2: CONCEPTOS DE NÓMINA */}
              <div className="md:w-1/2 bg-gray-50 dark:bg-gray-950 p-6 overflow-y-auto custom-scrollbar flex flex-col">
                <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 border-b border-gray-200 dark:border-gray-800 pb-2 mb-2 shrink-0">
                  4. Asignación de Reglas Salariales
                </h3>
                <p className="text-xs text-gray-500 mb-4 shrink-0">Marque los bonos, descuentos y aportaciones que aplican a la boleta de este trabajador.</p>

                <div className="space-y-4 flex-1">
                  
                  {ingresos.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-green-200 dark:border-green-900/50 p-3 shadow-sm">
                      <h4 className="text-xs font-bold text-green-600 dark:text-green-400 mb-2 uppercase tracking-wider">Ingresos (+)</h4>
                      <div className="grid gap-2">
                        {ingresos.map(c => (
                          <label key={c.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                            <input type="checkbox" checked={formData.conceptos_ids.includes(c.id)} onChange={() => handleConceptoToggle(c.id)} className="w-4 h-4 rounded text-green-600" />
                            <div>
                              <p className="text-sm text-gray-800 dark:text-gray-200 font-medium leading-none">{c.nombre}</p>
                              <p className="text-[10px] text-gray-500 mt-1">{c.modo_calculo === 'FIJO' ? `S/. ${c.valor}` : `${c.valor}% Base`}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {descuentos.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-red-200 dark:border-red-900/50 p-3 shadow-sm">
                      <h4 className="text-xs font-bold text-red-600 dark:text-red-400 mb-2 uppercase tracking-wider">Descuentos (-)</h4>
                      <div className="grid gap-2">
                        {descuentos.map(c => (
                          <label key={c.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                            <input type="checkbox" checked={formData.conceptos_ids.includes(c.id)} onChange={() => handleConceptoToggle(c.id)} className="w-4 h-4 rounded text-red-600" />
                            <p className="text-sm text-gray-800 dark:text-gray-200 font-medium leading-none">{c.nombre}</p>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {aportaciones.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-blue-900/50 p-3 shadow-sm">
                      <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wider">Aportaciones</h4>
                      <div className="grid gap-2">
                        {aportaciones.map(c => (
                          <label key={c.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                            <input type="checkbox" checked={formData.conceptos_ids.includes(c.id)} onChange={() => handleConceptoToggle(c.id)} className="w-4 h-4 rounded text-blue-600" />
                            <p className="text-sm text-gray-800 dark:text-gray-200 font-medium leading-none">{c.nombre}</p>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3 shrink-0">
                  <Button type="button" onClick={closeModal} variant="secondary" className="bg-white dark:bg-transparent text-gray-700 dark:text-gray-300">
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 font-bold px-8 shadow-lg">
                    {editingId ? 'Actualizar Expediente' : 'Registrar Personal'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}