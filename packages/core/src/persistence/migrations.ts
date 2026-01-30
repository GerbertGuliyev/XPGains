/**
 * XPGains State Migrations
 * Handles schema version upgrades for persisted state
 */

import type { GameState, SkillId } from '../types';
import { CURRENT_SCHEMA_VERSION, createInitialState } from '../domain';
import { createInitialSkillXp, SKILL_IDS } from '../data';

/**
 * Migration function type
 */
type MigrationFn = (state: unknown) => unknown;

/**
 * Migration registry
 * Maps from version N to migration function that upgrades to N+1
 */
const MIGRATIONS: Record<number, MigrationFn> = {
  // Example migration from v0 (legacy) to v1
  0: migrateV0ToV1,
};

/**
 * Migrate state from any version to current version
 */
export function migrateState(state: unknown): GameState {
  let currentState = state as Record<string, unknown>;
  let version = getSchemaVersion(currentState);

  // Apply migrations sequentially
  while (version < CURRENT_SCHEMA_VERSION) {
    const migration = MIGRATIONS[version];

    if (!migration) {
      console.warn(`No migration found for version ${version}, creating fresh state`);
      return createInitialState();
    }

    currentState = migration(currentState) as Record<string, unknown>;
    version = getSchemaVersion(currentState);
  }

  // Validate and ensure all required fields exist
  return validateAndNormalize(currentState as GameState);
}

/**
 * Get schema version from state
 */
function getSchemaVersion(state: Record<string, unknown>): number {
  if (typeof state.schemaVersion === 'number') {
    return state.schemaVersion;
  }

  // Legacy state without schema version
  if (state.skillXp || state.skill_xp) {
    return 0;
  }

  return CURRENT_SCHEMA_VERSION;
}

/**
 * Migrate from legacy format (v0) to structured format (v1)
 * Legacy format had flat localStorage keys like xpgains_skill_xp
 */
function migrateV0ToV1(state: unknown): Record<string, unknown> {
  const legacy = state as Record<string, unknown>;
  const now = new Date().toISOString();

  // Extract skill XP from legacy format
  let skillXp: Record<string, number> = {};

  if (legacy.skillXp && typeof legacy.skillXp === 'object') {
    skillXp = legacy.skillXp as Record<string, number>;
  } else if (legacy.skill_xp && typeof legacy.skill_xp === 'object') {
    skillXp = legacy.skill_xp as Record<string, number>;
  }

  // Ensure all skills have a value
  const normalizedSkillXp: Record<SkillId, number> = createInitialSkillXp();
  for (const skillId of SKILL_IDS) {
    if (typeof skillXp[skillId] === 'number') {
      normalizedSkillXp[skillId] = skillXp[skillId];
    }
  }

  // Extract settings
  const settings = (legacy.settings as Record<string, unknown>) || {};

  // Extract favorites
  let favorites: Record<string, boolean> = {};
  if (legacy.favorites && typeof legacy.favorites === 'object') {
    favorites = legacy.favorites as Record<string, boolean>;
  }

  // Extract custom exercises
  let customExercises: unknown[] = [];
  if (Array.isArray(legacy.customExercises)) {
    customExercises = legacy.customExercises;
  } else if (Array.isArray(legacy.custom_exercises)) {
    customExercises = legacy.custom_exercises;
  }

  // Extract training plans
  let trainingPlans: unknown[] = [];
  if (Array.isArray(legacy.trainingPlans)) {
    trainingPlans = legacy.trainingPlans;
  } else if (Array.isArray(legacy.training_plans)) {
    trainingPlans = legacy.training_plans;
  }

  // Extract equipment settings
  let equipmentEnabled = false;
  let equipmentAvailable: string[] = [];

  if (legacy.equipmentMode === '1' || legacy.equipment_mode === '1') {
    equipmentEnabled = true;
  }
  if (Array.isArray(legacy.equipment)) {
    equipmentAvailable = legacy.equipment as string[];
  }

  // Build v1 state
  return {
    schemaVersion: 1,

    profile: {
      localUserId: (legacy.localUserId as string) || crypto.randomUUID(),
      displayName: legacy.displayName as string | undefined,
      createdAt: (legacy.createdAt as string) || now,
    },

    stats: {
      skillXp: normalizedSkillXp,
    },

    progress: {
      streakCount: 0,
      lastWorkoutAt: legacy.lastWorkoutAt as string | undefined,
    },

    history: {
      workoutSessions: [],
      xpEvents: migrateLogEntriesToXpEvents(legacy.logEntries as unknown[]),
    },

    settings: {
      unit: (settings.unit as 'kg' | 'lbs') || 'kg',
      theme: (settings.theme as 'classic' | 'mithril') || 'classic',
      language: (settings.lang as string) || (legacy.lang as string) || 'en',
    },

    favorites,

    customExercises: customExercises.map(normalizeCustomExercise),

    trainingPlans: trainingPlans.map(normalizeTrainingPlan),

    equipment: {
      enabled: equipmentEnabled,
      available: equipmentAvailable as SkillId[],
    },

    meta: {
      lastModifiedAt: now,
      pendingSync: true,
    },
  };
}

/**
 * Convert legacy log entries to XP events
 */
function migrateLogEntriesToXpEvents(
  logEntries: unknown[] | undefined
): unknown[] {
  if (!Array.isArray(logEntries)) {
    return [];
  }

  const events: unknown[] = [];

  for (const entry of logEntries) {
    const e = entry as Record<string, unknown>;

    if (!e.skillId || typeof e.xpAwarded !== 'number') {
      continue;
    }

    // Create primary XP event
    events.push({
      id: (e.id as string) || crypto.randomUUID(),
      clientEventId: `legacy_${e.id || Date.now()}`,
      sourceSessionId: 'legacy_import',
      skillId: e.skillId,
      type: 'workout',
      amount: e.xpAwarded,
      createdAt: new Date(e.timestamp as number || Date.now()).toISOString(),
      meta: {
        exerciseId: e.exerciseId,
        reps: e.reps,
        weightKg: e.weight,
      },
    });

    // Create spillover XP events
    const spillover = e.spillover as Array<{ skillId: string; xp: number }> | undefined;
    if (Array.isArray(spillover)) {
      for (const spill of spillover) {
        events.push({
          id: crypto.randomUUID(),
          clientEventId: `legacy_${e.id}_spill_${spill.skillId}`,
          sourceSessionId: 'legacy_import',
          skillId: spill.skillId,
          type: 'spillover',
          amount: spill.xp,
          createdAt: new Date(e.timestamp as number || Date.now()).toISOString(),
        });
      }
    }
  }

  return events;
}

/**
 * Normalize a custom exercise from legacy format
 */
function normalizeCustomExercise(exercise: unknown): unknown {
  const e = exercise as Record<string, unknown>;

  return {
    id: (e.id as string) || `custom_${Date.now()}`,
    name: e.name || 'Custom Exercise',
    skillId: e.skillId || e.muscleId || 'chest',
    type: e.type || 'isolation',
    weight: e.weight || { min: 0, max: 100, step: 2.5, default: 20 },
    referenceWeight: e.referenceWeight || 0,
    xpMode: e.xpMode || 'standard',
    customXpPerSet: e.customXpPerSet,
    isCustom: true,
  };
}

/**
 * Normalize a training plan from legacy format
 */
function normalizeTrainingPlan(plan: unknown): unknown {
  const p = plan as Record<string, unknown>;
  const now = new Date().toISOString();

  return {
    id: (p.id as string) || crypto.randomUUID(),
    name: p.name || 'Unnamed Plan',
    items: Array.isArray(p.items) ? p.items : [],
    createdAt: (p.createdAt as string) || now,
    updatedAt: (p.updatedAt as string) || now,
  };
}

/**
 * Validate and normalize a state object
 * Ensures all required fields exist with proper defaults
 */
function validateAndNormalize(state: GameState): GameState {
  const now = new Date().toISOString();

  // Ensure all required nested objects exist
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,

    profile: {
      localUserId: state.profile?.localUserId || crypto.randomUUID(),
      displayName: state.profile?.displayName,
      createdAt: state.profile?.createdAt || now,
    },

    body: state.body,

    stats: {
      skillXp: state.stats?.skillXp || createInitialSkillXp(),
    },

    progress: {
      activeProgramId: state.progress?.activeProgramId,
      currentDay: state.progress?.currentDay,
      streakCount: state.progress?.streakCount || 0,
      lastWorkoutAt: state.progress?.lastWorkoutAt,
    },

    history: {
      workoutSessions: state.history?.workoutSessions || [],
      xpEvents: state.history?.xpEvents || [],
    },

    settings: {
      unit: state.settings?.unit || 'kg',
      theme: state.settings?.theme || 'classic',
      language: state.settings?.language || 'en',
    },

    favorites: state.favorites || {},

    customExercises: state.customExercises || [],

    trainingPlans: state.trainingPlans || [],

    equipment: {
      enabled: state.equipment?.enabled || false,
      available: state.equipment?.available || [],
    },

    challenge: state.challenge,

    meta: {
      lastModifiedAt: state.meta?.lastModifiedAt || now,
      lastSyncAt: state.meta?.lastSyncAt,
      pendingSync: state.meta?.pendingSync ?? false,
    },
  };
}

/**
 * Check if state needs migration
 */
export function needsMigration(state: unknown): boolean {
  const s = state as Record<string, unknown>;
  return (
    typeof s.schemaVersion !== 'number' ||
    s.schemaVersion < CURRENT_SCHEMA_VERSION
  );
}
