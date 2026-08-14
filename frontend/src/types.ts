export type ScheduleCategory = 'official' | 'team' | 'deadline' | 'personal';
export type ScheduleStatus = 'scheduled' | 'completed';

export interface Schedule {
  id: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  category: ScheduleCategory;
  status: ScheduleStatus;
  createdAt: string;
}

export type ScheduleInput = Omit<Schedule, 'id' | 'createdAt'>;

export interface ScheduleFormValues {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  category: ScheduleCategory;
  status: ScheduleStatus;
}
