// src/pages/Dashboard/components/ActividadList.jsx
export const ActividadList = ({ items }) => (
  <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
    <div className="p-5 border-b border-gray-700 bg-gray-800/50">
      <h2 className="text-lg font-bold text-white">Últimos Movimientos</h2>
    </div>
    <ul className="divide-y divide-gray-700">
      {items.map((item, i) => (
        <li key={i} className="p-4 flex items-center hover:bg-gray-700/30">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${item.fecha_salida ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
            {item.fecha_salida ? '📤' : '📥'}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-200">{item.persona?.nombre_completo}</p>
            <p className="text-xs text-gray-500">{item.persona?.dni}</p>
          </div>
          <span className="text-xs text-gray-400 font-mono">
            {new Date(item.fecha_salida || item.fecha_ingreso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </li>
      ))}
    </ul>
  </div>
);