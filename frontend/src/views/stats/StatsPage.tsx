import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGetStudyStatsQuery } from '../../store/apiSlice';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { ArrowLeft, TrendingUp, Target, Award, BarChart2, PieChart } from 'lucide-react';
import CountUp from '../../components/CountUp';
import './StatsPage.css';

import StatsSkeleton from './StatsSkeleton';
import { formatTimeSpent } from '../../utils/time';

interface StatsPageProps {
  onBack: () => void;
}

const StatsPage: React.FC<StatsPageProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const { data: stats, isLoading } = useGetStudyStatsQuery();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    if (stats) {
      // Small delay to ensure render is complete before triggering animations
      const timer = setTimeout(() => setMounted(true), 100);
      return () => clearTimeout(timer);
    }
  }, [stats]);

  if (isLoading) {
    return <StatsSkeleton />;
  }

  if (!stats) {
    return (
      <div className="stats-page empty">
        <Card className="empty-stats-card">
          <TrendingUp size={48} />
          <h2>{t('stats.title')}</h2>
          <p>{t('stats.no_data')}</p>
        </Card>
      </div>
    );
  }

  // Calculate SVG Circle values for Accuracy
  const circleRadius = 40;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (mounted ? (stats.accuracy / 100) * circleCircumference : 0);

  return (
    <div className="stats-page">
      <div className="stats-grid-top">
        <Card className="streak-stats-card">
          <div className="streak-content">
            <span className="streak-label">{t('stats.streak', 'Day Streak')}</span>
            <div className="streak-value">
              <span className="number"><CountUp end={mounted ? stats.streak : 0} /></span>
              <span className="unit">{t('stats.days', 'days')}</span>
            </div>
            <div className="streak-fire">
              {Array.from({ length: Math.min(stats.streak, 5) }).map((_, i) => (
                <span key={i} className="fire-emoji" style={{ animationDelay: `${i * 0.1}s`, opacity: mounted ? 1 : 0 }}>🔥</span>
              ))}
            </div>
            <p className="streak-desc">{t('stats.streak_desc', 'Keep it up! Review every day to grow your streak.')}</p>
          </div>
        </Card>

        <Card className="overview-stats-card">
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
                    end={mounted ? formatTimeSpent(stats.totalTimeSpentMinutes).value : 0} 
                    decimals={formatTimeSpent(stats.totalTimeSpentMinutes).decimals}
                  />
                  {formatTimeSpent(stats.totalTimeSpentMinutes).unit}
                </span>
                <span className="info-lab">{t('stats.time_spent', 'Time Spent')}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="stats-sections">
        <Card className="weekly-activity-section">
          <div className="section-header">
            <TrendingUp size={20} />
            <h3>{t('stats.weekly_activity', 'Weekly Activity')}</h3>
          </div>
          <div className="weekly-chart">
            {stats.weeklyActivity.map((day, i) => {
              const maxCount = Math.max(...stats.weeklyActivity.map(d => d.count), 1);
              const targetHeight = (day.count / maxCount) * 100;
              const fullDateStr = new Date(day.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
              const dayName = new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' });
              
              return (
                <div key={i} className="chart-column">
                  <div className="bar-wrapper">
                    <div className="bar" style={{ height: mounted ? `${targetHeight}%` : '0%' }}></div>
                    <div className="bar-tooltip" style={{ bottom: mounted ? `calc(${targetHeight}% + 10px)` : '10px' }}>
                      <span className="tt-date">{fullDateStr}</span>
                      <span className="tt-count">{t('stats.reviewed_label', 'Đã học:')} <strong>{day.count}</strong> {t('stats.words', 'từ')}</span>
                    </div>
                  </div>
                  <span className="day-label">{dayName}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="stats-row">
          <div className="stats-col-left">
            <Card className="mastery-section">
              <div className="section-header">
                <Award size={20} />
                <h3>{t('stats.progress', 'Learning Progress')}</h3>
              </div>
              <div className="mastery-stats">
                <div className="mastery-item">
                  <div className="mastery-label">
                    <span>{t('stats.mastered', 'Mastered')}</span>
                    <span className="count">{stats.masteredCount} {t('stats.words', 'words')}</span>
                  </div>
                  <div className="progress-bar-mastery">
                    <div className="fill mastered" style={{ width: mounted ? `${(stats.masteredCount / (stats.totalReviewed || 1)) * 100}%` : '0%' }}></div>
                  </div>
                </div>
                <div className="mastery-item">
                  <div className="mastery-label">
                    <span>{t('stats.learning', 'Learning')}</span>
                    <span className="count">{stats.learningCount} {t('stats.words', 'words')}</span>
                  </div>
                  <div className="progress-bar-mastery">
                    <div className="fill learning" style={{ width: mounted ? `${(stats.learningCount / (stats.totalReviewed || 1)) * 100}%` : '0%' }}></div>
                  </div>
                </div>
                <div className="mastery-item">
                  <div className="mastery-label">
                    <span>{t('stats.new', 'New')}</span>
                    <span className="count">{stats.newCount} {t('stats.words', 'words')}</span>
                  </div>
                  <div className="progress-bar-mastery">
                    <div className="fill new" style={{ width: mounted ? `${(stats.newCount / (stats.totalReviewed || 1)) * 100}%` : '0%' }}></div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="weak-words-section" style={{ marginTop: '24px' }}>
              <div className="section-header">
                <Target size={20} style={{ color: '#ff4757' }} />
                <h3>{t('stats.weakest_words', 'Words to Improve')}</h3>
              </div>
              <div className="weak-words-list">
                {stats.weakestWords && stats.weakestWords.length > 0 ? (
                  stats.weakestWords.map((w, i) => (
                    <div key={i} className="weak-word-item" style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateX(0)' : 'translateX(-20px)', transition: `all 0.5s ease ${i * 0.1}s` }}>
                      <div className="ww-info">
                        <strong>{w.word}</strong>
                        <span>{w.meaning}</span>
                      </div>
                      <div className="ww-count">
                        <span className="wrong-count">{w.wrongCount}</span>
                        <span className="ww-label">{t('stats.misses', 'misses')}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-weak-words">{t('stats.no_weak_words', 'You are doing great! No weak words yet.')}</p>
                )}
              </div>
            </Card>
          </div>

          <Card className="types-section">
            <div className="section-header">
              <PieChart size={20} />
              <h3>{t('stats.type_breakdown', 'Word Type Breakdown')}</h3>
            </div>
            <div className="types-list">
              {stats.typesBreakdown.map((type, i) => (
                <div key={i} className="type-stat-item" style={{ opacity: mounted ? 1 : 0, transition: `opacity 0.5s ease ${i * 0.1}s` }}>
                  <div className="type-info">
                    <span className="type-name">{t(`library.word_types.${type.type}`, type.type)}</span>
                    <span className="type-count">{type.total}</span>
                  </div>
                  <div className="type-progress-multi">
                    <div className="segment mastered" style={{ width: mounted ? `${(type.mastered / type.total) * 100}%` : '0%' }}></div>
                    <div className="segment learning" style={{ width: mounted ? `${(type.learning / type.total) * 100}%` : '0%' }}></div>
                    <div className="segment new" style={{ width: mounted ? `${(type.new / type.total) * 100}%` : '0%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
