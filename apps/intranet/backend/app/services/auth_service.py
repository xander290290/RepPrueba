from datetime import datetime, timedelta, timezone
from uuid import uuid4

from fastapi import HTTPException, status
from pymongo import ReturnDocument
from pymongo.database import Database

from app.core.config import Settings
from app.core.security import (
    create_token,
    decode_token,
    verify_password,
)


def authenticate_user(database: Database, email: str, password: str) -> dict:
    user = database.users.find_one({"email": email.lower(), "is_active": True})
    if user is None or not verify_password(password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contrasena incorrectos.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def create_session(database: Database, user: dict, settings: Settings) -> dict:
    session_id = str(uuid4())
    refresh_expires = timedelta(days=settings.jwt_refresh_token_expire_days)
    access_expires = timedelta(minutes=settings.jwt_access_token_expire_minutes)
    refresh_token, refresh_jti = create_token(
        subject=user["_id"],
        session_id=session_id,
        token_type="refresh",
        expires_delta=refresh_expires,
    )
    access_token, _ = create_token(
        subject=user["_id"],
        session_id=session_id,
        token_type="access",
        expires_delta=access_expires,
    )

    database.sessions.insert_one(
        {
            "_id": session_id,
            "user_id": user["_id"],
            "refresh_jti": refresh_jti,
            "revoked": False,
            "expires_at": datetime.now(timezone.utc) + refresh_expires,
        }
    )
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": int(access_expires.total_seconds()),
    }


def refresh_session(
    database: Database,
    raw_refresh_token: str,
    settings: Settings,
) -> dict:
    payload = decode_token(raw_refresh_token)
    if payload["type"] != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de renovacion no valido.",
        )

    new_refresh_jti = str(uuid4())
    session = database.sessions.find_one_and_update(
        {
            "_id": payload["sid"],
            "user_id": payload["sub"],
            "refresh_jti": payload["jti"],
            "revoked": False,
        },
        {"$set": {"refresh_jti": new_refresh_jti}},
        return_document=ReturnDocument.AFTER,
    )
    user = database.users.find_one({"_id": payload["sub"], "is_active": True})
    if session is None or user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de renovacion invalido, caducado o ya utilizado.",
        )

    access_expires = timedelta(minutes=settings.jwt_access_token_expire_minutes)
    refresh_expires = timedelta(days=settings.jwt_refresh_token_expire_days)
    access_token, _ = create_token(
        subject=user["_id"],
        session_id=payload["sid"],
        token_type="access",
        expires_delta=access_expires,
    )
    refresh_token, actual_refresh_jti = create_token(
        subject=user["_id"],
        session_id=payload["sid"],
        token_type="refresh",
        expires_delta=refresh_expires,
        token_id=new_refresh_jti,
    )
    database.sessions.update_one(
        {"_id": payload["sid"], "refresh_jti": actual_refresh_jti},
        {"$set": {"expires_at": datetime.now(timezone.utc) + refresh_expires}},
    )
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": int(access_expires.total_seconds()),
    }


def revoke_session(database: Database, session_id: str, user_id: str) -> None:
    database.sessions.update_one(
        {"_id": session_id, "user_id": user_id, "revoked": False},
        {"$set": {"revoked": True}},
    )
