/**
 * XPGains XP Calculation System
 * Formula: xp = baseXp × repsFactor × intensityFactor × diminishing × neglectedBonus
 */

import type {
  Exercise,
  CustomExercise,
  RecentSet,
  XpCalculationParams,
  LogEntry,
  SkillId,
} from '../types';
import { XP_CONFIG, XP_FACTORS, getExerciseById } from '../data';
import { calculateSpilloverXp } from '../data/spillover';

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Calculate XP to award for a set
 *
 * Formula breakdown:
 * 1. Base XP: Compound (50) or Isolation (35)
 * 2. Reps Factor: clamp(reps/10, 0.6, 2.0)
 * 3. Intensity Factor: clamp(sqrt(weight/refWeight), 0.7, 1.6)
 * 4. Diminishing Returns: Multiplier based on repeated same-weight sets
 * 5. Neglected Bonus: +10% if muscle not trained in 7+ days
 *
 * @param params - XP calculation parameters
 * @returns XP to award (minimum 1)
 */
export function calculateXpGain(params: XpCalculationParams): number {
  const {
    reps,
    weightKg,
    exerciseId,
    skillLevel,
    recentSets,
    isNeglected,
  } = params;

  const exercise = getExerciseById(exerciseId);
  if (!exercise) return 1;

  return calculateXpForExercise(
    exercise,
    reps,
    weightKg,
    skillLevel,
    recentSets,
    isNeglected
  );
}

/**
 * Calculate XP for a specific exercise (including custom exercises)
 */
export function calculateXpForExercise(
  exercise: Exercise | CustomExercise,
  reps: number,
  weightKg: number,
  skillLevel: number,
  recentSets: RecentSet[],
  isNeglected: boolean
): number {
  // Handle custom exercises with fixed XP mode
  if ('isCustom' in exercise && exercise.xpMode === 'custom' && exercise.customXpPerSet) {
    let xp = exercise.customXpPerSet;

    // Still apply neglected bonus to custom XP
    if (isNeglected) {
      xp = Math.round(xp * (1 + XP_CONFIG.neglectedBonus));
    }

    return Math.max(1, xp);
  }

  // Base XP based on exercise type
  const exerciseType = exercise.type === 'compound' ? 'compound' : 'isolation';
  const baseXp = XP_CONFIG.exerciseBaseXp[exerciseType];

  // Reps factor: clamp(reps/10, 0.6, 2.0)
  const repsFactor = clamp(
    reps / XP_FACTORS.reps.baseline,
    XP_FACTORS.reps.min,
    XP_FACTORS.reps.max
  );

  // Intensity factor: clamp(sqrt(weight/refWeight), 0.7, 1.6)
  // For bodyweight exercises (referenceWeight = 0), use factor of 1.0
  let intensityFactor = 1.0;
  if (exercise.referenceWeight > 0) {
    intensityFactor = clamp(
      Math.sqrt(weightKg / exercise.referenceWeight),
      XP_FACTORS.intensity.min,
      XP_FACTORS.intensity.max
    );
  }

  // Calculate base XP for this set
  let xp = Math.round(baseXp * repsFactor * intensityFactor);

  // Apply diminishing returns for repeated same-weight sets
  xp = applyDiminishingReturns(
    xp,
    exercise.id,
    weightKg,
    reps,
    skillLevel,
    recentSets
  );

  // Apply neglected muscle bonus (+10%)
  if (isNeglected) {
    xp = Math.round(xp * (1 + XP_CONFIG.neglectedBonus));
  }

  return Math.max(1, xp); // Minimum 1 XP per set
}

/**
 * Apply diminishing returns for repeated same-weight sets
 */
function applyDiminishingReturns(
  xp: number,
  exerciseId: string,
  weight: number,
  reps: number,
  skillLevel: number,
  recentSets: RecentSet[]
): number {
  // Grace period based on level: 1 + floor(level / 15)
  const graceSets = 1 + Math.floor(skillLevel / 15);

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
    return Math.round(xp * XP_CONFIG.diminishingMultipliers[diminishIndex]);
  }

  return xp;
}

/**
 * Check if a muscle skill is "neglected" (trained before but not in X days)
 * @param skillId - The skill to check
 * @param logEntries - All log entries
 * @param daysThreshold - Days without training to be "neglected" (default: 7)
 * @returns True if neglected (trained before but not recently)
 */
export function isSkillNeglected(
  skillId: SkillId,
  logEntries: LogEntry[],
  daysThreshold: number = XP_CONFIG.neglectedDays
): boolean {
  const cutoffTime = Date.now() - daysThreshold * 24 * 60 * 60 * 1000;

  // First check if this skill has EVER been trained
  const hasEverTrained = logEntries.some(entry => entry.skillId === skillId);

  // If never trained before, not neglected (no bonus)
  if (!hasEverTrained) {
    return false;
  }

  // Check if trained recently (within threshold days)
  for (const entry of logEntries) {
    if (entry.skillId === skillId && entry.timestamp > cutoffTime) {
      return false;
    }
  }

  // Trained before but not recently = neglected
  return true;
}

/**
 * Get spillover XP for an exercise
 * @param exerciseId - The exercise ID
 * @param parentXp - The XP awarded to the primary muscle
 * @returns Array of spillover XP entries
 */
export function getSpilloverXp(
  exerciseId: string,
  parentXp: number
): { skillId: string; xp: number }[] {
  return calculateSpilloverXp(exerciseId, parentXp);
}

/**
 * Calculate total XP from a workout session (including spillover)
 */
export function calculateSessionTotalXp(
  sets: Array<{ xpEarned: number; spillover?: Array<{ xp: number }> }>
): number {
  let total = 0;

  for (const set of sets) {
    total += set.xpEarned;
    if (set.spillover) {
      for (const spill of set.spillover) {
        total += spill.xp;
      }
    }
  }

  return total;
}
