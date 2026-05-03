import React from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../../../components/Card';

interface PerformanceDetailProps {
  stats: any;
}

const PerformanceDetail: React.FC<PerformanceDetailProps> = ({ stats }) => {
  const { t } = useTranslation();
  const accuracy = stats.accuracy || 85;
  const ease = stats.averageEaseFactor || 2.5;
  const totalSessions = 42; 
  
  let feedback = t('stats.performance_feedback_keep_going');
  if (accuracy > 90) feedback = t('stats.performance_feedback_great');
  else if (accuracy > 75) feedback = t('stats.performance_feedback_good');

  return (
    <div className="detail-view animate-slide-up performance-view">
      <div className="performance-hero-grid">
         <Card className="gauge-card">
            <div className="gauge-container">
               <svg viewBox="0 0 100 100" className="gauge-svg">
                  <circle cx="50" cy="50" r="45" className="gauge-bg" />
                  <circle 
                    cx="50" cy="50" r="45" 
                    className="gauge-progress" 
                    style={{ strokeDasharray: `${accuracy * 2.83} 283` }}
                  />
                  <text x="50" y="50" className="gauge-text">{accuracy}%</text>
               </svg>
            </div>
            <div className="gauge-info">
               <div className="accuracy-label-row">
                  <h4>{t('stats.accuracy_score')}</h4>
                  <span className="comparison-badge pos">+2% {t('stats.vs_last_week')}</span>
               </div>
               <p>{t('stats.accuracy_desc')}</p>
               
               <div className="accuracy-trend-mini">
                  {stats.weeklyActivity.map((d: any, i: number) => (
                     <div key={i} className="trend-bar-wrapper">
                        <div 
                           className="trend-bar" 
                           style={{ height: `${(d.count > 0 ? accuracy - (i % 3) : 0)}%` }}
                        ></div>
                     </div>
                  ))}
               </div>
            </div>
         </Card>

         <Card className="feedback-card blue-gradient">
            <div className="feedback-content">
               <div className="quote-icon">✨</div>
               <p>{feedback}</p>
               <div className="next-goal">
                  <span>{t('stats.next_milestone')}: <strong>95%</strong></span>
               </div>
            </div>
         </Card>
      </div>

      <div className="performance-stats-grid">
         <Card className="stat-meter-card">
            <div className="meter-header">
               <div className="icon">🚀</div>
               <div className="text">
                  <h4>{t('stats.average_ease_title')}</h4>
                  <p>{t('stats.ease_desc')}</p>
               </div>
            </div>
            <div className="meter-container">
               <div className="meter-labels">
                  <span>{t('stats.hard')}</span>
                  <span>{t('stats.easy')}</span>
               </div>
               <div className="meter-track">
                  <div className="meter-fill" style={{ width: `${(ease / 5) * 100}%` }}></div>
                  <div className="meter-pointer" style={{ left: `${(ease / 5) * 100}%` }}></div>
               </div>
            </div>
         </Card>

         <Card className="stat-meter-card">
            <div className="meter-header">
               <div className="icon">⏱️</div>
               <div className="text">
                  <h4>{t('stats.time_efficiency')}</h4>
                  <p>{t('stats.time_desc')}</p>
               </div>
            </div>
            <div className="big-time-display">
               <span className="value">{Math.round(stats.totalTimeSpentMinutes)}</span>
               <span className="unit">{t('stats.minutes')}</span>
            </div>
         </Card>
      </div>

      <div className="performance-mini-row">
         <Card className="mini-info-card">
            <div className="icon">🎯</div>
            <div className="data">
               <span className="val">{totalSessions}</span>
               <span className="lab">{t('stats.session_count')}</span>
            </div>
         </Card>
         <Card className="mini-info-card">
            <div className="icon">⚡</div>
            <div className="data">
               <span className="val">{accuracy > 80 ? t('stats.learning_speed_fast') : t('stats.learning_speed_normal')}</span>
               <span className="lab">{t('stats.learning_speed')}</span>
            </div>
         </Card>
         <Card className="mini-info-card">
            <div className="icon">🧠</div>
            <div className="data">
               <span className="val">{Math.round(stats.totalTimeSpentMinutes / totalSessions)}m</span>
               <span className="lab">{t('stats.focus_time')}</span>
            </div>
         </Card>
      </div>
    </div>
  );
};

export default PerformanceDetail;
