import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import type { Schedule, ScheduleInput } from './types';

const initialSchedule = (): Schedule => {
  const start = new Date();
  start.setHours(10, 0, 0, 0);
  const end = new Date(start);
  end.setHours(11, 0, 0, 0);
  return {
    id: 'schedule-1',
    title: '초기 일정',
    description: 'API에서 불러온 일정',
    startAt: start.toISOString(),
    endAt: end.toISOString(),
    category: 'team',
    status: 'scheduled',
    createdAt: new Date().toISOString()
  };
};

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('API 일정을 표시하고 새 일정을 추가한다', async () => {
    const existing = initialSchedule();
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      if (!init?.method) return jsonResponse([existing]);
      if (init.method === 'POST') {
        const input = JSON.parse(String(init.body)) as ScheduleInput;
        return jsonResponse({
          ...input,
          id: 'schedule-2',
          createdAt: new Date().toISOString()
        }, 201);
      }
      return jsonResponse({ detail: '예상하지 못한 요청입니다.' }, 500);
    });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();

    render(<App />);

    expect(await screen.findByText('초기 일정')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /일정 추가/i }));
    await user.type(screen.getByLabelText(/제목/i), '테스트 일정');
    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(await screen.findByText(/일정을 추가했어요/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/schedules'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('일정을 수정하고 완료 상태로 변경한다', async () => {
    const existing = initialSchedule();
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      if (!init?.method) return jsonResponse([existing]);
      if (init.method === 'PUT') {
        const input = JSON.parse(String(init.body)) as ScheduleInput;
        return jsonResponse({ ...existing, ...input });
      }
      return jsonResponse({ detail: '예상하지 못한 요청입니다.' }, 500);
    });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();

    render(<App />);
    const scheduleTitles = await screen.findAllByText('초기 일정');
    await user.click(scheduleTitles[scheduleTitles.length - 1]);

    const titleInput = screen.getByLabelText(/제목/i);
    await user.clear(titleInput);
    await user.type(titleInput, '수정된 일정');
    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(await screen.findByText(/일정을 수정했어요/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '수정된 일정 상태 변경' }));

    expect(await screen.findByText(/일정 상태를 변경했어요/i)).toBeInTheDocument();
    const putBodies = fetchMock.mock.calls
      .filter(([, init]) => init?.method === 'PUT')
      .map(([, init]) => JSON.parse(String(init?.body)) as ScheduleInput);
    expect(putBodies).toHaveLength(2);
    expect(putBodies[1].status).toBe('completed');
  });

  it('다가오는 일정을 삭제한다', async () => {
    const urgent = initialSchedule();
    const start = new Date(Date.now() + 60 * 60 * 1000);
    urgent.id = 'urgent-1';
    urgent.title = '삭제할 일정';
    urgent.startAt = start.toISOString();
    urgent.endAt = new Date(start.getTime() + 60 * 60 * 1000).toISOString();

    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      if (!init?.method) return jsonResponse([urgent]);
      if (init.method === 'DELETE') return new Response(null, { status: 204 });
      return jsonResponse({ detail: '예상하지 못한 요청입니다.' }, 500);
    });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();

    render(<App />);
    await screen.findAllByText('삭제할 일정');
    await user.click(screen.getByRole('button', { name: '삭제할 일정 삭제' }));

    expect(await screen.findByText(/일정을 삭제했어요/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '삭제할 일정 삭제' })).not.toBeInTheDocument();
  });

  it('잘못된 시간 범위를 API로 보내지 않는다', async () => {
    const fetchMock = vi.fn(async () => jsonResponse([initialSchedule()]));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();

    render(<App />);
    await screen.findByText('초기 일정');
    await user.click(screen.getByRole('button', { name: /일정 추가/i }));
    await user.type(screen.getByLabelText(/제목/i), '잘못된 일정');
    await user.clear(screen.getByLabelText(/종료 시간/i));
    await user.type(screen.getByLabelText(/종료 시간/i), '08:00');
    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(screen.getByText(/종료 시간은 시작 시간보다 늦어야 합니다/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('서버가 비어 있으면 기존 로컬 일정을 한 번 이전한다', async () => {
    const legacy = initialSchedule();
    window.localStorage.setItem('matdathon-schedules', JSON.stringify([legacy]));
    let nextId = 0;
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      if (!init?.method) return jsonResponse([]);
      if (init.method === 'POST') {
        const input = JSON.parse(String(init.body)) as ScheduleInput;
        nextId += 1;
        return jsonResponse({
          ...input,
          id: `migrated-${nextId}`,
          createdAt: new Date().toISOString()
        }, 201);
      }
      return jsonResponse({ detail: '예상하지 못한 요청입니다.' }, 500);
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<App />);

    expect(await screen.findByText('초기 일정')).toBeInTheDocument();
    expect(window.localStorage.getItem('matdathon-schedules-api-migrated')).toBe('true');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('조회 실패를 보여주고 다시 시도한다', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ detail: '장애' }, 503))
      .mockResolvedValueOnce(jsonResponse([initialSchedule()]));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();

    render(<App />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/일정을 불러오지 못했습니다/i);
    await user.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(await screen.findByText('초기 일정')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
