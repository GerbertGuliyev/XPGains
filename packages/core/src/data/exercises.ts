/**
 * XPGains Exercises Data
 * 48 standard exercises with weight configs and equipment requirements
 */

import type { Exercise, SkillId, EquipmentId } from '../types';

/**
 * All 48 standard exercises
 * Weight configs are in KG: { min, max, step, default }
 * referenceWeight is in KG (used for intensity factor calculation)
 */
export const EXERCISES: readonly Exercise[] = [
  // ============================================
  // CHEST EXERCISES (6)
  // ============================================
  {
    id: 'bench_press',
    skillId: 'chest',
    subcategoryIds: ['chest_mid'],
    name: 'Bench Press',
    type: 'compound',
    weight: { min: 20, max: 220, step: 2.5, default: 60 },
    referenceWeight: 80,
    requiredEquipment: ['bench', 'barbell'],
  },
  {
    id: 'incline_bench',
    skillId: 'chest',
    subcategoryIds: ['chest_upper'],
    name: 'Incline Bench Press',
    type: 'compound',
    weight: { min: 20, max: 180, step: 2.5, default: 50 },
    referenceWeight: 70,
    requiredEquipment: ['bench', 'barbell'],
  },
  {
    id: 'decline_bench',
    skillId: 'chest',
    subcategoryIds: ['chest_lower'],
    name: 'Decline Bench Press',
    type: 'compound',
    weight: { min: 20, max: 200, step: 2.5, default: 55 },
    referenceWeight: 75,
    requiredEquipment: ['bench', 'barbell'],
  },
  {
    id: 'dumbbell_fly',
    skillId: 'chest',
    subcategoryIds: ['chest_mid'],
    name: 'Dumbbell Fly',
    type: 'isolation',
    weight: { min: 4, max: 40, step: 2, default: 14 },
    referenceWeight: 18,
    requiredEquipment: ['bench', 'dumbbells'],
  },
  {
    id: 'cable_crossover',
    skillId: 'chest',
    subcategoryIds: ['chest_mid', 'chest_lower'],
    name: 'Cable Crossover',
    type: 'isolation',
    weight: { min: 5, max: 50, step: 2.5, default: 15 },
    referenceWeight: 20,
    requiredEquipment: ['cable'],
  },
  {
    id: 'push_ups',
    skillId: 'chest',
    subcategoryIds: ['chest_mid'],
    name: 'Push Ups',
    type: 'compound',
    weight: { min: 0, max: 50, step: 2.5, default: 0 },
    referenceWeight: 0,
    requiredEquipment: ['bodyweight'],
  },

  // ============================================
  // BACK - LATS EXERCISES (5)
  // ============================================
  {
    id: 'pull_ups',
    skillId: 'back_lats',
    subcategoryIds: ['lats_width'],
    name: 'Pull Ups',
    type: 'compound',
    weight: { min: 0, max: 60, step: 2.5, default: 0 },
    referenceWeight: 0,
    requiredEquipment: ['pullup_bar'],
  },
  {
    id: 'lat_pulldown',
    skillId: 'back_lats',
    subcategoryIds: ['lats_width'],
    name: 'Lat Pulldown',
    type: 'compound',
    weight: { min: 15, max: 150, step: 2.5, default: 55 },
    referenceWeight: 70,
    requiredEquipment: ['cable', 'machines'],
  },
  {
    id: 'barbell_row',
    skillId: 'back_lats',
    subcategoryIds: ['lats_thickness'],
    name: 'Barbell Row',
    type: 'compound',
    weight: { min: 20, max: 180, step: 2.5, default: 60 },
    referenceWeight: 80,
    requiredEquipment: ['barbell'],
  },
  {
    id: 'cable_row',
    skillId: 'back_lats',
    subcategoryIds: ['lats_thickness'],
    name: 'Cable Row',
    type: 'compound',
    weight: { min: 15, max: 150, step: 2.5, default: 50 },
    referenceWeight: 65,
    requiredEquipment: ['cable'],
  },
  {
    id: 'dumbbell_row',
    skillId: 'back_lats',
    subcategoryIds: ['lats_thickness'],
    name: 'Dumbbell Row',
    type: 'compound',
    weight: { min: 8, max: 70, step: 2, default: 25 },
    referenceWeight: 35,
    requiredEquipment: ['dumbbells', 'bench'],
  },

  // ============================================
  // BACK - ERECTOR EXERCISES (3)
  // ============================================
  {
    id: 'deadlift',
    skillId: 'back_erector',
    subcategoryIds: ['erector_lower'],
    name: 'Deadlift',
    type: 'compound',
    weight: { min: 40, max: 300, step: 5, default: 100 },
    referenceWeight: 140,
    requiredEquipment: ['barbell'],
  },
  {
    id: 'back_extension',
    skillId: 'back_erector',
    subcategoryIds: ['erector_lower'],
    name: 'Back Extension',
    type: 'isolation',
    weight: { min: 0, max: 40, step: 2.5, default: 10 },
    referenceWeight: 15,
    requiredEquipment: ['machines', 'bodyweight'],
  },
  {
    id: 'good_morning',
    skillId: 'back_erector',
    subcategoryIds: ['erector_lower'],
    name: 'Good Morning',
    type: 'compound',
    weight: { min: 20, max: 120, step: 2.5, default: 40 },
    referenceWeight: 60,
    requiredEquipment: ['barbell'],
  },

  // ============================================
  // TRAPS EXERCISES (3)
  // ============================================
  {
    id: 'barbell_shrug',
    skillId: 'traps',
    subcategoryIds: ['traps_upper'],
    name: 'Barbell Shrug',
    type: 'isolation',
    weight: { min: 20, max: 180, step: 5, default: 60 },
    referenceWeight: 80,
    requiredEquipment: ['barbell'],
  },
  {
    id: 'dumbbell_shrug',
    skillId: 'traps',
    subcategoryIds: ['traps_upper'],
    name: 'Dumbbell Shrug',
    type: 'isolation',
    weight: { min: 8, max: 60, step: 2, default: 25 },
    referenceWeight: 35,
    requiredEquipment: ['dumbbells'],
  },
  {
    id: 'face_pull',
    skillId: 'traps',
    subcategoryIds: ['traps_mid'],
    name: 'Face Pull',
    type: 'isolation',
    weight: { min: 5, max: 50, step: 2.5, default: 20 },
    referenceWeight: 25,
    requiredEquipment: ['cable'],
  },

  // ============================================
  // NECK EXERCISES (2)
  // ============================================
  {
    id: 'neck_curl',
    skillId: 'neck',
    subcategoryIds: ['neck_front'],
    name: 'Neck Curl',
    type: 'isolation',
    weight: { min: 2, max: 25, step: 1, default: 8 },
    referenceWeight: 10,
    requiredEquipment: ['bodyweight', 'bands'],
  },
  {
    id: 'neck_extension',
    skillId: 'neck',
    subcategoryIds: ['neck_back'],
    name: 'Neck Extension',
    type: 'isolation',
    weight: { min: 2, max: 30, step: 1, default: 10 },
    referenceWeight: 12,
    requiredEquipment: ['bodyweight', 'bands'],
  },

  // ============================================
  // DELTS EXERCISES (4)
  // ============================================
  {
    id: 'overhead_press',
    skillId: 'delts',
    subcategoryIds: ['delts_front'],
    name: 'Overhead Press',
    type: 'compound',
    weight: { min: 20, max: 120, step: 2.5, default: 40 },
    referenceWeight: 55,
    requiredEquipment: ['barbell', 'squat_rack'],
  },
  {
    id: 'lateral_raise',
    skillId: 'delts',
    subcategoryIds: ['delts_side'],
    name: 'Lateral Raise',
    type: 'isolation',
    weight: { min: 2, max: 25, step: 1, default: 8 },
    referenceWeight: 12,
    requiredEquipment: ['dumbbells'],
  },
  {
    id: 'front_raise',
    skillId: 'delts',
    subcategoryIds: ['delts_front'],
    name: 'Front Raise',
    type: 'isolation',
    weight: { min: 2, max: 25, step: 1, default: 8 },
    referenceWeight: 12,
    requiredEquipment: ['dumbbells'],
  },
  {
    id: 'reverse_fly',
    skillId: 'delts',
    subcategoryIds: ['delts_rear'],
    name: 'Reverse Fly',
    type: 'isolation',
    weight: { min: 2, max: 25, step: 1, default: 8 },
    referenceWeight: 12,
    requiredEquipment: ['dumbbells', 'cable'],
  },

  // ============================================
  // BICEPS EXERCISES (4)
  // ============================================
  {
    id: 'barbell_curl',
    skillId: 'biceps',
    subcategoryIds: ['biceps_long', 'biceps_short'],
    name: 'Barbell Curl',
    type: 'isolation',
    weight: { min: 10, max: 80, step: 2.5, default: 30 },
    referenceWeight: 40,
    requiredEquipment: ['barbell'],
  },
  {
    id: 'dumbbell_curl',
    skillId: 'biceps',
    subcategoryIds: ['biceps_long', 'biceps_short'],
    name: 'Dumbbell Curl',
    type: 'isolation',
    weight: { min: 4, max: 35, step: 1, default: 12 },
    referenceWeight: 16,
    requiredEquipment: ['dumbbells'],
  },
  {
    id: 'hammer_curl',
    skillId: 'biceps',
    subcategoryIds: ['biceps_long'],
    name: 'Hammer Curl',
    type: 'isolation',
    weight: { min: 4, max: 40, step: 1, default: 14 },
    referenceWeight: 18,
    requiredEquipment: ['dumbbells'],
  },
  {
    id: 'preacher_curl',
    skillId: 'biceps',
    subcategoryIds: ['biceps_short'],
    name: 'Preacher Curl',
    type: 'isolation',
    weight: { min: 5, max: 50, step: 2.5, default: 20 },
    referenceWeight: 28,
    requiredEquipment: ['barbell', 'bench'],
  },

  // ============================================
  // TRICEPS EXERCISES (4)
  // ============================================
  {
    id: 'tricep_pushdown',
    skillId: 'triceps',
    subcategoryIds: ['triceps_lateral'],
    name: 'Tricep Pushdown',
    type: 'isolation',
    weight: { min: 10, max: 80, step: 2.5, default: 30 },
    referenceWeight: 40,
    requiredEquipment: ['cable'],
  },
  {
    id: 'skull_crusher',
    skillId: 'triceps',
    subcategoryIds: ['triceps_long'],
    name: 'Skull Crusher',
    type: 'isolation',
    weight: { min: 10, max: 60, step: 2.5, default: 25 },
    referenceWeight: 35,
    requiredEquipment: ['barbell', 'bench'],
  },
  {
    id: 'overhead_extension',
    skillId: 'triceps',
    subcategoryIds: ['triceps_long'],
    name: 'Overhead Extension',
    type: 'isolation',
    weight: { min: 8, max: 50, step: 2, default: 20 },
    referenceWeight: 28,
    requiredEquipment: ['dumbbells'],
  },
  {
    id: 'dips',
    skillId: 'triceps',
    subcategoryIds: ['triceps_lateral', 'triceps_medial'],
    name: 'Dips',
    type: 'compound',
    weight: { min: 0, max: 60, step: 2.5, default: 0 },
    referenceWeight: 0,
    requiredEquipment: ['bodyweight'],
  },

  // ============================================
  // FOREARMS EXERCISES (3)
  // ============================================
  {
    id: 'wrist_curl',
    skillId: 'forearms',
    subcategoryIds: ['forearms_flexors'],
    name: 'Wrist Curl',
    type: 'isolation',
    weight: { min: 5, max: 40, step: 1, default: 15 },
    referenceWeight: 20,
    requiredEquipment: ['dumbbells', 'barbell'],
  },
  {
    id: 'reverse_wrist_curl',
    skillId: 'forearms',
    subcategoryIds: ['forearms_extensors'],
    name: 'Reverse Wrist Curl',
    type: 'isolation',
    weight: { min: 2, max: 25, step: 1, default: 10 },
    referenceWeight: 12,
    requiredEquipment: ['dumbbells', 'barbell'],
  },
  {
    id: 'farmers_walk',
    skillId: 'forearms',
    subcategoryIds: ['forearms_flexors'],
    name: 'Farmers Walk',
    type: 'compound',
    weight: { min: 10, max: 80, step: 2, default: 30 },
    referenceWeight: 40,
    requiredEquipment: ['dumbbells'],
  },

  // ============================================
  // CORE EXERCISES (6)
  // ============================================
  {
    id: 'crunch',
    skillId: 'core',
    subcategoryIds: ['core_abs'],
    name: 'Crunch',
    type: 'isolation',
    weight: { min: 0, max: 30, step: 2.5, default: 0 },
    referenceWeight: 0,
    requiredEquipment: ['bodyweight'],
  },
  {
    id: 'leg_raise',
    skillId: 'core',
    subcategoryIds: ['core_abs'],
    name: 'Leg Raise',
    type: 'isolation',
    weight: { min: 0, max: 20, step: 1, default: 0 },
    referenceWeight: 0,
    requiredEquipment: ['bodyweight', 'pullup_bar'],
  },
  {
    id: 'plank',
    skillId: 'core',
    subcategoryIds: ['core_abs'],
    name: 'Plank',
    type: 'isolation',
    weight: { min: 0, max: 30, step: 2.5, default: 0 },
    referenceWeight: 0,
    requiredEquipment: ['bodyweight'],
  },
  {
    id: 'russian_twist',
    skillId: 'core',
    subcategoryIds: ['core_obliques'],
    name: 'Russian Twist',
    type: 'isolation',
    weight: { min: 0, max: 25, step: 1, default: 8 },
    referenceWeight: 10,
    requiredEquipment: ['bodyweight', 'dumbbells'],
  },
  {
    id: 'side_plank',
    skillId: 'core',
    subcategoryIds: ['core_obliques'],
    name: 'Side Plank',
    type: 'isolation',
    weight: { min: 0, max: 20, step: 2.5, default: 0 },
    referenceWeight: 0,
    requiredEquipment: ['bodyweight'],
  },
  {
    id: 'cable_crunch',
    skillId: 'core',
    subcategoryIds: ['core_abs'],
    name: 'Cable Crunch',
    type: 'isolation',
    weight: { min: 10, max: 80, step: 2.5, default: 30 },
    referenceWeight: 40,
    requiredEquipment: ['cable'],
  },

  // ============================================
  // GLUTES EXERCISES (4)
  // ============================================
  {
    id: 'hip_thrust',
    skillId: 'glutes',
    subcategoryIds: ['glutes_max'],
    name: 'Hip Thrust',
    type: 'compound',
    weight: { min: 20, max: 250, step: 5, default: 80 },
    referenceWeight: 120,
    requiredEquipment: ['barbell', 'bench'],
  },
  {
    id: 'glute_bridge',
    skillId: 'glutes',
    subcategoryIds: ['glutes_max'],
    name: 'Glute Bridge',
    type: 'isolation',
    weight: { min: 0, max: 100, step: 5, default: 40 },
    referenceWeight: 60,
    requiredEquipment: ['bodyweight', 'barbell'],
  },
  {
    id: 'cable_kickback',
    skillId: 'glutes',
    subcategoryIds: ['glutes_max'],
    name: 'Cable Kickback',
    type: 'isolation',
    weight: { min: 5, max: 40, step: 2.5, default: 15 },
    referenceWeight: 20,
    requiredEquipment: ['cable'],
  },
  {
    id: 'clamshell',
    skillId: 'glutes',
    subcategoryIds: ['glutes_med'],
    name: 'Clamshell',
    type: 'isolation',
    weight: { min: 0, max: 20, step: 1, default: 5 },
    referenceWeight: 8,
    requiredEquipment: ['bodyweight', 'bands'],
  },

  // ============================================
  // QUADS EXERCISES (4)
  // ============================================
  {
    id: 'squat',
    skillId: 'quads',
    subcategoryIds: ['quads_vastus', 'quads_rectus'],
    name: 'Squat',
    type: 'compound',
    weight: { min: 20, max: 280, step: 5, default: 80 },
    referenceWeight: 120,
    requiredEquipment: ['barbell', 'squat_rack'],
  },
  {
    id: 'leg_press',
    skillId: 'quads',
    subcategoryIds: ['quads_vastus'],
    name: 'Leg Press',
    type: 'compound',
    weight: { min: 40, max: 500, step: 10, default: 160 },
    referenceWeight: 220,
    requiredEquipment: ['machines'],
  },
  {
    id: 'leg_extension',
    skillId: 'quads',
    subcategoryIds: ['quads_vastus', 'quads_rectus'],
    name: 'Leg Extension',
    type: 'isolation',
    weight: { min: 10, max: 120, step: 2.5, default: 40 },
    referenceWeight: 55,
    requiredEquipment: ['machines'],
  },
  {
    id: 'lunge',
    skillId: 'quads',
    subcategoryIds: ['quads_vastus'],
    name: 'Lunge',
    type: 'compound',
    weight: { min: 0, max: 80, step: 2, default: 20 },
    referenceWeight: 30,
    requiredEquipment: ['bodyweight', 'dumbbells'],
  },

  // ============================================
  // HAMSTRINGS EXERCISES (3)
  // ============================================
  {
    id: 'romanian_deadlift',
    skillId: 'hamstrings',
    subcategoryIds: ['hams_bicep', 'hams_semi'],
    name: 'Romanian Deadlift',
    type: 'compound',
    weight: { min: 30, max: 200, step: 5, default: 70 },
    referenceWeight: 100,
    requiredEquipment: ['barbell'],
  },
  {
    id: 'leg_curl',
    skillId: 'hamstrings',
    subcategoryIds: ['hams_bicep', 'hams_semi'],
    name: 'Leg Curl',
    type: 'isolation',
    weight: { min: 10, max: 100, step: 2.5, default: 35 },
    referenceWeight: 50,
    requiredEquipment: ['machines'],
  },
  {
    id: 'nordic_curl',
    skillId: 'hamstrings',
    subcategoryIds: ['hams_bicep'],
    name: 'Nordic Curl',
    type: 'isolation',
    weight: { min: 0, max: 30, step: 2.5, default: 0 },
    referenceWeight: 0,
    requiredEquipment: ['bodyweight'],
  },

  // ============================================
  // CALVES EXERCISES (3)
  // ============================================
  {
    id: 'standing_calf_raise',
    skillId: 'calves',
    subcategoryIds: ['calves_gastro'],
    name: 'Standing Calf Raise',
    type: 'isolation',
    weight: { min: 20, max: 200, step: 5, default: 80 },
    referenceWeight: 100,
    requiredEquipment: ['machines'],
  },
  {
    id: 'seated_calf_raise',
    skillId: 'calves',
    subcategoryIds: ['calves_soleus'],
    name: 'Seated Calf Raise',
    type: 'isolation',
    weight: { min: 10, max: 120, step: 5, default: 40 },
    referenceWeight: 60,
    requiredEquipment: ['machines'],
  },
  {
    id: 'donkey_calf_raise',
    skillId: 'calves',
    subcategoryIds: ['calves_gastro'],
    name: 'Donkey Calf Raise',
    type: 'isolation',
    weight: { min: 20, max: 180, step: 5, default: 60 },
    referenceWeight: 80,
    requiredEquipment: ['machines'],
  },
] as const;

/**
 * Get exercise by ID
 */
export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES.find(e => e.id === id);
}

/**
 * Get exercises by skill ID
 */
export function getExercisesBySkill(skillId: SkillId): Exercise[] {
  return EXERCISES.filter(e => e.skillId === skillId);
}

/**
 * Get exercises by subcategory ID
 */
export function getExercisesBySubcategory(subcategoryId: string): Exercise[] {
  return EXERCISES.filter(e => e.subcategoryIds.includes(subcategoryId));
}

/**
 * Filter exercises by available equipment
 * @param exercises - Array of exercises to filter
 * @param availableEquipment - Array of available equipment IDs
 * @returns Exercises that can be performed with available equipment
 */
export function filterExercisesByEquipment(
  exercises: Exercise[],
  availableEquipment: EquipmentId[]
): Exercise[] {
  if (!availableEquipment || availableEquipment.length === 0) {
    return exercises;
  }

  return exercises.filter(exercise => {
    if (!exercise.requiredEquipment || exercise.requiredEquipment.length === 0) {
      return true;
    }
    // Exercise is available if user has ANY of the required equipment options
    return exercise.requiredEquipment.some(eq => availableEquipment.includes(eq));
  });
}

/**
 * Get random exercises for a skill (for challenges)
 */
export function getRandomExercises(skillId: SkillId, count: number): Exercise[] {
  const exercises = getExercisesBySkill(skillId);
  const result: Exercise[] = [];
  const pool = [...exercises];

  while (result.length < count && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(index, 1)[0]);
  }

  return result;
}
