import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Button from './components/Button';
import Card from './components/Card';
import Modal from './components/Modal';
import WordForm from './components/WordForm';
import WordImport from './components/WordImport';
import Library from './views/Library';
import StudyMode from './views/StudyMode';
import ProfilePage from './views/profile/ProfilePage';
import SettingsPage from './views/settings/SettingsPage';
import LanguageSettingsPage from './views/settings/LanguageSettingsPage';
import ForgotPassword from './views/auth/ForgotPassword';
import MatchGame from './views/games/MatchGame';
import ScrollToTop from './components/ScrollToTop';
import SkeletonWordCard from './components/SkeletonWordCard';
import { Plus, Play, Book, TrendingUp, Upload, Gamepad2 } from 'lucide-react';
import { 
  useGetDashboardStatsQuery,
  useCreateWordMutation, 
  useImportWordsMutation,
  useGetMeQuery
} from './store/apiSlice';
import { useCuteDialog } from './context/DialogContext';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { updateUser, setInitialized, logout } from './store/authSlice';
import { WORD_TYPES } from './constants/wordTypes';
import Login from './views/auth/Login';
import Register from './views/auth/Register';
import VerifyEmail from './views/auth/VerifyEmail';
import type { CreateWordDTO } from './types';
import './components/Skeleton.css';
import './App.css';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  const { user, isAuthenticated, isInitialized } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const { showAlert } = useCuteDialog();
  const { t } = useTranslation();

  // Always sync user profile when authenticated
  const { data: meData, error: meError, isLoading: meLoading } = useGetMeQuery(undefined, { 
    skip: !isAuthenticated 
  });

  useEffect(() => {
    if (meData) {
      dispatch(updateUser(meData.user));
      dispatch(setInitialized());
    } else if (meError) {
      // If the me query fails (e.g. 401 Unauthorized), we logout to clear stale state
      dispatch(logout());
      dispatch(setInitialized());
    }
  }, [meData, meError, dispatch]);

  // Global error handler for system-wide failures
  useEffect(() => {
    const handleSystemError = (e: any) => {
      showAlert(t('common.error'), e.detail || t('common.system_error'), 'error');
    };
    window.addEventListener('system-error', handleSystemError);
    return () => window.removeEventListener('system-error', handleSystemError);
  }, [showAlert, t]);

  // RTK Query hooks - Top level (required by React)
  const { data: stats, isLoading: statsLoading } = useGetDashboardStatsQuery(undefined, { skip: !isAuthenticated });
  const [createWord] = useCreateWordMutation();
  const [importWords, { isLoading: isImporting }] = useImportWordsMutation();

  // Reset entirely UI state on Logout so the next person gets a clean slate 
  useEffect(() => {
    if (!isAuthenticated && isInitialized) {
      if (location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/forgot') {
        navigate('/login');
      }
    }
  }, [isAuthenticated, isInitialized, navigate, location.pathname]);

  // Show generic loading if checking session on hard reload
  if (isAuthenticated && !isInitialized && meLoading) {
    return (
      <div className="app-container loading-container">
        <div className="cute-loader">
          <span>🐰</span>
          <span>🥕</span>
          <span>✨</span>
        </div>
        <h2 className="loading-text">
          {t('common.loading')}
        </h2>
      </div>
    );
  }

  const getTypeLabel = (typeValue: string) => {
    const defaultType = WORD_TYPES.find(t => t.value === typeValue);
    if (defaultType) return t(`library.word_types.${typeValue}`);
    const customType = user?.settings?.wordTypes?.find((t: any) => t.value === typeValue);
    return customType ? customType.label : typeValue;
  };

  if (!isAuthenticated) {
    return (
      <div className="app-container">
        <Navbar />
        <main className="main-content auth-layout">
          <Routes>
            <Route path="/login" element={<Login onSwitch={() => navigate('/register')} onForgot={() => navigate('/forgot')} />} />
            <Route path="/register" element={<Register onSwitch={() => navigate('/login')} />} />
            <Route path="/forgot" element={<ForgotPassword onBack={() => navigate('/login')} />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    );
  }

  const handleAddWord = async (data: CreateWordDTO) => {
    try {
      await createWord(data).unwrap();
      showAlert(t('common.success'), t('dashboard.add_success'), 'success');
      setIsModalOpen(false);
    } catch (err) {
      showAlert(t('common.error'), t('dashboard.add_error'), 'error');
    }
  };

  const handleImport = async (words: any[]) => {
    try {
      await importWords(words).unwrap();
      showAlert(t('common.success'), t('dashboard.import_success', { count: words.length }), 'success');
      setIsImportModalOpen(false);
    } catch (err) {
      showAlert(t('common.error'), t('dashboard.import_error'), 'error');
    }
  };

  return (
    <div className="app-container">
      <div className="decoration floating-1">🐰</div>
      <div className="decoration floating-2">🥕</div>
      <div className="decoration floating-3">✨</div>

      <Navbar />
      
      <main className="main-content">
        <Routes>
          <Route path="/profile" element={<ProfilePage onBack={() => navigate('/dashboard')} />} />
          <Route path="/settings" element={<SettingsPage onBack={() => navigate('/dashboard')} />} />
          <Route path="/settings/language" element={<LanguageSettingsPage onBack={() => navigate('/settings')} />} />
          <Route path="/match-game" element={<MatchGame onBack={() => navigate('/dashboard')} />} />
          
          <Route path="/study" element={<StudyMode onComplete={() => navigate('/dashboard')} />} />
          
          <Route path="/dashboard" element={
            <div className="hero-section">
            <header className="section-header animate-pop">
              <div className="hero-text">
                <h1>{t('dashboard.welcome')}</h1>
                <p>{t('dashboard.ready_to_learn')}</p>
              </div>
              <div className="hero-actions">
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                  <Plus size={20} /> {t('dashboard.add_word')}
                </Button>
                <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
                  <Upload size={20} /> {t('dashboard.import')}
                </Button>
              </div>
            </header>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <Card className="stat-card pink clickable" onClick={() => navigate('/study')}>
                <div className="stat-icon"><Play size={32} /></div>
                <div className="stat-info">
                  <h3>{t('dashboard.start_study')}</h3>
                  <p>{stats?.dueReviewsCount ? t('dashboard.words_due', { count: stats.dueReviewsCount }) : t('dashboard.words_due_zero')}</p>
                </div>
              </Card>

              <Card className="stat-card yellow clickable" onClick={() => navigate('/library')}>
                <div className="stat-icon"><Book size={32} /></div>
                <div className="stat-info">
                  <h3>{t('dashboard.library')}</h3>
                  <p>{stats?.totalWords ? t('dashboard.words_count', { count: stats.totalWords }) : t('dashboard.words_count_zero')}</p>
                </div>
              </Card>

              <Card className="stat-card purple clickable" onClick={() => navigate('/match-game')}>
                <div className="stat-icon"><Gamepad2 size={32} /></div>
                <div className="stat-info">
                  <h3>{t('dashboard.minigame')}</h3>
                  <p>{t('dashboard.word_match')}</p>
                </div>
              </Card>
            </div>

            <section className="recent-section">
              <div className="section-header">
                <h2>{t('dashboard.recently_added')}</h2>
                <Button variant="outline" onClick={() => navigate('/library')}>{t('dashboard.view_all')}</Button>
              </div>
              <div className="word-list">
                {statsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonWordCard key={i} hasFooter={true} />
                  ))
                ) : !stats?.recentWords?.length ? (
                  <Card className="empty-card">
                    <p>{t('dashboard.empty_library')}</p>
                  </Card>
                ) : (
                  stats.recentWords.map((word: any) => (
                    <Card key={word.id} className="word-item">
                      <div className="word-header">
                        <h3>{word.word}</h3>
                        <span className="type-tag">{getTypeLabel(word.type)}</span>
                      </div>
                      <p className="meaning">{word.meaningVi}</p>
                      <div className="card-footer">
                        <span className="level">{t('dashboard.progress', { percent: 60 })}</span>
                        <div className="dots">
                          <span className="dot active"></span>
                          <span className="dot active"></span>
                          <span className="dot"></span>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </section>
          </div>
          } />

          <Route path="/library" element={<Library />} />
          
          <Route path="/stats" element={
            <div className="coming-soon">
              <Card>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <TrendingUp size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
                  <h2>{t('stats.coming_soon')}</h2>
                  <p>{t('stats.subtitle')}</p>
                </div>
              </Card>
            </div>
          } />
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={t('dashboard.add_word')}
      >
        <WordForm 
          onSubmit={handleAddWord} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>

      <Modal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        title={t('dashboard.import')}
      >
        <WordImport 
          onImport={handleImport} 
          onCancel={() => setIsImportModalOpen(false)} 
          isLoading={isImporting}
        />
      </Modal>

      <ScrollToTop />
    </div>
  );
}

export default App;
