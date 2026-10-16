import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { 
  RotateCw, 
  Check, 
  AlertTriangle, 
  Zap, 
  X, 
  Volume2, 
  VolumeX, 
  Send, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { useUpdateSRSMutation, useGetDueReviewsQuery } from '../store/apiSlice';
import { useCuteDialog } from '../context/useCuteDialog';
import { useTranslation } from 'react-i18next';
import { useSound } from '../hooks/useSound';
import { speakText } from '../utils/speech';
import './StudyMode.css';

interface StudyModeProps {
  onComplete: () => void;
}

type StudyModeType = 'flashcard' | 'quiz' | 'writing' | 'listening';

const StudyMode: React.FC<StudyModeProps> = ({ onComplete }) => {
  const { data: dueReviews = [], isLoading } = useGetDueReviewsQuery();
  const { playSound } = useSound();
  
  const [studyMode, setStudyMode] = useState<StudyModeType>('flashcard');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [results, setResults] = useState<{ word: string, rating: string, color: string }[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  // Quiz Mode states
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isQuizAnswered, setIsQuizAnswered] = useState(false);

  // Writing Mode states
  const [writingInput, setWritingInput] = useState('');
  const [writingFeedback, setWritingFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');

  // RTK Query Mutation
  const [updateSRS] = useUpdateSRSMutation();
  const { showAlert } = useCuteDialog();
  const { t } = useTranslation();

  const currentReview = dueReviews[currentIndex];
  const word = currentReview && typeof currentReview.word === 'object' ? currentReview.word : null;

  // Auto speak when new card is shown
  useEffect(() => {
    if (word && autoSpeak && !isFinished) {
      speakText(word.word);
    }
  }, [currentIndex, word, autoSpeak, isFinished, studyMode]);

  // Reset interactive states on index change
  useEffect(() => {
    setSelectedOption(null);
    setIsQuizAnswered(false);
    setWritingInput('');
    setWritingFeedback('idle');
    setIsFlipped(false);
  }, [currentIndex, studyMode]);

  // Generate 4 randomized choices for Quiz and Listening modes
  const quizChoices = useMemo(() => {
    if (!word) return [];
    const correct = word.meaningVi;
    
    // Pick 3 distractors from other due reviews
    const otherMeanings = dueReviews
      .map(r => typeof r.word === 'object' ? r.word?.meaningVi : '')
      .filter((m): m is string => Boolean(m) && m !== correct);
    
    // Fallback filler meanings if user has fewer than 4 due words
    const fallbackFillers = [
      'Khả năng phục hồi',
      'Đạt được mục tiêu',
      'Thành thạo kỹ năng',
      'Phát triển bền vững',
      'Thích nghi nhanh chóng'
    ];
    
    const pool = Array.from(new Set([...otherMeanings, ...fallbackFillers]));
    const shuffledPool = pool.sort(() => 0.5 - Math.random());
    const distractors = shuffledPool.slice(0, 3);
    
    return [correct, ...distractors].sort(() => 0.5 - Math.random());
  }, [word, dueReviews]);

  const handleRate = useCallback(async (quality: 1 | 3 | 5) => {
    if (!word || !currentReview) return;
    try {
      const ratingInfo = 
        quality === 1 ? { label: 'hard', color: '#fab1a0' } :
        quality === 3 ? { label: 'medium', color: '#ffeaa7' } :
        { label: 'easy', color: '#55efc4' };

      setResults(prev => [...prev, { 
        word: word.word,
        rating: ratingInfo.label,
        color: ratingInfo.color
      }]);

      if (quality >= 3) playSound('success');
      else playSound('pop');

      await updateSRS({ reviewId: currentReview.id, quality }).unwrap();
      
      if (currentIndex < dueReviews.length - 1) {
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex(prev => prev + 1), 350);
      } else {
        setIsFinished(true);
      }
    } catch (err) {
      console.error(err);
      showAlert(t('common.error'), t('study.update_progress_error'), 'error');
    }
  }, [word, currentReview, playSound, updateSRS, currentIndex, dueReviews.length, showAlert, t]);

  const handleQuizSelect = (choice: string) => {
    if (isQuizAnswered || !word) return;
    setSelectedOption(choice);
    setIsQuizAnswered(true);

    const isCorrect = choice === word.meaningVi;
    if (isCorrect) {
      playSound('success');
      setTimeout(() => handleRate(5), 900);
    } else {
      playSound('pop');
      setTimeout(() => handleRate(1), 1600);
    }
  };

  const handleWritingSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (writingFeedback !== 'idle' || !word || !writingInput.trim()) return;

    const normalizedInput = writingInput.trim().toLowerCase();
    const normalizedWord = word.word.trim().toLowerCase();

    if (normalizedInput === normalizedWord) {
      setWritingFeedback('correct');
      playSound('success');
      setTimeout(() => handleRate(5), 900);
    } else {
      setWritingFeedback('wrong');
      playSound('pop');
      setTimeout(() => handleRate(1), 1800);
    }
  };

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

  if (!word) return <div>{t('common.loading')}</div>;

  const handleSpeakWord = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakText(word.word);
  };

  return (
    <div className="study-container">
      {/* Top Controls Header */}
      <div className="study-header">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentIndex + 1) / dueReviews.length) * 100}%` }}
          ></div>
          <span>{currentIndex + 1} / {dueReviews.length}</span>
        </div>

        <button 
          className="audio-toggle-btn"
          onClick={() => setAutoSpeak(!autoSpeak)}
          title={autoSpeak ? "Tự động phát âm: BẬT" : "Tự động phát âm: TẮT"}
        >
          {autoSpeak ? <Volume2 size={18} className="text-primary" /> : <VolumeX size={18} className="text-muted" />}
        </button>

        <button className="exit-study-btn" onClick={onComplete} title={t('study.exit_study')}>
          <X size={20} />
        </button>
      </div>

      {/* Study Mode Selector Bar */}
      <div className="study-mode-selector">
        <button 
          className={`mode-btn ${studyMode === 'flashcard' ? 'active' : ''}`}
          onClick={() => setStudyMode('flashcard')}
        >
          🎴 Thẻ Flashcard
        </button>
        <button 
          className={`mode-btn ${studyMode === 'quiz' ? 'active' : ''}`}
          onClick={() => setStudyMode('quiz')}
        >
          🎯 Trắc nghiệm
        </button>
        <button 
          className={`mode-btn ${studyMode === 'writing' ? 'active' : ''}`}
          onClick={() => setStudyMode('writing')}
        >
          ✍️ Gõ từ
        </button>
        <button 
          className={`mode-btn ${studyMode === 'listening' ? 'active' : ''}`}
          onClick={() => setStudyMode('listening')}
        >
          🎧 Luyện nghe
        </button>
      </div>

      {/* MODE 1: FLASHCARD */}
      {studyMode === 'flashcard' && (
        <>
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
                  <div className="card-top-bar">
                    <span className="card-hint">{t('study.front')}</span>
                    <button 
                      className="speaker-btn"
                      onClick={handleSpeakWord}
                      title="Phát âm từ vựng"
                    >
                      <Volume2 size={22} />
                    </button>
                  </div>

                  <h1 className="flashcard-word">{word.word}</h1>
                  {word.phonetic && <span className="flashcard-phonetic">{word.phonetic}</span>}
                  {word.type && <span className="flashcard-type-tag">{word.type}</span>}
                  <div className="tap-hint">{t('study.tap_to_flip')}</div>
                </Card>
              </div>

              {/* Back */}
              <div className="flashcard-face back-face">
                <Card className="flashcard-card">
                  <div className="card-top-bar">
                    <span className="card-hint">{t('study.back')}</span>
                    <button 
                      className="speaker-btn"
                      onClick={handleSpeakWord}
                      title="Phát âm từ vựng"
                    >
                      <Volume2 size={22} />
                    </button>
                  </div>

                  <div className="back-content">
                    <h1 className="back-word-title">{word.word}</h1>
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
        </>
      )}

      {/* MODE 2: MULTIPLE CHOICE QUIZ */}
      {studyMode === 'quiz' && (
        <Card className="interactive-study-card">
          <div className="interactive-header">
            <span className="interactive-badge">🎯 Trắc nghiệm 4 lựa chọn</span>
            <button className="speaker-btn" onClick={handleSpeakWord}>
              <Volume2 size={22} />
            </button>
          </div>

          <div className="quiz-target-word">
            <h1>{word.word}</h1>
            {word.phonetic && <span className="target-phonetic">{word.phonetic}</span>}
            {word.type && <span className="flashcard-type-tag">{word.type}</span>}
          </div>

          <p className="quiz-prompt">Chọn nghĩa tiếng Việt chính xác nhất của từ trên:</p>

          <div className="quiz-options-grid">
            {quizChoices.map((choice, i) => {
              const isSelected = selectedOption === choice;
              const isCorrectAnswer = choice === word.meaningVi;
              let statusClass = '';

              if (isQuizAnswered) {
                if (isCorrectAnswer) statusClass = 'correct';
                else if (isSelected) statusClass = 'wrong';
              }

              return (
                <button
                  key={i}
                  disabled={isQuizAnswered}
                  onClick={() => handleQuizSelect(choice)}
                  className={`quiz-option-btn ${statusClass}`}
                >
                  <span className="quiz-option-letter">{['A', 'B', 'C', 'D'][i]}</span>
                  <span className="quiz-option-text">{choice}</span>
                  {isQuizAnswered && isCorrectAnswer && <Check size={18} className="option-icon" />}
                  {isQuizAnswered && isSelected && !isCorrectAnswer && <X size={18} className="option-icon" />}
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* MODE 3: WRITING / SPELLING */}
      {studyMode === 'writing' && (
        <Card className="interactive-study-card">
          <div className="interactive-header">
            <span className="interactive-badge">✍️ Luyện gõ từ & Nhớ mặt chữ</span>
            <button className="speaker-btn" onClick={handleSpeakWord}>
              <Volume2 size={22} />
            </button>
          </div>

          <div className="writing-prompt-box">
            <span className="writing-label">Nghĩa tiếng Việt:</span>
            <h2 className="writing-vi-meaning">{word.meaningVi}</h2>
            {word.example && (
              <p className="writing-example-hint">
                💡 Ví dụ: "{word.example.replace(new RegExp(word.word, 'gi'), '_____')}"
              </p>
            )}
          </div>

          <form onSubmit={handleWritingSubmit} className="writing-form">
            <div className={`writing-input-wrapper ${writingFeedback}`}>
              <input
                type="text"
                autoFocus
                placeholder={`Nhập từ tiếng Anh... (bắt đầu bằng "${word.word.charAt(0)}")`}
                value={writingInput}
                onChange={(e) => setWritingInput(e.target.value)}
                disabled={writingFeedback !== 'idle'}
                className="writing-input"
              />
              <button 
                type="submit" 
                disabled={!writingInput.trim() || writingFeedback !== 'idle'}
                className="writing-submit-btn"
              >
                <Send size={18} />
              </button>
            </div>

            {writingFeedback === 'correct' && (
              <div className="feedback-banner success animate-pop">
                <Check size={18} /> Chính xác! Rất tuyệt vời!
              </div>
            )}

            {writingFeedback === 'wrong' && (
              <div className="feedback-banner wrong animate-pop">
                <X size={18} /> Chưa chính xác! Đáp án đúng: <strong>{word.word}</strong>
              </div>
            )}
          </form>
        </Card>
      )}

      {/* MODE 4: LISTENING / DICTATION */}
      {studyMode === 'listening' && (
        <Card className="interactive-study-card">
          <div className="interactive-header">
            <span className="interactive-badge">🎧 Luyện nghe phản xạ</span>
            <span className="listening-counter">Nghe audio</span>
          </div>

          <div className="listening-hero">
            <button className="listening-play-btn animate-pulse" onClick={handleSpeakWord}>
              <Volume2 size={44} />
            </button>
            <p className="listening-hint">Bấm vào loa để nghe lại phát âm</p>
          </div>

          <p className="quiz-prompt">Nghe âm thanh và chọn từ/nghĩa chính xác:</p>

          <div className="quiz-options-grid">
            {quizChoices.map((choice, i) => {
              const isSelected = selectedOption === choice;
              const isCorrectAnswer = choice === word.meaningVi;
              let statusClass = '';

              if (isQuizAnswered) {
                if (isCorrectAnswer) statusClass = 'correct';
                else if (isSelected) statusClass = 'wrong';
              }

              return (
                <button
                  key={i}
                  disabled={isQuizAnswered}
                  onClick={() => handleQuizSelect(choice)}
                  className={`quiz-option-btn ${statusClass}`}
                >
                  <span className="quiz-option-letter">{['A', 'B', 'C', 'D'][i]}</span>
                  <span className="quiz-option-text">{choice}</span>
                  {isQuizAnswered && isCorrectAnswer && <Check size={18} className="option-icon" />}
                  {isQuizAnswered && isSelected && !isCorrectAnswer && <X size={18} className="option-icon" />}
                </button>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudyMode;
