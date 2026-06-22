from pydantic import BaseModel
from typing import Literal, Optional, List
from datetime import date

# Importamos los esquemas de configuración para armar la respuesta completa
from app.schemas.config_nomina import ConceptoNominaResponse, CargoResponse, CondicionLaboralResponse

class PersonaBase(BaseModel):
    dni: str
    nombre_completo: str
    tipo_trabajador: Literal[1057, 728, 276]
    is_active: bool = True
    fecha_inicio_labores: date
    dias_laborables: str = "1,2,3,4,5"
    
    # --- NUEVOS CAMPOS FINANCIEROS Y LABORALES ---
    salario_basico: float = 0.0
    cargo_id: Optional[int] = None
    condicion_id: Optional[int] = None

class PersonaCreate(PersonaBase):
    # Array que recibirá React con los IDs de los conceptos marcados con check
    conceptos_ids: List[int] = []

class PersonaUpdate(BaseModel):
    nombre_completo: Optional[str] = None
    tipo_trabajador: Optional[Literal[1057, 728, 276]] = None
    is_active: Optional[bool] = None
    fecha_inicio_labores: Optional[date] = None
    dias_laborables: Optional[str] = None
    
    # --- NUEVOS CAMPOS FINANCIEROS (Opcionales para cuando se edite un empleado) ---
    salario_basico: Optional[float] = None
    cargo_id: Optional[int] = None
    condicion_id: Optional[int] = None
    conceptos_ids: Optional[List[int]] = None

class Persona(PersonaBase):
    id: int
    
    # --- DATOS RELACIONALES PARA EL FRONTEND ---
    # Gracias a esto, cuando pidas un empleado, la API te devolverá el nombre exacto 
    # de su cargo, condición y la lista detallada de sus bonos/descuentos.
    cargo: Optional[CargoResponse] = None
    condicion: Optional[CondicionLaboralResponse] = None
    conceptos_asignados: List[ConceptoNominaResponse] = []

    model_config = {"from_attributes": True}