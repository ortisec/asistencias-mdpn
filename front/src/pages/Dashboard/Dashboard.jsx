import { useDashboard } from './useDashboard';
import { StatCard } from './components/StatCard';
import { PuntualidadChart, RegimenChart } from './components/Charts';
import { ActividadList } from './components/ActividadList';

export default function Dashboard() {
  const { metricas, datosPuntualidad, datosRegimen, actividadReciente, loading } = useDashboard();

  if (loading) return <div className="p-8 text-center text-white">Cargando métricas...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard Gerencial</h1>
      
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Activos" value={metricas.total} color="blue" />
        <StatCard title="Presentes" value={metricas.presentes} color="emerald" />
        <StatCard title="Faltas" value={metricas.ausentes} color="red" />
        <StatCard title="Turno Activo" value={metricas.trabajando} color="purple" />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PuntualidadChart data={datosPuntualidad} />
        <RegimenChart data={datosRegimen} />
      </div>

      {/* Actividad */}
      <ActividadList items={actividadReciente} />
    </div>
  );
}