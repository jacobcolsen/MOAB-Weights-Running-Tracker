// ============================================================
//  MOAB Weight Training — Phase 1: App Shell
//  Mobile-first · localStorage · No backend
// ============================================================

'use strict';

// ============================================================
//  WEEKLY SCHEDULE
//  Index = JS day-of-week (0 = Sunday, 1 = Monday, …)
// ============================================================

const WEEKLY_SCHEDULE = {
  0: {
    type: 'rest',
    name: 'Rest Day',
    sub:  'Recovery & restoration',
    color: 'rest',
    emoji: '🛌',
  },
  1: {
    type: 'push',
    name: 'Push Strength',
    sub:  'Chest · Shoulders · Triceps',
    color: 'push',
    emoji: '🏋️',
  },
  2: {
    type: 'run',
    name: 'Run Training',
    sub:  'Intervals · Speed · 2-Mile Program',
    color: 'run',
    emoji: '🏃',
  },
  3: {
    type: 'pull',
    name: 'Pull Strength',
    sub:  'Back · Biceps · Rear Delts',
    color: 'pull',
    emoji: '🏋️',
  },
  4: {
    type: 'run',
    name: 'Run Training',
    sub:  'Tempo · Aerobic Base · 2-Mile Program',
    color: 'run',
    emoji: '🏃',
  },
  5: {
    type: 'legs',
    name: 'Legs Strength',
    sub:  'Quads · Hamstrings · Glutes · Calves',
    color: 'legs',
    emoji: '🦵',
  },
  6: {
    type: 'optional',
    name: 'Optional Recovery',
    sub:  'Mobility · Stretching · Light Activity',
    color: 'optional',
    emoji: '🧘',
  },
};

// ============================================================
//  WORKOUT LIBRARY (Workouts tab — Phase 1 preview)
// ============================================================

const WORKOUT_LIBRARY = [
  {
    type: 'push',
    name: 'Push Strength',
    day: 'Monday',
    sub: 'Horizontal & vertical pushing — chest, shoulders, triceps',
    exercises: ['Bench Press', 'Overhead Press', 'Incline DB Press', 'Lateral Raise', 'Tricep Pushdown'],
  },
  {
    type: 'pull',
    name: 'Pull Strength',
    day: 'Wednesday',
    sub: 'Horizontal & vertical pulling — back, biceps, rear delts',
    exercises: ['Deadlift', 'Barbell Row', 'Pull-up', 'Face Pull', 'Bicep Curl'],
  },
  {
    type: 'legs',
    name: 'Legs Strength',
    day: 'Friday',
    sub: 'Lower body compound & accessory movements',
    exercises: ['Back Squat', 'Romanian Deadlift', 'Leg Press', 'Walking Lunge', 'Calf Raise'],
  },
  {
    type: 'run',
    name: 'Run Training',
    day: 'Tue & Thu',
    sub: '12-week program to improve your 2-mile time',
    exercises: ['Interval Sprints', 'Tempo Runs', 'Easy Aerobic Runs', 'Strides', '2-Mile Time Trial'],
  },
  {
    type: 'optional',
    name: 'Recovery & Mobility',
    day: 'Saturday (optional)',
    sub: 'Light movement to aid recovery and prevent injury',
    exercises: ['Hip Flexor Stretch', 'Thoracic Rotation', 'Foam Rolling', 'Light Walk', 'Yoga Flow'],
  },
];

// ============================================================
//  STORAGE
// ============================================================

const Store = {
  KEYS: {
    START:    'moab_start',       // program start date string YYYY-MM-DD
    LOGS:     'moab_day_logs',    // { 'YYYY-MM-DD': { status, ... } }
    MOVES:    'moab_moves',       // { 'from-date': 'to-date' }
    EXTRA:    'moab_extra',       // { 'YYYY-MM-DD': workoutType } from moves
    UNIT:     'moab_unit',        // 'lbs' | 'kg'
  },

  get(key)      { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
  rm(key)       { localStorage.removeItem(key); },

  getProgramStart() {
    const s = this.get(this.KEYS.START);
    return s ? fromDateStr(s) : null;
  },

  setProgramStart(d) { this.set(this.KEYS.START, toDateStr(d)); },

  getLogs()  { return this.get(this.KEYS.LOGS)  || {}; },
  getMoves() { return this.get(this.KEYS.MOVES) || {}; },
  getExtra() { return this.get(this.KEYS.EXTRA) || {}; },

  getDayLog(dateStr) { return this.getLogs()[dateStr] || null; },

  setDayLog(dateStr, data) {
    const logs = this.getLogs();
    logs[dateStr] = { ...logs[dateStr], ...data };
    this.set(this.KEYS.LOGS, logs);
  },

  recordMove(fromStr, toStr) {
    const moves = this.getMoves();
    moves[fromStr] = toStr;
    this.set(this.KEYS.MOVES, moves);

    // Mark the original day as "moved away"
    this.setDayLog(fromStr, { status: 'moved', movedTo: toStr });

    // Record an extra workout on the destination day
    const extra = this.getExtra();
    extra[toStr] = this.getWorkoutTypeForDate(fromDateStr(fromStr));
    this.set(this.KEYS.EXTRA, extra);
  },

  getWorkoutTypeForDate(d) {
    // Check if there's a moved-in workout for this date
    const extra = this.getExtra();
    const ds = toDateStr(d);
    if (extra[ds]) return extra[ds];
    return d.getDay();  // fall back to default day-of-week
  },

  getUnit()   { return this.get(this.KEYS.UNIT) || 'lbs'; },
  setUnit(u)  { this.set(this.KEYS.UNIT, u); },

  clearAll() {
    Object.values(this.KEYS).forEach(k => localStorage.removeItem(k));
  },
};

// ============================================================
//  DATE UTILITIES
// ============================================================

const MONTHS      = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_S    = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS_LONG   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DAYS_SHORT  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function today() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function fromDateStr(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function getMondayOf(d) {
  const day  = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(d, diff);
}

function getProgramWeek(d) {
  const start = Store.getProgramStart();
  if (!start) return 1;
  const startMon = getMondayOf(start);
  const thisMon  = getMondayOf(d);
  const diff = Math.round((thisMon - startMon) / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, diff + 1);
}

// ============================================================
//  WORKOUT LOOKUP
// ============================================================

// Returns the WEEKLY_SCHEDULE entry for a given date,
// accounting for any "moved-in" workouts.
function getScheduledWorkout(d) {
  const extra = Store.getExtra();
  const ds    = toDateStr(d);
  if (extra[ds]) {
    // A workout was moved to this day — look it up
    const dayIdx = typeof extra[ds] === 'number'
      ? extra[ds]
      : Object.values(WEEKLY_SCHEDULE).findIndex(w => w.type === extra[ds]);
    return WEEKLY_SCHEDULE[dayIdx >= 0 ? dayIdx : d.getDay()];
  }
  return WEEKLY_SCHEDULE[d.getDay()];
}

// Looks ahead up to 7 days to find the next non-rest workout
function findNextWorkout(fromDate) {
  for (let i = 1; i <= 7; i++) {
    const d  = addDays(fromDate, i);
    const w  = getScheduledWorkout(d);
    const ds = toDateStr(d);
    const log = Store.getDayLog(ds);
    if (w.type !== 'rest' && (!log || log.status !== 'moved')) {
      const label = i === 1 ? 'Tomorrow' : DAYS_LONG[d.getDay()];
      return { workout: w, date: d, label };
    }
  }
  return null;
}

// ============================================================
//  APP STATE
// ============================================================

const state = {
  view:           'today',   // current top-level view
  schedWeekOff:   0,         // week offset for schedule tab (0 = current)
  modalOpen:      false,
  modalDateStr:   null,      // date the Move modal is for
  resetConfirm:   false,
};

// ============================================================
//  RENDER HELPERS
// ============================================================

function setView(html) {
  document.getElementById('view').innerHTML = html;
}

function setTitle(t) {
  document.getElementById('header-title').textContent = t;
}

function showBack(show) {
  document.getElementById('back-btn').classList.toggle('hidden', !show);
}

function showNav(show) {
  document.getElementById('bottom-nav').style.visibility = show ? '' : 'hidden';
}

function setActiveNav(v) {
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.view === v);
  });
}

function showModal(html) {
  const overlay = document.getElementById('overlay');
  const modal   = document.getElementById('modal');
  overlay.classList.remove('hidden');
  modal.classList.remove('hidden');
  modal.innerHTML = html;
  modal.classList.add('slide-up');
  state.modalOpen = true;
}

function hideModal() {
  document.getElementById('overlay').classList.add('hidden');
  document.getElementById('modal').classList.add('hidden');
  document.getElementById('modal').innerHTML = '';
  state.modalOpen = false;
}

// ============================================================
//  VIEW: TODAY
// ============================================================

function renderToday() {
  setTitle('MOAB');
  showBack(false);
  showNav(true);
  setActiveNav('today');

  const t       = today();
  const ds      = toDateStr(t);
  const wkt     = getScheduledWorkout(t);
  const log     = Store.getDayLog(ds);
  const week    = getProgramWeek(t);
  const status  = log?.status || 'pending';

  const header = buildTodayHeader(t, week);

  let body = '';

  if (wkt.type === 'rest') {
    body = buildRestDay(t);
  } else if (status === 'completed') {
    body = buildTodayCompleted(ds, wkt, log);
  } else if (status === 'skipped') {
    body = buildTodaySkipped(ds, wkt);
  } else if (status === 'moved') {
    // This day's workout was moved — treat as rest
    body = buildMovedAway(t, log);
  } else {
    body = buildTodayWorkout(ds, wkt);
  }

  setView(`<div class="pad fade-up">${header}${body}</div>`);
}

function buildTodayHeader(d, week) {
  return `
    <div class="today-header">
      <div class="today-dayname">${DAYS_LONG[d.getDay()]}</div>
      <div class="today-datenum">${d.getDate()}</div>
      <div class="today-monthyear">${MONTHS[d.getMonth()]} ${d.getFullYear()}</div>
    </div>
    <div class="text-center mb-16">
      <span class="eyebrow">Program · Week ${week}</span>
    </div>
  `;
}

function buildTodayWorkout(ds, wkt) {
  return `
    <div class="workout-card ${wkt.color}">
      <div class="type-pill ${wkt.color}">${wkt.emoji} &nbsp;${labelForType(wkt.type)}</div>
      <div class="workout-card-title">${wkt.name}</div>
      <div class="workout-card-sub">${wkt.sub}</div>
    </div>

    <button class="btn btn-primary mt-4" data-action="start-workout" data-date="${ds}">
      Start Workout
    </button>

    <div class="btn-row mt-12">
      <button class="btn btn-secondary btn-sm" data-action="skip-workout" data-date="${ds}">
        Skip
      </button>
      <button class="btn btn-secondary btn-sm" data-action="open-move-modal" data-date="${ds}">
        Move / Flex
      </button>
    </div>
  `;
}

function buildTodayCompleted(ds, wkt, log) {
  const time = log.completedAt
    ? new Date(log.completedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : '';
  const next = findNextWorkout(today());

  return `
    <div class="done-banner">
      <div class="done-icon">✅</div>
      <div class="done-title">${wkt.name} Done</div>
      <div class="done-sub">${time ? `Finished at ${time}` : 'Completed today'}</div>
    </div>

    ${next ? `
      <div class="next-card">
        <div class="next-label">Next Up</div>
        <div class="next-name">${next.workout.name}</div>
        <div class="next-sub">${next.label} · ${next.workout.sub}</div>
      </div>` : ''}

    <button class="btn btn-secondary mt-16" data-action="undo-workout" data-date="${ds}">
      Undo
    </button>
  `;
}

function buildTodaySkipped(ds, wkt) {
  const next = findNextWorkout(today());
  return `
    <div class="skipped-banner">
      <div class="skipped-title">Skipped Today</div>
      <div class="skipped-sub">${wkt.name} was skipped.</div>
    </div>

    ${next ? `
      <div class="next-card">
        <div class="next-label">Next Up</div>
        <div class="next-name">${next.workout.name}</div>
        <div class="next-sub">${next.label} · ${next.workout.sub}</div>
      </div>` : ''}

    <button class="btn btn-ghost mt-16" data-action="undo-workout" data-date="${ds}">
      Changed my mind — Log it
    </button>
  `;
}

function buildMovedAway(d, log) {
  const toDate    = log.movedTo ? fromDateStr(log.movedTo) : null;
  const movedLabel = toDate
    ? `Moved to ${DAYS_LONG[toDate.getDay()]}, ${MONTHS_S[toDate.getMonth()]} ${toDate.getDate()}`
    : 'Moved to another day';
  const next = findNextWorkout(d);

  return `
    <div class="rest-view">
      <div class="rest-icon">📆</div>
      <div class="rest-title">Workout Moved</div>
      <div class="rest-sub">${movedLabel}</div>
    </div>
    ${next ? `
      <div class="next-card">
        <div class="next-label">Next Up</div>
        <div class="next-name">${next.workout.name}</div>
        <div class="next-sub">${next.label} · ${next.workout.sub}</div>
      </div>` : ''}
  `;
}

function buildRestDay(d) {
  const next = findNextWorkout(d);
  return `
    <div class="rest-view">
      <div class="rest-icon">🛌</div>
      <div class="rest-title">Rest Day</div>
      <div class="rest-sub">Recovery is part of the program.<br>Eat well, sleep long, show up tomorrow.</div>
    </div>
    ${next ? `
      <div class="next-card">
        <div class="next-label">Next Up</div>
        <div class="next-name">${next.workout.name}</div>
        <div class="next-sub">${next.label} · ${next.workout.sub}</div>
      </div>` : ''}
  `;
}

// ============================================================
//  VIEW: SCHEDULE
// ============================================================

function renderSchedule() {
  setTitle('Schedule');
  showBack(false);
  showNav(true);
  setActiveNav('schedule');

  const t      = today();
  const base   = addDays(getMondayOf(t), state.schedWeekOff * 7);
  const monday = getMondayOf(base);
  const week   = getProgramWeek(monday);

  const isThisWeek = state.schedWeekOff === 0;
  const weekLabel  = isThisWeek ? 'This Week'
    : state.schedWeekOff === -1 ? 'Last Week'
    : state.schedWeekOff === 1  ? 'Next Week'
    : `${MONTHS_S[monday.getMonth()]} ${monday.getDate()}`;

  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));

  const rows = days.map(d => {
    const ds   = toDateStr(d);
    const wkt  = getScheduledWorkout(d);
    const log  = Store.getDayLog(ds);
    const status = log?.status || 'pending';
    const isToday = ds === toDateStr(t);
    const isRest  = wkt.type === 'rest';

    let rowClass = '';
    if (isToday)           rowClass += ' is-today';
    if (status === 'completed') rowClass += ' is-done';
    if (status === 'skipped')   rowClass += ' is-skipped';
    if (isRest)            rowClass += ' is-rest';

    let statusIcon = '';
    if (status === 'completed')  statusIcon = '✅';
    else if (status === 'skipped') statusIcon = '—';
    else if (status === 'moved')   statusIcon = '📆';
    else if (!isRest)              statusIcon = isToday ? '→' : '○';

    return `
      <div class="sched-row${rowClass}"
           data-action="${isRest ? '' : 'sched-tap'}"
           data-date="${ds}">
        <div class="sched-date">
          <div class="sched-date-abbr">${DAYS_SHORT[d.getDay()]}</div>
          <div class="sched-date-num">${d.getDate()}</div>
        </div>
        <div class="sched-info">
          <div class="sched-name">${wkt.name}</div>
          <div class="sched-sub">${wkt.sub}</div>
        </div>
        <div class="sched-status">${statusIcon}</div>
      </div>
    `;
  }).join('');

  setView(`
    <div class="pad fade-up pb-safe">
      <div class="week-nav">
        <button class="week-nav-btn" data-action="sched-nav" data-delta="-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div class="text-center">
          <div class="week-nav-label">${weekLabel}</div>
          <div class="week-nav-sublabel">Program Week ${week}</div>
        </div>
        <button class="week-nav-btn" data-action="sched-nav" data-delta="1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
      ${rows}
    </div>
  `);
}

// ============================================================
//  VIEW: WORKOUTS
// ============================================================

function renderWorkouts() {
  setTitle('Workouts');
  showBack(false);
  showNav(true);
  setActiveNav('workouts');

  const cards = WORKOUT_LIBRARY.map(w => `
    <div class="workout-library-card ${w.type}">
      <div class="type-pill ${w.type}">${labelForType(w.type)}</div>
      <div class="wl-title">${w.name}</div>
      <div class="wl-sub">${w.day} &nbsp;·&nbsp; ${w.sub}</div>
      <div class="exercise-list">
        ${w.exercises.map(e => `<span class="exercise-chip">${e}</span>`).join('')}
      </div>
      <div class="coming-soon-note">Sets, reps & logging coming in Phase 2 →</div>
    </div>
  `).join('');

  setView(`
    <div class="pad fade-up pb-safe">
      <p class="text-muted text-sm mb-16" style="line-height:1.6;">
        Your full workout program at a glance.
        Exercise details and logging will be built out in the next phase.
      </p>
      ${cards}
    </div>
  `);
}

// ============================================================
//  VIEW: PROGRESS
// ============================================================

function renderProgress() {
  setTitle('Progress');
  showBack(false);
  showNav(true);
  setActiveNav('progress');

  const t     = today();
  const logs  = Store.getLogs();
  const start = Store.getProgramStart();

  // This-week dots
  const monday = getMondayOf(t);
  const weekDots = Array.from({ length: 7 }, (_, i) => {
    const d   = addDays(monday, i);
    const ds  = toDateStr(d);
    const wkt = getScheduledWorkout(d);
    const log = Store.getDayLog(ds);
    const status = log?.status || 'pending';
    const isToday = ds === toDateStr(t);

    let cls = 'pending';
    if (wkt.type === 'rest')        cls = 'rest';
    if (status === 'completed')     cls = 'done';
    if (status === 'skipped')       cls = 'skipped';
    if (isToday && cls === 'pending') cls = 'pending';

    const extra = isToday ? ' today' : '';
    return `<div class="week-dot ${cls}${extra}">${DAYS_SHORT[d.getDay()].charAt(0)}</div>`;
  }).join('');

  // All-time counts
  const allDates  = Object.keys(logs);
  const totalDone = allDates.filter(d => logs[d]?.status === 'completed').length;
  const totalSkip = allDates.filter(d => logs[d]?.status === 'skipped').length;
  const currentWeek = getProgramWeek(t);

  // Streak: count consecutive days from today backwards
  let streak = 0;
  let check  = today();
  for (let i = 0; i < 60; i++) {
    const ds  = toDateStr(check);
    const wkt = getScheduledWorkout(check);
    const log = Store.getDayLog(ds);
    if (wkt.type === 'rest') {
      check = addDays(check, -1);
      continue;
    }
    if (log?.status === 'completed') {
      streak++;
      check = addDays(check, -1);
    } else {
      break;
    }
  }

  const noData = totalDone === 0 && totalSkip === 0;

  setView(`
    <div class="pad fade-up pb-safe">
      ${!start ? `
        <div class="empty-state">
          <div class="empty-icon">📊</div>
          <div class="empty-title">No data yet</div>
          <div class="empty-text">Set your program start date in Settings,<br>then log your first workout to see progress here.</div>
        </div>
      ` : `
        <div class="progress-header">
          <div class="progress-stat-big">${totalDone}</div>
          <div class="progress-stat-label">Workouts Completed</div>
        </div>

        <div class="section-label">This Week</div>
        <div style="display:flex;justify-content:center;gap:8px;margin-bottom:8px;">
          ${weekDots}
        </div>
        <p class="text-center text-xs text-muted mb-16">M · T · W · T · F · S · S</p>

        <div class="stats-grid">
          <div class="stat-tile">
            <div class="stat-tile-val">${streak}</div>
            <div class="stat-tile-label">Day Streak</div>
          </div>
          <div class="stat-tile">
            <div class="stat-tile-val">${currentWeek}</div>
            <div class="stat-tile-label">Program Week</div>
          </div>
          <div class="stat-tile">
            <div class="stat-tile-val">${totalSkip}</div>
            <div class="stat-tile-label">Skipped</div>
          </div>
          <div class="stat-tile">
            <div class="stat-tile-val">${totalDone + totalSkip}</div>
            <div class="stat-tile-label">Scheduled</div>
          </div>
        </div>

        ${noData ? `
          <p class="text-center text-sm text-muted mt-16" style="line-height:1.6;">
            Start logging workouts from the Today tab<br>and your stats will appear here.
          </p>` : ''}

        <p class="text-center text-xs text-muted mt-20" style="line-height:1.6;">
          Detailed charts and personal records are coming in a future phase.
        </p>
      `}
    </div>
  `);
}

// ============================================================
//  VIEW: SETTINGS
// ============================================================

function renderSettings() {
  setTitle('Settings');
  showBack(false);
  showNav(true);
  setActiveNav('settings');

  const start  = Store.getProgramStart();
  const unit   = Store.getUnit();
  const logs   = Store.getLogs();
  const total  = Object.keys(logs).filter(d => logs[d]?.status === 'completed').length;

  const resetHtml = state.resetConfirm ? `
    <p class="text-sm text-muted mb-12" style="padding:0 4px;line-height:1.5;">
      This will permanently delete all workout logs and program data. This cannot be undone.
    </p>
    <button class="btn btn-danger btn-sm mb-8" data-action="confirm-reset">
      Yes, Delete Everything
    </button>
    <button class="btn btn-secondary btn-sm" data-action="cancel-reset">
      Cancel
    </button>
  ` : `
    <button class="btn btn-secondary btn-sm" data-action="reset-data">
      Reset All Data
    </button>
  `;

  setView(`
    <div class="pad fade-up pb-safe">

      <div class="settings-section">
        <div class="settings-group-label">Program</div>
        <div class="settings-row">
          <span class="settings-row-label">Start Date</span>
          <span class="settings-row-value">
            ${start ? `${MONTHS_S[start.getMonth()]} ${start.getDate()}, ${start.getFullYear()}` : 'Not set'}
          </span>
        </div>
        <div class="form-group mt-8">
          <label class="form-label">Change Start Date</label>
          <input type="date" id="settings-start"
                 value="${start ? toDateStr(start) : toDateStr(getMondayOf(today()))}">
        </div>
        <button class="btn btn-secondary btn-sm mt-8" data-action="update-start">
          Update Start Date
        </button>
      </div>

      <div class="settings-section">
        <div class="settings-group-label">Units</div>
        <div class="settings-row">
          <span class="settings-row-label">Weight Unit</span>
          <div class="unit-toggle">
            <button class="unit-btn ${unit === 'lbs' ? 'active' : ''}"
                    data-action="set-unit" data-unit="lbs">lbs</button>
            <button class="unit-btn ${unit === 'kg' ? 'active' : ''}"
                    data-action="set-unit" data-unit="kg">kg</button>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-group-label">Weekly Schedule</div>
        ${Object.entries(WEEKLY_SCHEDULE).map(([day, w]) => `
          <div class="settings-row" style="gap:10px;">
            <span class="settings-row-label">${DAYS_LONG[day]}</span>
            <span class="type-pill ${w.color}" style="margin-bottom:0;font-size:9.5px;">
              ${w.name}
            </span>
          </div>
        `).join('')}
        <p class="text-xs text-muted mt-8" style="padding:0 4px;line-height:1.5;">
          Custom schedule editing coming in a future phase.
        </p>
      </div>

      <div class="settings-section">
        <div class="settings-group-label">Stats</div>
        <div class="settings-row">
          <span class="settings-row-label">Workouts Logged</span>
          <span class="settings-row-value">${total}</span>
        </div>
        <div class="settings-row">
          <span class="settings-row-label">App Version</span>
          <span class="settings-row-value">Phase 1.0</span>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-group-label">Data</div>
        ${resetHtml}
      </div>

    </div>
  `);
}

// ============================================================
//  MODAL: MOVE / FLEX
// ============================================================

function openMoveModal(dateStr) {
  state.modalDateStr = dateStr;
  const fromDate = fromDateStr(dateStr);
  const wkt      = getScheduledWorkout(fromDate);

  // Build options: next 14 days (skip today, skip rest days that already have that workout)
  const options = [];
  for (let i = 1; i <= 14; i++) {
    const d  = addDays(fromDate, i);
    const ds = toDateStr(d);
    const w  = getScheduledWorkout(d);
    const existing = Store.getDayLog(ds);
    if (existing?.status === 'completed') continue; // already done
    const label = i === 1 ? 'Tomorrow' : DAYS_LONG[d.getDay()];
    options.push({ d, ds, label, w });
  }

  const optRows = options.map(o => `
    <div class="modal-day-option" data-action="confirm-move" data-to="${o.ds}">
      <div>
        <div class="modal-day-option-label">${o.label}, ${MONTHS_S[o.d.getMonth()]} ${o.d.getDate()}</div>
        <div class="modal-day-option-sub">Currently: ${o.w.name}</div>
      </div>
      <span style="color:#555;font-size:18px;">→</span>
    </div>
  `).join('');

  showModal(`
    <div class="modal-title">Move Workout</div>
    <div class="modal-sub">Move <strong>${wkt.name}</strong> to a different day.</div>
    <div class="modal-day-grid">${optRows}</div>
    <button class="btn btn-secondary btn-sm" data-action="close-modal">Cancel</button>
  `);
}

// ============================================================
//  NAVIGATION
// ============================================================

function navigate(view) {
  state.view         = view;
  state.resetConfirm = false;
  hideModal();

  switch (view) {
    case 'today':    renderToday();    break;
    case 'schedule': renderSchedule(); break;
    case 'workouts': renderWorkouts(); break;
    case 'progress': renderProgress(); break;
    case 'settings': renderSettings(); break;
  }
}

// ============================================================
//  LABEL HELPER
// ============================================================

function labelForType(type) {
  const map = {
    push:     'Push',
    pull:     'Pull',
    legs:     'Legs',
    run:      'Run',
    optional: 'Optional',
    rest:     'Rest',
  };
  return map[type] || type;
}

// ============================================================
//  EVENT HANDLING  (single delegated listener)
// ============================================================

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el) return;

  const action = el.dataset.action;

  // ---- Bottom nav ----
  if (el.classList.contains('nav-btn')) {
    navigate(el.dataset.view);
    return;
  }

  switch (action) {

    // ---- Today actions ----

    case 'start-workout': {
      const ds  = el.dataset.date;
      Store.setDayLog(ds, { status: 'completed', completedAt: new Date().toISOString() });
      // Phase 2 will open the detailed workout logger here
      renderToday();
      break;
    }

    case 'skip-workout': {
      const ds = el.dataset.date;
      Store.setDayLog(ds, { status: 'skipped', skippedAt: new Date().toISOString() });
      renderToday();
      break;
    }

    case 'undo-workout': {
      const ds   = el.dataset.date;
      const logs = Store.getLogs();
      delete logs[ds];
      Store.set(Store.KEYS.LOGS, logs);
      renderToday();
      break;
    }

    case 'open-move-modal': {
      openMoveModal(el.dataset.date);
      break;
    }

    case 'confirm-move': {
      const toDs = el.dataset.to;
      if (!state.modalDateStr || !toDs) break;
      Store.recordMove(state.modalDateStr, toDs);
      hideModal();
      renderToday();
      break;
    }

    case 'close-modal': {
      hideModal();
      break;
    }

    // ---- Schedule actions ----

    case 'sched-nav': {
      state.schedWeekOff += parseInt(el.dataset.delta, 10);
      renderSchedule();
      break;
    }

    case 'sched-tap': {
      // For Phase 1, tapping a schedule day briefly highlights it.
      // Phase 2 will navigate to a detailed day view.
      const ds      = el.dataset.date;
      const d       = fromDateStr(ds);
      const wkt     = getScheduledWorkout(d);
      const log     = Store.getDayLog(ds);
      const status  = log?.status || 'pending';
      const isToday = ds === toDateStr(today());

      if (isToday) {
        navigate('today');
      }
      // Future phases: navigate to day detail
      break;
    }

    // ---- Settings actions ----

    case 'update-start': {
      const val = document.getElementById('settings-start')?.value;
      if (!val) break;
      Store.setProgramStart(fromDateStr(val));
      renderSettings();
      break;
    }

    case 'set-unit': {
      Store.setUnit(el.dataset.unit);
      renderSettings();
      break;
    }

    case 'reset-data': {
      state.resetConfirm = true;
      renderSettings();
      break;
    }

    case 'cancel-reset': {
      state.resetConfirm = false;
      renderSettings();
      break;
    }

    case 'confirm-reset': {
      Store.clearAll();
      state.resetConfirm = false;
      navigate('today');
      break;
    }
  }
});

// Close modal when tapping overlay
document.getElementById('overlay').addEventListener('click', () => {
  if (state.modalOpen) hideModal();
});

// ============================================================
//  INIT
// ============================================================

function init() {
  // Default program start to last Monday if not yet set
  if (!Store.getProgramStart()) {
    Store.setProgramStart(getMondayOf(today()));
  }
  navigate('today');
}

init();
