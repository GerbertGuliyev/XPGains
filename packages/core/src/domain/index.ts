/**
 * XPGains Domain Module Exports
 * Core game logic and state management
 */

// Level functions
export {
  xpForLevel,
  xpToNextLevel,
  levelFromXp,
  progressToNextLevel,
  getTotalLevel,
  didLevelUp,
  getNewLevelIfLevelUp,
  isMaxLevel,
  xpToMaxLevel,
} from './levels';

// XP calculation
export {
  calculateXpGain,
  calculateXpForExercise,
  isSkillNeglected,
  getSpilloverXp,
  calculateSessionTotalXp,
} from './xp';

// State management
export {
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
} from './state';

// Workout completion
export {
  completeWorkout,
  completeSet,
  undoLogEntry,
  type WorkoutResult,
} from './workout';

// Challenge system
export {
  generateChallenge,
  updateChallengeProgress,
  isExerciseInChallenge,
  getChallengeProgress,
  getRemainingExercises,
} from './challenges';

// Utilities
export {
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
} from './utils';
