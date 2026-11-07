from typing import TypedDict


class RoleDocument(TypedDict):
    name: str
    description: str
    permissions: list[str]
