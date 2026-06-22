from sqlalchemy.orm import Session
from app.models.persona import Persona
from app.models.config_nomina import ConceptoNomina # Importación necesaria
from app.schemas.persona import PersonaCreate, PersonaUpdate

def get_persona_por_dni(db: Session, dni: str):
    return db.query(Persona).filter(Persona.dni == dni).first()

def get_persona_por_id(db: Session, persona_id: int):
    return db.query(Persona).filter(Persona.id == persona_id).first()

def get_personas(db: Session):
    return db.query(Persona).all()

def crear_persona(db: Session, persona: PersonaCreate):
    db_persona = Persona(
        dni=persona.dni, 
        nombre_completo=persona.nombre_completo,
        tipo_trabajador=persona.tipo_trabajador,
        is_active=persona.is_active,
        fecha_inicio_labores=persona.fecha_inicio_labores,
        dias_laborables=persona.dias_laborables,
        # --- NUEVOS CAMPOS FINANCIEROS ---
        salario_basico=persona.salario_basico,
        cargo_id=persona.cargo_id,
        condicion_id=persona.condicion_id
    )
    
    # --- ASIGNACIÓN DINÁMICA DE CONCEPTOS (Ingresos/Descuentos/Aportes) ---
    if persona.conceptos_ids:
        conceptos = db.query(ConceptoNomina).filter(ConceptoNomina.id.in_(persona.conceptos_ids)).all()
        db_persona.conceptos_asignados = conceptos

    db.add(db_persona)
    db.commit()
    db.refresh(db_persona)
    return db_persona

def update_persona(db: Session, persona_id: int, persona_data: PersonaUpdate):
    db_persona = get_persona_por_id(db, persona_id)
    if db_persona:
        # Extraemos solo los datos que el frontend realmente envió
        update_data = persona_data.model_dump(exclude_unset=True)
        
        # --- INTERCEPCIÓN DE LA RELACIÓN MUCHOS A MUCHOS ---
        # Sacamos 'conceptos_ids' del diccionario porque no es una columna normal
        if "conceptos_ids" in update_data:
            ids_recibidos = update_data.pop("conceptos_ids")
            # Buscamos los objetos reales en la BD y los reasignamos
            conceptos = db.query(ConceptoNomina).filter(ConceptoNomina.id.in_(ids_recibidos)).all()
            db_persona.conceptos_asignados = conceptos
        
        # Actualizamos dinámicamente el resto de campos normales (salario, cargo, nombre, etc.)
        for key, value in update_data.items():
            setattr(db_persona, key, value)
            
        db.commit()
        db.refresh(db_persona)
    return db_persona