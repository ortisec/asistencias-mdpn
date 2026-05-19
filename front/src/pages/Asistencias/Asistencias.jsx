import { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Table } from '../../components/ui/Table';
import { getAsistencias, createAsistencia, markSalida, updateAsistenciaAdmin } from '../../services/asistencias';
import { getPersonas } from '../../services/personas';
import { useAuth } from '../../context/AuthContext';

export default function Asistencias() {
  const { user } = useAuth(); // 2. Extraemos el usuario logueado

  // 3. Verificamos si realmente es un superadmin
  const isAdmin = user?.rol === 'superadmin';

  const [asistencias, setAsistencias] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);

  const [dniBusqueda, setDniBusqueda] = useState('');
  const inputRef = useRef(null);

  const [filtros, setFiltros] = useState({
    busqueda: '', estado: '', fechaInicio: '', fechaFin: ''
  });

  // --- ESTADOS PARA EL MODAL DE EDICIÓN ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ id: null, fecha_ingreso: '', fecha_salida: '', nombre: '' });

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [asistenciasData, personasData] = await Promise.all([getAsistencias(), getPersonas()]);
      setAsistencias(asistenciasData.sort((a, b) => b.id - a.id));
      setPersonas(personasData);
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); setMensajeExito(null);

    const personaEncontrada = personas.find(p => p.dni === dniBusqueda);
    if (!personaEncontrada) { setError(`No se encontró ningún empleado con el DNI: ${dniBusqueda}`); inputRef.current?.select(); return; }
    if (!personaEncontrada.is_active) { setError(`El empleado ${personaEncontrada.nombre_completo} está INACTIVO en el sistema.`); inputRef.current?.select(); return; }

    try {
      await createAsistencia({ persona_id: personaEncontrada.id });
      cargarDatos();
      setMensajeExito(`Entrada registrada para: ${personaEncontrada.nombre_completo}`);
      setDniBusqueda(''); inputRef.current?.focus();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrar la asistencia');
    }
  };

  const handleMarcarSalida = async (id) => {
    try {
      await markSalida(id);
      cargarDatos(); setMensajeExito('Salida registrada correctamente.'); setError(null);
    } catch (err) { setError(err.response?.data?.detail || 'Error al marcar la salida'); }
  };

  const formatearFecha = (fechaIso) => {
    if (!fechaIso) return '---';
    return new Date(fechaIso).toLocaleString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true, day: '2-digit', month: 'short', year: 'numeric' });
  };

  const obtenerDatosPersona = (id) => {
    const persona = personas.find(p => p.id === id);
    return persona ? { nombre: persona.nombre_completo, dni: persona.dni, regimen: persona.tipo_trabajador } : { nombre: 'Desconocido', dni: '', regimen: '' };
  };

  const handleFiltroChange = (e) => setFiltros({ ...filtros, [e.target.id]: e.target.value });

  const asistenciasFiltradas = asistencias.filter((asistencia) => {
    const datosPersona = obtenerDatosPersona(asistencia.persona_id);
    const terminoBusqueda = filtros.busqueda.toLowerCase();
    const coincideBusqueda = datosPersona.dni.includes(terminoBusqueda) || datosPersona.nombre.toLowerCase().includes(terminoBusqueda);

    let coincideEstado = true;
    if (filtros.estado === 'PENDIENTE' && asistencia.fecha_salida) coincideEstado = false;
    if (filtros.estado === 'COMPLETADO' && !asistencia.fecha_salida) coincideEstado = false;

    let coincideFecha = true;
    if (filtros.fechaInicio || filtros.fechaFin) {
      const fechaAsistencia = asistencia.fecha_ingreso ? asistencia.fecha_ingreso.split('T')[0] : '';
      if (filtros.fechaInicio && fechaAsistencia < filtros.fechaInicio) coincideFecha = false;
      if (filtros.fechaFin && fechaAsistencia > filtros.fechaFin) coincideFecha = false;
    }
    return coincideBusqueda && coincideEstado && coincideFecha;
  });

  // --- LÓGICA DEL MODAL ADMIN ---
  // Truco para convertir el formato ISO de la BD al formato 'YYYY-MM-DDThh:mm' que requiere el <input type="datetime-local">
  const formatForInput = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    const offset = d.getTimezoneOffset() * 60000;
    return (new Date(d - offset)).toISOString().slice(0, 16);
  };

  const openEditModal = (asistencia, personaNombre) => {
    setEditForm({
      id: asistencia.id,
      nombre: personaNombre,
      fecha_ingreso: formatForInput(asistencia.fecha_ingreso),
      fecha_salida: formatForInput(asistencia.fecha_salida)
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Volvemos a convertir a formato ISO estándar para la BD
      const payload = {};
      if (editForm.fecha_ingreso) payload.fecha_ingreso = new Date(editForm.fecha_ingreso).toISOString();
      if (editForm.fecha_salida) payload.fecha_salida = new Date(editForm.fecha_salida).toISOString();

      await updateAsistenciaAdmin(editForm.id, payload);
      setIsEditModalOpen(false);
      cargarDatos();
      setMensajeExito('Asistencia corregida exitosamente por el Administrador.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al actualizar el registro manual');
    }
  };

  return (
    <div className="space-y-6 relative">

      {/* ================= MODAL ADMIN EDICIÓN ================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <form onSubmit={handleEditSubmit} className="bg-gray-800 rounded-xl shadow-2xl border border-blue-500/50 w-full max-w-md flex flex-col">
            <div className="p-5 border-b border-gray-700 bg-gray-800/80 rounded-t-xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Corregir Marcación
              </h2>
              <p className="text-sm text-gray-400 mt-1">{editForm.nombre}</p>
            </div>

            <div className="p-5 space-y-4 bg-gray-900/50">
              <div className="p-3 bg-blue-900/20 border border-blue-800/50 rounded-lg text-xs text-blue-400 mb-2">
                <strong>Modo Administrador:</strong> Esta acción sobrescribirá el historial real del sistema.
              </div>

              <Input
                label="Fecha y Hora de Ingreso"
                type="datetime-local"
                value={editForm.fecha_ingreso}
                onChange={(e) => setEditForm({ ...editForm, fecha_ingreso: e.target.value })}
                required
              />

              <Input
                label="Fecha y Hora de Salida (Opcional)"
                type="datetime-local"
                value={editForm.fecha_salida}
                onChange={(e) => setEditForm({ ...editForm, fecha_salida: e.target.value })}
              />
            </div>

            <div className="p-5 border-t border-gray-700 bg-gray-800/80 rounded-b-xl flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
              <Button type="submit" variant="primary" className="bg-blue-600 hover:bg-blue-700">Guardar Corrección</Button>
            </div>
          </form>
        </div>
      )}
      {/* ======================================================= */}

      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Control Operativo de Asistencias</h1>

      {error && <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 border border-red-900">{error}</div>}
      {mensajeExito && <div className="p-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400 border border-green-900">{mensajeExito}</div>}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex flex-col sm:flex-row gap-4 items-end border-l-4 border-emerald-500">
        <div className="flex-1 w-full max-w-sm">
          <Input label="Marcar Entrada (Escanee DNI)" id="dni" placeholder="Ej: 76543210" value={dniBusqueda} onChange={(e) => setDniBusqueda(e.target.value)} required autoFocus ref={inputRef} />
        </div>
        <Button type="submit" variant="primary" className="w-full sm:w-auto h-10 bg-emerald-600 hover:bg-emerald-700">Registrar</Button>
      </form>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col lg:flex-row gap-4 items-end border-t border-gray-700">
        <div className="flex-1 w-full"><Input label="Buscar en historial" id="busqueda" placeholder="DNI o Nombre..." value={filtros.busqueda} onChange={handleFiltroChange} /></div>
        <div className="w-full lg:w-48"><Select label="Estado del Turno" id="estado" value={filtros.estado} onChange={handleFiltroChange} options={[{ value: 'PENDIENTE', label: 'Trabajando (Sin Salida)' }, { value: 'COMPLETADO', label: 'Turno Completado' }]}><option value="">Todos</option></Select></div>
        <div className="w-full lg:w-40"><Input label="Desde" id="fechaInicio" type="date" value={filtros.fechaInicio} onChange={handleFiltroChange} /></div>
        <div className="w-full lg:w-40"><Input label="Hasta" id="fechaFin" type="date" value={filtros.fechaFin} onChange={handleFiltroChange} /></div>
        <Button type="button" variant="secondary" onClick={() => setFiltros({ busqueda: '', estado: '', fechaInicio: '', fechaFin: '' })} className="w-full lg:w-auto text-sm">Limpiar</Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto border border-gray-700">
        {loading ? (
          <p className="p-6 text-gray-400">Cargando historial...</p>
        ) : (
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="uppercase tracking-wider border-b border-gray-700 bg-gray-900/50 text-gray-400 text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">Empleado</th>
                <th className="px-6 py-4 font-semibold">Fecha/Hora Ingreso</th>
                <th className="px-6 py-4 font-semibold">Fecha/Hora Salida</th>
                <th className="px-6 py-4 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-200">
              {asistenciasFiltradas.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No se encontraron registros.</td></tr>
              ) : (
                asistenciasFiltradas.map((asistencia) => {
                  const persona = obtenerDatosPersona(asistencia.persona_id);
                  return (
                    <tr key={asistencia.id} className="hover:bg-gray-700/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{persona.nombre}</div>
                        <div className="text-xs text-gray-500">{persona.dni} <span className="mx-1">•</span> {persona.regimen.toString() === '1057' ? 'CAS 1057' : `D.L. ${persona.regimen}`}</div>
                      </td>
                      <td className="px-6 py-4 text-emerald-400 font-medium">{formatearFecha(asistencia.fecha_ingreso)}</td>
                      <td className="px-6 py-4 text-red-400 font-medium">{formatearFecha(asistencia.fecha_salida)}</td>

                      <td className="px-6 py-4 flex gap-2 justify-end">
                        {!asistencia.fecha_salida ? (
                          <Button type="button" variant="danger" className="text-xs py-1.5 px-3" onClick={() => handleMarcarSalida(asistencia.id)}>
                            Marcar Salida
                          </Button>
                        ) : (
                          <span className="text-xs font-semibold text-gray-400 bg-gray-800 px-3 py-1.5 rounded-md border border-gray-700">
                            Completado
                          </span>
                        )}

                        {/* --- BOTÓN DE EDICIÓN EXCLUSIVO PARA ADMIN --- */}
                        {isAdmin && (
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => openEditModal(asistencia, persona.nombre)}
                            className="text-xs py-1.5 px-3 bg-blue-900/20 text-blue-400 hover:bg-blue-900/40 border border-transparent hover:border-blue-800/50 opacity-0 group-hover:opacity-100 transition-all duration-200"
                            title="Corregir marcación manual"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}