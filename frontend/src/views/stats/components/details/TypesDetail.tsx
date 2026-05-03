import React from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../../../components/Card';

interface TypesDetailProps {
  stats: any;
}

const TypesDetail: React.FC<TypesDetailProps> = ({ stats }) => {
  const { t } = useTranslation();
  
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

  return (
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
         {sortedTypes.map((type: any, i: number) => {
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
};

export default TypesDetail;
