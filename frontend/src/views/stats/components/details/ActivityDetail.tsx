import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import Card from '../../../../components/Card';
import Button from '../../../../components/Button';
import i18n from '../../../../i18n';

import { useGetStudyStatsQuery } from '../../../../store/apiSlice';

interface ActivityDetailProps {
  stats: any;
}

const ActivityDetail: React.FC<ActivityDetailProps> = ({ stats: initialStats }) => {
  const { t } = useTranslation();
  const [viewDate, setViewDate] = React.useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = React.useState(false);

  // Fetch monthly data for the calendar
  const { data: monthlyStats, isFetching } = useGetStudyStatsQuery({
    year: viewDate.getFullYear(),
    month: viewDate.getMonth()
  });

  // Use monthly data if available, fallback to initial stats
  const activeStats = monthlyStats || initialStats;

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    const next = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    if (next <= new Date()) setViewDate(next);
  };

  const handleSelectMonth = (month: number) => {
    setViewDate(new Date(viewDate.getFullYear(), month, 1));
    setShowMonthPicker(false);
  };

  const handleSelectYear = (year: number) => {
    setViewDate(new Date(year, viewDate.getMonth(), 1));
  };

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthName = viewDate.toLocaleDateString(i18n.language, { month: 'long' });
  const yearNum = viewDate.getFullYear();
  const isCurrentMonth = viewDate.getMonth() === new Date().getMonth() && viewDate.getFullYear() === new Date().getFullYear();

  const studiedDaysCount = activeStats.weeklyActivity.filter((d: any) => d.count > 0).length;
  const goalDays = 20;
  const goalPercent = Math.min((studiedDaysCount / goalDays) * 100, 100);

  return (
    <div className="detail-view animate-slide-up activity-diary">
      <div className="activity-top-row">
        <Card className="greeting-card pink-gradient">
          <div className="avatar-placeholder">🐰</div>
          <div className="greeting-text">
              <h2>{t('stats.good_job')}</h2>
              <p>{t('stats.activity_summary', { count: studiedDaysCount })}</p>
          </div>
        </Card>

        <Card className="goal-card-v2 header-goal">
           <div className="goal-header">
              <h4>{t('stats.monthly_goal')}</h4>
              <div className="goal-badges-mini">✨</div>
           </div>
           <div className="goal-visual-container">
              <div className="goal-progress-wrapper">
                 <div className="goal-track">
                    <div className="goal-fill-v2" style={{ width: `${goalPercent}%` }}>
                       <div className="goal-shimmer"></div>
                    </div>
                 </div>
              </div>
              <div className="goal-stats-v2">
                 <span className="current">{studiedDaysCount}</span>
                 <span className="separator">/</span>
                 <span className="total">{goalDays}</span>
                 <span className="unit">{t('stats.days')}</span>
              </div>
           </div>
        </Card>
      </div>

      <div className="activity-main-grid">
         <Card className="calendar-card-v2">
            <div className="calendar-v2-header">
               <h3>{t('stats.month_calendar')}</h3>
               <div className="month-nav-v2">
                  <Button variant="ghost" size="sm" className="nav-arrow" onClick={handlePrevMonth}>
                    <ArrowLeft size={18} />
                  </Button>
                  <div className="month-display" onClick={() => setShowMonthPicker(!showMonthPicker)}>
                     <span className="current-month">{monthName}</span>
                     <span className="current-year">{yearNum}</span>
                     <ArrowLeft size={14} className="-rotate-90" />
                     
                     {showMonthPicker && (
                       <div className="month-picker-popup animate-pop-in" onClick={(e) => e.stopPropagation()}>
                          <div className="year-selector">
                             {[yearNum - 1, yearNum, yearNum + 1].map(y => (
                               <button key={y} className={`year-btn ${y === yearNum ? 'active' : ''}`} onClick={() => handleSelectYear(y)}>{y}</button>
                             ))}
                          </div>
                          <div className="months-grid">
                             {Array.from({ length: 12 }).map((_, i) => {
                               const d = new Date(2000, i, 1);
                               const mName = d.toLocaleDateString(i18n.language, { month: 'short' });
                               return (
                                 <button key={i} className={`month-btn ${i === viewDate.getMonth() ? 'active' : ''}`} onClick={() => handleSelectMonth(i)}>
                                   {mName}
                                 </button>
                               );
                             })}
                          </div>
                       </div>
                     )}
                  </div>
                  <Button variant="ghost" size="sm" className="nav-arrow" onClick={handleNextMonth} disabled={isCurrentMonth}>
                    <ArrowLeft size={18} className="rotate-180" />
                  </Button>
               </div>
            </div>

            <div className={`calendar-v2-grid ${isFetching ? 'fetching' : ''}`}>
               {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(dayKey => (
                 <div key={dayKey} className="day-name-label">{t(`stats.weekdays_short.${dayKey}`)}</div>
               ))}
               {Array.from({ length: startOffset }).map((_, i) => (
                 <div key={`empty-${i}`} className="calendar-v2-day empty"></div>
               ))}
               {Array.from({ length: daysInMonth }).map((_, i) => {
                 const dayNum = i + 1;
                 const dateString = `${yearNum}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                 
                 const activityForDay = activeStats.weeklyActivity.find((d: any) => d.date === dateString);
                 const isStudied = activityForDay && activityForDay.count > 0;
                 const isToday = isCurrentMonth && dayNum === new Date().getDate();
                 
                 return (
                   <div key={dayNum} className={`calendar-v2-day ${isStudied ? 'is-studied' : ''} ${isToday ? 'is-today' : ''}`}>
                     <span className="day-num-text">{dayNum}</span>
                     {isStudied && <div className="studied-dot">🌟</div>}
                   </div>
                 );
               })}
            </div>
            <div className="calendar-v2-legend">
               <div className="legend-item"><span className="indicator studied"></span> {t('stats.legend_studied')}</div>
               <div className="legend-item"><span className="indicator today"></span> {t('stats.legend_today')}</div>
            </div>
         </Card>

         <div className="activity-side-stats">

            <div className="stats-mini-grid">
              <Card className="fun-stat-card yellow">
                <div className="icon">🔥</div>
                <div className="text">
                    <span className="val">{activeStats.streak} {t('stats.days')}</span>
                    <span className="lab">{t('stats.best_streak')}</span>
                </div>
              </Card>
              <Card className="fun-stat-card purple">
                <div className="icon">⏰</div>
                <div className="text">
                    <span className="val">{Math.round(activeStats.totalTimeSpentMinutes)} {t('stats.minutes')}</span>
                    <span className="lab">{t('stats.total_time')}</span>
                </div>
              </Card>
            </div>

            <Card className="badges-card">
               <h4>{t('stats.monthly_badges')}</h4>
               <div className="badges-list">
                  <div className={`badge-item ${studiedDaysCount >= 5 ? 'earned' : 'locked'}`}>
                     <div className="badge-icon">🏅</div>
                     <span>{t('stats.badge_diligent')}</span>
                  </div>
                  <div className={`badge-item ${activeStats.streak >= 7 ? 'earned' : 'locked'}`}>
                     <div className="badge-icon">👑</div>
                     <span>{t('stats.badge_persistent')}</span>
                  </div>
                  <div className="badge-item locked">
                     <div className="badge-icon">💎</div>
                     <span>{t('stats.badge_peerless')}</span>
                  </div>
               </div>
            </Card>
            
            {activeStats.weeklyActivity.some((d: any) => d.count > 0) && (
              <div className="recent-activity-list">
                <h4>{t('stats.recent_events')}</h4>
                {activeStats.weeklyActivity.filter((d: any) => d.count > 0).slice(-3).reverse().map((day: any, i: number) => (
                    <div key={i} className="activity-log-item">
                      <div className="log-icon">✨</div>
                      <div className="log-text">
                          <strong>{new Date(day.date).toLocaleDateString(i18n.language, { weekday: 'long' })}</strong>
                          <p>{t('stats.reviewed_text', { count: day.count })}</p>
                      </div>
                    </div>
                ))}
              </div>
            )}

            <Card className="daily-tip-card">
               <div className="tip-icon">💡</div>
               <div className="tip-content">
                  <h5>{t('stats.daily_tip_title')}</h5>
                  <p>{t('stats.daily_tip_text')}</p>
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
};

export default ActivityDetail;
