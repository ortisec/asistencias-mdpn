from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.dependencies import get_db, RoleChecker
from app.schemas import planilla as schemas
from app.crud import crud_planilla as crud

router = APIRouter()

@router.get("/", response_model=List[schemas.PlanillaResponse])
def listar_planillas(
    db: Session = Depends(get_db),
    _ = Depends(RoleChecker(["superadmin", "rrhh"]))
):
    return crud.get_planillas(db)

@router.get("/{planilla_id}", response_model=schemas.PlanillaResponse)
def obtener_detalle_planilla(
    planilla_id: int,
    db: Session = Depends(get_db),
    _ = Depends(RoleChecker(["superadmin", "rrhh"]))
):
    db_planilla = crud.get_planilla_by_id(db, planilla_id)
    if not db_planilla:
        raise HTTPException(status_code=404, detail="Planilla no encontrada")
    return db_planilla

@router.post("/", response_model=schemas.PlanillaResponse)
def generar_planilla(
    planilla_in: schemas.PlanillaCreate,
    db: Session = Depends(get_db),
    _ = Depends(RoleChecker(["superadmin", "rrhh"]))
):
    return crud.crear_planilla_completa(db=db, planilla_in=planilla_in)