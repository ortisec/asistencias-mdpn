from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.dependencies import get_db, RoleChecker
from app.schemas import asistencia as schemas
from app.crud import crud_asistencia as crud

router = APIRouter()


@router.get("/", response_model=List[schemas.Asistencia])
def obtener_asistencias(
    db: Session = Depends(get_db),
    _=Depends(
        RoleChecker(["superadmin", "admin", "rrhh"])
    ),  # Necesario para que el módulo de Reportes funcione
):
    return crud.get_asistencias(db)


@router.post("/", response_model=schemas.Asistencia)
def registrar_entrada(
    asistencia: schemas.AsistenciaCreate,
    db: Session = Depends(get_db),
    _=Depends(RoleChecker(["superadmin"])),
):
    # CORREGIDO: Llamamos a "crear_asistencia" en vez de "create_asistencia"
    return crud.crear_asistencia(db=db, asistencia=asistencia)


@router.put("/{asistencia_id}/salida", response_model=schemas.Asistencia)
def marcar_salida(
    asistencia_id: int,
    db: Session = Depends(get_db),
    _=Depends(RoleChecker(["superadmin"])),
):
    # CORREGIDO: Llamamos a "marcar_salida" en vez de "mark_salida"
    asistencia_actualizada = crud.marcar_salida(db=db, asistencia_id=asistencia_id)
    if not asistencia_actualizada:
        raise HTTPException(status_code=404, detail="Asistencia no encontrada")
    return asistencia_actualizada


@router.put("/{asistencia_id}", response_model=schemas.Asistencia)
def editar_asistencia_admin(
    asistencia_id: int,
    asistencia_in: schemas.AsistenciaUpdate,
    db: Session = Depends(get_db),
    _=Depends(RoleChecker(["superadmin"])),  # Solo superadmin (Modal de edición manual)
):
    asistencia_actualizada = crud.update_asistencia_manual(
        db, asistencia_id, asistencia_in.model_dump(exclude_unset=True)
    )
    if not asistencia_actualizada:
        raise HTTPException(status_code=404, detail="Asistencia no encontrada")
    return asistencia_actualizada
