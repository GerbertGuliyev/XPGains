/**
 * XPGains Game State Management
 * Single source of truth for the application state
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  GameState,
  SkillId,
  XpEvent,
  WorkoutSession,
  UserSettings,
  CustomExercise,
  TrainingPlan,
  Challenge,
  EquipmentId,
} from '../types';
import { createInitialSkillXp, SKILL_IDS, XP_TABLE } from '../data';
import { levelFromXp } from './levels';

/**
 * Current schema version for state migrations
 */
export const CURRENT_SCHEMA_VERSION = 1;

/**
 * Create a new initial game state
 */
export function createInitialState(localUserId?: string): GameState {
  const now = new Date().toISOString();

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,

    profile: {
      localUserId: localUserId || uuidv4(),
      createdAt: now,
    },

    stats: {
      skillXp: createInitialSkillXp(),
    },

    progress: {
      streakCount: 0,
    },

    history: {
      workoutSessions: [],
      xpEvents: [],
    },

    settings: {
      unit: 'kg',
      theme: 'classic',
      language: 'en',
    },

    favorites: {},

    customExercises: [],

    trainingPlans: [],

    equipment: {
      enabled: false,
      available: [],
    },

    meta: {
      lastModifiedAt: now,
      pendingSync: false,
    },
  };
}

/**
 * Apply an XP event to the state
 * This is the core mutation function for XP changes
 */
export function applyXpEvent(state: GameState, event: XpEvent): GameState {
  const skillXp = { ...state.stats.skillXp };
  const currentXp = skillXp[event.skillId] || 0;
  skillXp[event.skillId] = currentXp + event.amount;

  // Add event to history if not already present
  const existingEvent = state.history.xpEvents.find(
    e => e.clientEventId === event.clientEventId
  );

  const xpEvents = existingEvent
    ? state.history.xpEvents
    : [...state.history.xpEvents, event];

  return {
    ...state,
    stats: {
      ...state.stats,
      skillXp,
    },
    history: {
      ...state.history,
      xpEvents,
    },
    meta: {
      ...state.meta,
      lastModifiedAt: new Date().toISOString(),
      pendingSync: true,
    },
  };
}

/**
 * Apply multiple XP events to the state
 */
export function applyXpEvents(state: GameState, events: XpEvent[]): GameState {
  return events.reduce((s, event) => applyXpEvent(s, event), state);
}

/**
 * Add a workout session to the state
 */
export function addWorkoutSession(
  state: GameState,
  session: WorkoutSession
): GameState {
  // Check if session already exists (idempotency)
  const existingSession = state.history.workoutSessions.find(
    s => s.id === session.id
  );

  if (existingSession) {
    return state;
  }

  return {
    ...state,
    history: {
      ...state.history,
      workoutSessions: [...state.history.workoutSessions, session],
    },
    progress: {
      ...state.progress,
      lastWorkoutAt: session.completedAt,
    },
    meta: {
      ...state.meta,
      lastModifiedAt: new Date().toISOString(),
      pendingSync: true,
    },
  };
}

/**
 * Update user settings
 */
export function updateSettings(
  state: GameState,
  settings: Partial<UserSettings>
): GameState {
  return {
    ...state,
    settings: {
      ...state.settings,
      ...settings,
    },
    meta: {
      ...state.meta,
      lastModifiedAt: new Date().toISOString(),
      pendingSync: true,
    },
  };
}

/**
 * Toggle a favorite exercise
 */
export function toggleFavorite(
  state: GameState,
  exerciseId: string
): GameState {
  const favorites = { ...state.favorites };

  if (favorites[exerciseId]) {
    delete favorites[exerciseId];
  } else {
    favorites[exerciseId] = true;
  }

  return {
    ...state,
    favorites,
    meta: {
      ...state.meta,
      lastModifiedAt: new Date().toISOString(),
      pendingSync: true,
    },
  };
}

/**
 * Add a custom exercise
 */
export function addCustomExercise(
  state: GameState,
  exercise: CustomExercise
): GameState {
  // Check if exercise already exists
  const existing = state.customExercises.find(e => e.id === exercise.id);
  if (existing) {
    return state;
  }

  return {
    ...state,
    customExercises: [...state.customExercises, exercise],
    meta: {
      ...state.meta,
      lastModifiedAt: new Date().toISOString(),
      pendingSync: true,
    },
  };
}

/**
 * Remove a custom exercise
 */
export function removeCustomExercise(
  state: GameState,
  exerciseId: string
): GameState {
  return {
    ...state,
    customExercises: state.customExercises.filter(e => e.id !== exerciseId),
    meta: {
      ...state.meta,
      lastModifiedAt: new Date().toISOString(),
      pendingSync: true,
    },
  };
}

/**
 * Add a training plan
 */
export function addTrainingPlan(
  state: GameState,
  plan: TrainingPlan
): GameState {
  const existing = state.trainingPlans.find(p => p.id === plan.id);
  if (existing) {
    return updateTrainingPlan(state, plan);
  }

  return {
    ...state,
    trainingPlans: [...state.trainingPlans, plan],
    meta: {
      ...state.meta,
      lastModifiedAt: new Date().toISOString(),
      pendingSync: true,
    },
  };
}

/**
 * Update a training plan
 */
export function updateTrainingPlan(
  state: GameState,
  plan: TrainingPlan
): GameState {
  return {
    ...state,
    trainingPlans: state.trainingPlans.map(p =>
      p.id === plan.id ? plan : p
    ),
    meta: {
      ...state.meta,
      lastModifiedAt: new Date().toISOString(),
      pendingSync: true,
    },
  };
}

/**
 * Remove a training plan
 */
export function removeTrainingPlan(
  state: GameState,
  planId: string
): GameState {
  return {
    ...state,
    trainingPlans: state.trainingPlans.filter(p => p.id !== planId),
    meta: {
      ...state.meta,
      lastModifiedAt: new Date().toISOString(),
      pendingSync: true,
    },
  };
}

/**
 * Set active challenge
 */
export function setChallenge(
  state: GameState,
  challenge: Challenge | null
): GameState {
  return {
    ...state,
    challenge,
    meta: {
      ...state.meta,
      lastModifiedAt: new Date().toISOString(),
      pendingSync: true,
    },
  };
}

/**
 * Update equipment settings
 */
export function updateEquipment(
  state: GameState,
  enabled: boolean,
  available: EquipmentId[]
): GameState {
  return {
    ...state,
    equipment: {
      enabled,
      available,
    },
    meta: {
      ...state.meta,
      lastModifiedAt: new Date().toISOString(),
      pendingSync: true,
    },
  };
}

/**
 * Update body metrics
 */
export function updateBody(
  state: GameState,
  body: Partial<NonNullable<GameState['body']>>
): GameState {
  return {
    ...state,
    body: {
      ...state.body,
      ...body,
    },
    meta: {
      ...state.meta,
      lastModifiedAt: new Date().toISOString(),
      pendingSync: true,
    },
  };
}

/**
 * Update profile
 */
export function updateProfile(
  state: GameState,
  displayName: string
): GameState {
  return {
    ...state,
    profile: {
      ...state.profile,
      displayName,
    },
    meta: {
      ...state.meta,
      lastModifiedAt: new Date().toISOString(),
      pendingSync: true,
    },
  };
}

/**
 * Mark state as synced
 */
export function markSynced(state: GameState): GameState {
  return {
    ...state,
    meta: {
      ...state.meta,
      lastSyncAt: new Date().toISOString(),
      pendingSync: false,
    },
  };
}

/**
 * Check if the state has any progress (not a fresh state)
 */
export function hasProgress(state: GameState): boolean {
  // Check if any skill has XP
  for (const skillId of SKILL_IDS) {
    if ((state.stats.skillXp[skillId] || 0) > 0) {
      return true;
    }
  }

  // Check if there are any workout sessions
  if (state.history.workoutSessions.length > 0) {
    return true;
  }

  // Check if there are any XP events
  if (state.history.xpEvents.length > 0) {
    return true;
  }

  return false;
}

/**
 * Calibrate skill levels (for migration from another tracker)
 * Calculates XP needed for each target level and sets it
 */
export function calibrateSkills(
  state: GameState,
  skillLevels: Partial<Record<SkillId, number>>
): GameState {
  const skillXp = { ...state.stats.skillXp };

  for (const [skillId, targetLevel] of Object.entries(skillLevels)) {
    if (targetLevel && targetLevel >= 1 && targetLevel <= 99) {
      // Calculate XP needed for this level using the pre-computed XP table
      skillXp[skillId as SkillId] = XP_TABLE[targetLevel] || 0;
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

/**
 * Reset all progress (with confirmation)
 */
export function resetProgress(state: GameState): GameState {
  return {
    ...createInitialState(state.profile.localUserId),
    settings: state.settings, // Preserve settings
    equipment: state.equipment, // Preserve equipment settings
  };
}
