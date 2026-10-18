import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CuteSelect from './CuteSelect';

const options = [
  { value: 'en', label: 'English' },
  { value: 'vi', label: 'Vietnamese' },
];

describe('CuteSelect', () => {
  it('opens from the keyboard and selects an option', () => {
    const onChange = vi.fn();
    render(<CuteSelect options={options} value="en" onChange={onChange} />);

    const trigger = screen.getByRole('button', { name: 'English' });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });

    fireEvent.click(screen.getByRole('option', { name: 'Vietnamese' }));
    expect(onChange).toHaveBeenCalledWith('vi');
  });
});
