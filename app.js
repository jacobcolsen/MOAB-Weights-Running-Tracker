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

// ============================================================
//  BODYWEIGHT PROGRAM  (Home / No-gym alternative)
//  Same muscle groups as PROGRAM; equipment-free or household items.
// ============================================================

const PROGRAM_BW = {
  push: [
    { name:'Push-up',               sets:3, reps:'8–20',  category:'Chest',     hint:'Hands shoulder-width · full depth · elbows 45° from torso',              rest:60 },
    { name:'Decline Push-up',       sets:3, reps:'8–15',  category:'Chest',     hint:'Feet elevated on chair · targets upper chest · control the descent',      rest:60 },
    { name:'Pike Push-up',          sets:3, reps:'6–12',  category:'Shoulders', hint:'Hips high in an inverted V · lower crown toward floor · press back up',   rest:60 },
    { name:'Lateral Raise',         sets:3, reps:'10–15', category:'Shoulders', hint:'Use resistance band or water bottles · lead with elbows · no shrugging',  rest:45 },
    { name:'Triceps Dip (Chair)',    sets:3, reps:'6–12',  category:'Triceps',   hint:'Hands on chair behind you · elbows point back · lower until 90° bend',   rest:60 },
  ],
  pull: [
    { name:'Pull-up',               sets:3, reps:'3–10',  category:'Back',   hint:'Dead hang start · drive elbows to hips · chin clears bar · full extension at bottom', rest:90 },
    { name:'Inverted Row',          sets:3, reps:'6–12',  category:'Back',   hint:'Lie under sturdy table · grip edge · body straight · pull chest to table',            rest:60 },
    { name:'Superman Hold',         sets:3, reps:'8–15',  category:'Back',   hint:'Face down on floor · simultaneously lift arms and legs · squeeze glutes at top',       rest:45 },
    { name:'Face Pull (Band)',       sets:3, reps:'10–15', category:'Back',   hint:'Anchor band at face height · pull to ears with elbows high and flared wide',          rest:45 },
    { name:'Chin-up / Band Curl',   sets:3, reps:'4–10',  category:'Biceps', hint:'Supinated-grip chin-up, or stand on band and curl with full supination at top',       rest:60 },
  ],
  legs: [
    { name:'Bodyweight Squat',      sets:3, reps:'15–25', category:'Legs', hint:'Feet shoulder-width · chest tall · full depth · drive knees out over toes',             rest:60 },
    { name:'Single-Leg RDL',        sets:3, reps:'8–12',  category:'Legs', hint:'Hinge on one leg · back flat · reach hand toward floor · feel hamstring stretch',       rest:60 },
    { name:'Bulgarian Split Squat', sets:3, reps:'8–12',  category:'Legs', hint:'Rear foot on chair · front knee tracks toes · lower back knee toward floor',            rest:60 },
    { name:'Single-Leg Calf Raise', sets:4, reps:'12–20', category:'Legs', hint:'Use wall for balance · full stretch at bottom · hard pause at top',                    rest:45 },
    { name:'Hollow Body Hold',      sets:3, reps:'20–30', category:'Core', hint:'Lower back pressed to floor · arms overhead · legs extended and lifted · breathe',     rest:45 },
  ],
};

// ============================================================
//  EQUIPMENT TYPES & PLATE CALCULATOR
// ============================================================

const BARBELL_EXERCISES = new Set([
  // Push
  'Barbell Bench Press', 'Close-Grip Bench Press', 'Floor Press', 'Incline Barbell Press',
  'Standing Overhead Press', 'Push Press',
  // Pull
  'Deadlift', 'Trap Bar Deadlift', 'Sumo Deadlift', 'Rack Pull', 'Good Morning',
  'Barbell Row', 'Pendlay Row', 'T-Bar Row',
  'Barbell / Dumbbell Curl', 'EZ-Bar Curl',
  // Legs
  'Back Squat', 'Front Squat', 'Hack Squat', 'Romanian Deadlift', 'Stiff-Leg Deadlift',
]);

const BAR_WEIGHT  = { lbs: 45, kg: 20 };
const PLATE_SIZES = {
  lbs: [45, 35, 25, 10, 5, 2.5],
  kg:  [20, 15, 10, 5, 2.5, 1.25],
};

const PLATE_BTNS = { lbs: [5, 10, 25, 45], kg: [2.5, 5, 10, 20] };

function calcPlateBreakdown(totalWeight, unit) {
  const total = parseFloat(totalWeight);
  const bar   = BAR_WEIGHT[unit] || 45;
  if (isNaN(total) || total < bar) return null;
  const eachSide = (total - bar) / 2;
  const sizes    = PLATE_SIZES[unit] || PLATE_SIZES.lbs;
  const result   = [];
  let rem = eachSide;
  for (const p of sizes) {
    const n = Math.floor(rem / p + 1e-6);
    if (n > 0) { result.push([n, p]); rem -= n * p; }
  }
  if (rem > 0.15) return null;
  return { bar, result };
}

function formatPlateBreakdown(weightVal, unit) {
  if (!weightVal) return '';
  const data = calcPlateBreakdown(weightVal, unit);
  if (!data) return '';
  if (!data.result.length) return `${data.bar} ${unit} bar only`;
  const parts = data.result.map(([n, p]) => `${n > 1 ? n + '×' : ''}${p}`);
  return `${data.bar} + ${parts.join(' + ')} each side`;
}

function syncPlateHint(exIdx, setIdx) {
  const el = $id(`ph-${exIdx}-${setIdx}`);
  if (!el) return;
  const wEl = $id(`w-${exIdx}-${setIdx}`);
  const w   = wEl?.value || '';
  el.textContent = formatPlateBreakdown(w, Store.getUnit());
}

function syncPlatePicker(exIdx, setIdx) {
  const totalEl = $id(`pt-${exIdx}-${setIdx}`);
  if (!totalEl) return;
  const wEl  = $id(`w-${exIdx}-${setIdx}`);
  const unit = Store.getUnit();
  const bar  = BAR_WEIGHT[unit] || 45;
  const w    = Math.max(bar, parseFloat(wEl?.value) || bar);
  totalEl.textContent = `${Number.isInteger(w) ? w : w.toFixed(2).replace(/\.?0+$/, '')} ${unit}`;
  const bdEl = $id(`pb-${exIdx}-${setIdx}`);
  if (bdEl) bdEl.textContent = formatPlateBreakdown(w, unit);
}

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
//  PHASE 12 — SETTINGS CONSTANTS
// ============================================================

const GOALS = [
  { key: 'cut',       label: 'Cut',          sub: 'Lose body fat'     },
  { key: 'maintain',  label: 'Maintain',     sub: 'Stay at current weight' },
  { key: 'lean_bulk', label: 'Lean Bulk',    sub: 'Build muscle slowly' },
  { key: 'run',       label: 'Improve 2-Mi', sub: 'Prioritize running' },
];

const REST_OPTIONS = [45, 60, 90, 120, 150, 180, 240, 300];

// Curated substitutes for every PROGRAM exercise
const EXERCISE_ALTERNATIVES = {
  // Push day
  'Barbell Bench Press':      ['Barbell Bench Press', 'Dumbbell Flat Press', 'Machine Chest Press', 'Close-Grip Bench Press', 'Floor Press'],
  'Incline Dumbbell Press':   ['Incline Dumbbell Press', 'Incline Barbell Press', 'Cable Incline Fly', 'Machine Incline Press'],
  'Standing Overhead Press':  ['Standing Overhead Press', 'Seated Dumbbell Press', 'Arnold Press', 'Machine Shoulder Press', 'Push Press'],
  'Side Lateral Raise':       ['Side Lateral Raise', 'Cable Lateral Raise', 'Machine Lateral Raise', 'DB Upright Row'],
  'Triceps Pressdown / Dips': ['Triceps Pressdown / Dips', 'Overhead Triceps Extension', 'Close-Grip Push-Up', 'Cable Kickback'],
  // Pull day
  'Deadlift':                 ['Deadlift', 'Trap Bar Deadlift', 'Sumo Deadlift', 'Rack Pull', 'Good Morning'],
  'Barbell Row':              ['Barbell Row', 'Dumbbell Row', 'T-Bar Row', 'Chest-Supported Row', 'Pendlay Row'],
  'Pull-up / Lat Pulldown':   ['Pull-up / Lat Pulldown', 'Assisted Pull-up', 'Cable Lat Pulldown', 'Resistance Band Pulldown'],
  'Seated Cable Row':         ['Seated Cable Row', 'Machine Row', 'Dumbbell Row', 'Band Row'],
  'Barbell / Dumbbell Curl':  ['Barbell / Dumbbell Curl', 'EZ-Bar Curl', 'Hammer Curl', 'Preacher Curl', 'Cable Curl'],
  // Legs day
  'Back Squat':               ['Back Squat', 'Front Squat', 'Goblet Squat', 'Hack Squat', 'Bulgarian Split Squat'],
  'Romanian Deadlift':        ['Romanian Deadlift', 'Stiff-Leg Deadlift', 'Nordic Curl', 'Good Morning', 'Cable Hamstring Curl'],
  'Leg Press':                ['Leg Press', 'Bulgarian Split Squat', 'Step-Up (weighted)', 'Hack Squat'],
  'Calf Raise':               ['Calf Raise', 'Seated Calf Raise', 'Single-Leg Calf Raise', 'Donkey Calf Raise'],
  'Weighted Cable Crunch':    ['Weighted Cable Crunch', 'Ab Wheel Rollout', 'Hanging Leg Raise', 'Decline Sit-Up'],
};

const RUN_ALTERNATIVES = {
  intervals: ['Track intervals', 'Treadmill intervals', 'Stationary bike (high intensity)', 'Stair climber intervals', 'Concept2 rower intervals'],
  tempo:     ['Road tempo run', 'Treadmill tempo', 'Stationary bike (moderate)', 'Elliptical tempo'],
  easy:      ['Easy road run', 'Treadmill easy run', 'Brisk walk', 'Elliptical easy', 'Stationary bike (easy)'],
  trial:     ['2-mile time trial', 'Treadmill time trial', 'Track 2-mile', 'Concept2 2000m row'],
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
    WEIGHT_LOG:       'moab_weight_log',
    BODY_CHECKINS:    'moab_body_checkins',
    ACTIVE_WKT:       'moab_active_wkt',
    NAME:             'moab_name',
    GOAL:             'moab_goal',
    REST_TIMES:       'moab_rest_times',
    CUSTOM_SCHEDULE:  'moab_custom_schedule',
    EX_SUBS:          'moab_ex_subs',
    RUN_SUBS:         'moab_run_subs',
    BODYWEIGHT_DAYS:  'moab_bw_days',
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
    const custom = this.getCustomSchedule();
    return (custom || DEFAULT_SCHEDULE)[fromDateStr(ds).getDay()];
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

  // ---- Active in-progress workout ----
  getActiveWkt()   { return this._get(this.KEYS.ACTIVE_WKT); },
  setActiveWkt(v)  { this._set(this.KEYS.ACTIVE_WKT, v); },
  clearActiveWkt() { localStorage.removeItem(this.KEYS.ACTIVE_WKT); },

  // ---- Profile ----
  getName()       { return this._get(this.KEYS.NAME) || ''; },
  setName(v)      { this._set(this.KEYS.NAME, v); },
  getGoal()       { return this._get(this.KEYS.GOAL) || ''; },
  setGoal(v)      { this._set(this.KEYS.GOAL, v); },

  // ---- Rest timer preferences ----
  getRestTimes()  { return this._get(this.KEYS.REST_TIMES) || { compound: 180, accessory: 90 }; },
  setRestTimes(v) { this._set(this.KEYS.REST_TIMES, v); },

  // ---- Custom default schedule ----
  getCustomSchedule()   { return this._get(this.KEYS.CUSTOM_SCHEDULE) || null; },
  setCustomSchedule(v)  { this._set(this.KEYS.CUSTOM_SCHEDULE, v); },
  resetCustomSchedule() { localStorage.removeItem(this.KEYS.CUSTOM_SCHEDULE); },

  // ---- Exercise substitutions: { 'Back Squat': 'Front Squat', ... } ----
  getExerciseSubs()  { return this._get(this.KEYS.EX_SUBS) || {}; },
  setExerciseSubs(v) { this._set(this.KEYS.EX_SUBS, v); },

  // ---- Run workout alternatives ----
  getRunSubs()   { return this._get(this.KEYS.RUN_SUBS) || {}; },
  setRunSubs(v)  { this._set(this.KEYS.RUN_SUBS, v); },

  // ---- Bodyweight (home) mode: { [ds]: true } ----
  getBodyweightDay(ds) {
    return !!(this._get(this.KEYS.BODYWEIGHT_DAYS) || {})[ds];
  },
  setBodyweightDay(ds, val) {
    const d = this._get(this.KEYS.BODYWEIGHT_DAYS) || {};
    if (val) d[ds] = true; else delete d[ds];
    this._set(this.KEYS.BODYWEIGHT_DAYS, d);
  },

  // ---- Body check-ins: [{ ds, weight, waist, notes }] sorted oldest first ----
  getBodyCheckIns() { return this._get(this.KEYS.BODY_CHECKINS) || []; },
  saveBodyCheckIn(ds, { weight, waist, notes }) {
    const list  = this.getBodyCheckIns();
    const entry = { ds, weight: weight || '', waist: waist || '', notes: notes || '' };
    const idx   = list.findIndex(e => e.ds === ds);
    if (idx >= 0) list[idx] = entry;
    else { list.push(entry); list.sort((a, b) => a.ds.localeCompare(b.ds)); }
    this._set(this.KEYS.BODY_CHECKINS, list);
    if (weight && !isNaN(parseFloat(weight))) this.logBodyWeight(ds, weight);
  },

  clearAll() {
    Object.values(this.KEYS).forEach(k => localStorage.removeItem(k));
  },
};

// ============================================================
//  PHOTO STORAGE  (IndexedDB — keeps photos off localStorage)
// ============================================================

const PhotoDB = (() => {
  const DB_NAME = 'moab_photos';
  const DB_VER  = 1;
  const STORE   = 'photos';
  let _db = null;

  function open() {
    if (_db) return Promise.resolve(_db);
    return new Promise((res, rej) => {
      const req = indexedDB.open(DB_NAME, DB_VER);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE))
          db.createObjectStore(STORE, { keyPath: 'id' });
      };
      req.onsuccess = e => { _db = e.target.result; res(_db); };
      req.onerror   = e => rej(e.target.error);
    });
  }

  return {
    async save(ds, angle, dataUrl) {
      const db = await open();
      return new Promise((res, rej) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put({ id: `${ds}_${angle}`, ds, angle, dataUrl, savedAt: new Date().toISOString() });
        tx.oncomplete = () => res();
        tx.onerror    = e  => rej(e.target.error);
      });
    },

    async get(ds, angle) {
      const db = await open();
      return new Promise((res, rej) => {
        const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(`${ds}_${angle}`);
        req.onsuccess = () => res(req.result || null);
        req.onerror   = e  => rej(e.target.error);
      });
    },

    async getAll() {
      const db = await open();
      return new Promise((res, rej) => {
        const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
        req.onsuccess = () => res(req.result || []);
        req.onerror   = e  => rej(e.target.error);
      });
    },

    async remove(ds, angle) {
      const db = await open();
      return new Promise((res, rej) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).delete(`${ds}_${angle}`);
        tx.oncomplete = () => res();
        tx.onerror    = e  => rej(e.target.error);
      });
    },

    async clearAll() {
      const db = await open();
      return new Promise((res, rej) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).clear();
        tx.oncomplete = () => res();
        tx.onerror    = e  => rej(e.target.error);
      });
    },
  };
})();

// Resize a photo dataURL to max 800px on longest side, JPEG q=0.82
function resizeImage(dataUrl, maxDim = 800) {
  return new Promise(res => {
    const img = new Image();
    img.onload = () => {
      const scale  = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w      = Math.round(img.width  * scale);
      const h      = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      res(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => res(dataUrl); // fallback: store original
    img.src = dataUrl;
  });
}

// ============================================================
//  SCHEDULE ACTIONS
// ============================================================

// Mark a day as completed
function completeDay(ds) {
  Store.setDayLog(ds, { status: 'completed', completedAt: new Date().toISOString() });
}

// Mark a day as skipped (preserves the workout assignment)

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
    if (wkt.key !== 'rest' && wkt.key !== 'optional') {
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

// Return the most recent completed strength log for a given workout key.
// bodyweight flag separates gym sessions from home sessions.
// Result: { ds, exercises: [{name, sets:[{weight,reps,done}]}] } or null.
function getLastStrengthSession(wktKey, bodyweight = false) {
  const logs = Store.getStrengthLogs();
  const entry = Object.entries(logs)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .find(([, log]) => log.wktKey === wktKey && !!log.bodyweight === bodyweight);
  if (!entry) return null;
  return { ds: entry[0], exercises: entry[1].exercises || [] };
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
//  PHASE 13 HELPERS — DURATION TIMER & ACTIVE WORKOUT SAVE
// ============================================================

let durationInterval = null;

function startDurationTimer(startedAtMs) {
  clearInterval(durationInterval);
  durationInterval = setInterval(() => {
    const el = $id('wkt-duration');
    if (!el) { clearInterval(durationInterval); return; }
    const s = Math.floor((Date.now() - startedAtMs) / 1000);
    el.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }, 1000);
}

function clearDurationTimer() {
  clearInterval(durationInterval);
  durationInterval = null;
}

// Serialise current logger DOM inputs → localStorage
function saveActiveWkt(ds) {
  if (!ds) return;
  const wkt       = Store.getWorkoutInfo(ds);
  const existing  = Store.getActiveWkt();
  const isBW      = existing?.ds === ds ? (existing.bodyweight ?? Store.getBodyweightDay(ds)) : Store.getBodyweightDay(ds);
  const baseEx    = (isBW ? PROGRAM_BW : PROGRAM)[wkt.key] || [];
  const exercises = applyExerciseSubs(baseEx);
  const exData    = exercises.map((ex, i) => ({
    name: ex.name,
    sets: Array.from({ length: ex.sets }, (_, j) => ({
      weight: $id(`w-${i}-${j}`)?.value || '',
      reps:   $id(`r-${i}-${j}`)?.value || '',
      done:   $id(`set-${i}-${j}`)?.classList.contains('set-done') || false,
    })),
  }));
  Store.setActiveWkt({ ds, wktKey: wkt.key, bodyweight: isBW, startedAt: existing?.startedAt || Date.now(), exData });
}

// Restore saved inputs + done states into the logger DOM (from active-wkt record)
function restoreActiveWkt(active) {
  (active.exData || []).forEach((ex, i) => {
    (ex.sets || []).forEach((s, j) => {
      const wEl  = $id(`w-${i}-${j}`);
      const rEl  = $id(`r-${i}-${j}`);
      const row  = $id(`set-${i}-${j}`);
      const btn  = row?.querySelector('.set-done-btn');
      if (wEl && s.weight) wEl.value = s.weight;
      if (rEl && s.reps)   rEl.value = s.reps;
      if (s.done && row)   { row.classList.add('set-done'); if (btn) btn.textContent = '✓'; }
      syncPlateHint(i, j);
      syncPlatePicker(i, j);
    });
  });
}

// Pre-populate logger DOM from a previously completed strength log (edit flow)
function restoreFromStrengthLog(log) {
  (log.exercises || []).forEach((ex, i) => {
    const notesEl = $id(`notes-${i}`);
    if (notesEl && ex.notes) notesEl.value = ex.notes;
    (ex.sets || []).forEach((s, j) => {
      const wEl = $id(`w-${i}-${j}`);
      const rEl = $id(`r-${i}-${j}`);
      const row = $id(`set-${i}-${j}`);
      const btn = row?.querySelector('.set-done-btn');
      if (wEl && s.weight) wEl.value = s.weight;
      if (rEl && s.reps)   rEl.value = s.reps;
      if (s.done && row)   { row.classList.add('set-done'); if (btn) btn.textContent = '✓'; }
      syncPlateHint(i, j);
      syncPlatePicker(i, j);
    });
  });
}

// ============================================================
//  PHASE 12 HELPERS — SUBSTITUTIONS, REST, EXPORT/IMPORT
// ============================================================

// Apply stored exercise substitutions to a PROGRAM exercise array
function applyExerciseSubs(exercises) {
  const subs = Store.getExerciseSubs();
  if (!Object.keys(subs).length) return exercises;
  return exercises.map(ex => {
    const alt = subs[ex.name];
    return alt ? { ...ex, name: alt } : ex;
  });
}

// Get effective rest duration for an exercise, respecting user preferences
function getExRest(ex) {
  const rt = Store.getRestTimes();
  return ex.rest >= 180 ? (rt.compound || 180) : (rt.accessory || 90);
}

// Export all localStorage data as a timestamped JSON download
function exportData() {
  const out = { _version: 'Phase 12', _exportedAt: new Date().toISOString() };
  Object.values(Store.KEYS).forEach(k => {
    const v = localStorage.getItem(k);
    if (v !== null) out[k] = v;
  });
  const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `moab-backup-${toDateStr(today())}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import from a JSON string — returns count of keys written, or -1 on parse error
function importData(jsonStr) {
  try {
    const data    = JSON.parse(jsonStr);
    const validKs = new Set(Object.values(Store.KEYS));
    let n = 0;
    Object.entries(data).forEach(([k, v]) => {
      if (validKs.has(k) && typeof v === 'string') { localStorage.setItem(k, v); n++; }
    });
    return n;
  } catch {
    return -1;
  }
}

// ============================================================
//  REST TIMER
// ============================================================

// Short double-beep using the Web Audio API — works offline, no file needed
function beepRestDone() {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.25].forEach(offset => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.2);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.2);
    });
  } catch {}
  if (navigator.vibrate) navigator.vibrate([80, 60, 80]);
}

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
    if (timerRemaining === 0) { beepRestDone(); clearRestTimer(); }
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
  importResult:  null,   // null | number (>=0 ok, -1 error)
};

let timerInterval  = null;
let timerRemaining = 0;

let stopwatchInterval = null;
let stopwatchElapsed  = 0;
let stopwatchRunning  = false;

let _drag = null;

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

function buildWeekStrip(t) {
  const monday  = getMondayOf(t);
  const todayDs = toDateStr(t);

  const cells = Array.from({ length: 7 }, (_, i) => {
    const d   = addDays(monday, i);
    const ds  = toDateStr(d);
    const wkt = Store.getWorkoutInfo(ds);
    const log = Store.getDayLog(ds);
    const status  = log?.status || 'planned';
    const isToday = ds === todayDs;

    let dotCls;
    if (wkt.key === 'rest' || wkt.key === 'optional') dotCls = 'ws-rest';
    else if (status === 'completed') dotCls = 'ws-done';
    else if (status === 'skipped')   dotCls = 'ws-skip';
    else if (isToday)                dotCls = 'ws-today';
    else                             dotCls = 'ws-plan';

    const icon = (wkt.key === 'rest' || wkt.key === 'optional') ? '·'
               : status === 'completed' ? '✓'
               : status === 'skipped'   ? '×'
               : wkt.name.charAt(0);

    return `
      <div class="ws-cell${isToday ? ' ws-current' : ''}">
        <div class="ws-dot ${dotCls}">${icon}</div>
        <div class="ws-lbl">${DAYS_S[d.getDay()].charAt(0)}</div>
      </div>`;
  });

  return `<div class="week-strip">${cells.join('')}</div>`;
}

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

  const weekStrip = buildWeekStrip(t);

  let body;
  if (wkt.key === 'rest') {
    body = buildRestDay(t);
  } else if (status === 'completed') {
    body = buildDoneState(ds, wkt, log);
  } else {
    body = buildActiveWorkout(ds, wkt);
  }

  setView(`<div class="pad pb-safe fade-up">${header}${weekStrip}${body}</div>`);
}


function buildActiveWorkout(ds, wkt) {
  if (wkt.key === 'run_a' || wkt.key === 'run_b') return buildActiveRunWorkout(ds, wkt);

  const isBW       = Store.getBodyweightDay(ds);
  const baseEx     = (isBW ? PROGRAM_BW : PROGRAM)[wkt.key] || [];
  const exercises  = applyExerciseSubs(baseEx);
  const unit       = Store.getUnit();
  const lastSess   = getLastStrengthSession(wkt.key, isBW);

  const lastSessDs  = lastSess ? fromDateStr(lastSess.ds) : null;
  const lastSessLbl = lastSessDs
    ? `${MONTHS_S[lastSessDs.getMonth()]} ${lastSessDs.getDate()}`
    : null;

  const exSection = exercises ? `
    <div class="today-ex-list">
      ${exercises.map(e => {
        const cls  = CATEGORY_CLASS[e.category] || 'legs';
        const prog = isBW ? null : computeProgression(e.name, e.reps);
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

  const lastSessHtml = lastSess ? `
    <div class="last-sess-card">
      <div class="last-sess-hdr">
        <span class="last-sess-title">Last Session</span>
        <span class="last-sess-date">${lastSessLbl}</span>
      </div>
      <div class="last-sess-rows">
        ${lastSess.exercises.map(ex => {
          const doneSets = ex.sets.filter(s => s.done && (s.weight || s.reps));
          if (!doneSets.length) return '';
          const wLabel = doneSets.map(s => s.weight || 'BW').join(' / ');
          const rLabel = doneSets.map(s => s.reps).join(' / ');
          return `
            <div class="last-sess-row">
              <span class="last-sess-ex">${ex.name}</span>
              <span class="last-sess-w">${wLabel}${!isBW ? ' ' + unit : ''} &times; ${rLabel}</span>
            </div>`;
        }).join('')}
      </div>
    </div>
  ` : `
    <div class="last-sess-card last-sess-empty">
      <div class="last-sess-empty-icon">${isBW ? '🏠' : '🏋️'}</div>
      <div class="last-sess-empty-title">No previous session logged</div>
      <div class="last-sess-empty-sub">${isBW ? 'Complete this home workout to start tracking.' : 'Get on it — complete this workout to start tracking your weights.'}</div>
    </div>
  `;

  const active    = Store.getActiveWkt();
  const hasResume = active?.ds === ds && (active.exData || []).some(ex => ex.sets?.some(s => s.weight || s.reps || s.done));

  const startBtns = hasResume ? `
    <div class="resume-banner">
      <div class="resume-banner-text">In-progress workout found</div>
      <div class="resume-banner-sub">Started ${(() => {
        const mins = Math.round((Date.now() - active.startedAt) / 60000);
        return mins < 1 ? 'just now' : `${mins} min ago`;
      })()}</div>
    </div>
    <button class="btn btn-primary" data-action="do-start" data-date="${ds}">Resume Workout</button>
    <button class="btn btn-secondary btn-sm mt-8" data-action="start-fresh" data-date="${ds}">Start Fresh</button>
  ` : `
    <button class="btn btn-primary" data-action="do-start" data-date="${ds}">Start Workout</button>
  `;

  return `
    <div class="workout-card ${wkt.color}">
      <div class="type-pill ${wkt.color}">${wkt.emoji}&nbsp; ${labelForType(wkt.key)}</div>
      <div class="workout-card-title">${wkt.name}</div>
      <div class="workout-card-sub">${wkt.sub}</div>
    </div>

    <div class="bw-mode-toggle">
      <button class="bw-mode-btn${!isBW ? ' active' : ''}"
              data-action="set-bw-mode" data-date="${ds}" data-bw="0">🏋️ Gym</button>
      <button class="bw-mode-btn${isBW ? ' active' : ''}"
              data-action="set-bw-mode" data-date="${ds}" data-bw="1">🏠 Home</button>
    </div>

    ${exSection}
    ${lastSessHtml}
    ${startBtns}
    ${nextCard(findNextWorkout(today()))}
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
  const exercises = applyExerciseSubs(PROGRAM[wktKey] || []);
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
      <button class="btn btn-secondary btn-sm" data-action="do-start" data-date="${ds}">Edit Log</button>
    </div>
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

  const existing    = Store.getActiveWkt();
  const isBW        = existing?.ds === ds
    ? (existing.bodyweight ?? Store.getBodyweightDay(ds))
    : Store.getBodyweightDay(ds);
  const unit        = Store.getUnit();
  const baseEx      = (isBW ? PROGRAM_BW : PROGRAM)[wkt.key] || [];
  const exercises   = applyExerciseSubs(baseEx);
  const lastSession = getLastStrengthSession(wkt.key, isBW);

  const exCards = exercises.map((ex, i) => {
    const prog     = isBW ? null : computeProgression(ex.name, ex.reps);
    const catCls   = CATEGORY_CLASS[ex.category] || 'legs';
    const lastW    = prog?.lastWeight || '';
    const lastR    = prog ? (prog.lastReps.split(',')[0]?.trim() || '') : '';

    // Per-set last session data for this exercise
    const lastEx   = lastSession?.exercises.find(e => e.name === ex.name);
    const lastSets = (lastEx?.sets || []).filter(s => s.done && (s.weight || s.reps));

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
    ` : (lastSets.length === 0 && !isBW ? `<div class="prog-widget-empty">No previous data</div>` : '');

    const recW = prog?.recommendation || lastW;

    // Fill buttons: show "Use last" and "Use recommended" when they differ
    let fillBtns = '';
    if (!isBW) {
      if (lastSets.length > 0 && recW) {
        const wLast = lastSets[0].weight;
        const wStr  = lastSets.map(s => s.weight).join(',');
        const rStr  = lastSets.map(s => s.reps).join(',');
        if (wLast !== recW) {
          fillBtns = `
            <div class="fill-btn-row">
              <button class="fill-btn fill-btn-last" data-action="fill-last"
                      data-ex="${i}" data-weights="${wStr}" data-reps="${rStr}">
                Use last · ${wLast} ${unit}
              </button>
              <button class="fill-btn fill-btn-rec" data-action="repeat-weight"
                      data-ex="${i}" data-weight="${recW}" data-sets="${ex.sets}">
                Use rec. · ${recW} ${unit}
              </button>
            </div>`;
        } else {
          fillBtns = `
            <button class="repeat-weight-btn" data-action="repeat-weight"
                    data-ex="${i}" data-weight="${recW}" data-sets="${ex.sets}">
              Fill ${recW} ${unit} all sets
            </button>`;
        }
      } else if (recW) {
        fillBtns = `
          <button class="repeat-weight-btn" data-action="repeat-weight"
                  data-ex="${i}" data-weight="${recW}" data-sets="${ex.sets}">
            Fill ${recW} ${unit} all sets
          </button>`;
      }
    }

    const adjDelta = unit === 'kg' ? 2.5 : 5;

    const isBarbell = !isBW && BARBELL_EXERCISES.has(ex.name);

    const setRows = Array.from({ length: ex.sets }, (_, j) => {
      const prevSet  = lastSets[j];
      const prevChip = prevSet ? `
        <button class="last-set-chip" data-action="fill-set-last"
                data-ex="${i}" data-set="${j}"
                data-weight="${prevSet.weight || ''}" data-reps="${prevSet.reps || ''}">
          Last: ${prevSet.weight ? prevSet.weight + ' ' + unit : 'BW'}${prevSet.reps ? ' × ' + prevSet.reps + ' reps' : ''}
        </button>` : '';

      const barW    = BAR_WEIGHT[unit] || 45;
      const plateBtns = (PLATE_BTNS[unit] || PLATE_BTNS.lbs);
      const weightField = isBarbell ? `
        <div class="plate-picker-wrap">
          <input type="hidden" id="w-${i}-${j}" value="${barW}">
          <div class="plate-total-row">
            <span class="plate-total" id="pt-${i}-${j}">${barW} ${unit}</span>
            <span class="plate-breakdown" id="pb-${i}-${j}">${barW} ${unit} bar only</span>
          </div>
          <div class="plate-btns">
            ${plateBtns.map(p => `
              <div class="plate-btn-group">
                <button class="plate-btn plate-minus" data-action="plate-sub"
                        data-ex="${i}" data-set="${j}" data-plate="${p}">−</button>
                <span class="plate-label">${p}</span>
                <button class="plate-btn plate-plus" data-action="plate-add"
                        data-ex="${i}" data-set="${j}" data-plate="${p}">+</button>
              </div>`).join('')}
          </div>
        </div>` : `
        <div class="set-adj-row">
          <button class="adj-btn" data-action="adj-weight"
                  data-ex="${i}" data-set="${j}" data-delta="-${adjDelta}">−</button>
          <input type="number" class="set-weight" id="w-${i}-${j}"
                 placeholder="${lastW}" inputmode="decimal" min="0">
          <span class="set-unit">${unit}</span>
          <button class="adj-btn" data-action="adj-weight"
                  data-ex="${i}" data-set="${j}" data-delta="${adjDelta}">+</button>
        </div>`;

      return `
        <div class="logger-set-row" id="set-${i}-${j}">
          <div class="set-meta">
            <span class="set-num">${j + 1}</span>
            <button class="set-done-btn" data-action="mark-set"
                    data-ex="${i}" data-set="${j}" data-rest="${getExRest(ex)}">○</button>
          </div>
          <div class="set-fields">
            ${weightField}
            <div class="set-adj-row">
              <button class="adj-btn" data-action="adj-reps"
                      data-ex="${i}" data-set="${j}" data-delta="-1">−</button>
              <input type="number" class="set-reps" id="r-${i}-${j}"
                     placeholder="${lastR}" inputmode="numeric" min="0" max="99">
              <span class="set-reps-lbl">reps</span>
              <button class="adj-btn" data-action="adj-reps"
                      data-ex="${i}" data-set="${j}" data-delta="1">+</button>
            </div>
            ${prevChip}
          </div>
        </div>
      `;
    }).join('');

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
        ${fillBtns}
        <div class="logger-sets">${setRows}</div>
        <textarea class="form-input form-textarea logger-notes" id="notes-${i}"
                  placeholder="Notes…"></textarea>
      </div>
    `;
  }).join('');

  setView(`
    <div class="logger-wrap">
      <div class="logger-top-bar">
        <span class="logger-top-wkt">${wkt.name}</span>
        <span class="logger-duration-wrap">
          <span class="logger-duration-icon">⏱</span>
          <span class="wkt-duration" id="wkt-duration">0:00</span>
        </span>
      </div>
      ${isBW ? `<div class="bw-logger-banner">🏠 Home / Bodyweight Mode</div>` : ''}
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
          ${isBW ? 'Finish Home Workout' : 'Finish Workout'}
        </button>
      </div>
    </div>
  `);

  // Restore or initialise active workout record
  if (existing?.ds === ds) {
    // Resume an in-progress session
    restoreActiveWkt(existing);
    startDurationTimer(existing.startedAt);
  } else {
    const startedAt = Date.now();
    Store.setActiveWkt({ ds, wktKey: wkt.key, bodyweight: isBW, startedAt, exData: [] });
    startDurationTimer(startedAt);
    // Pre-fill from completed log when editing a finished workout
    const savedLog = Store.getStrengthLog(ds);
    if (savedLog) restoreFromStrengthLog(savedLog);
  }
}

function finishStrengthWorkout(ds) {
  const wkt       = Store.getWorkoutInfo(ds);
  const isBW      = !!(Store.getActiveWkt()?.bodyweight);
  const baseEx    = (isBW ? PROGRAM_BW : PROGRAM)[wkt.key] || [];
  const exercises = applyExerciseSubs(baseEx);
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
    bodyweight:  isBW,
    unit,
    completedAt: new Date().toISOString(),
    exercises:   exData,
  });

  Store.clearActiveWkt();
  clearDurationTimer();
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
    const isDraggable = !isRest && status === 'planned';
    let rowCls = '';
    if (isToday)               rowCls += ' is-today';
    if (status === 'completed') rowCls += ' is-done';
    if (status === 'skipped')   rowCls += ' is-skipped';
    if (isRest)                rowCls += ' is-rest';
    if (isDraggable)           rowCls += ' is-draggable';

    // Status icon (right side)
    const iconMap = { completed: '✅', skipped: '—', moved: '📆' };
    const statusIcon = iconMap[status] || (isRest ? '' : (isToday ? '→' : '○'));

    // Sub-text: show moved info
    let sub = wkt.sub;
    if (status === 'moved' && log?.movedTo) {
      const toD = fromDateStr(log.movedTo);
      sub = `Moved to ${DAYS_LONG[toD.getDay()]} ${toD.getDate()}`;
    }

    const dragHandle = isDraggable ? `
      <div class="sched-drag-handle" aria-label="Drag to reorder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <line x1="8" y1="6"  x2="16" y2="6"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
          <line x1="8" y1="18" x2="16" y2="18"/>
        </svg>
      </div>` : '';

    return `
      <div class="sched-row${rowCls}"
           data-date="${ds}"
           ${isDraggable ? 'data-draggable="true"' : ''}>
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
          ${dragHandle}
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
        Drag <span style="color:#555">⠿</span> to reorder planned workouts.
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

function buildBodyCheckInSection() {
  const checkins  = Store.getBodyCheckIns();
  const weightLog = Store.getWeightLog();
  const unit      = Store.getUnit();
  const todayDs   = toDateStr(today());
  const todayEntry = checkins.find(e => e.ds === todayDs) || null;
  const latest    = checkins.length ? checkins[checkins.length - 1] : null;
  const nums      = weightLog.map(e => parseFloat(e.weight)).filter(v => !isNaN(v));
  const waistUnit = unit === 'kg' ? 'cm' : 'in';

  // Find entry closest to 30 days ago for comparison
  const compCutoff = toDateStr(addDays(today(), -28));
  const olderEntries = checkins.filter(e => e.ds <= compCutoff);
  const compEntry = olderEntries.length ? olderEntries[olderEntries.length - 1] : null;
  const showCompare = compEntry && latest && compEntry.ds !== latest.ds;

  const ANGLES = ['front', 'side', 'back'];
  const photoSlots = ANGLES.map(angle => `
    <label class="photo-slot" for="photo-input-${angle}">
      <div class="photo-slot-preview" id="photo-preview-${angle}">
        <span class="photo-slot-icon">+</span>
        <span class="photo-slot-name">${angle.charAt(0).toUpperCase() + angle.slice(1)}</span>
      </div>
      <input type="file" id="photo-input-${angle}" accept="image/*"
             data-photo-angle="${angle}" data-photo-ds="${todayDs}"
             class="photo-file-input visually-hidden">
    </label>`).join('');

  return `
    <div class="section-label">Body Check-In</div>
    <div class="checkin-card">
      ${nums.length >= 2 ? buildSparkline(nums, '#c084fc', 52) : ''}
      ${latest ? `
        <div class="checkin-latest-row">
          ${latest.weight ? `<span class="checkin-latest-val">${latest.weight} ${unit}</span>` : ''}
          ${latest.waist  ? `<span class="checkin-latest-waist">Waist ${latest.waist} ${waistUnit}</span>` : ''}
          <span class="checkin-latest-date">${(() => {
            const dt = fromDateStr(latest.ds);
            return `${MONTHS_S[dt.getMonth()]} ${dt.getDate()}`;
          })()}</span>
        </div>` : ''}

      <div class="checkin-form">
        <div class="checkin-form-row">
          <input type="number" id="ci-weight" class="form-input checkin-input"
                 placeholder="Weight (${unit})" inputmode="decimal" step="0.1"
                 value="${todayEntry?.weight || ''}">
          <input type="number" id="ci-waist" class="form-input checkin-input"
                 placeholder="Waist (${waistUnit})" inputmode="decimal" step="0.5"
                 value="${todayEntry?.waist || ''}">
        </div>
        <textarea id="ci-notes" class="form-input checkin-notes"
                  placeholder="Notes — e.g. after breakfast, day 3 of cut…" rows="2">${todayEntry?.notes || ''}</textarea>
        <button class="btn btn-primary btn-sm" data-action="save-checkin">Save Check-In</button>
      </div>

      ${showCompare ? `
        <div class="checkin-compare">
          <div class="cc-header">vs. ${(() => {
            const dt = fromDateStr(compEntry.ds);
            return `${MONTHS_S[dt.getMonth()]} ${dt.getDate()}`;
          })()} (~30 days ago)</div>
          <div class="cc-row">
            ${latest.weight && compEntry.weight ? (() => {
              const d   = (parseFloat(latest.weight) - parseFloat(compEntry.weight)).toFixed(1);
              const cls = d < 0 ? 'down' : d > 0 ? 'up' : 'same';
              return `<span class="cc-stat ${cls}">Weight ${d > 0 ? '+' : ''}${d} ${unit}</span>`;
            })() : ''}
            ${latest.waist && compEntry.waist ? (() => {
              const d   = (parseFloat(latest.waist) - parseFloat(compEntry.waist)).toFixed(1);
              const cls = d < 0 ? 'down' : d > 0 ? 'up' : 'same';
              return `<span class="cc-stat ${cls}">Waist ${d > 0 ? '+' : ''}${d} ${waistUnit}</span>`;
            })() : ''}
          </div>
        </div>` : ''}
    </div>

    <div class="section-label">
      Progress Photos
      <span class="photo-local-badge">Local only</span>
    </div>
    <p class="photo-warn">Photos are stored only in this browser and never uploaded. Each photo uses ~50–150 KB after compression.</p>
    <div class="photo-grid">${photoSlots}</div>

    <div id="monthly-photos-wrap" class="monthly-photos-wrap"></div>
  `;
}

// ---- Async: fill photo thumbnails for a given date into the DOM ----
async function loadPhotoThumbnails(ds) {
  for (const angle of ['front', 'side', 'back']) {
    const rec = await PhotoDB.get(ds, angle);
    if (rec) setPhotoPreview(angle, rec.dataUrl, ds);
  }
}

function setPhotoPreview(angle, dataUrl, ds) {
  const preview = $id(`photo-preview-${angle}`);
  if (!preview) return;
  preview.innerHTML = `
    <img src="${dataUrl}" class="photo-thumb" alt="${angle} photo">
    <button class="photo-delete-btn" data-action="delete-photo"
            data-angle="${angle}" data-ds="${ds}" title="Remove">✕</button>`;
}

// ---- Async: load monthly comparison photos and inject into DOM ----
async function loadMonthlyComparison() {
  const wrap = $id('monthly-photos-wrap');
  if (!wrap) return;

  const all = await PhotoDB.getAll();
  if (!all.length) return;

  // Group by date
  const byDate = {};
  all.forEach(r => { (byDate[r.ds] = byDate[r.ds] || {})[r.angle] = r.dataUrl; });
  const dates = Object.keys(byDate).sort();
  if (dates.length < 2) return;

  const newestDs = dates[dates.length - 1];
  const cutoff   = toDateStr(addDays(fromDateStr(newestDs), -21));
  const olderDs  = dates.filter(d => d <= cutoff);
  if (!olderDs.length) return;

  const compareDs = olderDs[olderDs.length - 1];
  const newestDt  = fromDateStr(newestDs);
  const compareDt = fromDateStr(compareDs);
  const fmtDate   = dt => `${MONTHS_S[dt.getMonth()]} ${dt.getDate()}`;

  const ANGLES = ['front', 'side', 'back'];
  const cols = (ds) => {
    const datePhotos = byDate[ds] || {};
    return ANGLES.map(a => datePhotos[a]
      ? `<img src="${datePhotos[a]}" class="compare-thumb" alt="${a}">`
      : `<div class="compare-empty">${a}</div>`
    ).join('');
  };

  wrap.innerHTML = `
    <div class="section-label">Monthly Comparison</div>
    <div class="compare-card">
      <div class="compare-col">
        <div class="compare-col-lbl">${fmtDate(compareDt)}</div>
        ${cols(compareDs)}
      </div>
      <div class="compare-divider"></div>
      <div class="compare-col">
        <div class="compare-col-lbl">${fmtDate(newestDt)}</div>
        ${cols(newestDs)}
      </div>
    </div>`;
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
        ${buildBodyCheckInSection()}

        <div class="section-label">Running</div>
        ${buildRunProgressSection()}
      `}
    </div>
  `);

  if (start) {
    const _ds = toDateStr(t);
    loadPhotoThumbnails(_ds);
    loadMonthlyComparison();
  }
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
  const name       = Store.getName();
  const goal       = Store.getGoal();
  const rt         = Store.getRestTimes();
  const customSch  = Store.getCustomSchedule() || DEFAULT_SCHEDULE;
  const exSubs     = Store.getExerciseSubs();
  const runSubs    = Store.getRunSubs();

  // ── Helper: <select> for rest time ──────────────────────────
  const restSelect = (id, val) => `
    <select id="${id}" class="settings-select">
      ${REST_OPTIONS.map(s => `<option value="${s}"${s === val ? ' selected' : ''}>${s}s</option>`).join('')}
    </select>`;

  // ── Helper: <select> for exercise alternative ──────────────
  const exSubSelect = (exName) => {
    const opts = EXERCISE_ALTERNATIVES[exName] || [exName];
    const cur  = exSubs[exName] || exName;
    return `
      <select class="settings-select ex-sub-select" data-orig="${exName}">
        ${opts.map(o => `<option value="${o}"${o === cur ? ' selected' : ''}>${o}</option>`).join('')}
      </select>`;
  };

  // ── Helper: <select> for run alternative ───────────────────
  const runSubSelect = (type, label) => {
    const opts = RUN_ALTERNATIVES[type] || [];
    const cur  = runSubs[type] || '';
    return `
      <div class="settings-row" style="flex-direction:column;align-items:flex-start;gap:5px;">
        <span class="settings-row-label">${label}</span>
        <select class="settings-select run-sub-select" data-run-type="${type}" style="width:100%">
          <option value="">— No substitute (use plan default) —</option>
          ${opts.map(o => `<option value="${o}"${o === cur ? ' selected' : ''}>${o}</option>`).join('')}
        </select>
      </div>`;
  };

  // ── Reset confirm HTML ──────────────────────────────────────
  const resetHtml = state.resetConfirm ? `
    <p class="text-sm text-muted mb-12" style="padding:0 4px;line-height:1.5;">
      This will permanently delete all logs, assignments, body data, and settings.
    </p>
    <button class="btn btn-danger btn-sm mb-8" data-action="confirm-reset">Yes, Delete Everything</button>
    <button class="btn btn-secondary btn-sm"   data-action="cancel-reset">Cancel</button>
  ` : `
    <button class="btn btn-secondary btn-sm" data-action="reset-data">Reset All Data</button>
  `;

  // ── Import state feedback ───────────────────────────────────
  const importFeedback = state.importResult != null ? `
    <p class="settings-feedback ${state.importResult >= 0 ? 'ok' : 'err'}">
      ${state.importResult >= 0
        ? `Imported ${state.importResult} settings. Reload to see all changes.`
        : 'Import failed — invalid JSON file.'}
    </p>` : '';

  setView(`
    <div class="pad fade-up pb-safe">

      <!-- ── Profile ─────────────────────────────────────── -->
      <div class="settings-section">
        <div class="settings-group-label">Profile</div>
        <div class="form-group">
          <label class="form-label">Your Name</label>
          <input type="text" id="s-name" class="form-input"
                 placeholder="e.g. Jacob" value="${name}">
        </div>
        <div class="goal-grid">
          ${GOALS.map(g => `
            <button class="goal-btn${goal === g.key ? ' active' : ''}"
                    data-action="set-goal" data-goal="${g.key}">
              <span class="goal-btn-label">${g.label}</span>
              <span class="goal-btn-sub">${g.sub}</span>
            </button>`).join('')}
        </div>
        <button class="btn btn-secondary btn-sm mt-8" data-action="save-profile">Save Profile</button>
      </div>

      <!-- ── Program ──────────────────────────────────────── -->
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

      <!-- ── Units ────────────────────────────────────────── -->
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

      <!-- ── Rest Timers ──────────────────────────────────── -->
      <div class="settings-section">
        <div class="settings-group-label">Rest Timers</div>
        <div class="settings-row">
          <span class="settings-row-label">Compound lifts</span>
          ${restSelect('s-rest-compound', rt.compound || 180)}
        </div>
        <div class="settings-row">
          <span class="settings-row-label">Accessory lifts</span>
          ${restSelect('s-rest-accessory', rt.accessory || 90)}
        </div>
        <button class="btn btn-secondary btn-sm mt-8" data-action="save-rest-times">Save Rest Times</button>
      </div>

      <!-- ── Running ──────────────────────────────────────── -->
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
          </div>` : ''}
        <button class="btn btn-secondary btn-sm" data-action="update-run-times">Save Running Times</button>
      </div>

      <!-- ── Default Schedule ─────────────────────────────── -->
      <div class="settings-section">
        <div class="settings-group-label">Default Weekly Schedule</div>
        ${[0,1,2,3,4,5,6].map(dow => `
          <div class="settings-row">
            <span class="settings-row-label" style="min-width:72px">${DAYS_LONG[dow]}</span>
            <select class="settings-select sched-select" data-dow="${dow}">
              ${Object.keys(WORKOUT_TYPES).map(k => `
                <option value="${k}"${customSch[dow] === k ? ' selected' : ''}>${WORKOUT_TYPES[k].name}</option>`
              ).join('')}
            </select>
          </div>`).join('')}
        <div class="settings-row mt-8" style="gap:8px;flex-wrap:wrap;">
          <button class="btn btn-secondary btn-sm" data-action="save-schedule">Save Schedule</button>
          <button class="btn btn-secondary btn-sm" data-action="reset-schedule">Reset to Default</button>
        </div>
        <p class="text-xs text-muted mt-8" style="padding:0 4px;line-height:1.5;">
          Applies to future dates. Individual days can still be moved or swapped from the Schedule tab.
        </p>
      </div>

      <!-- ── Exercise Substitutions ───────────────────────── -->
      <div class="settings-section">
        <div class="settings-group-label">Exercise Substitutions</div>
        <p class="text-xs text-muted" style="padding:0 4px 10px;line-height:1.5;">
          Pick alternatives for any lift. Progression is tracked separately per exercise.
        </p>
        ${['push','pull','legs'].map(wktKey => `
          <div class="sub-wkt-label">${WORKOUT_TYPES[wktKey].name}</div>
          ${(PROGRAM[wktKey] || []).map(ex => `
            <div class="settings-row">
              <span class="settings-row-label sub-ex-name">${ex.name}</span>
              ${exSubSelect(ex.name)}
            </div>`).join('')}`).join('')}
        <button class="btn btn-secondary btn-sm mt-12" data-action="save-ex-subs">Save Substitutions</button>
      </div>

      <!-- ── Run Workout Alternatives ─────────────────────── -->
      <div class="settings-section">
        <div class="settings-group-label">Run Workout Alternatives</div>
        <p class="text-xs text-muted" style="padding:0 4px 10px;line-height:1.5;">
          Set alternatives when you can't run outside. Shown as a note in the run log.
        </p>
        ${runSubSelect('intervals', 'Speed / Intervals')}
        ${runSubSelect('tempo',     'Tempo Run')}
        ${runSubSelect('easy',      'Easy Run')}
        ${runSubSelect('trial',     'Time Trial')}
        <button class="btn btn-secondary btn-sm mt-8" data-action="save-run-subs">Save Run Alternatives</button>
      </div>

      <!-- ── Data ─────────────────────────────────────────── -->
      <div class="settings-section">
        <div class="settings-group-label">Data</div>
        <div class="settings-row">
          <span class="settings-row-label">Workouts Logged</span>
          <span class="settings-row-value">${Store.getTotalCompleted()}</span>
        </div>
        <div class="settings-row">
          <span class="settings-row-label">App Version</span>
          <span class="settings-row-value">Phase 14.0</span>
        </div>
        <div class="settings-data-btns">
          <button class="btn btn-secondary btn-sm" data-action="export-data">Export JSON</button>
          <label class="btn btn-secondary btn-sm settings-import-label" for="import-file-input">
            Import JSON
          </label>
          <input type="file" id="import-file-input" accept=".json,application/json"
                 class="visually-hidden">
        </div>
        <p class="text-xs text-muted mt-8" style="padding:0 4px;line-height:1.5;">
          Export saves all workout logs, settings, and check-ins. Photos (stored in IndexedDB) are not included.
        </p>
        ${importFeedback}
        <div class="mt-12">${resetHtml}</div>
      </div>

    </div>
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
  clearDurationTimer();
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
  // Nav tabs use data-view, not data-action — must be checked before the action guard below
  const navBtn = e.target.closest('.nav-btn');
  if (navBtn) { navigate(navBtn.dataset.view); return; }

  const el = e.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;

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

    case 'do-undo': {
      const ds = el.dataset.date;
      undoDay(ds);
      hideModal();
      refresh();
      break;
    }

    case 'close-modal': {
      hideModal();
      break;
    }

    // ── Bodyweight / home mode toggle ──────────────────────

    case 'set-bw-mode': {
      const ds  = el.dataset.date;
      const bw  = el.dataset.bw === '1';
      Store.setBodyweightDay(ds, bw);
      Store.clearActiveWkt();
      renderToday();
      break;
    }

    // ── Schedule navigation ────────────────────────────────

    case 'sched-nav': {
      state.schedWeekOff += parseInt(el.dataset.delta, 10);
      renderSchedule();
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
      if (isDone) {
        if (navigator.vibrate) navigator.vibrate(40);
        startRestTimer(rest);
      } else {
        clearRestTimer();
      }
      saveActiveWkt(state.loggerDs);
      break;
    }

    case 'adj-weight': {
      const exIdx  = parseInt(el.dataset.ex,  10);
      const setIdx = parseInt(el.dataset.set, 10);
      const delta  = parseFloat(el.dataset.delta);
      const input  = $id(`w-${exIdx}-${setIdx}`);
      if (!input) break;
      const cur    = parseFloat(input.value) || parseFloat(input.placeholder) || 0;
      const next   = Math.max(0, cur + delta);
      input.value  = Number.isInteger(next) ? String(next) : next.toFixed(1);
      syncPlateHint(exIdx, setIdx);
      saveActiveWkt(state.loggerDs);
      break;
    }

    case 'plate-add': {
      const exIdx  = parseInt(el.dataset.ex,  10);
      const setIdx = parseInt(el.dataset.set, 10);
      const plate  = parseFloat(el.dataset.plate);
      const wEl    = $id(`w-${exIdx}-${setIdx}`);
      if (!wEl) break;
      const unit   = Store.getUnit();
      const bar    = BAR_WEIGHT[unit] || 45;
      const cur    = Math.max(bar, parseFloat(wEl.value) || bar);
      const next   = cur + plate * 2;
      wEl.value    = Number.isInteger(next) ? String(next) : parseFloat(next.toFixed(4)).toString();
      syncPlatePicker(exIdx, setIdx);
      saveActiveWkt(state.loggerDs);
      break;
    }

    case 'plate-sub': {
      const exIdx  = parseInt(el.dataset.ex,  10);
      const setIdx = parseInt(el.dataset.set, 10);
      const plate  = parseFloat(el.dataset.plate);
      const wEl    = $id(`w-${exIdx}-${setIdx}`);
      if (!wEl) break;
      const unit   = Store.getUnit();
      const bar    = BAR_WEIGHT[unit] || 45;
      const cur    = Math.max(bar, parseFloat(wEl.value) || bar);
      const next   = Math.max(bar, cur - plate * 2);
      wEl.value    = Number.isInteger(next) ? String(next) : parseFloat(next.toFixed(4)).toString();
      syncPlatePicker(exIdx, setIdx);
      saveActiveWkt(state.loggerDs);
      break;
    }

    case 'adj-reps': {
      const exIdx  = parseInt(el.dataset.ex,  10);
      const setIdx = parseInt(el.dataset.set, 10);
      const delta  = parseInt(el.dataset.delta, 10);
      const input  = $id(`r-${exIdx}-${setIdx}`);
      if (!input) break;
      const cur   = parseInt(input.value) || parseInt(input.placeholder) || 0;
      input.value = Math.max(0, cur + delta);
      saveActiveWkt(state.loggerDs);
      break;
    }

    case 'repeat-weight': {
      const exIdx  = parseInt(el.dataset.ex, 10);
      const weight = el.dataset.weight;
      const sets   = parseInt(el.dataset.sets, 10) || 0;
      for (let j = 0; j < sets; j++) {
        const input = $id(`w-${exIdx}-${j}`);
        if (input) input.value = weight;
        syncPlateHint(exIdx, j);
        syncPlatePicker(exIdx, j);
      }
      saveActiveWkt(state.loggerDs);
      break;
    }

    case 'fill-last': {
      const exIdx   = parseInt(el.dataset.ex, 10);
      const weights = el.dataset.weights.split(',');
      const reps    = el.dataset.reps.split(',');
      weights.forEach((w, j) => {
        const wEl = $id(`w-${exIdx}-${j}`);
        const rEl = $id(`r-${exIdx}-${j}`);
        if (wEl && w) wEl.value = w;
        if (rEl && reps[j]) rEl.value = reps[j];
        syncPlateHint(exIdx, j);
        syncPlatePicker(exIdx, j);
      });
      saveActiveWkt(state.loggerDs);
      break;
    }

    case 'fill-set-last': {
      const exIdx = parseInt(el.dataset.ex, 10);
      const setIdx = parseInt(el.dataset.set, 10);
      const w = el.dataset.weight;
      const r = el.dataset.reps;
      const wEl = $id(`w-${exIdx}-${setIdx}`);
      const rEl = $id(`r-${exIdx}-${setIdx}`);
      if (wEl && w) wEl.value = w;
      if (rEl && r) rEl.value = r;
      syncPlateHint(exIdx, setIdx);
      syncPlatePicker(exIdx, setIdx);
      saveActiveWkt(state.loggerDs);
      break;
    }

    case 'start-fresh': {
      Store.clearActiveWkt();
      const ds  = el.dataset.date;
      const wkt = Store.getWorkoutInfo(ds);
      renderStrengthLogger(ds, wkt);
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

    case 'save-profile': {
      const n = $id('s-name')?.value.trim() || '';
      if (n) Store.setName(n);
      renderSettings();
      break;
    }

    case 'set-goal': {
      Store.setGoal(el.dataset.goal);
      renderSettings();
      break;
    }

    case 'save-rest-times': {
      const compound  = parseInt($id('s-rest-compound')?.value,  10) || 180;
      const accessory = parseInt($id('s-rest-accessory')?.value, 10) || 90;
      Store.setRestTimes({ compound, accessory });
      renderSettings();
      break;
    }

    case 'update-run-times': {
      const cur  = document.getElementById('settings-run-current')?.value.trim() || '';
      const goal = document.getElementById('settings-run-goal')?.value.trim()    || '';
      if (cur)  Store.setRunCurrent(cur);
      if (goal) Store.setRunGoal(goal);
      renderSettings();
      break;
    }

    case 'save-schedule': {
      const custom = {};
      document.querySelectorAll('.sched-select').forEach(sel => {
        custom[parseInt(sel.dataset.dow, 10)] = sel.value;
      });
      Store.setCustomSchedule(custom);
      renderSettings();
      break;
    }

    case 'reset-schedule': {
      localStorage.removeItem(Store.KEYS.ASSIGNMENTS);
      Store.resetCustomSchedule();
      renderSettings();
      break;
    }

    case 'save-ex-subs': {
      const subs = {};
      document.querySelectorAll('.ex-sub-select').forEach(sel => {
        const orig = sel.dataset.orig;
        if (sel.value && sel.value !== orig) subs[orig] = sel.value;
      });
      Store.setExerciseSubs(subs);
      renderSettings();
      break;
    }

    case 'save-run-subs': {
      const rsubs = {};
      document.querySelectorAll('.run-sub-select').forEach(sel => {
        if (sel.value) rsubs[sel.dataset.runType] = sel.value;
      });
      Store.setRunSubs(rsubs);
      renderSettings();
      break;
    }

    case 'export-data': {
      exportData();
      break;
    }

    case 'save-checkin': {
      const weight = $id('ci-weight')?.value.trim() || '';
      const waist  = $id('ci-waist')?.value.trim()  || '';
      const notes  = $id('ci-notes')?.value.trim()  || '';
      if (!weight && !waist && !notes) break;
      Store.saveBodyCheckIn(toDateStr(today()), { weight, waist, notes });
      renderProgress();
      break;
    }

    case 'delete-photo': {
      const { angle, ds } = el.dataset;
      if (!angle || !ds) break;
      PhotoDB.remove(ds, angle).then(() => renderProgress()).catch(() => {});
      break;
    }

    case 'reset-data':    { state.resetConfirm = true;  renderSettings(); break; }
    case 'cancel-reset':  { state.resetConfirm = false; renderSettings(); break; }
    case 'confirm-reset': {
      Store.clearAll();
      clearDurationTimer();
      PhotoDB.clearAll().catch(() => {});
      state.resetConfirm = false;
      navigate('today');
      break;
    }
  }
});

// Close modal on overlay tap
$id('overlay').addEventListener('click', () => { if (state.modalPage) hideModal(); });

// ---- Photo file-input change handler ----
document.addEventListener('change', e => {
  const input = e.target;
  if (!input.matches('.photo-file-input')) return;
  const file  = input.files?.[0];
  const angle = input.dataset.photoAngle;
  const ds    = input.dataset.photoDs;
  if (!file || !angle || !ds) return;

  const reader = new FileReader();
  reader.onload = async ev => {
    try {
      const resized = await resizeImage(ev.target.result);
      await PhotoDB.save(ds, angle, resized);
      setPhotoPreview(angle, resized, ds);
    } catch {
      alert('Could not save photo — storage may be full.');
    }
  };
  reader.readAsDataURL(file);
});

// ---- Auto-save active workout on every weight/reps change ----
document.addEventListener('input', e => {
  if (state.view !== 'strength-logger' || !state.loggerDs) return;
  if (!e.target.matches('.set-weight, .set-reps')) return;
  if (e.target.matches('.set-weight')) {
    const id    = e.target.id; // w-{ex}-{set}
    const parts = id.split('-');
    if (parts.length === 3) syncPlateHint(parseInt(parts[1], 10), parseInt(parts[2], 10));
  }
  saveActiveWkt(state.loggerDs);
});

// ---- JSON import file handler ----
document.addEventListener('change', e => {
  const input = e.target;
  if (input.id !== 'import-file-input') return;
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const n = importData(ev.target.result);
    state.importResult = n;
    renderSettings();
    if (n >= 0) setTimeout(() => { state.importResult = null; }, 5000);
  };
  reader.readAsText(file);
});

// ============================================================
//  DRAG-TO-REORDER (Schedule view)
// ============================================================

// ── shared begin/update/end logic ─────────────────────────────

function _dragBegin(row, clientX, clientY) {
  const rect  = row.getBoundingClientRect();
  const ghost = row.cloneNode(true);
  Object.assign(ghost.style, {
    position:      'fixed',
    left:          rect.left + 'px',
    top:           rect.top  + 'px',
    width:         rect.width + 'px',
    margin:        '0',
    opacity:       '0.9',
    pointerEvents: 'none',
    zIndex:        '9999',
    transform:     'scale(1.03)',
    boxShadow:     '0 10px 40px rgba(0,0,0,0.55)',
    transition:    'none',
  });
  document.body.appendChild(ghost);
  row.classList.add('drag-source');

  _drag = {
    fromDs:  row.dataset.date,
    fromRow: row,
    ghost,
    offX:    clientX - rect.left,
    offY:    clientY - rect.top,
    overRow: null,
  };
}

function _dragUpdate(clientX, clientY) {
  if (!_drag) return;
  const { ghost, offX, offY } = _drag;

  ghost.style.left = (clientX - offX) + 'px';
  ghost.style.top  = (clientY - offY) + 'px';

  // Find the row under the pointer (hide ghost so it doesn't intercept)
  ghost.style.visibility = 'hidden';
  const el = document.elementFromPoint(clientX, clientY);
  ghost.style.visibility = '';

  const targetRow = el?.closest('.sched-row');

  if (_drag.overRow && _drag.overRow !== targetRow) {
    _drag.overRow.classList.remove('drag-over');
    _drag.overRow = null;
  }

  if (
    targetRow &&
    targetRow !== _drag.fromRow &&
    !targetRow.classList.contains('is-done') &&
    !targetRow.classList.contains('is-skipped')
  ) {
    targetRow.classList.add('drag-over');
    _drag.overRow = targetRow;
  }
}

function _dragCommit() {
  if (!_drag) return;
  const { fromDs, overRow } = _drag;
  if (overRow) {
    const toDs  = overRow.dataset.date;
    const toWkt = Store.getWorkoutInfo(toDs);
    if (toWkt.key === 'rest') {
      moveWorkout(fromDs, toDs);
    } else {
      swapWorkouts(fromDs, toDs);
    }
    renderSchedule();
  }
}

function _dragCleanup() {
  if (!_drag) return;
  _drag.ghost?.remove();
  _drag.fromRow?.classList.remove('drag-source');
  _drag.overRow?.classList.remove('drag-over');
  _drag = null;

  document.removeEventListener('touchmove',   _dragTouchMove);
  document.removeEventListener('touchend',    _dragTouchEnd);
  document.removeEventListener('touchcancel', _dragCleanup);
  document.removeEventListener('mousemove',   _dragMouseMove);
  document.removeEventListener('mouseup',     _dragMouseUp);
  document.body.style.userSelect = '';
}

// ── Touch ──────────────────────────────────────────────────────

document.addEventListener('touchstart', e => {
  const handle = e.target.closest('.sched-drag-handle');
  if (!handle) return;
  const row = handle.closest('[data-draggable]');
  if (!row) return;
  const t = e.touches[0];
  _dragBegin(row, t.clientX, t.clientY);
  document.addEventListener('touchmove',   _dragTouchMove,  { passive: false });
  document.addEventListener('touchend',    _dragTouchEnd,   { passive: true  });
  document.addEventListener('touchcancel', _dragCleanup,    { passive: true  });
}, { passive: true });

function _dragTouchMove(e) {
  e.preventDefault();
  const t = e.touches[0];
  _dragUpdate(t.clientX, t.clientY);
}

function _dragTouchEnd() {
  _dragCommit();
  _dragCleanup();
}

// ── Mouse ──────────────────────────────────────────────────────

document.addEventListener('mousedown', e => {
  const handle = e.target.closest('.sched-drag-handle');
  if (!handle) return;
  const row = handle.closest('[data-draggable]');
  if (!row) return;
  e.preventDefault();
  _dragBegin(row, e.clientX, e.clientY);
  document.body.style.userSelect = 'none';
  document.addEventListener('mousemove', _dragMouseMove);
  document.addEventListener('mouseup',   _dragMouseUp);
});

function _dragMouseMove(e) { _dragUpdate(e.clientX, e.clientY); }

function _dragMouseUp() {
  _dragCommit();
  _dragCleanup();
}

// ============================================================
//  OFFLINE INDICATOR
// ============================================================

function updateOfflineBar() {
  const bar = $id('offline-bar');
  if (!bar) return;
  bar.classList.toggle('hidden', navigator.onLine);
}

window.addEventListener('online',  updateOfflineBar);
window.addEventListener('offline', updateOfflineBar);

// ============================================================
//  SERVICE WORKER REGISTRATION
// ============================================================

// PWA features require a real origin — skip silently when opened as file://
if (location.protocol !== 'file:') {
  // iOS/PWA meta tags + icons + manifest (injected here to avoid CORS errors on file:// opens)
  [
    ['apple-mobile-web-app-capable',     '',                     'yes'],
    ['apple-mobile-web-app-status-bar-style', '',               'black-translucent'],
    ['apple-mobile-web-app-title',        '',                    'MOAB Training'],
  ].forEach(([name, , content]) => {
    const m = document.createElement('meta');
    m.name    = name;
    m.content = content;
    document.head.appendChild(m);
  });

  const touchIcon = document.createElement('link');
  touchIcon.rel   = 'apple-touch-icon';
  touchIcon.href  = './icons/icon-180.png';
  document.head.appendChild(touchIcon);

  const manifestLink = document.createElement('link');
  manifestLink.rel  = 'manifest';
  manifestLink.href = './manifest.json';
  document.head.appendChild(manifestLink);

  // Service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }
}

// ============================================================
//  INIT
// ============================================================

function init() {
  if (!Store.getProgramStart()) {
    Store.setProgramStart(getMondayOf(today()));
  }
  updateOfflineBar();
  navigate('today');
}

init();
