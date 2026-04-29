const EXERCISES = [
  { id: 'pullups',        name: 'Pullups',        type: 'bodyweight' },
  { id: 'pushups',        name: 'Pushups',        type: 'bodyweight' },
  { id: 'squats',         name: 'Squats',         type: 'weighted' },
  { id: 'deadlift',       name: 'Deadlift',       type: 'weighted' },
  { id: 'bench-press',    name: 'Bench Press',    type: 'weighted' },
  { id: 'overhead-press', name: 'Overhead Press',  type: 'weighted' },
];

// DOM refs
const exerciseSelect = document.getElementById('exercise');
const logForm        = document.getElementById('log-form');
const repsInput      = document.getElementById('reps');
const weightInput    = document.getElementById('weight');
const weightGroup    = document.getElementById('weight-group');
const historyList    = document.getElementById('history-list');

// --- Storage helpers ---
function getEntries(exerciseId) {
  const raw = localStorage.getItem(`cmr_${exerciseId}`);
  return raw ? JSON.parse(raw) : [];
}

function saveEntries(exerciseId, entries) {
  localStorage.setItem(`cmr_${exerciseId}`, JSON.stringify(entries));
}

// --- Current exercise ---
function currentExercise() {
  return EXERCISES.find(e => e.id === exerciseSelect.value);
}

// --- Populate dropdown ---
function initDropdown() {
  EXERCISES.forEach(ex => {
    const opt = document.createElement('option');
    opt.value = ex.id;
    opt.textContent = ex.name;
    exerciseSelect.appendChild(opt);
  });

  // Restore last selected
  const last = localStorage.getItem('cmr_lastExercise');
  if (last && EXERCISES.some(e => e.id === last)) {
    exerciseSelect.value = last;
  }
}

// --- Toggle weight field ---
function updateFormFields() {
  const ex = currentExercise();
  const isWeighted = ex && ex.type === 'weighted';
  weightGroup.hidden = !isWeighted;
  if (!isWeighted) weightInput.value = '';
}

// --- Render history ---
function renderHistory() {
  const ex = currentExercise();
  if (!ex) return;

  const entries = getEntries(ex.id);

  if (entries.length === 0) {
    historyList.innerHTML = '<p class="history-empty">No entries yet. Log your first set!</p>';
    return;
  }

  const isWeighted = ex.type === 'weighted';
  let html = '<table class="history-table"><thead><tr>';
  html += '<th>Date</th><th>Reps</th>';
  if (isWeighted) html += '<th>Weight</th><th>Volume</th>';
  html += '<th>Progress</th><th></th>';
  html += '</tr></thead><tbody>';

  // Entries are newest-first
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const prev  = entries[i + 1]; // older entry

    let progressHtml = '<span class="progress-neutral">—</span>';
    if (prev) {
      let change;
      if (isWeighted) {
        const curVol  = entry.reps * (entry.weight || 0);
        const prevVol = prev.reps * (prev.weight || 0);
        change = prevVol === 0 ? 0 : ((curVol - prevVol) / prevVol) * 100;
      } else {
        change = prev.reps === 0 ? 0 : ((entry.reps - prev.reps) / prev.reps) * 100;
      }
      const sign = change > 0 ? '+' : '';
      const cls  = change > 0 ? 'progress-positive' : change < 0 ? 'progress-negative' : 'progress-neutral';
      progressHtml = `<span class="${cls}">${sign}${change.toFixed(1)}%</span>`;
    }

    html += '<tr>';
    html += `<td>${entry.date}</td>`;
    html += `<td>${entry.reps}</td>`;
    if (isWeighted) {
      html += `<td>${entry.weight ?? '—'} kg</td>`;
      html += `<td>${entry.reps * (entry.weight || 0)}</td>`;
    }
    html += `<td>${progressHtml}</td>`;
    html += `<td><button class="delete-btn" data-index="${i}" title="Delete">✕</button></td>`;
    html += '</tr>';
  }

  html += '</tbody></table>';
  historyList.innerHTML = html;

  // Attach delete handlers
  historyList.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index, 10);
      deleteEntry(ex.id, idx);
    });
  });
}

// --- Add entry ---
function addEntry(exerciseId, reps, weight) {
  const entries = getEntries(exerciseId);
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  entries.unshift({ date: today, reps, weight });
  saveEntries(exerciseId, entries);
}

// --- Delete entry ---
function deleteEntry(exerciseId, index) {
  const entries = getEntries(exerciseId);
  entries.splice(index, 1);
  saveEntries(exerciseId, entries);
  renderHistory();
}

// --- Event listeners ---
exerciseSelect.addEventListener('change', () => {
  localStorage.setItem('cmr_lastExercise', exerciseSelect.value);
  updateFormFields();
  renderHistory();
});

logForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const ex = currentExercise();
  if (!ex) return;

  const reps = parseInt(repsInput.value, 10);
  if (!reps || reps < 1) return;

  let weight = null;
  if (ex.type === 'weighted') {
    weight = parseFloat(weightInput.value) || 0;
  }

  addEntry(ex.id, reps, weight);
  repsInput.value = '';
  weightInput.value = '';
  renderHistory();
});

// --- Init ---
initDropdown();
updateFormFields();
renderHistory();

// --- Register service worker ---
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
