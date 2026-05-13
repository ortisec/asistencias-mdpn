import { formatearFecha, getColorTurno } from './reportesLogic';

export default function TablaHistorial({ datosFiltrados, loading }) {
  if (loading) return <div className="p-6 text-gray-400">Calculando indicadores con reglas actuales...</div>;

  return (
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
                <span className={`px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide ${getColorTurno(fila.turno)}`}>{fila.turno}</span>
              </td>
              <td className="px-6 py-4 text-gray-300">
                {formatearFecha(fila.fecha_ingreso)}
                {fila.es_feriado && <span className="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-purple-900/50 text-purple-400 border border-purple-800">Feriado</span>}
              </td>
              <td className="px-6 py-4 text-center">
                <span className={`font-bold ${fila.minutos_tardanza > 0 ? 'text-red-400' : 'text-gray-500'}`}>{fila.minutos_tardanza}</span>
              </td>
              <td className="px-6 py-4 text-gray-300">{formatearFecha(fila.fecha_salida)}</td>
              <td className="px-6 py-4 font-medium">
                {fila.tiempo_trabajado === 'En curso' ? <span className="px-2 py-1 text-xs bg-gray-800 text-gray-400 rounded">En curso</span> : fila.tiempo_trabajado}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}