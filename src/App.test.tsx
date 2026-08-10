import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App', () => {
  it('renders the calendar and allows adding a schedule', async () => {
    render(<App />);

    expect(screen.getByText(/맞다톤 일정 관리/i)).toBeInTheDocument();
    expect(screen.getByText(/체크인/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /일정 추가/i }));
    expect(screen.getByRole('heading', { name: /일정 추가/i })).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/제목/i), '테스트 일정');
    await userEvent.click(screen.getByRole('button', { name: /저장/i }));

    expect(await screen.findByText(/일정을 추가했어요/i)).toBeInTheDocument();
  });
});
