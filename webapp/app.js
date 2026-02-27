const STORAGE_KEY = 'planner-items-v1';
const state = {
  today: new Date(),
  viewYear: new Date().getFullYear(),
  viewMonth: new Date().getMonth(),
  selectedDate: toDateKey(new Date()),
  items: loadItems(),
};

const monthLabel = document.getElementById('month-label');
const weekdayRow = document.getElementById('weekday-row');
const calendarGrid = document.getElementById('calendar-grid');
const selectedDateLabel = document.getElementById('selected-date-label');
const itemCount = document.getElementById('item-count');
const agendaList = document.getElementById('agenda-list');
const dialog = document.getElementById('item-dialog');
const form = document.getElementById('item-form');

init();

function init() {
  ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach((d) => {
    const el = document.createElement('div'); el.className = 'weekday'; el.textContent = d; weekdayRow.appendChild(el);
  });
  document.getElementById('prev-month').addEventListener('click', () => changeMonth(-1));
  document.getElementById('next-month').addEventListener('click', () => changeMonth(1));
  document.getElementById('open-form').addEventListener('click', openForm);
  form.addEventListener('submit', saveItem);
  render();
}

function render() { renderCalendar(); renderAgenda(); }

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
    button.addEventListener('click', () => { state.selectedDate = key; render(); });
    calendarGrid.appendChild(button);
  }
}

function renderAgenda() {
  const date = new Date(`${state.selectedDate}T00:00:00`);
  selectedDateLabel.textContent = date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  const items = state.items.filter((item) => item.date === state.selectedDate);
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
    node.querySelector('.meta').textContent = item.category;
    node.querySelector('.notes').textContent = item.notes || '';
    node.querySelector('.delete').addEventListener('click', () => {
      state.items = state.items.filter((existing) => existing.id !== item.id);
      persist();
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
    category: form.category.value,
    notes: form.notes.value.trim(),
  };
  if (!payload.title || !payload.date) return;
  state.items.push(payload);
  state.selectedDate = payload.date;
  persist();
  dialog.close();
  form.reset();
  render();
}

function changeMonth(delta) {
  const next = new Date(state.viewYear, state.viewMonth + delta, 1);
  state.viewYear = next.getFullYear();
  state.viewMonth = next.getMonth();
  renderCalendar();
}

function toDateKey(date) { return date.toISOString().slice(0, 10); }
function loadItems() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}
function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items)); }
