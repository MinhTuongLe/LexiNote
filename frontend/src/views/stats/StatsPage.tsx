import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGetStudyStatsQuery } from '../../store/apiSlice';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './StatsPage.css';

import StatsSkeleton from './StatsSkeleton';

// Dashboard Components
import StreakCard from './components/dashboard/StreakCard';
import OverviewCard from './components/dashboard/OverviewCard';
import WeeklyActivityChart from './components/dashboard/WeeklyActivityChart';
import LearningProgress from './components/dashboard/LearningProgress';
import WeakWordsList from './components/dashboard/WeakWordsList';
import CategoryInsights from './components/dashboard/CategoryInsights';

// Detail Components
import ActivityDetail from './components/details/ActivityDetail';
import PerformanceDetail from './components/details/PerformanceDetail';
import MasteryDetail from './components/details/MasteryDetail';
import FocusDetail from './components/details/FocusDetail';
import TypesDetail from './components/details/TypesDetail';

interface StatsPageProps {
  onBack: () => void;
  detail?: 'activity' | 'performance' | 'mastery' | 'focus' | 'types';
}

const StatsPage: React.FC<StatsPageProps> = ({ onBack, detail }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  // Render Detail Views
  if (detail) {
    let content = null;
    let title = "";

    switch (detail) {
      case 'activity':
        title = t('stats.activity_diary');
        content = <ActivityDetail stats={stats} />;
        break;
      case 'performance':
        title = t('stats.performance_title');
        content = <PerformanceDetail stats={stats} />;
        break;
      case 'mastery':
        title = t('stats.mastery_garden_title');
        content = <MasteryDetail stats={stats} />;
        break;
      case 'focus':
        title = t('stats.focus_zone_title');
        content = <FocusDetail stats={stats} />;
        break;
      case 'types':
        title = t('stats.types_analysis_title');
        content = <TypesDetail stats={stats} />;
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
        <StreakCard 
          streak={stats.streak} 
          mounted={mounted} 
          onClick={() => navigate('/stats/activity')} 
        />

        <OverviewCard 
          stats={stats} 
          mounted={mounted} 
          onClick={() => navigate('/stats/performance')} 
        />
      </div>

      <div className="stats-sections">
        <WeeklyActivityChart 
          weeklyActivity={stats.weeklyActivity} 
          mounted={mounted} 
          onClick={() => navigate('/stats/activity')} 
        />

        <div className="stats-row">
          <div className="stats-col-left">
            <LearningProgress 
              stats={stats} 
              mounted={mounted} 
              onClick={() => navigate('/stats/mastery')} 
            />

            <WeakWordsList 
              weakestWords={stats.weakestWords} 
              mounted={mounted} 
              onClick={() => navigate('/stats/focus')} 
            />
          </div>

          <CategoryInsights 
            typesBreakdown={stats.typesBreakdown} 
            mounted={mounted} 
            onClick={() => navigate('/stats/types')} 
          />
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
