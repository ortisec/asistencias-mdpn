from sqlalchemy import Column, Integer, String, Float, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.db.base import Base

# --- TABLAS DE CATÁLOGO (Configurables por RRHH) ---

class Cargo(Base):
    __tablename__ = "cargos"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), unique=True, nullable=False) # Ej: "Limpieza Pública", "Serenazgo"

class CondicionLaboral(Base):
    __tablename__ = "condiciones_laborales"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), unique=True, nullable=False) # Ej: "D. LEG 728 - OBRERO PERMANENTE"

class ConceptoNomina(Base):
    __tablename__ = "conceptos_nomina"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False) # Ej: "Riesgo de Salud 10%", "Decreto Supremo 311-2022"
    tipo = Column(String(20), nullable=False) # Solo admitirá: 'INGRESO', 'DESCUENTO', 'APORTACION'
    modo_calculo = Column(String(20), nullable=False) # Solo admitirá: 'FIJO', 'PORCENTAJE'
    valor = Column(Float, nullable=False) # Si es FIJO = 50.00 soles. Si es PORCENTAJE = 10.0 (%)

# --- TABLA INTERMEDIA (Muchos a Muchos) ---
# Sirve para decir: "El empleado Juan tiene asignados el Concepto 1, Concepto 4 y Concepto 5"
persona_concepto = Table(
    'persona_concepto',
    Base.metadata,
    Column('persona_id', Integer, ForeignKey('personas.id', ondelete="CASCADE"), primary_key=True),
    Column('concepto_id', Integer, ForeignKey('conceptos_nomina.id', ondelete="CASCADE"), primary_key=True)
)