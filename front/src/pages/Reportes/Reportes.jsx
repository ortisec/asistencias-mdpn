import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Input } from '../../components/ui/Input';
import { getAsistencias } from '../../services/asistencias';
import { getPersonas } from '../../services/personas';
import { getHorarios, getFeriados } from '../../services/configuraciones';

export default function Reportes() {
  const [reporteDatos, setReporteDatos] = useState([]);
  const [listaPersonas, setListaPersonas] = useState([]); // Guardamos la lista original para el modal
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams] = useSearchParams();
  const dniInicial = searchParams.get('dni');

  const [filtros, setFiltros] = useState({
    personasSeleccionadas: dniInicial ? [dniInicial] : [], // Ahora es un Array de DNIs
    regimenes: [], 
    fechaInicio: '',
    fechaFin: ''
  });

  // --- ESTADOS PARA EL MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalBusqueda, setModalBusqueda] = useState('');
  const [tempSeleccionados, setTempSeleccionados] = useState([]);

  const analizarAsistencia = (ingresoISO, salidaISO, horariosConfig, feriadosSet) => {
    if (!ingresoISO) return { turno: '---', minutos_tardanza: 0, tiempoTrabajado: '---', es_feriado: false };

    const ingreso = new Date(ingresoISO);
    const hora = ingreso.getHours();
    const minutos = ingreso.getMinutes();
    const tiempoEnMinutos = hora * 60 + minutos; 
    const fechaSoloDia = ingresoISO.split('T')[0]; 
    
    const es_feriado = feriadosSet.has(fechaSoloDia);

    let turno = '';
    let minutos_tardanza = 0;
    let tiempoTrabajado = 'En curso';

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

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [asistenciasData, personasData, horariosData, feriadosData] = await Promise.all([
        getAsistencias(),
        getPersonas(),
        getHorarios(),
        getFeriados()
      ]);

      setListaPersonas(personasData); // Guardamos la lista para mostrarla en el Modal

      const personasDiccionario = {};
      personasData.forEach(persona => {
        personasDiccionario[persona.id] = persona;
      });

      const feriadosSet = new Set(feriadosData.map(f => f.fecha));

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
          turno: analisis.turno,
          minutos_tardanza: analisis.minutos_tardanza,
          tiempo_trabajado: analisis.tiempoTrabajado,
          es_feriado: analisis.es_feriado
        };
      });

      setReporteDatos(datosFusionados.sort((a, b) => b.id_asistencia - a.id_asistencia));
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos para el reporte.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleFiltroChange = (e) => {
    setFiltros({ ...filtros, [e.target.id]: e.target.value });
  };

  const handleRegimenToggle = (regimenStr) => {
    setFiltros((prev) => {
      const nuevosRegimenes = prev.regimenes.includes(regimenStr)
        ? prev.regimenes.filter(r => r !== regimenStr) 
        : [...prev.regimenes, regimenStr]; 
      return { ...prev, regimenes: nuevosRegimenes };
    });
  };

  // --- FUNCIONES DEL MODAL ---
  const abrirModal = () => {
    setTempSeleccionados([...filtros.personasSeleccionadas]); // Copiamos los actuales al temporal
    setModalBusqueda('');
    setIsModalOpen(true);
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
  };

  const aplicarSeleccionModal = () => {
    setFiltros({ ...filtros, personasSeleccionadas: tempSeleccionados });
    setIsModalOpen(false);
  };

  const togglePersonaModal = (dni) => {
    setTempSeleccionados(prev => 
      prev.includes(dni) ? prev.filter(d => d !== dni) : [...prev, dni]
    );
  };

  // Filtrar la lista DENTRO del modal
  const personasModalFiltradas = listaPersonas.filter(p => 
    p.nombre_completo.toLowerCase().includes(modalBusqueda.toLowerCase()) || 
    p.dni.includes(modalBusqueda)
  );

  const formatearFecha = (fechaIso) => {
    if (!fechaIso) return '---';
    return new Date(fechaIso).toLocaleString('es-PE', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  // --- FILTRADO PRINCIPAL DE LA TABLA ---
  const datosFiltrados = reporteDatos.filter((item) => {
    // 1. Verificamos si el DNI está en la lista de seleccionados (o si la lista está vacía, mostramos todos)
    const coincideSeleccion = filtros.personasSeleccionadas.length === 0 || filtros.personasSeleccionadas.includes(item.dni);
    
    // 2. Filtro de Regímenes
    const coincideRegimen = filtros.regimenes.length === 0 || filtros.regimenes.includes(item.regimen.toString());
    
    // 3. Fechas
    let coincideFecha = true;
    if (filtros.fechaInicio || filtros.fechaFin) {
      const fechaItemSoloDia = item.fecha_ingreso ? item.fecha_ingreso.split('T')[0] : '';
      if (filtros.fechaInicio && fechaItemSoloDia < filtros.fechaInicio) coincideFecha = false;
      if (filtros.fechaFin && fechaItemSoloDia > filtros.fechaFin) coincideFecha = false;
    }

    return coincideSeleccion && coincideRegimen && coincideFecha;
  });

  const exportarAExcel = () => {
    const datosParaExcel = datosFiltrados.map(item => ({
      'DNI': item.dni,
      'Nombre del Empleado': item.nombre_completo,
      'Régimen': item.regimen,
      'Turno': item.turno,
      'Fecha Feriado?': item.es_feriado ? 'SÍ' : 'NO',
      'Hora de Ingreso': formatearFecha(item.fecha_ingreso),
      'Minutos Tardanza': item.minutos_tardanza,
      'Hora de Salida': formatearFecha(item.fecha_salida),
      'Horas Trabajadas': item.tiempo_trabajado
    }));

    const hojaDeTrabajo = XLSX.utils.json_to_sheet(datosParaExcel);
    const libroDeTrabajo = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Reporte_Asistencia");
    const fechaArchivo = new Date().toISOString().split('T')[0];
    XLSX.writeFile(libroDeTrabajo, `Asistencias_RRHH_${fechaArchivo}.xlsx`);
  };

  const getColorTurno = (turno) => {
    if (turno === 'Mañana') return 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400 border border-sky-200 dark:border-sky-800';
    if (turno === 'Tarde') return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  };

  return (
    <div className="space-y-6 relative">
      
      {/* ================= MODAL DE SELECCIÓN DE PERSONAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-2xl flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-700 flex justify-between items-center bg-gray-800/80 rounded-t-xl">
              <div>
                <h2 className="text-xl font-bold text-white">Seleccionar Personal</h2>
                <p className="text-sm text-blue-400">{tempSeleccionados.length} empleados seleccionados</p>
              </div>
              <button onClick={cerrarModal} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Body (Buscador y Lista) */}
            <div className="p-5 border-b border-gray-700 bg-gray-900/50">
              <Input 
                id="modalBusqueda"
                placeholder="Buscar por nombre o DNI..." 
                value={modalBusqueda} 
                onChange={(e) => setModalBusqueda(e.target.value)}
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto p-2 bg-gray-900">
              {personasModalFiltradas.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No se encontraron empleados.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                  {personasModalFiltradas.map(persona => {
                    const isSelected = tempSeleccionados.includes(persona.dni);
                    return (
                      <div 
                        key={persona.id}
                        onClick={() => togglePersonaModal(persona.dni)}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all duration-200 ${
                          isSelected 
                            ? 'bg-blue-900/30 border-blue-500/50 shadow-inner' 
                            : 'bg-gray-800 border-gray-700 hover:bg-gray-700/50'
                        }`}
                      >
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
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-gray-700 bg-gray-800/80 rounded-b-xl flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={cerrarModal}>Cancelar</Button>
              <Button type="button" variant="primary" onClick={aplicarSeleccionModal} className="bg-blue-600 hover:bg-blue-700">
                Aplicar Selección
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* ====================================================================== */}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Reporte y Exportación RR.HH.</h1>
        
        {!loading && datosFiltrados.length > 0 && (
          <Button variant="primary" onClick={exportarAExcel} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Descargar Excel ({datosFiltrados.length})
          </Button>
        )}
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          
          {/* BOTÓN PARA ABRIR MODAL (Reemplaza al antiguo Input de texto) */}
          <div className="md:col-span-1 flex flex-col space-y-2">
             <label className="text-sm font-medium text-gray-300">Personal Específico</label>
             <button 
                onClick={abrirModal}
                className="w-full flex items-center justify-between bg-gray-900 border border-gray-600 hover:border-blue-500 text-left px-4 py-2.5 rounded-lg transition-colors"
             >
                <span className={filtros.personasSeleccionadas.length > 0 ? "text-blue-400 font-semibold" : "text-gray-400"}>
                  {filtros.personasSeleccionadas.length === 0 
                    ? "Todo el personal" 
                    : `${filtros.personasSeleccionadas.length} seleccionados`}
                </span>
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </button>
             {/* Botón rápido para limpiar selección */}
             {filtros.personasSeleccionadas.length > 0 && (
               <button onClick={() => setFiltros({...filtros, personasSeleccionadas: []})} className="text-xs text-red-400 hover:underline text-left">
                 Borrar selección
               </button>
             )}
          </div>

          <div className="md:col-span-1 flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-300">Filtrar por Regímenes</label>
            <div className="flex flex-wrap gap-2">
              {[ { id: '1057', nombre: 'CAS 1057' }, { id: '728', nombre: 'D.L. 728' }, { id: '276', nombre: 'D.L. 276' } ].map((reg) => {
                const isSelected = filtros.regimenes.includes(reg.id);
                return (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={() => handleRegimenToggle(reg.id)}
                    className={`
                      flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border
                      ${isSelected 
                        ? 'bg-blue-600/20 text-blue-400 border-blue-500/50 shadow-[0_0_10px_rgba(37,99,235,0.1)]' 
                        : 'bg-gray-900/50 text-gray-400 border-gray-700 hover:bg-gray-800 hover:text-gray-200 hover:border-gray-600'
                      }
                    `}
                  >
                    <div className={`w-2 h-2 rounded-full transition-colors ${isSelected ? 'bg-blue-500 shadow-[0_0_5px_#3b82f6]' : 'bg-gray-600'}`}></div>
                    {reg.nombre}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-1">
            <Input label="Desde la Fecha" id="fechaInicio" type="date" value={filtros.fechaInicio} onChange={handleFiltroChange} />
          </div>
          
          <div className="md:col-span-1">
            <Input label="Hasta la Fecha" id="fechaFin" type="date" value={filtros.fechaFin} onChange={handleFiltroChange} />
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow overflow-x-auto border border-gray-700">
        {loading ? (
          <div className="p-6 text-gray-400">Calculando indicadores con reglas actuales...</div>
        ) : (
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="uppercase tracking-wider border-b border-gray-700 bg-gray-900/50 text-gray-400 text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">Empleado</th>
                <th className="px-6 py-4 font-semibold">Turno</th>
                <th className="px-6 py-4 font-semibold">Ingreso</th>
                <th className="px-6 py-4 font-semibold text-center">Tardanza (Min)</th>
                <th className="px-6 py-4 font-semibold">Salida</th>
                <th className="px-6 py-4 font-semibold">Horas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-200">
              {datosFiltrados.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No hay datos.</td></tr>
              ) : (
                datosFiltrados.map((fila) => (
                  <tr key={fila.id_asistencia} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{fila.nombre_completo}</div>
                      <div className="text-xs text-gray-500">
                        {fila.dni} <span className="mx-1">•</span> {fila.regimen.toString() === '1057' ? 'CAS 1057' : `D.L. ${fila.regimen}`}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide ${getColorTurno(fila.turno)}`}>
                        {fila.turno}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-gray-300">
                      {formatearFecha(fila.fecha_ingreso)}
                      {fila.es_feriado && (
                        <span className="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-purple-900/50 text-purple-400 border border-purple-800">
                          Feriado
                        </span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <span className={`font-bold ${fila.minutos_tardanza > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                        {fila.minutos_tardanza}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-gray-300">{formatearFecha(fila.fecha_salida)}</td>
                    
                    <td className="px-6 py-4 font-medium">
                      {fila.tiempo_trabajado === 'En curso' ? (
                        <span className="px-2 py-1 text-xs bg-gray-800 text-gray-400 rounded">
                          En curso
                        </span>
                      ) : (
                        fila.tiempo_trabajado
                      )}
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