from __future__ import annotations

from dataclasses import dataclass, asdict, field
from datetime import datetime
from enum import Enum


class Category(str, Enum):
    SCHEDULE = "schedule"
    WORKOUT = "workout"
    OTHER = "other"


@dataclass
class Task:
    id: int
    category: Category
    title: str
    due_date: str | None = None
    notes: str | None = None
    completed: bool = False
    created_at: str = field(default_factory=lambda: datetime.now().isoformat(timespec="seconds"))

    def to_dict(self) -> dict:
        data = asdict(self)
        data["category"] = self.category.value
        return data

    @classmethod
    def from_dict(cls, data: dict) -> "Task":
        return cls(
            id=int(data["id"]),
            category=Category(data["category"]),
            title=data["title"],
            due_date=data.get("due_date"),
            notes=data.get("notes"),
            completed=bool(data.get("completed", False)),
            created_at=data.get("created_at", datetime.now().isoformat(timespec="seconds")),
        )
