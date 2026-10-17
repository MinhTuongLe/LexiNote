export interface AchievementRecord {
  id: string;
  title: string;
  desc: string;
  unlocked: boolean;
  unlockedAt?: string | null;
  progress: number;
  target: number;
}

export interface AchievementViewModel extends AchievementRecord {
  icon: string;
  badgeColor: string;
  current: number;
  progressPercent: number;
}

const PRESENTATION: Record<string, { icon: string; badgeColor: string }> = {
  beginner: { icon: '🐰', badgeColor: '#ffeaa7' },
  streak: { icon: '🔥', badgeColor: '#ff7675' },
  mastery: { icon: '🧠', badgeColor: '#a29bfe' },
  accuracy: { icon: '🎯', badgeColor: '#55efc4' },
};

export const mapAchievement = (achievement: AchievementRecord): AchievementViewModel => {
  const current = Math.max(0, achievement.progress);
  const target = Math.max(0, achievement.target);
  const progressPercent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const presentation = PRESENTATION[achievement.id] || { icon: '🏅', badgeColor: '#dfe6e9' };

  return {
    ...achievement,
    current,
    target,
    progressPercent,
    ...presentation,
  };
};
