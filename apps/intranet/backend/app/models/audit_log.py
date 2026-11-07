from datetime import datetime
from typing import TypedDict


class AuditLogDocument(TypedDict):
    action: str
    outcome: str
    occurred_at: datetime
    actor_id: str | None
    target_id: str | None
