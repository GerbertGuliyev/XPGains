/**
 * XPGains Core Types
 * All type definitions for the domain model
 */

// ============================================
// SKILL TYPES
// ============================================

export type SkillId =
  | 'chest'
  | 'back_lats'
  | 'back_erector'
  | 'traps'
  | 'neck'
  | 'delts'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'core'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'calves';

export type BodyRegion = 'upper' | 'lower';

export interface Skill {
  id: SkillId;
  name: string;
  icon: string;
  bodyRegion: BodyRegion;
}

// ============================================
// EQUIPMENT TYPES
// ============================================

export type EquipmentId =
  | 'bench'
  | 'dumbbells'
  | 'barbell'
  | 'cable'
  | 'pullup_bar'
  | 'squat_rack'
  | 'machines'
  | 'bands'
  | 'bodyweight';

export interface EquipmentType {
  id: EquipmentId;
  name: string;
}

// ============================================
// EXERCISE TYPES
// ============================================

export type ExerciseType = 'compound' | 'isolation';

export interface WeightConfig {
  min: number;
  max: number;
  step: number;
  default: number;
}

export interface Exercise {
  id: string;
  skillId: SkillId;
  subcategoryIds: string[];
  name: string;
  type: ExerciseType;
  weight: WeightConfig;
  referenceWeight: number;
  requiredEquipment: EquipmentId[];
}

export interface Subcategory {
  id: string;
  skillId: SkillId;
  name: string;
}

// ============================================
// CUSTOM EXERCISE TYPES
// ============================================

export type CustomExerciseType = 'compound' | 'isolation' | 'bodyweight';
export type XpMode = 'standard' | 'custom';

export interface CustomExercise {
  id: string;
  name: string;
  skillId: SkillId;
  type: CustomExerciseType;
  weight: WeightConfig;
  referenceWeight: number;
  xpMode: XpMode;
  customXpPerSet?: number;
  isCustom: true;
}

// ============================================
// SPILLOVER TYPES
// ============================================

export type SpilloverMapping = Partial<Record<SkillId, number>>;
export type ExerciseSpilloverMap = Record<string, SpilloverMapping>;

// ============================================
// XP CONFIG TYPES
// ============================================

export interface XpConfig {
  maxLevel: number;
  base: number;
  growthRate: number;
  exerciseBaseXp: {
    compound: number;
    isolation: number;
  };
  diminishingMultipliers: number[];
  neglectedDays: number;
  neglectedBonus: number;
}

// ============================================
// GAME STATE TYPES
// ============================================

export interface GameState {
  schemaVersion: number;

  profile: {
    localUserId: string;
    displayName?: string;
    createdAt: string;
  };

  body?: {
    heightCm?: number;
    weightKg?: number;
    bodyFatPercent?: number;
    age?: number;
    sex?: 'male' | 'female' | 'other';
  };

  stats: {
    skillXp: Record<SkillId, number>;
  };

  progress: {
    activeProgramId?: string;
    currentDay?: number;
    streakCount?: number;
    lastWorkoutAt?: string;
  };

  history: {
    workoutSessions: WorkoutSession[];
    xpEvents: XpEvent[];
  };

  settings: UserSettings;

  favorites: Record<string, boolean>;

  customExercises: CustomExercise[];

  trainingPlans: TrainingPlan[];

  equipment: {
    enabled: boolean;
    available: EquipmentId[];
  };

  challenge?: Challenge | null;

  meta: {
    lastModifiedAt: string;
    lastSyncAt?: string;
    pendingSync: boolean;
  };
}

export interface UserSettings {
  unit: 'kg' | 'lbs';
  theme: 'classic' | 'mithril';
  language: string;
}

// ============================================
// WORKOUT TYPES
// ============================================

export interface WorkoutSession {
  id: string;
  completedAt: string;
  programId?: string;
  workoutId?: string;
  exercises: WorkoutExercise[];
  totalXpEarned: number;
  durationSeconds?: number;
}

export interface WorkoutExercise {
  exerciseId: string;
  skillId: SkillId;
  sets: WorkoutSet[];
}

export interface WorkoutSet {
  reps: number;
  weightKg: number;
  xpEarned: number;
  spillover?: SpilloverXp[];
}

export interface SpilloverXp {
  skillId: SkillId;
  xp: number;
}

// ============================================
// XP EVENT TYPES
// ============================================

export type XpEventType = 'workout' | 'spillover' | 'bonus' | 'manual';

export interface XpEvent {
  id: string;
  clientEventId: string;
  sourceSessionId: string;
  skillId: SkillId;
  type: XpEventType;
  amount: number;
  createdAt: string;
  meta?: Record<string, unknown>;
}

// ============================================
// TRAINING PLAN TYPES
// ============================================

export interface TrainingPlan {
  id: string;
  name: string;
  items: PlanItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PlanItem {
  skillId: SkillId;
  exerciseId: string;
  targetSets?: number;
  targetReps?: number;
  targetWeightKg?: number;
}

// ============================================
// CHALLENGE TYPES
// ============================================

export type ChallengeType = 'short' | 'regular' | 'ironman';
export type ChallengeFocus = 'full' | 'upper' | 'lower';

export interface Challenge {
  id: string;
  type: ChallengeType;
  focus: ChallengeFocus;
  skills: ChallengeSkill[];
  startedAt: string;
  completed: boolean;
  completedAt?: string;
}

export interface ChallengeSkill {
  skillId: SkillId;
  exercises: ChallengeExercise[];
}

export interface ChallengeExercise {
  exerciseId: string;
  targetSets: number;
  completedSets: number;
}

// ============================================
// RECENT SET TRACKING (for diminishing returns)
// ============================================

export interface RecentSet {
  exerciseId: string;
  weight: number;
  reps: number;
  timestamp: number;
}

// ============================================
// LOG ENTRY (for UI display)
// ============================================

export interface LogEntry {
  id: string;
  timestamp: number;
  skillId: SkillId;
  subcategoryId?: string;
  exerciseId: string;
  weight: number;
  reps: number;
  xpAwarded: number;
  spillover?: SpilloverXp[];
}

// ============================================
// PERSISTENCE TYPES
// ============================================

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  getAllKeys(): Promise<string[]>;
}

// ============================================
// SYNC TYPES
// ============================================

export interface SyncResult {
  success: boolean;
  error?: string;
  conflictsResolved?: number;
  itemsPushed?: number;
  itemsPulled?: number;
}

export interface PendingChanges {
  sessions: WorkoutSession[];
  xpEvents: XpEvent[];
  settings?: UserSettings;
  customExercises?: CustomExercise[];
  trainingPlans?: TrainingPlan[];
  favorites?: Record<string, boolean>;
}

// ============================================
// INPUT TYPES (for domain functions)
// ============================================

export interface SetInput {
  exerciseId: string;
  reps: number;
  weightKg: number;
}

export interface WorkoutSessionInput {
  id?: string;
  programId?: string;
  workoutId?: string;
  exercises: WorkoutExerciseInput[];
  durationSeconds?: number;
}

export interface WorkoutExerciseInput {
  exerciseId: string;
  sets: SetInput[];
}

export interface XpCalculationParams {
  reps: number;
  weightKg: number;
  exerciseId: string;
  skillLevel: number;
  recentSets: RecentSet[];
  isNeglected: boolean;
}
