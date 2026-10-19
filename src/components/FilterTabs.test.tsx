import { fireEvent, render, screen } from '@testing-library/react-native';
import { FilterTabs } from './FilterTabs';

describe('FilterTabs', () => {
  it('показывает три вкладки и отмечает выбранную', async () => {
    await render(<FilterTabs value="upcoming" onChange={() => {}} />);

    expect(screen.getByRole('tab', { name: 'Все' })).not.toBeSelected();
    expect(screen.getByRole('tab', { name: 'Предстоящие' })).toBeSelected();
    expect(screen.getByRole('tab', { name: 'Завершённые' })).not.toBeSelected();
  });

  it('по нажатию сообщает выбранный фильтр', async () => {
    const onChange = jest.fn();
    await render(<FilterTabs value="all" onChange={onChange} />);

    await fireEvent.press(screen.getByRole('tab', { name: 'Завершённые' }));

    expect(onChange).toHaveBeenCalledWith('finished');
  });
});
