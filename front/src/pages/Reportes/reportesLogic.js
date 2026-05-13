import * as XLSX from 'xlsx';

export const formatearFecha = (fechaIso) => {
  if (!fechaIso) return '---';
  return new Date(fechaIso).toLocaleString('es-PE', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
};

export const getColorTurno = (turno) => {
  if (turno === 'Mañana') return 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400 border border-sky-200 dark:border-sky-800';
  if (turno === 'Tarde') return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800';
  return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
};

export const analizarAsistencia = (ingresoISO, salidaISO, horariosConfig, feriadosSet) => {
  if (!ingresoISO) return { turno: '---', minutos_tardanza: 0, tiempoTrabajado: '---', es_feriado: false };
  const ingreso = new Date(ingresoISO);
  const hora = ingreso.getHours();
  const tiempoEnMinutos = hora * 60 + ingreso.getMinutes(); 
  const fechaSoloDia = ingresoISO.split('T')[0]; 
  const es_feriado = feriadosSet.has(fechaSoloDia);

  let turno = ''; let minutos_tardanza = 0; let tiempoTrabajado = 'En curso';

  const timeToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  if (hora < 13) {
    turno = 'Mañana';
    const meta = timeToMinutes(horariosConfig.hora_ingreso_manana);
    const tolerancia = horariosConfig.minutos_tolerancia_manana;
    if (!es_feriado && tiempoEnMinutos > (meta + tolerancia)) minutos_tardanza = tiempoEnMinutos - meta;
  } else {
    turno = 'Tarde';
    const meta = timeToMinutes(horariosConfig.hora_ingreso_tarde);
    const tolerancia = horariosConfig.minutos_tolerancia_tarde;
    if (!es_feriado && tiempoEnMinutos > (meta + tolerancia)) minutos_tardanza = tiempoEnMinutos - meta;
  }

  if (salidaISO) {
    const salida = new Date(salidaISO);
    const diferenciaMs = salida - ingreso;
    const horasTrabajadas = Math.floor(diferenciaMs / (1000 * 60 * 60));
    const minutosTrabajados = Math.floor((diferenciaMs % (1000 * 60 * 60)) / (1000 * 60));
    tiempoTrabajado = `${horasTrabajadas}h ${minutosTrabajados}m`;
  }
  return { turno, minutos_tardanza, tiempoTrabajado, es_feriado };
};

export const calcularRanking = (personasData, asistenciasData, feriadosSet, fechaInicioFiltro, fechaFinFiltro) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Convertimos las fechas del filtro a objetos Date (si existen)
  const fInicioRango = fechaInicioFiltro ? new Date(`${fechaInicioFiltro}T00:00:00`) : null;
  const fFinRango = fechaFinFiltro ? new Date(`${fechaFinFiltro}T00:00:00`) : hoy;
  
  // No podemos calcular faltas en el futuro, así que el tope máximo es hoy
  if (fFinRango > hoy) fFinRango.setTime(hoy.getTime());

  const ranking = personasData
    .filter(p => p.is_active && p.fecha_inicio_labores)
    .map(persona => {
      let diasEsperados = 0;
      let diasAsistidos = 0;
      let fechasFaltas = [];

      const diasLaborables = persona.dias_laborables ? persona.dias_laborables.split(',').map(Number) : [1,2,3,4,5];
      const fechaInicioContrato = new Date(`${persona.fecha_inicio_labores}T00:00:00`);

      // La fecha de inicio del cálculo será la mayor entre su inicio de contrato y el filtro que puso RR.HH.
      let fechaArranqueMatematico = new Date(fechaInicioContrato);
      if (fInicioRango && fInicioRango > fechaArranqueMatematico) {
        fechaArranqueMatematico = new Date(fInicioRango);
      }

      const asistenciasPersona = asistenciasData.filter(a => a.persona_id === persona.id);
      const fechasAsistidas = new Set(asistenciasPersona.map(a => a.fecha_ingreso.split('T')[0]));

      // Recorremos el calendario solo en el rango solicitado
      for (let d = new Date(fechaArranqueMatematico); d <= fFinRango; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay(); 
        const dateStr = d.toISOString().split('T')[0];

        if (diasLaborables.includes(dayOfWeek) && !feriadosSet.has(dateStr)) {
          diasEsperados++;
          if (fechasAsistidas.has(dateStr)) diasAsistidos++;
          else fechasFaltas.push(dateStr); 
        }
      }

      const porcentaje = diasEsperados === 0 ? 100 : Math.round((diasAsistidos / diasEsperados) * 100);

      return { ...persona, diasEsperados, diasAsistidos, faltas: diasEsperados - diasAsistidos, fechasFaltas, porcentaje };
    });

  return ranking.sort((a, b) => b.faltas - a.faltas);
};

export const generarExcel = (activeTab, datosFiltrados, rankingFiltrado) => {
  let datosParaExcel = [];
  let nombreHoja = "";

  if (activeTab === 'diario') {
    datosParaExcel = datosFiltrados.map(item => ({
      'DNI': item.dni, 'Nombre del Empleado': item.nombre_completo, 'Régimen': item.regimen.toString() === '1057' ? 'CAS' : `D.L. ${item.regimen}`,
      'Turno': item.turno, 'Feriado': item.es_feriado ? 'SÍ' : 'NO', 'Ingreso': formatearFecha(item.fecha_ingreso),
      'Min Tardanza': item.minutos_tardanza, 'Salida': formatearFecha(item.fecha_salida), 'Horas Trab.': item.tiempo_trabajado
    }));
    nombreHoja = "Reporte_Diario";
  } else {
    datosParaExcel = rankingFiltrado.map(item => ({
      'DNI': item.dni, 'Nombre del Empleado': item.nombre_completo, 'Inicio Labores': item.fecha_inicio_labores,
      'Días Esperados': item.diasEsperados, 'Días Asistidos': item.diasAsistidos, 'Faltas Totales': item.faltas,
      'Porcentaje Asistencia': `${item.porcentaje}%`, 'Fechas de Faltas': item.fechasFaltas.join(', ')
    }));
    nombreHoja = "Ranking_Inasistencias";
  }

  const hoja = XLSX.utils.json_to_sheet(datosParaExcel);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, nombreHoja);
  XLSX.writeFile(libro, `RRHH_${nombreHoja}_${new Date().toISOString().split('T')[0]}.xlsx`);
};