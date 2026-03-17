import { useState } from 'react';
import Navbar from './components/Navbar';
import Button from './components/Button';
import Card from './components/Card';
import Modal from './components/Modal';
import WordForm from './components/WordForm';
import WordImport from './components/WordImport';
import Library from './views/Library';
import StudyMode from './views/StudyMode';
import { Plus, Play, Book, TrendingUp, Upload } from 'lucide-react';
import { 
  useGetWordsQuery, 
  useGetDueReviewsQuery, 
  useCreateWordMutation, 
  useImportWordsMutation 
} from './store/apiSlice';
import { useCuteDialog } from './context/DialogContext';
import { useSelector } from 'react-redux';
import Login from './views/auth/Login';
import Register from './views/auth/Register';
import type { CreateWordDTO } from './types';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('study');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  const { showAlert } = useCuteDialog();

  // RTK Query hooks - Top level (required by React)
  const { data: words = [], isLoading: wordsLoading } = useGetWordsQuery(undefined, { skip: !isAuthenticated });
  const { data: dueReviews = [] } = useGetDueReviewsQuery(undefined, { skip: !isAuthenticated });
  const [createWord] = useCreateWordMutation();
  const [importWords, { isLoading: isImporting }] = useImportWordsMutation();

  if (!isAuthenticated) {
    return (
      <div className="app-container">
        <Navbar activeTab="auth" onNavigate={() => {}} />
        <main className="main-content auth-layout">
          {authView === 'login' ? (
            <Login onSwitch={() => setAuthView('register')} />
          ) : (
            <Register onSwitch={() => setAuthView('login')} />
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
        {isStudyMode ? (
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

            <div className="stats-grid">
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

              <Card className="stat-card green">
                <div className="stat-icon"><TrendingUp size={32} /></div>
                <div className="stat-info">
                  <h3>Streak</h3>
                  <p>15 Days 🔥</p>
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
    </div>
  );
}

export default App;
