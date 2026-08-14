import { useEffect, useMemo, useState } from 'react';
import { addDays, differenceInMinutes, endOfMonth, format, isSameDay, isSameMonth, startOfMonth, subDays } from 'date-fns';
import { CheckCircle2, Plus, Sparkles, Trash2 } from 'lucide-react';
import { createSchedule, listSchedules, removeSchedule, updateSchedule } from './lib/scheduleApi';
import { isLegacyMigrationComplete, loadLegacySchedules, markLegacyMigrationComplete } from './lib/storage';
import { eventDate, formatEventDateLabel } from './lib/eventSchedule';
import type { Schedule, ScheduleCategory, ScheduleFormValues, ScheduleInput, ScheduleStatus } from './types';

const CATEGORY_META: Record<ScheduleCategory, { label: string; color: string }> = {
  official: { label: '공식 일정', color: '#5E8C61' },
  team: { label: '팀 일정', color: '#5B7DB1' },
  deadline: { label: '마감', color: '#E76F51' },
  personal: { label: '개인 일정', color: '#B08968' }
};

const emptyFormValues = (selectedDate: Date): ScheduleFormValues => ({
  title: '',
  description: '',
  date: format(selectedDate, 'yyyy-MM-dd'),
  startTime: '09:00',
  endTime: '10:00',
  category: 'team',
  status: 'scheduled'
});

const toScheduleInput = (schedule: Schedule): ScheduleInput => ({
  title: schedule.title,
  description: schedule.description,
  startAt: schedule.startAt,
  endAt: schedule.endAt,
  category: schedule.category,
  status: schedule.status
});

const hasEquivalentSchedule = (schedules: Schedule[], candidate: Schedule): boolean =>
  schedules.some((schedule) =>
    schedule.title === candidate.title
    && schedule.startAt === candidate.startAt
    && schedule.endAt === candidate.endAt
    && schedule.category === candidate.category
  );

function App() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<ScheduleFormValues>(() => emptyFormValues(new Date()));
  const [errors, setErrors] = useState<Partial<Record<keyof ScheduleFormValues, string>>>({});
  const [toast, setToast] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isActive = true;

    const loadRemoteSchedules = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        let remoteSchedules = await listSchedules();

        if (!isLegacyMigrationComplete() && remoteSchedules.length === 0) {
          const migratedSchedules = [...remoteSchedules];
          for (const legacySchedule of loadLegacySchedules()) {
            if (!hasEquivalentSchedule(migratedSchedules, legacySchedule)) {
              const created = await createSchedule(toScheduleInput(legacySchedule));
              migratedSchedules.push(created);
            }
          }
          remoteSchedules = migratedSchedules;
          markLegacyMigrationComplete();
        }

        if (isActive) {
          setSchedules(remoteSchedules);
        }
      } catch {
        if (isActive) {
          setLoadError('일정을 불러오지 못했습니다. 백엔드 연결을 확인하고 다시 시도해주세요.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadRemoteSchedules();
    return () => {
      isActive = false;
    };
  }, [reloadToken]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDay = new Date(monthStart);
  startDay.setDate(startDay.getDate() - ((monthStart.getDay() + 6) % 7));
  const endDay = new Date(monthEnd);
  endDay.setDate(endDay.getDate() + ((7 - monthEnd.getDay()) % 7));

  const calendarDays = useMemo(() => {
    const days: Date[] = [];
    let day = new Date(startDay);
    while (day <= endDay) {
      days.push(new Date(day));
      day = addDays(day, 1);
    }
    return days;
  }, [endDay, monthStart, startDay]);

  const selectedDateSchedules = useMemo(() => {
    return schedules
      .filter((schedule) => isSameDay(new Date(schedule.startAt), selectedDate))
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }, [schedules, selectedDate]);

  const nextUpcoming = useMemo(() => {
    const upcoming = schedules
      .filter((schedule) => new Date(schedule.startAt).getTime() >= Date.now())
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
    return upcoming[0] ?? null;
  }, [schedules]);

  const todaySchedules = useMemo(() => {
    return schedules
      .filter((schedule) => isSameDay(new Date(schedule.startAt), new Date()))
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }, [schedules]);

  const eventDayLabel = useMemo(() => formatEventDateLabel(new Date(eventDate)), []);

  const urgentSchedules = useMemo(() => {
    const now = Date.now();
    return schedules.filter((schedule) => {
      const start = new Date(schedule.startAt).getTime();
      const diff = start - now;
      return diff > 0 && diff <= 24 * 60 * 60 * 1000;
    }).sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }, [schedules]);

  const openModal = (date: Date, schedule?: Schedule) => {
    const selected = schedule ?? null;
    setEditingId(selected?.id ?? null);
    setFormValues(
      selected
        ? {
            title: selected.title,
            description: selected.description,
            date: format(new Date(selected.startAt), 'yyyy-MM-dd'),
            startTime: format(new Date(selected.startAt), 'HH:mm'),
            endTime: format(new Date(selected.endAt), 'HH:mm'),
            category: selected.category,
            status: selected.status
          }
        : emptyFormValues(date)
    );
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setErrors({});
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 1800);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof ScheduleFormValues, string>> = {};

    if (!formValues.title.trim()) nextErrors.title = '제목을 입력해주세요.';
    if (formValues.title.trim().length > 50) nextErrors.title = '제목은 50자 이하로 입력해주세요.';
    if (formValues.description.trim().length > 500) nextErrors.description = '설명은 500자 이하로 입력해주세요.';
    if (!formValues.date) nextErrors.date = '날짜를 선택해주세요.';
    if (!formValues.startTime) nextErrors.startTime = '시작 시간을 선택해주세요.';
    if (!formValues.endTime) nextErrors.endTime = '종료 시간을 선택해주세요.';
    if (!formValues.category) nextErrors.category = '카테고리를 선택해주세요.';

    const startDateTime = new Date(`${formValues.date}T${formValues.startTime}:00`);
    const endDateTime = new Date(`${formValues.date}T${formValues.endTime}:00`);
    if (endDateTime <= startDateTime) nextErrors.endTime = '종료 시간은 시작 시간보다 늦어야 합니다.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const input: ScheduleInput = {
      title: formValues.title.trim(),
      description: formValues.description.trim(),
      startAt: startDateTime.toISOString(),
      endAt: endDateTime.toISOString(),
      category: formValues.category,
      status: formValues.status
    };

    setIsSaving(true);
    setActionError('');
    try {
      const saved = editingId
        ? await updateSchedule(editingId, input)
        : await createSchedule(input);
      setSchedules((current) =>
        editingId
          ? current.map((item) => (item.id === editingId ? saved : item))
          : [...current, saved]
      );
      showToast(editingId ? '일정을 수정했어요.' : '일정을 추가했어요.');
      closeModal();
      setSelectedDate(startDateTime);
    } catch {
      setActionError('일정을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (scheduleId: string) => {
    const schedule = schedules.find((item) => item.id === scheduleId);
    if (!schedule) return;

    setActionError('');
    try {
      const updated = await updateSchedule(scheduleId, {
        ...toScheduleInput(schedule),
        status: schedule.status === 'scheduled' ? 'completed' : 'scheduled'
      });
      setSchedules((current) =>
        current.map((item) => (item.id === scheduleId ? updated : item))
      );
      showToast('일정 상태를 변경했어요.');
    } catch {
      setActionError('일정 상태를 변경하지 못했습니다.');
    }
  };

  const deleteSchedule = async (scheduleId: string) => {
    setActionError('');
    try {
      await removeSchedule(scheduleId);
      setSchedules((current) => current.filter((schedule) => schedule.id !== scheduleId));
      showToast('일정을 삭제했어요.');
    } catch {
      setActionError('일정을 삭제하지 못했습니다.');
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">맞다톤 일정 관리</p>
          <h1>행사 일정과 팀 마감 한눈에</h1>
        </div>
        <button className="primary-button" onClick={() => openModal(selectedDate)} disabled={isLoading}>
          <Plus size={16} /> 일정 추가
        </button>
      </header>

      {isLoading ? <p className="notice" role="status">일정을 불러오는 중입니다.</p> : null}
      {loadError ? (
        <div className="notice error-notice" role="alert">
          <span>{loadError}</span>
          <button className="secondary-button" onClick={() => setReloadToken((value) => value + 1)}>
            다시 시도
          </button>
        </div>
      ) : null}
      {actionError ? <p className="notice error-notice" role="alert">{actionError}</p> : null}

      <main className="main-grid">
        <section className="panel calendar-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">월간 캘린더</p>
              <h2>{format(currentMonth, 'yyyy년 M월')}</h2>
            </div>
            <div className="month-controls">
              <button onClick={() => setCurrentMonth(subDays(startOfMonth(currentMonth), 1))}>이전</button>
              <button onClick={() => setCurrentMonth(new Date())}>오늘</button>
              <button onClick={() => setCurrentMonth(addDays(endOfMonth(currentMonth), 1))}>다음</button>
            </div>
          </div>

          <div className="weekdays">
            {['월', '화', '수', '목', '금', '토', '일'].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="calendar-grid">
            {calendarDays.map((day) => {
              const daySchedules = schedules.filter((schedule) => isSameDay(new Date(schedule.startAt), day));
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              return (
                <button
                  key={day.toISOString()}
                  className={`day-cell ${!isCurrentMonth ? 'muted' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                  onClick={() => {
                    setSelectedDate(day);
                    setCurrentMonth(day);
                  }}
                >
                  <span className="day-number">{format(day, 'd')}</span>
                  <div className="day-schedule-list">
                    {daySchedules.slice(0, 2).map((schedule) => (
                      <span key={schedule.id} className="dot" style={{ backgroundColor: CATEGORY_META[schedule.category].color }} />
                    ))}
                    {daySchedules.length > 2 ? <span className="day-count">+{daySchedules.length - 2}</span> : null}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="panel side-panel">
          <div className="summary-card">
            <div className="summary-top">
              <Sparkles size={18} />
              <span>오늘의 일정 요약</span>
            </div>
            <h3>{eventDayLabel}</h3>
            <p>{todaySchedules.length}개 일정이 남아 있어요.</p>
          </div>

          <div className="card-list">
            <div className="card-title-row">
              <h3>다음 일정</h3>
              <span>{nextUpcoming ? format(new Date(nextUpcoming.startAt), 'HH:mm') : '없음'}</span>
            </div>
            {nextUpcoming ? (
              <div className={`schedule-card ${nextUpcoming.category === 'deadline' ? 'urgent' : ''}`}>
                <div>
                  <strong>{nextUpcoming.title}</strong>
                  <p>{format(new Date(nextUpcoming.startAt), 'M월 d일 HH:mm')} - {format(new Date(nextUpcoming.endAt), 'HH:mm')}</p>
                </div>
                <span className="pill" style={{ borderColor: CATEGORY_META[nextUpcoming.category].color }}>
                  {CATEGORY_META[nextUpcoming.category].label}
                </span>
              </div>
            ) : (
              <p className="empty-text">오늘과 내일 일정이 없어요.</p>
            )}
          </div>

          <div className="card-list">
            <div className="card-title-row">
              <h3>선택 날짜 일정</h3>
              <span>{format(selectedDate, 'M월 d일')}</span>
            </div>
            {selectedDateSchedules.length > 0 ? selectedDateSchedules.map((schedule) => (
              <div key={schedule.id} className="schedule-card detail-card" onClick={() => openModal(selectedDate, schedule)}>
                <div>
                  <strong>{schedule.title}</strong>
                  <p>{format(new Date(schedule.startAt), 'HH:mm')} - {format(new Date(schedule.endAt), 'HH:mm')}</p>
                </div>
                <button
                  className="icon-button"
                  aria-label={`${schedule.title} 상태 변경`}
                  onClick={(event) => {
                    event.stopPropagation();
                    void toggleStatus(schedule.id);
                  }}
                >
                  <CheckCircle2 size={16} />
                </button>
              </div>
            )) : <p className="empty-text">이 날짜에는 일정이 없어요.</p>}
          </div>

          <div className="card-list">
            <div className="card-title-row">
              <h3>다가오는 마감</h3>
              <span>{urgentSchedules.length}개</span>
            </div>
            {urgentSchedules.length > 0 ? urgentSchedules.map((schedule) => {
              const diffInMinutes = differenceInMinutes(new Date(schedule.startAt), new Date());
              return (
                <div key={schedule.id} className="schedule-card">
                  <div>
                    <strong>{schedule.title}</strong>
                    <p>{diffInMinutes}분 후 시작</p>
                  </div>
                  <button
                    className="icon-button"
                    aria-label={`${schedule.title} 삭제`}
                    onClick={() => void deleteSchedule(schedule.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            }) : <p className="empty-text">24시간 안에 시작하는 일정이 없어요.</p>}
          </div>
        </aside>
      </main>

      {isModalOpen ? (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? '일정 수정' : '일정 추가'}</h3>
              <button className="icon-button" aria-label="일정 창 닫기" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="form-grid">
              <label>
                <span>제목</span>
                <input value={formValues.title} onChange={(event) => setFormValues({ ...formValues, title: event.target.value })} />
                {errors.title ? <small>{errors.title}</small> : null}
              </label>
              <label>
                <span>날짜</span>
                <input type="date" value={formValues.date} onChange={(event) => setFormValues({ ...formValues, date: event.target.value })} />
                {errors.date ? <small>{errors.date}</small> : null}
              </label>
              <label>
                <span>시작 시간</span>
                <input type="time" value={formValues.startTime} onChange={(event) => setFormValues({ ...formValues, startTime: event.target.value })} />
                {errors.startTime ? <small>{errors.startTime}</small> : null}
              </label>
              <label>
                <span>종료 시간</span>
                <input type="time" value={formValues.endTime} onChange={(event) => setFormValues({ ...formValues, endTime: event.target.value })} />
                {errors.endTime ? <small>{errors.endTime}</small> : null}
              </label>
              <label>
                <span>카테고리</span>
                <select value={formValues.category} onChange={(event) => setFormValues({ ...formValues, category: event.target.value as ScheduleCategory })}>
                  {Object.entries(CATEGORY_META).map(([value, meta]) => (
                    <option key={value} value={value}>{meta.label}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>상태</span>
                <select value={formValues.status} onChange={(event) => setFormValues({ ...formValues, status: event.target.value as ScheduleStatus })}>
                  <option value="scheduled">예정</option>
                  <option value="completed">완료</option>
                </select>
              </label>
              <label className="full-width">
                <span>설명</span>
                <textarea value={formValues.description} onChange={(event) => setFormValues({ ...formValues, description: event.target.value })} />
                {errors.description ? <small>{errors.description}</small> : null}
              </label>
              <div className="modal-actions full-width">
                <button type="button" className="secondary-button" onClick={closeModal} disabled={isSaving}>취소</button>
                <button type="submit" className="primary-button" disabled={isSaving}>
                  {isSaving ? '저장 중...' : '저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}

export default App;
