import { Schedule } from '../types';
import { buildEventSchedules } from './eventSchedule';

const STORAGE_KEY = 'matdathon-schedules';
const MIGRATION_KEY = 'matdathon-schedules-api-migrated';

const seedSchedules: Schedule[] = buildEventSchedules();

export function loadLegacySchedules(): Schedule[] {
  if (typeof window === 'undefined') {
    return seedSchedules;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return seedSchedules;
  }

  try {
    const parsed = JSON.parse(raw) as Schedule[];
    return parsed.length > 0 ? parsed : seedSchedules;
  } catch {
    return seedSchedules;
  }
}

export function isLegacyMigrationComplete(): boolean {
  return typeof window !== 'undefined'
    && window.localStorage.getItem(MIGRATION_KEY) === 'true';
}

export function markLegacyMigrationComplete(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(MIGRATION_KEY, 'true');
  }
}
