import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp } from 'lucide-react';
import Card from '../../../../components/Card';
import i18n from '../../../../i18n';

interface WeeklyActivityChartProps {
  weeklyActivity: any[];
  mounted: boolean;
  onClick: () => void;
}

const WeeklyActivityChart: React.FC<WeeklyActivityChartProps> = ({ weeklyActivity, mounted, onClick }) => {
  const { t } = useTranslation();

  return (
    <Card className="weekly-activity-section clickable" onClick={onClick}>
      <div className="section-header">
        <TrendingUp size={20} />
        <h3>{t('stats.weekly_activity', 'Weekly Activity')}</h3>
      </div>
      <div className="weekly-chart">
        {weeklyActivity.map((day, i) => {
          const maxCount = Math.max(...weeklyActivity.map(d => d.count), 1);
          const targetHeight = (day.count / maxCount) * 100;
          const [y, m, d] = day.date.split('-').map(Number);
          const localDate = new Date(y, m - 1, d);
          const fullDateStr = localDate.toLocaleDateString(i18n.language, { weekday: 'long', month: 'short', day: 'numeric' });
          
          const weekDaysKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          const dayKey = weekDaysKeys[i % 7];
          const dayLabelTranslated = t(`stats.weekdays_short.${dayKey}`, dayKey);
          
          return (
            <div key={i} className="chart-column">
              <div className="bar-wrapper">
                <div className="bar" style={{ height: mounted ? `${targetHeight}%` : '0%' }}></div>
                <div className="bar-tooltip" style={{ bottom: mounted ? `calc(${targetHeight}% + 10px)` : '10px' }}>
                  <span className="tt-date">{fullDateStr}</span>
                  <span className="tt-count">{t('stats.reviewed_label', 'Đã học:')} <strong>{day.count}</strong> {t('stats.words', 'từ')}</span>
                </div>
              </div>
              <span className="day-label">{dayLabelTranslated}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default WeeklyActivityChart;
