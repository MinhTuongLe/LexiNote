import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useUpdateSettingsMutation } from '../../store/apiSlice';
import { useTranslation } from 'react-i18next';
import Button from '../../components/Button';
import './WelcomePage.css';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('welcome');
  const { user } = useSelector((state: any) => state.auth);
  const [updateSettings] = useUpdateSettingsMutation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  const handleFinish = () => {
    if (isFinishing) return;
    setIsFinishing(true);
    
    // Save to local storage for immediate persistence
    const storageKey = `hasSeenGuide_${user?.id ?? user?._id ?? user?.email ?? 'unknown'}`;
    localStorage.setItem(storageKey, 'true');
    
    // Fire update API in the background without blocking navigation
    const rawSettings = user?.settings || {};
    const hasSeenRemotely = rawSettings.preferences?.hasSeenGuide === true || rawSettings.hasSeenGuide === true;

    if (!hasSeenRemotely) {
      updateSettings({ hasSeenGuide: true })
        .unwrap()
        .catch(e => console.error('Failed to update guide status:', e));
    }
    
    // Immediately redirect to dashboard
    navigate('/dashboard', { replace: true });
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const slides = [
    {
      id: 'welcome',
      tag: t('slide1.tag'),
      title: t('slide1.title'),
      description: t('slide1.description'),
      graphic: <img src="/images/welcome_cover.png" alt="Welcome to LexiNote" className="welcome-image" />
    },
    {
      id: 'library',
      tag: t('slide2.tag'),
      title: t('slide2.title'),
      description: t('slide2.description'),
      graphic: <img src="/images/library_cover.png" alt="Library Setup" className="welcome-image" />
    },
    {
      id: 'study',
      tag: t('slide3.tag'),
      title: t('slide3.title'),
      description: t('slide3.description'),
      graphic: <img src="/images/study_cover.png" alt="Smart Study" className="welcome-image" />
    },
    {
      id: 'game',
      tag: t('slide4.tag'),
      title: t('slide4.title'),
      description: t('slide4.description'),
      graphic: <img src="/images/game_cover.png" alt="Mini Games" className="welcome-image" />
    }
  ];

  return (
    <div className="welcome-page-container">
      <div className="welcome-page-card">
        
        <button className="welcome-page-skip" onClick={handleFinish} disabled={isFinishing}>
          {t('skip')} <X size={16} style={{ marginLeft: '4px' }} />
        </button>

        {/* Left Side: Dynamic Visual Pane */}
        <div className="welcome-visual-pane">
          {slides.map((s, idx) => (
            <div key={s.id} className={`visual-scene-wrapper ${idx === currentSlide ? 'active' : ''} ${idx < currentSlide ? 'exit-left' : ''} ${idx > currentSlide ? 'exit-right' : ''}`}>
              {s.graphic}
            </div>
          ))}
        </div>

        {/* Right Side: Content Pane */}
        <div className="welcome-content-pane">
          <div className="welcome-text-area">
            <div className="welcome-tag animate-fade-in-up">{slides[currentSlide].tag}</div>
            <h1 className="welcome-title animate-fade-in-up delay-1">{slides[currentSlide].title}</h1>
            <p className="welcome-desc animate-fade-in-up delay-2">{slides[currentSlide].description}</p>
          </div>

          <div className="welcome-footer animate-fade-in-up delay-3">
            <div className="welcome-dots">
              {slides.map((_, index) => (
                <span 
                  key={index} 
                  className={`dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => !isFinishing && setCurrentSlide(index)}
                />
              ))}
            </div>
            
            <div className="welcome-actions">
              <Button 
                variant="outline" 
                onClick={handlePrev} 
                disabled={currentSlide === 0 || isFinishing} 
                className={`w-btn-prev ${currentSlide === 0 ? 'invisible' : ''}`}
              >
                <ChevronLeft size={18} /> {t('prev')}
              </Button>
              
              <Button 
                variant="primary" 
                onClick={handleNext} 
                disabled={isFinishing} 
                className="w-btn-next"
              >
                {currentSlide === slides.length - 1 ? (
                  <>{isFinishing ? t('processing') : t('start')} <Sparkles size={18} style={{ marginLeft: '6px' }}/></>
                ) : (
                  <>{t('next')} <ChevronRight size={18} style={{ marginLeft: '6px' }}/></>
                )}
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
