from fastapi import APIRouter, Depends, Query, status
from pymongo.database import Database

from app.core.security import get_current_user, require_permission
from app.db.mongodb import get_database
from app.schemas.user import UserCreate, UserResponse
from app.services.audit_service import record_audit_event
from app.services.user_service import (
    create_user,
    list_users,
    serialize_user,
)

router = APIRouter(prefix="/users", tags=["Usuarios"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    payload: UserCreate,
    _admin: dict = Depends(require_permission("users.write")),
    database: Database = Depends(get_database),
):
    user = create_user(database, payload)
    record_audit_event(
        database,
        action="users.register",
        outcome="success",
        actor_id=_admin["_id"],
        target_id=user["id"],
    )
    return user


@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return serialize_user(current_user)


@router.get("", response_model=list[UserResponse])
def get_users(
    limit: int = Query(default=50, ge=1, le=100),
    skip: int = Query(default=0, ge=0),
    _admin: dict = Depends(require_permission("users.read")),
    database: Database = Depends(get_database),
):
    return list_users(database, limit, skip)
