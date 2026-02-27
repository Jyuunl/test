from pathlib import Path

from tracker_app.app import TrackerApp, parse_chatgpt_plan
from tracker_app.models import Category
from tracker_app.storage import JsonStorage


def make_app(tmp_path: Path) -> TrackerApp:
    return TrackerApp(JsonStorage(tmp_path / "tasks.json"))


def test_parse_chatgpt_plan_handles_bullets() -> None:
    text = """
    - Monday: Push workout
    * Tuesday: Leg day
      Wednesday: Cardio
    """
    assert parse_chatgpt_plan(text) == [
        "Monday: Push workout",
        "Tuesday: Leg day",
        "Wednesday: Cardio",
    ]


def test_add_import_complete_and_filter(tmp_path: Path) -> None:
    app = make_app(tmp_path)
    app.add_task(Category.SCHEDULE, "Team sync", "2026-01-10", None)
    app.import_tasks(Category.WORKOUT, "- Push\n- Pull")

    open_items = app.list_tasks()
    assert len(open_items) == 3

    completed = app.complete_task(2)
    assert completed is not None
    assert completed.completed is True

    workout_open = app.list_tasks(Category.WORKOUT)
    assert [task.title for task in workout_open] == ["Pull"]

    all_workouts = app.list_tasks(Category.WORKOUT, include_completed=True)
    assert len(all_workouts) == 2
