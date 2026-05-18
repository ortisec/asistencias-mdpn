from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
import bcrypt  # Usamos bcrypt directamente, sin passlib

# Configuración de Seguridad
SECRET_KEY = "muni-asistencia-super-secreto-no-compartir"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 600 # El token durará 10 horas

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # bcrypt necesita que los textos se conviertan a bytes (.encode('utf-8'))
    return bcrypt.checkpw(
        plain_password.encode('utf-8'), 
        hashed_password.encode('utf-8')
    )

def get_password_hash(password: str) -> str:
    # Generamos la "sal" y encriptamos
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    # Lo devolvemos como texto normal (.decode('utf-8')) para guardarlo en la BD
    return hashed_password.decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt