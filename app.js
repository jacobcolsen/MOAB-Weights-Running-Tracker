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

// ============================================================
//  PROGRAM — Strength Templates  (Phase 3)
//  Each entry: { name, sets, reps, category, hint }
//  category drives the coloured chip; reps is a display string.
// ============================================================

const PROGRAM = {
  push: [
    { name:'Barbell Bench Press',     sets:3, reps:'4–6',  category:'Chest',     hint:'Full ROM · retract scapula · slight arch',           rest:180 },
    { name:'Incline Dumbbell Press',  sets:3, reps:'4–6',  category:'Chest',     hint:'30–45° incline · elbows at 45°',                     rest:180 },
    { name:'Standing Overhead Press', sets:3, reps:'4–6',  category:'Shoulders', hint:'Brace core · squeeze glutes · bar over mid-foot',    rest:180 },
    { name:'Side Lateral Raise',      sets:3, reps:'8–10', category:'Shoulders', hint:'Lead with elbows · slight forward lean',             rest:90  },
    { name:'Triceps Pressdown / Dips',sets:3, reps:'6–10', category:'Triceps',   hint:'Lock elbows at sides · full extension',              rest:90  },
  ],
  pull: [
    { name:'Deadlift',               sets:3, reps:'4–6',  category:'Back',   hint:'Push the floor away · bar stays close · neutral spine', rest:180 },
    { name:'Barbell Row',            sets:3, reps:'4–6',  category:'Back',   hint:'Pull to lower chest · hinge 45° · squeeze at top',      rest:180 },
    { name:'Pull-up / Lat Pulldown', sets:3, reps:'6–8',  category:'Back',   hint:'Full hang · drive elbows to hips · chest to bar',       rest:180 },
    { name:'Seated Cable Row',       sets:3, reps:'6–8',  category:'Back',   hint:'Retract scapula · keep torso upright',                  rest:90  },
    { name:'Barbell / Dumbbell Curl',sets:3, reps:'6–10', category:'Biceps', hint:'Full supination at top · don\'t swing',                 rest:90  },
  ],
  legs: [
    { name:'Back Squat',            sets:3, reps:'4–6',  category:'Legs', hint:'Drive knees out · chest tall · below parallel',            rest:180 },
    { name:'Romanian Deadlift',     sets:3, reps:'4–6',  category:'Legs', hint:'Push hips back · soft knee · feel the hamstring stretch',  rest:180 },
    { name:'Leg Press',             sets:3, reps:'6–10', category:'Legs', hint:'Feet shoulder-width · full depth · don\'t lock knees',     rest:90  },
    { name:'Calf Raise',            sets:4, reps:'8–12', category:'Legs', hint:'Full stretch at bottom · pause at top',                   rest:90  },
    { name:'Weighted Cable Crunch', sets:3, reps:'8–12', category:'Core', hint:'Round the spine fully · control the descent',             rest:90  },
  ],
};

// Map category string → CSS class key
const CATEGORY_CLASS = {
  Chest:     'chest',
  Shoulders: 'shoulders',
  Triceps:   'triceps',
  Back:      'back',
  Biceps:    'biceps',
  Legs:      'legs',
  Core:      'core',
};

// ============================================================
//  PROGRESSION — Increment rules per exercise  (Phase 7)
//  Upper-body compounds +5 lb / +2.5 kg
//  Lower-body compounds +10 lb / +5 kg
//  Accessories          +2.5 lb / +1.25 kg
// ============================================================

const PROGRESSION_INCREMENT = {
  lbs: {
    'Barbell Bench Press':       5,
    'Incline Dumbbell Press':    5,
    'Standing Overhead Press':   5,
    'Barbell Row':               5,
    'Pull-up / Lat Pulldown':    5,
    'Deadlift':                 10,
    'Back Squat':               10,
    'Romanian Deadlift':        10,
    'Leg Press':                10,
    'Side Lateral Raise':        2.5,
    'Triceps Pressdown / Dips':  2.5,
    'Seated Cable Row':          2.5,
    'Barbell / Dumbbell Curl':   2.5,
    'Calf Raise':                2.5,
    'Weighted Cable Crunch':     2.5,
  },
  kg: {
    'Barbell Bench Press':       2.5,
    'Incline Dumbbell Press':    2.5,
    'Standing Overhead Press':   2.5,
    'Barbell Row':               2.5,
    'Pull-up / Lat Pulldown':    2.5,
    'Deadlift':                  5,
    'Back Squat':                5,
    'Romanian Deadlift':         5,
    'Leg Press':                 5,
    'Side Lateral Raise':        1.25,
    'Triceps Pressdown / Dips':  1.25,
    'Seated Cable Row':          1.25,
    'Barbell / Dumbbell Curl':   1.25,
    'Calf Raise':                1.25,
    'Weighted Cable Crunch':     1.25,
  },
};

// ============================================================
//  RUN PLAN — 6-week rotating cycle  (Phase 4)
//  Weeks repeat: week 7 = week 1, etc.
//  run_a = Tuesday speed day · run_b = Thursday tempo/pace day
// ============================================================

const RUN_PLAN = {
  run_a: [
    { week:1, title:'6 × 400m',          main:'6 × 400m hard',                  rest:'90 sec rest',  focus:'VO₂ Max',          intervals:6, intervalDist:'400m' },
    { week:2, title:'8 × 400m',          main:'8 × 400m hard',                  rest:'90 sec rest',  focus:'Speed Volume',      intervals:8, intervalDist:'400m' },
    { week:3, title:'4 × 800m',          main:'4 × 800m hard',                  rest:'2 min rest',   focus:'Speed Endurance',   intervals:4, intervalDist:'800m' },
    { week:4, title:'6 × 400m Fast',     main:'6 × 400m hard',                  rest:'75 sec rest',  focus:'Speed · Less Rest', intervals:6, intervalDist:'400m' },
    { week:5, title:'5 × 800m',          main:'5 × 800m hard',                  rest:'2 min rest',   focus:'Speed Endurance',   intervals:5, intervalDist:'800m' },
    { week:6, title:'2-Mile Time Trial', main:'2-mile time trial — best effort', rest:'',             focus:'Race Effort',        intervals:0, isTrial:true       },
  ],
  run_b: [
    { week:1, title:'1.5 Mi Tempo',   main:'1.5 miles comfortably hard',                   rest:'',           focus:'Lactate Threshold',   intervals:0 },
    { week:2, title:'2 Mi @ Goal+15', main:'2 miles at goal pace + 15–20 sec/mile',         rest:'',           focus:'Pace Control',         intervals:0 },
    { week:3, title:'20 Min Tempo',   main:'20 min steady tempo',                           rest:'',           focus:'Aerobic Threshold',    intervals:0 },
    { week:4, title:'1 + 1 Mile',     main:'1 mile easy, then 1 mile hard',                 rest:'',           focus:'Negative Split',       intervals:2, intervalDist:'1 mi' },
    { week:5, title:'2 × 1 Mile',     main:'2 × 1 mile at strong controlled pace',         rest:'3 min rest',  focus:'Race Pace Endurance',  intervals:2, intervalDist:'1 mi' },
    { week:6, title:'Easy + Strides', main:'Easy recovery run + 4–6 × 20 sec strides',      rest:'',           focus:'Recovery',             intervals:0 },
  ],
};

// ============================================================
//  STORAGE
// ============================================================

const Store = {
  KEYS: {
    START:       'moab_start',
    LOGS:        'moab_day_logs',
    ASSIGNMENTS: 'moab_assignments',
    UNIT:        'moab_unit',
    RUN_GOAL:      'moab_run_goal',
    RUN_CURRENT:   'moab_run_current',
    RUN_LOGS:      'moab_run_logs',
    STRENGTH_LOGS: 'moab_strength_logs',
    WEIGHT_LOG:    'moab_weight_log',
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

  // ---- Run goal / current times ----
  getRunGoal()    { return this._get(this.KEYS.RUN_GOAL)    || ''; },
  setRunGoal(t)   { this._set(this.KEYS.RUN_GOAL, t); },
  getRunCurrent() { return this._get(this.KEYS.RUN_CURRENT) || ''; },
  setRunCurrent(t){ this._set(this.KEYS.RUN_CURRENT, t); },

  // ---- Run session logs: { time, distance, splits, effort, notes, completedAt } ----
  getRunLogs()        { return this._get(this.KEYS.RUN_LOGS) || {}; },
  getRunLog(ds)       { return this.getRunLogs()[ds] || null; },
  setRunLog(ds, data) {
    const l = this.getRunLogs();
    l[ds] = data;
    this._set(this.KEYS.RUN_LOGS, l);
  },
  deleteRunLog(ds) {
    const l = this.getRunLogs();
    delete l[ds];
    this._set(this.KEYS.RUN_LOGS, l);
  },

  // ---- Strength session logs ----
  getStrengthLogs()        { return this._get(this.KEYS.STRENGTH_LOGS) || {}; },
  getStrengthLog(ds)       { return this.getStrengthLogs()[ds] || null; },
  setStrengthLog(ds, data) {
    const l = this.getStrengthLogs();
    l[ds] = data;
    this._set(this.KEYS.STRENGTH_LOGS, l);
  },

  // Return { weight, reps } from the most recent completed set for this exercise name
  getLastSetForExercise(name) {
    const logs  = this.getStrengthLogs();
    let best = null, bestDs = '';
    for (const [ds, log] of Object.entries(logs)) {
      if (ds < bestDs) continue;
      const ex      = (log.exercises || []).find(e => e.name === name);
      const doneSet = ex ? (ex.sets || []).find(s => s.done && s.weight) : null;
      if (!doneSet) continue;
      best   = { weight: doneSet.weight, reps: doneSet.reps };
      bestDs = ds;
    }
    return best;
  },

  // ---- Body weight log: [{ ds, weight }] sorted oldest first ----
  getWeightLog() { return this._get(this.KEYS.WEIGHT_LOG) || []; },
  logBodyWeight(ds, w) {
    const log = this.getWeightLog();
    const idx = log.findIndex(e => e.ds === ds);
    if (idx >= 0) log[idx].weight = w;
    else { log.push({ ds, weight: w }); log.sort((a, b) => a.ds.localeCompare(b.ds)); }
    this._set(this.KEYS.WEIGHT_LOG, log);
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
//  RUN UTILITIES
// ============================================================

function parseMmSs(str) {
  const parts = (str || '').trim().split(':').map(Number);
  if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
  return parts[0] * 60 + parts[1];
}

function formatMmSs(totalSecs) {
  const abs = Math.abs(totalSecs);
  const m = Math.floor(abs / 60);
  const s = Math.round(abs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function getRunCycleWeek(programWeek) {
  return ((programWeek - 1) % 6) + 1;
}

function getRunWorkout(wktKey, programWeek) {
  const idx = (programWeek - 1) % 6;
  return RUN_PLAN[wktKey]?.[idx] || null;
}

function formatStopwatch(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${m}:${String(s).padStart(2,'0')}`;
}

function computeAvgPace(timeStr, distStr) {
  const totalSecs = parseMmSs(timeStr);
  const dist      = parseFloat(distStr);
  if (!totalSecs || !dist || dist <= 0) return '';
  return formatMmSs(Math.round(totalSecs / dist));
}

// ============================================================
//  PROGRESSIVE OVERLOAD  (Phase 7)
// ============================================================

function parseRepRange(repsStr) {
  // handles en-dash (–) and regular hyphen (-)
  const parts = String(repsStr).split(/[–\-]/).map(s => parseInt(s.trim(), 10));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { min: parts[0], max: parts[1] };
  }
  const n = parseInt(String(repsStr), 10);
  return { min: isNaN(n) ? 1 : n, max: isNaN(n) ? 99 : n };
}

function computeProgression(exName, repRangeStr) {
  const unit    = Store.getUnit();
  const allLogs = Store.getStrengthLogs();
  const entries = Object.entries(allLogs)
    .sort((a, b) => b[0].localeCompare(a[0]));

  // collect up to 3 most-recent sessions that logged done sets for this exercise
  const history = [];
  for (const [, log] of entries) {
    const ex       = (log.exercises || []).find(e => e.name === exName);
    const doneSets = ex ? (ex.sets || []).filter(s => s.done && s.weight && s.reps) : [];
    if (doneSets.length > 0) {
      history.push(doneSets);
      if (history.length >= 3) break;
    }
  }

  if (history.length === 0) return null;

  const range     = parseRepRange(repRangeStr);
  const incMap    = PROGRESSION_INCREMENT[unit] || PROGRESSION_INCREMENT.lbs;
  const increment = (exName in incMap) ? incMap[exName] : (unit === 'kg' ? 2.5 : 5);
  const latest    = history[0];
  const latestW   = parseFloat(latest[0].weight);
  if (isNaN(latestW)) return null;

  const lastRepsStr = latest.map(s => s.reps).join(', ');

  // Rule 3: 3 consecutive failures at the same weight → 10% deload
  if (history.length >= 3) {
    const sameW = history.every(sets => {
      const w = parseFloat(sets[0].weight);
      return !isNaN(w) && Math.abs(w - latestW) < 0.5;
    });
    const failedAll = history.every(sets =>
      sets.some(s => parseInt(s.reps, 10) < range.min)
    );
    if (sameW && failedAll) {
      const deloadW = Math.round(latestW * 0.9);
      return {
        lastWeight: latest[0].weight, lastReps: lastRepsStr,
        recommendation: String(deloadW),
        reason: '10% deload — 3 failed sessions',
        rule:   'deload',
        detail: `You've missed the minimum (${range.min} reps) at ${latestW} ${unit} three sessions in a row. A 10% deload resets your baseline — come back stronger.`,
      };
    }
  }

  const allHitMax    = latest.every(s => parseInt(s.reps, 10) >= range.max);
  const anyMissedMin = latest.some(s  => parseInt(s.reps, 10) < range.min);

  // Rule 1: all sets hit top of range → increase weight
  if (allHitMax) {
    const nextW = latestW + increment;
    return {
      lastWeight: latest[0].weight, lastReps: lastRepsStr,
      recommendation: String(nextW),
      reason: `+${increment} ${unit} — hit top of range`,
      rule:   'increase',
      detail: `All sets hit ${range.max}+ reps (top of range). Add ${increment} ${unit} next session.`,
    };
  }

  // Rule 2: missed minimum → stay
  if (anyMissedMin) {
    return {
      lastWeight: latest[0].weight, lastReps: lastRepsStr,
      recommendation: latest[0].weight,
      reason: 'Same weight — missed minimum reps',
      rule:   'maintain',
      detail: `A set fell below ${range.min} reps. Keep ${latestW} ${unit} until you hit ${range.min}+ reps on every set.`,
    };
  }

  // In range but not at top → stay and work up
  return {
    lastWeight: latest[0].weight, lastReps: lastRepsStr,
    recommendation: latest[0].weight,
    reason: `Same weight — not at ${range.max} reps yet`,
    rule:   'maintain',
    detail: `Sets were in range (${range.min}–${range.max} reps) but haven't hit the top. Keep the weight and aim for ${range.max} reps next time.`,
  };
}

// ============================================================
//  STRENGTH ANALYTICS  (Phase 9)
// ============================================================

function calc1RM(weight, reps) {
  const w = parseFloat(weight);
  const r = parseInt(reps, 10);
  if (!w || !r || w <= 0 || r <= 0) return null;
  return Math.round(w * (1 + r / 30));
}

const PR_LIFTS = [
  'Barbell Bench Press',
  'Back Squat',
  'Deadlift',
  'Standing Overhead Press',
  'Barbell Row',
];

const PR_SHORT = {
  'Barbell Bench Press':     'Bench',
  'Back Squat':              'Squat',
  'Deadlift':                'Deadlift',
  'Standing Overhead Press': 'OHP',
  'Barbell Row':             'Row',
};

const PR_COLOR = {
  'Barbell Bench Press':     '#fb923c',
  'Back Squat':              '#4ade80',
  'Deadlift':                '#4ade80',
  'Standing Overhead Press': '#fb923c',
  'Barbell Row':             '#60a5fa',
};

function getStrengthPRData() {
  const unit    = Store.getUnit();
  const entries = Object.entries(Store.getStrengthLogs())
    .sort((a, b) => a[0].localeCompare(b[0]));

  const prs = {};
  for (const name of PR_LIFTS) {
    prs[name] = { best1RM: 0, bestWeight: 0, bestDate: null, history: [] };
  }

  for (const [ds, log] of entries) {
    for (const ex of (log.exercises || [])) {
      if (!prs[ex.name]) continue;
      const done = (ex.sets || []).filter(s => s.done && s.weight && s.reps);
      if (!done.length) continue;
      let sessionBest = 0;
      for (const s of done) {
        const rm = calc1RM(s.weight, s.reps);
        if (rm && rm > sessionBest) sessionBest = rm;
        const w = parseFloat(s.weight);
        if (!isNaN(w) && w > prs[ex.name].bestWeight) prs[ex.name].bestWeight = w;
      }
      if (sessionBest > 0) {
        prs[ex.name].history.push({ ds, est1RM: sessionBest });
        if (sessionBest > prs[ex.name].best1RM) {
          prs[ex.name].best1RM  = sessionBest;
          prs[ex.name].bestDate = ds;
        }
      }
    }
  }
  return { prs, unit };
}

function getWeeklyCompliance(numWeeks) {
  numWeeks   = numWeeks || 8;
  const curMon = getMondayOf(today());
  return Array.from({ length: numWeeks }, (_, w) => {
    const weekStart = addDays(curMon, -(numWeeks - 1 - w) * 7);
    let sDone = 0, sTotal = 0, rDone = 0, rTotal = 0, skipped = 0;
    for (let d = 0; d < 7; d++) {
      const ds     = toDateStr(addDays(weekStart, d));
      const wkt    = Store.getWorkoutInfo(ds);
      const status = Store.getDayLog(ds)?.status || 'planned';
      if (wkt.key === 'push' || wkt.key === 'pull' || wkt.key === 'legs') {
        sTotal++;
        if (status === 'completed') sDone++;
        if (status === 'skipped')   skipped++;
      } else if (wkt.key === 'run_a' || wkt.key === 'run_b') {
        rTotal++;
        if (status === 'completed') rDone++;
        if (status === 'skipped')   skipped++;
      }
    }
    return {
      lbl: `${MONTHS_S[weekStart.getMonth()]} ${weekStart.getDate()}`,
      weekStart: toDateStr(weekStart),
      sDone, sTotal, rDone, rTotal, skipped,
      total: sTotal + rTotal, done: sDone + rDone,
    };
  });
}

// ============================================================
//  REST TIMER
// ============================================================

function startRestTimer(seconds) {
  clearRestTimer();
  timerRemaining = seconds;
  const strip = $id('rest-timer');
  if (!strip) return;
  strip.classList.remove('timer-hidden');
  renderTimerCount();
  timerInterval = setInterval(() => {
    timerRemaining = Math.max(0, timerRemaining - 1);
    renderTimerCount();
    if (timerRemaining === 0) clearRestTimer();
  }, 1000);
}

function clearRestTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  timerRemaining = 0;
  const strip = $id('rest-timer');
  if (strip) strip.classList.add('timer-hidden');
}

function renderTimerCount() {
  const el = $id('timer-count');
  if (el) el.textContent = formatMmSs(timerRemaining);
}

// ============================================================
//  STOPWATCH
// ============================================================

function startStopwatch() {
  if (stopwatchRunning) return;
  stopwatchRunning = true;
  const origin = Date.now() - stopwatchElapsed * 1000;
  stopwatchInterval = setInterval(() => {
    stopwatchElapsed = Math.floor((Date.now() - origin) / 1000);
    renderStopwatchDisplay();
  }, 500);
  renderStopwatchDisplay();
  syncStopwatchBtns();
}

function pauseStopwatch() {
  if (!stopwatchRunning) return;
  clearInterval(stopwatchInterval);
  stopwatchInterval = null;
  stopwatchRunning  = false;
  syncStopwatchBtns();
}

function resetStopwatch() {
  pauseStopwatch();
  stopwatchElapsed = 0;
  renderStopwatchDisplay();
}

function renderStopwatchDisplay() {
  const el = $id('sw-display');
  if (el) el.textContent = formatStopwatch(stopwatchElapsed);
}

function syncStopwatchBtns() {
  $id('sw-start')?.classList.toggle('hidden', stopwatchRunning);
  $id('sw-pause')?.classList.toggle('hidden', !stopwatchRunning);
}

// ============================================================
//  APP STATE
// ============================================================

const state = {
  view:          'today',
  schedWeekOff:  0,
  modalPage:     null,
  modalDateStr:  null,
  resetConfirm:  false,
  loggerDs:      null,
};

let timerInterval  = null;
let timerRemaining = 0;

let stopwatchInterval = null;
let stopwatchElapsed  = 0;
let stopwatchRunning  = false;

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
  if (wkt.key === 'run_a' || wkt.key === 'run_b') return buildActiveRunWorkout(ds, wkt);
  const exercises = PROGRAM[wkt.key];
  const unit = Store.getUnit();
  const exSection = exercises ? `
    <div class="today-ex-list">
      ${exercises.map(e => {
        const cls  = CATEGORY_CLASS[e.category] || 'legs';
        const prog = computeProgression(e.name, e.reps);
        const progHtml = prog ? `
          <div class="prog-today-hint">
            <span class="prog-today-rec">${prog.recommendation} ${unit}</span>
            <span class="prog-today-rule ${prog.rule}">${prog.reason}</span>
          </div>
        ` : '';
        return `
          <div class="wkt-ex-wrap">
            <div class="wkt-ex-row">
              <div class="ex-row-left">
                <span class="cat-chip ${cls}">${e.category}</span>
                <span class="ex-name">${e.name}</span>
              </div>
              <div class="ex-vol">${e.sets}×${e.reps}</div>
            </div>
            ${progHtml}
          </div>
        `;
      }).join('')}
    </div>
  ` : '';

  return `
    <div class="workout-card ${wkt.color}">
      <div class="type-pill ${wkt.color}">${wkt.emoji}&nbsp; ${labelForType(wkt.key)}</div>
      <div class="workout-card-title">${wkt.name}</div>
      <div class="workout-card-sub">${wkt.sub}</div>
    </div>

    ${exSection}

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

function buildActiveRunWorkout(ds, wkt) {
  const programWeek = getProgramWeek(fromDateStr(ds));
  const cycleWeek   = getRunCycleWeek(programWeek);
  const runWkt      = getRunWorkout(wkt.key, programWeek);
  const goalStr     = Store.getRunGoal();

  const mainDetail = runWkt
    ? `${runWkt.main}${runWkt.rest ? ` · ${runWkt.rest}` : ''}`
    : 'See workout plan';

  const btnLabel = runWkt?.isTrial ? 'Log Time Trial' : 'Log Run';

  return `
    <div class="workout-card ${wkt.color}">
      <div class="type-pill ${wkt.color}">${wkt.emoji}&nbsp; ${labelForType(wkt.key)}</div>
      <div class="workout-card-title">${wkt.name}</div>
      <div class="workout-card-sub">${wkt.sub}</div>
    </div>

    <div class="run-plan-card">
      <div class="run-plan-header">
        <div class="run-plan-title">${runWkt?.title || 'Run Workout'}</div>
        <div class="run-week-badge">Cycle Wk ${cycleWeek}/6</div>
      </div>
      <div class="run-focus-tag">${runWkt?.focus || ''}</div>
      <div class="run-structure">
        <div class="run-struct-row warmup">Warm-up &nbsp;·&nbsp; 5–10 min easy jog</div>
        <div class="run-struct-row main">${mainDetail}</div>
        <div class="run-struct-row cooldown">Cooldown &nbsp;·&nbsp; 5–10 min easy jog</div>
      </div>
      ${buildPaceTargets(wkt.key, runWkt, goalStr)}
    </div>

    <button class="btn btn-primary" data-action="do-start" data-date="${ds}">${btnLabel}</button>

    <div class="btn-row-3 mt-10">
      <button class="btn btn-secondary btn-sm" data-action="do-skip"   data-date="${ds}">Skip</button>
      <button class="btn btn-secondary btn-sm" data-action="open-move" data-date="${ds}">Move</button>
      <button class="btn btn-secondary btn-sm" data-action="open-swap" data-date="${ds}">Swap</button>
    </div>
  `;
}

function buildPaceTargets(wktKey, runWkt, goalStr) {
  const goalSecs = parseMmSs(goalStr);
  if (!goalSecs) {
    return `<div class="pace-no-goal">Set your goal 2-mile time in Settings to see pace targets.</div>`;
  }
  const pacePerMile = goalSecs / 2;
  const rows = [{ label: 'Goal race pace', val: `${formatMmSs(pacePerMile)}/mi` }];

  if (wktKey === 'run_a') {
    if (runWkt?.isTrial) {
      rows.push({ label: 'Target', val: `${formatMmSs(pacePerMile)}/mi — race effort` });
    } else {
      rows.push({ label: 'Interval target', val: `${formatMmSs(pacePerMile - 10)}–${formatMmSs(pacePerMile - 5)}/mi` });
    }
  } else {
    rows.push({ label: 'Tempo target',   val: `${formatMmSs(pacePerMile + 15)}–${formatMmSs(pacePerMile + 20)}/mi` });
    rows.push({ label: 'Easy pace',      val: `${formatMmSs(pacePerMile + 60)}–${formatMmSs(pacePerMile + 90)}/mi` });
  }

  return `
    <div class="pace-targets">
      ${rows.map(r => `
        <div class="pace-target-row">
          <span class="pace-label">${r.label}</span>
          <span class="pace-val">${r.val}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function buildStrengthNextSession(wktKey) {
  const exercises = PROGRAM[wktKey] || [];
  const unit      = Store.getUnit();
  const ICON      = { increase: '↑', deload: '↓', maintain: '→' };
  const rows = exercises.map(ex => {
    const prog = computeProgression(ex.name, ex.reps);
    if (!prog) return '';
    const icon = ICON[prog.rule] || '→';
    return `
      <div class="next-sess-row">
        <span class="next-sess-name">${ex.name}</span>
        <span class="next-sess-rec ${prog.rule}">${icon} ${prog.recommendation} ${unit}</span>
      </div>
    `;
  }).filter(Boolean);
  if (!rows.length) return '';
  return `
    <div class="next-session-card">
      <div class="next-session-label">Next Session</div>
      ${rows.join('')}
    </div>
  `;
}

function buildDoneState(ds, wkt, log) {
  const time       = log?.completedAt
    ? new Date(log.completedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : '';
  const isRun      = wkt.key === 'run_a' || wkt.key === 'run_b';
  const isStrength = wkt.key === 'push' || wkt.key === 'pull' || wkt.key === 'legs';
  const runLog     = isRun      ? Store.getRunLog(ds)      : null;
  const strLog     = isStrength ? Store.getStrengthLog(ds) : null;
  const next       = findNextWorkout(today());
  const nextSessHtml = isStrength ? buildStrengthNextSession(wkt.key) : '';

  // Normalise splits — Phase 4 stored a string, Phase 6 stores an array
  const splitsArr = runLog
    ? (Array.isArray(runLog.splits)
        ? runLog.splits.filter(Boolean)
        : (runLog.splits || '').split(',').map(s => s.trim()).filter(Boolean))
    : [];
  const splitsDisplay = splitsArr.join(' · ');

  const runSummary = runLog ? `
    <div class="run-log-summary">
      ${runLog.time     ? `<div class="rls-row"><span>Time</span><span>${runLog.time}</span></div>` : ''}
      ${runLog.distance ? `<div class="rls-row"><span>Distance</span><span>${runLog.distance} mi</span></div>` : ''}
      ${runLog.avgPace  ? `<div class="rls-row"><span>Avg Pace</span><span>${runLog.avgPace}/mi</span></div>` : ''}
      ${runLog.effort != null ? `<div class="rls-row"><span>Effort</span><span>${runLog.effort}/10</span></div>` : ''}
      ${splitsDisplay   ? `<div class="rls-row rls-splits"><span>Splits</span><span>${splitsDisplay}</span></div>` : ''}
      ${runLog.notes    ? `<div class="rls-notes">${runLog.notes}</div>` : ''}
    </div>
  ` : '';

  const strSummary = strLog ? `
    <div class="strength-log-summary">
      ${(strLog.exercises || []).map(ex => {
        const doneSets = (ex.sets || []).filter(s => s.done && (s.weight || s.reps));
        if (!doneSets.length) return '';
        const setsStr = doneSets.map(s => `${s.weight || '—'}×${s.reps || '—'}`).join(' · ');
        return `
          <div class="sls-row">
            <span class="sls-name">${ex.name}</span>
            <span class="sls-sets">${setsStr}</span>
          </div>
          ${ex.notes ? `<div class="sls-notes">${ex.notes}</div>` : ''}
        `;
      }).filter(Boolean).join('')}
    </div>
  ` : '';

  return `
    <div class="done-banner">
      <div class="done-icon">✅</div>
      <div class="done-title">${wkt.name} Done</div>
      <div class="done-sub">${time ? `Finished at ${time}` : 'Completed today'}</div>
    </div>
    ${runSummary}
    ${strSummary}
    ${nextSessHtml}
    ${nextCard(next)}
    <div class="btn-row mt-16">
      <button class="btn btn-secondary btn-sm" data-action="do-undo"  data-date="${ds}">Undo</button>
      ${isRun
        ? `<button class="btn btn-secondary btn-sm" data-action="do-start" data-date="${ds}">Edit Log</button>`
        : `<button class="btn btn-secondary btn-sm" data-action="open-swap" data-date="${ds}">Swap</button>`
      }
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
//  VIEW: STRENGTH LOGGER
// ============================================================

function renderStrengthLogger(ds, wkt) {
  clearRestTimer();
  state.view     = 'strength-logger';
  state.loggerDs = ds;

  setTitle(wkt.name);
  showBack(true);
  showNav(false);

  const unit      = Store.getUnit();
  const exercises = PROGRAM[wkt.key] || [];

  const exCards = exercises.map((ex, i) => {
    const prog   = computeProgression(ex.name, ex.reps);
    const catCls = CATEGORY_CLASS[ex.category] || 'legs';
    const lastW  = prog?.lastWeight || '';
    const lastR  = prog ? (prog.lastReps.split(',')[0]?.trim() || '') : '';

    const progHtml = prog ? `
      <div class="prog-widget">
        <div class="prog-cols">
          <div class="prog-col">
            <div class="prog-col-lbl">Last</div>
            <div class="prog-col-val">${prog.lastWeight} ${unit}</div>
            <div class="prog-col-sub">${prog.lastReps} reps</div>
          </div>
          <div class="prog-col">
            <div class="prog-col-lbl">Next</div>
            <div class="prog-col-val ${prog.rule}">${prog.recommendation} ${unit}</div>
            <div class="prog-col-sub">${prog.reason}</div>
          </div>
        </div>
        <details class="prog-why">
          <summary>Why?</summary>
          <div class="prog-why-body">${prog.detail}</div>
        </details>
      </div>
    ` : `<div class="prog-widget-empty">No previous data</div>`;

    const setRows = Array.from({ length: ex.sets }, (_, j) => `
      <div class="logger-set-row" id="set-${i}-${j}">
        <span class="set-num">${j + 1}</span>
        <input type="number" class="set-weight" id="w-${i}-${j}"
               placeholder="${lastW}" inputmode="decimal" min="0">
        <span class="set-unit">${unit}</span>
        <input type="number" class="set-reps" id="r-${i}-${j}"
               placeholder="${lastR}" inputmode="numeric" min="0" max="99">
        <span class="set-reps-lbl">reps</span>
        <button class="set-done-btn" data-action="mark-set"
                data-ex="${i}" data-set="${j}" data-rest="${ex.rest}">○</button>
      </div>
    `).join('');

    return `
      <div class="logger-exercise">
        <div class="logger-ex-header">
          <div class="logger-ex-left">
            <span class="cat-chip ${catCls}">${ex.category}</span>
            <span class="logger-ex-name">${ex.name}</span>
          </div>
          <span class="logger-ex-target">${ex.sets}×${ex.reps}</span>
        </div>
        <div class="logger-ex-hint">${ex.hint}</div>
        ${progHtml}
        <div class="logger-sets">${setRows}</div>
        <textarea class="form-input form-textarea logger-notes" id="notes-${i}"
                  placeholder="Notes…"></textarea>
      </div>
    `;
  }).join('');

  setView(`
    <div class="logger-wrap">
      <div class="rest-timer timer-hidden" id="rest-timer">
        <div class="rest-timer-inner">
          <span class="rest-timer-label">Rest</span>
          <span class="rest-timer-count" id="timer-count">3:00</span>
          <button class="rest-timer-skip btn-unstyled" data-action="skip-timer">Skip</button>
        </div>
      </div>
      <div class="logger-body pad">
        ${exCards}
        <button class="btn btn-primary mt-20 mb-safe"
                data-action="finish-workout" data-date="${ds}">
          Finish Workout
        </button>
      </div>
    </div>
  `);
}

function finishStrengthWorkout(ds) {
  const wkt       = Store.getWorkoutInfo(ds);
  const exercises = PROGRAM[wkt.key] || [];
  const unit      = Store.getUnit();

  const exData = exercises.map((ex, i) => ({
    name:     ex.name,
    category: ex.category,
    notes:    $id(`notes-${i}`)?.value.trim() || '',
    sets: Array.from({ length: ex.sets }, (_, j) => ({
      weight: $id(`w-${i}-${j}`)?.value.trim() || '',
      reps:   $id(`r-${i}-${j}`)?.value.trim() || '',
      done:   $id(`set-${i}-${j}`)?.classList.contains('set-done') || false,
    })),
  }));

  Store.setStrengthLog(ds, {
    wktKey:      wkt.key,
    wktName:     wkt.name,
    unit,
    completedAt: new Date().toISOString(),
    exercises:   exData,
  });

  completeDay(ds);
  navigate('today');
}

// ============================================================
//  VIEW: RUN LOGGER
// ============================================================

function renderRunLogger(ds, wkt) {
  resetStopwatch();
  state.view     = 'run-logger';
  state.loggerDs = ds;

  setTitle(wkt.name);
  showBack(true);
  showNav(false);

  const programWeek  = getProgramWeek(fromDateStr(ds));
  const cycleWeek    = getRunCycleWeek(programWeek);
  const runWkt       = getRunWorkout(wkt.key, programWeek);
  const goalStr      = Store.getRunGoal();
  const existing     = Store.getRunLog(ds);
  const numIntervals = runWkt?.intervals || 0;

  const mainDetail = runWkt
    ? `${runWkt.main}${runWkt.rest ? ` · ${runWkt.rest}` : ''}`
    : 'See workout plan';

  // Interval split fields
  const splitSection = numIntervals > 0 ? `
    <div class="logger-section-label">Splits — ${runWkt.intervalDist} Rep Times (MM:SS)</div>
    <div class="split-grid">
      ${Array.from({ length: numIntervals }, (_, i) => {
        const prev = Array.isArray(existing?.splits) ? (existing.splits[i] || '') : '';
        return `
          <div class="split-row">
            <span class="split-label">Rep ${i + 1}</span>
            <input type="text" class="split-input form-input" id="split-${i}"
                   placeholder="MM:SS" inputmode="numeric" value="${prev}">
          </div>
        `;
      }).join('')}
    </div>
  ` : '';

  const existEffort = existing?.effort;
  const effortBtns = Array.from({ length: 10 }, (_, i) => {
    const v   = i + 1;
    const sel = existEffort === v ? ' selected' : '';
    return `<button class="effort-btn${sel}" data-action="set-effort" data-val="${v}">${v}</button>`;
  }).join('');

  const existAvgPace = existing?.avgPace ? `${existing.avgPace}/mi` : '—';

  setView(`
    <div class="logger-wrap">

      <div class="sw-strip" id="sw-strip">
        <div class="sw-display" id="sw-display">0:00</div>
        <div class="sw-controls">
          <button class="btn btn-secondary btn-sm" id="sw-start" data-action="sw-start">Start</button>
          <button class="btn btn-secondary btn-sm hidden" id="sw-pause" data-action="sw-pause">Pause</button>
          <button class="btn btn-ghost btn-sm" data-action="sw-reset">Reset</button>
        </div>
        <div class="sw-hint">Time your run live, or enter results below.</div>
      </div>

      <div class="logger-body pad">

        <div class="run-logger-plan">
          <div class="run-plan-header">
            <div class="run-plan-title">${runWkt?.title || wkt.name}</div>
            <div class="run-week-badge">Cycle Wk ${cycleWeek}/6</div>
          </div>
          <div class="run-focus-tag">${runWkt?.focus || ''}</div>
          <div class="run-structure">
            <div class="run-struct-row warmup">Warm-up &nbsp;·&nbsp; 5–10 min easy jog</div>
            <div class="run-struct-row main">${mainDetail}</div>
            <div class="run-struct-row cooldown">Cooldown &nbsp;·&nbsp; 5–10 min easy jog</div>
          </div>
          ${buildPaceTargets(wkt.key, runWkt, goalStr)}
        </div>

        <div class="logger-section-label">Results</div>

        <div class="run-stats-row">
          <div class="form-group">
            <label class="form-label">Distance <span class="form-label-opt">(mi)</span></label>
            <input type="number" id="rl-dist" class="form-input"
                   placeholder="2.0" step="0.01" min="0"
                   value="${existing?.distance || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Total Time <span class="form-label-opt">(MM:SS)</span></label>
            <input type="text" id="rl-time" class="form-input"
                   placeholder="16:42" inputmode="numeric"
                   value="${existing?.time || ''}">
          </div>
        </div>

        <div class="avg-pace-row">
          <span class="avg-pace-label">Avg Pace</span>
          <span class="avg-pace-val" id="rl-avg-pace">${existAvgPace}</span>
        </div>

        ${splitSection}

        <div class="form-group mt-16">
          <label class="form-label">Perceived Effort <span class="form-label-opt">(1–10)</span></label>
          <div class="effort-picker">${effortBtns}</div>
        </div>

        <div class="form-group">
          <label class="form-label">Notes <span class="form-label-opt">(optional)</span></label>
          <textarea id="rl-notes" class="form-input form-textarea"
                    placeholder="How did it feel?">${existing?.notes || ''}</textarea>
        </div>

        <button class="btn btn-primary mt-16 mb-safe"
                data-action="finish-run" data-date="${ds}">
          ${runWkt?.isTrial ? 'Save Time Trial' : 'Finish Run'}
        </button>
      </div>
    </div>
  `);

  // Live avg pace as user types
  const updatePace = () => {
    const p  = computeAvgPace(
      $id('rl-time')?.value.trim() || '',
      $id('rl-dist')?.value.trim() || ''
    );
    const el = $id('rl-avg-pace');
    if (el) el.textContent = p ? `${p}/mi` : '—';
  };
  $id('rl-time')?.addEventListener('input', updatePace);
  $id('rl-dist')?.addEventListener('input', updatePace);
}

function finishRunWorkout(ds) {
  const time     = $id('rl-time')?.value.trim()  || '';
  const distance = $id('rl-dist')?.value.trim()  || '';
  const notes    = $id('rl-notes')?.value.trim() || '';
  const avgPace  = computeAvgPace(time, distance);
  const effortEl = document.querySelector('.effort-btn.selected');
  const effort   = effortEl ? parseInt(effortEl.dataset.val, 10) : null;

  const wkt         = Store.getWorkoutInfo(ds);
  const programWeek = getProgramWeek(fromDateStr(ds));
  const runWkt      = getRunWorkout(wkt.key, programWeek);
  const n           = runWkt?.intervals || 0;
  const splits      = Array.from({ length: n }, (_, i) =>
    $id(`split-${i}`)?.value.trim() || ''
  );

  Store.setRunLog(ds, {
    wktKey:   wkt.key,
    wktTitle: runWkt?.title || '',
    time, distance, avgPace, splits, effort, notes,
    completedAt: new Date().toISOString(),
  });

  if (Store.getDayLog(ds)?.status !== 'completed') completeDay(ds);
  if (runWkt?.isTrial && parseMmSs(time)) Store.setRunCurrent(time);

  pauseStopwatch();
  navigate('today');
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

  function exRows(exercises) {
    return exercises.map(e => {
      const cls = CATEGORY_CLASS[e.category] || 'legs';
      return `
        <div class="wkt-ex-row">
          <div class="ex-row-left">
            <span class="cat-chip ${cls}">${e.category}</span>
            <span class="ex-name">${e.name}</span>
          </div>
          <div class="ex-vol">${e.sets}×${e.reps}</div>
        </div>
      `;
    }).join('');
  }

  const strengthCards = ['push', 'pull', 'legs'].map(key => {
    const wkt = WORKOUT_TYPES[key];
    return `
      <div class="workout-library-card ${wkt.color}">
        <div class="wlc-header">
          <div class="type-pill ${wkt.color}">${wkt.emoji}&nbsp; ${labelForType(key)}</div>
          <div class="wlc-day">${wkt.day}</div>
        </div>
        <div class="wl-title">${wkt.name}</div>
        <div class="wl-sub">${wkt.sub}</div>
        <div class="ex-list mt-12">${exRows(PROGRAM[key])}</div>
      </div>
    `;
  }).join('');

  const cycleWeek  = getRunCycleWeek(getProgramWeek(today()));

  function runPlanRows(key) {
    return RUN_PLAN[key].map((r, i) => {
      const wkNum     = i + 1;
      const isCurrent = wkNum === cycleWeek;
      return `
        <div class="run-plan-row${isCurrent ? ' is-current' : ''}">
          <div class="run-plan-row-wk">Wk ${wkNum}</div>
          <div class="run-plan-row-body">
            <div class="run-plan-row-title">${r.title}</div>
            <div class="run-plan-row-detail">${r.main}${r.rest ? ` · ${r.rest}` : ''}</div>
          </div>
          ${isCurrent ? '<div class="run-current-badge">NOW</div>' : ''}
        </div>
      `;
    }).join('');
  }

  const runCards = `
    <div class="workout-library-card run">
      <div class="wlc-header">
        <div class="type-pill run">🏃&nbsp; Run A</div>
        <div class="wlc-day">Tuesday · Speed</div>
      </div>
      <div class="wl-title">Speed &amp; Intervals</div>
      <div class="wl-sub">VO₂ Max · Speed Endurance · Race Pace</div>
      <div class="run-6wk-plan mt-12">${runPlanRows('run_a')}</div>
    </div>
    <div class="workout-library-card run">
      <div class="wlc-header">
        <div class="type-pill run">🏃&nbsp; Run B</div>
        <div class="wlc-day">Thursday · Tempo</div>
      </div>
      <div class="wl-title">Tempo &amp; Pace Work</div>
      <div class="wl-sub">Lactate Threshold · Aerobic Base · Pacing</div>
      <div class="run-6wk-plan mt-12">${runPlanRows('run_b')}</div>
    </div>
  `;

  setView(`
    <div class="pad fade-up pb-safe">
      ${strengthCards}
      ${runCards}
    </div>
  `);
}

// ============================================================
//  VIEW: PROGRESS — Run progress helpers  (Phase 8)
// ============================================================

function normSplits(raw) {
  if (!raw) return [];
  return (Array.isArray(raw) ? raw : String(raw).split(','))
    .map(s => s.trim()).filter(Boolean);
}

function analyzeRunTrend(sessions) {
  if (sessions.length < 2) return null;
  const recent = sessions[sessions.length - 1].avgSecs;
  const prev   = sessions[sessions.length - 2].avgSecs;
  const diff   = prev - recent;  // positive = got faster (lower time is better)
  if (diff > 2)  return { dir: 'faster', diffSecs: Math.abs(diff) };
  if (diff < -2) return { dir: 'slower', diffSecs: Math.abs(diff) };
  return { dir: 'same', diffSecs: 0 };
}

function getRunProgressData() {
  const currentStr  = Store.getRunCurrent();
  const goalStr     = Store.getRunGoal();
  const currentSecs = parseMmSs(currentStr);
  const goalSecs    = parseMmSs(goalStr);

  const allLogs = Object.entries(Store.getRunLogs())
    .sort((a, b) => a[0].localeCompare(b[0]));  // oldest first

  const trials = allLogs
    .filter(([, l]) => l.wktTitle === '2-Mile Time Trial' && parseMmSs(l.time) !== null)
    .map(([ds, l]) => ({ ds, time: l.time, avgSecs: parseMmSs(l.time) }));

  const s400 = allLogs
    .filter(([, l]) => l.wktKey === 'run_a' && (l.wktTitle || '').includes('400m'))
    .map(([ds, l]) => {
      const vals = normSplits(l.splits).map(parseMmSs).filter(v => v !== null);
      if (!vals.length) return null;
      return { ds, avgSecs: vals.reduce((a, b) => a + b, 0) / vals.length, count: vals.length };
    }).filter(Boolean);

  const s800 = allLogs
    .filter(([, l]) => l.wktKey === 'run_a' && (l.wktTitle || '').includes('800m'))
    .map(([ds, l]) => {
      const vals = normSplits(l.splits).map(parseMmSs).filter(v => v !== null);
      if (!vals.length) return null;
      return { ds, avgSecs: vals.reduce((a, b) => a + b, 0) / vals.length, count: vals.length };
    }).filter(Boolean);

  const tempo = allLogs
    .filter(([, l]) => l.wktKey === 'run_b' && parseMmSs(l.avgPace) !== null)
    .map(([ds, l]) => ({ ds, avgSecs: parseMmSs(l.avgPace) }));

  const recentRuns = [...allLogs].reverse().slice(0, 8).map(([ds, l]) => ({ ds, ...l }));

  return {
    currentStr, goalStr, currentSecs, goalSecs,
    trials, s400, s800, tempo, recentRuns,
    trend400:   analyzeRunTrend(s400),
    trend800:   analyzeRunTrend(s800),
    trendTrial: analyzeRunTrend(trials),
    trendTempo: analyzeRunTrend(tempo),
  };
}

function buildRunProgressSection() {
  const d       = getRunProgressData();
  const hasData = d.currentSecs !== null || d.goalSecs !== null || d.recentRuns.length > 0;
  if (!hasData) {
    return `
      <div class="rp-empty">
        <div class="rp-empty-text">
          Set your 2-mile times in Settings and log a run to see progress here.
        </div>
      </div>
      ${buildRunTips()}
    `;
  }
  return `
    ${buildTwoMileCard(d)}
    ${buildRunTrendSection(d)}
    ${buildRecentRunsSection(d.recentRuns)}
    ${buildRunTips()}
  `;
}

function buildTwoMileCard(d) {
  const hasCurrent = d.currentSecs !== null;
  const hasGoal    = d.goalSecs    !== null;
  if (!hasCurrent && !hasGoal) return '';

  const currentPaceStr = hasCurrent ? `${formatMmSs(d.currentSecs / 2)}/mi` : '—';
  const goalPaceStr    = hasGoal    ? `${formatMmSs(d.goalSecs / 2)}/mi`    : '—';

  let gapHtml = '';
  if (hasCurrent && hasGoal) {
    const gapTotal = d.currentSecs - d.goalSecs;
    if (gapTotal > 0) {
      const gapPace = gapTotal / 2;
      gapHtml = `
        <div class="rp-gap">
          Cut <strong>${formatMmSs(gapTotal)}</strong> total
          &nbsp;·&nbsp; ${formatMmSs(gapPace)}/mi pace gain needed
        </div>
      `;
    } else {
      gapHtml = `<div class="rp-gap rp-gap-met">Goal time reached 🎯</div>`;
    }
  }

  let trialHtml = '';
  if (d.trials.length > 0) {
    const recent = d.trials.slice(-4);
    trialHtml = `
      <div class="rp-trial-list">
        <div class="rp-trial-label">Time Trial Results</div>
        ${recent.map((t, i, arr) => {
          const prev = arr[i - 1];
          let deltaHtml = '';
          if (prev) {
            const diff = prev.avgSecs - t.avgSecs;
            if (diff > 0)      deltaHtml = `<span class="rp-delta faster">−${formatMmSs(diff)}</span>`;
            else if (diff < 0) deltaHtml = `<span class="rp-delta slower">+${formatMmSs(Math.abs(diff))}</span>`;
            else               deltaHtml = `<span class="rp-delta same">no change</span>`;
          }
          const dt  = fromDateStr(t.ds);
          const lbl = `${MONTHS_S[dt.getMonth()]} ${dt.getDate()}`;
          return `
            <div class="rp-trial-row">
              <span class="rp-trial-date">${lbl}</span>
              <span class="rp-trial-time">${t.time}</span>
              ${deltaHtml}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  return `
    <div class="run-prog-card">
      <div class="run-prog-header">
        <div class="run-prog-col">
          <div class="rp-col-lbl">Current</div>
          <div class="rp-col-time">${d.currentStr || '—'}</div>
          <div class="rp-col-pace">${currentPaceStr}</div>
        </div>
        <div class="rp-arrow">→</div>
        <div class="run-prog-col">
          <div class="rp-col-lbl">Goal</div>
          <div class="rp-col-time goal">${d.goalStr || '—'}</div>
          <div class="rp-col-pace">${goalPaceStr}</div>
        </div>
      </div>
      ${gapHtml}
      ${trialHtml}
    </div>
  `;
}

function buildRunTrendSection(d) {
  const ICON_MAP = { faster: '↑', slower: '↓', same: '→' };
  const items = [];

  if (d.s400.length > 0) {
    const latest = d.s400[d.s400.length - 1];
    items.push({ label: '400m Speed', val: formatMmSs(Math.round(latest.avgSecs)),
      sub: `avg split · ${latest.count} reps`, trend: d.trend400 });
  }
  if (d.s800.length > 0) {
    const latest = d.s800[d.s800.length - 1];
    items.push({ label: '800m Speed', val: formatMmSs(Math.round(latest.avgSecs)),
      sub: `avg split · ${latest.count} reps`, trend: d.trend800 });
  }
  if (d.tempo.length > 0) {
    const latest = d.tempo[d.tempo.length - 1];
    items.push({ label: 'Tempo Pace', val: `${formatMmSs(latest.avgSecs)}/mi`,
      sub: 'avg run pace', trend: d.trendTempo });
  }
  if (d.trials.length > 0) {
    const latest = d.trials[d.trials.length - 1];
    items.push({ label: '2-Mile Trial', val: latest.time,
      sub: 'best effort', trend: d.trendTrial });
  }

  if (!items.length) return '';

  return `
    <div class="section-label">Performance</div>
    <div class="run-trend-grid">
      ${items.map(item => {
        const icon     = item.trend ? ICON_MAP[item.trend.dir] : '';
        const trendCls = item.trend?.dir || '';
        const trendHtml = icon
          ? `<span class="rp-trend-icon ${trendCls}">${icon}</span>`
          : '';
        return `
          <div class="run-trend-tile">
            <div class="rtt-header">
              <span class="rtt-label">${item.label}</span>
              ${trendHtml}
            </div>
            <div class="rtt-val">${item.val}</div>
            <div class="rtt-sub">${item.sub}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function buildRecentRunsSection(recentRuns) {
  if (!recentRuns.length) return '';
  const TYPE_LABEL = { run_a: 'Speed', run_b: 'Tempo' };

  const rows = recentRuns.map(run => {
    const dt   = fromDateStr(run.ds);
    const lbl  = `${MONTHS_S[dt.getMonth()]} ${dt.getDate()}`;
    const type = TYPE_LABEL[run.wktKey] || 'Run';
    return `
      <div class="run-hist-row">
        <div class="run-hist-left">
          <span class="run-hist-date">${lbl}</span>
          <span class="run-hist-type">${type}</span>
        </div>
        <div class="run-hist-stats">
          ${run.time     ? `<span class="run-hist-val">${run.time}</span>` : ''}
          ${run.distance ? `<span class="run-hist-sub">${run.distance} mi</span>` : ''}
          ${run.avgPace  ? `<span class="run-hist-sub">${run.avgPace}/mi</span>` : ''}
          ${run.effort != null ? `<span class="run-hist-effort">${run.effort}/10</span>` : ''}
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="section-label">Recent Runs</div>
    <div class="run-hist-list">${rows}</div>
  `;
}

function buildRunTips() {
  const cycleWeek = getRunCycleWeek(getProgramWeek(today()));
  const isTrial   = cycleWeek === 6;
  const tips = [
    { icon: '⚡', text: 'Speed day improves top-end pace.' },
    { icon: '🔥', text: 'Tempo day improves your ability to hold pace.' },
    { icon: isTrial ? '📍' : '📏',
      text: isTrial ? 'This week is a time trial — race your best.' : 'Time trial weeks measure your progress.' },
  ];
  return `
    <div class="section-label">Training Notes</div>
    <div class="run-tips">
      ${tips.map(t => `
        <div class="run-tip">
          <span class="run-tip-icon">${t.icon}</span>
          <span class="run-tip-text">${t.text}</span>
        </div>
      `).join('')}
    </div>
  `;
}

// ============================================================
//  VIEW: PROGRESS — Strength & compliance helpers  (Phase 9)
// ============================================================

function buildSparkline(values, color, height, invert) {
  if (!values || values.length < 2) return '';
  const W = 300, H = height || 52, padX = 6, padY = 8;
  const draw = invert ? values.map(v => -v) : values.slice();
  const min  = Math.min(...draw);
  const max  = Math.max(...draw);
  const rng  = max - min || 1;
  const pts  = draw.map((v, i) => ({
    x: padX + (i / (draw.length - 1)) * (W - padX * 2),
    y: H - padY - ((v - min) / rng) * (H - padY * 2),
  }));
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length-1].x.toFixed(1)},${H} L${pts[0].x.toFixed(1)},${H} Z`;
  const last = pts[pts.length - 1];
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"
    style="width:100%;height:${H}px;display:block;overflow:visible;">
    <path d="${area}" fill="${color}" opacity="0.1"/>
    <path d="${line}" fill="none" stroke="${color}" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${last.x.toFixed(1)}" cy="${last.y.toFixed(1)}" r="3.5" fill="${color}"/>
  </svg>`;
}

function buildPRSection() {
  const { prs, unit } = getStrengthPRData();
  const runData = getRunProgressData();

  const liftTiles = PR_LIFTS.map(name => {
    const pr = prs[name];
    if (!pr.best1RM) return `
      <div class="pr-tile empty">
        <div class="pr-tile-name">${PR_SHORT[name]}</div>
        <div class="pr-tile-empty">No data</div>
      </div>`;
    const dt  = fromDateStr(pr.bestDate);
    const lbl = `${MONTHS_S[dt.getMonth()]} ${dt.getDate()}`;
    return `
      <div class="pr-tile">
        <div class="pr-tile-name">${PR_SHORT[name]}</div>
        <div class="pr-tile-1rm">${pr.best1RM}<span class="pr-tile-unit"> ${unit}</span></div>
        <div class="pr-tile-sub">est. 1RM · ${lbl}</div>
        <div class="pr-tile-actual">${pr.bestWeight} ${unit} max</div>
      </div>`;
  });

  const bestTrial = runData.trials.length
    ? runData.trials.reduce((b, t) => (!b || t.avgSecs < b.avgSecs) ? t : b, null)
    : null;
  const runTile = bestTrial ? (() => {
    const dt  = fromDateStr(bestTrial.ds);
    const lbl = `${MONTHS_S[dt.getMonth()]} ${dt.getDate()}`;
    return `
      <div class="pr-tile run">
        <div class="pr-tile-name">2-Mile</div>
        <div class="pr-tile-1rm">${bestTrial.time}</div>
        <div class="pr-tile-sub">${formatMmSs(bestTrial.avgSecs / 2)}/mi pace</div>
        <div class="pr-tile-actual">Best · ${lbl}</div>
      </div>`;
  })() : `
    <div class="pr-tile empty run">
      <div class="pr-tile-name">2-Mile</div>
      <div class="pr-tile-empty">No trial yet</div>
    </div>`;

  return `
    <div class="section-label">Personal Records</div>
    <div class="pr-grid">${liftTiles.join('')}${runTile}</div>
  `;
}

function buildStrengthChartsSection() {
  const { prs, unit } = getStrengthPRData();

  const rows = PR_LIFTS.map(name => {
    const pr = prs[name];
    if (pr.history.length < 2) return '';
    const vals  = pr.history.map(h => h.est1RM);
    return `
      <div class="scr-row">
        <div class="scr-header">
          <span class="scr-name">${PR_SHORT[name]}</span>
          <span class="scr-val">${vals[vals.length - 1]} ${unit} est. 1RM</span>
        </div>
        ${buildSparkline(vals, PR_COLOR[name] || '#fb923c', 48)}
      </div>`;
  }).filter(Boolean);

  if (!rows.length) return '';
  return `
    <div class="section-label">1RM Progress</div>
    <div class="scr-list">${rows.join('')}</div>
  `;
}

function buildWeeklyComplianceSection() {
  const weeks  = getWeeklyCompliance(8);
  const BAR_H  = 56;
  const bars   = weeks.map((wk, i) => {
    const isCur  = i === weeks.length - 1;
    const barH   = wk.total > 0 ? Math.max(Math.round((wk.done / wk.total) * BAR_H), 3) : 3;
    const barCls = wk.total === 0 ? 'zero'
                 : wk.done / wk.total >= 0.8 ? 'high'
                 : wk.done > 0 ? 'mid' : 'low';
    return `
      <div class="compliance-col${isCur ? ' current' : ''}">
        <div class="compliance-bar-wrap">
          <div class="compliance-bar ${barCls}" style="height:${barH}px"></div>
        </div>
        <div class="compliance-lbl">${wk.lbl.split(' ')[1]}</div>
      </div>`;
  }).join('');

  const tot = weeks.reduce((a, wk) => ({
    done:    a.done    + wk.done,
    total:   a.total   + wk.total,
    skipped: a.skipped + wk.skipped,
    sDone:   a.sDone   + wk.sDone,
    rDone:   a.rDone   + wk.rDone,
  }), { done: 0, total: 0, skipped: 0, sDone: 0, rDone: 0 });
  const avgPct = tot.total ? Math.round((tot.done / tot.total) * 100) : 0;

  return `
    <div class="section-label">Weekly Compliance</div>
    <div class="compliance-card">
      <div class="compliance-chart">${bars}</div>
      <div class="compliance-stats">
        <span class="cs-badge cs-strength">${tot.sDone} strength</span>
        <span class="cs-badge cs-run">${tot.rDone} run</span>
        <span class="cs-badge cs-skip">${tot.skipped} skipped</span>
        <span class="cs-pct">${avgPct}% avg</span>
      </div>
    </div>
  `;
}

function buildBodyWeightSection() {
  const log    = Store.getWeightLog();
  const unit   = Store.getUnit();
  const todayDs = toDateStr(today());
  const latest  = log.length ? log[log.length - 1] : null;
  const nums    = log.map(e => parseFloat(e.weight)).filter(v => !isNaN(v));

  return `
    <div class="section-label">Body Weight</div>
    <div class="bw-card">
      ${nums.length >= 2 ? buildSparkline(nums, '#c084fc', 52) : ''}
      ${latest ? `
        <div class="bw-latest-row">
          <span class="bw-latest-val">${latest.weight} ${unit}</span>
          <span class="bw-latest-date">${(() => {
            const dt = fromDateStr(latest.ds);
            return `${MONTHS_S[dt.getMonth()]} ${dt.getDate()}`;
          })()}</span>
        </div>` : ''}
      <div class="bw-entry-row">
        <input type="number" id="bw-input" class="form-input bw-input"
               placeholder="Today's weight (${unit})" inputmode="decimal" step="0.1"
               value="${log.find(e => e.ds === todayDs)?.weight || ''}">
        <button class="btn btn-secondary btn-sm bw-btn" data-action="log-bodyweight">Log</button>
      </div>
    </div>
  `;
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

        ${buildWeeklyComplianceSection()}
        ${buildPRSection()}
        ${buildStrengthChartsSection()}
        ${buildBodyWeightSection()}

        <div class="section-label">Running</div>
        ${buildRunProgressSection()}
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

  const start      = Store.getProgramStart();
  const unit       = Store.getUnit();
  const runCurrent = Store.getRunCurrent();
  const runGoal    = Store.getRunGoal();
  const goalSecs   = parseMmSs(runGoal);
  const goalPace   = goalSecs ? `${formatMmSs(goalSecs / 2)}/mi` : null;

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
        <div class="settings-group-label">Running</div>
        <div class="form-group">
          <label class="form-label">Current 2-Mile Time <span class="form-label-opt">(MM:SS)</span></label>
          <input type="text" id="settings-run-current" class="form-input"
                 placeholder="e.g. 17:30" inputmode="numeric" value="${runCurrent}">
        </div>
        <div class="form-group">
          <label class="form-label">Goal 2-Mile Time <span class="form-label-opt">(MM:SS)</span></label>
          <input type="text" id="settings-run-goal" class="form-input"
                 placeholder="e.g. 14:00" inputmode="numeric" value="${runGoal}">
        </div>
        ${goalPace ? `
          <div class="settings-row" style="margin-bottom:8px;">
            <span class="settings-row-label">Goal Pace</span>
            <span class="settings-row-value" style="color:var(--run-fg);font-weight:700;">${goalPace}</span>
          </div>
        ` : ''}
        <button class="btn btn-secondary btn-sm" data-action="update-run-times">
          Save Running Times
        </button>
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
          <span class="settings-row-value">Phase 9.0</span>
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
  state.loggerDs     = null;
  state.resetConfirm = false;
  clearRestTimer();
  resetStopwatch();
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
      const ds  = el.dataset.date;
      const wkt = Store.getWorkoutInfo(ds);
      if (wkt.key === 'push' || wkt.key === 'pull' || wkt.key === 'legs') {
        hideModal();
        renderStrengthLogger(ds, wkt);
      } else if (wkt.key === 'run_a' || wkt.key === 'run_b') {
        hideModal();
        renderRunLogger(ds, wkt);
      } else {
        completeDay(ds);
        hideModal();
        refresh();
      }
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

    // ── Back button ────────────────────────────────────────

    case 'back': {
      navigate('today');
      break;
    }

    // ── Strength logger ────────────────────────────────────

    case 'mark-set': {
      const exIdx  = parseInt(el.dataset.ex,   10);
      const setIdx = parseInt(el.dataset.set,  10);
      const rest   = parseInt(el.dataset.rest, 10) || 90;
      const row    = $id(`set-${exIdx}-${setIdx}`);
      if (!row) break;
      const isDone = row.classList.toggle('set-done');
      el.textContent = isDone ? '✓' : '○';
      if (isDone) startRestTimer(rest);
      else        clearRestTimer();
      break;
    }

    case 'finish-workout': {
      finishStrengthWorkout(el.dataset.date);
      break;
    }

    case 'skip-timer': {
      clearRestTimer();
      break;
    }

    // ── Run log ────────────────────────────────────────────

    case 'set-effort': {
      document.querySelectorAll('.effort-btn').forEach(b => b.classList.remove('selected'));
      el.classList.add('selected');
      break;
    }

    case 'finish-run': {
      finishRunWorkout(el.dataset.date);
      break;
    }

    case 'sw-start': {
      startStopwatch();
      break;
    }

    case 'sw-pause': {
      pauseStopwatch();
      break;
    }

    case 'sw-reset': {
      resetStopwatch();
      break;
    }

    // ── Settings ───────────────────────────────────────────

    case 'update-run-times': {
      const cur  = document.getElementById('settings-run-current')?.value.trim() || '';
      const goal = document.getElementById('settings-run-goal')?.value.trim()    || '';
      if (cur)  Store.setRunCurrent(cur);
      if (goal) Store.setRunGoal(goal);
      renderSettings();
      break;
    }

    case 'log-bodyweight': {
      const val = $id('bw-input')?.value.trim();
      if (val && !isNaN(parseFloat(val))) {
        Store.logBodyWeight(toDateStr(today()), val);
        renderProgress();
      }
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
