// ============================================================
//  MOAB Weight Training — Phase 2: Schedule & Flex Logic
//  Mobile-first · localStorage · No backend
// ============================================================

'use strict';

// ============================================================
//  WORKOUT TYPE DEFINITIONS
// ============================================================

const WORKOUT_TYPES = {
  push: {
    key:   'push',
    name:  'Push Strength',
    sub:   'Chest · Shoulders · Triceps',
    color: 'push',
    emoji: '🏋️',
    day:   'Monday',
  },
  pull: {
    key:   'pull',
    name:  'Pull Strength',
    sub:   'Back · Biceps · Rear Delts',
    color: 'pull',
    emoji: '🏋️',
    day:   'Wednesday',
  },
  legs: {
    key:   'legs',
    name:  'Legs Strength',
    sub:   'Quads · Hamstrings · Glutes · Calves',
    color: 'legs',
    emoji: '🦵',
    day:   'Friday',
  },
  run_a: {
    key:   'run_a',
    name:  'Run Training A',
    sub:   'Speed · Intervals · Lactate',
    color: 'run',
    emoji: '🏃',
    day:   'Tuesday',
  },
  run_b: {
    key:   'run_b',
    name:  'Run Training B',
    sub:   'Tempo · Aerobic Base · Easy Miles',
    color: 'run',
    emoji: '🏃',
    day:   'Thursday',
  },
  optional: {
    key:   'optional',
    name:  'Optional Recovery',
    sub:   'Mobility · Stretching · Light Activity',
    color: 'optional',
    emoji: '🧘',
    day:   'Saturday',
  },
  rest: {
    key:   'rest',
    name:  'Rest Day',
    sub:   'Recovery & Restoration',
    color: 'rest',
    emoji: '🛌',
    day:   'Sunday',
  },
};

// Default assignment for each day-of-week (0 = Sunday)
const DEFAULT_SCHEDULE = {
  0: 'rest',
  1: 'push',
  2: 'run_a',
  3: 'pull',
  4: 'run_b',
  5: 'legs',
  6: 'optional',
};

// ============================================================
//  WORKOUT LIBRARY (Workouts tab)
// ============================================================

const WORKOUT_LIBRARY = [
  {
    key:       'push',
    exercises: ['Bench Press', 'Overhead Press', 'Incline DB Press', 'Lateral Raise', 'Tricep Pushdown'],
  },
  {
    key:       'pull',
    exercises: ['Deadlift', 'Barbell Row', 'Pull-up', 'Face Pull', 'Bicep Curl'],
  },
  {
    key:       'legs',
    exercises: ['Back Squat', 'Romanian Deadlift', 'Leg Press', 'Walking Lunge', 'Calf Raise'],
  },
  {
    key:       'run_a',
    exercises: ['Warm-up 5min', '6–12 × 400m Intervals', 'Hard Effort — RPE 8–9', 'Walk/Jog Rest', 'Cool-down 5min'],
  },
  {
    key:       'run_b',
    exercises: ['Warm-up 5min', 'Tempo Run 20–30min', 'Comfortable-Hard — RPE 7', 'Strides × 4', 'Cool-down 5min'],
  },
  {
    key:       'optional',
    exercises: ['Hip Flexor Stretch', 'Thoracic Rotation', 'Foam Rolling', 'Light Walk', 'Yoga Flow'],
  },
];

// ============================================================
//  STORAGE
// ============================================================

const Store = {
  KEYS: {
    START:       'moab_start',
    LOGS:        'moab_day_logs',
    ASSIGNMENTS: 'moab_assignments',  // date-specific workout overrides
    UNIT:        'moab_unit',
  },

  _get(key)      { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  _set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },

  // ---- Program start ----
  getProgramStart() {
    const s = this._get(this.KEYS.START);
    return s ? fromDateStr(s) : null;
  },
  setProgramStart(d) { this._set(this.KEYS.START, toDateStr(d)); },

  // ---- Unit preference ----
  getUnit()   { return this._get(this.KEYS.UNIT) || 'lbs'; },
  setUnit(u)  { this._set(this.KEYS.UNIT, u); },

  // ---- Day logs: completion/skip status ----
  getLogs()  { return this._get(this.KEYS.LOGS) || {}; },
  getDayLog(ds) { return this.getLogs()[ds] || null; },

  setDayLog(ds, patch) {
    const logs = this.getLogs();
    logs[ds] = { ...(logs[ds] || {}), ...patch };
    this._set(this.KEYS.LOGS, logs);
  },

  deleteDayLog(ds) {
    const logs = this.getLogs();
    delete logs[ds];
    this._set(this.KEYS.LOGS, logs);
  },

  // ---- Assignments: date-specific workout type overrides ----
  getAssignments() { return this._get(this.KEYS.ASSIGNMENTS) || {}; },

  getAssignment(ds) {
    const a = this.getAssignments();
    return (ds in a) ? a[ds] : null;  // null = use default
  },

  setAssignment(ds, typeKey) {
    const a = this.getAssignments();
    a[ds] = typeKey;
    this._set(this.KEYS.ASSIGNMENTS, a);
  },

  deleteAssignment(ds) {
    const a = this.getAssignments();
    delete a[ds];
    this._set(this.KEYS.ASSIGNMENTS, a);
  },

  // ---- Derived: effective workout type for a date ----
  getWorkoutType(ds) {
    const override = this.getAssignment(ds);
    if (override !== null) return override;
    return DEFAULT_SCHEDULE[fromDateStr(ds).getDay()];
  },

  getWorkoutInfo(ds) {
    const type = this.getWorkoutType(ds);
    return WORKOUT_TYPES[type] || WORKOUT_TYPES['rest'];
  },

  // ---- All stats ----
  getTotalCompleted() {
    const logs = this.getLogs();
    return Object.values(logs).filter(l => l?.status === 'completed').length;
  },

  clearAll() {
    Object.values(this.KEYS).forEach(k => localStorage.removeItem(k));
  },
};

// ============================================================
//  SCHEDULE ACTIONS
// ============================================================

// Mark a day as completed
function completeDay(ds) {
  Store.setDayLog(ds, { status: 'completed', completedAt: new Date().toISOString() });
}

// Mark a day as skipped (preserves the workout assignment)
function skipDay(ds) {
  Store.setDayLog(ds, { status: 'skipped', skippedAt: new Date().toISOString() });
}

// Remove the log for a day (resets to 'planned')
function undoDay(ds) {
  Store.deleteDayLog(ds);
}

// Move the workout from fromDs to toDs.
// Source day becomes 'rest'. Destination gets the workout type.
// The move is stored in logs for history.
function moveWorkout(fromDs, toDs) {
  const type = Store.getWorkoutType(fromDs);

  // Assign the workout to the destination
  Store.setAssignment(toDs, type);

  // Source day: override to rest and log the move
  Store.setAssignment(fromDs, 'rest');
  Store.setDayLog(fromDs, { status: 'moved', movedTo: toDs, originalType: type });

  // Clear any existing log at destination (fresh start)
  Store.deleteDayLog(toDs);
}

// Swap the workout assignments of two days.
// Does not change completion status of either day.
function swapWorkouts(ds1, ds2) {
  const type1 = Store.getWorkoutType(ds1);
  const type2 = Store.getWorkoutType(ds2);
  Store.setAssignment(ds1, type2);
  Store.setAssignment(ds2, type1);
}

// Undo a move: restore both source and destination to their defaults.
function undoMove(fromDs, log) {
  // Remove source override so it falls back to default
  Store.deleteAssignment(fromDs);
  Store.deleteDayLog(fromDs);

  // Remove destination override (if it was the move target)
  if (log?.movedTo) {
    Store.deleteAssignment(log.movedTo);
  }
}

// ============================================================
//  DATE UTILITIES
// ============================================================

const MONTHS    = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_S  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS_LONG = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DAYS_S    = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function today() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

function toDateStr(d) {
  const y  = d.getFullYear();
  const m  = String(d.getMonth() + 1).padStart(2, '0');
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

function dayLabel(d, relativeTo) {
  const base = relativeTo || today();
  const diff = Math.round((d - base) / 86400000);
  if (diff === 0)  return 'Today';
  if (diff === 1)  return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return `${DAYS_LONG[d.getDay()]}, ${MONTHS_S[d.getMonth()]} ${d.getDate()}`;
}

function findNextWorkout(fromDate) {
  for (let i = 1; i <= 7; i++) {
    const d   = addDays(fromDate, i);
    const ds  = toDateStr(d);
    const wkt = Store.getWorkoutInfo(ds);
    const log = Store.getDayLog(ds);
    if (wkt.key !== 'rest' && log?.status !== 'moved') {
      return { wkt, date: d, label: dayLabel(d) };
    }
  }
  return null;
}

// ============================================================
//  APP STATE
// ============================================================

const state = {
  view:          'today',
  schedWeekOff:  0,
  modalPage:     null,  // 'action' | 'move' | 'swap'
  modalDateStr:  null,
  resetConfirm:  false,
};

// ============================================================
//  DOM HELPERS
// ============================================================

function $id(id)       { return document.getElementById(id); }
function setView(html) { $id('view').innerHTML = html; }
function setTitle(t)   { $id('header-title').textContent = t; }

function showBack(show) {
  $id('back-btn').classList.toggle('hidden', !show);
}

function showNav(show) {
  $id('bottom-nav').style.visibility = show ? '' : 'hidden';
}

function setActiveNav(v) {
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.view === v);
  });
}

function showModal(html) {
  $id('overlay').classList.remove('hidden');
  const m = $id('modal');
  m.classList.remove('hidden');
  m.innerHTML = html;
  m.classList.remove('slide-up');
  void m.offsetWidth;           // force reflow so animation replays
  m.classList.add('slide-up');
  state.modalPage = state.modalPage || 'action';
}

function hideModal() {
  $id('overlay').classList.add('hidden');
  $id('modal').classList.add('hidden');
  $id('modal').innerHTML = '';
  state.modalPage    = null;
  state.modalDateStr = null;
}

// ============================================================
//  STATUS HELPERS
// ============================================================

function getStatusLabel(status) {
  return { completed: 'Completed', skipped: 'Skipped', moved: 'Moved', planned: 'Planned' }[status] || 'Planned';
}

function statusBadge(status) {
  const label = getStatusLabel(status);
  return `<span class="status-badge ${status || 'planned'}">${label}</span>`;
}

function labelForType(key) {
  const map = { push: 'Push', pull: 'Pull', legs: 'Legs', run_a: 'Run A', run_b: 'Run B', optional: 'Opt', rest: 'Rest' };
  return map[key] || key;
}

// ============================================================
//  VIEW: TODAY
// ============================================================

function renderToday() {
  setTitle('MOAB');
  showBack(false);
  showNav(true);
  setActiveNav('today');

  const t    = today();
  const ds   = toDateStr(t);
  const wkt  = Store.getWorkoutInfo(ds);
  const log  = Store.getDayLog(ds);
  const week = getProgramWeek(t);
  const status = log?.status || 'planned';

  const header = `
    <div class="today-header">
      <div class="today-dayname">${DAYS_LONG[t.getDay()]}</div>
      <div class="today-datenum">${t.getDate()}</div>
      <div class="today-monthyear">${MONTHS[t.getMonth()]} ${t.getFullYear()}</div>
    </div>
    <div class="text-center mb-16">
      <span class="eyebrow">Program · Week ${week}</span>
    </div>
  `;

  let body;
  if (wkt.key === 'rest') {
    body = buildRestDay(t);
  } else if (status === 'completed') {
    body = buildDoneState(ds, wkt, log);
  } else if (status === 'skipped') {
    body = buildSkippedState(ds, wkt);
  } else if (status === 'moved') {
    body = buildMovedState(ds, log);
  } else {
    body = buildActiveWorkout(ds, wkt);
  }

  setView(`<div class="pad fade-up">${header}${body}</div>`);
}

function buildActiveWorkout(ds, wkt) {
  return `
    <div class="workout-card ${wkt.color}">
      <div class="type-pill ${wkt.color}">${wkt.emoji}&nbsp; ${labelForType(wkt.key)}</div>
      <div class="workout-card-title">${wkt.name}</div>
      <div class="workout-card-sub">${wkt.sub}</div>
    </div>

    <button class="btn btn-primary" data-action="do-start" data-date="${ds}">
      Start Workout
    </button>

    <div class="btn-row-3 mt-10">
      <button class="btn btn-secondary btn-sm" data-action="do-skip"  data-date="${ds}">Skip</button>
      <button class="btn btn-secondary btn-sm" data-action="open-move" data-date="${ds}">Move</button>
      <button class="btn btn-secondary btn-sm" data-action="open-swap" data-date="${ds}">Swap</button>
    </div>
  `;
}

function buildDoneState(ds, wkt, log) {
  const time = log?.completedAt
    ? new Date(log.completedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : '';
  const next = findNextWorkout(today());
  return `
    <div class="done-banner">
      <div class="done-icon">✅</div>
      <div class="done-title">${wkt.name} Done</div>
      <div class="done-sub">${time ? `Finished at ${time}` : 'Completed today'}</div>
    </div>
    ${nextCard(next)}
    <div class="btn-row mt-16">
      <button class="btn btn-secondary btn-sm" data-action="do-undo"  data-date="${ds}">Undo</button>
      <button class="btn btn-secondary btn-sm" data-action="open-swap" data-date="${ds}">Swap</button>
    </div>
  `;
}

function buildSkippedState(ds, wkt) {
  const next = findNextWorkout(today());
  return `
    <div class="skipped-banner">
      <div class="skipped-title">Skipped — ${wkt.name}</div>
      <div class="skipped-sub">This workout is still on the calendar.</div>
    </div>
    ${nextCard(next)}
    <button class="btn btn-ghost mt-16" data-action="do-undo" data-date="${ds}">
      Changed my mind — Log it
    </button>
    <div class="btn-row mt-10">
      <button class="btn btn-secondary btn-sm" data-action="open-move" data-date="${ds}">Move</button>
      <button class="btn btn-secondary btn-sm" data-action="open-swap" data-date="${ds}">Swap</button>
    </div>
  `;
}

function buildMovedState(ds, log) {
  const toDate  = log?.movedTo ? fromDateStr(log.movedTo) : null;
  const toLbl   = toDate ? `${DAYS_LONG[toDate.getDay()]}, ${MONTHS_S[toDate.getMonth()]} ${toDate.getDate()}` : 'another day';
  const next    = findNextWorkout(today());
  const origWkt = log?.originalType ? WORKOUT_TYPES[log.originalType] : null;

  return `
    <div class="skipped-banner">
      <div class="skipped-title">${origWkt ? origWkt.name : 'Workout'} was moved</div>
      <div class="skipped-sub">Rescheduled to ${toLbl}</div>
    </div>
    ${nextCard(next)}
    <button class="btn btn-secondary btn-sm mt-16" data-action="do-undo-move"
            data-date="${ds}" data-log='${JSON.stringify(log)}'>
      Undo Move
    </button>
  `;
}

function buildRestDay(d) {
  const next = findNextWorkout(d);
  return `
    <div class="rest-view">
      <div class="rest-icon">🛌</div>
      <div class="rest-title">Rest Day</div>
      <div class="rest-sub">Recovery is part of the plan.<br>Eat well, sleep long, show up tomorrow.</div>
    </div>
    ${nextCard(next)}
  `;
}

function nextCard(next) {
  if (!next) return '';
  return `
    <div class="next-card">
      <div class="next-label">Next Up</div>
      <div class="next-name">${next.wkt.name}</div>
      <div class="next-sub">${next.label} · ${next.wkt.sub}</div>
    </div>
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
  const tDs    = toDateStr(t);
  const monday = getMondayOf(addDays(getMondayOf(t), state.schedWeekOff * 7));
  const week   = getProgramWeek(monday);

  const weekLbl =
    state.schedWeekOff === 0  ? 'This Week' :
    state.schedWeekOff === -1 ? 'Last Week' :
    state.schedWeekOff === 1  ? 'Next Week' :
    `${MONTHS_S[monday.getMonth()]} ${monday.getDate()}`;

  const rows = Array.from({ length: 7 }, (_, i) => addDays(monday, i)).map(d => {
    const ds     = toDateStr(d);
    const wkt    = Store.getWorkoutInfo(ds);
    const log    = Store.getDayLog(ds);
    const status = log?.status || 'planned';
    const isToday = ds === tDs;
    const isRest  = wkt.key === 'rest';

    // Row classes
    let rowCls = '';
    if (isToday)             rowCls += ' is-today';
    if (status === 'completed') rowCls += ' is-done';
    if (status === 'skipped')   rowCls += ' is-skipped';
    if (isRest)              rowCls += ' is-rest';

    // Status icon (right side)
    const iconMap = { completed: '✅', skipped: '—', moved: '📆' };
    const statusIcon = iconMap[status] || (isRest ? '' : (isToday ? '→' : '○'));

    // Sub-text: show moved info
    let sub = wkt.sub;
    if (status === 'moved' && log?.movedTo) {
      const toD = fromDateStr(log.movedTo);
      sub = `Moved to ${DAYS_LONG[toD.getDay()]} ${toD.getDate()}`;
    }

    return `
      <div class="sched-row${rowCls}"
           data-action="${isRest ? '' : 'sched-tap'}"
           data-date="${ds}">
        <div class="sched-date">
          <div class="sched-date-abbr">${DAYS_S[d.getDay()]}</div>
          <div class="sched-date-num">${d.getDate()}</div>
        </div>
        <div class="sched-info">
          <div class="sched-name">${wkt.name}</div>
          <div class="sched-sub">${sub}</div>
        </div>
        <div class="sched-right">
          ${!isRest ? statusBadge(status === 'planned' ? null : status) : ''}
          <span class="sched-arrow">${statusIcon}</span>
        </div>
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
          <div class="week-nav-label">${weekLbl}</div>
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
      <p class="text-xs text-muted text-center mt-16" style="line-height:1.6;">
        Tap any day to Start, Skip, Move, or Swap.
      </p>
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

  const cards = WORKOUT_LIBRARY.map(entry => {
    const wkt = WORKOUT_TYPES[entry.key];
    return `
      <div class="workout-library-card ${wkt.color}">
        <div class="type-pill ${wkt.color}" style="margin-bottom:10px;">
          ${wkt.emoji}&nbsp; ${labelForType(wkt.key)}
        </div>
        <div class="wl-title">${wkt.name}</div>
        <div class="wl-sub">${wkt.day} &nbsp;·&nbsp; ${wkt.sub}</div>
        <div class="exercise-list mt-12">
          ${entry.exercises.map(e => `<span class="exercise-chip">${e}</span>`).join('')}
        </div>
      </div>
    `;
  }).join('');

  setView(`
    <div class="pad fade-up pb-safe">
      <p class="text-muted text-sm mb-16" style="line-height:1.6;">
        Your full 5-day program. Exercise details and in-workout logging come in Phase 3.
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

  const monday  = getMondayOf(t);
  const weekDots = Array.from({ length: 7 }, (_, i) => {
    const d   = addDays(monday, i);
    const ds  = toDateStr(d);
    const wkt = Store.getWorkoutInfo(ds);
    const log = Store.getDayLog(ds);
    const status = log?.status || 'planned';
    const isToday = ds === toDateStr(t);

    let cls = wkt.key === 'rest' ? 'rest' : (status === 'completed' ? 'done' : status === 'skipped' ? 'skipped' : 'pending');
    const extra = isToday ? ' today' : '';
    return `<div class="week-dot ${cls}${extra}">${DAYS_S[d.getDay()].charAt(0)}</div>`;
  }).join('');

  const totalDone  = Store.getTotalCompleted();
  const totalSkip  = Object.values(logs).filter(l => l?.status === 'skipped').length;
  const currentWk  = getProgramWeek(t);

  // Simple streak
  let streak = 0;
  let chk    = today();
  for (let i = 0; i < 60; i++) {
    const ds  = toDateStr(chk);
    const wkt = Store.getWorkoutInfo(ds);
    const log = Store.getDayLog(ds);
    if (wkt.key === 'rest') { chk = addDays(chk, -1); continue; }
    if (log?.status === 'completed') { streak++; chk = addDays(chk, -1); }
    else break;
  }

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
        <div style="display:flex;justify-content:center;gap:8px;margin-bottom:6px;">
          ${weekDots}
        </div>
        <p class="text-center text-xs text-muted mb-16">M · T · W · T · F · S · S</p>

        <div class="stats-grid">
          <div class="stat-tile">
            <div class="stat-tile-val">${streak}</div>
            <div class="stat-tile-label">Day Streak</div>
          </div>
          <div class="stat-tile">
            <div class="stat-tile-val">${currentWk}</div>
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

  const start = Store.getProgramStart();
  const unit  = Store.getUnit();

  const resetHtml = state.resetConfirm ? `
    <p class="text-sm text-muted mb-12" style="padding:0 4px;line-height:1.5;">
      This will permanently delete all logs, assignments, and program data.
    </p>
    <button class="btn btn-danger btn-sm mb-8" data-action="confirm-reset">Yes, Delete Everything</button>
    <button class="btn btn-secondary btn-sm"    data-action="cancel-reset">Cancel</button>
  ` : `
    <button class="btn btn-secondary btn-sm" data-action="reset-data">Reset All Data</button>
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
            <button class="unit-btn ${unit === 'lbs' ? 'active' : ''}" data-action="set-unit" data-unit="lbs">lbs</button>
            <button class="unit-btn ${unit === 'kg'  ? 'active' : ''}" data-action="set-unit" data-unit="kg">kg</button>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-group-label">Default Weekly Schedule</div>
        ${Object.entries(DEFAULT_SCHEDULE).map(([dow, key]) => {
          const wkt = WORKOUT_TYPES[key];
          return `
            <div class="settings-row" style="gap:10px;">
              <span class="settings-row-label">${DAYS_LONG[dow]}</span>
              <span class="type-pill ${wkt.color}" style="margin-bottom:0;font-size:9.5px;">${wkt.name}</span>
            </div>
          `;
        }).join('')}
        <p class="text-xs text-muted mt-8" style="padding:0 4px;line-height:1.5;">
          Use Move and Swap on any day to adjust your schedule.
        </p>
      </div>

      <div class="settings-section">
        <div class="settings-group-label">Data</div>
        <div class="settings-row">
          <span class="settings-row-label">Workouts Logged</span>
          <span class="settings-row-value">${Store.getTotalCompleted()}</span>
        </div>
        <div class="settings-row">
          <span class="settings-row-label">App Version</span>
          <span class="settings-row-value">Phase 2.0</span>
        </div>
        <div class="mt-12">${resetHtml}</div>
      </div>

    </div>
  `);
}

// ============================================================
//  MODALS
// ============================================================

// ---- Action sheet: tapping a day in the schedule (or Today sub-views) ----
function openActionSheet(ds) {
  state.modalPage    = 'action';
  state.modalDateStr = ds;

  const wkt    = Store.getWorkoutInfo(ds);
  const log    = Store.getDayLog(ds);
  const status = log?.status || 'planned';
  const d      = fromDateStr(ds);
  const lbl    = dayLabel(d);

  let actions = '';

  if (status === 'moved') {
    const toD   = log?.movedTo ? fromDateStr(log.movedTo) : null;
    const toLbl = toD ? `${DAYS_LONG[toD.getDay()]}, ${MONTHS_S[toD.getMonth()]} ${toD.getDate()}` : '—';
    actions = `
      <p class="text-sm text-muted text-center mb-12">
        ${log?.originalType ? WORKOUT_TYPES[log.originalType]?.name : 'Workout'} was moved to ${toLbl}.
      </p>
      <button class="btn btn-secondary btn-sm" data-action="do-undo-move"
              data-date="${ds}" data-log='${JSON.stringify(log)}'>
        Undo Move
      </button>
    `;
  } else if (status === 'completed') {
    actions = `
      <div class="btn-row mb-0">
        <button class="btn btn-secondary btn-sm" data-action="do-undo"  data-date="${ds}">Undo</button>
        <button class="btn btn-secondary btn-sm" data-action="open-swap" data-date="${ds}">Swap</button>
      </div>
    `;
  } else if (status === 'skipped') {
    actions = `
      <button class="btn btn-ghost mb-10" data-action="do-undo" data-date="${ds}">Undo Skip</button>
      <div class="btn-row-3">
        <button class="btn btn-secondary btn-sm" data-action="do-start"  data-date="${ds}">Start</button>
        <button class="btn btn-secondary btn-sm" data-action="open-move" data-date="${ds}">Move</button>
        <button class="btn btn-secondary btn-sm" data-action="open-swap" data-date="${ds}">Swap</button>
      </div>
    `;
  } else {
    // planned
    actions = `
      <button class="btn btn-primary mb-10" data-action="do-start" data-date="${ds}">
        Start Workout
      </button>
      <div class="btn-row-3">
        <button class="btn btn-secondary btn-sm" data-action="do-skip"  data-date="${ds}">Skip</button>
        <button class="btn btn-secondary btn-sm" data-action="open-move" data-date="${ds}">Move</button>
        <button class="btn btn-secondary btn-sm" data-action="open-swap" data-date="${ds}">Swap</button>
      </div>
    `;
  }

  showModal(`
    <div class="sheet-header">
      <div class="type-pill ${wkt.color}" style="margin-bottom:8px;">
        ${wkt.emoji}&nbsp; ${labelForType(wkt.key)}
      </div>
      <div class="modal-title">${wkt.name}</div>
      <div style="display:flex;align-items:center;gap:8px;margin:4px 0 16px;">
        <span class="text-sm text-muted">${lbl}</span>
        ${statusBadge(status === 'planned' ? null : status)}
      </div>
    </div>
    ${actions}
    <button class="btn btn-secondary btn-sm mt-10" data-action="close-modal">Cancel</button>
  `);
}

// ---- Move modal: pick a destination day ----
function openMoveModal(ds) {
  state.modalPage = 'move';
  const wkt  = Store.getWorkoutInfo(ds);
  const from = fromDateStr(ds);

  // Offer next 14 days; skip already-completed days
  const options = [];
  for (let i = 1; i <= 14; i++) {
    const d    = addDays(from, i);
    const tDs  = toDateStr(d);
    const log  = Store.getDayLog(tDs);
    if (log?.status === 'completed') continue;
    const destWkt = Store.getWorkoutInfo(tDs);
    options.push({ d, ds: tDs, destWkt });
  }

  const rows = options.map(o => `
    <div class="modal-day-option" data-action="confirm-move" data-from="${ds}" data-to="${o.ds}">
      <div>
        <div class="modal-day-option-label">${dayLabel(o.d)}</div>
        <div class="modal-day-option-sub">Currently: ${o.destWkt.name}</div>
      </div>
      <span class="modal-day-arrow">→</span>
    </div>
  `).join('');

  showModal(`
    <div class="modal-title">Move Workout</div>
    <div class="modal-sub">
      Move <strong>${wkt.name}</strong> to a new day.
      The original day becomes a rest day.
    </div>
    <div class="modal-day-grid">${rows || '<p class="text-muted text-sm text-center">No available days in the next 14 days.</p>'}</div>
    <button class="btn btn-secondary btn-sm mt-8"
            data-action="back-to-sheet" data-date="${ds}">← Back</button>
  `);
}

// ---- Swap modal: pick a day to exchange with ----
function openSwapModal(ds) {
  state.modalPage = 'swap';
  const wkt  = Store.getWorkoutInfo(ds);
  const from = fromDateStr(ds);

  // Offer ±7 days around the source day, skip rest days and completed days
  const options = [];
  for (let i = -6; i <= 13; i++) {
    if (i === 0) continue;
    const d   = addDays(from, i);
    const tDs = toDateStr(d);
    const destWkt = Store.getWorkoutInfo(tDs);
    if (destWkt.key === 'rest') continue;
    const log = Store.getDayLog(tDs);
    if (log?.status === 'completed') continue;
    options.push({ d, ds: tDs, destWkt });
  }

  const rows = options.map(o => `
    <div class="modal-day-option" data-action="confirm-swap" data-date1="${ds}" data-date2="${o.ds}">
      <div>
        <div class="modal-day-option-label">${dayLabel(o.d)}</div>
        <div class="modal-day-option-sub">${o.destWkt.name}</div>
      </div>
      <span class="modal-day-arrow">⇄</span>
    </div>
  `).join('');

  showModal(`
    <div class="modal-title">Swap Workouts</div>
    <div class="modal-sub">
      Swap <strong>${wkt.name}</strong> with another day's workout.
      Both days exchange their assignments.
    </div>
    <div class="modal-day-grid">${rows || '<p class="text-muted text-sm text-center">No swappable workouts nearby.</p>'}</div>
    <button class="btn btn-secondary btn-sm mt-8"
            data-action="back-to-sheet" data-date="${ds}">← Back</button>
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

// Refresh the active view (e.g. after a data change)
function refresh() {
  navigate(state.view);
}

// ============================================================
//  EVENT HANDLING
// ============================================================

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;

  // Bottom nav
  if (el.classList.contains('nav-btn')) { navigate(el.dataset.view); return; }

  switch (action) {

    // ── Today / Action-sheet: core status actions ──────────

    case 'do-start': {
      const ds = el.dataset.date;
      completeDay(ds);
      hideModal();
      // If the action was taken from the schedule, re-render schedule
      // otherwise re-render today. We refresh the current view.
      refresh();
      break;
    }

    case 'do-skip': {
      const ds = el.dataset.date;
      skipDay(ds);
      hideModal();
      refresh();
      break;
    }

    case 'do-undo': {
      const ds = el.dataset.date;
      undoDay(ds);
      hideModal();
      refresh();
      break;
    }

    case 'do-undo-move': {
      const ds  = el.dataset.date;
      let   log;
      try { log = JSON.parse(el.dataset.log || 'null'); } catch { log = null; }
      undoMove(ds, log);
      hideModal();
      refresh();
      break;
    }

    // ── Modal openers ──────────────────────────────────────

    case 'open-move': {
      openMoveModal(el.dataset.date);
      break;
    }

    case 'open-swap': {
      openSwapModal(el.dataset.date);
      break;
    }

    case 'back-to-sheet': {
      openActionSheet(el.dataset.date);
      break;
    }

    case 'close-modal': {
      hideModal();
      break;
    }

    // ── Confirm move ───────────────────────────────────────

    case 'confirm-move': {
      const fromDs = el.dataset.from;
      const toDs   = el.dataset.to;
      moveWorkout(fromDs, toDs);
      hideModal();
      refresh();
      break;
    }

    // ── Confirm swap ───────────────────────────────────────

    case 'confirm-swap': {
      const ds1 = el.dataset.date1;
      const ds2 = el.dataset.date2;
      swapWorkouts(ds1, ds2);
      hideModal();
      refresh();
      break;
    }

    // ── Schedule navigation ────────────────────────────────

    case 'sched-nav': {
      state.schedWeekOff += parseInt(el.dataset.delta, 10);
      renderSchedule();
      break;
    }

    case 'sched-tap': {
      openActionSheet(el.dataset.date);
      break;
    }

    // ── Settings ───────────────────────────────────────────

    case 'update-start': {
      const val = document.getElementById('settings-start')?.value;
      if (val) { Store.setProgramStart(fromDateStr(val)); renderSettings(); }
      break;
    }

    case 'set-unit': {
      Store.setUnit(el.dataset.unit);
      renderSettings();
      break;
    }

    case 'reset-data':    { state.resetConfirm = true;  renderSettings(); break; }
    case 'cancel-reset':  { state.resetConfirm = false; renderSettings(); break; }
    case 'confirm-reset': {
      Store.clearAll();
      state.resetConfirm = false;
      navigate('today');
      break;
    }
  }
});

// Close modal on overlay tap
$id('overlay').addEventListener('click', () => { if (state.modalPage) hideModal(); });

// ============================================================
//  INIT
// ============================================================

function init() {
  if (!Store.getProgramStart()) {
    Store.setProgramStart(getMondayOf(today()));
  }
  navigate('today');
}

init();
