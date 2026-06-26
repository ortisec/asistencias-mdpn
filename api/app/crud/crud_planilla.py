from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.planilla import Planilla, Boleta, BoletaDetalle
from app.models.persona import Persona

def generar_planilla_mensual(db: Session, periodo: str, tipo_trabajador: int):
    # 1. Validar que no exista ya una planilla para ese mes y ese régimen
    planilla_existente = db.query(Planilla).filter(
        Planilla.periodo == periodo,
        Planilla.tipo_trabajador == tipo_trabajador
    ).first()
    
    if planilla_existente:
        raise HTTPException(status_code=400, detail=f"La planilla para el periodo '{periodo}' en este régimen ya fue generada.")

    # 2. Obtener todos los trabajadores ACTIVOS de ese régimen
    trabajadores = db.query(Persona).filter(
        Persona.tipo_trabajador == tipo_trabajador,
        Persona.is_active == True
    ).all()

    if not trabajadores:
        raise HTTPException(status_code=404, detail="No hay trabajadores activos registrados en este régimen para generar boletas.")

    # 3. Crear el registro principal de la Planilla
    nueva_planilla = Planilla(periodo=periodo, tipo_trabajador=tipo_trabajador)
    db.add(nueva_planilla)
    db.flush() # flush para obtener el ID de la planilla sin hacer commit todavía

    # 4. El Motor de Cálculo iterando por cada trabajador
    for trabajador in trabajadores:
        salario_base = trabajador.salario_basico or 0.0
        
        # Iniciar la boleta
        boleta = Boleta(
            planilla_id=nueva_planilla.id,
            persona_id=trabajador.id,
            salario_base=salario_base,
            cargo_nombre=trabajador.cargo.nombre if trabajador.cargo else None,
            condicion_nombre=trabajador.condicion.nombre if trabajador.condicion else None,
            total_ingresos=salario_base, # El salario base siempre cuenta como el primer ingreso
            total_descuentos=0.0,
            total_aportaciones=0.0
        )
        db.add(boleta)
        db.flush()

        # Insertar el salario base como el primer detalle visual de ingresos
        detalle_base = BoletaDetalle(
            boleta_id=boleta.id,
            concepto_nombre="Salario Básico Mensual",
            tipo="INGRESO",
            monto_calculado=salario_base
        )
        db.add(detalle_base)

        # 5. Calcular los bonos y descuentos asignados al trabajador
        for concepto in trabajador.conceptos_asignados:
            # Lógica matemática: Fijo o Porcentaje del básico
            monto = concepto.valor if concepto.modo_calculo == 'FIJO' else (concepto.valor / 100) * salario_base
            monto = round(monto, 2)

            detalle = BoletaDetalle(
                boleta_id=boleta.id,
                concepto_nombre=concepto.nombre,
                tipo=concepto.tipo,
                monto_calculado=monto
            )
            db.add(detalle)

            # Acumular en los totales correspondientes
            if concepto.tipo == 'INGRESO':
                boleta.total_ingresos += monto
            elif concepto.tipo == 'DESCUENTO':
                boleta.total_descuentos += monto
            elif concepto.tipo == 'APORTACION':
                boleta.total_aportaciones += monto

        # 6. Calcular el neto final (Ingresos totales - Descuentos totales)
        boleta.neto_a_cobrar = boleta.total_ingresos - boleta.total_descuentos

    # 7. Guardar toda la transacción junta
    db.commit()
    db.refresh(nueva_planilla)
    return nueva_planilla

def obtener_planillas(db: Session):
    return db.query(Planilla).order_by(Planilla.id.desc()).all()

def obtener_planilla_por_id(db: Session, planilla_id: int):
    return db.query(Planilla).filter(Planilla.id == planilla_id).first()