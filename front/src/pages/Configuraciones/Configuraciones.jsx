import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { getHorarios, updateHorarios, getFeriados, createFeriado, deleteFeriado } from '../../services/configuraciones';

export default function Configuraciones() {
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Estado para Horarios
  const [horarios, setHorarios] = useState({
    hora_ingreso_manana: '',
    minutos_tolerancia_manana: 15,
    hora_salida_manana: '',
    hora_ingreso_tarde: '',
    minutos_tolerancia_tarde: 15,
    hora_salida_tarde: ''
  });

  // Estado para Feriados
  const [feriados, setFeriados] = useState([]);
  const [nuevoFeriado, setNuevoFeriado] = useState({ fecha: '', motivo: '' });

  // Utilidad para limpiar los segundos del formato de hora (API devuelve 08:00:00, el input necesita 08:00)
  const formatTimeForInput = (timeString) => timeString ? timeString.substring(0, 5) : '';

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [horariosData, feriadosData] = await Promise.all([
        getHorarios(),
        getFeriados()
      ]);
      
      setHorarios({
        hora_ingreso_manana: formatTimeForInput(horariosData.hora_ingreso_manana),
        minutos_tolerancia_manana: horariosData.minutos_tolerancia_manana,
        hora_salida_manana: formatTimeForInput(horariosData.hora_salida_manana),
        hora_ingreso_tarde: formatTimeForInput(horariosData.hora_ingreso_tarde),
        minutos_tolerancia_tarde: horariosData.minutos_tolerancia_tarde,
        hora_salida_tarde: formatTimeForInput(horariosData.hora_salida_tarde)
      });
      
      setFeriados(feriadosData);
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error al cargar las configuraciones.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // --- MANEJADORES DE HORARIOS ---
  const handleHorarioChange = (e) => {
    setHorarios({ ...horarios, [e.target.id]: e.target.value });
  };

  const handleGuardarHorarios = async (e) => {
    e.preventDefault();
    try {
      // Convertimos tolerancias a números para la API
      const payload = {
        ...horarios,
        minutos_tolerancia_manana: Number(horarios.minutos_tolerancia_manana),
        minutos_tolerancia_tarde: Number(horarios.minutos_tolerancia_tarde)
      };
      
      // Para enviar las horas a FastAPI, les agregamos ":00" (segundos)
      Object.keys(payload).forEach(key => {
        if (key.includes('hora_') && payload[key].length === 5) {
          payload[key] = `${payload[key]}:00`;
        }
      });

      await updateHorarios(payload);
      setMensaje({ tipo: 'exito', texto: 'Horarios actualizados correctamente.' });
      window.scrollTo(0, 0);
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error al actualizar horarios.' });
    }
  };

  // --- MANEJADORES DE FERIADOS ---
  const handleGuardarFeriado = async (e) => {
    e.preventDefault();
    try {
      await createFeriado(nuevoFeriado);
      setNuevoFeriado({ fecha: '', motivo: '' });
      cargarDatos();
      setMensaje({ tipo: 'exito', texto: 'Feriado agregado correctamente.' });
    } catch (error) {
      const msjError = error.response?.data?.detail || 'Error al agregar feriado.';
      setMensaje({ tipo: 'error', texto: msjError });
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
        <div className={`p-4 text-sm rounded-lg border ${
          mensaje.tipo === 'exito' ? 'bg-emerald-900/40 text-emerald-400 border-emerald-800' : 'bg-red-900/40 text-red-400 border-red-800'
        }`}>
          {mensaje.texto}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* --- TARJETA: REGLAS DE HORARIOS --- */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden">
          <div className="p-5 border-b border-gray-700 bg-gray-800/50">
            <h2 className="text-lg font-bold text-white">Reglas de Asistencia</h2>
            <p className="text-xs text-gray-400 mt-1">Configure los parámetros para calcular las tardanzas.</p>
          </div>
          
          <form onSubmit={handleGuardarHorarios} className="p-6 space-y-6">
            {/* Turno Mañana */}
            <div>
              <h3 className="text-sm font-semibold text-sky-400 mb-4 uppercase tracking-wider">Turno Mañana</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="Hora de Ingreso" type="time" id="hora_ingreso_manana" value={horarios.hora_ingreso_manana} onChange={handleHorarioChange} required />
                <Input label="Tolerancia (min)" type="number" id="minutos_tolerancia_manana" value={horarios.minutos_tolerancia_manana} onChange={handleHorarioChange} required />
                <Input label="Hora de Salida" type="time" id="hora_salida_manana" value={horarios.hora_salida_manana} onChange={handleHorarioChange} required />
              </div>
            </div>

            <div className="border-t border-gray-700"></div>

            {/* Turno Tarde */}
            <div>
              <h3 className="text-sm font-semibold text-indigo-400 mb-4 uppercase tracking-wider">Turno Tarde</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="Hora de Ingreso" type="time" id="hora_ingreso_tarde" value={horarios.hora_ingreso_tarde} onChange={handleHorarioChange} required />
                <Input label="Tolerancia (min)" type="number" id="minutos_tolerancia_tarde" value={horarios.minutos_tolerancia_tarde} onChange={handleHorarioChange} required />
                <Input label="Hora de Salida" type="time" id="hora_salida_tarde" value={horarios.hora_salida_tarde} onChange={handleHorarioChange} required />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full bg-blue-600 hover:bg-blue-700">
              Guardar Cambios de Horario
            </Button>
          </form>
        </div>

        {/* --- TARJETA: GESTIÓN DE FERIADOS --- */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-700 bg-gray-800/50">
            <h2 className="text-lg font-bold text-white">Gestión de Feriados</h2>
            <p className="text-xs text-gray-400 mt-1">Días exceptuados de marcación para el personal.</p>
          </div>

          <div className="p-6 border-b border-gray-700">
            <form onSubmit={handleGuardarFeriado} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="w-full sm:w-40">
                <Input label="Fecha" type="date" value={nuevoFeriado.fecha} onChange={(e) => setNuevoFeriado({...nuevoFeriado, fecha: e.target.value})} required />
              </div>
              <div className="flex-1 w-full">
                <Input label="Motivo del Feriado" placeholder="Ej: Día del Trabajador" value={nuevoFeriado.motivo} onChange={(e) => setNuevoFeriado({...nuevoFeriado, motivo: e.target.value})} required />
              </div>
              <Button type="submit" variant="primary" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700">
                Agregar
              </Button>
            </form>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-800/30 p-0">
            {feriados.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No hay feriados registrados.</div>
            ) : (
              <table className="min-w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-900/50 text-gray-400 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Fecha</th>
                    <th className="px-6 py-3 font-semibold">Motivo</th>
                    <th className="px-6 py-3 font-semibold text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700 text-gray-300">
                  {feriados.map((feriado) => (
                    <tr key={feriado.id} className="hover:bg-gray-700/30">
                      <td className="px-6 py-3 font-medium text-white">
                        {new Date(`${feriado.fecha}T00:00:00`).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-6 py-3">{feriado.motivo}</td>
                      <td className="px-6 py-3 text-right">
                        <button 
                          onClick={() => handleBorrarFeriado(feriado.id)}
                          className="text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/40 px-3 py-1 rounded transition-colors text-xs font-semibold"
                        >
                          Eliminar
                        </button>
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