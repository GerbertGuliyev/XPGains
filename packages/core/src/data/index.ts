/**
 * XPGains Data Module Exports
 * All static data for the game
 */

// Skills
export {
  SKILLS,
  SKILL_IDS,
  getSkillById,
  getSkillsByRegion,
  isValidSkillId,
  getRandomSkills,
  createInitialSkillXp,
} from './skills';

// Equipment
export {
  EQUIPMENT_TYPES,
  EQUIPMENT_IDS,
  getEquipmentById,
  isValidEquipmentId,
} from './equipment';

// Subcategories
export {
  SUBCATEGORIES,
  getSubcategoryById,
  getSubcategoriesBySkill,
} from './subcategories';

// Exercises
export {
  EXERCISES,
  getExerciseById,
  getExercisesBySkill,
  getExercisesBySubcategory,
  filterExercisesByEquipment,
  getRandomExercises,
} from './exercises';

// XP Configuration
export {
  XP_CONFIG,
  XP_TABLE,
  XP_FACTORS,
  getMaxXp,
} from './xpConfig';

// Spillover
export {
  EXERCISE_SPILLOVER,
  getExerciseSpillover,
  hasSpillover,
  calculateSpilloverXp,
} from './spillover';
