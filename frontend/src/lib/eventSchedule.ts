import { format } from 'date-fns';
import type { Schedule } from '../types';

export const eventDate = '2026-08-22';

export interface EventScheduleItem {
  title: string;
  startTime: string;
  endTime: string;
  category: 'official' | 'deadline';
  description: string;
}

const officialScheduleItems: EventScheduleItem[] = [
  {
    title: '체크인',
    startTime: '09:00',
    endTime: '09:30',
    category: 'official',
    description: '행사 등록 및 준비'
  },
  {
    title: '오프닝',
    startTime: '09:30',
    endTime: '09:40',
    category: 'official',
    description: '행사 시작 안내'
  },
  {
    title: '오프닝 키노트',
    startTime: '09:40',
    endTime: '10:20',
    category: 'official',
    description: '행사 소개 및 방향성 안내'
  },
  {
    title: '커뮤니티 세션',
    startTime: '10:20',
    endTime: '10:50',
    category: 'official',
    description: '커뮤니티와 도전 과제 설명'
  },
  {
    title: '도전 과제 세부 사항 및 심사 안내',
    startTime: '10:50',
    endTime: '11:00',
    category: 'official',
    description: '심사 기준과 제출 방식 안내'
  },
  {
    title: '해커톤 및 중식',
    startTime: '11:00',
    endTime: '17:00',
    category: 'official',
    description: '개발 및 협업 시간'
  },
  {
    title: '과제 제출 마감',
    startTime: '17:00',
    endTime: '17:00',
    category: 'deadline',
    description: 'Azure 배포 주소 제출 마감'
  },
  {
    title: '심사 및 발표',
    startTime: '17:00',
    endTime: '17:30',
    category: 'official',
    description: '심사 및 발표 진행'
  },
  {
    title: '시상 및 클로징',
    startTime: '17:30',
    endTime: '18:00',
    category: 'official',
    description: '수상식 및 행사 마무리'
  }
];

export function buildEventSchedules(): Schedule[] {
  return officialScheduleItems.map((item, index) => {
    const start = `${eventDate}T${item.startTime}:00`;
    const end = `${eventDate}T${item.endTime}:00`;
    return {
      id: `event-${index + 1}`,
      title: item.title,
      description: item.description,
      startAt: new Date(start).toISOString(),
      endAt: new Date(end).toISOString(),
      category: item.category,
      status: 'scheduled',
      createdAt: `${eventDate}T00:00:00.000Z`
    } as Schedule;
  });
}

export function formatEventDateLabel(date: Date): string {
  return format(date, 'yyyy년 M월 d일');
}
