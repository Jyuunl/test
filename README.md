# Schedule + Workout Tracker

You now have **two ways** to use this project:

1. **CLI app** (`track-planner`) for terminal usage.
2. **Web UI app** (`webapp/`) with a dark calendar + daily agenda.

---

## Open the web app (dark theme)

From repo root:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/webapp/
```

---

## New UI features

- Dark theme by default.
- Monthly calendar with daily item counts.
- Daily agenda panel.
- Add item with optional **time** and **reminder** toggle.
- Browser notifications (when permission is granted).
- “Import ChatGPT plan” button for pasted bullet-list plans.

---

## Notifications (web + phone)

### Web (desktop browser)
1. Open the app.
2. Click **Enable alerts**.
3. Add an item with date + time and keep **Notify me at event time** enabled.
4. Keep the tab open (for this starter implementation).

### Phone
- If you open this from a mobile browser, notifications depend on browser support and permissions.
- For reliable phone notifications when app is closed, the next step is to add:
  - a **Service Worker**,
  - **Web Push** (VAPID),
  - and a backend push service.

---

## ChatGPT integration options

### What is already included
- The app includes an **Import ChatGPT plan** flow where you paste ChatGPT bullet points and convert each line into tasks.

### Full API integration (recommended architecture)
Use a backend so your OpenAI key is never exposed in browser JS:

1. Build backend endpoint (example): `POST /api/chatgpt/plan`
2. Backend calls OpenAI Responses/Chat API with user prompt.
3. Backend returns normalized JSON tasks (title/date/category/time).
4. Web app consumes that JSON and inserts into calendar.

> Important: do **not** put your OpenAI API key directly in `webapp/app.js`.

---

## PC and phone sync

Current web version stores data in browser `localStorage`, so sync is not automatic between devices.

For real sync between PC + phone, add:
- backend API
- shared database (Postgres/Supabase/Firebase/etc.)
- optional auth/login

---

## CLI quick start (optional)

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .
track-planner --help
```

## Development

Run tests:

```bash
PYTHONPATH=src python -m pytest -q
```
