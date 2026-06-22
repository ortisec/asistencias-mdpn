import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 1. Intentamos leer la variable inyectada por Docker.
# 2. Si no existe (porque estás probando en tu PC sin Docker), usa el valor por defecto.
# IMPORTANTE: Nota que el servidor ahora se llama 'db' (el nombre del contenedor en tu docker-compose)
DEFAULT_URL = "postgresql://postgres:utimdpn2026@db:5432/muni_asistencia"

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_URL)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)