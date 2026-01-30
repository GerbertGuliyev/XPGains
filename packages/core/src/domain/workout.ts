/**
 * XPGains Workout Completion Logic
 * Handles the complete flow of finishing a workout and awarding XP
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  GameState,
  WorkoutSession,
  WorkoutExercise,
  WorkoutSet,
  XpEvent,
  SpilloverXp,
  WorkoutSessionInput,
  SetInput,
  RecentSet,
  LogEntry,
  SkillId,
} from '../types';
import { getExerciseById } from '../data';
import { levelFromXp } from './levels';
import { calculateXpForExercise, isSkillNeglected, getSpilloverXp } from './xp';
import { applyXpEvent, addWorkoutSession } from './state';

/**
 * Result of completing a workout
 */
export interface WorkoutResult {
  newState: GameState;
  session: WorkoutSession;
  xpEvents: XpEvent[];
  logEntries: LogEntry[];
}

/**
 * Complete a workout session
 * This is the main entry point for processing a finished workout
 *
 * @param state - Current game state
 * @param input - Workout session input data
 * @returns New state, session record, XP events, and log entries
 */
export function completeWorkout(
  state: GameState,
  input: WorkoutSessionInput
): WorkoutResult {
  const sessionId = input.id || uuidv4();
  const completedAt = new Date().toISOString();

  // Track recent sets for diminishing returns within this workout
  const sessionRecentSets: RecentSet[] = [];

  // Process each exercise
  const processedExercises: WorkoutExercise[] = [];
  const allXpEvents: XpEvent[] = [];
  const allLogEntries: LogEntry[] = [];
  let totalXpEarned = 0;

  // Convert existing log entries to a simpler format for neglect checking
  const existingLogEntries: LogEntry[] = state.history.xpEvents
    .filter(e => e.type === 'workout')
    .map(e => ({
      id: e.id,
      timestamp: new Date(e.createdAt).getTime(),
      skillId: e.skillId,
      exerciseId: e.sourceSessionId,
      weight: 0,
      reps: 0,
      xpAwarded: e.amount,
    }));

  for (const exerciseInput of input.exercises) {
    const exercise = getExerciseById(exerciseInput.exerciseId);
    if (!exercise) continue;

    const skillId = exercise.skillId as SkillId;
    const skillXp = state.stats.skillXp[skillId] || 0;
    const skillLevel = levelFromXp(skillXp);

    // Check if this muscle is neglected
    const neglected = isSkillNeglected(skillId, existingLogEntries);

    const processedSets: WorkoutSet[] = [];

    for (let setIndex = 0; setIndex < exerciseInput.sets.length; setIndex++) {
      const setInput = exerciseInput.sets[setIndex];

      // Calculate XP for this set
      const xpEarned = calculateXpForExercise(
        exercise,
        setInput.reps,
        setInput.weightKg,
        skillLevel,
        sessionRecentSets,
        neglected
      );

      // Calculate spillover XP
      const spillover = getSpilloverXp(exercise.id, xpEarned);
      const typedSpillover: SpilloverXp[] = spillover.map(s => ({
        skillId: s.skillId as SkillId,
        xp: s.xp,
      }));

      // Create XP event for primary muscle
      const primaryEventId = `${sessionId}_${exercise.id}_${setIndex}_primary`;
      const primaryEvent: XpEvent = {
        id: uuidv4(),
        clientEventId: primaryEventId,
        sourceSessionId: sessionId,
        skillId,
        type: 'workout',
        amount: xpEarned,
        createdAt: completedAt,
        meta: {
          exerciseId: exercise.id,
          reps: setInput.reps,
          weightKg: setInput.weightKg,
          setIndex,
        },
      };
      allXpEvents.push(primaryEvent);

      // Create XP events for spillover
      for (let spillIndex = 0; spillIndex < typedSpillover.length; spillIndex++) {
        const spill = typedSpillover[spillIndex];
        const spillEventId = `${sessionId}_${exercise.id}_${setIndex}_spill_${spillIndex}`;
        const spillEvent: XpEvent = {
          id: uuidv4(),
          clientEventId: spillEventId,
          sourceSessionId: sessionId,
          skillId: spill.skillId,
          type: 'spillover',
          amount: spill.xp,
          createdAt: completedAt,
          meta: {
            sourceExerciseId: exercise.id,
            sourceSkillId: skillId,
          },
        };
        allXpEvents.push(spillEvent);
      }

      // Create log entry
      const logEntry: LogEntry = {
        id: `${sessionId}_${exercise.id}_${setIndex}`,
        timestamp: Date.now(),
        skillId,
        exerciseId: exercise.id,
        weight: setInput.weightKg,
        reps: setInput.reps,
        xpAwarded: xpEarned,
        spillover: typedSpillover.length > 0 ? typedSpillover : undefined,
      };
      allLogEntries.push(logEntry);

      // Track for diminishing returns
      sessionRecentSets.push({
        exerciseId: exercise.id,
        weight: setInput.weightKg,
        reps: setInput.reps,
        timestamp: Date.now(),
      });

      // Calculate total XP including spillover
      let setTotalXp = xpEarned;
      for (const spill of typedSpillover) {
        setTotalXp += spill.xp;
      }
      totalXpEarned += setTotalXp;

      processedSets.push({
        reps: setInput.reps,
        weightKg: setInput.weightKg,
        xpEarned,
        spillover: typedSpillover.length > 0 ? typedSpillover : undefined,
      });
    }

    processedExercises.push({
      exerciseId: exercise.id,
      skillId,
      sets: processedSets,
    });
  }

  // Create workout session record
  const session: WorkoutSession = {
    id: sessionId,
    completedAt,
    programId: input.programId,
    workoutId: input.workoutId,
    exercises: processedExercises,
    totalXpEarned,
    durationSeconds: input.durationSeconds,
  };

  // Apply all XP events to state
  let newState = state;
  for (const event of allXpEvents) {
    newState = applyXpEvent(newState, event);
  }

  // Add session to state
  newState = addWorkoutSession(newState, session);

  return {
    newState,
    session,
    xpEvents: allXpEvents,
    logEntries: allLogEntries,
  };
}

/**
 * Complete a single set (for real-time XP tracking)
 * This is used when logging sets one at a time during a workout
 */
export function completeSet(
  state: GameState,
  exerciseId: string,
  set: SetInput,
  recentSets: RecentSet[]
): {
  newState: GameState;
  xpEvents: XpEvent[];
  xpEarned: number;
  spillover: SpilloverXp[];
  logEntry: LogEntry;
} {
  const exercise = getExerciseById(exerciseId);
  if (!exercise) {
    throw new Error(`Exercise not found: ${exerciseId}`);
  }

  const skillId = exercise.skillId as SkillId;
  const skillXp = state.stats.skillXp[skillId] || 0;
  const skillLevel = levelFromXp(skillXp);

  // Build log entries for neglect checking
  const existingLogEntries: LogEntry[] = state.history.xpEvents
    .filter(e => e.type === 'workout')
    .map(e => ({
      id: e.id,
      timestamp: new Date(e.createdAt).getTime(),
      skillId: e.skillId,
      exerciseId: '',
      weight: 0,
      reps: 0,
      xpAwarded: e.amount,
    }));

  const neglected = isSkillNeglected(skillId, existingLogEntries);

  // Calculate XP
  const xpEarned = calculateXpForExercise(
    exercise,
    set.reps,
    set.weightKg,
    skillLevel,
    recentSets,
    neglected
  );

  // Calculate spillover
  const spillover = getSpilloverXp(exercise.id, xpEarned);
  const typedSpillover: SpilloverXp[] = spillover.map(s => ({
    skillId: s.skillId as SkillId,
    xp: s.xp,
  }));

  // Generate IDs
  const eventId = uuidv4();
  const sessionId = `single_${Date.now()}`;
  const completedAt = new Date().toISOString();

  // Create XP events
  const xpEvents: XpEvent[] = [];

  const primaryEvent: XpEvent = {
    id: eventId,
    clientEventId: `${sessionId}_${exerciseId}_primary`,
    sourceSessionId: sessionId,
    skillId,
    type: 'workout',
    amount: xpEarned,
    createdAt: completedAt,
    meta: {
      exerciseId,
      reps: set.reps,
      weightKg: set.weightKg,
    },
  };
  xpEvents.push(primaryEvent);

  // Spillover events
  for (let i = 0; i < typedSpillover.length; i++) {
    const spill = typedSpillover[i];
    xpEvents.push({
      id: uuidv4(),
      clientEventId: `${sessionId}_${exerciseId}_spill_${i}`,
      sourceSessionId: sessionId,
      skillId: spill.skillId,
      type: 'spillover',
      amount: spill.xp,
      createdAt: completedAt,
      meta: {
        sourceExerciseId: exerciseId,
        sourceSkillId: skillId,
      },
    });
  }

  // Create log entry
  const logEntry: LogEntry = {
    id: eventId,
    timestamp: Date.now(),
    skillId,
    exerciseId,
    weight: set.weightKg,
    reps: set.reps,
    xpAwarded: xpEarned,
    spillover: typedSpillover.length > 0 ? typedSpillover : undefined,
  };

  // Apply XP events to state
  let newState = state;
  for (const event of xpEvents) {
    newState = applyXpEvent(newState, event);
  }

  return {
    newState,
    xpEvents,
    xpEarned,
    spillover: typedSpillover,
    logEntry,
  };
}

/**
 * Undo a log entry (reverse XP)
 */
export function undoLogEntry(
  state: GameState,
  logEntry: LogEntry
): GameState {
  const skillXp = { ...state.stats.skillXp };

  // Subtract primary XP
  skillXp[logEntry.skillId] = Math.max(
    0,
    (skillXp[logEntry.skillId] || 0) - logEntry.xpAwarded
  );

  // Subtract spillover XP
  if (logEntry.spillover) {
    for (const spill of logEntry.spillover) {
      skillXp[spill.skillId] = Math.max(
        0,
        (skillXp[spill.skillId] || 0) - spill.xp
      );
    }
  }

  return {
    ...state,
    stats: {
      ...state.stats,
      skillXp,
    },
    meta: {
      ...state.meta,
      lastModifiedAt: new Date().toISOString(),
      pendingSync: true,
    },
  };
}
