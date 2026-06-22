import { useNavigate } from 'react-router-dom';

export default function BoletaPrint() {
  const navigate = useNavigate();

  // Datos extraídos exactamente de tu PDF de ejemplo para lograr el clon perfecto
  const boletaData = {
    empleado: 'DIAZ AMPA VDA DE MESTAS LUZMILA EMILIANA', // 
    dni: '07916593', // [cite: 25]
    fechaIngreso: '16/01/2023', // [cite: 29]
    condicion: 'D. LEG 728 - OBRERO PERMANENTE\nLIMPIEZA PUBLICA - BARRIDO', // [cite: 21, 22]
    boletaNum: '2026-0994', // [cite: 24]
    planillaNum: '2026-OBR-04-077', // [cite: 27]
    periodo: 'VACACIONES\nABRIL 2026', // [cite: 30, 31]
    neto: '1,238.79', // [cite: 50]
    fechaEmision: 'Pueblo Nuevo, Jueves 30 de Abril del 2026', // [cite: 51]
    notaExtra: 'Pago de Quince (15) días de Vacaciones', // [cite: 55]
    ingresos: [
      { concepto: 'Salario Básico Mensual', monto: '512.50' }, // [cite: 44]
      { concepto: 'Asignación Familiar', monto: '0.00' }, // [cite: 44]
      { concepto: 'Decreto Supremo N° 311-2022-EF', monto: '25.56' }, // [cite: 44]
      { concepto: 'Riesgo de Salud 10%', monto: '51.25' }, // [cite: 44]
      { concepto: 'Negociacion Colect. D.S. N°313-2023-EF', monto: '25.00' }, // [cite: 44]
      { concepto: 'Negociacion Colect. D.S. N°265-2024-EF', monto: '25.00' }, // [cite: 44]
      { concepto: 'Negociacion Colect. D.S. N°279-2024-EF', monto: '50.00' }, // [cite: 44]
      { concepto: 'Negociacion Colect. D.S. N°325-2025-EF', monto: '50.00' }, // [cite: 44]
      { concepto: 'Movilid.R.A. 096-2022 y 159-2023/MDPN', monto: '142.50' }, // [cite: 44]
      { concepto: 'Vacaciones (RES. 1136-A-MDPN/2012)', monto: '440.91' } // [cite: 44]
    ],
    descuentos: [
      { concepto: 'Inasistencia', monto: '0.00' }, // [cite: 44]
      { concepto: 'Tardanzas', monto: '0.00' }, // [cite: 44]
      { concepto: 'SNP 13.00 %', monto: '0.00' }, // [cite: 44]
      { concepto: 'AFP Integra 12.92 %', monto: '0.00' }, // [cite: 44]
      { concepto: 'AFP Integra (Mixta) 11.37 %', monto: '73.93' }, // [cite: 44]
      { concepto: 'AFP Profuturo 13.06 %', monto: '0.00' }, // [cite: 44]
      { concepto: 'AFP Profuturo (Mixta) 11.37 %', monto: '0.00' }, // [cite: 44]
      { concepto: 'AFP Prima (Mixta) 11.37 %', monto: '0.00' }, // [cite: 44]
      { concepto: 'AFP Habitat (Mixta) 11.37 %', monto: '0.00' }, // [cite: 44]
      { concepto: 'Descuento Judicial', monto: '0.00' }, // [cite: 44]
      { concepto: 'Descuento Sindical', monto: '10.00' }, // [cite: 44]
      { concepto: 'Cooperativa Interfinco', monto: '0.00' }, // [cite: 44]
      { concepto: 'Coop. Ahor y Cred. San Miguel', monto: '0.00' }, // [cite: 44]
      { concepto: 'Coop. Ahor y Cred. La Rehabilitadora', monto: '0.00' }, // [cite: 44]
      { concepto: 'Cooperativa EL TUMI', monto: '0.00' } // [cite: 44]
    ],
    aportaciones: [
      { concepto: 'ESSALUD 9 %', monto: '66.54' } // [cite: 44]
    ],
    totalIngresos: '1,322.72', // [cite: 44]
    totalDescuentos: '83.93', // [cite: 44]
    totalAportaciones: '66.54' // [cite: 44]
  };

  // Componente que dibuja UNA sola mitad (Una Boleta A5)
  const BoletaMitad = ({ tituloCargo }) => (
    <div className="w-1/2 h-full flex flex-col p-4 text-[9px] uppercase font-sans text-black relative">
      
      {/* Etiqueta pequeña para saber cuál es cuál */}
      <div className="absolute top-2 right-4 text-[7px] text-gray-500 font-bold">{tituloCargo}</div>

      {/* CABECERA */}
      <div className="text-center pb-2 mb-2">
        <h1 className="font-bold text-xs leading-tight">MUNICIPALIDAD DISTRITAL DE PUEBLO NUEVO</h1>
        <p className="text-[8px]">Av. Mariscal Oscar R. Benavides N° 699 - Plaza de Armas</p>
        <p className="text-[8px]">Telefono: (056) 265459 - (056) 262301</p>
        <p className="font-bold text-[8px]">RUC: 20147676574</p>
      </div>

      <h2 className="text-center font-bold text-sm tracking-widest mb-2 border-y border-black py-1 bg-[#fcfcda]/50">BOLETA DE PAGO</h2>

      {/* DATOS DEL EMPLEADO Y LABORALES */}
      <div className="grid grid-cols-4 gap-x-2 gap-y-1 mb-2 border-2 border-black p-1">
        <div className="col-span-3">
          <p className="font-bold text-[7px]">Apellidos y Nombres</p>
          <p className="font-bold text-[10px]">{boletaData.empleado}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-[7px]">UNIDAD DE RECURSOS HUMANOS</p>
        </div>
        
        <div className="col-span-2 border-t border-black pt-1">
          <p className="font-bold text-[7px]">Condicion Laboral</p>
          <p className="whitespace-pre-wrap leading-tight">{boletaData.condicion}</p>
        </div>
        <div className="border-t border-black pt-1">
          <p className="font-bold text-[7px]">Boleta de Pago N°</p>
          <p className="font-bold">{boletaData.boletaNum}</p>
          <p className="font-bold text-[7px] mt-1">DNI</p>
          <p className="font-bold">{boletaData.dni}</p>
        </div>
        <div className="border-t border-black pt-1">
          <p className="font-bold text-[7px]">Planilla de Pago N°</p>
          <p className="font-bold">{boletaData.planillaNum}</p>
          <p className="font-bold text-[7px] mt-1">Fecha de Ingreso</p>
          <p className="font-bold">{boletaData.fechaIngreso}</p>
        </div>
      </div>

      <div className="text-center border-x-2 border-t-2 border-black bg-[#fcfcda]/50 py-0.5 font-bold">
        Periodo de Pago: {boletaData.periodo.replace('\n', ' ')}
      </div>

      {/* CUERPO: INGRESOS | DESCUENTOS | APORTES */}
      <div className="flex-1 grid grid-cols-3 border-2 border-black mb-2">
        {/* INGRESOS */}
        <div className="border-r border-black flex flex-col">
          <div className="bg-[#fcfcda]/50 border-b border-black text-center font-bold py-1">INGRESOS</div>
          <div className="p-1 flex-1 text-[8px] leading-tight space-y-0.5">
            {boletaData.ingresos.map((item, i) => (
              <div key={`ing-${i}`} className="flex justify-between"><span>{item.concepto}</span><span>{item.monto}</span></div>
            ))}
          </div>
          <div className="border-t border-black bg-gray-100 flex justify-between font-bold p-1">
            <span>Total de Remuneracion</span><span>{boletaData.totalIngresos}</span>
          </div>
        </div>
        
        {/* DESCUENTOS */}
        <div className="border-r border-black flex flex-col">
          <div className="bg-[#fcfcda]/50 border-b border-black text-center font-bold py-1">DESCUENTOS</div>
          <div className="p-1 flex-1 text-[8px] leading-tight space-y-0.5">
            {boletaData.descuentos.map((item, i) => (
              <div key={`desc-${i}`} className="flex justify-between"><span>{item.concepto}</span><span>{item.monto}</span></div>
            ))}
          </div>
          <div className="border-t border-black bg-gray-100 flex justify-between font-bold p-1">
            <span>Total Descuentos</span><span>{boletaData.totalDescuentos}</span>
          </div>
        </div>

        {/* APORTACIONES */}
        <div className="flex flex-col">
          <div className="bg-[#fcfcda]/50 border-b border-black text-center font-bold py-1">APORTACIONES</div>
          <div className="p-1 flex-1 text-[8px] leading-tight space-y-0.5">
            {boletaData.aportaciones.map((item, i) => (
              <div key={`apor-${i}`} className="flex justify-between"><span>{item.concepto}</span><span>{item.monto}</span></div>
            ))}
          </div>
          <div className="border-t border-black bg-gray-100 flex justify-between font-bold p-1">
            <span>Total Aportaciones</span><span>{boletaData.totalAportaciones}</span>
          </div>
        </div>
      </div>

      {/* FOOTER: NETO Y FIRMAS */}
      <div className="grid grid-cols-2 gap-4 mb-2">
        <div className="border-2 border-black flex flex-col">
          <div className="bg-[#fcfcda]/50 border-b border-black text-center font-bold py-1">NETO A COBRAR</div>
          <div className="text-center font-bold text-sm py-2 flex-1 flex items-center justify-center bg-gray-100">
            S/. {boletaData.neto}
          </div>
        </div>
        <div className="flex flex-col justify-end">
          <p className="text-center font-bold text-[8px] mb-0.5 border-b border-black">Fecha de emisión</p>
          <div className="text-center font-bold py-1">
            {boletaData.fechaEmision}
          </div>
        </div>
      </div>

      {/* NOTA LEGAL Y EXTRA */}
      <div className="text-[6.5px] text-justify leading-tight mb-6 text-gray-800">
        Por la presente autorizo a mi Empleador, el descuento por planillas y/o beneficios sociales por Mandato judiciales, convenios interinstitucionales, pagos indebidos y/o en exceso, y de acuerdo al literal a) del artículo 34 de la Ley N° 30057, Planilla Única de pago, a operaciones efectuadas por fondos y conceptos de bienestar y por entidades supervisadas y/o reguladas por la Superintendencia de Banca, Seguros y AFP. [cite: 54]
        <br/><br/>
        <span className="font-bold text-[8px] italic">{boletaData.notaExtra}</span>
      </div>

      {/* FIRMAS */}
      <div className="grid grid-cols-2 mt-auto text-center font-bold pb-2">
        <div className="border-t border-black pt-1 mx-6 text-[8px]">SELLO Y FIRMA DEL AUTORIZADO</div>
        <div className="border-t border-black pt-1 mx-6 text-[8px]">FIRMA DEL SERVIDOR</div>
      </div>
    </div>
  );

  return (
    <>
      {/* MAGIA CSS: Forzamos el navegador a imprimir en A4 Apaisado y quitamos márgenes */}
      <style>
        {`
          @media print {
            @page { size: A4 landscape; margin: 0; }
            body { margin: 0; padding: 0; background-color: white; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
        `}
      </style>

      <div className="min-h-screen bg-gray-600 p-8 print:p-0 print:bg-white flex flex-col items-center justify-center">
        
        {/* Botonera Flotante (Desaparece al imprimir) */}
        <div className="w-full max-w-[29.7cm] flex justify-between items-center mb-6 print:hidden">
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-800 text-white rounded shadow-lg hover:bg-gray-700 transition-colors">
            ← Volver a Planillas
          </button>
          <button onClick={() => window.print()} className="px-6 py-2 bg-blue-600 text-white font-bold rounded shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Imprimir Original y Copia
          </button>
        </div>

        {/* CONTENEDOR FÍSICO A4 HORIZONTAL (Izquierda y Derecha) */}
        <div className="bg-white w-[29.7cm] h-[21cm] shadow-2xl print:shadow-none flex flex-row overflow-hidden border print:border-none">
          
          {/* Lado Izquierdo */}
          <BoletaMitad tituloCargo="ORIGINAL - TRABAJADOR" />
          
          {/* Línea divisoria central con tijeras */}
          <div className="h-full border-l-2 border-dashed border-gray-400 flex flex-col items-center justify-center relative">
            <svg className="w-4 h-4 text-gray-400 absolute bg-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2-2m0 0L5 5m5 5l2 2m-2-2l-2 2m0 0L5 19" /></svg>
          </div>
          
          {/* Lado Derecho */}
          <BoletaMitad tituloCargo="COPIA - RR.HH." />

        </div>
      </div>
    </>
  );
}