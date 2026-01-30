/**
 * @xpgains/core
 * Domain logic, state management, and data for XPGains
 *
 * This package contains all game rules and logic, UI-agnostic.
 * The mobile app consumes this as a dependency.
 */

// ============================================
// TYPE EXPORTS
// ============================================
export type {
  // Skills
  SkillId,
  BodyRegion,
  Skill,

  // Equipment
  EquipmentId,
  EquipmentType,

  // Exercises
  ExerciseType,
  WeightConfig,
  Exercise,
  Subcategory,
  CustomExercise,
  CustomExerciseType,
  XpMode,

  // Spillover
  SpilloverMapping,
  ExerciseSpilloverMap,

  // XP Config
  XpConfig,

  // Game State
  GameState,
  UserSettings,

  // Workouts
  WorkoutSession,
  WorkoutExercise,
  WorkoutSet,
  SpilloverXp,

  // XP Events
  XpEventType,
  XpEvent,

  // Training Plans
  TrainingPlan,
  PlanItem,

  // Challenges
  ChallengeType,
  ChallengeFocus,
  Challenge,
  ChallengeSkill,
  ChallengeExercise,

  // Recent Sets
  RecentSet,

  // Log Entry
  LogEntry,

  // Persistence
  StorageAdapter,

  // Sync
  SyncResult,
  PendingChanges,

  // Inputs
  SetInput,
  WorkoutSessionInput,
  WorkoutExerciseInput,
  XpCalculationParams,
} from './types';

// ============================================
// DATA EXPORTS
// ============================================
export {
  // Skills
  SKILLS,
  SKILL_IDS,
  getSkillById,
  getSkillsByRegion,
  isValidSkillId,
  getRandomSkills,
  createInitialSkillXp,

  // Equipment
  EQUIPMENT_TYPES,
  EQUIPMENT_IDS,
  getEquipmentById,
  isValidEquipmentId,

  // Subcategories
  SUBCATEGORIES,
  getSubcategoryById,
  getSubcategoriesBySkill,

  // Exercises
  EXERCISES,
  getExerciseById,
  getExercisesBySkill,
  getExercisesBySubcategory,
  filterExercisesByEquipment,
  getRandomExercises,

  // XP Configuration
  XP_CONFIG,
  XP_TABLE,
  XP_FACTORS,
  getMaxXp,

  // Spillover
  EXERCISE_SPILLOVER,
  getExerciseSpillover,
  hasSpillover,
  calculateSpilloverXp,
} from './data';

// ============================================
// DOMAIN EXPORTS
// ============================================
export {
  // Level functions
  xpForLevel,
  xpToNextLevel,
  levelFromXp,
  progressToNextLevel,
  getTotalLevel,
  didLevelUp,
  getNewLevelIfLevelUp,
  isMaxLevel,
  xpToMaxLevel,

  // XP calculation
  calculateXpGain,
  calculateXpForExercise,
  isSkillNeglected,
  getSpilloverXp,
  calculateSessionTotalXp,

  // State management
  CURRENT_SCHEMA_VERSION,
  createInitialState,
  applyXpEvent,
  applyXpEvents,
  addWorkoutSession,
  updateSettings,
  toggleFavorite,
  addCustomExercise,
  removeCustomExercise,
  addTrainingPlan,
  updateTrainingPlan,
  removeTrainingPlan,
  setChallenge,
  updateEquipment,
  updateBody,
  updateProfile,
  markSynced,
  hasProgress,
  calibrateSkills,
  resetProgress,

  // Workout completion
  completeWorkout,
  completeSet,
  undoLogEntry,
  type WorkoutResult,

  // Challenge system
  generateChallenge,
  updateChallengeProgress,
  isExerciseInChallenge,
  getChallengeProgress,
  getRemainingExercises,

  // Utilities
  kgToLbs,
  lbsToKg,
  formatWeight,
  parseWeightToKg,
  clamp,
  randomInt,
  formatDate,
  formatDuration,
  groupBy,
  startOfDay,
  isSameDay,
  getXpBarColor,
} from './domain';

// ============================================
// PERSISTENCE EXPORTS
// ============================================
export {
  InMemoryStorageAdapter,
  StateStorage,
  migrateState,
  needsMigration,
} from './persistence';
