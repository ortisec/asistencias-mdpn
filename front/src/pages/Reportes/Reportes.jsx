import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { getAsistencias } from '../../services/asistencias';
import { getPersonas } from '../../services/personas';
import { getHorarios, getFeriados } from '../../services/configuraciones';

import { analizarAsistencia, calcularRanking, generarExcel } from './reportesLogic';
import TablaHistorial from './TablaHistorial';
import TablaRanking from './TablaRanking';

export default function Reportes() {
  const [activeTab, setActiveTab] = useState('diario');

  // Guardamos los datos puros para poder recalcular la matemática cuando cambien las fechas
  const [rawAsistencias, setRawAsistencias] = useState([]);
  const [rawFeriados, setRawFeriados] = useState([]);
  const [listaPersonas, setListaPersonas] = useState([]);

  const [reporteDatos, setReporteDatos] = useState([]); // Historial ya procesado
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const dniInicial = searchParams.get('dni');

  const [filtros, setFiltros] = useState({
    personasSeleccionadas: dniInicial ? [dniInicial] : [],
    regimenes: [], fechaInicio: '', fechaFin: ''
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalBusqueda, setModalBusqueda] = useState('');
  const [tempSeleccionados, setTempSeleccionados] = useState([]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [asistenciasData, personasData, horariosData, feriadosData] = await Promise.all([
        getAsistencias(), getPersonas(), getHorarios(), getFeriados()
      ]);

      setListaPersonas(personasData);
      setRawAsistencias(asistenciasData);
      setRawFeriados(feriadosData);

      const feriadosSet = new Set(feriadosData.map(f => f.fecha));
      const personasDiccionario = {};
      personasData.forEach(p => personasDiccionario[p.id] = p);

      const datosFusionados = asistenciasData.map(asistencia => {
        const persona = personasDiccionario[asistencia.persona_id];

        // AQUÍ EL CAMBIO: Le pasamos el tipo_trabajador (régimen) al cerebro matemático
        const analisis = analizarAsistencia(
          asistencia.fecha_ingreso,
          asistencia.fecha_salida,
          horariosData,
          feriadosSet,
          persona ? persona.tipo_trabajador : 1057
        );

        return {
          id_asistencia: asistencia.id, dni: persona ? persona.dni : 'Desconocido', nombre_completo: persona ? persona.nombre_completo : 'Desconocido',
          regimen: persona ? persona.tipo_trabajador : 'N/A', fecha_ingreso: asistencia.fecha_ingreso, fecha_salida: asistencia.fecha_salida, ...analisis
        };
      });
      
      setReporteDatos(datosFusionados.sort((a, b) => b.id_asistencia - a.id_asistencia));

    } catch (err) {
      console.error('Error al cargar datos', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  // --- MATEMÁTICA Y FILTRADO EN TIEMPO REAL ---

  // 1. Filtro para la Tabla de Historial Diario
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

  // 2. Cálculo en tiempo real del Ranking (Se actualiza automáticamente al cambiar fechas)
  const rankingDinamico = useMemo(() => {
    const feriadosSet = new Set(rawFeriados.map(f => f.fecha));
    return calcularRanking(listaPersonas, rawAsistencias, feriadosSet, filtros.fechaInicio, filtros.fechaFin);
  }, [listaPersonas, rawAsistencias, rawFeriados, filtros.fechaInicio, filtros.fechaFin]);

  // 3. Filtro de Selección y Régimen para el Ranking
  const rankingFiltrado = rankingDinamico.filter((item) => {
    const coincideSeleccion = filtros.personasSeleccionadas.length === 0 || filtros.personasSeleccionadas.includes(item.dni);
    const coincideRegimen = filtros.regimenes.length === 0 || filtros.regimenes.includes(item.tipo_trabajador.toString());
    return coincideSeleccion && coincideRegimen;
  });


  // --- HANDLERS DEL MODAL Y UI ---
  const handleFiltroChange = (e) => setFiltros({ ...filtros, [e.target.id]: e.target.value });
  const handleRegimenToggle = (reg) => setFiltros(p => ({ ...p, regimenes: p.regimenes.includes(reg) ? p.regimenes.filter(r => r !== reg) : [...p.regimenes, reg] }));
  const abrirModal = () => { setTempSeleccionados([...filtros.personasSeleccionadas]); setModalBusqueda(''); setIsModalOpen(true); };
  const personasModalFiltradas = listaPersonas.filter(p => p.nombre_completo.toLowerCase().includes(modalBusqueda.toLowerCase()) || p.dni.includes(modalBusqueda));

  return (
    <div className="space-y-6 relative">

      {/* --- MODAL (Igual que antes) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-2xl flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-gray-700 flex justify-between items-center bg-gray-800/80 rounded-t-xl">
              <div><h2 className="text-xl font-bold text-white">Seleccionar Personal</h2><p className="text-sm text-blue-400">{tempSeleccionados.length} empleados seleccionados</p></div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-5 border-b border-gray-700 bg-gray-900/50"><Input id="modalBusqueda" placeholder="Buscar por nombre o DNI..." value={modalBusqueda} onChange={(e) => setModalBusqueda(e.target.value)} autoFocus /></div>
            <div className="flex-1 overflow-y-auto p-2 bg-gray-900">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                {personasModalFiltradas.map(persona => {
                  const isSelected = tempSeleccionados.includes(persona.dni);
                  return (
                    <div key={persona.id} onClick={() => setTempSeleccionados(p => p.includes(persona.dni) ? p.filter(d => d !== persona.dni) : [...p, persona.dni])} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all duration-200 ${isSelected ? 'bg-blue-900/30 border-blue-500/50 shadow-inner' : 'bg-gray-800 border-gray-700 hover:bg-gray-700/50'}`}>
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${isSelected ? 'bg-blue-600 border-blue-500' : 'bg-gray-900 border-gray-600'}`}>
                        {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <div className="overflow-hidden"><p className="text-sm font-semibold text-gray-200 truncate">{persona.nombre_completo}</p><p className="text-xs text-gray-500">{persona.dni} • CAS {persona.tipo_trabajador}</p></div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-5 border-t border-gray-700 bg-gray-800/80 rounded-b-xl flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="button" variant="primary" onClick={() => { setFiltros({ ...filtros, personasSeleccionadas: tempSeleccionados }); setIsModalOpen(false); }} className="bg-blue-600 hover:bg-blue-700">Aplicar Selección</Button>
            </div>
          </div>
        </div>
      )}

      {/* --- CABECERA Y EXPORTACIÓN --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Módulo de Reportes</h1>
          <div className="flex gap-4 mt-4 border-b border-gray-700 pb-px">
            <button onClick={() => setActiveTab('diario')} className={`pb-2 text-sm font-semibold transition-colors ${activeTab === 'diario' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-gray-300'}`}>Historial de Asistencias</button>
            <button onClick={() => setActiveTab('ranking')} className={`pb-2 text-sm font-semibold transition-colors ${activeTab === 'ranking' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-gray-300'}`}>Ranking de Inasistencias</button>
          </div>
        </div>
        {!loading && (
          <Button variant="primary" onClick={() => generarExcel(activeTab, datosFiltrados, rankingFiltrado)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 mt-2 sm:mt-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Exportar Excel
          </Button>
        )}
      </div>

      {/* --- SECCIÓN DE FILTROS (¡AHORA VISIBLE PARA AMBAS PESTAÑAS!) --- */}
      <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700 animate-in fade-in duration-300">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          <div className="md:col-span-1 flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-300">Personal Específico</label>
            <button onClick={abrirModal} className="w-full flex items-center justify-between bg-gray-900 border border-gray-600 hover:border-blue-500 text-left px-4 py-2.5 rounded-lg transition-colors">
              <span className={filtros.personasSeleccionadas.length > 0 ? "text-blue-400 font-semibold" : "text-gray-400"}>
                {filtros.personasSeleccionadas.length === 0 ? "Todo el personal" : `${filtros.personasSeleccionadas.length} seleccionados`}
              </span>
            </button>
            {filtros.personasSeleccionadas.length > 0 && <button onClick={() => setFiltros({ ...filtros, personasSeleccionadas: [] })} className="text-xs text-red-400 hover:underline text-left">Borrar selección</button>}
          </div>
          <div className="md:col-span-1 flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-300">Filtrar por Regímenes</label>
            <div className="flex flex-wrap gap-2">
              {[{ id: '1057', nombre: 'CAS 1057' }, { id: '728', nombre: 'D.L. 728' }, { id: '276', nombre: 'D.L. 276' }].map((reg) => (
                <button key={reg.id} type="button" onClick={() => handleRegimenToggle(reg.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${filtros.regimenes.includes(reg.id) ? 'bg-blue-600/20 text-blue-400 border-blue-500/50' : 'bg-gray-900/50 text-gray-400 border-gray-700'}`}>{reg.nombre}</button>
              ))}
            </div>
          </div>

          <div className="md:col-span-1"><Input label="Desde (Cálculo Inicia)" id="fechaInicio" type="date" value={filtros.fechaInicio} onChange={handleFiltroChange} /></div>
          <div className="md:col-span-1"><Input label="Hasta (Cálculo Finaliza)" id="fechaFin" type="date" value={filtros.fechaFin} onChange={handleFiltroChange} /></div>
        </div>
      </div>

      {/* --- RENDERIZADO DINÁMICO DE PESTAÑAS --- */}
      <div className="bg-gray-800 rounded-lg shadow overflow-x-auto border border-gray-700 mt-6">
        {activeTab === 'diario'
          ? <TablaHistorial datosFiltrados={datosFiltrados} loading={loading} />
          : <TablaRanking rankingDatos={rankingFiltrado} loading={loading} />
        }
      </div>

    </div>
  );
}