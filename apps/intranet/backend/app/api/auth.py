from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database

from app.core.config import get_settings
from app.core.security import get_current_user
from app.db.mongodb import get_database
from app.schemas.auth import (
    LoginRequest,
    MessageResponse,
    RefreshTokenRequest,
    TokenResponse,
)
from app.services.audit_service import record_audit_event
from app.services.auth_service import (
    authenticate_user,
    create_session,
    refresh_session,
    revoke_session,
)

router = APIRouter(prefix="/auth", tags=["Autenticacion"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, database: Database = Depends(get_database)):
    try:
        user = authenticate_user(database, str(payload.email), payload.password)
    except HTTPException as exc:
        if exc.status_code == status.HTTP_401_UNAUTHORIZED:
            record_audit_event(
                database,
                action="auth.login",
                outcome="failure",
            )
        raise

    tokens = create_session(database, user, get_settings())
    record_audit_event(
        database,
        action="auth.login",
        outcome="success",
        actor_id=user["_id"],
    )
    return tokens


@router.post("/refresh", response_model=TokenResponse)
def refresh(
    payload: RefreshTokenRequest,
    database: Database = Depends(get_database),
):
    return refresh_session(database, payload.refresh_token, get_settings())


@router.post("/logout", response_model=MessageResponse)
def logout(
    current_user: dict = Depends(get_current_user),
    database: Database = Depends(get_database),
):
    revoke_session(database, current_user["session_id"], current_user["_id"])
    record_audit_event(
        database,
        action="auth.logout",
        outcome="success",
        actor_id=current_user["_id"],
    )
    return {"message": "Sesion cerrada correctamente."}
