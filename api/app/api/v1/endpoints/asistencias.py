from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.dependencies import get_db
from app.schemas import asistencia as schemas
from app.crud import crud_asistencia as crud_asis
from app.crud import crud_persona as crud_per

router = APIRouter()

@router.post("/", response_model=schemas.Asistencia)
def registrar_asistencia(asistencia: schemas.AsistenciaCreate, db: Session = Depends(get_db)):
    # Verificamos persona usando el CRUD de personas
    persona_existe = crud_per.get_persona_por_id(db, persona_id=asistencia.persona_id)
    if not persona_existe:
        raise HTTPException(status_code=404, detail="Persona no encontrada")

    # Guardamos usando el CRUD de asistencias
    return crud_asis.crear_asistencia(db=db, asistencia=asistencia)

@router.get("/", response_model=list[schemas.Asistencia])
def listar_asistencias(db: Session = Depends(get_db)):
    return crud_asis.get_asistencias(db)

@router.put("/{asistencia_id}/salida", response_model=schemas.Asistencia)
def registrar_salida(asistencia_id: int, db: Session = Depends(get_db)):
    db_asistencia = crud_asis.marcar_salida(db=db, asistencia_id=asistencia_id)
    
    if not db_asistencia:
        raise HTTPException(status_code=404, detail="Asistencia no encontrada o ya fue cerrada")
        
    return db_asistencia