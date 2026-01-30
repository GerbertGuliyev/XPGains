/**
 * XPGains Exercise Spillover Mapping
 * Defines secondary muscle XP percentages for compound exercises
 *
 * Spillover XP is awarded silently (no toast notification)
 * Percentages range from 5% to 25% based on muscle involvement
 */

import type { ExerciseSpilloverMap } from '../types';

/**
 * Spillover XP mapping for compound exercises
 * Key: exercise ID
 * Value: Object mapping skill IDs to XP multipliers (0.05 = 5%, 0.25 = 25%)
 */
export const EXERCISE_SPILLOVER: ExerciseSpilloverMap = {
  // ============================================
  // CHEST COMPOUNDS
  // ============================================
  bench_press: {
    triceps: 0.15,   // 15% spillover to triceps
    delts: 0.10,     // 10% spillover to front delts
  },
  incline_bench: {
    triceps: 0.15,
    delts: 0.15,     // More front delt involvement on incline
  },
  decline_bench: {
    triceps: 0.15,
  },
  push_ups: {
    triceps: 0.15,
    delts: 0.10,
    core: 0.05,      // Stabilization requirement
  },

  // ============================================
  // BACK COMPOUNDS
  // ============================================
  pull_ups: {
    biceps: 0.20,    // Heavy bicep involvement
    forearms: 0.10,  // Grip strength
  },
  lat_pulldown: {
    biceps: 0.15,
    forearms: 0.05,
  },
  barbell_row: {
    biceps: 0.15,
    forearms: 0.10,
    back_erector: 0.10,  // Spinal stability
  },
  cable_row: {
    biceps: 0.12,
    forearms: 0.08,
  },
  dumbbell_row: {
    biceps: 0.15,
    forearms: 0.08,
  },

  // ============================================
  // BACK - ERECTOR COMPOUNDS
  // ============================================
  deadlift: {
    glutes: 0.25,       // Major hip extension
    hamstrings: 0.20,   // Hip hinge movement
    quads: 0.10,        // Knee extension component
    forearms: 0.10,     // Grip strength
    traps: 0.10,        // Scapular stability
  },
  good_morning: {
    glutes: 0.15,
    hamstrings: 0.20,
  },

  // ============================================
  // SHOULDER COMPOUNDS
  // ============================================
  overhead_press: {
    triceps: 0.15,   // Lockout assistance
    traps: 0.10,     // Scapular elevation
    core: 0.05,      // Stability
  },

  // ============================================
  // TRICEPS COMPOUNDS
  // ============================================
  dips: {
    chest: 0.20,     // Pec involvement (especially at bottom)
    delts: 0.10,     // Front delt assistance
  },

  // ============================================
  // LEG COMPOUNDS
  // ============================================
  squat: {
    glutes: 0.25,       // Hip extension at bottom
    hamstrings: 0.15,   // Hip hinge component
    core: 0.10,         // Trunk stability
    back_erector: 0.05, // Spinal support
  },
  leg_press: {
    glutes: 0.15,
    hamstrings: 0.10,
  },
  lunge: {
    glutes: 0.20,
    hamstrings: 0.10,
    core: 0.05,      // Balance requirement
  },

  // ============================================
  // GLUTE COMPOUNDS
  // ============================================
  hip_thrust: {
    hamstrings: 0.15,
    core: 0.05,
  },

  // ============================================
  // HAMSTRING COMPOUNDS
  // ============================================
  romanian_deadlift: {
    glutes: 0.20,       // Hip extension
    back_erector: 0.15, // Spinal stability
    forearms: 0.05,     // Grip
  },

  // ============================================
  // FOREARM COMPOUNDS
  // ============================================
  farmers_walk: {
    traps: 0.15,     // Shoulder depression
    core: 0.10,      // Anti-lateral flexion
  },
};

/**
 * Get spillover XP mapping for an exercise
 * @param exerciseId - The exercise ID
 * @returns Spillover mapping or null if none
 */
export function getExerciseSpillover(
  exerciseId: string
): Record<string, number> | null {
  return EXERCISE_SPILLOVER[exerciseId] || null;
}

/**
 * Check if an exercise has spillover XP
 */
export function hasSpillover(exerciseId: string): boolean {
  return exerciseId in EXERCISE_SPILLOVER;
}

/**
 * Calculate spillover XP amounts for an exercise
 * @param exerciseId - The exercise ID
 * @param parentXp - The XP awarded to the primary muscle
 * @returns Array of spillover XP entries
 */
export function calculateSpilloverXp(
  exerciseId: string,
  parentXp: number
): { skillId: string; xp: number }[] {
  const spillover = EXERCISE_SPILLOVER[exerciseId];
  if (!spillover) return [];

  return Object.entries(spillover).map(([skillId, multiplier]) => ({
    skillId,
    xp: Math.round(parentXp * multiplier),
  }));
}
