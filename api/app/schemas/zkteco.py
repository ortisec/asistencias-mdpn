from pydantic import BaseModel
from typing import Optional


class DispositivoConfig(BaseModel):
    ip: str = "192.168.18.202"
    port: int = 4370
    password: int = 0


class StatusResponse(BaseModel):
    conectado: bool
    firmware: Optional[str] = None
    serial: Optional[str] = None
    usuarios_en_dispositivo: Optional[int] = None
    asistencias_en_dispositivo: Optional[int] = None
    error: Optional[str] = None


class SyncResponse(BaseModel):
    usuarios_creados: int = 0
    usuarios_actualizados: int = 0
    asistencias_registradas: int = 0
    asistencias_omitidas: int = 0
    mensaje: str


class SyncAllResponse(BaseModel):
    usuarios_creados: int = 0
    usuarios_actualizados: int = 0
    asistencias_registradas: int = 0
    asistencias_omitidas: int = 0
    mensaje: str
