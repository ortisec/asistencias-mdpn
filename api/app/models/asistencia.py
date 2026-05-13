from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base

class Asistencia(Base):
    __tablename__ = "asistencias"

    id = Column(Integer, primary_key=True, index=True)
    persona_id = Column(Integer, ForeignKey("personas.id"), nullable=False)
    fecha_ingreso = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    fecha_salida = Column(DateTime(timezone=True), nullable=True)

    persona = relationship("Persona", back_populates="asistencias")