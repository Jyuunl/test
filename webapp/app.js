const STORAGE_KEY = 'planner-items-v1';
const NOTIFIED_KEY = 'planner-notified-v1';
const state = {
  viewYear: new Date().getFullYear(),
  viewMonth: new Date().getMonth(),
  selectedDate: toDateKey(new Date()),
  items: loadItems(),
  notified: new Set(loadNotified()),
};

const monthLabel = document.getElementById('month-label');
const weekdayRow = document.getElementById('weekday-row');
const calendarGrid = document.getElementById('calendar-grid');
const selectedDateLabel = document.getElementById('selected-date-label');
const itemCount = document.getElementById('item-count');
const agendaList = document.getElementById('agenda-list');
const dialog = document.getElementById('item-dialog');
const form = document.getElementById('item-form');
const importDialog = document.getElementById('import-dialog');
const importForm = document.getElementById('import-form');

init();

function init() {
  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach((d) => {
    const el = document.createElement('div');
    el.className = 'weekday';
    el.textContent = d;
    weekdayRow.appendChild(el);
  });

  document.getElementById('prev-month').addEventListener('click', () => changeMonth(-1));
  document.getElementById('next-month').addEventListener('click', () => changeMonth(1));
  document.getElementById('open-form').addEventListener('click', openForm);
  document.getElementById('open-import').addEventListener('click', openImport);
  document.getElementById('enable-notifications').addEventListener('click', enableNotifications);
  form.addEventListener('submit', saveItem);
  importForm.addEventListener('submit', saveImport);

  setInterval(checkReminders, 30_000);
  render();
}

function render() {
  renderCalendar();
  renderAgenda();
}

function renderCalendar() {
  monthLabel.textContent = new Date(state.viewYear, state.viewMonth).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  calendarGrid.innerHTML = '';

  const first = new Date(state.viewYear, state.viewMonth, 1);
  const start = new Date(first);
  start.setDate(start.getDate() - start.getDay());

  for (let i = 0; i < 42; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const key = toDateKey(date);
    const button = document.createElement('button');
    button.className = 'day';
    if (date.getMonth() !== state.viewMonth) button.classList.add('other-month');
    if (key === state.selectedDate) button.classList.add('selected');
    const count = state.items.filter((item) => item.date === key).length;
    button.innerHTML = `<strong>${date.getDate()}</strong>${count ? `<span class="count">${count} item${count === 1 ? '' : 's'}</span>` : ''}`;
    button.addEventListener('click', () => {
      state.selectedDate = key;
      render();
    });
    calendarGrid.appendChild(button);
  }
}

function renderAgenda() {
  const date = new Date(`${state.selectedDate}T00:00:00`);
  selectedDateLabel.textContent = date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  const items = state.items
    .filter((item) => item.date === state.selectedDate)
    .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
  itemCount.textContent = `${items.length} planned`;

  agendaList.innerHTML = '';
  if (!items.length) {
    agendaList.innerHTML = '<p class="meta">No items for this day yet.</p>';
    return;
  }

  const template = document.getElementById('agenda-item-template');
  for (const item of items) {
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector('h4').textContent = item.title;
    node.querySelector('.meta').textContent = `${item.category}${item.time ? ` • ${item.time}` : ''}${item.reminder ? ' • reminder on' : ''}`;
    node.querySelector('.notes').textContent = item.notes || '';
    node.querySelector('.delete').addEventListener('click', () => {
      state.items = state.items.filter((existing) => existing.id !== item.id);
      state.notified.delete(item.id);
      persist();
      persistNotified();
      render();
    });
    agendaList.appendChild(node);
  }
}

function openForm() {
  form.date.value = state.selectedDate;
  dialog.showModal();
}

function saveItem(event) {
  event.preventDefault();
  const payload = {
    id: crypto.randomUUID(),
    title: form.title.value.trim(),
    date: form.date.value,
    time: form.time.value || '',
    category: form.category.value,
    notes: form.notes.value.trim(),
    reminder: form.reminder.checked,
  };
  if (!payload.title || !payload.date) return;
  state.items.push(payload);
  state.selectedDate = payload.date;
  persist();
  dialog.close();
  form.reset();
  render();
}

function openImport() {
  importForm.date.value = state.selectedDate;
  importDialog.showModal();
}

function saveImport(event) {
  event.preventDefault();
  const lines = parsePlan(importForm.plan.value);
  const date = importForm.date.value;
  const category = importForm.category.value;
  for (const title of lines) {
    state.items.push({
      id: crypto.randomUUID(),
      title,
      date,
      time: '',
      category,
      notes: 'Imported from ChatGPT plan',
      reminder: false,
    });
  }
  persist();
  importDialog.close();
  importForm.reset();
  render();
}

function parsePlan(text) {
  return text
    .split('\n')
    .map((line) => line.trim().replace(/^[-*\d.)\s]+/, ''))
    .filter(Boolean);
}

function enableNotifications() {
  if (!('Notification' in window)) {
    alert('This browser does not support notifications.');
    return;
  }
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      alert('Notifications enabled! Keep this tab open for reminder popups.');
      checkReminders();
    }
  });
}

function checkReminders() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const now = new Date();
  const nowDate = toDateKey(now);
  const hhmm = now.toTimeString().slice(0, 5);

  for (const item of state.items) {
    if (!item.reminder || !item.time || item.date !== nowDate || state.notified.has(item.id)) continue;
    if (item.time === hhmm) {
      new Notification(`⏰ ${item.title}`, {
        body: `${item.category}${item.notes ? ` — ${item.notes}` : ''}`,
      });
      state.notified.add(item.id);
      persistNotified();
    }
  }
}

function changeMonth(delta) {
  const next = new Date(state.viewYear, state.viewMonth + delta, 1);
  state.viewYear = next.getFullYear();
  state.viewMonth = next.getMonth();
  renderCalendar();
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function loadItems() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
}

function loadNotified() {
  try {
    return JSON.parse(localStorage.getItem(NOTIFIED_KEY) || '[]');
  } catch {
    return [];
  }
}

function persistNotified() {
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify([...state.notified]));
}
