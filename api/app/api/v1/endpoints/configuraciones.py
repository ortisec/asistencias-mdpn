from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.dependencies import get_db
from app.schemas import configuracion as schemas
from app.crud import crud_configuracion as crud

router = APIRouter()

# --- RUTAS DE HORARIOS ---
@router.get("/horarios", response_model=List[schemas.ConfiguracionHorario])
def obtener_horarios(db: Session = Depends(get_db)):
    return crud.get_horarios(db)

@router.put("/horarios/{regimen}", response_model=schemas.ConfiguracionHorario)
def actualizar_horario_regimen(regimen: int, config_in: schemas.ConfiguracionHorarioUpdate, db: Session = Depends(get_db)):
    horario_actualizado = crud.update_horario_regimen(db, regimen=regimen, config_in=config_in)
    if not horario_actualizado:
        raise HTTPException(status_code=404, detail=f"No se encontró configuración para el régimen {regimen}")
    return horario_actualizado

# --- RUTAS DE FERIADOS ---
@router.get("/feriados", response_model=List[schemas.Feriado])
def listar_feriados(db: Session = Depends(get_db)):
    return crud.get_feriados(db)

@router.post("/feriados", response_model=schemas.Feriado)
def registrar_feriado(feriado_in: schemas.FeriadoCreate, db: Session = Depends(get_db)):
    # Evitar registrar el mismo feriado dos veces
    feriados_existentes = crud.get_feriados(db)
    if any(f.fecha == feriado_in.fecha for f in feriados_existentes):
        raise HTTPException(status_code=400, detail="Ya existe un feriado registrado en esa fecha")
    return crud.crear_feriado(db, feriado_in)

@router.delete("/feriados/{feriado_id}")
def borrar_feriado(feriado_id: int, db: Session = Depends(get_db)):
    feriado = crud.eliminar_feriado(db, feriado_id)
    if not feriado:
        raise HTTPException(status_code=404, detail="Feriado no encontrado")
    return {"mensaje": "Feriado eliminado exitosamente"}