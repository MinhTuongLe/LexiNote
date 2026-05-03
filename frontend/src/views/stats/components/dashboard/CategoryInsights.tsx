import React from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart } from 'lucide-react';
import Card from '../../../../components/Card';

interface CategoryInsightsProps {
  typesBreakdown: any[];
  mounted: boolean;
  onClick: () => void;
}

const CategoryInsights: React.FC<CategoryInsightsProps> = ({ typesBreakdown, mounted, onClick }) => {
  const { t } = useTranslation();

  return (
    <Card className="types-section clickable" onClick={onClick}>
      <div className="section-header">
        <PieChart size={20} />
        <h3>{t('stats.type_breakdown', 'Word Type Breakdown')}</h3>
      </div>
      <div className="types-list">
        {typesBreakdown.map((type, i) => (
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
  );
};

export default CategoryInsights;
