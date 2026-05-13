from pydantic import BaseModel
from datetime import time, date

# --- ESQUEMAS PARA HORARIOS ---
class ConfiguracionHorarioBase(BaseModel):
    hora_ingreso_manana: time
    minutos_tolerancia_manana: int
    hora_salida_manana: time
    hora_ingreso_tarde: time
    minutos_tolerancia_tarde: int
    hora_salida_tarde: time

class ConfiguracionHorarioUpdate(ConfiguracionHorarioBase):
    pass

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