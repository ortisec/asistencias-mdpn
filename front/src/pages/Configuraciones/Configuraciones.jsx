import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { getHorarios, updateHorarios, getFeriados, createFeriado, deleteFeriado } from '../../services/configuraciones';

export default function Configuraciones() {
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Estado para guardar todos los horarios que vienen de la BD
  const [horariosBD, setHorariosBD] = useState([]);
  
  // Régimen activo en las pestañas (1057 por defecto)
  const [activeRegimen, setActiveRegimen] = useState(1057);

  // Estado del formulario actual
  const [horarioForm, setHorarioForm] = useState({
    es_horario_partido: true,
    hora_ingreso_manana: '', minutos_tolerancia_manana: 15, hora_salida_manana: '',
    hora_ingreso_tarde: '', minutos_tolerancia_tarde: 15, hora_salida_tarde: ''
  });

  const [feriados, setFeriados] = useState([]);
  const [nuevoFeriado, setNuevoFeriado] = useState({ fecha: '', motivo: '' });

  const formatTimeForInput = (timeString) => timeString ? timeString.substring(0, 5) : '';

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [horariosData, feriadosData] = await Promise.all([ getHorarios(), getFeriados() ]);
      
      setHorariosBD(horariosData);
      setFeriados(feriadosData);

      // Cargamos el formulario con los datos del régimen 1057 inicialmente
      const configInicial = horariosData.find(h => h.regimen === 1057);
      if (configInicial) cargarFormularioCon(configInicial);

    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error al cargar las configuraciones.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  // Función para llenar el formulario cuando cambiamos de pestaña
  const cargarFormularioCon = (config) => {
    setHorarioForm({
      es_horario_partido: config.es_horario_partido,
      hora_ingreso_manana: formatTimeForInput(config.hora_ingreso_manana),
      minutos_tolerancia_manana: config.minutos_tolerancia_manana,
      hora_salida_manana: formatTimeForInput(config.hora_salida_manana),
      hora_ingreso_tarde: formatTimeForInput(config.hora_ingreso_tarde),
      minutos_tolerancia_tarde: config.minutos_tolerancia_tarde || 15,
      hora_salida_tarde: formatTimeForInput(config.hora_salida_tarde)
    });
  };

  const handleTabChange = (regimen) => {
    setActiveRegimen(regimen);
    const config = horariosBD.find(h => h.regimen === regimen);
    if (config) cargarFormularioCon(config);
    setMensaje({ tipo: '', texto: '' }); // Limpiamos mensajes al cambiar
  };

  const handleHorarioChange = (e) => {
    setHorarioForm({ ...horarioForm, [e.target.id]: e.target.value });
  };

  const toggleJornada = () => {
    setHorarioForm({ ...horarioForm, es_horario_partido: !horarioForm.es_horario_partido });
  };

  const handleGuardarHorarios = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        es_horario_partido: horarioForm.es_horario_partido,
        hora_ingreso_manana: horarioForm.hora_ingreso_manana,
        minutos_tolerancia_manana: Number(horarioForm.minutos_tolerancia_manana),
        hora_salida_manana: horarioForm.hora_salida_manana,
      };

      // Si es partido, enviamos los datos de la tarde. Si es corrido, los enviamos nulos.
      if (horarioForm.es_horario_partido) {
        payload.hora_ingreso_tarde = horarioForm.hora_ingreso_tarde;
        payload.minutos_tolerancia_tarde = Number(horarioForm.minutos_tolerancia_tarde);
        payload.hora_salida_tarde = horarioForm.hora_salida_tarde;
      } else {
        payload.hora_ingreso_tarde = null;
        payload.minutos_tolerancia_tarde = null;
        payload.hora_salida_tarde = null;
      }
      
      // Formatear horas con ":00" para FastAPI
      Object.keys(payload).forEach(key => {
        if (key.includes('hora_') && payload[key] && payload[key].length === 5) {
          payload[key] = `${payload[key]}:00`;
        }
      });

      await updateHorarios(activeRegimen, payload);
      
      // Actualizamos la lista local en memoria
      const horariosActualizados = await getHorarios();
      setHorariosBD(horariosActualizados);

      setMensaje({ tipo: 'exito', texto: `Horarios del régimen ${activeRegimen} actualizados.` });
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error al actualizar horarios.' });
    }
  };

  // --- MANEJADORES DE FERIADOS (Sin cambios) ---
  const handleGuardarFeriado = async (e) => {
    e.preventDefault();
    try {
      await createFeriado(nuevoFeriado);
      setNuevoFeriado({ fecha: '', motivo: '' });
      cargarDatos();
      setMensaje({ tipo: 'exito', texto: 'Feriado agregado.' });
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.response?.data?.detail || 'Error al agregar feriado.' });
    }
  };

  const handleBorrarFeriado = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este feriado?')) return;
    try {
      await deleteFeriado(id);
      cargarDatos();
      setMensaje({ tipo: 'exito', texto: 'Feriado eliminado.' });
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error al eliminar feriado.' });
    }
  };

  if (loading) return <div className="p-8 text-gray-400">Cargando panel de control...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Configuración del Sistema</h1>

      {mensaje.texto && (
        <div className={`p-4 text-sm rounded-lg border ${mensaje.tipo === 'exito' ? 'bg-emerald-900/40 text-emerald-400 border-emerald-800' : 'bg-red-900/40 text-red-400 border-red-800'}`}>
          {mensaje.texto}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* --- TARJETA: REGLAS DE HORARIOS POR RÉGIMEN --- */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden flex flex-col">
          
          <div className="p-5 border-b border-gray-700 bg-gray-900/50">
            <h2 className="text-lg font-bold text-white">Reglas de Asistencia</h2>
            <p className="text-xs text-gray-400 mt-1">Configure los parámetros independientes por régimen.</p>
          </div>

          {/* Pestañas de Régimen */}
          <div className="flex bg-gray-900/30 border-b border-gray-700">
            {[ {id: 1057, nombre: 'CAS 1057'}, {id: 728, nombre: 'D.L. 728'}, {id: 276, nombre: 'D.L. 276'} ].map(reg => (
              <button
                key={reg.id}
                onClick={() => handleTabChange(reg.id)}
                className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
                  activeRegimen === reg.id ? 'border-blue-500 text-blue-400 bg-gray-800' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                }`}
              >
                {reg.nombre}
              </button>
            ))}
          </div>
          
          <form onSubmit={handleGuardarHorarios} className="p-6 space-y-6 flex-1">
            
            {/* Switch / Interruptor de Jornada */}
            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <div>
                <p className="text-sm font-semibold text-white">Tipo de Jornada</p>
                <p className="text-xs text-gray-400">{horarioForm.es_horario_partido ? 'El empleado marca 4 veces (Almuerzo incluido)' : 'El empleado marca 2 veces (Turno continuo)'}</p>
              </div>
              <button
                type="button"
                onClick={toggleJornada}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${horarioForm.es_horario_partido ? 'bg-blue-600' : 'bg-gray-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${horarioForm.es_horario_partido ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Bloque Turno Mañana (O Único) */}
            <div>
              <h3 className={`text-sm font-semibold mb-4 uppercase tracking-wider ${horarioForm.es_horario_partido ? 'text-sky-400' : 'text-emerald-400'}`}>
                {horarioForm.es_horario_partido ? 'Turno Mañana' : 'Turno Único (De Corrido)'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="Hora de Ingreso" type="time" id="hora_ingreso_manana" value={horarioForm.hora_ingreso_manana} onChange={handleHorarioChange} required />
                <Input label="Tolerancia (min)" type="number" id="minutos_tolerancia_manana" value={horarioForm.minutos_tolerancia_manana} onChange={handleHorarioChange} required />
                <Input label="Hora de Salida" type="time" id="hora_salida_manana" value={horarioForm.hora_salida_manana} onChange={handleHorarioChange} required />
              </div>
            </div>

            {/* Bloque Turno Tarde (Oculto si es de corrido) */}
            {horarioForm.es_horario_partido && (
              <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                <div className="border-t border-gray-700 mb-6"></div>
                <h3 className="text-sm font-semibold text-indigo-400 mb-4 uppercase tracking-wider">Turno Tarde</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input label="Hora de Ingreso" type="time" id="hora_ingreso_tarde" value={horarioForm.hora_ingreso_tarde} onChange={handleHorarioChange} required />
                  <Input label="Tolerancia (min)" type="number" id="minutos_tolerancia_tarde" value={horarioForm.minutos_tolerancia_tarde} onChange={handleHorarioChange} required />
                  <Input label="Hora de Salida" type="time" id="hora_salida_tarde" value={horarioForm.hora_salida_tarde} onChange={handleHorarioChange} required />
                </div>
              </div>
            )}

            <Button type="submit" variant="primary" className="w-full bg-blue-600 hover:bg-blue-700">
              Guardar Cambios para {activeRegimen === 1057 ? 'CAS 1057' : `D.L. ${activeRegimen}`}
            </Button>
          </form>
        </div>

        {/* --- TARJETA: GESTIÓN DE FERIADOS --- */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden flex flex-col h-[600px] xl:h-auto">
          {/* ... (Todo el código del panel de feriados se mantiene exactamente igual) ... */}
          <div className="p-5 border-b border-gray-700 bg-gray-900/50">
            <h2 className="text-lg font-bold text-white">Gestión de Feriados</h2>
            <p className="text-xs text-gray-400 mt-1">Días exceptuados de marcación para el personal.</p>
          </div>

          <div className="p-6 border-b border-gray-700 bg-gray-800">
            <form onSubmit={handleGuardarFeriado} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="w-full sm:w-40"><Input label="Fecha" type="date" value={nuevoFeriado.fecha} onChange={(e) => setNuevoFeriado({...nuevoFeriado, fecha: e.target.value})} required /></div>
              <div className="flex-1 w-full"><Input label="Motivo del Feriado" placeholder="Ej: Día del Trabajador" value={nuevoFeriado.motivo} onChange={(e) => setNuevoFeriado({...nuevoFeriado, motivo: e.target.value})} required /></div>
              <Button type="submit" variant="primary" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700">Agregar</Button>
            </form>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-900/30 p-0">
            {feriados.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No hay feriados registrados.</div>
            ) : (
              <table className="min-w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-900/80 text-gray-400 text-xs uppercase sticky top-0">
                  <tr><th className="px-6 py-3 font-semibold">Fecha</th><th className="px-6 py-3 font-semibold">Motivo</th><th className="px-6 py-3 font-semibold text-right">Acción</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-700 text-gray-300">
                  {feriados.map((feriado) => (
                    <tr key={feriado.id} className="hover:bg-gray-700/30">
                      <td className="px-6 py-3 font-medium text-white">{new Date(`${feriado.fecha}T00:00:00`).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                      <td className="px-6 py-3">{feriado.motivo}</td>
                      <td className="px-6 py-3 text-right">
                        <button onClick={() => handleBorrarFeriado(feriado.id)} className="text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/40 px-3 py-1 rounded transition-colors text-xs font-semibold">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}