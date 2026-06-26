import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { getPlanillas, createPlanilla } from '../../services/planillas';

export default function Planillas() {
  const [planillas, setPlanillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);

  // --- ESTADOS DEL MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState({
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear(),
    tipo_trabajador: '1057'
  });

  const cargarPlanillas = async () => {
    try {
      setLoading(true);
      const data = await getPlanillas();
      setPlanillas(data);
      setError(null);
    } catch (err) {
      setError('Error al conectar con el servidor para cargar el historial.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarPlanillas(); }, []);

  const openModal = () => {
    setFormData({
      mes: new Date().getMonth() + 1,
      anio: new Date().getFullYear(),
      tipo_trabajador: '1057'
    });
    setError(null);
    setExito(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    setExito(null);

    const mesesNombre = [
      "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
      "JULIO", "AGOSTO", "SETIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
    ];
    
    const periodoConstruido = `${mesesNombre[formData.mes - 1]} ${formData.anio}`;

    try {
      await createPlanilla({
        periodo: periodoConstruido, // <-- CORREGIDO EL TYPO
        tipo_trabajador: Number(formData.tipo_trabajador)
      });

      setExito(`¡Planilla de ${periodoConstruido} procesada y guardada con éxito!`);
      cargarPlanillas();
      setTimeout(() => setIsModalOpen(false), 1500);
    } catch (err) {
      // Si el servidor envía un mensaje de error específico (ej. "Ya existe"), lo mostramos.
      setError(err.response?.data?.detail || 'Ocurrió un error al calcular la planilla. Verifique en los registros.');
    } finally {
      setGuardando(false);
    }
  };

  const opcionesMeses = [
    { value: '1', label: 'Enero' }, { value: '2', label: 'Febrero' }, { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' }, { value: '5', label: 'Mayo' }, { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' }, { value: '8', label: 'Agosto' }, { value: '9', label: 'Setiembre' },
    { value: '10', label: 'Octubre' }, { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' }
  ];

  const opcionesRegimen = [
    { value: '1057', label: 'CAS 1057' },
    { value: '728', label: 'D.L. 728 (Obreros)' },
    { value: '276', label: 'D.L. 276 (Nombrados)' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">Nómina y Planillas Históricas</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Cálculo automatizado de boletas de pago por periodos mensuales.</p>
        </div>
        <Button onClick={openModal} className="bg-blue-600 hover:bg-blue-700 shadow-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          Procesar Nueva Planilla
        </Button>
      </div>

      {error && !isModalOpen && (
        <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-900">{error}</div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="overflow-x-auto custom-scrollbar">
          {loading ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium">Cargando historial de planillas...</div>
          ) : (
            <table className="min-w-full text-left text-sm whitespace-nowrap">
              <thead className="uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs">
                <tr>
                  <th className="px-6 py-4 font-semibold">Periodo Mensual</th>
                  <th className="px-6 py-4 font-semibold">Régimen Laboral</th>
                  <th className="px-6 py-4 font-semibold text-center">N° Boletas Procesadas</th>
                  <th className="px-6 py-4 font-semibold">Fecha de Emisión</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-800 dark:text-gray-200">
                {planillas.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400 dark:text-gray-500 italic">
                      No se han generado planillas en el sistema todavía.
                    </td>
                  </tr>
                ) : (
                  planillas.map((planilla) => (
                    <tr key={planilla.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 font-black text-gray-900 dark:text-white tracking-wide">
                        {planilla.periodo}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-100 dark:bg-gray-900 px-2.5 py-1 rounded-md text-xs font-bold border border-gray-300 dark:border-gray-700 text-blue-600 dark:text-blue-400">
                          {planilla.tipo_trabajador === 1057 ? 'CAS 1057' : planilla.tipo_trabajador === 728 ? 'D.L. 728' : 'D.L. 276'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-mono font-bold">
                        {planilla.boletas?.length || 0} Servidores
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">
                        {new Date(planilla.fecha_generacion).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <Link 
                          to={`/imprimir-boleta/${planilla.id}`}
                          className="flex items-center gap-1.5 text-emerald-700 hover:text-white bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 transition-all text-xs font-bold shadow-sm"
                          target="_blank"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                          Imprimir Lote
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-950 rounded-t-xl">
              <h2 className="text-base font-bold text-gray-800 dark:text-white">Motor de Cierre de Planilla</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 text-xs text-red-800 bg-red-50 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-lg">{error}</div>
              )}
              {exito && (
                <div className="p-3 text-xs text-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 rounded-lg">{exito}</div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Select 
                  label="Mes a calcular" id="mes" 
                  value={formData.mes} 
                  onChange={(e) => setFormData({...formData, mes: parseInt(e.target.value)})} 
                  options={opcionesMeses} 
                />
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Año</label>
                  <input 
                    type="number" 
                    value={formData.anio} 
                    onChange={(e) => setFormData({...formData, anio: parseInt(e.target.value)})}
                    className="w-full bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-800 dark:text-white outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <Select 
                label="Régimen de Trabajadores" id="tipo_trabajador" 
                value={formData.tipo_trabajador} 
                onChange={(e) => setFormData({...formData, tipo_trabajador: e.target.value})} 
                options={opcionesRegimen} 
              />

              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight bg-gray-50 dark:bg-gray-950 p-2.5 rounded-lg border border-gray-200 dark:border-gray-800">
                ⚠️ **Pene Aviso Financiero:** Al procesar, el sistema tomará la lista de personal activo en este régimen, calculará sus bonos/descuentos dinámicos actuales y consolidará las boletas de pago de forma inmutable. El proceso puede tomar unos segundos.
              </p>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} disabled={guardando}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6 font-bold" disabled={guardando}>
                  {guardando ? 'Calculando Nómina...' : 'Lanzar Motor de Cálculo'}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}