import type { Schedule, ScheduleInput } from '../types';

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const API_BASE_URL = (configuredBaseUrl || 'http://localhost:8000').replace(/\/$/, '');

interface ApiErrorBody {
  detail?: string;
}

export class ScheduleApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = 'ScheduleApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers
    }
  });

  if (!response.ok) {
    let message = '일정 서버 요청에 실패했습니다.';
    try {
      const body = (await response.json()) as ApiErrorBody;
      if (body.detail) message = body.detail;
    } catch {
      // 응답 본문이 JSON이 아니면 사용자용 기본 문구를 사용한다.
    }
    throw new ScheduleApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export function listSchedules(): Promise<Schedule[]> {
  return request<Schedule[]>('/api/schedules');
}

export function createSchedule(data: ScheduleInput): Promise<Schedule> {
  return request<Schedule>('/api/schedules', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export function updateSchedule(id: string, data: ScheduleInput): Promise<Schedule> {
  return request<Schedule>(`/api/schedules/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export function removeSchedule(id: string): Promise<void> {
  return request<void>(`/api/schedules/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}
