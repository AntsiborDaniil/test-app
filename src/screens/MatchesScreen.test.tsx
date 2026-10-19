import { fireEvent, render, screen } from '@testing-library/react-native';
import { fetchMatches } from '../api';
import { makeMatch } from '../test-utils';
import type { MatchesResponse } from '../types';
import { MatchesScreen } from './MatchesScreen';

jest.mock('../api');
const fetchMatchesMock = jest.mocked(fetchMatches);

const response: MatchesResponse = {
  round: 12,
  matches: [
    makeMatch({ id: 'fin', status: 'finished', score: { home: 0, away: 0 } }),
    makeMatch({ id: 'live', status: 'live', minute: 67, score: { home: 1, away: 1 } }),
    makeMatch({ id: 'sch', status: 'scheduled' }),
    makeMatch({ id: 'post', status: 'postponed', startsAt: null }),
  ],
};

beforeEach(() => {
  fetchMatchesMock.mockReset();
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

const shownTeams = () => screen.queryAllByText(/^Хозяева /).map((node) => node.props.children);

describe('MatchesScreen', () => {
  it('пока ждём сервер — показывает заглушку загрузки', async () => {
    fetchMatchesMock.mockReturnValue(new Promise(() => {}));

    await render(<MatchesScreen />);

    expect(screen.getByRole('progressbar', { name: 'Загружаем матчи' })).toBeBusy();
    expect(screen.getByText('Загружаем матчи…')).toBeOnTheScreen();
  });

  it('показывает список матчей и номер тура', async () => {
    fetchMatchesMock.mockResolvedValue(response);

    await render(<MatchesScreen />);

    expect(await screen.findByText('Матчи 12 тура')).toBeOnTheScreen();
    expect(shownTeams()).toEqual(['Хозяева fin', 'Хозяева live', 'Хозяева sch', 'Хозяева post']);
    expect(screen.getByText('Обновлено 0 сек назад')).toBeOnTheScreen();
  });

  it('при ошибке — сообщение и «Повторить», который перезагружает', async () => {
    fetchMatchesMock.mockRejectedValueOnce(new Error('500')).mockResolvedValueOnce(response);
    await render(<MatchesScreen />);

    expect(await screen.findByText(/Не удалось загрузить матчи/)).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Повторить' }));

    expect(await screen.findByText('Хозяева fin')).toBeOnTheScreen();
    expect(screen.queryByText(/Не удалось загрузить матчи/)).not.toBeOnTheScreen();
  });

  it('если матчей нет — понятный пустой экран', async () => {
    fetchMatchesMock.mockResolvedValue({ round: 12, matches: [] });

    await render(<MatchesScreen />);

    expect(await screen.findByText('Матчей нет')).toBeOnTheScreen();
  });

  it('фильтр: предстоящие — запланированные и перенесённые, live только во «Все»', async () => {
    fetchMatchesMock.mockResolvedValue(response);
    await render(<MatchesScreen />);
    await screen.findByText('Хозяева fin');

    await fireEvent.press(screen.getByRole('tab', { name: 'Предстоящие' }));
    expect(shownTeams()).toEqual(['Хозяева sch', 'Хозяева post']);

    await fireEvent.press(screen.getByRole('tab', { name: 'Завершённые' }));
    expect(shownTeams()).toEqual(['Хозяева fin']);
  });

  it('пустая вкладка — своё сообщение и «Показать все»', async () => {
    fetchMatchesMock.mockResolvedValue({ round: 12, matches: [makeMatch({ id: 'sch' })] });
    await render(<MatchesScreen />);
    await screen.findByText('Хозяева sch');

    await fireEvent.press(screen.getByRole('tab', { name: 'Завершённые' }));
    expect(screen.getByText('В этой вкладке матчей нет.')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Показать все' }));
    expect(screen.getByText('Хозяева sch')).toBeOnTheScreen();
  });

  it('звёздочки изначально погашены и переключаются по одной', async () => {
    fetchMatchesMock.mockResolvedValue(response);
    await render(<MatchesScreen />);
    await screen.findByText('Хозяева fin');

    expect(screen.getAllByRole('button', { name: 'Добавить в избранное' })).toHaveLength(4);
    expect(screen.queryByRole('button', { name: 'Убрать из избранного' })).not.toBeOnTheScreen();

    await fireEvent.press(screen.getAllByRole('button', { name: 'Добавить в избранное' })[0]);

    expect(screen.getAllByRole('button', { name: 'Убрать из избранного' })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Добавить в избранное' })).toHaveLength(3);
  });

  it('«Обновить» перезапрашивает данные, а при ошибке оставляет список', async () => {
    fetchMatchesMock.mockResolvedValueOnce(response).mockRejectedValueOnce(new Error('offline'));
    await render(<MatchesScreen />);
    await screen.findByText('Хозяева fin');

    await fireEvent.press(screen.getByRole('button', { name: 'Обновить' }));

    expect(fetchMatchesMock).toHaveBeenCalledTimes(2);
    expect(await screen.findByText(/Не удалось загрузить матчи/)).toBeOnTheScreen();
    expect(screen.getByText('Хозяева fin')).toBeOnTheScreen();
  });
});
