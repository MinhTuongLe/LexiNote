import React from 'react';
import { useTranslation } from 'react-i18next';
import { Target } from 'lucide-react';
import Card from '../../../../components/Card';

interface WeakWordsListProps {
  weakestWords: any[];
  mounted: boolean;
  onClick: () => void;
}

const WeakWordsList: React.FC<WeakWordsListProps> = ({ weakestWords, mounted, onClick }) => {
  const { t } = useTranslation();

  return (
    <Card className="weak-words-section clickable" style={{ marginTop: '24px' }} onClick={onClick}>
      <div className="section-header">
        <Target size={20} style={{ color: '#ff4757' }} />
        <h3>{t('stats.weakest_words', 'Words to Improve')}</h3>
      </div>
      <div className="weak-words-list">
        {weakestWords && weakestWords.length > 0 ? (
          weakestWords.map((w, i) => (
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
  );
};

export default WeakWordsList;
