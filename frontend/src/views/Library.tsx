import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import WordForm from '../components/WordForm';
import { 
  Search, Trash2, RotateCcw, CheckSquare, Square, 
  Pencil, Download, Loader2, Plus, Upload 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import WordImport from '../components/WordImport';
import { 
  useGetWordsQuery, 
  useLazyGetWordsQuery,
  useDeleteWordMutation, 
  useDeleteBulkWordsMutation,
  useUpdateWordMutation,
  useResetProgressMutation,
  useGetSettingsQuery,
  useCreateWordMutation,
  useImportWordsMutation,
  useGetDashboardStatsQuery
} from '../store/apiSlice';
import { useCuteDialog } from '../context/DialogContext';
import CuteSelect from '../components/CuteSelect';
import SkeletonWordCard from '../components/SkeletonWordCard';
import type { Word } from '../types';
import { useTranslation } from 'react-i18next';
import { WORD_TYPES } from '../constants/wordTypes';
import '../components/Skeleton.css';
import './Library.css';

const Library: React.FC = () => {
  const { data: settingsData } = useGetSettingsQuery();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const { showAlert, showConfirm } = useCuteDialog();
  const { t } = useTranslation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [loadedWords, setLoadedWords] = useState<Word[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const limit = 20;

  // RTK Query
  const { data: wordsData, isLoading, isFetching } = useGetWordsQuery({ page, limit, search, type: filterType });
  const [triggerGetWords] = useLazyGetWordsQuery();
  const meta = wordsData?.meta;

  const [deleteWord] = useDeleteWordMutation();
  const [deleteBulkWords] = useDeleteBulkWordsMutation();
  const [updateWord] = useUpdateWordMutation();
  const [resetProgress] = useResetProgressMutation();
  const [createWord] = useCreateWordMutation();
  const [importWords, { isLoading: isImportingApi }] = useImportWordsMutation();
  const { data: stats } = useGetDashboardStatsQuery();

  const handleDelete = async (id: number) => {
    showConfirm(t('library.delete_confirm_title'), t('library.delete_confirm_msg'), async () => {
      try {
        await deleteWord(id).unwrap();
        showAlert(t('library.delete_success_title'), t('library.delete_success_msg'), 'success');
        setLoadedWords(prev => prev.filter(w => w.id !== id));
        setSelectedIds(prev => prev.filter(sid => sid !== id));
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleDeleteBulk = async () => {
    if (selectedIds.length === 0) return;

    showConfirm(
      t('library.delete_bulk_confirm_title'), 
      t('library.delete_bulk_confirm_msg', { count: selectedIds.length }),
      async () => {
        try {
          await deleteBulkWords({ wordIds: selectedIds }).unwrap();
          showAlert(t('library.delete_success_title'), t('library.delete_success_msg'), 'success');
          setLoadedWords(prev => prev.filter(w => !selectedIds.includes(w.id)));
          setSelectedIds([]);
        } catch (err) {
          showAlert(t('common.error'), t('common.error'), 'error');
        }
      }
    );
  };

  const handleUpdate = async (data: any) => {
    if (!editingWord) return;
    try {
      await updateWord({ id: editingWord.id, data }).unwrap();
      showAlert(t('library.update_success_title'), t('library.update_success_msg'), 'success');
      setEditingWord(null);
    } catch (err) {
      showAlert(t('common.error'), t('common.error'), 'error');
    }
  };

  const handleAddWord = async (data: any) => {
    try {
      await createWord(data).unwrap();
      showAlert(t('common.success'), t('dashboard.add_success'), 'success');
      setIsAddModalOpen(false);
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

  const exportToExcel = async () => {
    try {
      setIsExporting(true);
      // Fetch ALL words matching current filters regardless of pagination
      const result = await triggerGetWords({ 
        limit: 'all', 
        search, 
        type: filterType 
      }).unwrap();
      
      const allWords = result.data || [];
      
      if (allWords.length === 0) {
        showAlert(t('common.info'), t('library.empty_library'), 'alert');
        return;
      }

      const dataToExport = allWords.map(w => ({
        Word: w.word,
        Meaning: w.meaningVi,
        Example: w.example || '',
        Type: w.type
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "MyWords");
      XLSX.writeFile(workbook, `LexiNote_Library_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error('Export failed:', err);
      showAlert(t('common.error'), t('common.error'), 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleReset = async (ids?: number[]) => {
    const targets = ids || selectedIds;
    if (targets.length === 0) return;

    showConfirm(
      t('library.reset_confirm_title'), 
      t('library.reset_confirm_msg', { count: targets.length }),
      async () => {
        try {
          await resetProgress(targets).unwrap();
          showAlert(t('library.reset_success_title'), t('library.reset_success_msg'), 'success');
          setSelectedIds([]);
        } catch (err) {
          showAlert(t('common.error'), t('common.error'), 'error');
        }
      }
    );
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (wordsData?.data) {
      setLoadedWords(prev => {
        if (page === 1) return wordsData.data;

        // Correctly merge: update existing and append new ones
        const updated = [...prev];
        wordsData.data.forEach(freshWord => {
          const index = updated.findIndex(w => w.id === freshWord.id);
          if (index !== -1) {
            updated[index] = freshWord; // Keep in-place update
          } else {
            updated.push(freshWord); // Add next page
          }
        });
        return updated;
      });
    }
  }, [wordsData, page]);

  useEffect(() => {
    setPage(1);
  }, [search, filterType]);

  const wordTypeOptions = [
    { value: 'all', label: t('library.type_filter') },
    ...WORD_TYPES.map(type => ({
      value: type.value,
      label: t(`library.word_types.${type.value}`)
    })),
    ...(settingsData?.wordTypes?.custom || []).map((type: any) => ({
      value: type.value,
      label: type.label
    }))
  ];

  const getTypeLabel = (typeValue: string) => {
    const defaultType = WORD_TYPES.find(t => t.value === typeValue);
    if (defaultType) return t(`library.word_types.${typeValue}`);
    const customType = settingsData?.wordTypes?.custom?.find((t: any) => t.value === typeValue);
    return customType ? customType.label : typeValue;
  };

  const selectAll = () => {
    if (selectedIds.length === loadedWords.length && loadedWords.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(loadedWords.map(w => w.id));
    }
  };

  return (
    <div className="library-view">
      <div className="library-header">
        <div className="library-top-bar">
          <div className="library-title-group">
            <h2>{t('dashboard.library')}</h2>
            <p className="library-stats-hint">
              {stats?.totalWords ? t('dashboard.words_count', { count: stats.totalWords }) : t('dashboard.words_count_zero')}
            </p>
          </div>
          <div className="header-main-actions">
            <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={18} /> {t('dashboard.add_word')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(true)}>
              <Upload size={18} /> {t('dashboard.import')}
            </Button>
          </div>
        </div>

        <div className="library-controls">
          <div className="search-bar">
            <Search size={20} />
            <input 
              type="text" 
              placeholder={t('common.search')} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <CuteSelect 
            options={wordTypeOptions}
            value={filterType}
            onChange={(val) => setFilterType(val)}
            className="library-type-select"
            align='right'
          />
        </div>

        <div className="selection-actions">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportToExcel}
            disabled={isExporting}
          >
            {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} 
            {t('library.export')}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={selectAll}
            className="select-all-btn"
          >
            {selectedIds.length === loadedWords.length && loadedWords.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
            {selectedIds.length === loadedWords.length && loadedWords.length > 0 ? t('library.deselect_all') : t('library.select_all')}
          </Button>
          
          {selectedIds.length > 0 && (
            <div className="bulk-actions animate-fade-in" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className="selection-count">{t('library.selected_count', { count: selectedIds.length })}</span>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => handleReset()}
              >
                <RotateCcw size={16} /> {t('profile.reset_data')}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDeleteBulk()}
                style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
              >
                <Trash2 size={16} /> {t('common.delete')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {isLoading && page === 1 ? (
        <div className="library-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="word-card-wrapper">
              <SkeletonWordCard className="word-card-full" hasExampleBox={i % 2 === 0} />
            </div>
          ))}
        </div>
      ) : loadedWords.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏜️</div>
          <h3>{t('library.no_results')}</h3>
          <p>{t('library.empty_library')}</p>
        </div>
      ) : (
        <div className="library-grid">
          {loadedWords.map((word) => (
            <div key={word.id} className={`word-card-wrapper ${selectedIds.includes(word.id) ? 'selected' : ''}`}>
              <Card className="word-card-full">
                <div className="select-overlay" onClick={(e) => { e.stopPropagation(); toggleSelect(word.id); }}>
                  {selectedIds.includes(word.id) ? <CheckSquare size={24} className="check-icon" /> : <Square size={24} className="check-icon" />}
                </div>
                <div className="word-card-header">
                  <div>
                    <div className="word-main">
                      <h3>{word.word}</h3>
                      <span className="type-badge">{getTypeLabel(word.type)}</span>
                    </div>
                  </div>
                  <div className="word-card-actions">
                    <button onClick={(e) => { e.stopPropagation(); setEditingWord(word); }} className="icon-btn edit" title="Edit this word">
                      <Pencil size={18} />
                    </button>
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
                      <strong>{t('words.example_label')}:</strong>
                      <p>"{word.example}"</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ))}
          
          {isFetching && page > 1 && Array.from({ length: 4 }).map((_, i) => (
            <div key={`skel-${i}`} className="word-card-wrapper">
              <SkeletonWordCard className="word-card-full" hasExampleBox={i % 2 === 0} />
            </div>
          ))}
        </div>
      )}

      {/* Load More Control */}
      {meta && page < meta.totalPages && (
        <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
          <Button 
            variant="outline" 
            onClick={() => setPage(p => p + 1)} 
            disabled={isFetching}
            className="load-more-btn"
            style={{ width: '200px' }}
          >
            {isFetching ? t('library.loading_more') : t('library.load_more')}
          </Button>
        </div>
      )}

      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title={t('dashboard.add_word')}
      >
        <WordForm 
          onSubmit={handleAddWord} 
          onCancel={() => setIsAddModalOpen(false)} 
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
          isLoading={isImportingApi}
        />
      </Modal>

      <Modal 
        isOpen={!!editingWord} 
        onClose={() => setEditingWord(null)} 
        title={`${t('common.edit')} ✨`}
      >
        {editingWord && (
          <WordForm 
            initialData={editingWord as any}
            onSubmit={handleUpdate}
            onCancel={() => setEditingWord(null)}
          />
        )}
      </Modal>
    </div>
  );
};

export default Library;
