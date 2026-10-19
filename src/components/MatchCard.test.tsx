import { fireEvent, render, screen } from '@testing-library/react-native';
import { makeMatch } from '../test-utils';
import { MatchCard } from './MatchCard';

const noop = () => {};

describe('MatchCard', () => {
  it('показывает хозяев, гостей и счёт', async () => {
    const match = makeMatch({ id: 'm1', status: 'finished', score: { home: 2, away: 1 } });

    await render(<MatchCard match={match} isFavorite={false} onToggleFavorite={noop} />);

    expect(screen.getByText('Хозяева m1')).toBeOnTheScreen();
    expect(screen.getByText('Гости m1')).toBeOnTheScreen();
    expect(screen.getByText('2 : 1')).toBeOnTheScreen();
    expect(screen.getByText('Завершён')).toBeOnTheScreen();
  });

  it('счёт 0:0 не прячет', async () => {
    const match = makeMatch({ id: 'm2', status: 'finished', score: { home: 0, away: 0 } });

    await render(<MatchCard match={match} isFavorite={false} onToggleFavorite={noop} />);

    expect(screen.getByText('0 : 0')).toBeOnTheScreen();
  });

  it('без счёта — прочерк', async () => {
    await render(<MatchCard match={makeMatch({ id: 'm5' })} isFavorite={false} onToggleFavorite={noop} />);

    expect(screen.getByText('—')).toBeOnTheScreen();
  });

  it('перенесённый матч без даты', async () => {
    const match = makeMatch({ id: 'm7', status: 'postponed', startsAt: null });

    await render(<MatchCard match={match} isFavorite={false} onToggleFavorite={noop} />);

    expect(screen.getByText('Дата уточняется')).toBeOnTheScreen();
    expect(screen.getByText('Перенесён')).toBeOnTheScreen();
  });

  it('идущий матч — с минутой', async () => {
    const match = makeMatch({ id: 'm4', status: 'live', minute: 67, score: { home: 1, away: 1 } });

    await render(<MatchCard match={match} isFavorite={false} onToggleFavorite={noop} />);

    expect(screen.getByText("Идёт · 67'")).toBeOnTheScreen();
  });

  it('звёздочка отражает избранное и передаёт id матча', async () => {
    const onToggle = jest.fn();
    await render(<MatchCard match={makeMatch({ id: 'm1' })} isFavorite onToggleFavorite={onToggle} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Убрать из избранного' }));

    expect(onToggle).toHaveBeenCalledWith('m1');
  });
});
