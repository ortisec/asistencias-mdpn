import { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Table } from '../../components/ui/Table';
import { getAsistencias, createAsistencia, markSalida } from '../../services/asistencias';
import { getPersonas } from '../../services/personas';

export default function Asistencias() {
  const [asistencias, setAsistencias] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);

  const [dniBusqueda, setDniBusqueda] = useState('');
  const inputRef = useRef(null);

  // --- NUEVO ESTADO PARA FILTROS DE LA TABLA ---
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: '', // '' = Todos, 'PENDIENTE' = Sin salida, 'COMPLETADO' = Con salida
    fechaInicio: '',
    fechaFin: ''
  });

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [asistenciasData, personasData] = await Promise.all([
        getAsistencias(),
        getPersonas()
      ]);
      setAsistencias(asistenciasData.sort((a, b) => b.id - a.id));
      setPersonas(personasData);
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMensajeExito(null);

    const personaEncontrada = personas.find(p => p.dni === dniBusqueda);

    if (!personaEncontrada) {
      setError(`No se encontró ningún empleado con el DNI: ${dniBusqueda}`);
      inputRef.current?.select();
      return;
    }

    if (!personaEncontrada.is_active) {
      setError(`El empleado ${personaEncontrada.nombre_completo} está INACTIVO en el sistema.`);
      inputRef.current?.select();
      return;
    }

    try {
      await createAsistencia({ persona_id: personaEncontrada.id });
      cargarDatos();
      setMensajeExito(`Entrada registrada para: ${personaEncontrada.nombre_completo}`);
      setDniBusqueda('');
      inputRef.current?.focus();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrar la asistencia');
    }
  };

  const handleMarcarSalida = async (id) => {
    try {
      await markSalida(id);
      cargarDatos();
      setMensajeExito('Salida registrada correctamente.');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al marcar la salida');
    }
  };

  const formatearFecha = (fechaIso) => {
    if (!fechaIso) return '---';
    return new Date(fechaIso).toLocaleString('es-PE', {
      hour: '2-digit', minute: '2-digit', hour12: true,
      day: '2-digit', month: 'short'
    });
  };

  const obtenerDatosPersona = (id) => {
    const persona = personas.find(p => p.id === id);
    return persona
      ? { nombre: persona.nombre_completo, dni: persona.dni, regimen: persona.tipo_trabajador }
      : { nombre: 'Desconocido', dni: '', regimen: '' };
  };

  // --- NUEVA LÓGICA DE FILTRADO ---
  const handleFiltroChange = (e) => {
    setFiltros({ ...filtros, [e.target.id]: e.target.value });
  };

  const asistenciasFiltradas = asistencias.filter((asistencia) => {
    const datosPersona = obtenerDatosPersona(asistencia.persona_id);
    const terminoBusqueda = filtros.busqueda.toLowerCase();

    // Filtro por texto
    const coincideBusqueda =
      datosPersona.dni.includes(terminoBusqueda) ||
      datosPersona.nombre.toLowerCase().includes(terminoBusqueda);

    // Filtro por estado (Salida marcada o no)
    let coincideEstado = true;
    if (filtros.estado === 'PENDIENTE' && asistencia.fecha_salida) coincideEstado = false;
    if (filtros.estado === 'COMPLETADO' && !asistencia.fecha_salida) coincideEstado = false;

    // Filtro por fechas
    let coincideFecha = true;
    if (filtros.fechaInicio || filtros.fechaFin) {
      const fechaAsistencia = asistencia.fecha_ingreso ? asistencia.fecha_ingreso.split('T')[0] : '';
      if (filtros.fechaInicio && fechaAsistencia < filtros.fechaInicio) coincideFecha = false;
      if (filtros.fechaFin && fechaAsistencia > filtros.fechaFin) coincideFecha = false;
    }

    return coincideBusqueda && coincideEstado && coincideFecha;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Control Operativo de Asistencias</h1>

      {error && (
        <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400">
          {error}
        </div>
      )}
      {mensajeExito && (
        <div className="p-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400">
          {mensajeExito}
        </div>
      )}

      {/* --- FORMULARIO RÁPIDO (Se mantiene arriba por prioridad) --- */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex flex-col sm:flex-row gap-4 items-end transition-colors duration-300 border-l-4 border-emerald-500">
        <div className="flex-1 w-full max-w-sm">
          <Input
            label="Marcar Entrada (Escanee DNI)"
            id="dni"
            placeholder="Ej: 76543210"
            value={dniBusqueda}
            onChange={(e) => setDniBusqueda(e.target.value)}
            required
            autoFocus
            ref={inputRef}
          />
        </div>
        <Button type="submit" variant="primary" className="w-full sm:w-auto h-10 bg-emerald-600 hover:bg-emerald-700">
          Registrar
        </Button>
      </form>

      {/* --- SECCIÓN DE FILTROS --- */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-300 flex flex-col lg:flex-row gap-4 items-end border-t border-gray-100 dark:border-gray-700">
        <div className="flex-1 w-full">
          <Input
            label="Buscar en historial"
            id="busqueda"
            placeholder="DNI o Nombre..."
            value={filtros.busqueda}
            onChange={handleFiltroChange}
          />
        </div>

        <div className="w-full lg:w-48">
          <Select
            label="Estado del Turno"
            id="estado"
            value={filtros.estado}
            onChange={handleFiltroChange}
            options={[
              { value: 'PENDIENTE', label: 'Trabajando (Sin Salida)' },
              { value: 'COMPLETADO', label: 'Turno Completado' }
            ]}
          >
            <option value="">Todos</option>
          </Select>
        </div>

        <div className="w-full lg:w-40">
          <Input label="Desde" id="fechaInicio" type="date" value={filtros.fechaInicio} onChange={handleFiltroChange} />
        </div>

        <div className="w-full lg:w-40">
          <Input label="Hasta" id="fechaFin" type="date" value={filtros.fechaFin} onChange={handleFiltroChange} />
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={() => setFiltros({ busqueda: '', estado: '', fechaInicio: '', fechaFin: '' })}
          className="w-full lg:w-auto text-sm"
        >
          Limpiar
        </Button>
      </div>

      {/* --- TABLA DE HISTORIAL (Usando asistenciasFiltradas) --- */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto transition-colors duration-300">
        {loading ? (
          <p className="p-6 text-gray-600 dark:text-gray-400">Cargando historial...</p>
        ) : (
          <Table headers={['Empleado', 'Fecha/Hora Ingreso', 'Fecha/Hora Salida', 'Acción']}>
            {asistenciasFiltradas.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No se encontraron registros con esos filtros.
                </td>
              </tr>
            ) : (
              asistenciasFiltradas.map((asistencia) => {
                const persona = obtenerDatosPersona(asistencia.persona_id);
                return (
                  <tr key={asistencia.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium">{persona.nombre}</div>
                      <div className="text-xs text-gray-500">
                        {persona.dni}
                        {persona.regimen && (
                          <>
                            <span className="mx-1">•</span>
                            {persona.regimen.toString() === '1057' ? 'D.L. 1057' : `D.L. ${persona.regimen}`}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-green-600 dark:text-green-400 font-medium">
                      {formatearFecha(asistencia.fecha_ingreso)}
                    </td>
                    <td className="px-6 py-4 text-red-600 dark:text-red-400 font-medium">
                      {formatearFecha(asistencia.fecha_salida)}
                    </td>

                    <td className="px-6 py-4">
                      {!asistencia.fecha_salida ? (
                        <Button
                          type="button"
                          variant="danger"
                          className="text-xs py-1 px-3"
                          onClick={() => handleMarcarSalida(asistencia.id)}
                        >
                          Marcar Salida
                        </Button>
                      ) : (
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                          Completado
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </Table>
        )}
      </div>
    </div>
  );
}