import React from 'react';
import { useTranslation } from 'react-i18next';
import { Award } from 'lucide-react';
import Card from '../../../../components/Card';

interface LearningProgressProps {
  stats: any;
  mounted: boolean;
  onClick: () => void;
}

const LearningProgress: React.FC<LearningProgressProps> = ({ stats, mounted, onClick }) => {
  const { t } = useTranslation();
  const total = stats.totalReviewed || 1;

  return (
    <Card className="mastery-section clickable" onClick={onClick}>
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
            <div className="fill mastered" style={{ width: mounted ? `${(stats.masteredCount / total) * 100}%` : '0%' }}></div>
          </div>
        </div>
        <div className="mastery-item">
          <div className="mastery-label">
            <span>{t('stats.learning', 'Learning')}</span>
            <span className="count">{stats.learningCount} {t('stats.words', 'words')}</span>
          </div>
          <div className="progress-bar-mastery">
            <div className="fill learning" style={{ width: mounted ? `${(stats.learningCount / total) * 100}%` : '0%' }}></div>
          </div>
        </div>
        <div className="mastery-item">
          <div className="mastery-label">
            <span>{t('stats.new', 'New')}</span>
            <span className="count">{stats.newCount} {t('stats.words', 'words')}</span>
          </div>
          <div className="progress-bar-mastery">
            <div className="fill new" style={{ width: mounted ? `${(stats.newCount / total) * 100}%` : '0%' }}></div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default LearningProgress;
