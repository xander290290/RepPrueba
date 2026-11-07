from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    surname: str = Field(default="", max_length=100)
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)
    role: str = Field(default="profesor", min_length=1, max_length=50)


class UserResponse(BaseModel):
    id: str
    name: str
    surname: str
    email: EmailStr
    roles: list[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
