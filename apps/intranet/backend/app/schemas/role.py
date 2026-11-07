from pydantic import BaseModel, Field


class RoleResponse(BaseModel):
    name: str
    description: str


class PermissionResponse(BaseModel):
    permissions: list[str] = Field(default_factory=list)
