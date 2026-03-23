from datetime import datetime, timezone
from typing import Any, Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Event


async def record_event(
    db: AsyncSession,
    *,
    patient_id: UUID,
    event_type: str,
    source_type: str,
    title: str,
    description: Optional[str] = None,
    source_id: Optional[UUID] = None,
    occurred_at: Optional[datetime] = None,
    details: Optional[dict[str, Any]] = None,
) -> Event:
    event = Event(
        patient_id=patient_id,
        event_type=event_type,
        source_type=source_type,
        source_id=source_id,
        title=title,
        description=description,
        details=details,
        occurred_at=occurred_at or datetime.now(timezone.utc),
    )
    db.add(event)
    await db.flush()
    return event
