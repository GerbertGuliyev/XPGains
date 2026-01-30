/**
 * XPGains Level Progression System
 * Geometric curve calibrated for 6-8 years to max a skill
 */

import { XP_CONFIG, XP_TABLE } from '../data';

/**
 * Get total XP required to reach a specific level
 * @param level - Target level (1-99)
 * @returns Total cumulative XP needed to reach that level
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level > XP_CONFIG.maxLevel) level = XP_CONFIG.maxLevel;
  return XP_TABLE[level] || 0;
}

/**
 * Get XP required for the next level from current level
 * @param level - Current level
 * @returns XP needed to advance to next level
 */
export function xpToNextLevel(level: number): number {
  if (level >= XP_CONFIG.maxLevel) return 0;
  return Math.round(XP_CONFIG.base * Math.pow(XP_CONFIG.growthRate, level - 1));
}

/**
 * Calculate level from total XP
 * @param xp - Current XP
 * @returns Current level (1-99)
 */
export function levelFromXp(xp: number): number {
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
 * @param xp - Current XP
 * @returns Progress percentage (0-100)
 */
export function progressToNextLevel(xp: number): number {
  const currentLevel = levelFromXp(xp);
  if (currentLevel >= XP_CONFIG.maxLevel) return 100;

  const currentLevelXp = xpForLevel(currentLevel);
  const nextLevelXp = xpForLevel(currentLevel + 1);
  const xpIntoLevel = xp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;

  return Math.min(100, Math.floor((xpIntoLevel / xpNeeded) * 100));
}

/**
 * Get total level (sum of all skill levels)
 * @param skillXp - Map of skill IDs to XP values
 * @returns Total level (14-1386)
 */
export function getTotalLevel(skillXp: Record<string, number>): number {
  let total = 0;

  for (const xp of Object.values(skillXp)) {
    total += levelFromXp(xp || 0);
  }

  // Minimum total level is 14 (all skills at level 1)
  return Math.max(14, total);
}

/**
 * Check if a level up occurred
 * @param previousXp - XP before the gain
 * @param newXp - XP after the gain
 * @returns True if a level up occurred
 */
export function didLevelUp(previousXp: number, newXp: number): boolean {
  return levelFromXp(newXp) > levelFromXp(previousXp);
}

/**
 * Get the new level if a level up occurred
 * @param previousXp - XP before the gain
 * @param newXp - XP after the gain
 * @returns New level if leveled up, null otherwise
 */
export function getNewLevelIfLevelUp(
  previousXp: number,
  newXp: number
): number | null {
  const prevLevel = levelFromXp(previousXp);
  const newLevel = levelFromXp(newXp);
  return newLevel > prevLevel ? newLevel : null;
}

/**
 * Check if a skill is at max level
 * @param xp - Current XP for the skill
 * @returns True if at level 99
 */
export function isMaxLevel(xp: number): boolean {
  return levelFromXp(xp) >= XP_CONFIG.maxLevel;
}

/**
 * Get XP remaining to reach max level
 * @param xp - Current XP
 * @returns XP remaining to reach level 99
 */
export function xpToMaxLevel(xp: number): number {
  const maxXp = xpForLevel(XP_CONFIG.maxLevel);
  return Math.max(0, maxXp - xp);
}
