import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Sparkles } from 'lucide-react';
import Card from '../../../../components/Card';
import i18n from '../../../../i18n';
import type { StudyStats } from '../../../../types';

interface WeeklyActivityChartProps {
  weeklyActivity: StudyStats['weeklyActivity'];
  mounted: boolean;
  onClick: () => void;
}

const WeeklyActivityChart: React.FC<WeeklyActivityChartProps> = ({ weeklyActivity, mounted, onClick }) => {
  const { t } = useTranslation();

  const totalThisWeek = weeklyActivity.reduce((acc, curr) => acc + (curr.count || 0), 0);
  const maxCount = Math.max(...weeklyActivity.map(d => d.count), 1);

  // Format today's local date string YYYY-MM-DD
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return (
    <Card className="weekly-activity-section clickable" onClick={onClick}>
      <div className="section-header weekly-header">
        <div className="header-left">
          <TrendingUp size={20} />
          <h3>{t('stats.weekly_activity', 'Hoạt động trong tuần')}</h3>
        </div>
        <div className="header-badge">
          {totalThisWeek > 0 ? (
            <span className="total-words-badge">
              <Sparkles size={14} />
              {totalThisWeek} {t('stats.words', 'từ')}
            </span>
          ) : (
            <span className="empty-words-badge">
              {t('stats.no_activity_yet', 'Chưa có lượt học')}
            </span>
          )}
        </div>
      </div>

      <div className="weekly-chart-container">
        <div className="weekly-chart">
          {weeklyActivity.map((day, i) => {
            const hasActivity = day.count > 0;
            // Ensure minimum visual height of 14% when hasActivity is true so it's clearly visible
            const rawHeight = (day.count / maxCount) * 100;
            const targetHeight = hasActivity ? Math.max(rawHeight, 14) : 0;
            
            const [y, m, d] = day.date.split('-').map(Number);
            const localDate = new Date(y, m - 1, d);
            const fullDateStr = localDate.toLocaleDateString(i18n.language, { weekday: 'long', month: 'short', day: 'numeric' });
            
            const weekDaysKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const dayKey = weekDaysKeys[i % 7];
            const dayLabelTranslated = t(`stats.weekdays_short.${dayKey}`, dayKey);
            const isToday = day.date === todayStr;
            
            return (
              <div 
                key={i} 
                className={`chart-column ${isToday ? 'is-today' : ''} ${hasActivity ? 'has-activity' : 'no-activity'}`}
              >
                <span className={`bar-count-badge ${hasActivity ? 'visible' : ''}`}>
                  {hasActivity ? day.count : ''}
                </span>
                <div className="bar-wrapper">
                  <div className="bar-track">
                    <div 
                      className={`bar ${hasActivity ? 'active' : ''}`} 
                      style={{ height: mounted ? `${targetHeight}%` : '0%' }}
                    />
                  </div>
                  <div className="bar-tooltip" style={{ bottom: mounted ? `calc(${targetHeight}% + 14px)` : '14px' }}>
                    <span className="tt-date">{fullDateStr}{isToday ? ` (${t('stats.legend_today', 'Hôm nay')})` : ''}</span>
                    <span className="tt-count">{t('stats.reviewed_label', 'Đã học:')} <strong>{day.count}</strong> {t('stats.words', 'từ')}</span>
                  </div>
                </div>
                <div className="day-label-container">
                  <span className="day-label">{dayLabelTranslated}</span>
                  {isToday && <span className="today-dot" title={t('stats.legend_today', 'Hôm nay')} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {totalThisWeek === 0 && (
        <div className="chart-empty-hint">
          <span>{t('stats.weekly_empty_hint', 'Chưa có hoạt động ôn tập tuần này. Hãy bắt đầu ôn từ vựng để lấp đầy biểu đồ nhé! 🚀')}</span>
        </div>
      )}
    </Card>
  );
};

export default WeeklyActivityChart;
