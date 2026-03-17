import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { Search, Trash2, RotateCcw, CheckSquare, Square } from 'lucide-react';
import { 
  useGetWordsQuery, 
  useDeleteWordMutation, 
  useResetProgressMutation 
} from '../store/apiSlice';
import { useCuteDialog } from '../context/DialogContext';
import CuteSelect from '../components/CuteSelect';
import './Library.css';

const Library: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { showAlert, showConfirm } = useCuteDialog();

  // RTK Query
  const { data: words = [], isLoading } = useGetWordsQuery();
  const [deleteWord] = useDeleteWordMutation();
  const [resetProgress] = useResetProgressMutation();

  const handleDelete = async (id: number) => {
    showConfirm('Delete Word? 🥺', 'Are you sure you want to delete this word from your library?', async () => {
      try {
        await deleteWord(id).unwrap();
        setSelectedIds(prev => prev.filter(sid => sid !== id));
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleReset = async (ids?: number[]) => {
    const targets = ids || selectedIds;
    if (targets.length === 0) return;

    showConfirm(
      'Reset Progress? 🔄', 
      `Are you sure you want to reset progress for ${targets.length} word(s)?`,
      async () => {
        try {
          await resetProgress(targets).unwrap();
          showAlert('YAY! ✨', 'Progress reset successfully!', 'success');
          setSelectedIds([]);
        } catch (err) {
          showAlert('Oops! 😿', 'Failed to reset progress!', 'error');
        }
      }
    );
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const filteredWords = words.filter(w => {
    const matchesSearch = w.word.toLowerCase().includes(search.toLowerCase()) ||
                         w.meaningVi.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || w.type === filterType;
    return matchesSearch && matchesType;
  });

  const wordTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'noun', label: 'Noun' },
    { value: 'verb', label: 'Verb' },
    { value: 'adj', label: 'Adjective' },
    { value: 'adv', label: 'Adverb' },
    { value: 'phrasal_verb', label: 'Phrasal Verb' },
    { value: 'idiom', label: 'Idiom' },
    { value: 'phrase', label: 'Phrase' },
    { value: 'noun_phrase', label: 'Noun Phrase' },
    { value: 'other', label: 'Other' }
  ];

  const selectAll = () => {
    if (selectedIds.length === filteredWords.length && filteredWords.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredWords.map(w => w.id));
    }
  };

  return (
    <div className="library-view">
      <div className="library-header">
        <div className="library-controls">
          <div className="search-bar">
            <Search size={20} />
            <input 
              type="text" 
              placeholder="Search your library..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <CuteSelect 
            options={wordTypeOptions}
            value={filterType}
            onChange={(val) => setFilterType(val)}
            className="library-type-select"
          />
        </div>

        <div className="selection-actions">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={selectAll}
            className="select-all-btn"
          >
            {selectedIds.length === filteredWords.length && filteredWords.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
            {selectedIds.length === filteredWords.length && filteredWords.length > 0 ? 'Deselect All' : 'Select All'}
          </Button>
          
          {selectedIds.length > 0 && (
            <div className="bulk-actions animate-fade-in">
              <span className="selection-count">{selectedIds.length} selected</span>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => handleReset()}
              >
                <RotateCcw size={16} /> Reset Progress
              </Button>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="loading-state">✨ Loading your words... ✨</div>
      ) : filteredWords.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏜️</div>
          <h3>No words found!</h3>
          <p>Add some new words to your library to get started.</p>
        </div>
      ) : (
        <div className="library-grid">
          {filteredWords.map((word, i) => (
            <div key={word.id} className={`word-card-wrapper ${selectedIds.includes(word.id) ? 'selected' : ''}`}>
              <div className="select-overlay" onClick={() => toggleSelect(word.id)}>
                {selectedIds.includes(word.id) ? <CheckSquare size={24} className="check-icon" /> : <Square size={24} className="check-icon" />}
              </div>
              <Card className="word-card-full" delay={i * 0.05}>
                <div className="word-card-header">
                  <div>
                    <div className="word-main">
                      <h3>{word.word}</h3>
                      <span className="type-badge">{word.type}</span>
                    </div>
                  </div>
                  <div className="word-card-actions">
                    <button onClick={(e) => { e.stopPropagation(); handleReset([word.id]); }} className="icon-btn reset" title="Reset this word">
                      <RotateCcw size={18} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(word.id); }} className="icon-btn delete">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="word-card-body">
                  <p className="vi-meaning">{word.meaningVi}</p>
                  {word.example && (
                    <div className="example-box">
                      <strong>Example:</strong>
                      <p>"{word.example}"</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Library;
