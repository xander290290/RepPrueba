from datetime import datetime, timezone
from uuid import uuid4

from fastapi import HTTPException, status
from pymongo.database import Database
from pymongo.errors import DuplicateKeyError

from app.core.security import hash_password
from app.schemas.user import UserCreate


def serialize_user(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "surname": user.get("surname", ""),
        "email": user["email"],
        "roles": user.get("roles", []),
        "created_at": user["created_at"],
    }


def create_user(database: Database, payload: UserCreate) -> dict:
    role = database.roles.find_one({"name": payload.role})
    if role is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="El rol indicado no existe.",
        )

    now = datetime.now(timezone.utc)
    document = {
        "_id": str(uuid4()),
        "name": payload.name.strip(),
        "surname": payload.surname.strip(),
        "email": str(payload.email).lower(),
        "password_hash": hash_password(payload.password),
        "roles": [payload.role],
        "is_active": True,
        "created_at": now,
        "updated_at": now,
    }
    try:
        database.users.insert_one(document)
    except DuplicateKeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un usuario con ese correo.",
        ) from exc

    return serialize_user(document)


def get_user(database: Database, user_id: str) -> dict:
    user = database.users.find_one({"_id": user_id})
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )
    return serialize_user(user)


def list_users(database: Database, limit: int, skip: int) -> list[dict]:
    users = database.users.find().sort("email", 1).skip(skip).limit(limit)
    return [serialize_user(user) for user in users]
