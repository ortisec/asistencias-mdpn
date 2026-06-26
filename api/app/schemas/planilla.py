from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class GenerarPlanillaRequest(BaseModel):
    periodo: str
    tipo_trabajador: int

class BoletaDetalleResponse(BaseModel):
    id: int
    concepto_nombre: str
    tipo: str
    monto_calculado: float
    class Config:
        from_attributes = True

class BoletaResponse(BaseModel):
    id: int
    persona_id: Optional[int]
    persona_nombre: str  # <-- Campo corregido
    persona_dni: str     # <-- Campo corregido
    salario_base: float
    cargo_nombre: Optional[str]
    condicion_nombre: Optional[str]
    total_ingresos: float
    total_descuentos: float
    total_aportaciones: float
    neto_a_cobrar: float
    detalles: List[BoletaDetalleResponse] = []
    class Config:
        from_attributes = True

class PlanillaResponse(BaseModel):
    id: int
    periodo: str
    tipo_trabajador: int
    fecha_generacion: datetime
    total_general_ingresos: float
    total_general_descuentos: float
    total_general_neto: float
    boletas: List[BoletaResponse] = []
    class Config:
        from_attributes = True