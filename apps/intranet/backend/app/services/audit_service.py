from datetime import datetime, timezone

from pymongo.database import Database

from app.models.audit_log import AuditLogDocument


def record_audit_event(
    database: Database,
    *,
    action: str,
    outcome: str,
    actor_id: str | None = None,
    target_id: str | None = None,
) -> None:
    event: AuditLogDocument = {
        "action": action,
        "outcome": outcome,
        "occurred_at": datetime.now(timezone.utc),
        "actor_id": actor_id,
        "target_id": target_id,
    }

    database.audit_logs.insert_one(event)
