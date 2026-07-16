from zk import ZK
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models.persona import Persona
from app.models.asistencia import Asistencia
import logging

logger = logging.getLogger(__name__)

DEFAULT_TIMEOUT = 10


def conectar(ip, port=4370, password=0, timeout=DEFAULT_TIMEOUT):
    zk = ZK(ip, port=port, timeout=timeout, password=password,
            force_udp=False, ommit_ping=False)
    conn = zk.connect()
    return conn


def extraer_usuarios(conn):
    usuarios = conn.get_users()
    result = []
    for u in usuarios:
        result.append({
            "uid": u.uid,
            "user_id": u.user_id.strip(),
            "name": u.name.strip(),
            "card": getattr(u, "card", ""),
            "privilege": u.privilege,
        })
    return result


def extraer_asistencias(conn):
    registros = conn.get_attendance()
    result = []
    for a in registros:
        result.append({
            "user_id": a.user_id.strip(),
            "timestamp": a.timestamp,
            "status": a.status,
        })
    return result


def sincronizar_personas(db: Session, ip: str, port: int = 4370, password: int = 0):
    conn = conectar(ip, port, password)
    creados = 0
    actualizados = 0
    try:
        conn.disable_device()
        usuarios = extraer_usuarios(conn)
        for u in usuarios:
            user_id = u["user_id"][:8]
            if not user_id:
                continue
            nombre = u["name"] or "Sin nombre"
            existente = db.query(Persona).filter(Persona.dni == user_id).first()
            if existente:
                if existente.nombre_completo != nombre:
                    existente.nombre_completo = nombre
                    actualizados += 1
            else:
                nueva = Persona(
                    dni=user_id,
                    nombre_completo=nombre,
                    tipo_trabajador=1057,
                    fecha_inicio_labores=datetime.now(timezone.utc).date().isoformat(),
                    is_active=True,
                )
                db.add(nueva)
                creados += 1
        db.commit()
    finally:
        conn.enable_device()
        conn.disconnect()
    return {"usuarios_creados": creados, "usuarios_actualizados": actualizados}


def sincronizar_asistencias(db: Session, ip: str, port: int = 4370, password: int = 0):
    conn = conectar(ip, port, password)
    registradas = 0
    omitidas = 0
    try:
        conn.disable_device()
        asistencias = extraer_asistencias(conn)
        for a in asistencias:
            user_id = a["user_id"]
            timestamp = a["timestamp"]
            if not user_id or not timestamp:
                omitidas += 1
                continue
            persona = db.query(Persona).filter(Persona.dni == user_id).first()
            if not persona:
                omitidas += 1
                continue
            ventana_inicio = timestamp - timedelta(seconds=30)
            ventana_fin = timestamp + timedelta(seconds=30)
            duplicado = db.query(Asistencia).filter(
                Asistencia.persona_id == persona.id,
                Asistencia.fecha_ingreso >= ventana_inicio,
                Asistencia.fecha_ingreso <= ventana_fin,
            ).first()
            if duplicado:
                omitidas += 1
                continue
            nueva = Asistencia(
                persona_id=persona.id,
                fecha_ingreso=timestamp,
            )
            db.add(nueva)
            registradas += 1
        db.commit()
    finally:
        conn.enable_device()
        conn.disconnect()
    return {"asistencias_registradas": registradas, "asistencias_omitidas": omitidas}


def verificar_conexion(ip: str, port: int = 4370, password: int = 0):
    try:
        conn = conectar(ip, port, password)
        firmware = conn.get_firmware_version()
        serial = conn.get_serialnumber()
        conn.disable_device()
        usuarios = conn.get_users()
        asistencias = conn.get_attendance()
        conn.enable_device()
        conn.disconnect()
        return {
            "conectado": True,
            "firmware": firmware,
            "serial": serial,
            "usuarios_en_dispositivo": len(usuarios),
            "asistencias_en_dispositivo": len(asistencias),
        }
    except Exception as e:
        return {"conectado": False, "error": str(e)}
