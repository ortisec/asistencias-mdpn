import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { getPlanillas } from '../../services/planillas';

export default function Planillas() {
  const [planillas, setPlanillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      // Cuando tengas el backend listo, esto traerá las planillas reales
      // const data = await getPlanillas(); 
      // setPlanillas(data);
      
      // POR AHORA: Usamos datos de prueba para que veas la tabla funcionando
      setPlanillas([
        {
          id: 1,
          periodo: 'MAYO 2026',
          condicion_laboral: 'D. LEG 728 - OBRERO PERMANENTE',
          fecha_creacion: new Date().toISOString(),
          boletas: [{ id: 101 }, { id: 102 }] // Simula que tiene 2 boletas
        }
      ]);
    } catch (err) {
      setError('Error al cargar el historial de planillas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  return (
    <div className="space-y-6">
      {/* CABECERA */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Nómina y Planillas</h1>
          <p className="text-sm text-gray-400 mt-1">Generación de boletas de pago y cálculo de remuneraciones.</p>
        </div>
        <Button variant="primary" className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nueva Planilla
        </Button>
      </div>

      {error && <div className="p-4 text-sm text-red-400 bg-red-900/30 border border-red-800/50 rounded-lg">{error}</div>}

      {/* TABLA DE HISTORIAL */}
      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700">
        {loading ? (
          <div className="p-8 text-gray-400 text-center">Cargando registros...</div>
        ) : (
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="uppercase tracking-wider border-b border-gray-700 bg-gray-900/50 text-gray-400 text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">Periodo</th>
                <th className="px-6 py-4 font-semibold">Régimen / Condición</th>
                <th className="px-6 py-4 font-semibold text-center">N° Boletas</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 text-gray-300">
              {planillas.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No hay planillas generadas aún.</td>
                </tr>
              ) : (
                planillas.map((planilla) => (
                  <tr key={planilla.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">
                      {planilla.periodo}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {planilla.condicion_laboral}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-gray-900 px-2.5 py-1 rounded-md text-xs font-mono border border-gray-700">
                        {planilla.boletas?.length || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <Link 
                        to={`/imprimir-boleta/${planilla.id}`}
                        className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 bg-emerald-900/20 hover:bg-emerald-900/40 px-3 py-1.5 rounded transition-colors text-xs font-semibold"
                        target="_blank" // Abre en una nueva pestaña para mayor comodidad
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        Imprimir
                      </Link>
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