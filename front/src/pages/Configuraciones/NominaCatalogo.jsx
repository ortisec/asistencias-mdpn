// src/pages/Configuraciones/NominaCatalogo.jsx
export const NominaCatalogo = ({ datos, onUpdate }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* PANEL CARGOS */}
      <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
        <h3 className="font-bold text-white mb-3">Cargos</h3>
        {/* Formulario e lista de cargos */}
      </div>

      {/* PANEL CONDICIONES */}
      <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
        <h3 className="font-bold text-white mb-3">Condiciones</h3>
        {/* Formulario e lista de condiciones */}
      </div>

      {/* PANEL CONCEPTOS */}
      <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 col-span-1 lg:col-span-3">
        <h3 className="font-bold text-white mb-3">Conceptos de Nómina</h3>
        {/* Tabla de conceptos */}
      </div>
    </div>
  );
};