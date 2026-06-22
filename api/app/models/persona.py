from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, Date
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.config_nomina import persona_concepto

class Persona(Base):
    __tablename__ = "personas"
    
    # --- DATOS DE IDENTIDAD ---
    id = Column(Integer, primary_key=True, index=True)
    dni = Column(String(8), unique=True, index=True, nullable=False)
    nombre_completo = Column(String(150), nullable=False)
    is_active = Column(Boolean, default=True)
    
    # --- DATOS ORIGINALES DE ASISTENCIA ---
    tipo_trabajador = Column(Integer, nullable=False)
    fecha_inicio_labores = Column(String(20), nullable=True) # Si usabas Date, cámbialo a Date
    dias_laborables = Column(String(50), default="1,2,3,4,5")
    
    # --- NUEVOS CAMPOS FINANCIEROS Y LABORALES (NÓMINA) ---
    salario_basico = Column(Float, default=0.0)
    cargo_id = Column(Integer, ForeignKey("cargos.id", ondelete="SET NULL"), nullable=True)
    condicion_id = Column(Integer, ForeignKey("condiciones_laborales.id", ondelete="SET NULL"), nullable=True)

    # --- RELACIONES ---
    cargo = relationship("Cargo")
    condicion = relationship("CondicionLaboral")
    conceptos_asignados = relationship("ConceptoNomina", secondary=persona_concepto, backref="empleados")
    
    # Relación bidireccional con tu tabla Asistencia
    asistencias = relationship("Asistencia", back_populates="persona", cascade="all, delete-orphan")