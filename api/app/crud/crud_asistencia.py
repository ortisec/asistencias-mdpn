from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.asistencia import Asistencia
from app.schemas.asistencia import AsistenciaCreate

def get_asistencias(db: Session):
    return db.query(Asistencia).all()

def crear_asistencia(db: Session, asistencia: AsistenciaCreate):
    db_asistencia = Asistencia(
        persona_id=asistencia.persona_id,
        # CORREGIDO: Si no envían fecha, tomamos la hora actual exacta automáticamente
        fecha_ingreso=asistencia.fecha_ingreso if asistencia.fecha_ingreso else datetime.now(timezone.utc)
    )
    db.add(db_asistencia)
    db.commit()
    db.refresh(db_asistencia)
    return db_asistencia

def marcar_salida(db: Session, asistencia_id: int):
    # Buscamos la asistencia por su ID
    db_asistencia = db.query(Asistencia).filter(Asistencia.id == asistencia_id).first()
    
    # Si existe y no tiene fecha de salida asignada, la actualizamos
    if db_asistencia and not db_asistencia.fecha_salida:
        # Usamos la hora actual exacta
        db_asistencia.fecha_salida = datetime.now(timezone.utc)
        db.commit()
        db.refresh(db_asistencia)
        
    return db_asistencia

def update_asistencia_manual(db: Session, asistencia_id: int, datos_actualizar: dict):
    db_asistencia = db.query(Asistencia).filter(Asistencia.id == asistencia_id).first()
    if db_asistencia:
        for key, value in datos_actualizar.items():
            setattr(db_asistencia, key, value)
        db.commit()
        db.refresh(db_asistencia)
    return db_asistencia