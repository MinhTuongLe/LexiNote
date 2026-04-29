import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGetStudyStatsQuery } from '../../store/apiSlice';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { ArrowLeft, TrendingUp, Target, Award, BarChart2, PieChart, Volume2, Play } from 'lucide-react';
import CountUp from '../../components/CountUp';
import './StatsPage.css';

import StatsSkeleton from './StatsSkeleton';
import { formatTimeSpent } from '../../utils/time';
import { useNavigate } from 'react-router-dom';
import i18n from '../../i18n';

interface StatsPageProps {
  onBack: () => void;
  detail?: 'activity' | 'performance' | 'mastery' | 'focus' | 'types';
}

const StatsPage: React.FC<StatsPageProps> = ({ onBack, detail }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: stats, isLoading } = useGetStudyStatsQuery();
  const [mounted, setMounted] = React.useState(false);

  // Activity View States (Must be at top level)
  const [viewDate, setViewDate] = React.useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = React.useState(false);

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

  // Render Detail Views
  if (detail) {
    let content = null;
    let title = "";

    switch (detail) {
      case 'activity':
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

        const studiedDaysCount = stats.weeklyActivity.filter(d => d.count > 0).length;
        const goalDays = 20;
        const goalPercent = Math.min((studiedDaysCount / goalDays) * 100, 100);
        
        title = t('stats.activity_diary');
        content = (
          <div className="detail-view animate-slide-up activity-diary">
            <div className="activity-top-row">
              <Card className="greeting-card pink-gradient">
                <div className="avatar-placeholder">🐰</div>
                <div className="greeting-text">
                    <h2>{t('stats.good_job')}</h2>
                    <p>{t('stats.activity_summary', { count: studiedDaysCount })}</p>
                </div>
              </Card>

              <Card className="goal-card-v2">
                 <div className="goal-header">
                    <h4>{t('stats.monthly_goal')}</h4>
                    <div className="goal-badges-mini">✨</div>
                 </div>
                 <div className="goal-visual-container">
                    <div className="goal-progress-wrapper">
                       <div className="goal-track">
                          {[0, 25, 50, 75, 100].map(m => (
                            <div key={m} className="goal-marker" style={{ left: `${m}%` }}>
                               <span className="marker-label">{m}%</span>
                            </div>
                          ))}
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
                 <p className="goal-hint">
                    {studiedDaysCount >= goalDays 
                      ? t('stats.goal_hint_success') 
                      : t('stats.goal_hint_progress', { count: goalDays - studiedDaysCount })}
                 </p>
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
                        </div>
                        <Button variant="ghost" size="sm" className="nav-arrow" onClick={handleNextMonth} disabled={isCurrentMonth}>
                          <ArrowLeft size={18} className="rotate-180" />
                        </Button>
                     </div>
                  </div>

                  {showMonthPicker && (
                    <div className="month-picker-popup animate-pop-in">
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

                  <div className="calendar-v2-grid">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(dayKey => (
                      <div key={dayKey} className="day-name-label">{t(`stats.weekdays_short.${dayKey}`)}</div>
                    ))}
                    {Array.from({ length: startOffset }).map((_, i) => (
                      <div key={`empty-${i}`} className="calendar-v2-day empty"></div>
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const dayNum = i + 1;
                      const isStudied = isCurrentMonth && stats.weeklyActivity.some(d => {
                        const date = new Date(d.date);
                        return date.getDate() === dayNum && d.count > 0;
                      });
                      const isToday = isCurrentMonth && dayNum === new Date().getDate();
                      return (
                        <div key={i} className={`calendar-v2-day ${isStudied ? 'is-studied' : ''} ${isToday ? 'is-today' : ''}`}>
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
                          <span className="val">{stats.streak} {t('stats.days')}</span>
                          <span className="lab">{t('stats.best_streak')}</span>
                      </div>
                    </Card>
                    <Card className="fun-stat-card purple">
                      <div className="icon">⏰</div>
                      <div className="text">
                          <span className="val">{Math.round(stats.totalTimeSpentMinutes)} {t('stats.minutes')}</span>
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
                        <div className={`badge-item ${stats.streak >= 7 ? 'earned' : 'locked'}`}>
                           <div className="badge-icon">👑</div>
                           <span>{t('stats.badge_persistent')}</span>
                        </div>
                        <div className="badge-item locked">
                           <div className="badge-icon">💎</div>
                           <span>{t('stats.badge_peerless')}</span>
                        </div>
                     </div>
                  </Card>
                  
                  <div className="recent-activity-list">
                     <h4>{t('stats.recent_events')}</h4>
                     {stats.weeklyActivity.filter(d => d.count > 0).slice(-2).reverse().map((day, i) => (
                        <div key={i} className="activity-log-item">
                           <div className="log-icon">✨</div>
                           <div className="log-text">
                              <strong>{new Date(day.date).toLocaleDateString(i18n.language, { weekday: 'long' })}</strong>
                              <p>{t('stats.reviewed_text', { count: day.count })}</p>
                           </div>
                        </div>
                     ))}
                  </div>

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
        break;

      case 'performance': {
        const accuracy = stats.accuracy || 85;
        const ease = stats.averageEaseFactor || 2.5;
        const totalSessions = 42; 
        
        let feedback = t('stats.performance_feedback_keep_going');
        if (accuracy > 90) feedback = t('stats.performance_feedback_great');
        else if (accuracy > 75) feedback = t('stats.performance_feedback_good');

        title = t('stats.performance_title');
        content = (
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
                        {stats.weeklyActivity.map((d, i) => (
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
        break;
      }
      case 'mastery':
        title = t('stats.mastery_garden_title');
        content = (
          <div className="detail-view animate-slide-up mastery-garden-view">
            <Card className="garden-hero-card">
               <div className="garden-header-content">
                  <h2>{t('stats.mastery_garden_title')}</h2>
                  <p>{t('stats.garden_desc')}</p>
               </div>
               <div className="garden-health-meter">
                  <div className="meter-label">
                     <span>{t('stats.garden_health')}</span>
                     <span>{Math.round((stats.masteredCount / (stats.totalReviewed || 1)) * 100)}%</span>
                  </div>
                  <div className="meter-track">
                     <div className="meter-fill" style={{ width: `${(stats.masteredCount / (stats.totalReviewed || 1)) * 100}%` }}></div>
                  </div>
               </div>
            </Card>

            <div className="garden-stages-container">
               {/* Connecting Path SVG */}
               <svg className="growth-path-svg" viewBox="0 0 1000 100" preserveAspectRatio="none">
                  <path 
                    d="M 150 50 Q 350 50 500 50 T 850 50" 
                    className="path-bg"
                  />
                  <path 
                    d="M 150 50 Q 350 50 500 50 T 850 50" 
                    className="path-animated"
                  />
               </svg>

               <div className="garden-stages-grid">
                  {/* Seeds (New) */}
                  <Card className="stage-card seed-card animate-pop-in" style={{ animationDelay: '0.1s' }} onClick={() => navigate('/library?filter=new')}>
                     <div className="stage-icon">🌱</div>
                     <div className="stage-info">
                        <h3>{t('stats.seeds_label')}</h3>
                        <span className="count">{stats.newCount}</span>
                        <p>{t('stats.seeds_desc')}</p>
                     </div>
                  </Card>

                  {/* Seedlings (Learning) */}
                  <Card className="stage-card seedling-card animate-pop-in" style={{ animationDelay: '0.3s' }} onClick={() => navigate('/library?filter=learning')}>
                     <div className="stage-icon">🌿</div>
                     <div className="stage-info">
                        <h3>{t('stats.seedlings_label')}</h3>
                        <span className="count">{stats.learningCount}</span>
                        <p>{t('stats.seedlings_desc')}</p>
                     </div>
                  </Card>

                  {/* Mature Trees (Mastered) */}
                  <Card className="stage-card tree-card animate-pop-in" style={{ animationDelay: '0.5s' }} onClick={() => navigate('/library?filter=mastered')}>
                     <div className="stage-icon">🌳</div>
                     <div className="stage-info">
                        <h3>{t('stats.mature_trees_label')}</h3>
                        <span className="count">{stats.masteredCount}</span>
                        <p>{t('stats.trees_desc')}</p>
                     </div>
                  </Card>
               </div>
            </div>

            <div className="garden-actions-row">
               <Button className="garden-btn review" onClick={() => navigate('/study')}>
                  <span>💧</span> {t('stats.garden_action_review')}
               </Button>
               <Button className="garden-btn learn" variant="outline" onClick={() => navigate('/library')}>
                  <span>✨</span> {t('stats.garden_action_learn')}
               </Button>
            </div>
          </div>
        );
        break;
      case 'focus':
        title = t('stats.focus_zone_title');
        const weakWordsCount = stats.weakestWords?.length || 0;
        
        content = (
          <div className="detail-view animate-slide-up focus-zone-view">
            <Card className="focus-hero-card orange-gradient">
               <div className="focus-header-main">
                  <div className="focus-icon-big">
                    <span>🎯</span>
                    <div className="scan-line"></div>
                  </div>
                  <div className="focus-text">
                     <h2>{t('stats.focus_zone_title')}</h2>
                     <p>{t('stats.focus_desc')}</p>
                  </div>
               </div>
               <div className="focus-summary-stats">
                  <div className="summary-item">
                     <span className="val">{weakWordsCount}</span>
                     <span className="lab">{t('stats.weak_words_count')}</span>
                  </div>
               </div>
            </Card>

            <div className="weak-words-expanded-list">
               {weakWordsCount > 0 ? (
                 stats.weakestWords.map((w, i) => {
                   const confidence = Math.max(100 - (w.wrongCount * 10), 10);
                   let priority = 'mild';
                   if (w.wrongCount > 5) priority = 'critical';
                   else if (w.wrongCount >= 3) priority = 'warning';

                   return (
                     <Card key={i} className={`weak-word-card-v2 animate-pop-in ${priority}`} style={{ animationDelay: `${i * 0.1}s` }} onClick={() => navigate('/study')}>
                        <div className="word-main-info">
                           <div className="word-title-row">
                              <strong>{w.word}</strong>
                           </div>
                           <span>{w.meaning}</span>
                        </div>
                        <div className="confidence-section">
                           <div className="conf-label">
                              <span>{t('stats.confidence_level')}</span>
                              <span>{confidence}%</span>
                           </div>
                           <div className="conf-track">
                              <div className="conf-fill" style={{ width: `${confidence}%` }}></div>
                           </div>
                        </div>
                        <div className="card-actions-v2">
                           <div className="error-badge">
                              <span className="num">{w.wrongCount}</span>
                              <span className="lab">{t('stats.error_count')}</span>
                           </div>
                        </div>
                     </Card>
                   );
                 })
               ) : (
                 <div className="empty-focus">
                    <p>✨ {t('stats.no_weak_words_congrats')}</p>
                 </div>
               )}
            </div>

            <div className="focus-actions">
               <Button className="focus-practice-btn" disabled={weakWordsCount === 0} onClick={() => navigate('/study')}>
                  {t('stats.action_practice_weak')}
               </Button>
               <p className="focus-tip-text">💡 {t('stats.focus_tip')}</p>
            </div>
          </div>
        );
        break;
      case 'types':
        title = t('stats.types_analysis_title');
        
        const typeIcons: Record<string, string> = {
          noun: '🍎',
          verb: '🏃',
          adjective: '✨',
          adj: '✨',
          adverb: '⚡',
          adv: '⚡',
          preposition: '🔗',
          conjunction: '🧩'
        };

        const sortedTypes = [...stats.typesBreakdown].sort((a, b) => (b.mastered / b.total) - (a.mastered / a.total));

        content = (
          <div className="detail-view animate-slide-up types-analysis-view">
            <div className="types-top-row">
              <Card className="types-hero-card purple-gradient">
                 <div className="types-header-main">
                    <div className="types-icon-big">📊</div>
                    <div className="types-text">
                       <h2>{t('stats.types_analysis_title')}</h2>
                       <p>{t('stats.types_desc')}</p>
                    </div>
                 </div>
              </Card>
              <Card className="types-summary-card">
                 <p>{t('stats.category_summary', { count: sortedTypes.length })}</p>
                 <div className="top-category-highlight">
                    <span>{t('stats.top_strength')}:</span>
                    <strong>{t(`stats.type_${sortedTypes[0].type.toLowerCase()}`)}</strong>
                 </div>
              </Card>
            </div>

            <div className="types-insights-grid">
               {sortedTypes.map((type, i) => {
                 const masteredPercent = (type.mastered / type.total) * 100;
                 const learningPercent = (type.learning / type.total) * 100;
                 const newPercent = (type.new / type.total) * 100;
                 
                 const isMaster = masteredPercent > 80;

                 return (
                   <Card key={i} className={`type-insight-card-v2 animate-pop-in ${isMaster ? 'master' : ''}`} style={{ animationDelay: `${i * 0.1}s` }}>
                      <div className="type-card-header">
                         <div className="type-icon-circle">
                            {typeIcons[type.type.toLowerCase()] || '📚'}
                         </div>
                         <div className="type-name-info">
                            <h4>{t(`stats.type_${type.type.toLowerCase()}`)}</h4>
                            <span>{type.total} {t('stats.total_words')}</span>
                         </div>
                         {isMaster && (
                            <span className="status-tag master">
                               {t('stats.status_master')}
                            </span>
                         )}
                      </div>

                      <div className="type-mastery-section">
                         <div className="mastery-labels">
                            <span>{t('stats.type_mastery_label')}</span>
                            <span>{Math.round(masteredPercent)}%</span>
                         </div>
                         <div className="multi-segment-bar">
                            <div className="segment mastered" style={{ width: `${masteredPercent}%` }}></div>
                            <div className="segment learning" style={{ width: `${learningPercent}%` }}></div>
                            <div className="segment new" style={{ width: `${newPercent}%` }}></div>
                         </div>
                         <div className="segment-legend">
                            <div className="leg-item"><span className="dot mastered"></span> {type.mastered}</div>
                            <div className="leg-item"><span className="dot learning"></span> {type.learning}</div>
                            <div className="leg-item"><span className="dot new"></span> {type.new}</div>
                         </div>
                      </div>
                   </Card>
                 );
               })}
            </div>
          </div>
        );
        break;
    }

    return (
      <div className="stats-page detail-mode">
        <header className="stats-header">
          <Button variant="ghost" className="back-btn" onClick={onBack}>
            <ArrowLeft size={24} />
          </Button>
          <h1>{title}</h1>
        </header>
        {content}
      </div>
    );
  }

  return (
    <div className="stats-page">
      <div className="stats-grid-top">
        <Card className="streak-stats-card clickable" onClick={() => navigate('/stats/activity')}>
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

        <Card className="overview-stats-card clickable" onClick={() => navigate('/stats/performance')}>
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
        <Card className="weekly-activity-section clickable" onClick={() => navigate('/stats/activity')}>
          <div className="section-header">
            <TrendingUp size={20} />
            <h3>{t('stats.weekly_activity', 'Weekly Activity')}</h3>
          </div>
          <div className="weekly-chart">
            {stats.weeklyActivity.map((day, i) => {
              const maxCount = Math.max(...stats.weeklyActivity.map(d => d.count), 1);
              const targetHeight = (day.count / maxCount) * 100;
              const [y, m, d] = day.date.split('-').map(Number);
              const localDate = new Date(y, m - 1, d);
              const fullDateStr = localDate.toLocaleDateString(i18n.language, { weekday: 'long', month: 'short', day: 'numeric' });
              
              // Backend guarantees array starts from Monday (i=0 -> Mon, i=1 -> Tue, etc.)
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

        <div className="stats-row">
          <div className="stats-col-left">
            <Card className="mastery-section clickable" onClick={() => navigate('/stats/mastery')}>
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

            <Card className="weak-words-section clickable" style={{ marginTop: '24px' }} onClick={() => navigate('/stats/focus')}>
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

          <Card className="types-section clickable" onClick={() => navigate('/stats/types')}>
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
