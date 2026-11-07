from fastapi import HTTPException, status
from pymongo.database import Database


def list_roles(database: Database) -> list[dict]:
    roles = database.roles.find({}, {"_id": 0, "name": 1, "description": 1})
    return sorted(roles, key=lambda role: role["name"])


def get_role_permissions(database: Database, role_name: str) -> list[str]:
    role = database.roles.find_one({"name": role_name})
    if role is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rol no encontrado.",
        )
    return role.get("permissions", [])
