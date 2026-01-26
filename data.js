/**
 * XPGains Data Model
 * Contains all static data and XP calculation helpers
 *
 * XP CALIBRATION: Level 99 achievable in 6-8 years at baseline volume
 * - 3-4 sets/week per muscle
 * - ~1,200-1,600 quality sets to max a skill
 */

// ============================================
// SKILLS (14 muscle skills)
// ============================================
const SKILLS = [
  { id: 'chest', name: 'Chest', icon: 'chest', bodyRegion: 'upper' },
  { id: 'back_lats', name: 'Back – Lats', icon: 'back_lats', bodyRegion: 'upper' },
  { id: 'back_erector', name: 'Back – Lower', icon: 'back_erector', bodyRegion: 'upper' },
  { id: 'traps', name: 'Traps', icon: 'traps', bodyRegion: 'upper' },
  { id: 'neck', name: 'Neck', icon: 'neck', bodyRegion: 'upper' },
  { id: 'delts', name: 'Delts', icon: 'delts', bodyRegion: 'upper' },
  { id: 'biceps', name: 'Biceps', icon: 'biceps', bodyRegion: 'upper' },
  { id: 'triceps', name: 'Triceps', icon: 'triceps', bodyRegion: 'upper' },
  { id: 'forearms', name: 'Forearms', icon: 'forearms', bodyRegion: 'upper' },
  { id: 'core', name: 'Core', icon: 'core', bodyRegion: 'lower' },
  { id: 'glutes', name: 'Glutes', icon: 'glutes', bodyRegion: 'lower' },
  { id: 'quads', name: 'Quads', icon: 'quads', bodyRegion: 'lower' },
  { id: 'hamstrings', name: 'Hamstrings', icon: 'hamstrings', bodyRegion: 'lower' },
  { id: 'calves', name: 'Calves', icon: 'calves', bodyRegion: 'lower' }
];

// ============================================
// SUBCATEGORIES (for exercise grouping/filtering)
// ============================================
const SUBCATEGORIES = [
  // Chest
  { id: 'chest_upper', skillId: 'chest', name: 'Upper Chest' },
  { id: 'chest_mid', skillId: 'chest', name: 'Mid Chest' },
  { id: 'chest_lower', skillId: 'chest', name: 'Lower Chest' },

  // Back - Lats
  { id: 'lats_width', skillId: 'back_lats', name: 'Lat Width' },
  { id: 'lats_thickness', skillId: 'back_lats', name: 'Lat Thickness' },

  // Back - Erector
  { id: 'erector_lower', skillId: 'back_erector', name: 'Lower Back' },

  // Traps
  { id: 'traps_upper', skillId: 'traps', name: 'Upper Traps' },
  { id: 'traps_mid', skillId: 'traps', name: 'Mid Traps' },

  // Neck
  { id: 'neck_front', skillId: 'neck', name: 'Neck Flexion' },
  { id: 'neck_back', skillId: 'neck', name: 'Neck Extension' },

  // Delts
  { id: 'delts_front', skillId: 'delts', name: 'Front Delts' },
  { id: 'delts_side', skillId: 'delts', name: 'Side Delts' },
  { id: 'delts_rear', skillId: 'delts', name: 'Rear Delts' },

  // Biceps
  { id: 'biceps_long', skillId: 'biceps', name: 'Long Head' },
  { id: 'biceps_short', skillId: 'biceps', name: 'Short Head' },

  // Triceps
  { id: 'triceps_long', skillId: 'triceps', name: 'Long Head' },
  { id: 'triceps_lateral', skillId: 'triceps', name: 'Lateral Head' },
  { id: 'triceps_medial', skillId: 'triceps', name: 'Medial Head' },

  // Forearms
  { id: 'forearms_flexors', skillId: 'forearms', name: 'Wrist Flexors' },
  { id: 'forearms_extensors', skillId: 'forearms', name: 'Wrist Extensors' },

  // Core
  { id: 'core_abs', skillId: 'core', name: 'Abs' },
  { id: 'core_obliques', skillId: 'core', name: 'Obliques' },

  // Glutes
  { id: 'glutes_max', skillId: 'glutes', name: 'Glute Max' },
  { id: 'glutes_med', skillId: 'glutes', name: 'Glute Med' },

  // Quads
  { id: 'quads_vastus', skillId: 'quads', name: 'Vastus' },
  { id: 'quads_rectus', skillId: 'quads', name: 'Rectus Femoris' },

  // Hamstrings
  { id: 'hams_bicep', skillId: 'hamstrings', name: 'Bicep Femoris' },
  { id: 'hams_semi', skillId: 'hamstrings', name: 'Semis' },

  // Calves
  { id: 'calves_gastro', skillId: 'calves', name: 'Gastrocnemius' },
  { id: 'calves_soleus', skillId: 'calves', name: 'Soleus' }
];

// ============================================
// EXERCISES with per-exercise weight configs
// Weight configs: { min, max, step, default } in KG
// type: 'compound' or 'isolation' (affects base XP)
// ============================================
const EXERCISES = [
  // Chest exercises
  {
    id: 'bench_press', skillId: 'chest', subcategoryIds: ['chest_mid'], name: 'Bench Press',
    type: 'compound', weight: { min: 20, max: 220, step: 2.5, default: 60 }, referenceWeight: 80
  },
  {
    id: 'incline_bench', skillId: 'chest', subcategoryIds: ['chest_upper'], name: 'Incline Bench Press',
    type: 'compound', weight: { min: 20, max: 180, step: 2.5, default: 50 }, referenceWeight: 70
  },
  {
    id: 'decline_bench', skillId: 'chest', subcategoryIds: ['chest_lower'], name: 'Decline Bench Press',
    type: 'compound', weight: { min: 20, max: 200, step: 2.5, default: 55 }, referenceWeight: 75
  },
  {
    id: 'dumbbell_fly', skillId: 'chest', subcategoryIds: ['chest_mid'], name: 'Dumbbell Fly',
    type: 'isolation', weight: { min: 4, max: 40, step: 2, default: 14 }, referenceWeight: 18
  },
  {
    id: 'cable_crossover', skillId: 'chest', subcategoryIds: ['chest_mid', 'chest_lower'], name: 'Cable Crossover',
    type: 'isolation', weight: { min: 5, max: 50, step: 2.5, default: 15 }, referenceWeight: 20
  },
  {
    id: 'push_ups', skillId: 'chest', subcategoryIds: ['chest_mid'], name: 'Push Ups',
    type: 'compound', weight: { min: 0, max: 50, step: 2.5, default: 0 }, referenceWeight: 0
  },

  // Back - Lats
  {
    id: 'pull_ups', skillId: 'back_lats', subcategoryIds: ['lats_width'], name: 'Pull Ups',
    type: 'compound', weight: { min: 0, max: 60, step: 2.5, default: 0 }, referenceWeight: 0
  },
  {
    id: 'lat_pulldown', skillId: 'back_lats', subcategoryIds: ['lats_width'], name: 'Lat Pulldown',
    type: 'compound', weight: { min: 15, max: 150, step: 2.5, default: 55 }, referenceWeight: 70
  },
  {
    id: 'barbell_row', skillId: 'back_lats', subcategoryIds: ['lats_thickness'], name: 'Barbell Row',
    type: 'compound', weight: { min: 20, max: 180, step: 2.5, default: 60 }, referenceWeight: 80
  },
  {
    id: 'cable_row', skillId: 'back_lats', subcategoryIds: ['lats_thickness'], name: 'Cable Row',
    type: 'compound', weight: { min: 15, max: 150, step: 2.5, default: 50 }, referenceWeight: 65
  },
  {
    id: 'dumbbell_row', skillId: 'back_lats', subcategoryIds: ['lats_thickness'], name: 'Dumbbell Row',
    type: 'compound', weight: { min: 8, max: 70, step: 2, default: 25 }, referenceWeight: 35
  },

  // Back - Erector
  {
    id: 'deadlift', skillId: 'back_erector', subcategoryIds: ['erector_lower'], name: 'Deadlift',
    type: 'compound', weight: { min: 40, max: 300, step: 5, default: 100 }, referenceWeight: 140
  },
  {
    id: 'back_extension', skillId: 'back_erector', subcategoryIds: ['erector_lower'], name: 'Back Extension',
    type: 'isolation', weight: { min: 0, max: 40, step: 2.5, default: 10 }, referenceWeight: 15
  },
  {
    id: 'good_morning', skillId: 'back_erector', subcategoryIds: ['erector_lower'], name: 'Good Morning',
    type: 'compound', weight: { min: 20, max: 120, step: 2.5, default: 40 }, referenceWeight: 60
  },

  // Traps
  {
    id: 'barbell_shrug', skillId: 'traps', subcategoryIds: ['traps_upper'], name: 'Barbell Shrug',
    type: 'isolation', weight: { min: 20, max: 180, step: 5, default: 60 }, referenceWeight: 80
  },
  {
    id: 'dumbbell_shrug', skillId: 'traps', subcategoryIds: ['traps_upper'], name: 'Dumbbell Shrug',
    type: 'isolation', weight: { min: 8, max: 60, step: 2, default: 25 }, referenceWeight: 35
  },
  {
    id: 'face_pull', skillId: 'traps', subcategoryIds: ['traps_mid'], name: 'Face Pull',
    type: 'isolation', weight: { min: 5, max: 50, step: 2.5, default: 20 }, referenceWeight: 25
  },

  // Neck
  {
    id: 'neck_curl', skillId: 'neck', subcategoryIds: ['neck_front'], name: 'Neck Curl',
    type: 'isolation', weight: { min: 2, max: 25, step: 1, default: 8 }, referenceWeight: 10
  },
  {
    id: 'neck_extension', skillId: 'neck', subcategoryIds: ['neck_back'], name: 'Neck Extension',
    type: 'isolation', weight: { min: 2, max: 30, step: 1, default: 10 }, referenceWeight: 12
  },

  // Delts
  {
    id: 'overhead_press', skillId: 'delts', subcategoryIds: ['delts_front'], name: 'Overhead Press',
    type: 'compound', weight: { min: 20, max: 120, step: 2.5, default: 40 }, referenceWeight: 55
  },
  {
    id: 'lateral_raise', skillId: 'delts', subcategoryIds: ['delts_side'], name: 'Lateral Raise',
    type: 'isolation', weight: { min: 2, max: 25, step: 1, default: 8 }, referenceWeight: 12
  },
  {
    id: 'front_raise', skillId: 'delts', subcategoryIds: ['delts_front'], name: 'Front Raise',
    type: 'isolation', weight: { min: 2, max: 25, step: 1, default: 8 }, referenceWeight: 12
  },
  {
    id: 'reverse_fly', skillId: 'delts', subcategoryIds: ['delts_rear'], name: 'Reverse Fly',
    type: 'isolation', weight: { min: 2, max: 25, step: 1, default: 8 }, referenceWeight: 12
  },

  // Biceps
  {
    id: 'barbell_curl', skillId: 'biceps', subcategoryIds: ['biceps_long', 'biceps_short'], name: 'Barbell Curl',
    type: 'isolation', weight: { min: 10, max: 80, step: 2.5, default: 30 }, referenceWeight: 40
  },
  {
    id: 'dumbbell_curl', skillId: 'biceps', subcategoryIds: ['biceps_long', 'biceps_short'], name: 'Dumbbell Curl',
    type: 'isolation', weight: { min: 4, max: 35, step: 1, default: 12 }, referenceWeight: 16
  },
  {
    id: 'hammer_curl', skillId: 'biceps', subcategoryIds: ['biceps_long'], name: 'Hammer Curl',
    type: 'isolation', weight: { min: 4, max: 40, step: 1, default: 14 }, referenceWeight: 18
  },
  {
    id: 'preacher_curl', skillId: 'biceps', subcategoryIds: ['biceps_short'], name: 'Preacher Curl',
    type: 'isolation', weight: { min: 5, max: 50, step: 2.5, default: 20 }, referenceWeight: 28
  },

  // Triceps
  {
    id: 'tricep_pushdown', skillId: 'triceps', subcategoryIds: ['triceps_lateral'], name: 'Tricep Pushdown',
    type: 'isolation', weight: { min: 10, max: 80, step: 2.5, default: 30 }, referenceWeight: 40
  },
  {
    id: 'skull_crusher', skillId: 'triceps', subcategoryIds: ['triceps_long'], name: 'Skull Crusher',
    type: 'isolation', weight: { min: 10, max: 60, step: 2.5, default: 25 }, referenceWeight: 35
  },
  {
    id: 'overhead_extension', skillId: 'triceps', subcategoryIds: ['triceps_long'], name: 'Overhead Extension',
    type: 'isolation', weight: { min: 8, max: 50, step: 2, default: 20 }, referenceWeight: 28
  },
  {
    id: 'dips', skillId: 'triceps', subcategoryIds: ['triceps_lateral', 'triceps_medial'], name: 'Dips',
    type: 'compound', weight: { min: 0, max: 60, step: 2.5, default: 0 }, referenceWeight: 0
  },

  // Forearms
  {
    id: 'wrist_curl', skillId: 'forearms', subcategoryIds: ['forearms_flexors'], name: 'Wrist Curl',
    type: 'isolation', weight: { min: 5, max: 40, step: 1, default: 15 }, referenceWeight: 20
  },
  {
    id: 'reverse_wrist_curl', skillId: 'forearms', subcategoryIds: ['forearms_extensors'], name: 'Reverse Wrist Curl',
    type: 'isolation', weight: { min: 2, max: 25, step: 1, default: 10 }, referenceWeight: 12
  },
  {
    id: 'farmers_walk', skillId: 'forearms', subcategoryIds: ['forearms_flexors'], name: 'Farmers Walk',
    type: 'compound', weight: { min: 10, max: 80, step: 2, default: 30 }, referenceWeight: 40
  },

  // Core
  {
    id: 'crunch', skillId: 'core', subcategoryIds: ['core_abs'], name: 'Crunch',
    type: 'isolation', weight: { min: 0, max: 30, step: 2.5, default: 0 }, referenceWeight: 0
  },
  {
    id: 'leg_raise', skillId: 'core', subcategoryIds: ['core_abs'], name: 'Leg Raise',
    type: 'isolation', weight: { min: 0, max: 20, step: 1, default: 0 }, referenceWeight: 0
  },
  {
    id: 'plank', skillId: 'core', subcategoryIds: ['core_abs'], name: 'Plank',
    type: 'isolation', weight: { min: 0, max: 30, step: 2.5, default: 0 }, referenceWeight: 0
  },
  {
    id: 'russian_twist', skillId: 'core', subcategoryIds: ['core_obliques'], name: 'Russian Twist',
    type: 'isolation', weight: { min: 0, max: 25, step: 1, default: 8 }, referenceWeight: 10
  },
  {
    id: 'side_plank', skillId: 'core', subcategoryIds: ['core_obliques'], name: 'Side Plank',
    type: 'isolation', weight: { min: 0, max: 20, step: 2.5, default: 0 }, referenceWeight: 0
  },
  {
    id: 'cable_crunch', skillId: 'core', subcategoryIds: ['core_abs'], name: 'Cable Crunch',
    type: 'isolation', weight: { min: 10, max: 80, step: 2.5, default: 30 }, referenceWeight: 40
  },

  // Glutes
  {
    id: 'hip_thrust', skillId: 'glutes', subcategoryIds: ['glutes_max'], name: 'Hip Thrust',
    type: 'compound', weight: { min: 20, max: 250, step: 5, default: 80 }, referenceWeight: 120
  },
  {
    id: 'glute_bridge', skillId: 'glutes', subcategoryIds: ['glutes_max'], name: 'Glute Bridge',
    type: 'isolation', weight: { min: 0, max: 100, step: 5, default: 40 }, referenceWeight: 60
  },
  {
    id: 'cable_kickback', skillId: 'glutes', subcategoryIds: ['glutes_max'], name: 'Cable Kickback',
    type: 'isolation', weight: { min: 5, max: 40, step: 2.5, default: 15 }, referenceWeight: 20
  },
  {
    id: 'clamshell', skillId: 'glutes', subcategoryIds: ['glutes_med'], name: 'Clamshell',
    type: 'isolation', weight: { min: 0, max: 20, step: 1, default: 5 }, referenceWeight: 8
  },

  // Quads
  {
    id: 'squat', skillId: 'quads', subcategoryIds: ['quads_vastus', 'quads_rectus'], name: 'Squat',
    type: 'compound', weight: { min: 20, max: 280, step: 5, default: 80 }, referenceWeight: 120
  },
  {
    id: 'leg_press', skillId: 'quads', subcategoryIds: ['quads_vastus'], name: 'Leg Press',
    type: 'compound', weight: { min: 40, max: 500, step: 10, default: 160 }, referenceWeight: 220
  },
  {
    id: 'leg_extension', skillId: 'quads', subcategoryIds: ['quads_vastus', 'quads_rectus'], name: 'Leg Extension',
    type: 'isolation', weight: { min: 10, max: 120, step: 2.5, default: 40 }, referenceWeight: 55
  },
  {
    id: 'lunge', skillId: 'quads', subcategoryIds: ['quads_vastus'], name: 'Lunge',
    type: 'compound', weight: { min: 0, max: 80, step: 2, default: 20 }, referenceWeight: 30
  },

  // Hamstrings
  {
    id: 'romanian_deadlift', skillId: 'hamstrings', subcategoryIds: ['hams_bicep', 'hams_semi'], name: 'Romanian Deadlift',
    type: 'compound', weight: { min: 30, max: 200, step: 5, default: 70 }, referenceWeight: 100
  },
  {
    id: 'leg_curl', skillId: 'hamstrings', subcategoryIds: ['hams_bicep', 'hams_semi'], name: 'Leg Curl',
    type: 'isolation', weight: { min: 10, max: 100, step: 2.5, default: 35 }, referenceWeight: 50
  },
  {
    id: 'nordic_curl', skillId: 'hamstrings', subcategoryIds: ['hams_bicep'], name: 'Nordic Curl',
    type: 'isolation', weight: { min: 0, max: 30, step: 2.5, default: 0 }, referenceWeight: 0
  },

  // Calves
  {
    id: 'standing_calf_raise', skillId: 'calves', subcategoryIds: ['calves_gastro'], name: 'Standing Calf Raise',
    type: 'isolation', weight: { min: 20, max: 200, step: 5, default: 80 }, referenceWeight: 100
  },
  {
    id: 'seated_calf_raise', skillId: 'calves', subcategoryIds: ['calves_soleus'], name: 'Seated Calf Raise',
    type: 'isolation', weight: { min: 10, max: 120, step: 5, default: 40 }, referenceWeight: 60
  },
  {
    id: 'donkey_calf_raise', skillId: 'calves', subcategoryIds: ['calves_gastro'], name: 'Donkey Calf Raise',
    type: 'isolation', weight: { min: 20, max: 180, step: 5, default: 60 }, referenceWeight: 80
  }
];

// ============================================
// XP CALCULATION SYSTEM
// Geometric curve calibrated for 6-8 years to level 99
// ============================================

const XP_CONFIG = {
  maxLevel: 99,
  // Geometric curve: XP to next level = base * r^(level-1)
  base: 150,         // XP needed for level 1→2 (requires ~2-4 sets)
  growthRate: 1.03,  // 3% growth per level

  // XP per set calculation
  exerciseBaseXp: {
    compound: 50,    // 40-60 range, using 50
    isolation: 35    // 25-45 range, using 35
  },

  // Diminishing returns for repeated same-weight sets
  diminishingMultipliers: [1.0, 0.85, 0.7, 0.5, 0.3],

  // Neglected muscle bonus
  neglectedDays: 7,       // Days without training to be "neglected"
  neglectedBonus: 0.10    // 10% bonus XP
};

// Pre-calculate cumulative XP for each level (for faster lookups)
const XP_TABLE = [];
(function buildXpTable() {
  let cumulative = 0;
  XP_TABLE[1] = 0; // Level 1 starts at 0 XP
  for (let level = 2; level <= XP_CONFIG.maxLevel + 1; level++) {
    const xpForThisLevel = Math.round(XP_CONFIG.base * Math.pow(XP_CONFIG.growthRate, level - 2));
    cumulative += xpForThisLevel;
    XP_TABLE[level] = cumulative;
  }
})();

/**
 * Get XP required to reach a specific level
 * @param {number} level - Target level (1-99)
 * @returns {number} Total XP needed
 */
function xpForLevel(level) {
  if (level <= 1) return 0;
  if (level > XP_CONFIG.maxLevel) level = XP_CONFIG.maxLevel;
  return XP_TABLE[level] || 0;
}

/**
 * Get XP required for the next level from current level
 * @param {number} level - Current level
 * @returns {number} XP needed for next level
 */
function xpToNextLevel(level) {
  if (level >= XP_CONFIG.maxLevel) return 0;
  return Math.round(XP_CONFIG.base * Math.pow(XP_CONFIG.growthRate, level - 1));
}

/**
 * Calculate level from total XP
 * @param {number} xp - Current XP
 * @returns {number} Current level
 */
function levelFromXp(xp) {
  if (xp < 0) return 1;
  for (let level = 1; level <= XP_CONFIG.maxLevel; level++) {
    if (xp < XP_TABLE[level + 1]) {
      return level;
    }
  }
  return XP_CONFIG.maxLevel;
}

/**
 * Calculate progress to next level as percentage
 * @param {number} xp - Current XP
 * @returns {number} Progress percentage (0-100)
 */
function progressToNextLevel(xp) {
  const currentLevel = levelFromXp(xp);
  if (currentLevel >= XP_CONFIG.maxLevel) return 100;

  const currentLevelXp = xpForLevel(currentLevel);
  const nextLevelXp = xpForLevel(currentLevel + 1);
  const xpIntoLevel = xp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;

  return Math.min(100, Math.floor((xpIntoLevel / xpNeeded) * 100));
}

/**
 * Clamp a value between min and max
 */
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Calculate XP to award for a set
 * Formula: xp = exerciseBaseXP * repsFactor * intensityFactor
 *
 * @param {number} reps - Number of reps performed
 * @param {number} weight - Weight used (in KG)
 * @param {string} exerciseId - Exercise being performed
 * @param {number} skillLevel - Current level in the skill
 * @param {Array} recentSets - Recent sets for diminishing calculation
 * @param {boolean} isNeglected - Whether the muscle is neglected (for bonus)
 * @returns {number} XP to award
 */
function calculateXpGain(reps, weight, exerciseId, skillLevel, recentSets, isNeglected = false) {
  const exercise = getExerciseById(exerciseId);
  if (!exercise) return 0;

  // Base XP based on exercise type
  const baseXp = XP_CONFIG.exerciseBaseXp[exercise.type] || XP_CONFIG.exerciseBaseXp.isolation;

  // Reps factor: clamp(reps/10, 0.6, 2.0)
  const repsFactor = clamp(reps / 10, 0.6, 2.0);

  // Intensity factor: clamp(sqrt(weight/referenceWeight), 0.7, 1.6)
  // For bodyweight exercises (referenceWeight = 0), use factor of 1.0
  let intensityFactor = 1.0;
  if (exercise.referenceWeight > 0) {
    intensityFactor = clamp(Math.sqrt(weight / exercise.referenceWeight), 0.7, 1.6);
  }

  // Calculate base XP for this set
  let xp = Math.round(baseXp * repsFactor * intensityFactor);

  // Apply diminishing returns for repeated same-weight sets
  const graceSets = 1 + Math.floor(skillLevel / 15); // Grace period based on level
  let sameWeightCount = 0;
  let bestRepsAtWeight = 0;

  for (const set of recentSets) {
    if (set.exerciseId === exerciseId && set.weight === weight) {
      if (set.reps > bestRepsAtWeight) {
        bestRepsAtWeight = set.reps;
      }
      sameWeightCount++;
    }
  }

  // If not exceeding previous best reps at this weight, apply diminishing
  if (reps <= bestRepsAtWeight && sameWeightCount >= graceSets) {
    const diminishIndex = Math.min(
      sameWeightCount - graceSets,
      XP_CONFIG.diminishingMultipliers.length - 1
    );
    xp = Math.round(xp * XP_CONFIG.diminishingMultipliers[diminishIndex]);
  }

  // Apply neglected muscle bonus (+10%)
  if (isNeglected) {
    xp = Math.round(xp * (1 + XP_CONFIG.neglectedBonus));
  }

  return Math.max(1, xp); // Minimum 1 XP per set
}

/**
 * Check if a muscle skill is "neglected" (trained before but not in X days)
 * @param {string} skillId - The skill to check
 * @param {Array} logEntries - All log entries
 * @returns {boolean} True if neglected (trained before but not recently)
 */
function isSkillNeglected(skillId, logEntries) {
  const cutoffTime = Date.now() - (XP_CONFIG.neglectedDays * 24 * 60 * 60 * 1000);

  // First check if this skill has EVER been trained
  const hasEverTrained = logEntries.some(entry => entry.skillId === skillId);

  // If never trained before, not neglected (no bonus)
  if (!hasEverTrained) {
    return false;
  }

  // Check if trained recently (within neglectedDays)
  for (const entry of logEntries) {
    if (entry.skillId === skillId && entry.timestamp > cutoffTime) {
      return false;
    }
  }

  // Trained before but not recently = neglected
  return true;
}

/**
 * Get Total Level (sum of all 14 skill levels)
 * @param {Object} skillXp - Map of skillId to XP
 * @returns {number} Total level
 */
function getTotalLevel(skillXp) {
  return SKILLS.reduce((total, skill) => {
    return total + levelFromXp(skillXp[skill.id] || 0);
  }, 0);
}

// ============================================
// UNIT CONVERSION
// ============================================

/**
 * Convert KG to LBS
 */
function kgToLbs(kg) {
  return Math.round(kg * 2.20462 * 10) / 10;
}

/**
 * Convert LBS to KG
 */
function lbsToKg(lbs) {
  return Math.round(lbs / 2.20462 * 10) / 10;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getSkillById(id) {
  return SKILLS.find(s => s.id === id);
}

function getSubcategoriesBySkill(skillId) {
  return SUBCATEGORIES.filter(sc => sc.skillId === skillId);
}

function getExercisesBySkill(skillId) {
  return EXERCISES.filter(e => e.skillId === skillId);
}

function getExercisesBySubcategory(subcategoryId) {
  return EXERCISES.filter(e => e.subcategoryIds.includes(subcategoryId));
}

function getExerciseById(id) {
  return EXERCISES.find(e => e.id === id);
}

function getSubcategoryById(id) {
  return SUBCATEGORIES.find(sc => sc.id === id);
}

function getSkillsByRegion(region) {
  return SKILLS.filter(s => s.bodyRegion === region);
}

function getRandomSkills(count, region = null) {
  let pool = region ? getSkillsByRegion(region) : [...SKILLS];
  const result = [];
  while (result.length < count && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(index, 1)[0]);
  }
  return result;
}

function getRandomExercises(skillId, count) {
  const exercises = getExercisesBySkill(skillId);
  const result = [];
  const pool = [...exercises];
  while (result.length < count && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(index, 1)[0]);
  }
  return result;
}
