from __future__ import annotations

import argparse
from pathlib import Path

from tracker_app.models import Category, Task
from tracker_app.storage import JsonStorage

DEFAULT_DATA_FILE = Path.home() / ".track_planner" / "tasks.json"


def parse_chatgpt_plan(plan_text: str) -> list[str]:
    lines = [line.strip(" -*\t") for line in plan_text.splitlines()]
    return [line for line in lines if line]


class TrackerApp:
    def __init__(self, storage: JsonStorage) -> None:
        self.storage = storage

    def add_task(self, category: Category, title: str, due_date: str | None, notes: str | None) -> Task:
        tasks = self.storage.load_tasks()
        next_id = max((task.id for task in tasks), default=0) + 1
        task = Task(id=next_id, category=category, title=title, due_date=due_date, notes=notes)
        tasks.append(task)
        self.storage.save_tasks(tasks)
        return task

    def import_tasks(self, category: Category, plan_text: str) -> list[Task]:
        tasks = self.storage.load_tasks()
        next_id = max((task.id for task in tasks), default=0) + 1
        new_tasks: list[Task] = []
        for offset, line in enumerate(parse_chatgpt_plan(plan_text)):
            new_tasks.append(Task(id=next_id + offset, category=category, title=line))
        tasks.extend(new_tasks)
        self.storage.save_tasks(tasks)
        return new_tasks

    def list_tasks(self, category: Category | None = None, include_completed: bool = False) -> list[Task]:
        tasks = self.storage.load_tasks()
        if category:
            tasks = [task for task in tasks if task.category == category]
        if not include_completed:
            tasks = [task for task in tasks if not task.completed]
        return tasks

    def complete_task(self, task_id: int) -> Task | None:
        tasks = self.storage.load_tasks()
        for task in tasks:
            if task.id == task_id:
                task.completed = True
                self.storage.save_tasks(tasks)
                return task
        return None


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Track schedule, workout, and other goals.")
    parser.add_argument("--data-file", type=Path, default=DEFAULT_DATA_FILE, help="Path to tasks JSON storage")

    subparsers = parser.add_subparsers(dest="command", required=True)

    add_parser = subparsers.add_parser("add", help="Add a single item")
    add_parser.add_argument("category", type=Category, choices=list(Category))
    add_parser.add_argument("title")
    add_parser.add_argument("--due-date")
    add_parser.add_argument("--notes")

    import_parser = subparsers.add_parser("import-plan", help="Import bullet points copied from ChatGPT")
    import_parser.add_argument("category", type=Category, choices=list(Category))
    import_parser.add_argument("plan_text", help="Quoted multiline text or bullet list")

    list_parser = subparsers.add_parser("list", help="List tasks")
    list_parser.add_argument("--category", type=Category, choices=list(Category))
    list_parser.add_argument("--all", action="store_true", help="Include completed tasks")

    complete_parser = subparsers.add_parser("complete", help="Mark task as complete")
    complete_parser.add_argument("task_id", type=int)

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    app = TrackerApp(JsonStorage(args.data_file))

    if args.command == "add":
        task = app.add_task(args.category, args.title, args.due_date, args.notes)
        print(f"Added [{task.id}] {task.category}: {task.title}")
    elif args.command == "import-plan":
        tasks = app.import_tasks(args.category, args.plan_text)
        print(f"Imported {len(tasks)} tasks into {args.category}.")
    elif args.command == "list":
        tasks = app.list_tasks(args.category, include_completed=args.all)
        if not tasks:
            print("No tasks found.")
            return
        for task in tasks:
            due = f" (due {task.due_date})" if task.due_date else ""
            state = "✓" if task.completed else "•"
            print(f"{state} [{task.id}] {task.category}: {task.title}{due}")
    elif args.command == "complete":
        task = app.complete_task(args.task_id)
        if task is None:
            print(f"Task {args.task_id} not found.")
            raise SystemExit(1)
        print(f"Completed [{task.id}] {task.title}")


if __name__ == "__main__":
    main()
