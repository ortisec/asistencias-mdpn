export default function TablaRanking({ rankingDatos, loading }) {
  if (loading) return <div className="p-6 text-gray-400">Analizando calendarios...</div>;

  return (
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
              <div className="flex items-center gap-3 justify-center">
                <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${fila.porcentaje < 80 ? 'bg-red-500' : fila.porcentaje < 95 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${fila.porcentaje}%` }}></div>
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
                      {fecha.split('-').reverse().slice(0,2).join('/')}
                    </span>
                  ))
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}