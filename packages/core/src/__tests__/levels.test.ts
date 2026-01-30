/**
 * Level Progression Tests
 */

import {
  xpForLevel,
  xpToNextLevel,
  levelFromXp,
  progressToNextLevel,
  getTotalLevel,
  didLevelUp,
  isMaxLevel,
} from '../domain/levels';
import { XP_CONFIG, XP_TABLE } from '../data/xpConfig';
import { createInitialSkillXp } from '../data/skills';

describe('Level Progression', () => {
  describe('xpForLevel', () => {
    it('returns 0 XP for level 1', () => {
      expect(xpForLevel(1)).toBe(0);
    });

    it('returns 150 XP for level 2', () => {
      expect(xpForLevel(2)).toBe(150);
    });

    it('returns 0 for level 0 or negative', () => {
      expect(xpForLevel(0)).toBe(0);
      expect(xpForLevel(-1)).toBe(0);
    });

    it('caps at max level', () => {
      expect(xpForLevel(100)).toBe(XP_TABLE[99]);
      expect(xpForLevel(1000)).toBe(XP_TABLE[99]);
    });

    it('follows geometric progression', () => {
      const xp2 = xpForLevel(2);
      const xp3 = xpForLevel(3);
      const xp4 = xpForLevel(4);

      // XP to next level increases by 3% each level
      const ratio2to3 = (xp3 - xp2) / 150;
      const ratio3to4 = (xp4 - xp3) / (xp3 - xp2);

      expect(ratio2to3).toBeCloseTo(1.03, 1);
      expect(ratio3to4).toBeCloseTo(1.03, 1);
    });
  });

  describe('xpToNextLevel', () => {
    it('returns 150 XP to go from level 1 to 2', () => {
      expect(xpToNextLevel(1)).toBe(150);
    });

    it('returns 0 at max level', () => {
      expect(xpToNextLevel(99)).toBe(0);
    });

    it('increases by 3% each level', () => {
      const xp1to2 = xpToNextLevel(1);
      const xp2to3 = xpToNextLevel(2);

      expect(xp2to3 / xp1to2).toBeCloseTo(1.03, 1);
    });
  });

  describe('levelFromXp', () => {
    it('returns level 1 for 0 XP', () => {
      expect(levelFromXp(0)).toBe(1);
    });

    it('returns level 1 for 149 XP', () => {
      expect(levelFromXp(149)).toBe(1);
    });

    it('returns level 2 for 150 XP', () => {
      expect(levelFromXp(150)).toBe(2);
    });

    it('returns level 1 for negative XP', () => {
      expect(levelFromXp(-100)).toBe(1);
    });

    it('caps at level 99', () => {
      expect(levelFromXp(1000000)).toBe(99);
    });

    it('correctly calculates mid-level XP', () => {
      // 305 XP should be level 3 (150 + ~155 = 305 cumulative)
      const level3XP = xpForLevel(3);
      const level4XP = xpForLevel(4);

      expect(levelFromXp(level3XP)).toBe(3);
      expect(levelFromXp(level3XP + 1)).toBe(3);
      expect(levelFromXp(level4XP - 1)).toBe(3);
      expect(levelFromXp(level4XP)).toBe(4);
    });
  });

  describe('progressToNextLevel', () => {
    it('returns 0% at start of level', () => {
      expect(progressToNextLevel(0)).toBe(0);
      expect(progressToNextLevel(150)).toBe(0); // Start of level 2
    });

    it('returns 100% at max level', () => {
      expect(progressToNextLevel(xpForLevel(99))).toBe(100);
    });

    it('returns correct percentage mid-level', () => {
      // At 75 XP, should be 50% through level 1 (which needs 150 XP)
      expect(progressToNextLevel(75)).toBe(50);
    });
  });

  describe('getTotalLevel', () => {
    it('returns 14 for initial state (all skills at level 1)', () => {
      const skillXp = createInitialSkillXp();
      expect(getTotalLevel(skillXp)).toBe(14);
    });

    it('calculates sum of all skill levels', () => {
      const skillXp = {
        chest: 150, // Level 2
        back_lats: 150, // Level 2
        back_erector: 0, // Level 1
        traps: 0,
        neck: 0,
        delts: 0,
        biceps: 0,
        triceps: 0,
        forearms: 0,
        core: 0,
        glutes: 0,
        quads: 0,
        hamstrings: 0,
        calves: 0,
      };

      expect(getTotalLevel(skillXp)).toBe(14 + 2); // 12 at level 1 + 2 at level 2
    });
  });

  describe('didLevelUp', () => {
    it('returns true when crossing level threshold', () => {
      expect(didLevelUp(149, 150)).toBe(true);
    });

    it('returns false when staying in same level', () => {
      expect(didLevelUp(100, 149)).toBe(false);
    });

    it('returns true for multiple level ups', () => {
      expect(didLevelUp(0, 500)).toBe(true);
    });
  });

  describe('isMaxLevel', () => {
    it('returns false for low XP', () => {
      expect(isMaxLevel(0)).toBe(false);
      expect(isMaxLevel(10000)).toBe(false);
    });

    it('returns true at level 99', () => {
      expect(isMaxLevel(xpForLevel(99))).toBe(true);
    });
  });
});
