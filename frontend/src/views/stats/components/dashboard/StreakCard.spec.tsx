import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StreakCard from './StreakCard';

// Mock useTranslation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('StreakCard', () => {
  it('renders correctly with streak count', () => {
    render(<StreakCard streak={5} mounted={true} />);
    
    expect(screen.getByText('5')).toBeDefined();
    expect(screen.getByText('stats.streak_days')).toBeDefined();
  });

  it('renders fire emojis based on streak', () => {
    render(<StreakCard streak={3} mounted={true} />);
    const emojis = screen.getAllByText('🔥');
    expect(emojis.length).toBe(3);
  });
});
