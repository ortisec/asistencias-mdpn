from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.dependencies import get_db, RoleChecker
from app.schemas import usuario as schemas
from app.crud import crud_usuario as crud

router = APIRouter()

@router.get("/", response_model=List[schemas.UsuarioResponse])
def listar_usuarios(
    db: Session = Depends(get_db),
    _ = Depends(RoleChecker(["superadmin"]))
):
    return crud.get_usuarios(db)

@router.post("/", response_model=schemas.UsuarioResponse)
def crear_usuario(
    usuario: schemas.UsuarioCreate,
    db: Session = Depends(get_db),
    _ = Depends(RoleChecker(["superadmin"]))
):
    # Verificamos que el nombre de usuario no se repita
    if crud.get_usuario_by_username(db, usuario.username):
        raise HTTPException(status_code=400, detail="El nombre de usuario ya existe")
    
    return crud.create_usuario(db, usuario)

@router.put("/{usuario_id}", response_model=schemas.UsuarioResponse)
def actualizar_usuario(
    usuario_id: int,
    usuario_in: schemas.UsuarioUpdate,
    db: Session = Depends(get_db),
    _ = Depends(RoleChecker(["superadmin"]))
):
    # Si intenta cambiar el username, verificamos que no colisione con otro
    if usuario_in.username:
        user_existente = crud.get_usuario_by_username(db, usuario_in.username)
        if user_existente and user_existente.id != usuario_id:
            raise HTTPException(status_code=400, detail="Ese nombre de usuario ya está tomado")

    db_user = crud.update_usuario(db, usuario_id, usuario_in)
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return db_user