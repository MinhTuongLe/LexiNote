import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '../../../../components/Card';
import Button from '../../../../components/Button';

interface MasteryDetailProps {
  stats: any;
}

const MasteryDetail: React.FC<MasteryDetailProps> = ({ stats }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
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
            <Card className="stage-card seed-card animate-pop-in" style={{ animationDelay: '0.1s' }} onClick={() => navigate('/library?filter=new')}>
               <div className="stage-icon">🌱</div>
               <div className="stage-info">
                  <h3>{t('stats.seeds_label')}</h3>
                  <span className="count">{stats.newCount}</span>
                  <p>{t('stats.seeds_desc')}</p>
               </div>
            </Card>

            <Card className="stage-card seedling-card animate-pop-in" style={{ animationDelay: '0.3s' }} onClick={() => navigate('/library?filter=learning')}>
               <div className="stage-icon">🌿</div>
               <div className="stage-info">
                  <h3>{t('stats.seedlings_label')}</h3>
                  <span className="count">{stats.learningCount}</span>
                  <p>{t('stats.seedlings_desc')}</p>
               </div>
            </Card>

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
};

export default MasteryDetail;
