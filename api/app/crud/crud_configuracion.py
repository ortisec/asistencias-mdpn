from sqlalchemy.orm import Session
from datetime import time
from app.models.configuracion import ConfiguracionHorario, Feriado
from app.schemas.configuracion import ConfiguracionHorarioUpdate, FeriadoCreate

# --- CRUD HORARIOS ---
def get_configuracion(db: Session):
    config = db.query(ConfiguracionHorario).first()
    if not config:
        # Si la base de datos está vacía, creamos la configuración por defecto
        config = ConfiguracionHorario(
            hora_ingreso_manana=time(8, 0),
            minutos_tolerancia_manana=15,
            hora_salida_manana=time(13, 0),
            hora_ingreso_tarde=time(14, 0),
            minutos_tolerancia_tarde=15,
            hora_salida_tarde=time(17, 0)
        )
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

def update_configuracion(db: Session, config_in: ConfiguracionHorarioUpdate):
    config = get_configuracion(db) # Obtenemos la única fila
    
    update_data = config_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(config, key, value)
        
    db.commit()
    db.refresh(config)
    return config

# --- CRUD FERIADOS ---
def get_feriados(db: Session):
    return db.query(Feriado).order_by(Feriado.fecha.desc()).all()

def crear_feriado(db: Session, feriado: FeriadoCreate):
    db_feriado = Feriado(fecha=feriado.fecha, motivo=feriado.motivo)
    db.add(db_feriado)
    db.commit()
    db.refresh(db_feriado)
    return db_feriado

def eliminar_feriado(db: Session, feriado_id: int):
    db_feriado = db.query(Feriado).filter(Feriado.id == feriado_id).first()
    if db_feriado:
        db.delete(db_feriado)
        db.commit()
    return db_feriado