import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Button from './components/Button';
import Card from './components/Card';
import Modal from './components/Modal';
import WordForm from './components/WordForm';
import WordImport from './components/WordImport';
import Library from './views/Library';
import StudyMode from './views/StudyMode';
import ProfilePage from './views/profile/ProfilePage';
import ForgotPassword from './views/auth/ForgotPassword';
import MatchGame from './views/games/MatchGame';
import ScrollToTop from './components/ScrollToTop';
import { Plus, Play, Book, TrendingUp, Upload, Gamepad2 } from 'lucide-react';
import { 
  useGetWordsQuery, 
  useGetDueReviewsQuery, 
  useCreateWordMutation, 
  useImportWordsMutation,
  useGetMeQuery
} from './store/apiSlice';
import { useCuteDialog } from './context/DialogContext';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser, setInitialized } from './store/authSlice';
import Login from './views/auth/Login';
import Register from './views/auth/Register';
import type { CreateWordDTO } from './types';
import './App.css';

type AuthViewType = 'login' | 'register' | 'forgot';

function App() {
  const [activeTab, setActiveTab] = useState('study');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [authView, setAuthView] = useState<AuthViewType>('login');
  
  const { isAuthenticated, isInitialized } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const { showAlert } = useCuteDialog();

  // Try to load user profile if authenticated but not fully initialized
  const { data: meData, error: meError, isLoading: meLoading } = useGetMeQuery(undefined, { 
    skip: !isAuthenticated || isInitialized 
  });

  useEffect(() => {
    if (meData) {
      dispatch(updateUser(meData.user));
      dispatch(setInitialized());
    } else if (meError) {
      dispatch(setInitialized());
    }
  }, [meData, meError, dispatch]);

  // Global error handler for system-wide failures
  useEffect(() => {
    const handleSystemError = (e: any) => {
      showAlert('Lỗi Hệ Thống! 😿', e.detail || 'Có lỗi xảy ra, bạn đã được đăng xuất để bảo mật.', 'error');
    };
    window.addEventListener('system-error', handleSystemError);
    return () => window.removeEventListener('system-error', handleSystemError);
  }, [showAlert]);

  // RTK Query hooks - Top level (required by React)
  const { data: words = [], isLoading: wordsLoading } = useGetWordsQuery(undefined, { skip: !isAuthenticated });
  const { data: dueReviews = [] } = useGetDueReviewsQuery(undefined, { skip: !isAuthenticated });
  const [createWord] = useCreateWordMutation();
  const [importWords, { isLoading: isImporting }] = useImportWordsMutation();

  // Reset entirely UI state on Logout so the next person gets a clean slate 
  useEffect(() => {
    if (!isAuthenticated) {
      setActiveTab('study');
      setIsStudyMode(false);
      setIsModalOpen(false);
      setIsImportModalOpen(false);
      setAuthView('login');
    }
  }, [isAuthenticated]);

  // Show generic loading if checking session on hard reload
  if (isAuthenticated && !isInitialized && meLoading) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2>Loading LexiNote... ✨</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="app-container">
        <Navbar activeTab="auth" onNavigate={() => {}} />
        <main className="main-content auth-layout">
          {authView === 'login' && (
            <Login 
              onSwitch={() => setAuthView('register')} 
              onForgot={() => setAuthView('forgot')} 
            />
          )}
          {authView === 'register' && (
            <Register onSwitch={() => setAuthView('login')} />
          )}
          {authView === 'forgot' && (
            <ForgotPassword onBack={() => setAuthView('login')} />
          )}
        </main>
      </div>
    );
  }

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    setIsStudyMode(false);
  };

  const handleAddWord = async (data: CreateWordDTO) => {
    try {
      await createWord(data).unwrap();
      showAlert('Success! ✨', 'New word added to your library!', 'success');
      setIsModalOpen(false);
    } catch (err) {
      showAlert('Error! 😿', 'Failed to add word.', 'error');
    }
  };

  const handleImport = async (words: any[]) => {
    try {
      await importWords(words).unwrap();
      showAlert('Success! 🎉', `Imported ${words.length} words!`, 'success');
      setIsImportModalOpen(false);
    } catch (err) {
      showAlert('Error! 😿', 'Failed to import words.', 'error');
    }
  };

  return (
    <div className="app-container">
      <div className="decoration floating-1">🐰</div>
      <div className="decoration floating-2">🥕</div>
      <div className="decoration floating-3">✨</div>

      <Navbar activeTab={activeTab} onNavigate={handleNavigate} />
      
      <main className="main-content">
        {activeTab === 'profile' ? (
          <ProfilePage onBack={() => handleNavigate('study')} />
        ) : activeTab === 'match-game' ? (
          <MatchGame words={words} onBack={() => handleNavigate('study')} />
        ) : isStudyMode ? (
          <StudyMode 
            dueReviews={dueReviews} 
            onComplete={() => setIsStudyMode(false)} 
          />
        ) : activeTab === 'study' ? (
          <div className="hero-section">
            <header className="section-header animate-pop">
              <div className="hero-text">
                <h1>Welcome to <span className="highlight">LexiNote! 🐰</span></h1>
                <p>Ready to learn some new words today?</p>
              </div>
              <div className="hero-actions">
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                  <Plus size={20} /> Add Word
                </Button>
                <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
                  <Upload size={20} /> Import
                </Button>
              </div>
            </header>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <Card className="stat-card pink clickable" onClick={() => setIsStudyMode(true)}>
                <div className="stat-icon"><Play size={32} /></div>
                <div className="stat-info">
                  <h3>Start Study</h3>
                  <p>{dueReviews.length} words due</p>
                </div>
              </Card>

              <Card className="stat-card yellow clickable" onClick={() => handleNavigate('library')}>
                <div className="stat-icon"><Book size={32} /></div>
                <div className="stat-info">
                  <h3>Library</h3>
                  <p>{words.length} words</p>
                </div>
              </Card>

              <Card className="stat-card purple clickable" onClick={() => handleNavigate('match-game')}>
                <div className="stat-icon"><Gamepad2 size={32} /></div>
                <div className="stat-info">
                  <h3>Minigame</h3>
                  <p>Word Match ✨</p>
                </div>
              </Card>
            </div>

            <section className="recent-section">
              <div className="section-header">
                <h2>Recently Added</h2>
                <Button variant="outline" onClick={() => handleNavigate('library')}>View All</Button>
              </div>
              <div className="word-list">
                {wordsLoading ? (
                  <p>Loading your words... ✨</p>
                ) : words.length === 0 ? (
                  <Card className="empty-card">
                    <p>Your library is empty. Add your first word! 🚀</p>
                  </Card>
                ) : (
                  words.slice(0, 3).map((word) => (
                    <Card key={word.id} className="word-item">
                      <div className="word-header">
                        <h3>{word.word}</h3>
                        <span className="type-tag">{word.type}</span>
                      </div>
                      <p className="meaning">{word.meaningVi}</p>
                      <div className="card-footer">
                        <span className="level">Progress: 60%</span>
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
        ) : activeTab === 'library' ? (
          <Library />
        ) : (
          <div className="coming-soon">
            <Card>
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <TrendingUp size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
                <h2>Coming Soon! 📈</h2>
                <p>We're working on statistics and progress tracking.</p>
              </div>
            </Card>
          </div>
        )}
      </main>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New Word ✨"
      >
        <WordForm 
          onSubmit={handleAddWord} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>

      <Modal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        title="Import Words 📄"
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
