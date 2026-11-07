from datetime import datetime
from typing import TypedDict


class UserDocument(TypedDict):
    _id: str
    name: str
    surname: str
    email: str
    password_hash: str
    roles: list[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
