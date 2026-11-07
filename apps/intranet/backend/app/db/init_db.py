from datetime import datetime, timezone
import logging
from uuid import uuid4

from pymongo.database import Database

from app.core.config import Settings
from app.core.security import hash_password

DEFAULT_ROLES = (
    {
        "name": "admin",
        "description": "Acceso total a la intranet.",
        "permissions": ["*"],
    },
    {
        "name": "profesor",
        "description": "Acceso estandar del profesorado.",
        "permissions": ["announcements.read"],
    },
    {
        "name": "director",
        "description": "Acceso de direccion y supervision.",
        "permissions": ["users.read", "roles.read", "announcements.read"],
    },
    {
        "name": "staff",
        "description": "Acceso de gestion general.",
        "permissions": ["users.read", "roles.read"],
    },
)
logger = logging.getLogger(__name__)


def initialize_database(database: Database, settings: Settings) -> None:
    database.users.create_index("email", unique=True)
    database.sessions.create_index("expires_at", expireAfterSeconds=0)
    database.audit_logs.create_index("occurred_at")

    for role in DEFAULT_ROLES:
        database.roles.update_one(
            {"name": role["name"]},
            {"$setOnInsert": role},
            upsert=True,
        )

    credentials = (
        settings.initial_admin_email,
        settings.initial_admin_name,
        settings.initial_admin_password,
    )
    if any(credentials) and not all(credentials):
        raise ValueError(
            "Para crear el administrador inicial configura INITIAL_ADMIN_EMAIL, "
            "INITIAL_ADMIN_NAME e INITIAL_ADMIN_PASSWORD."
        )

    if all(credentials) and database.users.count_documents({}) == 0:
        if len(settings.initial_admin_password) < 12:
            raise ValueError("INITIAL_ADMIN_PASSWORD debe tener al menos 12 caracteres.")
        database.users.insert_one(
            {
                "_id": str(uuid4()),
                "name": settings.initial_admin_name.strip(),
                "surname": "",
                "email": settings.initial_admin_email.strip().lower(),
                "password_hash": hash_password(settings.initial_admin_password),
                "roles": ["admin"],
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
            }
        )
    elif database.users.count_documents({}) == 0:
        logger.warning(
            "No hay usuarios. Configure INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_NAME e "
            "INITIAL_ADMIN_PASSWORD para crear el primer administrador."
        )
