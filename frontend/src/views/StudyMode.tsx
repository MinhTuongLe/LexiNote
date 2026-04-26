import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { RotateCw, Check, AlertTriangle, Zap, X } from 'lucide-react';
import { useUpdateSRSMutation, useGetDueReviewsQuery } from '../store/apiSlice';
import { useCuteDialog } from '../context/DialogContext';
import { useTranslation } from 'react-i18next';
import { useSound } from '../hooks/useSound';
import './StudyMode.css';

interface StudyModeProps {
  onComplete: () => void;
}

const StudyMode: React.FC<StudyModeProps> = ({ onComplete }) => {
  const { data: dueReviews = [], isLoading } = useGetDueReviewsQuery();
  const { playSound } = useSound();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<{ word: string, rating: string, color: string }[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  // RTK Query Mutation
  const [updateSRS] = useUpdateSRSMutation();
  const { showAlert } = useCuteDialog();
  const { t } = useTranslation();

  if (isFinished) {
    return (
      <div className="study-complete cute-card">
        <h2>{t('study.session_complete')}</h2>
        <p>{t('study.review_summary', { count: results.length })}</p>
        
        <div className="results-list">
          {results.map((res, i) => (
            <div key={i} className="result-item">
              <span className="res-word">{res.word}</span>
              <span className={`res-rating ${res.rating.toLowerCase()}`} style={{ backgroundColor: res.color }}>
                {t(`study.${res.rating.toLowerCase()}`)}
              </span>
            </div>
          ))}
        </div>

        <Button size="lg" onClick={onComplete}>{t('study.back_to_dashboard')}</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="study-complete cute-card">
        <h2>{t('study.loading_words')}</h2>
      </div>
    );
  }

  if (dueReviews.length === 0) {
    return (
      <div className="study-complete cute-card">
        <h2>{t('study.no_words_due')}</h2>
        <p>{t('study.empty_study_desc')}</p>
        <Button onClick={onComplete}>{t('study.back_to_dashboard')}</Button>
      </div>
    );
  }

  const currentReview = dueReviews[currentIndex];
  const word = typeof currentReview.word === 'object' ? currentReview.word : null;

  if (!word) return <div>{t('common.loading')}</div>;

  const handleRate = async (quality: 1 | 3 | 5) => {
    try {
      const ratingInfo = 
        quality === 1 ? { label: 'hard', color: '#fab1a0' } :
        quality === 3 ? { label: 'medium', color: '#ffeaa7' } :
        { label: 'easy', color: '#55efc4' };

      setResults(prev => [...prev, { 
        word: (currentReview.word as any).word, 
        rating: ratingInfo.label,
        color: ratingInfo.color
      }]);

      if (quality >= 3) playSound('success');
      else playSound('pop');

      await updateSRS({ reviewId: currentReview.id, quality }).unwrap();
      
      if (currentIndex < dueReviews.length - 1) {
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
      } else {
        setIsFinished(true);
      }
    } catch (err) {
      console.error(err);
      showAlert(t('common.error'), t('study.update_progress_error'), 'error');
    }
  };

  return (
    <div className="study-container">
      <div className="study-header">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentIndex + 1) / dueReviews.length) * 100}%` }}
          ></div>
          <span>{currentIndex + 1} / {dueReviews.length}</span>
        </div>
        <button className="exit-study-btn" onClick={onComplete} title={t('study.exit_study')}>
          <X size={20} />
        </button>
      </div>

      <div className={`flashcard-container ${isFlipped ? 'flipped' : ''}`} onClick={() => {
        if (!isFlipped) {
          setIsFlipped(true);
          playSound('flip');
        }
      }}>
        <div className="flashcard-inner">
          {/* Front */}
          <div className="flashcard-face front-face">
            <Card className="flashcard-card">
              <div className="card-hint">{t('study.front')}</div>
              <h1 className="flashcard-word">{word.word}</h1>
              <div className="tap-hint">{t('study.tap_to_flip')}</div>
            </Card>
          </div>

          {/* Back */}
          <div className="flashcard-face back-face">
            <Card className="flashcard-card">
              <div className="card-hint">{t('study.back')}</div>
              <div className="back-content">
                <h2 className="back-vi">{word.meaningVi}</h2>
                {word.example && (
                  <div className="back-example">
                    <strong>{t('words.example_label')}:</strong>
                    <p>"{word.example}"</p>
                  </div>
                )}
              </div>
              
              <div className="rating-actions">
                <button className="rate-btn hard" onClick={(e) => { e.stopPropagation(); handleRate(1); }}>
                  <AlertTriangle size={20} />
                  <span>{t('study.hard')}</span>
                </button>
                <button className="rate-btn medium" onClick={(e) => { e.stopPropagation(); handleRate(3); }}>
                  <Check size={20} />
                  <span>{t('study.medium')}</span>
                </button>
                <button className="rate-btn easy" onClick={(e) => { e.stopPropagation(); handleRate(5); }}>
                  <Zap size={20} />
                  <span>{t('study.easy')}</span>
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="study-controls">
        <Button variant="outline" onClick={() => {
          setIsFlipped(!isFlipped);
          playSound('flip');
        }}>
          <RotateCw size={20} /> {t('study.flip_card')}
        </Button>
      </div>
    </div>
  );
};

export default StudyMode;
