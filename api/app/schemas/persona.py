from pydantic import BaseModel
from typing import Literal, Optional

class PersonaBase(BaseModel):
    dni: str
    nombre_completo: str
    tipo_trabajador: Literal[1057, 728, 276]
    is_active: bool = True # Agregado con valor por defecto

class PersonaCreate(PersonaBase):
    pass

# --- NUEVO ESQUEMA PARA EDITAR ---
class PersonaUpdate(BaseModel):
    # Todo es opcional, así puedes actualizar solo el nombre, solo el estado, o ambos
    nombre_completo: Optional[str] = None
    tipo_trabajador: Optional[Literal[1057, 728, 276]] = None
    is_active: Optional[bool] = None

class Persona(PersonaBase):
    id: int
    model_config = {"from_attributes": True}