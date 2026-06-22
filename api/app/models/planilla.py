from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime, timezone

class Planilla(Base):
    __tablename__ = "planillas"
    
    id = Column(Integer, primary_key=True, index=True)
    periodo = Column(String(50), nullable=False) # Ej: "MAYO 2026"
    condicion_laboral = Column(String(100), nullable=False) # Ej: "D. LEG 728 - OBRERO PERMANENTE"
    fecha_creacion = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    boletas = relationship("Boleta", back_populates="planilla", cascade="all, delete-orphan")

class Boleta(Base):
    __tablename__ = "boletas"
    
    id = Column(Integer, primary_key=True, index=True)
    planilla_id = Column(Integer, ForeignKey("planillas.id"))
    persona_id = Column(Integer, ForeignKey("personas.id")) # Relación con el empleado
    
    # Datos operativos del mes
    dias_laborados = Column(Integer, default=30)
    faltas = Column(Integer, default=0)
    minutos_tardanza = Column(Integer, default=0)
    
    # Totales consolidados
    total_ingresos = Column(Float, default=0.0)
    total_descuentos = Column(Float, default=0.0)
    total_aportaciones = Column(Float, default=0.0)
    neto_pagar = Column(Float, default=0.0)

    planilla = relationship("Planilla", back_populates="boletas")
    persona = relationship("Persona") # Asume que tu modelo de Persona se llama así
    detalles = relationship("BoletaDetalle", back_populates="boleta", cascade="all, delete-orphan")

class BoletaDetalle(Base):
    __tablename__ = "boleta_detalles"
    
    id = Column(Integer, primary_key=True, index=True)
    boleta_id = Column(Integer, ForeignKey("boletas.id"))
    
    tipo = Column(String(20), nullable=False) # "INGRESO", "DESCUENTO", "APORTACION"
    concepto = Column(String(100), nullable=False) # Ej: "Salario Básico Mensual", "SNP 13.00%"
    monto = Column(Float, default=0.0)

    boleta = relationship("Boleta", back_populates="detalles")