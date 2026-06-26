import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPlanillaById } from '../../services/planillas';

export default function BoletaPrint() {
  const navigate = useNavigate();
  const { id } = useParams(); 
  
  const [planilla, setPlanilla] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDatosPlanilla = async () => {
      try {
        setLoading(true);
        const data = await getPlanillaById(id);
        setPlanilla(data);
      } catch (err) {
        setError('No se pudo cargar la información del lote de boletas.');
      } finally {
        setLoading(false);
      }
    };
    cargarDatosPlanilla();
  }, [id]);

  const formatMoneda = (monto) => monto.toFixed(2);

  const generarFechaEmision = (fechaGeneracion) => {
    const fecha = new Date(fechaGeneracion);
    const opciones = { day: 'numeric', month: 'long', year: 'numeric' };
    return `Pueblo Nuevo, ${fecha.toLocaleDateString('es-PE', opciones)}`;
  };

  // 👇 AÑADIDO: Recibimos planillaId directamente
  const BoletaMitad = ({ tituloCargo, boletaReal, periodoPlanilla, fechaEmision, planillaId }) => {
    
    const ingresos = boletaReal.detalles.filter(d => d.tipo === 'INGRESO');
    const descuentos = boletaReal.detalles.filter(d => d.tipo === 'DESCUENTO');
    const aportaciones = boletaReal.detalles.filter(d => d.tipo === 'APORTACION');

    return (
      <div className="w-1/2 h-full flex flex-col p-4 text-[9px] uppercase font-sans text-black relative bg-white">
        
        <div className="absolute top-2 right-4 text-[7px] text-gray-500 font-bold">{tituloCargo}</div>

        <div className="text-center pb-2 mb-2">
          <h1 className="font-bold text-xs leading-tight">MUNICIPALIDAD DISTRITAL DE PUEBLO NUEVO</h1>
          <p className="text-[8px]">Av. Mariscal Oscar R. Benavides N° 699 - Plaza de Armas</p>
          <p className="text-[8px]">Telefono: (056) 265459 - (056) 262301</p>
          <p className="font-bold text-[8px]">RUC: 20147676574</p>
        </div>

        <h2 className="text-center font-bold text-sm tracking-widest mb-2 border-y border-black py-1 bg-[#fcfcda]/50">BOLETA DE PAGO</h2>

        <div className="grid grid-cols-4 gap-x-2 gap-y-1 mb-2 border-2 border-black p-1">
          <div className="col-span-3">
            <p className="font-bold text-[7px]">Apellidos y Nombres</p>
            <p className="font-bold text-[10px] text-blue-900">{boletaReal.persona_nombre}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-[7px]">UNIDAD DE RECURSOS HUMANOS</p>
          </div>
          
          <div className="col-span-2 border-t border-black pt-1">
            <p className="font-bold text-[7px]">Condicion Laboral y Cargo</p>
            <p className="leading-tight font-bold">{boletaReal.condicion_nombre}</p>
            <p className="leading-tight">{boletaReal.cargo_nombre}</p>
          </div>
          <div className="border-t border-black pt-1">
            <p className="font-bold text-[7px]">Boleta de Pago N°</p>
            {/* Protección por si el ID de la boleta demora en cargar */}
            <p className="font-bold">2026-{boletaReal.id?.toString().padStart(4, '0')}</p>
            <p className="font-bold text-[7px] mt-1">DNI</p>
            <p className="font-bold">{boletaReal.persona_dni}</p>
          </div>
          <div className="border-t border-black pt-1">
            <p className="font-bold text-[7px]">Planilla de Pago N°</p>
            {/* 👇 CORRECCIÓN: Usamos el planillaId seguro que le pasamos */}
            <p className="font-bold">PL-{planillaId?.toString().padStart(4, '0')}</p>
          </div>
        </div>

        <div className="text-center border-x-2 border-t-2 border-black bg-[#fcfcda]/50 py-0.5 font-bold">
          Periodo de Pago: {periodoPlanilla}
        </div>

        <div className="flex-1 grid grid-cols-3 border-2 border-black mb-2">
          <div className="border-r border-black flex flex-col">
            <div className="bg-[#fcfcda]/50 border-b border-black text-center font-bold py-1">INGRESOS</div>
            <div className="p-1 flex-1 text-[8px] leading-tight space-y-0.5">
              {ingresos.map(item => (
                <div key={item.id} className="flex justify-between"><span>{item.concepto_nombre}</span><span>{formatMoneda(item.monto_calculado)}</span></div>
              ))}
            </div>
            <div className="border-t border-black bg-gray-100 flex justify-between font-bold p-1">
              <span>Total de Remuneracion</span><span>{formatMoneda(boletaReal.total_ingresos)}</span>
            </div>
          </div>
          
          <div className="border-r border-black flex flex-col">
            <div className="bg-[#fcfcda]/50 border-b border-black text-center font-bold py-1">DESCUENTOS</div>
            <div className="p-1 flex-1 text-[8px] leading-tight space-y-0.5">
              {descuentos.map(item => (
                <div key={item.id} className="flex justify-between text-red-700"><span>{item.concepto_nombre}</span><span>{formatMoneda(item.monto_calculado)}</span></div>
              ))}
            </div>
            <div className="border-t border-black bg-gray-100 flex justify-between font-bold p-1">
              <span>Total Descuentos</span><span>{formatMoneda(boletaReal.total_descuentos)}</span>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="bg-[#fcfcda]/50 border-b border-black text-center font-bold py-1">APORTACIONES (EMPLEADOR)</div>
            <div className="p-1 flex-1 text-[8px] leading-tight space-y-0.5">
              {aportaciones.map(item => (
                <div key={item.id} className="flex justify-between text-blue-800"><span>{item.concepto_nombre}</span><span>{formatMoneda(item.monto_calculado)}</span></div>
              ))}
            </div>
            <div className="border-t border-black bg-gray-100 flex justify-between font-bold p-1">
              <span>Total Aportaciones</span><span>{formatMoneda(boletaReal.total_aportaciones)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="border-2 border-black flex flex-col">
            <div className="bg-[#fcfcda]/50 border-b border-black text-center font-bold py-1">NETO A COBRAR</div>
            <div className="text-center font-bold text-sm py-2 flex-1 flex items-center justify-center bg-gray-100 text-green-800">
              S/. {formatMoneda(boletaReal.neto_a_cobrar)}
            </div>
          </div>
          <div className="flex flex-col justify-end">
            <p className="text-center font-bold text-[8px] mb-0.5 border-b border-black">Fecha de emisión</p>
            <div className="text-center font-bold py-1 text-gray-700">
              {fechaEmision}
            </div>
          </div>
        </div>

        <div className="text-[6.5px] text-justify leading-tight mb-6 text-gray-800">
          Por la presente autorizo a mi Empleador, el descuento por planillas y/o beneficios sociales por Mandato judiciales, convenios interinstitucionales, pagos indebidos y/o en exceso, y de acuerdo al literal a) del artículo 34 de la Ley N° 30057, Planilla Única de pago, a operaciones efectuadas por fondos y conceptos de bienestar y por entidades supervisadas y/o reguladas por la Superintendencia de Banca, Seguros y AFP.
        </div>

        <div className="grid grid-cols-2 mt-auto text-center font-bold pb-2">
          <div className="border-t border-black pt-1 mx-6 text-[8px]">SELLO Y FIRMA DEL AUTORIZADO</div>
          <div className="border-t border-black pt-1 mx-6 text-[8px]">FIRMA DEL SERVIDOR</div>
        </div>
      </div>
    );
  };


  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white font-bold">Cargando lote de impresión...</div>;
  if (error) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-500 font-bold">{error}</div>;
  if (!planilla || planilla.boletas.length === 0) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-400 font-bold">Esta planilla está vacía. No hay boletas para imprimir.</div>;

  const fechaImpresion = generarFechaEmision(planilla.fecha_generacion);

  return (
    <>
      <style>
        {`
          @media print {
            @page { size: A4 landscape; margin: 0; }
            body { margin: 0; padding: 0; background-color: white; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .salto-pagina { page-break-after: always; }
          }
        `}
      </style>

      <div className="min-h-screen bg-gray-900 p-8 print:p-0 print:bg-white flex flex-col items-center justify-start">
        
        <div className="w-full max-w-[29.7cm] flex justify-between items-center mb-6 print:hidden sticky top-4 z-50 bg-gray-800/80 backdrop-blur-md p-4 rounded-xl border border-gray-700 shadow-2xl">
          <div className="flex flex-col">
            <h1 className="text-white font-bold tracking-widest uppercase">Lote: {planilla.periodo}</h1>
            <span className="text-gray-400 text-xs">{planilla.boletas.length} Boletas procesadas</span>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate(-1)} className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors font-bold text-sm">
              Volver
            </button>
            <button onClick={() => window.print()} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg shadow-[0_0_15px_rgba(5,150,105,0.4)] hover:bg-emerald-700 transition-colors flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Imprimir Lote Completo
            </button>
          </div>
        </div>

        {planilla.boletas.map((boleta, index) => (
          <div key={boleta.id} className={`bg-white w-[29.7cm] h-[21cm] shadow-2xl print:shadow-none flex flex-row overflow-hidden border print:border-none mb-8 print:mb-0 ${index !== planilla.boletas.length - 1 ? 'salto-pagina' : ''}`}>
            
            <BoletaMitad 
              tituloCargo="ORIGINAL - TRABAJADOR" 
              boletaReal={boleta} 
              periodoPlanilla={planilla.periodo} 
              fechaEmision={fechaImpresion} 
              planillaId={planilla.id} /* 👇 Pasamos el ID directamente */
            />
            
            <div className="h-full border-l border-dashed border-gray-300 flex flex-col items-center justify-center relative">
              <svg className="w-3 h-3 text-gray-300 absolute bg-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2-2m0 0L5 5m5 5l2 2m-2-2l-2 2m0 0L5 19" /></svg>
            </div>
            
            <BoletaMitad 
              tituloCargo="COPIA - RR.HH." 
              boletaReal={boleta} 
              periodoPlanilla={planilla.periodo} 
              fechaEmision={fechaImpresion}
              planillaId={planilla.id} /* 👇 Pasamos el ID directamente */
            />

          </div>
        ))}
      </div>
    </>
  );
}