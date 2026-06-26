from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine
from app.db.base import Base

# 1. Importamos las rutas (endpoints)
from app.api.v1.endpoints import personas, asistencias, configuraciones, auth, usuarios, planillas, config_nomina

# 2. Importamos los modelos de otra forma para EVITAR colisión de nombres
import app.models.planilla
import app.models.config_nomina
import app.models.persona
import app.models.asistencia
import app.models.configuracion

# 3. Creamos las tablas
Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Profesional de Asistencias y Nómina")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Registramos los Routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Autenticación"])
app.include_router(personas.router, prefix="/api/v1/personas", tags=["Personas"])
app.include_router(asistencias.router, prefix="/api/v1/asistencias", tags=["Asistencias"])
app.include_router(configuraciones.router, prefix="/api/v1/configuraciones", tags=["Configuraciones"])
app.include_router(usuarios.router, prefix="/api/v1/usuarios", tags=["Gestión de Usuarios"])
app.include_router(planillas.router, prefix="/api/v1/planillas", tags=["Nómina y Planillas"])
app.include_router(config_nomina.router, prefix="/api/v1/config-nomina", tags=["Configuración Nómina"])