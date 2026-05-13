import { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import { getPersonas } from '../../services/personas';
import { getAsistencias } from '../../services/asistencias';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  
  const [metricas, setMetricas] = useState({
    totalEmpleados: 0,
    presentesHoy: 0,
    ausentesHoy: 0,
    trabajandoAhora: 0,
  });

  const [datosPuntualidad, setDatosPuntualidad] = useState([]);
  const [datosRegimen, setDatosRegimen] = useState([]);
  const [actividadReciente, setActividadReciente] = useState([]);

  // Colores para los gráficos (Adaptados al modo oscuro)
  const COLORES_PUNTUALIDAD = ['#10b981', '#f59e0b', '#ef4444']; // Verde, Ámbar, Rojo
  const COLORES_REGIMEN = ['#3b82f6', '#8b5cf6', '#ec4899']; // Azul, Morado, Rosa

  useEffect(() => {
    const cargarMeticas = async () => {
      try {
        setLoading(true);
        const [personasData, asistenciasData] = await Promise.all([
          getPersonas(),
          getAsistencias()
        ]);

        // Filtramos solo a los activos para las métricas reales
        const personasActivas = personasData.filter(p => p.is_active);
        const totalEmpleados = personasActivas.length;
        
        const hoy = new Date().toISOString().split('T')[0]; 
        
        const registrosHoy = asistenciasData.filter(a => 
          a.fecha_ingreso && a.fecha_ingreso.startsWith(hoy)
        );

        const personasPresentesIds = new Set(registrosHoy.map(a => a.persona_id));
        const presentesHoy = personasPresentesIds.size;
        const ausentesHoy = totalEmpleados - presentesHoy;
        const trabajandoAhora = registrosHoy.filter(a => !a.fecha_salida).length;

        setMetricas({ totalEmpleados, presentesHoy, ausentesHoy, trabajandoAhora });

        // --- CÁLCULO PARA GRÁFICO DE PUNTUALIDAD ---
        let aTiempo = 0; let enTolerancia = 0; let tardanzas = 0;

        registrosHoy.forEach(a => {
          const ingreso = new Date(a.fecha_ingreso);
          const hora = ingreso.getHours();
          const minutos = ingreso.getMinutes();
          const tiempoEnMinutos = hora * 60 + minutos;

          const meta = hora < 13 ? 8 * 60 : 14 * 60;
          const tolerancia = meta + 15;

          if (tiempoEnMinutos <= meta) aTiempo++;
          else if (tiempoEnMinutos <= tolerancia) enTolerancia++;
          else tardanzas++;
        });

        // Solo armamos el gráfico si hay al menos 1 persona presente
        if (presentesHoy > 0) {
          setDatosPuntualidad([
            { name: 'A Tiempo', value: aTiempo },
            { name: 'En Tolerancia', value: enTolerancia },
            { name: 'Tardanza', value: tardanzas }
          ]);
        } else {
          setDatosPuntualidad([]); // Vacío si nadie ha llegado
        }

        // --- CÁLCULO PARA GRÁFICO DE RÉGIMEN ---
        const conteoRegimen = { '1057': 0, '728': 0, '276': 0 };
        personasActivas.forEach(p => {
          const regimenStr = p.tipo_trabajador.toString();
          if (conteoRegimen[regimenStr] !== undefined) {
            conteoRegimen[regimenStr]++;
          }
        });

        setDatosRegimen([
          { name: 'CAS 1057', total: conteoRegimen['1057'] },
          { name: 'D.L. 728', total: conteoRegimen['728'] },
          { name: 'D.L. 276', total: conteoRegimen['276'] }
        ]);

        // --- ACTIVIDAD RECIENTE ---
        const diccionarioPersonas = {};
        personasData.forEach(p => diccionarioPersonas[p.id] = p);

        const asistenciasOrdenadas = [...asistenciasData].sort((a, b) => b.id - a.id);
        const ultimos5 = asistenciasOrdenadas.slice(0, 5).map(asistencia => {
          const persona = diccionarioPersonas[asistencia.persona_id];
          return {
            id: asistencia.id,
            nombre: persona ? persona.nombre_completo : 'Desconocido',
            dni: persona ? persona.dni : '',
            hora_ultimo_movimiento: asistencia.fecha_salida || asistencia.fecha_ingreso,
            tipo_ultimo_movimiento: asistencia.fecha_salida ? 'SALIDA' : 'INGRESO',
          };
        });

        ultimos5.sort((a, b) => new Date(b.hora_ultimo_movimiento) - new Date(a.hora_ultimo_movimiento));
        setActividadReciente(ultimos5);

      } catch (error) {
        console.error("Error al cargar métricas", error);
      } finally {
        setLoading(false);
      }
    };

    cargarMeticas();
  }, []);

  const formatearHora = (fechaIso) => {
    if (!fechaIso) return '';
    return new Date(fechaIso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Configuración de estilo oscuro para los menús flotantes de los gráficos
  const customTooltipStyle = {
    backgroundColor: '#1f2937', // bg-gray-800
    border: '1px solid #374151', // border-gray-700
    borderRadius: '0.5rem',
    color: '#f3f4f6' // text-gray-100
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Gerencial</h1>
        <p className="text-gray-400 text-sm mt-1">Visión general del personal y control de asistencias de hoy.</p>
      </div>

      {/* --- FILA 1: KPIs PRINCIPALES --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500 rounded-full opacity-10 blur-xl"></div>
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Total Activos</p>
          <p className="text-4xl font-bold text-white mt-2">{metricas.totalEmpleados}</p>
        </div>
        
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500 rounded-full opacity-10 blur-xl"></div>
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Presentes Hoy</p>
          <p className="text-4xl font-bold text-emerald-400 mt-2">{metricas.presentesHoy}</p>
        </div>

        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-red-500 rounded-full opacity-10 blur-xl"></div>
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Faltas Hoy</p>
          <p className="text-4xl font-bold text-red-400 mt-2">{metricas.ausentesHoy}</p>
        </div>

        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-500 rounded-full opacity-10 blur-xl"></div>
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Turno Activo</p>
          <p className="text-4xl font-bold text-purple-400 mt-2">{metricas.trabajandoAhora}</p>
        </div>
      </div>

      {/* --- FILA 2: GRÁFICOS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GRÁFICO 1: Puntualidad */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg p-6">
          <h2 className="text-lg font-bold text-white mb-4">Índice de Puntualidad (Hoy)</h2>
          <div className="h-64 w-full">
            {datosPuntualidad.length === 0 ? (
              <div className="flex h-full items-center justify-center text-gray-500">
                Aún no hay registros de entrada hoy.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={datosPuntualidad}
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {datosPuntualidad.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORES_PUNTUALIDAD[index % COLORES_PUNTUALIDAD.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={customTooltipStyle} itemStyle={{ color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          
          {/* Leyenda Personalizada */}
          {datosPuntualidad.length > 0 && (
            <div className="flex justify-center gap-6 mt-2">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-sm text-gray-300">A Tiempo</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div><span className="text-sm text-gray-300">Tolerancia</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-sm text-gray-300">Tardanza</span></div>
            </div>
          )}
        </div>

        {/* GRÁFICO 2: Empleados por Régimen */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg p-6">
          <h2 className="text-lg font-bold text-white mb-4">Distribución por Régimen</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosRegimen} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                {/* Ejes sin líneas molestas */}
                <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{ fill: '#374151' }} contentStyle={customTooltipStyle} />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  {datosRegimen.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORES_REGIMEN[index % COLORES_REGIMEN.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* --- FILA 3: ACTIVIDAD RECIENTE (Estilo Chips) --- */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden">
        <div className="p-5 border-b border-gray-700 bg-gray-800/50">
          <h2 className="text-lg font-bold text-white">Últimos Movimientos en el Reloj</h2>
        </div>
        <div className="p-0">
          {actividadReciente.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No hay movimientos registrados recientemente.</div>
          ) : (
            <ul className="divide-y divide-gray-700">
              {actividadReciente.map((item, index) => (
                <li key={index} className="p-4 flex items-center hover:bg-gray-700/30 transition-colors">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4 shadow-inner
                    ${item.tipo_ultimo_movimiento === 'INGRESO' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {item.tipo_ultimo_movimiento === 'INGRESO' ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-200">{item.nombre}</p>
                    <p className="text-xs text-gray-500">{item.dni}</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    {/* Chip de movimiento */}
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md tracking-wide
                      ${item.tipo_ultimo_movimiento === 'INGRESO' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800' : 'bg-red-900/50 text-red-400 border border-red-800'}`}>
                      {item.tipo_ultimo_movimiento}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{formatearHora(item.hora_ultimo_movimiento)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}