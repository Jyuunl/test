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

## Quick start

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .
```

Then run:

```bash
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

## Data storage

By default, tasks are stored in:

```text
~/.track_planner/tasks.json
```

You can override with:

```bash
track-planner --data-file ./my_tasks.json list
```

## Development

Run tests:

```bash
PYTHONPATH=src python -m pytest -q
```
