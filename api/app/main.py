from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from app.db.database import engine
from app.db.base import Base

from app.api.v1.endpoints import personas, asistencias, configuraciones

Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Profesional de Asistencias")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En producción, aquí pones la URL de tu frontend ej: ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registramos los Routers
app.include_router(personas.router, prefix="/api/v1/personas", tags=["Personas"])
app.include_router(asistencias.router, prefix="/api/v1/asistencias", tags=["Asistencias"])
app.include_router(configuraciones.router, prefix="/api/v1/configuraciones", tags=["Configuraciones"])