from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.dependencies import get_db, RoleChecker
from app.schemas import configuracion as schemas
from app.crud import crud_configuracion as crud

router = APIRouter()

# --- HORARIOS ---
@router.get("/horarios", response_model=List[schemas.ConfiguracionHorario])
def obtener_horarios(
    db: Session = Depends(get_db),
    _ = Depends(RoleChecker(["superadmin", "admin", "rrhh"])) # Necesario para Reportes
):
    return crud.get_horarios(db)

@router.put("/horarios/{regimen}", response_model=schemas.ConfiguracionHorario)
def actualizar_horario_regimen(
    regimen: int, 
    config_in: schemas.ConfiguracionHorarioUpdate, 
    db: Session = Depends(get_db),
    _ = Depends(RoleChecker(["superadmin"])) # Solo Superadmin edita
):
    horario_actualizado = crud.update_horario_regimen(db, regimen=regimen, config_in=config_in)
    if not horario_actualizado:
        raise HTTPException(status_code=404, detail=f"No se encontró configuración para el régimen {regimen}")
    return horario_actualizado

# --- FERIADOS ---
@router.get("/feriados", response_model=List[schemas.Feriado])
def obtener_feriados(
    db: Session = Depends(get_db),
    _ = Depends(RoleChecker(["superadmin", "admin", "rrhh"])) # Necesario para Reportes
):
    return crud.get_feriados(db)

@router.post("/feriados", response_model=schemas.Feriado)
def crear_feriado(
    feriado: schemas.FeriadoCreate, 
    db: Session = Depends(get_db),
    _ = Depends(RoleChecker(["superadmin"])) # Solo Superadmin crea
):
    return crud.create_feriado(db=db, feriado=feriado)

@router.delete("/feriados/{feriado_id}")
def eliminar_feriado(
    feriado_id: int, 
    db: Session = Depends(get_db),
    _ = Depends(RoleChecker(["superadmin"])) # Solo Superadmin borra
):
    exito = crud.delete_feriado(db=db, feriado_id=feriado_id)
    if not exito:
        raise HTTPException(status_code=404, detail="Feriado no encontrado")
    return {"mensaje": "Feriado eliminado exitosamente"}