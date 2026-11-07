from contextlib import asynccontextmanager

from fastapi import FastAPI
from pymongo import MongoClient

from app.api import auth, roles, users
from app.core.config import get_settings, validate_runtime_settings
from app.db.init_db import initialize_database


@asynccontextmanager
async def lifespan(application: FastAPI):
    settings = get_settings()
    application.state.database = None
    application.state.mongo_client = None

    if settings.app_env != "test":
        validate_runtime_settings(settings)
        client = MongoClient(settings.mongo_uri, serverSelectionTimeoutMS=5000)
        try:
            client.admin.command("ping")
            database = client[settings.database_name]
            initialize_database(database, settings)
        except Exception:
            client.close()
            raise
        application.state.mongo_client = client
        application.state.database = database

    try:
        yield
    finally:
        if application.state.mongo_client is not None:
            application.state.mongo_client.close()


app = FastAPI(
    title="Intranet Docente API",
    version="1.0.0",
    lifespan=lifespan,
)
app.include_router(auth.router, prefix="/api/intranet/v1")
app.include_router(users.router, prefix="/api/intranet/v1")
app.include_router(roles.router, prefix="/api/intranet/v1")
