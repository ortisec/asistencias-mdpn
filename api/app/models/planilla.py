from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class Planilla(Base):
    __tablename__ = "planillas"
    id = Column(Integer, primary_key=True, index=True)
    periodo = Column(String(50), nullable=False) # Ej: "MAYO 2026"
    tipo_trabajador = Column(Integer, nullable=False) # 1057, 728, 276
    fecha_generacion = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relación con las boletas de este mes
    boletas = relationship("Boleta", back_populates="planilla", cascade="all, delete-orphan")

class Boleta(Base):
    __tablename__ = "boletas"
    id = Column(Integer, primary_key=True, index=True)
    planilla_id = Column(Integer, ForeignKey("planillas.id", ondelete="CASCADE"), nullable=False)
    persona_id = Column(Integer, ForeignKey("personas.id"), nullable=False)
    
    # Copia dura de los datos en el momento de la generación
    salario_base = Column(Float, nullable=False)
    cargo_nombre = Column(String(100), nullable=True)
    condicion_nombre = Column(String(100), nullable=True)
    
    # Totales calculados
    total_ingresos = Column(Float, default=0.0)
    total_descuentos = Column(Float, default=0.0)
    total_aportaciones = Column(Float, default=0.0)
    neto_a_cobrar = Column(Float, default=0.0)

    # Relaciones
    planilla = relationship("Planilla", back_populates="boletas")
    persona = relationship("Persona")
    detalles = relationship("BoletaDetalle", back_populates="boleta", cascade="all, delete-orphan")

class BoletaDetalle(Base):
    __tablename__ = "boleta_detalles"
    id = Column(Integer, primary_key=True, index=True)
    boleta_id = Column(Integer, ForeignKey("boletas.id", ondelete="CASCADE"), nullable=False)
    
    # La "Foto" del concepto
    concepto_nombre = Column(String(100), nullable=False)
    tipo = Column(String(20), nullable=False) # INGRESO, DESCUENTO, APORTACION
    monto_calculado = Column(Float, nullable=False)

    boleta = relationship("Boleta", back_populates="detalles")