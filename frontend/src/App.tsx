import { useState } from 'react';
import Navbar from './components/Navbar';
import Button from './components/Button';
import Card from './components/Card';
import Modal from './components/Modal';
import WordForm from './components/WordForm';
import WordImport from './components/WordImport'; // Renamed import
import Library from './views/Library';
import StudyMode from './views/StudyMode';
import { Plus, Play, Book, TrendingUp, AlertCircle, Upload } from 'lucide-react';
import { 
  useGetWordsQuery, 
  useGetDueReviewsQuery, 
  useCreateWordMutation, 
  useImportWordsMutation 
} from './store/apiSlice';
import type { CreateWordDTO } from './types';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('study');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isStudyMode, setIsStudyMode] = useState(false);

  // RTK Query hooks
  const { data: words = [], isLoading: wordsLoading } = useGetWordsQuery();
  const { data: dueReviews = [], isLoading: dueLoading } = useGetDueReviewsQuery();
  const [createWord] = useCreateWordMutation();
  const [importWords, { isLoading: isImporting }] = useImportWordsMutation();

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    setIsStudyMode(false);
  };

  const handleAddWord = async (data: CreateWordDTO) => {
    try {
      await createWord(data).unwrap();
      setIsModalOpen(false);
    } catch (err) {
      alert('Error creating word! 😿');
    }
  };

  const handleImportBulk = async (wordsToImport: any[]) => {
    try {
      const result = await importWords(wordsToImport).unwrap();
      alert(`Successfully imported ${result.imported} words! 🎉`);
      setIsImportModalOpen(false);
    } catch (err) {
      alert('Error importing words! 😿');
    }
  };

  const renderContent = () => {
    if (isStudyMode) {
      return (
        <StudyMode 
          dueReviews={dueReviews} 
          onComplete={() => setIsStudyMode(false)} 
        />
      );
    }

    switch (activeTab) {
      case 'library':
        return <Library />;
      case 'stats':
        return <div className="placeholder-view"><h2>Coming Soon... 📈</h2></div>;
      case 'study':
      default:
        return (
          <>
            <header className="hero-section">
              <div className="hero-text">
                <h1>Welcome back, <span className="highlight">Adventurer!</span> 🐰</h1>
                <p>Ready to master some new words today?</p>
              </div>
              <div className="hero-actions">
                <Button size="lg" variant="primary" onClick={() => setIsModalOpen(true)}>
                  <Plus size={24} /> Add New Word
                </Button>
                <Button size="lg" variant="secondary" onClick={() => setIsImportModalOpen(true)}>
                  <Upload size={24} /> Import CSV/Excel
                </Button>
                <Button 
                  size="lg" 
                  variant="accent" 
                  disabled={dueReviews.length === 0}
                  onClick={() => setIsStudyMode(true)}
                >
                  <Play size={24} /> 
                  {dueLoading ? 'Checking...' : dueReviews.length > 0 ? `Start Review (${dueReviews.length})` : 'Nothing to review! ✨'}
                </Button>
              </div>
            </header>

            <section className="stats-grid">
              <Card className="stat-card" delay={0.1}>
                <div className="stat-icon pink"><Book size={24} /></div>
                <div className="stat-info">
                  <h3>{wordsLoading ? '...' : words.length}</h3>
                  <p>Total Words</p>
                </div>
              </Card>
              
              <Card className="stat-card" delay={0.2}>
                <div className="stat-icon yellow"><AlertCircle size={24} /></div>
                <div className="stat-info">
                  <h3>{dueLoading ? '...' : dueReviews.length}</h3>
                  <p>Due Today</p>
                </div>
              </Card>
              
              <Card className="stat-card" delay={0.3}>
                <div className="stat-icon green"><TrendingUp size={24} /></div>
                <div className="stat-info">
                  <h3>15 Days</h3>
                  <p>Streak 🔥</p>
                </div>
              </Card>
            </section>

            <section className="recent-section">
              <div className="section-header">
                <h2>Recent Words</h2>
                <Button variant="outline" size="sm" onClick={() => handleNavigate('library')}>View Library</Button>
              </div>
              
              <div className="word-list">
                {words.slice(0, 3).map((word, i) => (
                  <Card key={word.id} className="word-card" delay={0.4 + i * 0.1}>
                    <div className="word-header">
                      <h3>{word.word}</h3>
                      <span className="type-tag">{word.type}</span>
                    </div>
                    <p className="meaning">{word.meaningVi}</p>
                    <div className="card-footer">
                      <span className="level">Active</span>
                      <div className="dots">
                        <span className="dot active"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                      </div>
                    </div>
                  </Card>
                ))}
                {!wordsLoading && words.length === 0 && <p className="text-muted">No words yet. Add your first one! ✨</p>}
              </div>
            </section>
          </>
        );
    }
  };

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} onNavigate={handleNavigate} />
      
      <main className="main-content">
        {renderContent()}
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
        title="Import Words from CSV/Excel 📄"
      >
        <WordImport 
          onImport={handleImportBulk} 
          onCancel={() => setIsImportModalOpen(false)} 
          isLoading={isImporting}
        />
      </Modal>
      
      <div className="decoration floating-1">☁️</div>
      <div className="decoration floating-2">☁️</div>
      <div className="decoration floating-3">✨</div>
    </div>
  );
}

export default App;
