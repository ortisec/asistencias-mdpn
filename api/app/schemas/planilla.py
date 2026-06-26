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
    model_config = {"from_attributes": True}

class BoletaResponse(BaseModel):
    id: int
    persona_id: int
    salario_base: float
    cargo_nombre: Optional[str]
    condicion_nombre: Optional[str]
    total_ingresos: float
    total_descuentos: float
    total_aportaciones: float
    neto_a_cobrar: float
    detalles: List[BoletaDetalleResponse] = []
    
    # Opcional: Incluir el nombre del empleado en la respuesta para facilitar el listado
    nombre_empleado: Optional[str] = None
    dni_empleado: Optional[str] = None

    model_config = {"from_attributes": True}

class PlanillaResponse(BaseModel):
    id: int
    periodo: str
    tipo_trabajador: int
    fecha_generacion: datetime
    boletas: List[BoletaResponse] = []
    model_config = {"from_attributes": True}