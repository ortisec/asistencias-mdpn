from sqlalchemy import Column, Integer, String, Time, Date
from app.db.base import Base

class ConfiguracionHorario(Base):
    __tablename__ = "configuracion_horarios"

    id = Column(Integer, primary_key=True, index=True)
    # Turno Mañana
    hora_ingreso_manana = Column(Time, nullable=False)
    minutos_tolerancia_manana = Column(Integer, default=15)
    hora_salida_manana = Column(Time, nullable=False)
    
    # Turno Tarde
    hora_ingreso_tarde = Column(Time, nullable=False)
    minutos_tolerancia_tarde = Column(Integer, default=15)
    hora_salida_tarde = Column(Time, nullable=False)

class Feriado(Base):
    __tablename__ = "feriados"

    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date, unique=True, nullable=False)
    motivo = Column(String(200), nullable=False)