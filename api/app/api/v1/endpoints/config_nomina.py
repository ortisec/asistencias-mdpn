from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.dependencies import get_db, RoleChecker
from app.schemas import config_nomina as schemas
from app.crud import crud_config_nomina as crud

router = APIRouter()

# --- RUTAS PARA CARGOS ---
@router.get("/cargos", response_model=List[schemas.CargoResponse])
def listar_cargos(db: Session = Depends(get_db), _ = Depends(RoleChecker(["superadmin", "rrhh"]))):
    return crud.get_cargos(db)

@router.post("/cargos", response_model=schemas.CargoResponse)
def crear_cargo(cargo: schemas.CargoBase, db: Session = Depends(get_db), _ = Depends(RoleChecker(["superadmin", "rrhh"]))):
    return crud.create_cargo(db=db, cargo=cargo)

# --- RUTAS PARA CONDICIONES LABORALES ---
@router.get("/condiciones", response_model=List[schemas.CondicionLaboralResponse])
def listar_condiciones(db: Session = Depends(get_db), _ = Depends(RoleChecker(["superadmin", "rrhh"]))):
    return crud.get_condiciones(db)

@router.post("/condiciones", response_model=schemas.CondicionLaboralResponse)
def crear_condicion(condicion: schemas.CondicionLaboralBase, db: Session = Depends(get_db), _ = Depends(RoleChecker(["superadmin", "rrhh"]))):
    return crud.create_condicion(db=db, condicion=condicion)

# --- RUTAS PARA CONCEPTOS DE NÓMINA ---
@router.get("/conceptos", response_model=List[schemas.ConceptoNominaResponse])
def listar_conceptos(db: Session = Depends(get_db), _ = Depends(RoleChecker(["superadmin", "rrhh"]))):
    return crud.get_conceptos(db)

@router.post("/conceptos", response_model=schemas.ConceptoNominaResponse)
def crear_concepto(concepto: schemas.ConceptoNominaBase, db: Session = Depends(get_db), _ = Depends(RoleChecker(["superadmin", "rrhh"]))):
    return crud.create_concepto(db=db, concepto=concepto)