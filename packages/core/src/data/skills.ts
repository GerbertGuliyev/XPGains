/**
 * XPGains Skills Data
 * 14 muscle groups that serve as "skills" in the RPG system
 */

import type { Skill, SkillId } from '../types';

/**
 * All 14 muscle skills
 * Upper Body (9): chest, back_lats, back_erector, traps, neck, delts, biceps, triceps, forearms
 * Lower Body (5): core, glutes, quads, hamstrings, calves
 */
export const SKILLS: readonly Skill[] = [
  // Upper Body (9)
  { id: 'chest', name: 'Chest', icon: 'chest', bodyRegion: 'upper' },
  { id: 'back_lats', name: 'Back – Lats', icon: 'back_lats', bodyRegion: 'upper' },
  { id: 'back_erector', name: 'Back – Lower', icon: 'back_erector', bodyRegion: 'upper' },
  { id: 'traps', name: 'Traps', icon: 'traps', bodyRegion: 'upper' },
  { id: 'neck', name: 'Neck', icon: 'neck', bodyRegion: 'upper' },
  { id: 'delts', name: 'Delts', icon: 'delts', bodyRegion: 'upper' },
  { id: 'biceps', name: 'Biceps', icon: 'biceps', bodyRegion: 'upper' },
  { id: 'triceps', name: 'Triceps', icon: 'triceps', bodyRegion: 'upper' },
  { id: 'forearms', name: 'Forearms', icon: 'forearms', bodyRegion: 'upper' },

  // Lower Body (5)
  { id: 'core', name: 'Core', icon: 'core', bodyRegion: 'lower' },
  { id: 'glutes', name: 'Glutes', icon: 'glutes', bodyRegion: 'lower' },
  { id: 'quads', name: 'Quads', icon: 'quads', bodyRegion: 'lower' },
  { id: 'hamstrings', name: 'Hamstrings', icon: 'hamstrings', bodyRegion: 'lower' },
  { id: 'calves', name: 'Calves', icon: 'calves', bodyRegion: 'lower' },
] as const;

/**
 * All valid skill IDs
 */
export const SKILL_IDS: readonly SkillId[] = SKILLS.map(s => s.id);

/**
 * Get skill by ID
 */
export function getSkillById(id: SkillId): Skill | undefined {
  return SKILLS.find(s => s.id === id);
}

/**
 * Get skills by body region
 */
export function getSkillsByRegion(region: 'upper' | 'lower'): Skill[] {
  return SKILLS.filter(s => s.bodyRegion === region);
}

/**
 * Check if a string is a valid skill ID
 */
export function isValidSkillId(id: string): id is SkillId {
  return SKILL_IDS.includes(id as SkillId);
}

/**
 * Get random skills (for challenges)
 * @param count Number of skills to return
 * @param region Optional body region filter
 */
export function getRandomSkills(count: number, region?: 'upper' | 'lower'): Skill[] {
  const pool = region ? getSkillsByRegion(region) : [...SKILLS];
  const result: Skill[] = [];

  while (result.length < count && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(index, 1)[0]);
  }

  return result;
}

/**
 * Create initial skill XP map (all skills at 0 XP)
 */
export function createInitialSkillXp(): Record<SkillId, number> {
  const skillXp: Record<string, number> = {};
  for (const skill of SKILLS) {
    skillXp[skill.id] = 0;
  }
  return skillXp as Record<SkillId, number>;
}
