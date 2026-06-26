from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.dependencies import get_db, RoleChecker
from app.schemas import planilla as schemas
from app.crud import crud_planilla as crud

router = APIRouter()

# Endpoint para disparar el Motor de Cálculo
@router.post("/generar", response_model=schemas.PlanillaResponse)
def generar_planilla(
    request: schemas.GenerarPlanillaRequest, # Usamos el nombre correcto del esquema
    db: Session = Depends(get_db),
    _ = Depends(RoleChecker(["superadmin", "rrhh"]))
):
    return crud.generar_planilla_mensual(
        db=db, 
        periodo=request.periodo, 
        tipo_trabajador=request.tipo_trabajador
    )

# Endpoint para ver el historial de meses
@router.get("/", response_model=List[schemas.PlanillaResponse])
def listar_planillas(
    db: Session = Depends(get_db),
    _ = Depends(RoleChecker(["superadmin", "rrhh", "admin"]))
):
    return crud.obtener_planillas(db)

# Endpoint para ver una boleta específica (útil para la impresión)
@router.get("/{planilla_id}", response_model=schemas.PlanillaResponse)
def obtener_planilla(
    planilla_id: int,
    db: Session = Depends(get_db),
    _ = Depends(RoleChecker(["superadmin", "rrhh", "admin"]))
):
    planilla = crud.obtener_planilla_por_id(db, planilla_id)
    if not planilla:
        raise HTTPException(status_code=404, detail="Planilla no encontrada")
    return planilla