/**
 * XPGains Subcategories
 * 30 subcategories for exercise grouping/filtering
 */

import type { Subcategory, SkillId } from '../types';

/**
 * All 30 exercise subcategories
 */
export const SUBCATEGORIES: readonly Subcategory[] = [
  // Chest (3)
  { id: 'chest_upper', skillId: 'chest', name: 'Upper Chest' },
  { id: 'chest_mid', skillId: 'chest', name: 'Mid Chest' },
  { id: 'chest_lower', skillId: 'chest', name: 'Lower Chest' },

  // Back - Lats (2)
  { id: 'lats_width', skillId: 'back_lats', name: 'Lat Width' },
  { id: 'lats_thickness', skillId: 'back_lats', name: 'Lat Thickness' },

  // Back - Erector (1)
  { id: 'erector_lower', skillId: 'back_erector', name: 'Lower Back' },

  // Traps (2)
  { id: 'traps_upper', skillId: 'traps', name: 'Upper Traps' },
  { id: 'traps_mid', skillId: 'traps', name: 'Mid Traps' },

  // Neck (2)
  { id: 'neck_front', skillId: 'neck', name: 'Neck Flexion' },
  { id: 'neck_back', skillId: 'neck', name: 'Neck Extension' },

  // Delts (3)
  { id: 'delts_front', skillId: 'delts', name: 'Front Delts' },
  { id: 'delts_side', skillId: 'delts', name: 'Side Delts' },
  { id: 'delts_rear', skillId: 'delts', name: 'Rear Delts' },

  // Biceps (2)
  { id: 'biceps_long', skillId: 'biceps', name: 'Long Head' },
  { id: 'biceps_short', skillId: 'biceps', name: 'Short Head' },

  // Triceps (3)
  { id: 'triceps_long', skillId: 'triceps', name: 'Long Head' },
  { id: 'triceps_lateral', skillId: 'triceps', name: 'Lateral Head' },
  { id: 'triceps_medial', skillId: 'triceps', name: 'Medial Head' },

  // Forearms (2)
  { id: 'forearms_flexors', skillId: 'forearms', name: 'Wrist Flexors' },
  { id: 'forearms_extensors', skillId: 'forearms', name: 'Wrist Extensors' },

  // Core (2)
  { id: 'core_abs', skillId: 'core', name: 'Abs' },
  { id: 'core_obliques', skillId: 'core', name: 'Obliques' },

  // Glutes (2)
  { id: 'glutes_max', skillId: 'glutes', name: 'Glute Max' },
  { id: 'glutes_med', skillId: 'glutes', name: 'Glute Med' },

  // Quads (2)
  { id: 'quads_vastus', skillId: 'quads', name: 'Vastus' },
  { id: 'quads_rectus', skillId: 'quads', name: 'Rectus Femoris' },

  // Hamstrings (2)
  { id: 'hams_bicep', skillId: 'hamstrings', name: 'Bicep Femoris' },
  { id: 'hams_semi', skillId: 'hamstrings', name: 'Semis' },

  // Calves (2)
  { id: 'calves_gastro', skillId: 'calves', name: 'Gastrocnemius' },
  { id: 'calves_soleus', skillId: 'calves', name: 'Soleus' },
] as const;

/**
 * Get subcategory by ID
 */
export function getSubcategoryById(id: string): Subcategory | undefined {
  return SUBCATEGORIES.find(sc => sc.id === id);
}

/**
 * Get subcategories for a skill
 */
export function getSubcategoriesBySkill(skillId: SkillId): Subcategory[] {
  return SUBCATEGORIES.filter(sc => sc.skillId === skillId);
}
