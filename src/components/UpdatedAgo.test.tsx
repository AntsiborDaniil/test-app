import { act, render, screen } from '@testing-library/react-native';
import { UpdatedAgo } from './UpdatedAgo';

const START = new Date('2026-10-19T12:00:00Z');

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(START);
});

afterEach(() => {
  jest.useRealTimers();
});

async function tick(ms: number) {
  await act(() => jest.advanceTimersByTime(ms));
}

describe('UpdatedAgo', () => {
  it('сразу после загрузки — 0 секунд', async () => {
    await render(<UpdatedAgo since={START} />);

    expect(screen.getByText('Обновлено 0 сек назад')).toBeOnTheScreen();
  });

  it('растёт каждую секунду, а не застывает на 1', async () => {
    await render(<UpdatedAgo since={START} />);

    await tick(1000);
    expect(screen.getByText('Обновлено 1 сек назад')).toBeOnTheScreen();

    await tick(4000);
    expect(screen.getByText('Обновлено 5 сек назад')).toBeOnTheScreen();
  });

  it('сбрасывается, когда приходит новое since', async () => {
    await render(<UpdatedAgo since={START} />);
    await tick(7000);
    expect(screen.getByText('Обновлено 7 сек назад')).toBeOnTheScreen();

    await screen.rerender(<UpdatedAgo since={new Date(Date.now())} />);

    expect(screen.getByText('Обновлено 0 сек назад')).toBeOnTheScreen();
  });

  it('считает от since, даже если компонент появился позже', async () => {
    jest.setSystemTime(new Date(START.getTime() + 30_000));

    await render(<UpdatedAgo since={START} />);

    expect(screen.getByText('Обновлено 30 сек назад')).toBeOnTheScreen();
  });

  it('не уходит в минус, если since чуть впереди часов', async () => {
    await render(<UpdatedAgo since={new Date(START.getTime() + 500)} />);

    expect(screen.getByText('Обновлено 0 сек назад')).toBeOnTheScreen();
  });

  it('останавливает таймер при размонтировании', async () => {
    const setIntervalSpy = jest.spyOn(globalThis, 'setInterval');
    const clearIntervalSpy = jest.spyOn(globalThis, 'clearInterval');
    await render(<UpdatedAgo since={START} />);
    const timer = setIntervalSpy.mock.results[0].value;

    await screen.unmount();

    expect(clearIntervalSpy).toHaveBeenCalledWith(timer);
  });
});
