from sqlalchemy.orm import Session
from app.models.persona import Persona
from app.schemas.persona import PersonaCreate, PersonaUpdate

def get_persona_por_dni(db: Session, dni: str):
    return db.query(Persona).filter(Persona.dni == dni).first()

def get_persona_por_id(db: Session, persona_id: int):
    return db.query(Persona).filter(Persona.id == persona_id).first()

def get_personas(db: Session):
    return db.query(Persona).all()

def crear_persona(db: Session, persona: PersonaCreate):
    # --- AGREGAMOS EL NUEVO CAMPO AQUÍ ---
    db_persona = Persona(
        dni=persona.dni, 
        nombre_completo=persona.nombre_completo,
        tipo_trabajador=persona.tipo_trabajador 
    )
    db.add(db_persona)
    db.commit()
    db.refresh(db_persona)
    return db_persona

def crear_persona(db: Session, persona: PersonaCreate):
    db_persona = Persona(
        dni=persona.dni, 
        nombre_completo=persona.nombre_completo,
        tipo_trabajador=persona.tipo_trabajador,
        is_active=persona.is_active # Agregado
    )
    db.add(db_persona)
    db.commit()
    db.refresh(db_persona)
    return db_persona

# --- NUEVA FUNCIÓN PARA ACTUALIZAR ---
def update_persona(db: Session, persona_id: int, persona_data: PersonaUpdate):
    db_persona = get_persona_por_id(db, persona_id)
    if db_persona:
        # Extraemos solo los datos que el frontend realmente envió (exclude_unset=True)
        update_data = persona_data.model_dump(exclude_unset=True)
        
        # Actualizamos dinámicamente los campos en el modelo
        for key, value in update_data.items():
            setattr(db_persona, key, value)
            
        db.commit()
        db.refresh(db_persona)
    return db_persona