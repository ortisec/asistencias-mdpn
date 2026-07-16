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
    await updateAsistenciaAdmin(modal.data.id, modal.data);
    setModal({ isOpen: false, data: {} });
    refresh();
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