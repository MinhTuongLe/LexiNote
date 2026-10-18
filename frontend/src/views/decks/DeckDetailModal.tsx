import React, { useState } from 'react';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import { Layers, Check, Volume2, CheckSquare, Square } from 'lucide-react';
import { useGetDeckQuery, useImportDeckMutation } from '../../store/apiSlice';
import { useCuteDialog } from '../../context/useCuteDialog';
import { useTranslation } from 'react-i18next';
import { speakText } from '../../utils/speech';

interface DeckDetailModalProps {
  deckId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const DeckDetailModal: React.FC<DeckDetailModalProps> = ({ deckId, isOpen, onClose }) => {
  const { data: deckRes, isLoading, isError, refetch } = useGetDeckQuery(deckId!, { skip: !deckId || !isOpen });
  const [importDeck, { isLoading: isImporting }] = useImportDeckMutation();
  const [selection, setSelection] = useState<{ deckId: number | null; words: string[] }>({ deckId: null, words: [] });

  const { showAlert } = useCuteDialog();
  const { t } = useTranslation();

  const deck = deckRes?.data;

  const selectedWords = selection.deckId === deckId
    ? selection.words
    : deck?.words?.map((word) => word.word) || [];

  const handleImportAll = async () => {
    if (!deckId) return;
    try {
      const res = await importDeck({ id: deckId, words: selectedWords }).unwrap();
      showAlert(
        t('common.success'),
        res.message || `Đã import thành công ${res.importedCount} từ vựng vào Thư viện cá nhân của bạn!`,
        'success'
      );
      onClose();
    } catch {
      showAlert(t('common.error'), 'Không thể import Bộ từ vựng. Vui lòng thử lại!', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={deck?.title || 'Bộ Từ Vựng'}>
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem 0', color: '#64748b' }}>
          Đang tải nội dung bộ từ...
        </div>
      ) : isError ? (
        <div role="alert" style={{ textAlign: 'center', padding: '2rem 0' }}>
          <p>Không thể tải nội dung bộ từ vựng.</p>
          <Button variant="outline" onClick={() => refetch()}>Thử lại</Button>
        </div>
      ) : deck ? (
        <div className="deck-detail-content">
          <div className="deck-detail-header">
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--secondary)', border: '3px solid var(--border)', boxShadow: '3px 3px 0px var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
              <Layers size={30} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)' }}>{deck.title}</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{deck.description}</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <span className="deck-badge-category" style={{ position: 'static' }}>{deck.category}</span>
                {deck.level && <span className="deck-badge-level" style={{ position: 'static' }}>{deck.level}</span>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text)' }}>
            <span>Danh sách {deck.words?.length || 0} từ vựng chuẩn:</span>
          </div>

          <div className="deck-detail-words-list">
            {deck.words?.map((word) => (
              <div key={word.word} className={`deck-word-row ${selectedWords.includes(word.word) ? 'selected' : ''}`}>
                <button
                  type="button"
                  className="deck-word-select"
                  aria-label={`Select ${word.word}`}
                  aria-pressed={selectedWords.includes(word.word)}
                  onClick={() => setSelection({
                    deckId,
                    words: selectedWords.includes(word.word)
                      ? selectedWords.filter((item) => item !== word.word)
                      : [...selectedWords, word.word],
                  })}
                >
                  {selectedWords.includes(word.word) ? <CheckSquare size={20} /> : <Square size={20} />}
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="deck-word-title">{word.word}</span>
                    {word.phonetic && <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{word.phonetic}</span>}
                    <span className="deck-word-type">{word.type}</span>
                    <button
                      type="button"
                      aria-label={`Pronounce ${word.word}`}
                      onClick={() => speakText(word.word)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: 2 }}
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginTop: 2 }}>{word.meaningVi}</div>
                  {word.example && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 2 }}>"{word.example}"</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
            <Button variant="secondary" onClick={onClose}>Đóng</Button>
            <Button
              variant="primary"
              onClick={handleImportAll}
              isLoading={isImporting}
              disabled={selectedWords.length === 0}
            >
              <Check size={16} style={{ marginRight: 6 }} />
              1-Click Import Tất Cả Từ Vựng
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default DeckDetailModal;
