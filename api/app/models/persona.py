from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.config_nomina import persona_concepto # Importamos la tabla intermedia

class Persona(Base):
    __tablename__ = "personas"
    
    id = Column(Integer, primary_key=True, index=True)
    dni = Column(String(8), unique=True, index=True, nullable=False)
    nombre_completo = Column(String(150), nullable=False)
    is_active = Column(Boolean, default=True)
    
    # --- NUEVOS CAMPOS FINANCIEROS Y LABORALES ---
    salario_basico = Column(Float, default=0.0)
    cargo_id = Column(Integer, ForeignKey("cargos.id", ondelete="SET NULL"), nullable=True)
    condicion_id = Column(Integer, ForeignKey("condiciones_laborales.id", ondelete="SET NULL"), nullable=True)

    # --- RELACIONES ---
    cargo = relationship("Cargo")
    condicion = relationship("CondicionLaboral")
    
    # Aquí se guardarán todos los checks que RRHH le marque en el modal
    conceptos_asignados = relationship("ConceptoNomina", secondary=persona_concepto, backref="empleados")