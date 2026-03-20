import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { RotateCw, Check, AlertTriangle, Zap, X } from 'lucide-react';
import { useUpdateSRSMutation, useGetDueReviewsQuery } from '../store/apiSlice';
import { useCuteDialog } from '../context/DialogContext';
import './StudyMode.css';

interface StudyModeProps {
  onComplete: () => void;
}

const StudyMode: React.FC<StudyModeProps> = ({ onComplete }) => {
  const { data: dueReviews = [], isLoading } = useGetDueReviewsQuery();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<{ word: string, rating: string, color: string }[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  // RTK Query Mutation
  const [updateSRS] = useUpdateSRSMutation();
  const { showAlert } = useCuteDialog();

  if (isFinished) {
    return (
      <div className="study-complete cute-card">
        <h2>Session Complete! 🎉</h2>
        <p>You've reviewed <strong>{results.length}</strong> words.</p>
        
        <div className="results-list">
          {results.map((res, i) => (
            <div key={i} className="result-item">
              <span className="res-word">{res.word}</span>
              <span className={`res-rating ${res.rating.toLowerCase()}`} style={{ backgroundColor: res.color }}>
                {res.rating}
              </span>
            </div>
          ))}
        </div>

        <Button size="lg" onClick={onComplete}>Back to Dashboard</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="study-complete cute-card">
        <h2>Loading words... 🐰✨</h2>
      </div>
    );
  }

  if (dueReviews.length === 0) {
    return (
      <div className="study-complete cute-card">
        <h2>No words to review! ✨</h2>
        <p>Your library is empty or you've finished all reviews today.</p>
        <Button onClick={onComplete}>Back to Dashboard</Button>
      </div>
    );
  }

  const currentReview = dueReviews[currentIndex];
  const word = typeof currentReview.word === 'object' ? currentReview.word : null;

  if (!word) return <div>Loading word...</div>;

  const handleRate = async (quality: 1 | 3 | 5) => {
    try {
      const ratingInfo = 
        quality === 1 ? { label: 'Hard', color: '#fab1a0' } :
        quality === 3 ? { label: 'Medium', color: '#ffeaa7' } :
        { label: 'Easy', color: '#55efc4' };

      setResults(prev => [...prev, { 
        word: (currentReview.word as any).word, 
        rating: ratingInfo.label,
        color: ratingInfo.color
      }]);

      await updateSRS({ reviewId: currentReview.id, quality }).unwrap();
      
      if (currentIndex < dueReviews.length - 1) {
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
      } else {
        setIsFinished(true);
      }
    } catch (err) {
      console.error(err);
      showAlert('Oops! 😿', 'Failed to update progress!', 'error');
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
        <button className="exit-study-btn" onClick={onComplete} title="Exit Study Mode">
          <X size={20} />
        </button>
      </div>

      <div className={`flashcard-container ${isFlipped ? 'flipped' : ''}`} onClick={() => !isFlipped && setIsFlipped(true)}>
        <div className="flashcard-inner">
          {/* Front */}
          <div className="flashcard-face front-face">
            <Card className="flashcard-card">
              <div className="card-hint">Front</div>
              <h1 className="flashcard-word">{word.word}</h1>
              <div className="tap-hint">Tap to flip 💫</div>
            </Card>
          </div>

          {/* Back */}
          <div className="flashcard-face back-face">
            <Card className="flashcard-card">
              <div className="card-hint">Back</div>
              <div className="back-content">
                <h2 className="back-vi">{word.meaningVi}</h2>
                {word.example && (
                  <div className="back-example">
                    <strong>Example:</strong>
                    <p>"{word.example}"</p>
                  </div>
                )}
              </div>
              
              <div className="rating-actions">
                <button className="rate-btn hard" onClick={(e) => { e.stopPropagation(); handleRate(1); }}>
                  <AlertTriangle size={20} />
                  <span>Hard</span>
                </button>
                <button className="rate-btn medium" onClick={(e) => { e.stopPropagation(); handleRate(3); }}>
                  <Check size={20} />
                  <span>Medium</span>
                </button>
                <button className="rate-btn easy" onClick={(e) => { e.stopPropagation(); handleRate(5); }}>
                  <Zap size={20} />
                  <span>Easy</span>
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="study-controls">
        <Button variant="outline" onClick={() => setIsFlipped(!isFlipped)}>
          <RotateCw size={20} /> Flip Card
        </Button>
      </div>
    </div>
  );
};

export default StudyMode;
