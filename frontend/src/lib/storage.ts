import { Schedule } from '../types';
import { buildEventSchedules } from './eventSchedule';

const STORAGE_KEY = 'matdathon-schedules';

const seedSchedules: Schedule[] = buildEventSchedules();

export function loadSchedules(): Schedule[] {
  if (typeof window === 'undefined') {
    return seedSchedules;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    saveSchedules(seedSchedules);
    return seedSchedules;
  }

  try {
    const parsed = JSON.parse(raw) as Schedule[];
    return parsed.length > 0 ? parsed : seedSchedules;
  } catch {
    return seedSchedules;
  }
}

export function saveSchedules(schedules: Schedule[]): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
  }
}
