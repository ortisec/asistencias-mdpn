from sqlalchemy import Column, Integer, String, Time, Date, Boolean
from app.db.base import Base

class ConfiguracionHorario(Base):
    __tablename__ = "configuracion_horarios"

    id = Column(Integer, primary_key=True, index=True)
    regimen = Column(Integer, unique=True, nullable=False) # Guardará 1057, 728 o 276
    es_horario_partido = Column(Boolean, default=True) # True = Partido, False = Corrido
    
    # Turno Mañana (o Turno Único si es corrido)
    hora_ingreso_manana = Column(Time, nullable=False)
    minutos_tolerancia_manana = Column(Integer, default=15)
    hora_salida_manana = Column(Time, nullable=False)
    
    # Turno Tarde (Solo se usará si es_horario_partido es True)
    hora_ingreso_tarde = Column(Time, nullable=True)
    minutos_tolerancia_tarde = Column(Integer, nullable=True, default=15)
    hora_salida_tarde = Column(Time, nullable=True)

class Feriado(Base):
    __tablename__ = "feriados"

    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date, unique=True, nullable=False)
    motivo = Column(String(200), nullable=False)