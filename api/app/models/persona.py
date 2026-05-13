from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base

class Persona(Base):
    __tablename__ = "personas"

    id = Column(Integer, primary_key=True, index=True)
    dni = Column(String(15), unique=True, index=True, nullable=False)
    nombre_completo = Column(String(100), nullable=False)
    tipo_trabajador = Column(Integer, nullable=False) 
    is_active = Column(Boolean, default=True)

    asistencias = relationship("Asistencia", back_populates="persona")