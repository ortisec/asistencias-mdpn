import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

// Importamos servicios de Asistencia
import { getHorarios, updateHorarios, getFeriados, createFeriado, deleteFeriado } from '../../services/configuraciones';
// Importamos servicios de Nómina (Asegúrate de crear este archivo como lo mencionamos antes)
import { getCargos, createCargo, getCondiciones, createCondicion, getConceptos, createConcepto } from '../../services/configNomina';

export default function Configuraciones() {
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  
  // --- CONTROL DE VISTA PRINCIPAL ---
  const [vistaActiva, setVistaActiva] = useState('asistencia'); // 'asistencia' o 'nomina'

  // =========================================================================
  // ESTADOS Y LÓGICA: CONTROL DE ASISTENCIA (Tu código original)
  // =========================================================================
  const [horariosBD, setHorariosBD] = useState([]);
  const [activeRegimen, setActiveRegimen] = useState(1057);
  const [horarioForm, setHorarioForm] = useState({
    es_horario_partido: true,
    hora_ingreso_manana: '', minutos_tolerancia_manana: 15, hora_salida_manana: '',
    hora_ingreso_tarde: '', minutos_tolerancia_tarde: 15, hora_salida_tarde: ''
  });
  const [feriados, setFeriados] = useState([]);
  const [nuevoFeriado, setNuevoFeriado] = useState({ fecha: '', motivo: '' });

  const formatTimeForInput = (timeString) => timeString ? timeString.substring(0, 5) : '';

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

  const handleRegimenChange = (regimen) => {
    setActiveRegimen(regimen);
    const config = horariosBD.find(h => h.regimen === regimen);
    if (config) cargarFormularioCon(config);
    setMensaje({ tipo: '', texto: '' });
  };

  const handleHorarioChange = (e) => setHorarioForm({ ...horarioForm, [e.target.id]: e.target.value });
  const toggleJornada = () => setHorarioForm({ ...horarioForm, es_horario_partido: !horarioForm.es_horario_partido });

  const handleGuardarHorarios = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        es_horario_partido: horarioForm.es_horario_partido,
        hora_ingreso_manana: horarioForm.hora_ingreso_manana,
        minutos_tolerancia_manana: Number(horarioForm.minutos_tolerancia_manana),
        hora_salida_manana: horarioForm.hora_salida_manana,
      };

      if (horarioForm.es_horario_partido) {
        payload.hora_ingreso_tarde = horarioForm.hora_ingreso_tarde;
        payload.minutos_tolerancia_tarde = Number(horarioForm.minutos_tolerancia_tarde);
        payload.hora_salida_tarde = horarioForm.hora_salida_tarde;
      } else {
        payload.hora_ingreso_tarde = null; payload.minutos_tolerancia_tarde = null; payload.hora_salida_tarde = null;
      }
      
      Object.keys(payload).forEach(key => {
        if (key.includes('hora_') && payload[key] && payload[key].length === 5) payload[key] = `${payload[key]}:00`;
      });

      await updateHorarios(activeRegimen, payload);
      const horariosActualizados = await getHorarios();
      setHorariosBD(horariosActualizados);
      setMensaje({ tipo: 'exito', texto: `Horarios del régimen ${activeRegimen} actualizados.` });
    } catch (error) { setMensaje({ tipo: 'error', texto: 'Error al actualizar horarios.' }); }
  };

  const handleGuardarFeriado = async (e) => {
    e.preventDefault();
    try {
      await createFeriado(nuevoFeriado);
      setNuevoFeriado({ fecha: '', motivo: '' });
      cargarDatosConfiguracion();
      setMensaje({ tipo: 'exito', texto: 'Feriado agregado.' });
    } catch (error) { setMensaje({ tipo: 'error', texto: error.response?.data?.detail || 'Error al agregar feriado.' }); }
  };

  const handleBorrarFeriado = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este feriado?')) return;
    try {
      await deleteFeriado(id);
      cargarDatosConfiguracion();
      setMensaje({ tipo: 'exito', texto: 'Feriado eliminado.' });
    } catch (error) { setMensaje({ tipo: 'error', texto: 'Error al eliminar feriado.' }); }
  };

  // =========================================================================
  // ESTADOS Y LÓGICA: NÓMINA Y PLANILLAS (Lo nuevo)
  // =========================================================================
  const [cargos, setCargos] = useState([]);
  const [condiciones, setCondiciones] = useState([]);
  const [conceptos, setConceptos] = useState([]);

  const [nuevoCargo, setNuevoCargo] = useState('');
  const [nuevaCondicion, setNuevaCondicion] = useState('');
  const [nuevoConcepto, setNuevoConcepto] = useState({ nombre: '', tipo: 'INGRESO', modo_calculo: 'FIJO', valor: '' });

  const handleAddCargo = async (e) => {
    e.preventDefault();
    if (!nuevoCargo.trim()) return;
    try {
      await createCargo({ nombre: nuevoCargo });
      setNuevoCargo(''); cargarDatosConfiguracion(); setMensaje({ tipo: 'exito', texto: 'Cargo agregado.' });
    } catch (error) { setMensaje({ tipo: 'error', texto: "Error al crear Cargo" }); }
  };

  const handleAddCondicion = async (e) => {
    e.preventDefault();
    if (!nuevaCondicion.trim()) return;
    try {
      await createCondicion({ nombre: nuevaCondicion });
      setNuevaCondicion(''); cargarDatosConfiguracion(); setMensaje({ tipo: 'exito', texto: 'Condición agregada.' });
    } catch (error) { setMensaje({ tipo: 'error', texto: "Error al crear Condición" }); }
  };

  const handleAddConcepto = async (e) => {
    e.preventDefault();
    if (!nuevoConcepto.nombre.trim() || !nuevoConcepto.valor) return;
    try {
      await createConcepto({ ...nuevoConcepto, valor: parseFloat(nuevoConcepto.valor) });
      setNuevoConcepto({ nombre: '', tipo: 'INGRESO', modo_calculo: 'FIJO', valor: '' });
      cargarDatosConfiguracion(); setMensaje({ tipo: 'exito', texto: 'Regla de nómina agregada.' });
    } catch (error) { setMensaje({ tipo: 'error', texto: "Error al crear Regla de Nómina" }); }
  };

  // =========================================================================
  // CARGA MAESTRA DE DATOS
  // =========================================================================
  const cargarDatosConfiguracion = async () => {
    try {
      setLoading(true);
      // Hacemos todas las peticiones en paralelo para que sea ultra rápido
      const [horariosData, feriadosData, resCargos, resCondiciones, resConceptos] = await Promise.all([ 
        getHorarios(), getFeriados(), getCargos(), getCondiciones(), getConceptos() 
      ]);
      
      setHorariosBD(horariosData);
      setFeriados(feriadosData);
      setCargos(resCargos);
      setCondiciones(resCondiciones);
      setConceptos(resConceptos);

      const configInicial = horariosData.find(h => h.regimen === 1057);
      if (configInicial) cargarFormularioCon(configInicial);

    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error al cargar las configuraciones del sistema.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatosConfiguracion(); }, []);

  if (loading) return <div className="p-8 text-gray-400">Cargando panel de control...</div>;

  return (
    <div className="space-y-6">
      
      {/* --- CABECERA Y NAVEGACIÓN DE PESTAÑAS --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Configuración del Sistema</h1>
          <p className="text-sm text-gray-400 mt-1">Administración de parámetros operativos y planillas.</p>
        </div>
        <div className="flex bg-gray-800 p-1 rounded-lg border border-gray-700">
          <button 
            onClick={() => { setVistaActiva('asistencia'); setMensaje({ tipo: '', texto: '' }); }}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${vistaActiva === 'asistencia' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Control de Asistencia
          </button>
          <button 
            onClick={() => { setVistaActiva('nomina'); setMensaje({ tipo: '', texto: '' }); }}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${vistaActiva === 'nomina' ? 'bg-emerald-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Nómina y Catálogos
          </button>
        </div>
      </div>

      {mensaje.texto && (
        <div className={`p-4 text-sm rounded-lg border animate-in fade-in ${mensaje.tipo === 'exito' ? 'bg-emerald-900/40 text-emerald-400 border-emerald-800' : 'bg-red-900/40 text-red-400 border-red-800'}`}>
          {mensaje.texto}
        </div>
      )}

      {/* =========================================================
          VISTA 1: CONTROL DE ASISTENCIA
          ========================================================= */}
      {vistaActiva === 'asistencia' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
          
          {/* TARJETA: REGLAS DE HORARIOS POR RÉGIMEN */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-700 bg-gray-900/50">
              <h2 className="text-lg font-bold text-white">Reglas de Asistencia</h2>
            </div>
            <div className="flex bg-gray-900/30 border-b border-gray-700">
              {[ {id: 1057, nombre: 'CAS 1057'}, {id: 728, nombre: 'D.L. 728'}, {id: 276, nombre: 'D.L. 276'} ].map(reg => (
                <button
                  key={reg.id} onClick={() => handleRegimenChange(reg.id)}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${activeRegimen === reg.id ? 'border-blue-500 text-blue-400 bg-gray-800' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}`}
                >
                  {reg.nombre}
                </button>
              ))}
            </div>
            
            <form onSubmit={handleGuardarHorarios} className="p-6 space-y-6 flex-1">
              <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <div>
                  <p className="text-sm font-semibold text-white">Tipo de Jornada</p>
                  <p className="text-xs text-gray-400">{horarioForm.es_horario_partido ? 'El empleado marca 4 veces (Almuerzo incluido)' : 'El empleado marca 2 veces (Turno continuo)'}</p>
                </div>
                <button type="button" onClick={toggleJornada} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${horarioForm.es_horario_partido ? 'bg-blue-600' : 'bg-gray-600'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${horarioForm.es_horario_partido ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

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

          {/* TARJETA: GESTIÓN DE FERIADOS */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden flex flex-col h-[600px] xl:h-auto">
            <div className="p-5 border-b border-gray-700 bg-gray-900/50">
              <h2 className="text-lg font-bold text-white">Gestión de Feriados</h2>
            </div>
            <div className="p-6 border-b border-gray-700 bg-gray-800">
              <form onSubmit={handleGuardarFeriado} className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="w-full sm:w-40"><Input label="Fecha" type="date" value={nuevoFeriado.fecha} onChange={(e) => setNuevoFeriado({...nuevoFeriado, fecha: e.target.value})} required /></div>
                <div className="flex-1 w-full"><Input label="Motivo del Feriado" placeholder="Ej: Día del Trabajador" value={nuevoFeriado.motivo} onChange={(e) => setNuevoFeriado({...nuevoFeriado, motivo: e.target.value})} required /></div>
                <Button type="submit" variant="primary" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700">Agregar</Button>
              </form>
            </div>
            <div className="flex-1 overflow-y-auto bg-gray-900/30 p-0 custom-scrollbar">
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
      )}

      {/* =========================================================
          VISTA 2: NÓMINA Y CATÁLOGOS
          ========================================================= */}
      {vistaActiva === 'nomina' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
          
          {/* PANEL 1: CARGOS Y PUESTOS */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 shadow-lg flex flex-col">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Cargos de Trabajo
            </h2>
            <form onSubmit={handleAddCargo} className="flex gap-2 mb-4">
              <input 
                type="text" placeholder="Ej: Limpieza Pública" 
                value={nuevoCargo} onChange={(e) => setNuevoCargo(e.target.value)}
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                Agregar
              </button>
            </form>
            <div className="flex-1 overflow-y-auto max-h-48 border border-gray-700 rounded-lg bg-gray-900/50 custom-scrollbar">
              <ul className="divide-y divide-gray-700/50 text-sm text-gray-300">
                {cargos.map(c => <li key={c.id} className="p-3 hover:bg-gray-800 transition-colors">{c.nombre}</li>)}
                {cargos.length === 0 && <li className="p-3 text-gray-500 italic">No hay cargos registrados.</li>}
              </ul>
            </div>
          </div>

          {/* PANEL 2: CONDICIONES LABORALES */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 shadow-lg flex flex-col">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span> Condiciones Laborales
            </h2>
            <form onSubmit={handleAddCondicion} className="flex gap-2 mb-4">
              <input 
                type="text" placeholder="Ej: D. LEG 728 - OBRERO PERMANENTE" 
                value={nuevaCondicion} onChange={(e) => setNuevaCondicion(e.target.value)}
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
              <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                Agregar
              </button>
            </form>
            <div className="flex-1 overflow-y-auto max-h-48 border border-gray-700 rounded-lg bg-gray-900/50 custom-scrollbar">
              <ul className="divide-y divide-gray-700/50 text-sm text-gray-300">
                {condiciones.map(c => <li key={c.id} className="p-3 hover:bg-gray-800 transition-colors">{c.nombre}</li>)}
                {condiciones.length === 0 && <li className="p-3 text-gray-500 italic">No hay condiciones registradas.</li>}
              </ul>
            </div>
          </div>

          {/* PANEL 3: CONCEPTOS DE NÓMINA */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 shadow-lg lg:col-span-2">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Conceptos de Nómina (Ingresos, Descuentos, Aportes)
            </h2>
            <form onSubmit={handleAddConcepto} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Nombre del Concepto</label>
                <input 
                  type="text" placeholder="Ej: Riesgo de Salud" required
                  value={nuevoConcepto.nombre} onChange={(e) => setNuevoConcepto({...nuevoConcepto, nombre: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Tipo</label>
                <select 
                  value={nuevoConcepto.tipo} onChange={(e) => setNuevoConcepto({...nuevoConcepto, tipo: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="INGRESO">Ingreso (+)</option>
                  <option value="DESCUENTO">Descuento (-)</option>
                  <option value="APORTACION">Aportación</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Valor / Cálculo</label>
                <div className="flex gap-1">
                  <input 
                    type="number" step="0.01" placeholder="0.00" required
                    value={nuevoConcepto.valor} onChange={(e) => setNuevoConcepto({...nuevoConcepto, valor: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <select 
                    value={nuevoConcepto.modo_calculo} onChange={(e) => setNuevoConcepto({...nuevoConcepto, modo_calculo: e.target.value})}
                    className="bg-gray-900 border border-gray-700 rounded-lg px-1 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="FIJO">S/.</option>
                    <option value="PORCENTAJE">%</option>
                  </select>
                </div>
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors h-[38px]">
                  Agregar Regla
                </button>
              </div>
            </form>

            <div className="overflow-x-auto border border-gray-700 rounded-lg bg-gray-900/50 custom-scrollbar">
              <table className="min-w-full text-left text-sm whitespace-nowrap">
                <thead className="uppercase tracking-wider border-b border-gray-700 bg-gray-900/80 text-gray-400 text-[10px] font-bold">
                  <tr>
                    <th className="px-4 py-3">Concepto</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Valor / Regla</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50 text-gray-300">
                  {conceptos.map(c => (
                    <tr key={c.id} className="hover:bg-gray-800 transition-colors">
                      <td className="px-4 py-3 font-medium text-white">{c.nombre}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.tipo === 'INGRESO' ? 'bg-green-900/50 text-green-400 border border-green-800/50' : 
                          c.tipo === 'DESCUENTO' ? 'bg-red-900/50 text-red-400 border border-red-800/50' : 
                          'bg-blue-900/50 text-blue-400 border border-blue-800/50'
                        }`}>
                          {c.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {c.modo_calculo === 'FIJO' ? `S/. ${c.valor.toFixed(2)}` : `${c.valor}% (Base)`}
                      </td>
                    </tr>
                  ))}
                  {conceptos.length === 0 && (
                    <tr><td colSpan="3" className="px-4 py-6 text-center text-gray-500 italic">No hay conceptos registrados.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}