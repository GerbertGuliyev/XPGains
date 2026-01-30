/**
 * Workout Completion Tests
 */

import {
  completeWorkout,
  completeSet,
  undoLogEntry,
} from '../domain/workout';
import { createInitialState } from '../domain/state';
import { levelFromXp } from '../domain/levels';
import type { WorkoutSessionInput, SetInput, RecentSet, LogEntry } from '../types';

describe('Workout Completion', () => {
  describe('completeWorkout', () => {
    it('generates XP events for a workout', () => {
      const state = createInitialState();
      const input: WorkoutSessionInput = {
        exercises: [
          {
            exerciseId: 'bench_press',
            sets: [
              { exerciseId: 'bench_press', reps: 10, weightKg: 60 },
            ],
          },
        ],
      };

      const result = completeWorkout(state, input);

      expect(result.xpEvents.length).toBeGreaterThan(0);
      expect(result.session.totalXpEarned).toBeGreaterThan(0);
    });

    it('awards XP to the correct skill', () => {
      const state = createInitialState();
      const input: WorkoutSessionInput = {
        exercises: [
          {
            exerciseId: 'bench_press', // Chest exercise
            sets: [
              { exerciseId: 'bench_press', reps: 10, weightKg: 60 },
            ],
          },
        ],
      };

      const result = completeWorkout(state, input);

      // Primary event should be for chest
      const chestEvent = result.xpEvents.find(
        e => e.skillId === 'chest' && e.type === 'workout'
      );
      expect(chestEvent).toBeDefined();
      expect(chestEvent?.amount).toBeGreaterThan(0);
    });

    it('generates spillover XP events for compound exercises', () => {
      const state = createInitialState();
      const input: WorkoutSessionInput = {
        exercises: [
          {
            exerciseId: 'bench_press',
            sets: [
              { exerciseId: 'bench_press', reps: 10, weightKg: 80 },
            ],
          },
        ],
      };

      const result = completeWorkout(state, input);

      // Should have spillover events for triceps and delts
      const spilloverEvents = result.xpEvents.filter(e => e.type === 'spillover');
      expect(spilloverEvents.length).toBeGreaterThan(0);

      const tricepsEvent = spilloverEvents.find(e => e.skillId === 'triceps');
      expect(tricepsEvent).toBeDefined();
    });

    it('creates a workout session record', () => {
      const state = createInitialState();
      const input: WorkoutSessionInput = {
        id: 'test-session-123',
        exercises: [
          {
            exerciseId: 'squat',
            sets: [
              { exerciseId: 'squat', reps: 8, weightKg: 100 },
            ],
          },
        ],
        durationSeconds: 3600,
      };

      const result = completeWorkout(state, input);

      expect(result.session.id).toBe('test-session-123');
      expect(result.session.exercises).toHaveLength(1);
      expect(result.session.durationSeconds).toBe(3600);
    });

    it('updates state with new XP values', () => {
      const state = createInitialState();
      const initialChestXp = state.stats.skillXp.chest;

      const input: WorkoutSessionInput = {
        exercises: [
          {
            exerciseId: 'bench_press',
            sets: [
              { exerciseId: 'bench_press', reps: 10, weightKg: 80 },
            ],
          },
        ],
      };

      const result = completeWorkout(state, input);

      expect(result.newState.stats.skillXp.chest).toBeGreaterThan(initialChestXp);
    });

    it('does not double-count XP on event replay', () => {
      const state = createInitialState();
      const input: WorkoutSessionInput = {
        exercises: [
          {
            exerciseId: 'deadlift',
            sets: [
              { exerciseId: 'deadlift', reps: 5, weightKg: 140 },
            ],
          },
        ],
      };

      const result1 = completeWorkout(state, input);

      // Replay: apply same events to initial state
      let replayState = state;
      for (const event of result1.xpEvents) {
        const currentXp = replayState.stats.skillXp[event.skillId] || 0;
        replayState = {
          ...replayState,
          stats: {
            ...replayState.stats,
            skillXp: {
              ...replayState.stats.skillXp,
              [event.skillId]: currentXp + event.amount,
            },
          },
        };
      }

      // XP should be equal between original completion and replay
      expect(replayState.stats.skillXp.back_erector).toBe(
        result1.newState.stats.skillXp.back_erector
      );
    });

    it('handles multiple exercises in one workout', () => {
      const state = createInitialState();
      const input: WorkoutSessionInput = {
        exercises: [
          {
            exerciseId: 'bench_press',
            sets: [{ exerciseId: 'bench_press', reps: 10, weightKg: 60 }],
          },
          {
            exerciseId: 'squat',
            sets: [{ exerciseId: 'squat', reps: 8, weightKg: 80 }],
          },
          {
            exerciseId: 'deadlift',
            sets: [{ exerciseId: 'deadlift', reps: 5, weightKg: 100 }],
          },
        ],
      };

      const result = completeWorkout(state, input);

      // Should have XP for chest, quads, and back_erector
      expect(result.newState.stats.skillXp.chest).toBeGreaterThan(0);
      expect(result.newState.stats.skillXp.quads).toBeGreaterThan(0);
      expect(result.newState.stats.skillXp.back_erector).toBeGreaterThan(0);
    });
  });

  describe('completeSet', () => {
    it('awards XP for a single set', () => {
      const state = createInitialState();
      const setInput: SetInput = {
        exerciseId: 'bench_press',
        reps: 10,
        weightKg: 60,
      };

      const result = completeSet(state, 'bench_press', setInput, []);

      expect(result.xpEarned).toBeGreaterThan(0);
      expect(result.newState.stats.skillXp.chest).toBeGreaterThan(0);
    });

    it('includes spillover XP', () => {
      const state = createInitialState();
      const setInput: SetInput = {
        exerciseId: 'squat', // Has spillover to glutes, hams, core, back_erector
        reps: 10,
        weightKg: 100,
      };

      const result = completeSet(state, 'squat', setInput, []);

      expect(result.spillover.length).toBeGreaterThan(0);
      expect(result.spillover.find(s => s.skillId === 'glutes')).toBeDefined();
    });

    it('creates a log entry', () => {
      const state = createInitialState();
      const setInput: SetInput = {
        exerciseId: 'dumbbell_curl',
        reps: 12,
        weightKg: 14,
      };

      const result = completeSet(state, 'dumbbell_curl', setInput, []);

      expect(result.logEntry.exerciseId).toBe('dumbbell_curl');
      expect(result.logEntry.reps).toBe(12);
      expect(result.logEntry.weight).toBe(14);
      expect(result.logEntry.xpAwarded).toBe(result.xpEarned);
    });

    it('considers recent sets for diminishing returns', () => {
      const state = createInitialState();
      const setInput: SetInput = {
        exerciseId: 'bench_press',
        reps: 10,
        weightKg: 60,
      };

      // First set
      const result1 = completeSet(state, 'bench_press', setInput, []);

      // Second set with recent sets
      const recentSets: RecentSet[] = [
        { exerciseId: 'bench_press', weight: 60, reps: 10, timestamp: Date.now() },
        { exerciseId: 'bench_press', weight: 60, reps: 10, timestamp: Date.now() },
      ];

      const result2 = completeSet(result1.newState, 'bench_press', setInput, recentSets);

      // Second set should have less XP due to diminishing returns
      expect(result2.xpEarned).toBeLessThanOrEqual(result1.xpEarned);
    });
  });

  describe('undoLogEntry', () => {
    it('subtracts XP from primary skill', () => {
      const state = createInitialState();
      const setInput: SetInput = {
        exerciseId: 'bench_press',
        reps: 10,
        weightKg: 60,
      };

      const { newState, logEntry } = completeSet(state, 'bench_press', setInput, []);
      const afterXp = newState.stats.skillXp.chest;

      const undoneState = undoLogEntry(newState, logEntry);

      expect(undoneState.stats.skillXp.chest).toBe(afterXp - logEntry.xpAwarded);
    });

    it('subtracts spillover XP', () => {
      const state = createInitialState();
      const setInput: SetInput = {
        exerciseId: 'bench_press',
        reps: 10,
        weightKg: 80,
      };

      const { newState, logEntry } = completeSet(state, 'bench_press', setInput, []);

      // Get triceps XP after set
      const afterTricepsXp = newState.stats.skillXp.triceps;

      const undoneState = undoLogEntry(newState, logEntry);

      // Spillover XP should be subtracted
      const spilloverXp = logEntry.spillover?.find(s => s.skillId === 'triceps')?.xp || 0;
      expect(undoneState.stats.skillXp.triceps).toBe(afterTricepsXp - spilloverXp);
    });

    it('does not go below 0 XP', () => {
      const state = createInitialState();

      // Create a log entry with more XP than the skill has
      const logEntry: LogEntry = {
        id: 'test',
        timestamp: Date.now(),
        skillId: 'chest',
        exerciseId: 'bench_press',
        weight: 60,
        reps: 10,
        xpAwarded: 1000, // More than initial 0
      };

      const undoneState = undoLogEntry(state, logEntry);

      expect(undoneState.stats.skillXp.chest).toBe(0);
    });
  });
});
