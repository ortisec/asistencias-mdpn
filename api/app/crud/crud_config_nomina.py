from sqlalchemy.orm import Session
from app.models.config_nomina import Cargo, CondicionLaboral, ConceptoNomina
from app.schemas import config_nomina as schemas

# --- CARGOS ---
def get_cargos(db: Session):
    return db.query(Cargo).order_by(Cargo.nombre).all()

def create_cargo(db: Session, cargo: schemas.CargoBase):
    db_cargo = Cargo(nombre=cargo.nombre)
    db.add(db_cargo)
    db.commit()
    db.refresh(db_cargo)
    return db_cargo

# --- CONDICIONES LABORALES ---
def get_condiciones(db: Session):
    return db.query(CondicionLaboral).order_by(CondicionLaboral.nombre).all()

def create_condicion(db: Session, condicion: schemas.CondicionLaboralBase):
    db_condicion = CondicionLaboral(nombre=condicion.nombre)
    db.add(db_condicion)
    db.commit()
    db.refresh(db_condicion)
    return db_condicion

# --- CONCEPTOS DE NÓMINA ---
def get_conceptos(db: Session):
    return db.query(ConceptoNomina).order_by(ConceptoNomina.tipo, ConceptoNomina.nombre).all()

def create_concepto(db: Session, concepto: schemas.ConceptoNominaBase):
    db_concepto = ConceptoNomina(
        nombre=concepto.nombre,
        tipo=concepto.tipo,
        modo_calculo=concepto.modo_calculo,
        valor=concepto.valor
    )
    db.add(db_concepto)
    db.commit()
    db.refresh(db_concepto)
    return db_concepto