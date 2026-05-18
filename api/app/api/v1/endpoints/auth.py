from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, get_current_user
from app.models.usuario import Usuario
from app.core.security import verify_password, create_access_token, get_password_hash, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta

router = APIRouter()

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.username == form_data.username).first()
    
    if not usuario or not verify_password(form_data.password, usuario.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not usuario.is_active:
        raise HTTPException(status_code=400, detail="Usuario inactivo")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Dentro del token guardamos quién es y qué rol tiene
    access_token = create_access_token(
        data={"sub": usuario.username, "rol": usuario.rol}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "rol": usuario.rol}

# --- RUTA SECRETA DE INSTALACIÓN ---
# Ejecuta esto una sola vez para crear tu cuenta maestra
@router.post("/setup-inicial")
def setup_inicial(db: Session = Depends(get_db)):
    usuario_existente = db.query(Usuario).first()
    if usuario_existente:
        return {"msg": "El sistema ya fue inicializado anteriormente."}
    
    # Creamos el primer super administrador
    nuevo_admin = Usuario(
        username="utimdpn",
        hashed_password=get_password_hash("2026MuniPnuevo"),
        rol="superadmin"
    )
    db.add(nuevo_admin)
    db.commit()
    return {"msg": "Usuario maestro 'utimdpn' creado con éxito."}

@router.post("/logout")
def logout(current_user: Usuario = Depends(get_current_user)):
    return {
        "msg": "Sesión cerrada exitosamente",
        "usuario": current_user.username
    }