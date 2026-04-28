// =============================================================
//  MOAB Weight Training App
//  Mobile-first · localStorage · No backend
// =============================================================

'use strict';

// =============================================================
//  PLAN DATA
// =============================================================

const WEIGHT_WORKOUTS = {
  A: {
    label: 'A',
    name: 'Workout A',
    focus: 'Squat · Bench · Row',
    exercises: [
      { name: 'Back Squat',         sets: 4, reps: 5,  inc: 5,   hint: 'Drive knees out, chest tall' },
      { name: 'Bench Press',        sets: 4, reps: 5,  inc: 5,   hint: 'Retract scapula, slight arch' },
      { name: 'Barbell Row',        sets: 4, reps: 5,  inc: 5,   hint: 'Pull to lower chest, 45° hinge' },
      { name: 'Romanian Deadlift',  sets: 3, reps: 8,  inc: 5,   hint: 'Push hips back, soft knee' },
      { name: 'Lateral Raise',      sets: 3, reps: 12, inc: 2.5, hint: 'Lead with elbows, slight lean' },
    ],
    defaults: { 'Back Squat': 95, 'Bench Press': 75, 'Barbell Row': 75, 'Romanian Deadlift': 75, 'Lateral Raise': 15 }
  },
  B: {
    label: 'B',
    name: 'Workout B',
    focus: 'Deadlift · Press · Pull',
    exercises: [
      { name: 'Deadlift',               sets: 3, reps: 3,  inc: 5,   hint: 'Push the floor away, bar close' },
      { name: 'Overhead Press',         sets: 4, reps: 5,  inc: 5,   hint: 'Squeeze glutes, neutral spine' },
      { name: 'Pull-up',                sets: 4, reps: 6,  inc: 2.5, hint: 'Full hang, drive elbows down' },
      { name: 'Bulgarian Split Squat',  sets: 3, reps: 8,  inc: 5,   hint: 'Rear foot elevated, upright torso' },
      { name: 'Face Pull',              sets: 3, reps: 15, inc: 2.5, hint: 'Pull to nose, elbows high' },
    ],
    defaults: { 'Deadlift': 115, 'Overhead Press': 55, 'Pull-up': 0, 'Bulgarian Split Squat': 20, 'Face Pull': 25 }
  },
  C: {
    label: 'C',
    name: 'Workout C',
    focus: 'Front Squat · Incline · Row',
    exercises: [
      { name: 'Front Squat',        sets: 4, reps: 5,  inc: 5,  hint: 'Elbows high, upright torso' },
      { name: 'Incline Bench',      sets: 4, reps: 8,  inc: 5,  hint: '30-45° incline, full ROM' },
      { name: 'Dumbbell Row',       sets: 3, reps: 10, inc: 5,  hint: 'Elbow to hip, full stretch' },
      { name: 'Hip Thrust',         sets: 3, reps: 10, inc: 10, hint: 'Drive through heels, squeeze top' },
      { name: 'Tricep Pushdown',    sets: 3, reps: 12, inc: 5,  hint: 'Lock elbows at sides, full extension' },
    ],
    defaults: { 'Front Squat': 65, 'Incline Bench': 65, 'Dumbbell Row': 35, 'Hip Thrust': 95, 'Tricep Pushdown': 30 }
  }
};

// 12-week running plan to improve 2-mile time
const RUN_PLAN = [
  { // Week 1
    tuesday:  { type: 'intervals', title: '6 × 400m', steps: [
      { label: 'Warm-up',  text: '5 min easy jog', color: 'green' },
      { label: 'Main',     text: '6 × 400m at hard effort — 90 sec walk/jog rest between', color: 'orange' },
      { label: 'Cool-down',text: '5 min easy jog', color: 'green' },
      { label: 'Pace',     text: 'RPE 8/10 — hard but controlled', color: 'blue' },
    ]},
    thursday: { type: 'easy', title: '20min Easy', steps: [
      { label: 'Run', text: '20 minutes at conversational pace', color: 'green' },
      { label: 'RPE', text: '4–5/10 — you should be able to hold a conversation', color: 'blue' },
    ]},
  },
  { // Week 2
    tuesday:  { type: 'threshold', title: '4 × 800m', steps: [
      { label: 'Warm-up',  text: '5 min easy jog', color: 'green' },
      { label: 'Main',     text: '4 × 800m at threshold pace — 2 min rest between', color: 'orange' },
      { label: 'Cool-down',text: '5 min easy jog', color: 'green' },
      { label: 'Pace',     text: 'RPE 7/10 — comfortably hard, not all-out', color: 'blue' },
    ]},
    thursday: { type: 'easy', title: '25min Easy', steps: [
      { label: 'Run', text: '25 minutes at conversational pace', color: 'green' },
      { label: 'RPE', text: '4–5/10 — aerobic base building', color: 'blue' },
    ]},
  },
  { // Week 3
    tuesday:  { type: 'intervals', title: '8 × 400m', steps: [
      { label: 'Warm-up',  text: '5 min easy jog', color: 'green' },
      { label: 'Main',     text: '8 × 400m at hard effort — 75 sec rest between', color: 'orange' },
      { label: 'Cool-down',text: '5 min easy jog', color: 'green' },
      { label: 'Pace',     text: 'RPE 8–9/10 — push the pace', color: 'blue' },
    ]},
    thursday: { type: 'easy', title: '20min + Strides', steps: [
      { label: 'Run',     text: '20 min easy', color: 'green' },
      { label: 'Strides', text: '4 × 20 sec strides at near-sprint pace — full recovery between', color: 'orange' },
      { label: 'RPE',     text: 'Easy running, then 9/10 for strides', color: 'blue' },
    ]},
  },
  { // Week 4
    tuesday:  { type: 'threshold', title: '3 × 1200m', steps: [
      { label: 'Warm-up',  text: '5 min easy jog', color: 'green' },
      { label: 'Main',     text: '3 × 1200m at threshold — 2 min rest between', color: 'orange' },
      { label: 'Cool-down',text: '5 min easy jog', color: 'green' },
      { label: 'Pace',     text: 'RPE 7/10 — sustained threshold effort', color: 'blue' },
    ]},
    thursday: { type: 'easy', title: '30min Easy', steps: [
      { label: 'Run', text: '30 minutes easy', color: 'green' },
      { label: 'RPE', text: '4–5/10 — keep the effort low', color: 'blue' },
    ]},
  },
  { // Week 5
    tuesday:  { type: 'intervals', title: '10 × 400m', steps: [
      { label: 'Warm-up',  text: '5 min easy jog', color: 'green' },
      { label: 'Main',     text: '10 × 400m at hard effort — 60 sec rest between', color: 'red' },
      { label: 'Cool-down',text: '5 min easy jog', color: 'green' },
      { label: 'Pace',     text: 'RPE 8–9/10 — high volume speed work', color: 'blue' },
    ]},
    thursday: { type: 'tempo', title: '3 × 5min Tempo', steps: [
      { label: 'Warm-up',  text: '10 min easy jog', color: 'green' },
      { label: 'Main',     text: '3 × 5 min at tempo pace — 3 min easy jog rest', color: 'orange' },
      { label: 'Cool-down',text: '5 min easy jog', color: 'green' },
      { label: 'Pace',     text: 'RPE 7–8/10 — tempo is "comfortably hard"', color: 'blue' },
    ]},
  },
  { // Week 6
    tuesday:  { type: 'threshold', title: '4 × 1000m', steps: [
      { label: 'Warm-up',  text: '5 min easy jog', color: 'green' },
      { label: 'Main',     text: '4 × 1000m at threshold — 90 sec rest between', color: 'orange' },
      { label: 'Cool-down',text: '5 min easy jog', color: 'green' },
      { label: 'Pace',     text: 'RPE 7/10 — sustained effort, controlled breathing', color: 'blue' },
    ]},
    thursday: { type: 'easy', title: '30min Easy', steps: [
      { label: 'Run', text: '30 minutes easy', color: 'green' },
      { label: 'RPE', text: '4–5/10 — recovery day', color: 'blue' },
    ]},
  },
  { // Week 7
    tuesday:  { type: 'intervals', title: '2 × (4 × 400m)', steps: [
      { label: 'Warm-up',  text: '5 min easy jog', color: 'green' },
      { label: 'Set 1',    text: '4 × 400m — 60 sec rest between reps', color: 'orange' },
      { label: 'Rest',     text: '3 min full rest between sets', color: 'blue' },
      { label: 'Set 2',    text: '4 × 400m — 60 sec rest between reps', color: 'orange' },
      { label: 'Cool-down',text: '5 min easy jog', color: 'green' },
      { label: 'Pace',     text: 'RPE 8–9/10', color: 'blue' },
    ]},
    thursday: { type: 'easy', title: '20min + Strides', steps: [
      { label: 'Run',     text: '20 min easy', color: 'green' },
      { label: 'Strides', text: '5 × 20 sec strides — full recovery between', color: 'orange' },
      { label: 'RPE',     text: 'Easy, then sprint the strides', color: 'blue' },
    ]},
  },
  { // Week 8
    tuesday:  { type: 'race-pace', title: '2 × 1 Mile @ Goal Pace', steps: [
      { label: 'Warm-up',  text: '5 min easy jog', color: 'green' },
      { label: 'Main',     text: '2 × 1 mile at your goal 2-mile race pace — 3 min rest', color: 'red' },
      { label: 'Cool-down',text: '5 min easy jog', color: 'green' },
      { label: 'Pace',     text: 'RPE 8/10 — this is your target race pace', color: 'blue' },
    ]},
    thursday: { type: 'tempo', title: '3 × 6min Tempo', steps: [
      { label: 'Warm-up',  text: '10 min easy jog', color: 'green' },
      { label: 'Main',     text: '3 × 6 min at tempo pace — 3 min easy jog rest', color: 'orange' },
      { label: 'Cool-down',text: '5 min easy jog', color: 'green' },
      { label: 'Pace',     text: 'RPE 7–8/10', color: 'blue' },
    ]},
  },
  { // Week 9
    tuesday:  { type: 'intervals', title: '12 × 400m', steps: [
      { label: 'Warm-up',  text: '5 min easy jog', color: 'green' },
      { label: 'Main',     text: '12 × 400m at hard effort — 60 sec rest between', color: 'red' },
      { label: 'Cool-down',text: '5 min easy jog', color: 'green' },
      { label: 'Pace',     text: 'RPE 8–9/10 — highest volume of the cycle', color: 'blue' },
    ]},
    thursday: { type: 'easy', title: '35min Easy', steps: [
      { label: 'Run', text: '35 minutes easy', color: 'green' },
      { label: 'RPE', text: '4–5/10 — longest easy run of the plan', color: 'blue' },
    ]},
  },
  { // Week 10
    tuesday:  { type: 'race-pace', title: '3 × 1 Mile @ Goal Pace', steps: [
      { label: 'Warm-up',  text: '5 min easy jog', color: 'green' },
      { label: 'Main',     text: '3 × 1 mile at goal 2-mile pace — 2 min rest between', color: 'red' },
      { label: 'Cool-down',text: '5 min easy jog', color: 'green' },
      { label: 'Pace',     text: 'RPE 8–9/10 — race pace, no excuses', color: 'blue' },
    ]},
    thursday: { type: 'easy', title: '20min + Strides', steps: [
      { label: 'Run',     text: '20 min easy', color: 'green' },
      { label: 'Strides', text: '6 × 20 sec strides — full recovery between', color: 'orange' },
      { label: 'RPE',     text: 'Easy base, then sprint the strides', color: 'blue' },
    ]},
  },
  { // Week 11 — Taper
    tuesday:  { type: 'intervals', title: '6 × 400m Fast', steps: [
      { label: 'Warm-up',  text: '5 min easy jog', color: 'green' },
      { label: 'Main',     text: '6 × 400m at race pace — 90 sec rest between', color: 'red' },
      { label: 'Cool-down',text: '5 min easy jog', color: 'green' },
      { label: 'Pace',     text: 'RPE 9/10 — sharpen up for the test', color: 'blue' },
    ]},
    thursday: { type: 'easy', title: '20min Easy', steps: [
      { label: 'Run', text: '20 minutes very easy', color: 'green' },
      { label: 'Note', text: 'Taper week — keep it easy, stay fresh', color: 'blue' },
    ]},
  },
  { // Week 12 — Test Week
    tuesday:  { type: 'time-trial', title: '2-Mile Time Trial', steps: [
      { label: 'Warm-up',  text: '10 min easy + 4 × 30 sec strides', color: 'green' },
      { label: 'RACE',     text: '2-mile time trial — absolute max effort', color: 'red' },
      { label: 'Cool-down',text: '10 min easy walk/jog', color: 'green' },
      { label: 'Note',     text: 'This is what 12 weeks of training built up to. Go.', color: 'blue' },
    ]},
    thursday: { type: 'easy', title: 'Recovery Run', steps: [
      { label: 'Run',  text: '15 minutes very easy — you earned it', color: 'green' },
      { label: 'Note', text: 'Celebrate the work you put in', color: 'blue' },
    ]},
  },
];

// =============================================================
//  STORAGE
// =============================================================

const DB = {
  _k: {
    start:   'moab_start',
    wLogs:   'moab_weight_logs',
    rLogs:   'moab_run_logs',
    active:  'moab_active_workout',
    unit:    'moab_unit',
  },

  get(key)       { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  set(key, val)  { localStorage.setItem(key, JSON.stringify(val)); },
  remove(key)    { localStorage.removeItem(key); },

  getProgramStart() {
    const s = this.get(this._k.start);
    if (s) return fromDateStr(s);
    return null;
  },

  setProgramStart(date) {
    this.set(this._k.start, toDateStr(date));
  },

  getUnit()     { return this.get(this._k.unit) || 'lbs'; },
  setUnit(u)    { this.set(this._k.unit, u); },

  getWeightLogs() { return this.get(this._k.wLogs) || {}; },
  getRunLogs()    { return this.get(this._k.rLogs) || {}; },

  getActiveWorkout() { return this.get(this._k.active); },

  saveActiveWorkout(data) { this.set(this._k.active, data); },
  clearActiveWorkout()    { this.remove(this._k.active); },

  saveWeightLog(dateStr, log) {
    const logs = this.getWeightLogs();
    logs[dateStr] = log;
    this.set(this._k.wLogs, logs);
  },

  saveRunLog(dateStr, log) {
    const logs = this.getRunLogs();
    logs[dateStr] = log;
    this.set(this._k.rLogs, logs);
  },

  getLastWeightForExercise(name) {
    const logs = this.getWeightLogs();
    const dates = Object.keys(logs).sort().reverse();
    for (const d of dates) {
      const ex = logs[d].exercises && logs[d].exercises[name];
      if (ex && ex.weight != null) return ex.weight;
    }
    return null;
  },

  clearAll() {
    Object.values(this._k).forEach(k => localStorage.removeItem(k));
  }
};

// =============================================================
//  DATE UTILITIES
// =============================================================

function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function fromDateStr(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function today() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

function getMondayOf(d) {
  const day = d.getDay();
  const diff = (day === 0) ? -6 : 1 - day;
  const m = new Date(d);
  m.setDate(d.getDate() + diff);
  return new Date(m.getFullYear(), m.getMonth(), m.getDate());
}

function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function formatDateLong(d) {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function formatDateShort(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS_LONG = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// =============================================================
//  PROGRAM UTILITIES
// =============================================================

function getProgramWeek(forDate) {
  const start = DB.getProgramStart();
  if (!start) return 1;
  const startMonday = getMondayOf(start);
  const forMonday = getMondayOf(forDate);
  const diffMs = forMonday - startMonday;
  const diffWeeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, diffWeeks + 1);
}

// Returns { type: 'rest' } | { type: 'weight', workout: 'A'|'B'|'C' } | { type: 'run', run, week }
function getWorkoutForDate(d) {
  const day = d.getDay(); // 0=Sun, 6=Sat
  if (day === 0 || day === 6) return { type: 'rest' };

  if (day === 1) return { type: 'weight', workout: 'A' };
  if (day === 3) return { type: 'weight', workout: 'B' };
  if (day === 5) return { type: 'weight', workout: 'C' };

  const week = getProgramWeek(d);
  const planIdx = (week - 1) % 12;
  const runWeek = RUN_PLAN[planIdx];
  if (day === 2) return { type: 'run', run: runWeek.tuesday, week };
  if (day === 4) return { type: 'run', run: runWeek.thursday, week };

  return { type: 'rest' };
}

function isLoggedForDate(dateStr) {
  const wLogs = DB.getWeightLogs();
  const rLogs = DB.getRunLogs();
  return !!(wLogs[dateStr] || rLogs[dateStr]);
}

function getLogForDate(dateStr) {
  const wLogs = DB.getWeightLogs();
  const rLogs = DB.getRunLogs();
  return wLogs[dateStr] || rLogs[dateStr] || null;
}

function getDefaultWeight(exerciseName, workoutType) {
  const last = DB.getLastWeightForExercise(exerciseName);
  if (last != null) return last;
  const workout = WEIGHT_WORKOUTS[workoutType];
  return workout.defaults[exerciseName] || 45;
}

function displayWeight(lbs, unit) {
  if (unit === 'kg') {
    const kg = Math.round(lbs * 0.453592 * 4) / 4; // nearest 0.25 kg
    return `${kg}`;
  }
  return `${lbs}`;
}

function adjustWeightLbs(currentLbs, dir, inc) {
  // dir = +1 or -1, inc in lbs
  return Math.max(0, currentLbs + dir * inc);
}

// =============================================================
//  APP STATE
// =============================================================

const state = {
  view: 'today',       // current top-level view
  subView: null,       // 'weight_logger' | 'run_logger' | null
  schedWeekOffset: 0,  // 0 = current week, -1 = prev, etc.
  logDate: null,       // date string when sub-view is open
  resetConfirm: false, // settings confirm state
};

// In-memory working copy of the active workout (synced to localStorage)
let activeWkt = null;

// =============================================================
//  RENDER UTILITIES
// =============================================================

function setView(html) {
  document.getElementById('view').innerHTML = html;
}

function setTitle(t) {
  document.getElementById('header-title').textContent = t;
}

function showBack(show) {
  document.getElementById('back-btn').classList.toggle('hidden', !show);
}

function setActiveNav(v) {
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.view === v);
  });
}

function showNav(show) {
  document.getElementById('bottom-nav').style.display = show ? '' : 'none';
}

// =============================================================
//  VIEW: WELCOME
// =============================================================

function renderWelcome() {
  setTitle('MOAB');
  showBack(false);
  showNav(false);
  setView(`
    <div class="view-pad welcome-view fade-up">
      <div class="app-logo">MOAB</div>
      <div class="app-tagline">12-week strength + 2-mile run program.<br>Built for the gym. Built for the trail.</div>

      <div class="welcome-program-card">
        <div class="welcome-program-title">Your Weekly Schedule</div>
        <div class="program-line">
          <div class="program-dot orange"></div>
          <span><strong>Mon / Wed / Fri</strong> — Weights (Full Body)</span>
        </div>
        <div class="program-line">
          <div class="program-dot blue"></div>
          <span><strong>Tue / Thu</strong> — Running (2-Mile Plan)</span>
        </div>
        <div class="program-line">
          <div class="program-dot green"></div>
          <span><strong>Sat / Sun</strong> — Rest & Recovery</span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Program Start Date</label>
        <input type="date" id="start-date-input" value="${toDateStr(getMondayOf(today()))}">
      </div>

      <button class="btn btn-primary mt-12" data-action="save-start-date">
        Start Program
      </button>
    </div>
  `);
}

// =============================================================
//  VIEW: TODAY
// =============================================================

function renderToday() {
  setTitle('MOAB');
  showBack(false);
  showNav(true);
  setActiveNav('today');

  if (!DB.getProgramStart()) {
    renderWelcome();
    return;
  }

  const t = today();
  const dateStr = toDateStr(t);
  const dayName = DAYS_LONG[t.getDay()];
  const month   = MONTHS[t.getMonth()];
  const week    = getProgramWeek(t);
  const wkt     = getWorkoutForDate(t);
  const logged  = isLoggedForDate(dateStr);
  const active  = DB.getActiveWorkout();
  const hasActiveToday = active && active.date === dateStr;

  const header = `
    <div class="today-header">
      <div class="today-day">${dayName}</div>
      <div class="today-date-num">${t.getDate()}</div>
      <div class="today-month">${month} ${t.getFullYear()}</div>
      <div class="today-week-badge">Week ${week} of Program</div>
    </div>
  `;

  let body = '';

  if (wkt.type === 'rest') {
    body = buildRestDay(t, week);
  } else if (logged) {
    const log = getLogForDate(dateStr);
    body = buildCompletedDay(dateStr, wkt, log);
  } else if (wkt.type === 'weight') {
    body = buildWeightCard(dateStr, wkt, hasActiveToday, active);
  } else if (wkt.type === 'run') {
    body = buildRunCard(dateStr, wkt, false);
  }

  setView(`<div class="view-pad fade-up">${header}${body}</div>`);
}

function buildRestDay(t, week) {
  const nextWorkout = findNextWorkout(t);
  const nextHtml = nextWorkout ? `
    <div class="next-card mt-20">
      <div class="next-label">Next Workout</div>
      <div class="next-title">${nextWorkout.title}</div>
      <div class="next-desc">${nextWorkout.desc}</div>
    </div>` : '';

  return `
    <div class="rest-day">
      <div class="rest-day-icon">🛌</div>
      <div class="rest-day-title">Rest Day</div>
      <div class="rest-day-sub">Recovery is where the gains happen.<br>Eat well, sleep long.</div>
    </div>
    ${nextHtml}
  `;
}

function findNextWorkout(fromDate) {
  for (let i = 1; i <= 7; i++) {
    const d = addDays(fromDate, i);
    const w = getWorkoutForDate(d);
    if (w.type !== 'rest') {
      const dayLabel = i === 1 ? 'Tomorrow' : DAYS_LONG[d.getDay()];
      if (w.type === 'weight') {
        const wData = WEIGHT_WORKOUTS[w.workout];
        return { title: `${wData.name} — ${wData.focus}`, desc: `${dayLabel} · Strength` };
      } else {
        return { title: w.run.title, desc: `${dayLabel} · Running · Week ${w.week}` };
      }
    }
  }
  return null;
}

function buildWeightCard(dateStr, wkt, hasActive, activeData) {
  const wData = WEIGHT_WORKOUTS[wkt.workout];

  let progress = '';
  if (hasActive && activeData) {
    let done = 0, total = 0;
    wData.exercises.forEach(ex => {
      total += ex.sets;
      const ed = activeData.exercises[ex.name];
      if (ed) done += ed.sets.filter(Boolean).length;
    });
    const pct = total > 0 ? Math.round(done / total * 100) : 0;
    progress = `
      <div class="progress-label mb-4"><span>${done} / ${total} sets done</span><span>${pct}%</span></div>
      <div class="progress-track mb-16"><div class="progress-fill" style="width:${pct}%"></div></div>
    `;
  }

  const btnLabel = hasActive ? 'Continue Workout' : 'Start Workout';
  const btnStyle = hasActive ? 'btn-secondary' : 'btn-primary';

  return `
    <div class="card card-border">
      <div class="type-badge weights">💪 Strength</div>
      <div class="workout-title">${wData.name}</div>
      <div class="workout-focus">${wData.focus}</div>
      ${progress}
      <div class="section-title">Exercises</div>
      ${wData.exercises.map(ex => `
        <div class="summary-exercise">
          <span class="summary-ex-name">${ex.name}</span>
          <span class="summary-ex-val text-muted">${ex.sets} × ${ex.reps}</span>
        </div>
      `).join('')}
      <button class="btn ${btnStyle} mt-20" data-action="open-weight-logger" data-date="${dateStr}" data-workout="${wkt.workout}">
        ${btnLabel}
      </button>
    </div>
  `;
}

function buildRunCard(dateStr, wkt, fromSchedule) {
  const run = wkt.run;
  const btnLabel = 'Log This Run';
  return `
    <div class="run-instruction-card">
      <div class="run-badge ${run.type}">${run.type.replace('-', ' ')}</div>
      <div class="workout-title">${run.title}</div>
      ${run.steps.map(s => `
        <div class="run-step">
          <div class="run-step-dot ${s.color}"></div>
          <div>
            <div class="run-step-text">${s.text}</div>
            <div class="run-step-label">${s.label}</div>
          </div>
        </div>
      `).join('')}
    </div>
    <button class="btn btn-run" data-action="open-run-logger" data-date="${dateStr}">
      ${btnLabel}
    </button>
  `;
}

function buildCompletedDay(dateStr, wkt, log) {
  if (wkt.type === 'weight') {
    const wData = WEIGHT_WORKOUTS[wkt.workout];
    const exercises = log.exercises || {};
    const completedAt = log.completedAt ? new Date(log.completedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '';

    return `
      <div class="complete-card">
        <div class="complete-icon">✅</div>
        <div class="complete-title">${wData.name} Done</div>
        <div class="complete-sub">${completedAt ? `Finished at ${completedAt}` : 'Completed today'}</div>
      </div>
      <div class="section-title">Session Summary</div>
      ${wData.exercises.map(ex => {
        const ed = exercises[ex.name];
        if (!ed) return '';
        const doneSets = ed.sets.filter(Boolean).length;
        return `
          <div class="summary-exercise">
            <span class="summary-ex-name">${ex.name}</span>
            <span class="summary-ex-val">${doneSets}/${ex.sets} sets · ${displayWeight(ed.weight, DB.getUnit())} ${DB.getUnit()}</span>
          </div>
        `;
      }).join('')}
      <button class="btn btn-secondary mt-16" data-action="open-weight-logger" data-date="${dateStr}" data-workout="${wkt.workout}">
        Edit Workout
      </button>
    `;
  } else {
    // run
    const completedAt = log.completedAt ? new Date(log.completedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '';
    return `
      <div class="complete-card" style="background:#0d1a2e;border-color:#1e3a5f;">
        <div class="complete-icon">🏃</div>
        <div class="complete-title" style="color:#60a5fa;">${(wkt.run?.title || log.title || 'Run')} Done</div>
        <div class="complete-sub">${completedAt ? `Finished at ${completedAt}` : 'Completed today'}</div>
      </div>
      <div class="card card-border">
        ${log.totalTime ? `<div class="summary-exercise"><span class="summary-ex-name">Time</span><span class="summary-ex-val">${log.totalTime}</span></div>` : ''}
        ${log.distance ? `<div class="summary-exercise"><span class="summary-ex-name">Distance</span><span class="summary-ex-val">${log.distance} mi</span></div>` : ''}
        ${log.feel ? `<div class="summary-exercise"><span class="summary-ex-name">Feeling</span><span class="summary-ex-val">${log.feel}</span></div>` : ''}
        ${log.notes ? `<div class="summary-exercise"><span class="summary-ex-name">Notes</span><span class="summary-ex-val" style="max-width:60%;text-align:right;font-weight:400;">${log.notes}</span></div>` : ''}
      </div>
      <button class="btn btn-secondary" data-action="open-run-logger" data-date="${dateStr}">
        Edit Log
      </button>
    `;
  }
}

// =============================================================
//  VIEW: WEIGHT LOGGER
// =============================================================

function openWeightLogger(dateStr, workoutType) {
  state.subView = 'weight_logger';
  state.logDate = dateStr;

  // Load or init active workout
  const existing = DB.getActiveWorkout();
  if (existing && existing.date === dateStr && existing.type === workoutType) {
    activeWkt = existing;
  } else {
    const wData = WEIGHT_WORKOUTS[workoutType];
    activeWkt = {
      date: dateStr,
      type: workoutType,
      startedAt: new Date().toISOString(),
      exercises: {}
    };
    // Check completed log first (for "Edit Workout" re-entry)
    const completedLog = DB.getWeightLogs()[dateStr];
    wData.exercises.forEach(ex => {
      if (completedLog?.exercises?.[ex.name]) {
        activeWkt.exercises[ex.name] = { ...completedLog.exercises[ex.name] };
      } else {
        let weight = DB.getLastWeightForExercise(ex.name);
        if (weight == null) weight = ex.name === 'Pull-up' ? 0 : (wData.defaults[ex.name] || 45);
        activeWkt.exercises[ex.name] = {
          weight,
          sets: Array(ex.sets).fill(false)
        };
      }
    });
    DB.saveActiveWorkout(activeWkt);
  }

  renderWeightLogger(dateStr, workoutType);
}

function renderWeightLogger(dateStr, workoutType) {
  const wData = WEIGHT_WORKOUTS[workoutType];
  const unit  = DB.getUnit();
  const d     = fromDateStr(dateStr);

  setTitle(`${wData.name}`);
  showBack(true);
  showNav(false);

  let totalSets = 0, doneSets = 0;
  wData.exercises.forEach(ex => {
    totalSets += ex.sets;
    const ed = activeWkt.exercises[ex.name];
    if (ed) doneSets += ed.sets.filter(Boolean).length;
  });
  const pct = totalSets > 0 ? Math.round(doneSets / totalSets * 100) : 0;

  const exercisesHtml = wData.exercises.map((ex, exIdx) => {
    const ed = activeWkt.exercises[ex.name] || { weight: ex.name === 'Pull-up' ? 0 : 45, sets: Array(ex.sets).fill(false) };
    const allDone = ed.sets.every(Boolean);
    const weightLabel = ex.name === 'Pull-up' && ed.weight === 0
      ? `BW` : `${displayWeight(ed.weight, unit)} ${unit}`;

    const setsHtml = ed.sets.map((done, si) => `
      <button class="set-btn ${done ? 'done' : ''}"
              data-action="toggle-set"
              data-exercise="${ex.name}"
              data-set="${si}">
        <span class="set-num">${si + 1}</span>
        <span class="set-check">${done ? '✓' : '·'}</span>
      </button>
    `).join('');

    const wBtnMinus = `<button class="w-btn" data-action="weight-adjust" data-exercise="${ex.name}" data-dir="-1">−</button>`;
    const wBtnPlus  = `<button class="w-btn" data-action="weight-adjust" data-exercise="${ex.name}" data-dir="1">+</button>`;

    return `
      <div class="exercise-block ${allDone ? 'all-done' : ''}" id="exblock-${exIdx}">
        <div class="exercise-name">${allDone ? '✅ ' : ''}${ex.name}</div>
        <div class="exercise-hint">${ex.hint}</div>
        <div class="exercise-target">${ex.sets} sets × ${ex.reps} reps</div>

        <div class="weight-adjuster">
          ${wBtnMinus}
          <div class="w-display">
            <span class="weight-val" id="wval-${ex.name.replace(/\s+/g,'_')}">${weightLabel}</span>
          </div>
          ${wBtnPlus}
        </div>

        <div class="sets-row">${setsHtml}</div>
      </div>
    `;
  }).join('');

  setView(`
    <div class="view-pad pb-nav fade-up">
      <div class="progress-label mb-4 text-muted text-sm">
        <span>Progress</span><span>${doneSets} / ${totalSets} sets</span>
      </div>
      <div class="progress-track mb-16">
        <div class="progress-fill" style="width:${pct}%"></div>
      </div>

      ${exercisesHtml}

      <div style="height:80px;"></div>
    </div>
    <div class="finish-bar">
      <button class="btn btn-success" data-action="finish-workout" data-date="${dateStr}" data-workout="${workoutType}">
        Finish Workout${doneSets > 0 && doneSets < totalSets ? ` (${pct}%)` : ''}
      </button>
    </div>
  `);
}

// =============================================================
//  VIEW: RUN LOGGER
// =============================================================

function openRunLogger(dateStr) {
  state.subView = 'run_logger';
  state.logDate = dateStr;
  renderRunLogger(dateStr);
}

function renderRunLogger(dateStr) {
  const d   = fromDateStr(dateStr);
  const wkt = getWorkoutForDate(d);
  const run = wkt.run || { title: 'Run', steps: [] };

  // Check if already logged
  const existing = DB.getRunLogs()[dateStr];

  setTitle(run.title);
  showBack(true);
  showNav(false);

  const feelVal  = existing ? existing.feel   : '';
  const timeVal  = existing ? existing.totalTime : '';
  const distVal  = existing ? existing.distance  : '';
  const notesVal = existing ? existing.notes    : '';

  const feels = ['😩', '😐', '😊', '💪'];

  setView(`
    <div class="view-pad pb-nav fade-up">
      <div class="run-instruction-card mb-16">
        <div class="run-badge ${run.type}">${run.type.replace('-', ' ')}</div>
        <div class="workout-title mb-12">${run.title}</div>
        ${run.steps.map(s => `
          <div class="run-step">
            <div class="run-step-dot ${s.color}"></div>
            <div>
              <div class="run-step-text">${s.text}</div>
              <div class="run-step-label">${s.label}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="form-group">
        <label class="form-label">Total Time (MM:SS)</label>
        <input class="form-input time-input" type="text" id="run-time"
               inputmode="numeric" placeholder="18:30" maxlength="7"
               value="${timeVal}">
      </div>

      <div class="form-group">
        <label class="form-label">Distance (miles, optional)</label>
        <input class="form-input" type="number" id="run-dist"
               inputmode="decimal" placeholder="2.0" step="0.1" min="0"
               value="${distVal}">
      </div>

      <div class="form-group">
        <label class="form-label">How'd it feel?</label>
        <div class="feel-row">
          ${feels.map(f => `
            <button class="feel-btn ${f === feelVal ? 'selected' : ''}"
                    data-action="set-feel" data-feel="${f}">${f}</button>
          `).join('')}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Notes (optional)</label>
        <textarea class="form-textarea" id="run-notes" placeholder="How did the intervals feel? Weather? Splits?">${notesVal}</textarea>
      </div>

      <button class="btn btn-run mt-8" data-action="save-run" data-date="${dateStr}">
        Save Run
      </button>
    </div>
  `);

  // Time auto-format
  document.getElementById('run-time').addEventListener('input', formatTimeInput);
}

function formatTimeInput(e) {
  let v = e.target.value.replace(/[^0-9]/g, '');
  if (v.length > 4) v = v.slice(0, 4);
  if (v.length >= 3) v = v.slice(0, -2) + ':' + v.slice(-2);
  e.target.value = v;
}

// =============================================================
//  VIEW: SCHEDULE
// =============================================================

function renderSchedule() {
  setTitle('Schedule');
  showBack(false);
  showNav(true);
  setActiveNav('schedule');

  const t = today();
  const offsetDate = addDays(getMondayOf(t), state.schedWeekOffset * 7);
  const monday = getMondayOf(offsetDate);

  const programWeekOfMonday = getProgramWeek(monday);
  const isCurrentWeek = state.schedWeekOffset === 0;

  const weekLabel = isCurrentWeek ? 'This Week' :
    state.schedWeekOffset === -1 ? 'Last Week' :
    state.schedWeekOffset === 1 ? 'Next Week' :
    `Week of ${formatDateShort(monday)}`;

  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push(addDays(monday, i));
  }

  const daysHtml = days.map(d => {
    const ds   = toDateStr(d);
    const wkt  = getWorkoutForDate(d);
    const isToday   = ds === toDateStr(t);
    const isDone = isLoggedForDate(ds);
    const isRest = wkt.type === 'rest';

    let wktName = 'Rest';
    let wktDesc = '';
    let statusIcon = '';
    let rowClass = '';

    if (isToday) rowClass += ' today';
    if (isDone)  rowClass += ' done';
    if (isRest)  rowClass += ' rest';

    if (wkt.type === 'weight') {
      const w = WEIGHT_WORKOUTS[wkt.workout];
      wktName = `${w.name}`;
      wktDesc = w.focus;
    } else if (wkt.type === 'run') {
      wktName = wkt.run.title;
      wktDesc = `Week ${wkt.week} · ${wkt.run.type}`;
    }

    if (isDone) statusIcon = '✅';
    else if (isToday && !isRest) statusIcon = '→';
    else if (!isRest) statusIcon = '○';

    return `
      <div class="day-row${rowClass}"
           data-action="${isRest ? '' : 'open-day'}"
           data-date="${ds}">
        <div class="day-indicator">
          <div class="day-abbr">${DAYS_SHORT[d.getDay()]}</div>
          <div class="day-num-sched">${d.getDate()}</div>
        </div>
        <div class="day-info">
          <div class="day-wkt-name">${wktName}</div>
          <div class="day-wkt-desc">${wktDesc}</div>
        </div>
        <div class="day-status-icon">${statusIcon}</div>
      </div>
    `;
  }).join('');

  setView(`
    <div class="view-pad pb-nav fade-up">
      <div class="week-nav">
        <button class="week-nav-btn" data-action="sched-week" data-delta="-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div>
          <div class="week-nav-label">${weekLabel}</div>
          <div class="text-xs text-muted text-center">Program Week ${programWeekOfMonday}</div>
        </div>
        <button class="week-nav-btn" data-action="sched-week" data-delta="1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
      ${daysHtml}
    </div>
  `);
}

// =============================================================
//  VIEW: HISTORY
// =============================================================

function renderHistory() {
  setTitle('History');
  showBack(false);
  showNav(true);
  setActiveNav('history');

  const wLogs = DB.getWeightLogs();
  const rLogs = DB.getRunLogs();

  // Merge and sort by date descending
  const entries = [];
  Object.entries(wLogs).forEach(([d, l]) => entries.push({ date: d, kind: 'weight', log: l }));
  Object.entries(rLogs).forEach(([d, l]) => entries.push({ date: d, kind: 'run', log: l }));
  entries.sort((a, b) => b.date.localeCompare(a.date));

  if (entries.length === 0) {
    setView(`
      <div class="view-pad">
        <div class="empty-state fade-up">
          <div class="empty-icon">📋</div>
          <div class="empty-title">No workouts yet</div>
          <div class="empty-text">Complete your first workout and it'll show up here.</div>
        </div>
      </div>
    `);
    return;
  }

  // Group by week
  const byWeek = {};
  entries.forEach(e => {
    const pw = getProgramWeek(fromDateStr(e.date));
    const key = `Week ${pw}`;
    if (!byWeek[key]) byWeek[key] = [];
    byWeek[key].push(e);
  });

  let html = '';
  Object.entries(byWeek).forEach(([week, items]) => {
    html += `<div class="history-section-label">${week}</div>`;
    items.forEach(e => {
      const d = fromDateStr(e.date);
      const dateLabel = formatDateLong(d);
      if (e.kind === 'weight') {
        const log = e.log;
        const wData = WEIGHT_WORKOUTS[log.type];
        const exercises = log.exercises || {};
        const detail = wData.exercises
          .filter(ex => exercises[ex.name])
          .map(ex => `${ex.name} ${displayWeight(exercises[ex.name].weight, DB.getUnit())}${DB.getUnit()}`)
          .slice(0, 3).join(' · ');

        html += `
          <div class="history-item">
            <div class="history-icon weights">🏋️</div>
            <div class="history-info">
              <div class="history-date">${dateLabel}</div>
              <div class="history-name">${wData.name} — ${wData.focus}</div>
              <div class="history-detail">${detail}</div>
            </div>
          </div>`;
      } else {
        const log = e.log;
        const detail = [
          log.totalTime ? `${log.totalTime}` : '',
          log.distance ? `${log.distance} mi` : '',
          log.feel || ''
        ].filter(Boolean).join(' · ');
        html += `
          <div class="history-item">
            <div class="history-icon run">🏃</div>
            <div class="history-info">
              <div class="history-date">${dateLabel}</div>
              <div class="history-name">${log.title || 'Run'}</div>
              <div class="history-detail">${detail}</div>
            </div>
          </div>`;
      }
    });
  });

  setView(`<div class="view-pad pb-nav fade-up">${html}</div>`);
}

// =============================================================
//  VIEW: SETTINGS
// =============================================================

function renderSettings() {
  setTitle('Settings');
  showBack(false);
  showNav(true);
  setActiveNav('settings');

  const start = DB.getProgramStart();
  const startLabel = start ? formatDateLong(start) : 'Not set';
  const unit = DB.getUnit();

  const wLogs = DB.getWeightLogs();
  const rLogs = DB.getRunLogs();
  const total = Object.keys(wLogs).length + Object.keys(rLogs).length;

  const resetHtml = state.resetConfirm ? `
    <div class="reset-confirm">
      <div class="text-sm text-muted mb-8" style="padding:0 4px;">This will delete all workout history. This cannot be undone.</div>
      <button class="btn btn-danger btn-sm" data-action="confirm-reset">Yes, Delete Everything</button>
      <button class="btn btn-secondary btn-sm" data-action="cancel-reset">Cancel</button>
    </div>
  ` : `
    <button class="btn btn-secondary btn-sm" data-action="reset-program">Reset All Data</button>
  `;

  setView(`
    <div class="view-pad pb-nav fade-up">

      <div class="settings-section">
        <div class="settings-section-label">Program</div>
        <div class="settings-row">
          <span class="settings-row-label">Start Date</span>
          <span class="settings-row-value">${startLabel}</span>
        </div>
        <div class="form-group mt-8">
          <input type="date" id="settings-start-date"
                 value="${start ? toDateStr(start) : toDateStr(getMondayOf(today()))}">
        </div>
        <button class="btn btn-secondary btn-sm mt-8" data-action="update-start-date">
          Update Start Date
        </button>
      </div>

      <div class="settings-section">
        <div class="settings-section-label">Units</div>
        <div class="settings-row">
          <span class="settings-row-label">Weight Unit</span>
          <div class="unit-toggle">
            <button class="unit-btn ${unit === 'lbs' ? 'active' : ''}" data-action="set-unit" data-unit="lbs">lbs</button>
            <button class="unit-btn ${unit === 'kg' ? 'active' : ''}" data-action="set-unit" data-unit="kg">kg</button>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-label">Stats</div>
        <div class="settings-row">
          <span class="settings-row-label">Total Workouts</span>
          <span class="settings-row-value">${total}</span>
        </div>
        <div class="settings-row">
          <span class="settings-row-label">Strength Sessions</span>
          <span class="settings-row-value">${Object.keys(wLogs).length}</span>
        </div>
        <div class="settings-row">
          <span class="settings-row-label">Run Sessions</span>
          <span class="settings-row-value">${Object.keys(rLogs).length}</span>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-label">Data</div>
        ${resetHtml}
      </div>

    </div>
  `);
}

// =============================================================
//  NAVIGATION
// =============================================================

function navigate(view) {
  // Clear sub-view state
  state.subView = null;
  state.logDate = null;
  state.view    = view;
  state.resetConfirm = false;
  showNav(true);
  showBack(false);

  switch (view) {
    case 'today':    renderToday();    break;
    case 'schedule': renderSchedule(); break;
    case 'history':  renderHistory();  break;
    case 'settings': renderSettings(); break;
  }
}

function goBack() {
  if (state.subView === 'weight_logger') {
    // Save progress but don't complete
    if (activeWkt) DB.saveActiveWorkout(activeWkt);
  }
  state.subView = null;
  navigate(state.view);
}

// =============================================================
//  EVENT HANDLING
// =============================================================

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el) return;

  const action = el.dataset.action;

  // Bottom nav
  if (el.classList.contains('nav-btn')) {
    navigate(el.dataset.view);
    return;
  }

  switch (action) {

    case 'back':
      goBack();
      break;

    // Welcome
    case 'save-start-date': {
      const val = document.getElementById('start-date-input').value;
      if (!val) return;
      DB.setProgramStart(fromDateStr(val));
      showNav(true);
      renderToday();
      break;
    }

    // Today / Schedule
    case 'open-weight-logger': {
      const dateStr   = el.dataset.date;
      const workoutType = el.dataset.workout;
      openWeightLogger(dateStr, workoutType);
      break;
    }

    case 'open-run-logger': {
      const dateStr = el.dataset.date;
      openRunLogger(dateStr);
      break;
    }

    case 'open-day': {
      const dateStr = el.dataset.date;
      const d   = fromDateStr(dateStr);
      const wkt = getWorkoutForDate(d);
      if (wkt.type === 'weight') {
        state.view = 'schedule';
        openWeightLogger(dateStr, wkt.workout);
      } else if (wkt.type === 'run') {
        state.view = 'schedule';
        openRunLogger(dateStr);
      }
      break;
    }

    // Weight logger
    case 'toggle-set': {
      const exName = el.dataset.exercise;
      const setIdx = parseInt(el.dataset.set, 10);
      if (!activeWkt || !activeWkt.exercises[exName]) break;

      activeWkt.exercises[exName].sets[setIdx] = !activeWkt.exercises[exName].sets[setIdx];
      DB.saveActiveWorkout(activeWkt);

      // Toggle visual immediately, then re-render the exercise block
      el.classList.toggle('done');
      el.querySelector('.set-check').textContent = activeWkt.exercises[exName].sets[setIdx] ? '✓' : '·';
      el.classList.add('just-done');
      setTimeout(() => el.classList.remove('just-done'), 350);

      // Update the exercise block class
      const wData = WEIGHT_WORKOUTS[activeWkt.type];
      const exData = wData.exercises.find(ex => ex.name === exName);
      if (exData) {
        const allDone = activeWkt.exercises[exName].sets.every(Boolean);
        const block = el.closest('.exercise-block');
        if (block) {
          block.classList.toggle('all-done', allDone);
          const nameEl = block.querySelector('.exercise-name');
          if (nameEl) {
            nameEl.textContent = (allDone ? '✅ ' : '') + exName;
          }
        }
      }

      // Update progress bar
      const wktData = WEIGHT_WORKOUTS[activeWkt.type];
      let done = 0, total = 0;
      wktData.exercises.forEach(ex => {
        total += ex.sets;
        const ed = activeWkt.exercises[ex.name];
        if (ed) done += ed.sets.filter(Boolean).length;
      });
      const pct = total > 0 ? Math.round(done / total * 100) : 0;
      const fill = document.querySelector('.progress-fill');
      const label = document.querySelector('.progress-label');
      if (fill) fill.style.width = `${pct}%`;
      if (label) label.innerHTML = `<span>Progress</span><span>${done} / ${total} sets</span>`;

      // Update finish button text
      const finishBtn = document.querySelector('[data-action="finish-workout"]');
      if (finishBtn) {
        finishBtn.textContent = done > 0 && done < total
          ? `Finish Workout (${pct}%)` : 'Finish Workout';
      }
      break;
    }

    case 'weight-adjust': {
      const exName = el.dataset.exercise;
      const dir    = parseInt(el.dataset.dir, 10);
      if (!activeWkt || !activeWkt.exercises[exName]) break;

      const wData = WEIGHT_WORKOUTS[activeWkt.type];
      const exDef = wData.exercises.find(ex => ex.name === exName);
      const inc   = exDef ? exDef.inc : 5;
      const unit  = DB.getUnit();
      // In kg mode: inc/2 kg per step (inc=5→+2.5 kg, inc=2.5→+1.25 kg)
      const lbsInc = unit === 'kg' ? (inc / 2) * 2.20462 : inc;

      const current = activeWkt.exercises[exName].weight;
      const newWeight = Math.max(0, Math.round((current + dir * lbsInc) * 4) / 4);
      activeWkt.exercises[exName].weight = newWeight;
      DB.saveActiveWorkout(activeWkt);

      // Update display
      const displayId = `wval-${exName.replace(/\s+/g, '_')}`;
      const wEl = document.getElementById(displayId);
      if (wEl) {
        const label = exName === 'Pull-up' && newWeight === 0
          ? `BW` : `${displayWeight(newWeight, unit)} ${unit}`;
        wEl.textContent = label;
      }
      break;
    }

    case 'finish-workout': {
      const dateStr    = el.dataset.date;
      const workoutType = el.dataset.workout;
      if (!activeWkt) break;

      const log = {
        type: workoutType,
        completedAt: new Date().toISOString(),
        exercises: { ...activeWkt.exercises }
      };
      DB.saveWeightLog(dateStr, log);
      DB.clearActiveWorkout();
      activeWkt = null;

      navigate(state.view || 'today');
      break;
    }

    // Run logger
    case 'set-feel': {
      const feel = el.dataset.feel;
      document.querySelectorAll('.feel-btn').forEach(b => {
        b.classList.toggle('selected', b.dataset.feel === feel);
      });
      break;
    }

    case 'save-run': {
      const dateStr = el.dataset.date;
      const d = fromDateStr(dateStr);
      const wkt = getWorkoutForDate(d);

      const time  = (document.getElementById('run-time')?.value  || '').trim();
      const dist  = (document.getElementById('run-dist')?.value  || '').trim();
      const notes = (document.getElementById('run-notes')?.value || '').trim();
      const feel  = document.querySelector('.feel-btn.selected')?.dataset.feel || '';

      const log = {
        title: wkt.run?.title || 'Run',
        type: wkt.run?.type || 'easy',
        week: wkt.week || 1,
        completedAt: new Date().toISOString(),
        totalTime: time || '',
        distance: dist ? parseFloat(dist) : null,
        feel,
        notes,
      };

      DB.saveRunLog(dateStr, log);
      navigate(state.view || 'today');
      break;
    }

    // Schedule navigation
    case 'sched-week': {
      const delta = parseInt(el.dataset.delta, 10);
      state.schedWeekOffset += delta;
      renderSchedule();
      break;
    }

    // Settings
    case 'update-start-date': {
      const val = document.getElementById('settings-start-date')?.value;
      if (!val) return;
      DB.setProgramStart(fromDateStr(val));
      renderSettings();
      break;
    }

    case 'set-unit': {
      DB.setUnit(el.dataset.unit);
      renderSettings();
      break;
    }

    case 'reset-program': {
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
      DB.clearAll();
      activeWkt = null;
      state.resetConfirm = false;
      navigate('today');
      break;
    }
  }
});

// =============================================================
//  INIT
// =============================================================

function init() {
  // Restore any in-progress workout from localStorage
  activeWkt = DB.getActiveWorkout();

  navigate('today');
}

init();
