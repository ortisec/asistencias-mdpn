import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { getAsistencias } from '../../services/asistencias';
import { getPersonas } from '../../services/personas';
import { getHorarios, getFeriados } from '../../services/configuraciones';

export default function Reportes() {
  // --- ESTADO PARA LAS PESTAÑAS ---
  const [activeTab, setActiveTab] = useState('diario'); // 'diario' o 'ranking'

  const [reporteDatos, setReporteDatos] = useState([]);
  const [rankingDatos, setRankingDatos] = useState([]); // Datos del nuevo submódulo
  const [listaPersonas, setListaPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams] = useSearchParams();
  const dniInicial = searchParams.get('dni');

  const [filtros, setFiltros] = useState({
    personasSeleccionadas: dniInicial ? [dniInicial] : [],
    regimenes: [], 
    fechaInicio: '',
    fechaFin: ''
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalBusqueda, setModalBusqueda] = useState('');
  const [tempSeleccionados, setTempSeleccionados] = useState([]);

  // --- LÓGICA DE TARDANZAS (Pestaña 1) ---
  const analizarAsistencia = (ingresoISO, salidaISO, horariosConfig, feriadosSet) => {
    if (!ingresoISO) return { turno: '---', minutos_tardanza: 0, tiempoTrabajado: '---', es_feriado: false };
    const ingreso = new Date(ingresoISO);
    const hora = ingreso.getHours();
    const minutos = ingreso.getMinutes();
    const tiempoEnMinutos = hora * 60 + minutos; 
    const fechaSoloDia = ingresoISO.split('T')[0]; 
    const es_feriado = feriadosSet.has(fechaSoloDia);

    let turno = ''; let minutos_tardanza = 0; let tiempoTrabajado = 'En curso';

    const timeToMinutes = (timeStr) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    if (hora < 13) {
      turno = 'Mañana';
      const meta = timeToMinutes(horariosConfig.hora_ingreso_manana);
      const tolerancia = horariosConfig.minutos_tolerancia_manana;
      if (!es_feriado && tiempoEnMinutos > (meta + tolerancia)) minutos_tardanza = tiempoEnMinutos - meta;
    } else {
      turno = 'Tarde';
      const meta = timeToMinutes(horariosConfig.hora_ingreso_tarde);
      const tolerancia = horariosConfig.minutos_tolerancia_tarde;
      if (!es_feriado && tiempoEnMinutos > (meta + tolerancia)) minutos_tardanza = tiempoEnMinutos - meta;
    }

    if (salidaISO) {
      const salida = new Date(salidaISO);
      const diferenciaMs = salida - ingreso;
      const horasTrabajadas = Math.floor(diferenciaMs / (1000 * 60 * 60));
      const minutosTrabajados = Math.floor((diferenciaMs % (1000 * 60 * 60)) / (1000 * 60));
      tiempoTrabajado = `${horasTrabajadas}h ${minutosTrabajados}m`;
    }
    return { turno, minutos_tardanza, tiempoTrabajado, es_feriado };
  };

  // --- NUEVA LÓGICA: CALCULADOR DE FALTAS (Pestaña 2) ---
  const calcularRanking = (personasData, asistenciasData, feriadosSet) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Normalizamos hoy a la medianoche

    const ranking = personasData
      .filter(p => p.is_active && p.fecha_inicio_labores) // Solo activos con fecha de inicio
      .map(persona => {
        let diasEsperados = 0;
        let diasAsistidos = 0;
        let fechasFaltas = [];

        // Convertir "1,2,3,4,5" a array de números [1,2,3,4,5]
        const diasLaborables = persona.dias_laborables ? persona.dias_laborables.split(',').map(Number) : [1,2,3,4,5];
        const fechaInicio = new Date(`${persona.fecha_inicio_labores}T00:00:00`);

        // Extraer las fechas únicas en las que esta persona sí vino
        const asistenciasPersona = asistenciasData.filter(a => a.persona_id === persona.id);
        const fechasAsistidas = new Set(asistenciasPersona.map(a => a.fecha_ingreso.split('T')[0]));

        // Recorrer el calendario desde su fecha de inicio hasta hoy
        for (let d = new Date(fechaInicio); d <= hoy; d.setDate(d.getDate() + 1)) {
          const dayOfWeek = d.getDay(); // 0=Dom, 1=Lun, ..., 6=Sab
          const dateStr = d.toISOString().split('T')[0];

          // Si el día de la semana está en su contrato Y NO es feriado
          if (diasLaborables.includes(dayOfWeek) && !feriadosSet.has(dateStr)) {
            diasEsperados++;
            if (fechasAsistidas.has(dateStr)) {
              diasAsistidos++;
            } else {
              fechasFaltas.push(dateStr); // ¡Lo atrapamos faltando!
            }
          }
        }

        const porcentaje = diasEsperados === 0 ? 100 : Math.round((diasAsistidos / diasEsperados) * 100);

        return {
          ...persona,
          diasEsperados,
          diasAsistidos,
          faltas: diasEsperados - diasAsistidos,
          fechasFaltas,
          porcentaje
        };
      });

    // Ordenamos para que los que tienen MÁS FALTAS salgan primero en el ranking
    return ranking.sort((a, b) => b.faltas - a.faltas);
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [asistenciasData, personasData, horariosData, feriadosData] = await Promise.all([
        getAsistencias(), getPersonas(), getHorarios(), getFeriados()
      ]);

      setListaPersonas(personasData);
      const feriadosSet = new Set(feriadosData.map(f => f.fecha));

      // 1. Procesar Reporte Diario
      const personasDiccionario = {};
      personasData.forEach(p => personasDiccionario[p.id] = p);
      const datosFusionados = asistenciasData.map(asistencia => {
        const persona = personasDiccionario[asistencia.persona_id];
        const analisis = analizarAsistencia(asistencia.fecha_ingreso, asistencia.fecha_salida, horariosData, feriadosSet);
        return {
          id_asistencia: asistencia.id,
          dni: persona ? persona.dni : 'Desconocido',
          nombre_completo: persona ? persona.nombre_completo : 'Desconocido',
          regimen: persona ? persona.tipo_trabajador : 'N/A',
          fecha_ingreso: asistencia.fecha_ingreso,
          fecha_salida: asistencia.fecha_salida,
          ...analisis
        };
      });
      setReporteDatos(datosFusionados.sort((a, b) => b.id_asistencia - a.id_asistencia));

      // 2. Procesar Ranking de Faltas
      setRankingDatos(calcularRanking(personasData, asistenciasData, feriadosSet));
      
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos para el reporte.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  // --- MANEJADORES DEL MODAL Y FILTROS ---
  const handleFiltroChange = (e) => setFiltros({ ...filtros, [e.target.id]: e.target.value });
  const handleRegimenToggle = (reg) => setFiltros(p => ({ ...p, regimenes: p.regimenes.includes(reg) ? p.regimenes.filter(r => r !== reg) : [...p.regimenes, reg] }));
  const abrirModal = () => { setTempSeleccionados([...filtros.personasSeleccionadas]); setModalBusqueda(''); setIsModalOpen(true); };
  const cerrarModal = () => setIsModalOpen(false);
  const aplicarSeleccionModal = () => { setFiltros({ ...filtros, personasSeleccionadas: tempSeleccionados }); setIsModalOpen(false); };
  const togglePersonaModal = (dni) => setTempSeleccionados(prev => prev.includes(dni) ? prev.filter(d => d !== dni) : [...prev, dni]);

  const personasModalFiltradas = listaPersonas.filter(p => p.nombre_completo.toLowerCase().includes(modalBusqueda.toLowerCase()) || p.dni.includes(modalBusqueda));

  const formatearFecha = (fechaIso) => {
    if (!fechaIso) return '---';
    return new Date(fechaIso).toLocaleString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const datosFiltrados = reporteDatos.filter((item) => {
    const coincideSeleccion = filtros.personasSeleccionadas.length === 0 || filtros.personasSeleccionadas.includes(item.dni);
    const coincideRegimen = filtros.regimenes.length === 0 || filtros.regimenes.includes(item.regimen.toString());
    let coincideFecha = true;
    if (filtros.fechaInicio || filtros.fechaFin) {
      const fechaItemSoloDia = item.fecha_ingreso ? item.fecha_ingreso.split('T')[0] : '';
      if (filtros.fechaInicio && fechaItemSoloDia < filtros.fechaInicio) coincideFecha = false;
      if (filtros.fechaFin && fechaItemSoloDia > filtros.fechaFin) coincideFecha = false;
    }
    return coincideSeleccion && coincideRegimen && coincideFecha;
  });

  const exportarAExcel = () => {
    let datosParaExcel = [];
    let nombreHoja = "";

    if (activeTab === 'diario') {
      datosParaExcel = datosFiltrados.map(item => ({
        'DNI': item.dni, 'Nombre del Empleado': item.nombre_completo, 'Régimen': item.regimen.toString() === '1057' ? 'CAS' : `D.L. ${item.regimen}`,
        'Turno': item.turno, 'Feriado': item.es_feriado ? 'SÍ' : 'NO', 'Ingreso': formatearFecha(item.fecha_ingreso),
        'Min Tardanza': item.minutos_tardanza, 'Salida': formatearFecha(item.fecha_salida), 'Horas Trab.': item.tiempo_trabajado
      }));
      nombreHoja = "Reporte_Diario";
    } else {
      datosParaExcel = rankingDatos.map(item => ({
        'DNI': item.dni, 'Nombre del Empleado': item.nombre_completo, 'Inicio Labores': item.fecha_inicio_labores,
        'Días Esperados': item.diasEsperados, 'Días Asistidos': item.diasAsistidos, 'Faltas Totales': item.faltas,
        'Porcentaje Asistencia': `${item.porcentaje}%`, 'Fechas de Faltas': item.fechasFaltas.join(', ')
      }));
      nombreHoja = "Ranking_Inasistencias";
    }

    const hoja = XLSX.utils.json_to_sheet(datosParaExcel);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, nombreHoja);
    XLSX.writeFile(libro, `RRHH_${nombreHoja}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6 relative">
      {/* --- MODAL (Se mantiene igual) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-2xl flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-gray-700 flex justify-between items-center bg-gray-800/80 rounded-t-xl">
              <div>
                <h2 className="text-xl font-bold text-white">Seleccionar Personal</h2>
                <p className="text-sm text-blue-400">{tempSeleccionados.length} empleados seleccionados</p>
              </div>
              <button onClick={cerrarModal} className="text-gray-400 hover:text-white"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-5 border-b border-gray-700 bg-gray-900/50">
              <Input id="modalBusqueda" placeholder="Buscar por nombre o DNI..." value={modalBusqueda} onChange={(e) => setModalBusqueda(e.target.value)} autoFocus />
            </div>
            <div className="flex-1 overflow-y-auto p-2 bg-gray-900">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                {personasModalFiltradas.map(persona => {
                  const isSelected = tempSeleccionados.includes(persona.dni);
                  return (
                    <div key={persona.id} onClick={() => togglePersonaModal(persona.dni)} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all duration-200 ${isSelected ? 'bg-blue-900/30 border-blue-500/50 shadow-inner' : 'bg-gray-800 border-gray-700 hover:bg-gray-700/50'}`}>
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${isSelected ? 'bg-blue-600 border-blue-500' : 'bg-gray-900 border-gray-600'}`}>
                        {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-gray-200 truncate">{persona.nombre_completo}</p>
                        <p className="text-xs text-gray-500">{persona.dni} • CAS {persona.tipo_trabajador}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-5 border-t border-gray-700 bg-gray-800/80 rounded-b-xl flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={cerrarModal}>Cancelar</Button>
              <Button type="button" variant="primary" onClick={aplicarSeleccionModal} className="bg-blue-600 hover:bg-blue-700">Aplicar Selección</Button>
            </div>
          </div>
        </div>
      )}

      {/* --- CABECERA Y PESTAÑAS --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Módulo de Reportes</h1>
          
          {/* Navegación de Pestañas */}
          <div className="flex gap-4 mt-4 border-b border-gray-700 pb-px">
            <button 
              onClick={() => setActiveTab('diario')}
              className={`pb-2 text-sm font-semibold transition-colors ${activeTab === 'diario' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Historial de Asistencias
            </button>
            <button 
              onClick={() => setActiveTab('ranking')}
              className={`pb-2 text-sm font-semibold transition-colors ${activeTab === 'ranking' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Ranking de Inasistencias
            </button>
          </div>
        </div>
        
        {!loading && (
          <Button variant="primary" onClick={exportarAExcel} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 mt-2 sm:mt-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Exportar {activeTab === 'diario' ? 'Historial' : 'Ranking'}
          </Button>
        )}
      </div>

      {/* ==============================================
          VISTA 1: HISTORIAL DE ASISTENCIAS (Diario)
      ============================================== */}
      {activeTab === 'diario' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
              <div className="md:col-span-1 flex flex-col space-y-2">
                 <label className="text-sm font-medium text-gray-300">Personal Específico</label>
                 <button onClick={abrirModal} className="w-full flex items-center justify-between bg-gray-900 border border-gray-600 hover:border-blue-500 text-left px-4 py-2.5 rounded-lg transition-colors">
                    <span className={filtros.personasSeleccionadas.length > 0 ? "text-blue-400 font-semibold" : "text-gray-400"}>
                      {filtros.personasSeleccionadas.length === 0 ? "Todo el personal" : `${filtros.personasSeleccionadas.length} seleccionados`}
                    </span>
                 </button>
                 {filtros.personasSeleccionadas.length > 0 && <button onClick={() => setFiltros({...filtros, personasSeleccionadas: []})} className="text-xs text-red-400 hover:underline text-left">Borrar selección</button>}
              </div>

              <div className="md:col-span-1 flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-300">Filtrar por Regímenes</label>
                <div className="flex flex-wrap gap-2">
                  {[ { id: '1057', nombre: 'CAS 1057' }, { id: '728', nombre: 'D.L. 728' }, { id: '276', nombre: 'D.L. 276' } ].map((reg) => (
                    <button key={reg.id} type="button" onClick={() => handleRegimenToggle(reg.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${filtros.regimenes.includes(reg.id) ? 'bg-blue-600/20 text-blue-400 border-blue-500/50' : 'bg-gray-900/50 text-gray-400 border-gray-700'}`}>
                      {reg.nombre}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-1"><Input label="Desde" id="fechaInicio" type="date" value={filtros.fechaInicio} onChange={handleFiltroChange} /></div>
              <div className="md:col-span-1"><Input label="Hasta" id="fechaFin" type="date" value={filtros.fechaFin} onChange={handleFiltroChange} /></div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow overflow-x-auto border border-gray-700">
            {loading ? <div className="p-6 text-gray-400">Cargando...</div> : (
              <table className="min-w-full text-left text-sm whitespace-nowrap">
                <thead className="uppercase tracking-wider border-b border-gray-700 bg-gray-900/50 text-gray-400 text-xs">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Empleado</th>
                    <th className="px-6 py-4 font-semibold">Ingreso</th>
                    <th className="px-6 py-4 font-semibold text-center">Tardanza</th>
                    <th className="px-6 py-4 font-semibold">Salida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 text-gray-200">
                  {datosFiltrados.map((fila) => (
                    <tr key={fila.id_asistencia} className="hover:bg-gray-700/30">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{fila.nombre_completo}</div>
                        <div className="text-xs text-gray-500">{fila.dni}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {formatearFecha(fila.fecha_ingreso)}
                        {fila.es_feriado && <span className="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-purple-900/50 text-purple-400 border border-purple-800">Feriado</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-bold ${fila.minutos_tardanza > 0 ? 'text-red-400' : 'text-gray-500'}`}>{fila.minutos_tardanza} min</span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{formatearFecha(fila.fecha_salida)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ==============================================
          VISTA 2: RANKING DE INASISTENCIAS
      ============================================== */}
      {activeTab === 'ranking' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700">
            <div className="p-5 border-b border-gray-700 bg-gray-900/30">
              <h2 className="text-lg font-semibold text-white">Análisis Global de Faltas</h2>
              <p className="text-sm text-gray-400 mt-1">Calculado automáticamente cruzando contratos, feriados y días laborables.</p>
            </div>
            
            {loading ? <div className="p-6 text-gray-400">Analizando calendarios...</div> : (
              <table className="min-w-full text-left text-sm whitespace-nowrap">
                <thead className="uppercase tracking-wider border-b border-gray-700 bg-gray-900/50 text-gray-400 text-xs">
                  <tr>
                    <th className="px-6 py-4 font-semibold w-12 text-center">Top</th>
                    <th className="px-6 py-4 font-semibold">Empleado</th>
                    <th className="px-6 py-4 font-semibold text-center">Días Asistidos</th>
                    <th className="px-6 py-4 font-semibold text-center">Faltas Acumuladas</th>
                    <th className="px-6 py-4 font-semibold text-center">Porcentaje Asistencia</th>
                    <th className="px-6 py-4 font-semibold">Detalle de Faltas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 text-gray-200">
                  {rankingDatos.map((fila, index) => (
                    <tr key={fila.id} className="hover:bg-gray-700/30">
                      <td className="px-6 py-4 text-center font-bold text-gray-500">#{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{fila.nombre_completo}</div>
                        <div className="text-xs text-gray-500">Inició: {fila.fecha_inicio_labores}</div>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-300">
                        <span className="font-semibold text-white">{fila.diasAsistidos}</span> / {fila.diasEsperados}
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full font-bold text-xs ${fila.faltas > 0 ? 'bg-red-900/40 text-red-400 border border-red-800/50' : 'bg-emerald-900/20 text-emerald-500'}`}>
                          {fila.faltas} {fila.faltas === 1 ? 'falta' : 'faltas'}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        {/* Barra de progreso de asistencia */}
                        <div className="flex items-center gap-3 justify-center">
                          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${fila.porcentaje < 80 ? 'bg-red-500' : fila.porcentaje < 95 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${fila.porcentaje}%` }}
                            ></div>
                          </div>
                          <span className="font-medium w-10 text-right">{fila.porcentaje}%</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {fila.fechasFaltas.length === 0 ? (
                            <span className="text-gray-500 italic text-xs">Asistencia perfecta</span>
                          ) : (
                            fila.fechasFaltas.map((fecha, i) => (
                              <span key={i} className="text-[10px] bg-gray-700 px-2 py-0.5 rounded text-gray-300">
                                {fecha.split('-').reverse().slice(0,2).join('/')} {/* Muestra DD/MM */}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

    </div>
  );
}