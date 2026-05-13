from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.dependencies import get_db
from app.schemas import persona as schemas
from app.crud import crud_persona as crud

router = APIRouter()

@router.post("/", response_model=schemas.Persona)
def crear_persona(persona: schemas.PersonaCreate, db: Session = Depends(get_db)):
    # Usamos la lógica CRUD en lugar de ensuciar el endpoint
    db_persona = crud.get_persona_por_dni(db, dni=persona.dni)
    if db_persona:
        raise HTTPException(status_code=400, detail="El DNI ya está registrado")
    
    return crud.crear_persona(db=db, persona=persona)

@router.get("/", response_model=list[schemas.Persona])
def leer_personas(db: Session = Depends(get_db)):
    return crud.get_personas(db)

@router.patch("/{persona_id}", response_model=schemas.Persona)
def actualizar_persona(persona_id: int, persona_in: schemas.PersonaUpdate, db: Session = Depends(get_db)):
    # Primero verificamos si existe
    db_persona = crud.get_persona_por_id(db, persona_id=persona_id)
    if not db_persona:
        raise HTTPException(status_code=404, detail="Persona no encontrada")
    
    # Si existe, enviamos los datos al CRUD
    persona_actualizada = crud.update_persona(db=db, persona_id=persona_id, persona_data=persona_in)
    return persona_actualizada