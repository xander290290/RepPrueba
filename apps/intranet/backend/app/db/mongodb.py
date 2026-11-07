from fastapi import HTTPException, Request, status
from pymongo.database import Database


def get_database(request: Request) -> Database:
    database = getattr(request.app.state, "database", None)
    if database is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="La base de datos no esta disponible.",
        )
    return database
