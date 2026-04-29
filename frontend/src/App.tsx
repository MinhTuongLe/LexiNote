import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Button from './components/Button';
import Card from './components/Card';
import Modal from './components/Modal';
import WordForm from './components/WordForm';
import WordImport from './components/WordImport';
import WelcomePage from './views/guide/WelcomePage';
import Library from './views/Library';
import StudyMode from './views/StudyMode';
import ProfilePage from './views/profile/ProfilePage';
import SettingsPage from './views/settings/SettingsPage';
import LanguageSettingsPage from './views/settings/LanguageSettingsPage';
import ForgotPassword from './views/auth/ForgotPassword';
import MatchGame from './views/games/MatchGame';
import StatsPage from './views/stats/StatsPage';
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
import CountUp from './components/CountUp';
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

  // Redirect new users to full-screen guide
  useEffect(() => {
    if (isAuthenticated && isInitialized && user) {
      const storageKey = `hasSeenGuide_${user.id ?? user._id ?? user.email ?? 'unknown'}`;
      const locallySeen = localStorage.getItem(storageKey) === 'true';
      
      const rawSettings = user.settings || {};
      const remotelySeen = rawSettings.preferences?.hasSeenGuide === true || rawSettings.hasSeenGuide === true;
      
      if (!locallySeen && !remotelySeen && location.pathname !== '/welcome') {
        navigate('/welcome', { replace: true });
      }
    }
  }, [isAuthenticated, isInitialized, user, navigate, location.pathname]);

  // Reset entirely UI state on Logout so the next person gets a clean slate 
  useEffect(() => {
    if (!isAuthenticated && isInitialized) {
      if (location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/forgot' && location.pathname !== '/verify-email') {
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

      {location.pathname !== '/welcome' && <Navbar />}
      
      <main className="main-content">
        <Routes>
          <Route path="/welcome" element={<WelcomePage />} />
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

              <Card className="streak-hero-card clickable" onClick={() => navigate('/stats')}>
                <div className="streak-main">
                  <div className="stat-icon">🔥</div>
                  <div className="streak-info">
                    <div className="streak-count">
                      <span className="number">
                        {statsLoading ? 0 : <CountUp end={stats?.streak || 0} />}
                      </span>
                      <span className="label">{t('dashboard.day_streak')}</span>
                    </div>
                    <p>{t('dashboard.keep_going')}</p>
                  </div>
                </div>

                <div className="streak-tracker">
                  {Array.from({ length: 7 }).map((_, i) => {
                    // Monday is index 0 in our UI, but Date.getDay() has Sunday as 0.
                    // We want: Mon(0), Tue(1), Wed(2), Thu(3), Fri(4), Sat(5), Sun(6)
                    const now = new Date();
                    const dayOfWeek = now.getDay(); // 0-6 (Sun-Sat)
                    const diffToMon = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
                    
                    const monday = new Date(now);
                    monday.setDate(now.getDate() - diffToMon);
                    
                    const currentDay = new Date(monday);
                    currentDay.setDate(monday.getDate() + i);
                    const dateStr = currentDay.toISOString().split('T')[0];
                    
                    // Backend guarantees weeklyActivity array is strictly Mon-Sun (indexes 0-6)
                    const activity = stats?.weeklyActivity ? stats.weeklyActivity[i] : null;
                    const isStudied = activity && activity.count > 0;
                    const dayLabel = currentDay.toLocaleDateString(undefined, { weekday: 'narrow' });
                    
                    // diffToMon corresponds directly to the index of "Today" in a Mon-Sun array!
                    const isToday = i === diffToMon;
                    const isPast = i <= diffToMon;

                    return (
                      <div key={i} className={`tracker-day ${isStudied ? 'active' : ''} ${isToday ? 'today' : ''} ${!isPast ? 'future' : ''}`}>
                        <span className="day-name">{dayLabel}</span>
                        {isStudied && <div className="check-mark">✓</div>}
                      </div>
                    );
                  })}
                </div>
              </Card>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
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
                        <span className="level">{t('dashboard.progress', { percent: word.progress || 0 })}</span>
                        <div className="progress-bar-mini">
                          <div className="progress-fill-mini" style={{ width: `${word.progress || 0}%` }}></div>
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
          
          <Route path="/stats" element={<StatsPage onBack={() => navigate('/dashboard')} />} />
          <Route path="/stats/activity" element={<StatsPage onBack={() => navigate('/stats')} detail="activity" />} />
          <Route path="/stats/performance" element={<StatsPage onBack={() => navigate('/stats')} detail="performance" />} />
          <Route path="/stats/mastery" element={<StatsPage onBack={() => navigate('/stats')} detail="mastery" />} />
          <Route path="/stats/focus" element={<StatsPage onBack={() => navigate('/stats')} detail="focus" />} />
          <Route path="/stats/types" element={<StatsPage onBack={() => navigate('/stats')} detail="types" />} />
          
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
