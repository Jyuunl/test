# Schedule + Workout Tracker

A lightweight Python CLI app to track:
- daily schedule items,
- workout plans generated from ChatGPT,
- and any other personal tasks.

## Features

- Add tasks by category: `schedule`, `workout`, `other`.
- Import multiple tasks from a ChatGPT bullet-list plan.
- List open tasks (or include completed tasks).
- Mark tasks complete.
- Persist data locally in JSON.

## Quick start (PC)

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .
track-planner --help
```

## Usage examples

### Add a schedule item

```bash
track-planner add schedule "Doctor appointment" --due-date 2026-03-15 --notes "Bring insurance card"
```

### Import a ChatGPT workout plan

```bash
track-planner import-plan workout $'- Monday: Upper body\n- Tuesday: Lower body\n- Wednesday: Cardio'
```

### List tasks

```bash
track-planner list
track-planner list --category workout
track-planner list --all
```

### Complete a task

```bash
track-planner complete 2
```

## Can I use this on PC and phone?

Yes, but today this is a **CLI app** (terminal app), not a mobile app UI.

- **PC**: works directly in Terminal/PowerShell once Python is installed.
- **Phone**: possible through a terminal app that supports Python.
  - Android examples: Termux, Pydroid (depending on setup).
  - iPhone/iPad examples: Pythonista / shell-style apps (with limitations).

## Does it sync between devices?

Not automatically yet.

Right now, the app stores tasks in a local JSON file:

```text
~/.track_planner/tasks.json
```

To share data between devices, point both installs to the same synced file location (for example, a cloud-synced folder):

```bash
track-planner --data-file /path/to/synced-folder/tasks.json list
```

If both devices use the same synced file path, they can stay in sync via that file service.

> Tip: avoid editing from both devices at exactly the same time to reduce overwrite conflicts.

## Development

Run tests:

```bash
PYTHONPATH=src python -m pytest -q
```
