/**
 * XPGains Equipment Types
 * Equipment filtering for exercises
 */

import type { EquipmentType, EquipmentId } from '../types';

/**
 * All 9 equipment types
 */
export const EQUIPMENT_TYPES: readonly EquipmentType[] = [
  { id: 'bench', name: 'Bench' },
  { id: 'dumbbells', name: 'Dumbbells' },
  { id: 'barbell', name: 'Barbell' },
  { id: 'cable', name: 'Cable Machine' },
  { id: 'pullup_bar', name: 'Pull-up Bar' },
  { id: 'squat_rack', name: 'Squat Rack' },
  { id: 'machines', name: 'Machines' },
  { id: 'bands', name: 'Resistance Bands' },
  { id: 'bodyweight', name: 'Bodyweight Only' },
] as const;

/**
 * All valid equipment IDs
 */
export const EQUIPMENT_IDS: readonly EquipmentId[] = EQUIPMENT_TYPES.map(e => e.id);

/**
 * Get equipment type by ID
 */
export function getEquipmentById(id: EquipmentId): EquipmentType | undefined {
  return EQUIPMENT_TYPES.find(e => e.id === id);
}

/**
 * Check if a string is a valid equipment ID
 */
export function isValidEquipmentId(id: string): id is EquipmentId {
  return EQUIPMENT_IDS.includes(id as EquipmentId);
}
