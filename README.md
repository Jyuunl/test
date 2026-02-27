# Schedule + Workout Tracker

You now have **two ways** to use this project:

1. **CLI app** (`track-planner`) for terminal usage.
2. **Web UI app** (`webapp/`) with a clean calendar + day agenda layout.

---

## Open the clean UI app (calendar view)

From the repo root, run:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/webapp/
```

### What the UI includes

- Month calendar with per-day item counts.
- Click any day to view that day's schedule/workout/other items.
- Add new items with title, date, category, and notes.
- Delete items from the day agenda.
- Data is saved in your browser `localStorage`.

---

## PC and phone support

- **PC**: yes, open the web UI in any modern browser.
- **Phone**: yes, if the UI is hosted where your phone can access it (same network server, deployed site, etc.).

---

## Does it sync between PC and phone?

### Web UI version
- Sync is **not automatic by default** because browser `localStorage` is device-specific.
- For true sync, host a backend/API + shared database (or deploy this as a cloud app with account login).

### CLI version
- CLI stores data in local JSON (`~/.track_planner/tasks.json`) unless you pass `--data-file`.
- You can approximate sync by pointing multiple devices to a shared cloud-synced file path.

---

## CLI quick start (optional)

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .
track-planner --help
```

### CLI examples

```bash
track-planner add schedule "Doctor appointment" --due-date 2026-03-15
track-planner import-plan workout $'- Monday: Upper body\n- Tuesday: Lower body'
track-planner list --category workout
track-planner complete 2
```

---

## Development

Run tests:

```bash
PYTHONPATH=src python -m pytest -q
```
