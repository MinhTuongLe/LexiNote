import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { Sparkles, Check, BookOpen } from 'lucide-react';
import { useAiExtractWordsMutation, useImportWordsMutation } from '../store/apiSlice';
import { useCuteDialog } from '../context/useCuteDialog';
import { useTranslation } from 'react-i18next';
import type { AiExtractedWord, ImportedWord } from '../types';
import './AiExtractModal.css';

interface AiExtractModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AiExtractModal: React.FC<AiExtractModalProps> = ({ isOpen, onClose }) => {
  const [textInput, setTextInput] = useState('');
  const [maxWords, setMaxWords] = useState(10);
  const [extractedWords, setExtractedWords] = useState<AiExtractedWord[]>([]);
  const [selectedWordsMap, setSelectedWordsMap] = useState<Record<string, boolean>>({});

  const [extractWords, { isLoading: isExtracting }] = useAiExtractWordsMutation();
  const [importWords, { isLoading: isImporting }] = useImportWordsMutation();

  const { showAlert } = useCuteDialog();
  const { t } = useTranslation();

  const handleExtract = async () => {
    if (!textInput.trim()) {
      showAlert(t('common.error'), 'Vui lòng nhập hoặc dán một đoạn văn bản tiếng Anh để AI trích xuất!', 'warning');
      return;
    }

    try {
      const res = await extractWords({ text: textInput, maxWords }).unwrap();
      if (res.success && res.words) {
        setExtractedWords(res.words);
        const initialMap: Record<string, boolean> = {};
        res.words.forEach(w => {
          initialMap[w.word] = true;
        });
        setSelectedWordsMap(initialMap);
      }
    } catch {
      showAlert(t('common.error'), 'Không thể trích xuất từ vựng từ văn bản. Vui lòng thử lại!', 'error');
    }
  };

  const toggleSelectWord = (word: string) => {
    setSelectedWordsMap(prev => ({
      ...prev,
      [word]: !prev[word]
    }));
  };

  const toggleSelectAll = () => {
    const allSelected = extractedWords.every(w => selectedWordsMap[w.word]);
    const nextMap: Record<string, boolean> = {};
    extractedWords.forEach(w => {
      nextMap[w.word] = !allSelected;
    });
    setSelectedWordsMap(nextMap);
  };

  const handleImportSelected = async () => {
    const selected = extractedWords.filter(w => selectedWordsMap[w.word]);
    if (selected.length === 0) {
      showAlert(t('common.error'), 'Vui lòng chọn ít nhất 1 từ vựng để thêm vào thư viện!', 'warning');
      return;
    }

    const payload: ImportedWord[] = selected.map(w => ({
      word: w.word,
      meaningVi: w.meaningVi,
      type: w.type || 'noun',
      phonetic: w.phonetic || '',
      example: w.example || ''
    }));

    try {
      const res = await importWords({ words: payload }).unwrap();
      showAlert(
        t('common.success'),
        `Đã thêm thành công ${res.importedWords?.length || selected.length} từ vựng mới vào Thư viện cá nhân của bạn!`,
        'success'
      );
      // Reset & close modal
      setTextInput('');
      setExtractedWords([]);
      setSelectedWordsMap({});
      onClose();
    } catch {
      showAlert(t('common.error'), 'Không thể import từ vựng vào thư viện. Vui lòng thử lại!', 'error');
    }
  };

  const selectedCount = Object.values(selectedWordsMap).filter(Boolean).length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="✨ AI Smart Word Extraction">
      <div className="ai-extract-modal-content">
        <div className="ai-extract-header-intro">
          <div className="ai-extract-icon-badge">
            <Sparkles size={20} />
          </div>
          <div className="ai-extract-header-text">
            <h4>Trích Xuất Từ Vựng Thông Minh Bằng AI</h4>
            <p>
              Dán một đoạn văn bản, tin tức hoặc bài báo tiếng Anh bên dưới. AI sẽ tự động phân tích và trích xuất các từ vựng đắt giá kèm nghĩa theo ngữ cảnh.
            </p>
          </div>
        </div>

        {extractedWords.length === 0 ? (
          <>
            <div className="ai-extract-input-group">
              <label>Đoạn văn bản đầu vào (English Text):</label>
              <textarea
                className="ai-extract-textarea"
                placeholder="Paste English article, passage or essay here (e.g. Resilience is the capacity to withstand or recover quickly from difficulties...)"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                disabled={isExtracting}
              />
            </div>

            <div className="ai-extract-controls-bar">
              <div className="ai-extract-max-words">
                <span>Số từ tối đa:</span>
                <select
                  className="ai-extract-select"
                  value={maxWords}
                  onChange={(e) => setMaxWords(Number(e.target.value))}
                  disabled={isExtracting}
                >
                  <option value={5}>5 từ</option>
                  <option value={10}>10 từ</option>
                  <option value={15}>15 từ</option>
                  <option value={20}>20 từ</option>
                </select>
              </div>

              <Button
                variant="primary"
                onClick={handleExtract}
                isLoading={isExtracting}
                disabled={!textInput.trim() || isExtracting}
              >
                <Sparkles size={16} style={{ marginRight: 6 }} />
                Trích Xuất Từ Vựng
              </Button>
            </div>

            {isExtracting && (
              <div className="ai-extract-loading-container">
                <div className="ai-extract-sparkles-spinner">
                  <Sparkles size={28} className="animate-spin" />
                </div>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)' }}>
                  AI đang phân tích ngữ cảnh và trích xuất từ vựng...
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="ai-extract-results-container">
            <div className="ai-extract-results-header">
              <span className="ai-extract-results-title">
                <BookOpen size={18} style={{ color: 'var(--primary)' }} />
                Đã trích xuất {extractedWords.length} từ vựng đắt giá:
              </span>
              <button className="ai-extract-select-all-btn" onClick={toggleSelectAll}>
                {extractedWords.every(w => selectedWordsMap[w.word]) ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </button>
            </div>

            <div className="ai-extract-words-list">
              {extractedWords.map((item, idx) => {
                const isSelected = Boolean(selectedWordsMap[item.word]);
                return (
                  <div
                    key={idx}
                    className={`ai-extract-word-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleSelectWord(item.word)}
                  >
                    <input
                      type="checkbox"
                      className="ai-extract-checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                    />
                    <div className="ai-extract-word-body">
                      <div className="ai-extract-word-row1">
                        <span className="ai-extract-word-name">{item.word}</span>
                        {item.phonetic && <span className="ai-extract-word-phonetic">{item.phonetic}</span>}
                        {item.type && <span className="ai-extract-word-type-badge">{item.type}</span>}
                      </div>
                      <div className="ai-extract-word-meaning">{item.meaningVi}</div>
                      {item.example && (
                        <div className="ai-extract-word-example">"{item.example}"</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="ai-extract-controls-bar" style={{ marginTop: '0.75rem' }}>
              <Button
                variant="secondary"
                onClick={() => {
                  setExtractedWords([]);
                  setSelectedWordsMap({});
                }}
              >
                Nhập văn bản khác
              </Button>

              <Button
                variant="primary"
                onClick={handleImportSelected}
                isLoading={isImporting}
                disabled={selectedCount === 0 || isImporting}
              >
                <Check size={16} style={{ marginRight: 6 }} />
                Thêm {selectedCount} từ vào Thư viện
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AiExtractModal;
