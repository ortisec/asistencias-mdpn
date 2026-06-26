from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.planilla import Planilla, Boleta, BoletaDetalle
from app.models.persona import Persona

def generar_planilla_mensual(db: Session, periodo: str, tipo_trabajador: int):
    # 1. Evitar duplicados
    planilla_existente = db.query(Planilla).filter(
        Planilla.periodo == periodo,
        Planilla.tipo_trabajador == tipo_trabajador
    ).first()
    if planilla_existente:
        raise HTTPException(status_code=400, detail=f"La planilla para {periodo} ya existe en este régimen.")

    # 2. Buscar personal activo del régimen seleccionado
    trabajadores = db.query(Persona).filter(
        Persona.tipo_trabajador == tipo_trabajador,
        Persona.is_active == True
    ).all()

    if not trabajadores:
        raise HTTPException(status_code=404, detail="No hay personal activo registrado en este régimen.")

    # 3. Iniciar maestro de planilla
    nueva_planilla = Planilla(
        periodo=periodo, 
        tipo_trabajador=tipo_trabajador,
        total_general_ingresos=0.0,
        total_general_descuentos=0.0,
        total_general_neto=0.0
    )
    db.add(nueva_planilla)
    db.flush()

    # 4. Calcular uno por uno con sus datos REALES
    for trabajador in trabajadores:
        salario_base = trabajador.salario_basico or 0.0
        
        boleta = Boleta(
            planilla_id=nueva_planilla.id,
            persona_id=trabajador.id,
            persona_nombre=trabajador.nombre_completo, # 👈 Guarda el nombre real del trabajador
            persona_dni=trabajador.dni,                 # 👈 Guarda el DNI real del trabajador
            salario_base=salario_base,
            cargo_nombre=trabajador.cargo.nombre if trabajador.cargo else "Sin Cargo",
            condicion_nombre=trabajador.condicion.nombre if trabajador.condicion else "Sin Condición",
            total_ingresos=salario_base,
            total_descuentos=0.0,
            total_aportaciones=0.0,
            neto_a_cobrar=0.0
        )
        db.add(boleta)
        db.flush()

        # Detalle del sueldo básico
        db.add(BoletaDetalle(boleta_id=boleta.id, concepto_nombre="Salario Básico Mensual", tipo="INGRESO", monto_calculado=salario_base))

        # Calcular bonos y descuentos asignados desde su ficha de personal
        for concepto in trabajador.conceptos_asignados:
            monto = concepto.valor if concepto.modo_calculo == 'FIJO' else (concepto.valor / 100) * salario_base
            monto = round(monto, 2)

            db.add(BoletaDetalle(boleta_id=boleta.id, concepto_nombre=concepto.nombre, tipo=concepto.tipo, monto_calculado=monto))

            if concepto.tipo == 'INGRESO':
                boleta.total_ingresos += monto
            elif concepto.tipo == 'DESCUENTO':
                boleta.total_descuentos += monto
            elif concepto.tipo == 'APORTACION':
                boleta.total_aportaciones += monto

        # Calcular neto del trabajador
        boleta.neto_a_cobrar = round(boleta.total_ingresos - boleta.total_descuentos, 2)

        # Acumular en el gran total del mes (Planilla)
        nueva_planilla.total_general_ingresos += boleta.total_ingresos
        nueva_planilla.total_general_descuentos += boleta.total_descuentos

    # Fuera del bucle for (el cálculo final del mes)
    nueva_planilla.total_general_neto = nueva_planilla.total_general_ingresos - nueva_planilla.total_general_descuentos
    
    db.commit()
    db.refresh(nueva_planilla)
    return nueva_planilla

def obtener_planillas(db: Session):
    return db.query(Planilla).order_by(Planilla.id.desc()).all()

def obtener_planilla_por_id(db: Session, planilla_id: int):
    return db.query(Planilla).filter(Planilla.id == planilla_id).first()