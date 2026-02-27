from __future__ import annotations

import json
from pathlib import Path

from tracker_app.models import Task


class JsonStorage:
    def __init__(self, path: Path) -> None:
        self.path = path

    def load_tasks(self) -> list[Task]:
        if not self.path.exists():
            return []
        data = json.loads(self.path.read_text(encoding="utf-8"))
        return [Task.from_dict(item) for item in data]

    def save_tasks(self, tasks: list[Task]) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        serialized = [task.to_dict() for task in tasks]
        self.path.write_text(json.dumps(serialized, indent=2), encoding="utf-8")
