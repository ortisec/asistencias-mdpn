from pydantic import BaseModel
from typing import List
from datetime import datetime

# --- DETALLES DE LA BOLETA ---
class BoletaDetalleBase(BaseModel):
    tipo: str
    concepto: str
    monto: float

class BoletaDetalleCreate(BoletaDetalleBase):
    pass

class BoletaDetalleResponse(BoletaDetalleBase):
    id: int
    model_config = {"from_attributes": True}

# --- LA BOLETA ---
class BoletaBase(BaseModel):
    persona_id: int
    dias_laborados: int = 30
    faltas: int = 0
    minutos_tardanza: int = 0
    total_ingresos: float
    total_descuentos: float
    total_aportaciones: float
    neto_pagar: float

class BoletaCreate(BoletaBase):
    detalles: List[BoletaDetalleCreate]

class BoletaResponse(BoletaBase):
    id: int
    planilla_id: int
    detalles: List[BoletaDetalleResponse]
    model_config = {"from_attributes": True}

# --- LA PLANILLA (CONTENEDOR MENSUAL) ---
class PlanillaBase(BaseModel):
    periodo: str
    condicion_laboral: str

class PlanillaCreate(PlanillaBase):
    boletas: List[BoletaCreate]

class PlanillaResponse(PlanillaBase):
    id: int
    fecha_creacion: datetime
    boletas: List[BoletaResponse] = []
    model_config = {"from_attributes": True}