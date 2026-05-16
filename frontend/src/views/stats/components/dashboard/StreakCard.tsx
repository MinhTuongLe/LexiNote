import React from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../../../components/Card';
import CountUp from '../../../../components/CountUp';

interface StreakCardProps {
  streak: number;
  mounted: boolean;
  onClick: () => void;
}

const StreakCard: React.FC<StreakCardProps> = ({ streak, mounted, onClick }) => {
  const { t } = useTranslation();

  return (
    <Card className="streak-stats-card clickable" onClick={onClick}>
      <div className="streak-content">
        <span className="streak-label">{t('stats.streak', 'Day Streak')}</span>
        <div className="streak-value">
          <span className="number"><CountUp end={mounted ? streak : 0} /></span>
          <span className="unit">{t('stats.days', 'days')}</span>
        </div>
        <div className="streak-fire">
          {Array.from({ length: Math.min(streak, 5) }).map((_, i) => (
            <span key={i} className="fire-emoji" style={{ animationDelay: `${i * 0.1}s`, opacity: mounted ? 1 : 0 }}>🔥</span>
          ))}
        </div>
        <p className="streak-desc">{t('stats.streak_desc', 'Keep it up! Review every day to grow your streak.')}</p>
      </div>
    </Card>
  );
};

export default StreakCard;
