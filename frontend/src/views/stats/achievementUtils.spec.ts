import { describe, expect, it } from 'vitest';
import { mapAchievement } from './achievementUtils';

describe('mapAchievement', () => {
  it('preserves server progress and derives a bounded display percentage', () => {
    expect(
      mapAchievement({
        id: 'beginner',
        title: 'Lexi Beginner',
        desc: 'Add your first 10 vocabulary words',
        unlocked: false,
        progress: 4,
        target: 10,
        unlockedAt: null,
      }),
    ).toMatchObject({
      id: 'beginner',
      current: 4,
      target: 10,
      progressPercent: 40,
      unlocked: false,
    });
  });

  it('caps progress at 100 percent', () => {
    expect(
      mapAchievement({
        id: 'accuracy',
        title: 'Sharpshooter',
        desc: 'Reach 80%',
        unlocked: true,
        progress: 95,
        target: 80,
        unlockedAt: null,
      }).progressPercent,
    ).toBe(100);
  });
});
