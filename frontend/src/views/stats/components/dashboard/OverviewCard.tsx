import React from 'react';
import { useTranslation } from 'react-i18next';
import { Target } from 'lucide-react';
import Card from '../../../../components/Card';
import CountUp from '../../../../components/CountUp';
import { formatTimeSpent } from '../../../../utils/time';

interface OverviewCardProps {
  stats: any;
  mounted: boolean;
  onClick: () => void;
}

const OverviewCard: React.FC<OverviewCardProps> = ({ stats, mounted, onClick }) => {
  const { t } = useTranslation();
  const circleRadius = 40;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (mounted ? (stats.accuracy / 100) * circleCircumference : 0);

  const timeSpent = formatTimeSpent(stats.totalTimeSpentMinutes);

  return (
    <Card className="overview-stats-card clickable" onClick={onClick}>
      <div className="accuracy-meter">
        <div className="meter-circle-svg-container">
          <svg viewBox="0 0 100 100" className="circular-chart">
            <path className="circle-bg"
              fill="none"
              stroke="#f1f2f6"
              strokeWidth="8"
              d={`M50 10 a ${circleRadius} ${circleRadius} 0 0 1 0 ${circleRadius * 2} a ${circleRadius} ${circleRadius} 0 0 1 0 -${circleRadius * 2}`} />
            <path className="circle-progress"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circleCircumference}
              strokeDashoffset={strokeDashoffset}
              d={`M50 10 a ${circleRadius} ${circleRadius} 0 0 1 0 ${circleRadius * 2} a ${circleRadius} ${circleRadius} 0 0 1 0 -${circleRadius * 2}`} />
          </svg>
          <div className="meter-inner">
            <Target size={24} />
            <span className="accuracy-value"><CountUp end={mounted ? stats.accuracy : 0} />%</span>
            <span className="accuracy-label">{t('stats.accuracy', 'Accuracy')}</span>
          </div>
        </div>
      </div>
      <div className="quick-info">
        <div className="info-row">
          <div className="info-item">
            <span className="info-val"><CountUp end={mounted ? stats.totalReviewed : 0} /></span>
            <span className="info-lab">{t('stats.total_reviewed', 'Total Reviewed')}</span>
          </div>
          <div className="info-item">
            <span className="info-val"><CountUp end={mounted ? stats.averageEaseFactor : 0} decimals={1} /></span>
            <span className="info-lab">{t('stats.average_ease', 'Average Ease')}</span>
          </div>
          <div className="info-item">
            <span className="info-val">
              <CountUp 
                end={mounted ? timeSpent.value : 0} 
                decimals={timeSpent.decimals}
              />
              {timeSpent.unit}
            </span>
            <span className="info-lab">{t('stats.time_spent', 'Time Spent')}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default OverviewCard;
