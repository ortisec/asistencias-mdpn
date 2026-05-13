from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AsistenciaCreate(BaseModel):
    persona_id: int
    fecha_ingreso: Optional[datetime] = None 

class Asistencia(BaseModel):
    id: int
    persona_id: int
    fecha_ingreso: datetime
    fecha_salida: Optional[datetime] = None
    model_config = {"from_attributes": True}
    
class AsistenciaUpdate(BaseModel):
    fecha_ingreso: Optional[datetime] = None
    fecha_salida: Optional[datetime] = None