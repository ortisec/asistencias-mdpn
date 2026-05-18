from sqlalchemy.orm import Session
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate
from app.core.security import get_password_hash

def get_usuarios(db: Session):
    return db.query(Usuario).order_by(Usuario.id.desc()).all()

def get_usuario_by_username(db: Session, username: str):
    return db.query(Usuario).filter(Usuario.username == username).first()

def create_usuario(db: Session, usuario: UsuarioCreate):
    db_user = Usuario(
        username=usuario.username,
        rol=usuario.rol,
        is_active=usuario.is_active,
        hashed_password=get_password_hash(usuario.password) # Encriptamos la clave aquí
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_usuario(db: Session, user_id: int, user_in: UsuarioUpdate):
    db_user = db.query(Usuario).filter(Usuario.id == user_id).first()
    if db_user:
        update_data = user_in.model_dump(exclude_unset=True)
        
        # Si enviaron una nueva contraseña, la encriptamos antes de guardarla
        if "password" in update_data:
            nueva_clave = update_data.pop("password")
            db_user.hashed_password = get_password_hash(nueva_clave)
            
        for key, value in update_data.items():
            setattr(db_user, key, value)
            
        db.commit()
        db.refresh(db_user)
    return db_user