from sqlalchemy.orm import Session
from app.models.planilla import Planilla, Boleta, BoletaDetalle
from app.schemas.planilla import PlanillaCreate

def get_planillas(db: Session):
    return db.query(Planilla).order_by(Planilla.id.desc()).all()

def get_planilla_by_id(db: Session, planilla_id: int):
    return db.query(Planilla).filter(Planilla.id == planilla_id).first()

def crear_planilla_completa(db: Session, planilla_in: PlanillaCreate):
    # 1. Creamos la cabecera de la Planilla
    db_planilla = Planilla(
        periodo=planilla_in.periodo,
        condicion_laboral=planilla_in.condicion_laboral
    )
    db.add(db_planilla)
    db.flush() # flush() obtiene el ID de la planilla sin hacer commit final todavía

    # 2. Iteramos sobre las boletas enviadas
    for boleta_data in planilla_in.boletas:
        db_boleta = Boleta(
            planilla_id=db_planilla.id,
            persona_id=boleta_data.persona_id,
            dias_laborados=boleta_data.dias_laborados,
            faltas=boleta_data.faltas,
            minutos_tardanza=boleta_data.minutos_tardanza,
            total_ingresos=boleta_data.total_ingresos,
            total_descuentos=boleta_data.total_descuentos,
            total_aportaciones=boleta_data.total_aportaciones,
            neto_pagar=boleta_data.neto_pagar
        )
        db.add(db_boleta)
        db.flush()

        # 3. Iteramos sobre los conceptos (detalles) de cada boleta
        for detalle_data in boleta_data.detalles:
            db_detalle = BoletaDetalle(
                boleta_id=db_boleta.id,
                tipo=detalle_data.tipo,
                concepto=detalle_data.concepto,
                monto=detalle_data.monto
            )
            db.add(db_detalle)

    # Si todo se guardó correctamente en memoria, aplicamos el commit final a las 3 tablas
    db.commit()
    db.refresh(db_planilla)
    return db_planilla