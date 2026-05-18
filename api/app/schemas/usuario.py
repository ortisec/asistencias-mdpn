from pydantic import BaseModel
from typing import Optional

class UsuarioBase(BaseModel):
    username: str
    rol: str
    is_active: bool = True

class UsuarioCreate(UsuarioBase):
    password: str

class UsuarioUpdate(BaseModel):
    username: Optional[str] = None
    rol: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

class UsuarioResponse(UsuarioBase):
    id: int
    model_config = {"from_attributes": True}