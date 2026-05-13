from sqlalchemy.orm import Session
from datetime import time
from app.models.configuracion import ConfiguracionHorario, Feriado
from app.schemas.configuracion import ConfiguracionHorarioUpdate, FeriadoCreate

# --- CRUD HORARIOS ---
def get_horarios(db: Session):
    horarios = db.query(ConfiguracionHorario).all()
    
    # Si la tabla está vacía, creamos los 3 regímenes por defecto
    if not horarios:
        regimenes_default = [1057, 728, 276]
        for reg in regimenes_default:
            nuevo_horario = ConfiguracionHorario(
                regimen=reg,
                es_horario_partido=True, # Por defecto todos empiezan en partido
                hora_ingreso_manana=time(8, 0),
                minutos_tolerancia_manana=15,
                hora_salida_manana=time(13, 0),
                hora_ingreso_tarde=time(14, 0),
                minutos_tolerancia_tarde=15,
                hora_salida_tarde=time(17, 0)
            )
            db.add(nuevo_horario)
        db.commit()
        horarios = db.query(ConfiguracionHorario).all()
        
    return horarios

def update_horario_regimen(db: Session, regimen: int, config_in: ConfiguracionHorarioUpdate):
    horario = db.query(ConfiguracionHorario).filter(ConfiguracionHorario.regimen == regimen).first()
    if horario:
        update_data = config_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(horario, key, value)
        db.commit()
        db.refresh(horario)
    return horario

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