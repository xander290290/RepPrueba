from fastapi import APIRouter, Depends
from pymongo.database import Database

from app.core.security import get_current_user
from app.db.mongodb import get_database
from app.schemas.role import RoleResponse
from app.services.role_service import get_role_permissions, list_roles

router = APIRouter(prefix="/roles", tags=["Roles y permisos"])


@router.get("", response_model=list[RoleResponse])
def get_roles(
    _current_user: dict = Depends(get_current_user),
    database: Database = Depends(get_database),
):
    return list_roles(database)


@router.get("/{role_name}/permissions", response_model=list[str])
def get_permissions(
    role_name: str,
    _current_user: dict = Depends(get_current_user),
    database: Database = Depends(get_database),
):
    return get_role_permissions(database, role_name)
