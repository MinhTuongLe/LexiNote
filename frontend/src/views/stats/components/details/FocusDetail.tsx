import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '../../../../components/Card';
import Button from '../../../../components/Button';

interface FocusDetailProps {
  stats: any;
}

const FocusDetail: React.FC<FocusDetailProps> = ({ stats }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const weakWordsCount = stats.weakestWords?.length || 0;

  return (
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
           stats.weakestWords.map((w: any, i: number) => {
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
};

export default FocusDetail;
