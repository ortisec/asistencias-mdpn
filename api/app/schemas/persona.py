from pydantic import BaseModel
from typing import Literal, Optional
from datetime import date

class PersonaBase(BaseModel):
    dni: str
    nombre_completo: str
    tipo_trabajador: Literal[1057, 728, 276]
    is_active: bool = True
    fecha_inicio_labores: date
    dias_laborables: str = "1,2,3,4,5"

class PersonaCreate(PersonaBase):
    pass

class PersonaUpdate(BaseModel):
    nombre_completo: Optional[str] = None
    tipo_trabajador: Optional[Literal[1057, 728, 276]] = None
    is_active: Optional[bool] = None
    fecha_inicio_labores: Optional[date] = None
    dias_laborables: Optional[str] = None

class Persona(PersonaBase):
    id: int
    model_config = {"from_attributes": True}