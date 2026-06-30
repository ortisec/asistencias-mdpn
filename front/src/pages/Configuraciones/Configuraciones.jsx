import { useState } from 'react';
import { useConfiguraciones } from './useConfiguraciones';
import { ReglasAsistenciaForm } from './ReglasAsistenciaForm';
import { FeriadosList } from './FeriadosList';
import { NominaCatalogo } from './NominaCatalogo';

export default function Configuraciones() {
  const [vista, setVista] = useState('asistencia');
  const { loading, refresh, ...datos } = useConfiguraciones();

  if (loading) return <div className="text-gray-400 p-8">Cargando parámetros...</div>;

  return (
    <div className="space-y-6">
      {/* Navegación */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Configuración del Sistema</h1>
        <div className="flex bg-gray-800 p-1 rounded-lg">
          <TabButton active={vista === 'asistencia'} onClick={() => setVista('asistencia')}>Asistencia</TabButton>
          <TabButton active={vista === 'nomina'} onClick={() => setVista('nomina')}>Nómina</TabButton>
        </div>
      </div>

      {/* Vistas */}
      {vista === 'asistencia' ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ReglasAsistenciaForm horarios={datos.horarios} onUpdate={refresh} />
          <FeriadosList feriados={datos.feriados} onUpdate={refresh} />
        </div>
      ) : (
        <NominaCatalogo datos={datos} onUpdate={refresh} />
      )}
    </div>
  );
}

// Botón de pestaña pequeño y reutilizable
const TabButton = ({ active, onClick, children }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 text-sm font-bold rounded ${active ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
  >
    {children}
  </button>
);