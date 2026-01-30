/**
 * XPGains XP Configuration
 * Calibration: Level 99 achievable in 6-8 years at baseline volume
 * - 3-4 sets/week per muscle
 * - ~1,200-1,600 quality sets to max a skill
 */

import type { XpConfig } from '../types';

/**
 * XP System Configuration
 */
export const XP_CONFIG: XpConfig = {
  maxLevel: 99,

  // Geometric curve: XP to next level = base * growthRate^(level-1)
  base: 150,         // XP needed for level 1→2 (requires ~2-4 sets)
  growthRate: 1.03,  // 3% growth per level

  // XP per set calculation base values
  exerciseBaseXp: {
    compound: 50,    // Compound exercises: 50 XP base
    isolation: 35,   // Isolation exercises: 35 XP base
  },

  // Diminishing returns multipliers for repeated same-weight sets
  // Applied after grace period is exceeded
  diminishingMultipliers: [1.0, 0.85, 0.7, 0.5, 0.3],

  // Neglected muscle bonus settings
  neglectedDays: 7,      // Days without training to be "neglected"
  neglectedBonus: 0.10,  // 10% bonus XP for neglected muscles
};

/**
 * Pre-calculated cumulative XP for each level (for faster lookups)
 * XP_TABLE[level] = total XP needed to reach that level
 */
export const XP_TABLE: number[] = [];

// Build the XP table on module load
(function buildXpTable() {
  let cumulative = 0;
  XP_TABLE[1] = 0; // Level 1 starts at 0 XP

  for (let level = 2; level <= XP_CONFIG.maxLevel + 1; level++) {
    const xpForThisLevel = Math.round(
      XP_CONFIG.base * Math.pow(XP_CONFIG.growthRate, level - 2)
    );
    cumulative += xpForThisLevel;
    XP_TABLE[level] = cumulative;
  }
})();

/**
 * XP Calculation factors
 */
export const XP_FACTORS = {
  // Reps factor range: clamp(reps/10, 0.6, 2.0)
  reps: {
    baseline: 10,   // 10 reps = 1.0x factor
    min: 0.6,       // Minimum factor (low reps)
    max: 2.0,       // Maximum factor (high reps)
  },

  // Intensity factor range: clamp(sqrt(weight/refWeight), 0.7, 1.6)
  intensity: {
    min: 0.7,       // Minimum factor (light weight)
    max: 1.6,       // Maximum factor (heavy weight)
  },
};

/**
 * Get max XP (XP needed for level 99)
 */
export function getMaxXp(): number {
  return XP_TABLE[XP_CONFIG.maxLevel] || 0;
}
