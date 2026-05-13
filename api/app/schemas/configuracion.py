from pydantic import BaseModel
from typing import Optional
from datetime import time, date

# --- ESQUEMAS PARA HORARIOS ---
class ConfiguracionHorarioBase(BaseModel):
    regimen: int
    es_horario_partido: bool
    hora_ingreso_manana: time
    minutos_tolerancia_manana: int
    hora_salida_manana: time
    hora_ingreso_tarde: Optional[time] = None
    minutos_tolerancia_tarde: Optional[int] = 0
    hora_salida_tarde: Optional[time] = None

class ConfiguracionHorarioUpdate(BaseModel):
    es_horario_partido: Optional[bool] = None
    hora_ingreso_manana: Optional[time] = None
    minutos_tolerancia_manana: Optional[int] = None
    hora_salida_manana: Optional[time] = None
    hora_ingreso_tarde: Optional[time] = None
    minutos_tolerancia_tarde: Optional[int] = None
    hora_salida_tarde: Optional[time] = None

class ConfiguracionHorario(ConfiguracionHorarioBase):
    id: int
    model_config = {"from_attributes": True}

# --- ESQUEMAS PARA FERIADOS ---
class FeriadoBase(BaseModel):
    fecha: date
    motivo: str

class FeriadoCreate(FeriadoBase):
    pass

class Feriado(FeriadoBase):
    id: int
    model_config = {"from_attributes": True}