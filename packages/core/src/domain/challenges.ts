/**
 * XPGains Challenge/Quest Generation
 * Random workout challenges with configurable difficulty
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  Challenge,
  ChallengeType,
  ChallengeFocus,
  ChallengeSkill,
  ChallengeExercise,
  SkillId,
} from '../types';
import { getRandomSkills, getRandomExercises } from '../data';

/**
 * Challenge configuration by type
 */
const CHALLENGE_CONFIG: Record<
  ChallengeType,
  { muscles: number; exercises: number; sets: number }
> = {
  short: { muscles: 1, exercises: 1, sets: 4 },
  regular: { muscles: 2, exercises: 3, sets: 3 },
  ironman: { muscles: 3, exercises: 4, sets: 4 },
};

/**
 * Generate a random challenge
 * @param type - Challenge difficulty type
 * @param focus - Body region focus (full, upper, lower)
 * @returns Generated challenge
 */
export function generateChallenge(
  type: ChallengeType,
  focus: ChallengeFocus = 'full'
): Challenge {
  const config = CHALLENGE_CONFIG[type];

  // Get random skills based on focus
  const bodyRegion = focus === 'full' ? undefined : focus;
  const skills = getRandomSkills(config.muscles, bodyRegion);

  // Build challenge skills with exercises
  const challengeSkills: ChallengeSkill[] = skills.map(skill => {
    const exercises = getRandomExercises(skill.id, config.exercises);

    const challengeExercises: ChallengeExercise[] = exercises.map(exercise => ({
      exerciseId: exercise.id,
      targetSets: type === 'regular' ? Math.floor(Math.random() * 2) + 3 : config.sets,
      completedSets: 0,
    }));

    return {
      skillId: skill.id as SkillId,
      exercises: challengeExercises,
    };
  });

  return {
    id: uuidv4(),
    type,
    focus,
    skills: challengeSkills,
    startedAt: new Date().toISOString(),
    completed: false,
  };
}

/**
 * Update challenge progress after completing a set
 */
export function updateChallengeProgress(
  challenge: Challenge,
  exerciseId: string
): Challenge {
  let completed = true;

  const updatedSkills = challenge.skills.map(skill => {
    const updatedExercises = skill.exercises.map(exercise => {
      if (exercise.exerciseId === exerciseId) {
        const newCompletedSets = Math.min(
          exercise.completedSets + 1,
          exercise.targetSets
        );

        if (newCompletedSets < exercise.targetSets) {
          completed = false;
        }

        return {
          ...exercise,
          completedSets: newCompletedSets,
        };
      }

      if (exercise.completedSets < exercise.targetSets) {
        completed = false;
      }

      return exercise;
    });

    return {
      ...skill,
      exercises: updatedExercises,
    };
  });

  return {
    ...challenge,
    skills: updatedSkills,
    completed,
    completedAt: completed ? new Date().toISOString() : undefined,
  };
}

/**
 * Check if an exercise is part of the current challenge
 */
export function isExerciseInChallenge(
  challenge: Challenge,
  exerciseId: string
): boolean {
  for (const skill of challenge.skills) {
    for (const exercise of skill.exercises) {
      if (exercise.exerciseId === exerciseId) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Get total progress of a challenge
 */
export function getChallengeProgress(
  challenge: Challenge
): { completed: number; total: number; percentage: number } {
  let completed = 0;
  let total = 0;

  for (const skill of challenge.skills) {
    for (const exercise of skill.exercises) {
      total += exercise.targetSets;
      completed += exercise.completedSets;
    }
  }

  const percentage = total > 0 ? Math.floor((completed / total) * 100) : 0;

  return { completed, total, percentage };
}

/**
 * Get remaining exercises for a challenge
 */
export function getRemainingExercises(
  challenge: Challenge
): ChallengeExercise[] {
  const remaining: ChallengeExercise[] = [];

  for (const skill of challenge.skills) {
    for (const exercise of skill.exercises) {
      if (exercise.completedSets < exercise.targetSets) {
        remaining.push(exercise);
      }
    }
  }

  return remaining;
}
