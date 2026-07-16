from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, RoleChecker
from app.schemas.zkteco import DispositivoConfig, StatusResponse, SyncResponse, SyncAllResponse
from app.services import zkteco as zk_service

router = APIRouter()


@router.post("/status", response_model=StatusResponse)
def verificar_estado(
    config: DispositivoConfig,
    _=Depends(RoleChecker(["superadmin"])),
):
    return zk_service.verificar_conexion(
        ip=config.ip, port=config.port, password=config.password
    )


@router.post("/sync-users", response_model=SyncResponse)
def sincronizar_usuarios(
    config: DispositivoConfig,
    db: Session = Depends(get_db),
    _=Depends(RoleChecker(["superadmin"])),
):
    try:
        resultado = zk_service.sincronizar_personas(
            db=db, ip=config.ip, port=config.port, password=config.password
        )
        return SyncResponse(
            usuarios_creados=resultado["usuarios_creados"],
            usuarios_actualizados=resultado["usuarios_actualizados"],
            mensaje=f"Usuarios sincronizados: {resultado['usuarios_creados']} creados, {resultado['usuarios_actualizados']} actualizados.",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al sincronizar usuarios: {str(e)}")


@router.post("/sync-attendance", response_model=SyncResponse)
def sincronizar_asistencias(
    config: DispositivoConfig,
    db: Session = Depends(get_db),
    _=Depends(RoleChecker(["superadmin"])),
):
    try:
        resultado = zk_service.sincronizar_asistencias(
            db=db, ip=config.ip, port=config.port, password=config.password
        )
        return SyncResponse(
            asistencias_registradas=resultado["asistencias_registradas"],
            asistencias_omitidas=resultado["asistencias_omitidas"],
            mensaje=f"Asistencias sincronizadas: {resultado['asistencias_registradas']} registradas, {resultado['asistencias_omitidas']} omitidas.",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al sincronizar asistencias: {str(e)}")


@router.post("/sync-all", response_model=SyncAllResponse)
def sincronizar_todo(
    config: DispositivoConfig,
    db: Session = Depends(get_db),
    _=Depends(RoleChecker(["superadmin"])),
):
    try:
        r_usuarios = zk_service.sincronizar_personas(
            db=db, ip=config.ip, port=config.port, password=config.password
        )
        r_asistencias = zk_service.sincronizar_asistencias(
            db=db, ip=config.ip, port=config.port, password=config.password
        )
        return SyncAllResponse(
            usuarios_creados=r_usuarios["usuarios_creados"],
            usuarios_actualizados=r_usuarios["usuarios_actualizados"],
            asistencias_registradas=r_asistencias["asistencias_registradas"],
            asistencias_omitidas=r_asistencias["asistencias_omitidas"],
            mensaje=f"Sincronización completada. Usuarios: {r_usuarios['usuarios_creados']} creados, {r_usuarios['usuarios_actualizados']} actualizados. Asistencias: {r_asistencias['asistencias_registradas']} registradas, {r_asistencias['asistencias_omitidas']} omitidas.",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en sincronización completa: {str(e)}")
