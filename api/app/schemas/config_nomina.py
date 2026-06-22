from pydantic import BaseModel
from typing import List, Optional

# --- CARGOS ---
class CargoBase(BaseModel):
    nombre: str

class CargoResponse(CargoBase):
    id: int
    model_config = {"from_attributes": True}

# --- CONDICIONES LABORALES ---
class CondicionLaboralBase(BaseModel):
    nombre: str

class CondicionLaboralResponse(CondicionLaboralBase):
    id: int
    model_config = {"from_attributes": True}

# --- CONCEPTOS DE NÓMINA (Ingresos, Descuentos, Aportes) ---
class ConceptoNominaBase(BaseModel):
    nombre: str
    tipo: str         # 'INGRESO', 'DESCUENTO', 'APORTACION'
    modo_calculo: str # 'FIJO', 'PORCENTAJE'
    valor: float

class ConceptoNominaResponse(ConceptoNominaBase):
    id: int
    model_config = {"from_attributes": True}