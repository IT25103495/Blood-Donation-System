import { BLOOD_TYPES, type BloodType } from './constants';
import type { InventoryItem } from '../types/api';

export type QuantityMap = Record<BloodType, number>;

export const emptyQuantityMap = (): QuantityMap =>
  Object.fromEntries(BLOOD_TYPES.map((t) => [t, 0])) as QuantityMap;

/** [3,0,1,...] -> { 'A+': 3, 'A-': 0, 'B+': 1, ... } */
export function quantitiesToMap(quantities: number[]): QuantityMap {
  const map = emptyQuantityMap();
  BLOOD_TYPES.forEach((t, i) => (map[t] = quantities[i] ?? 0));
  return map;
}

/** { 'A+': 3, ... } -> [3, ...] in BLOOD_TYPES order */
export const mapToQuantities = (map: Partial<QuantityMap>): number[] =>
  BLOOD_TYPES.map((t) => map[t] ?? 0);

/** Count AVAILABLE units per blood type (each inventory item = one unit). */
export function countAvailableByType(items: InventoryItem[]): QuantityMap {
  const map = emptyQuantityMap();
  for (const item of items) {
    if (item.status === 'AVAILABLE' && item.bloodType in map) {
      map[item.bloodType as BloodType] += 1;
    }
  }
  return map;
}
