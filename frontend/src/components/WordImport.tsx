import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import { Upload, AlertCircle, FileText, ClipboardPaste } from 'lucide-react';
import * as XLSX from 'xlsx';
import './WordImport.css';

interface WordImportProps {
  onImport: (words: any[]) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const WordImport: React.FC<WordImportProps> = ({ onImport, onCancel, isLoading }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [pasteText, setPasteText] = useState('');
  const [preview, setPreview] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // Auto parse paste text when it changes
    if (activeTab === 'paste' && pasteText.trim()) {
      parsePastedText(pasteText);
    } else if (activeTab === 'paste' && !pasteText.trim()) {
      setPreview([]);
    }
  }, [pasteText, activeTab]);

  const processFile = (selectedFile: File) => {
    const isExcel = selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls');
    const isCSV = selectedFile.name.endsWith('.csv');
    
    if (isExcel || isCSV) {
      setFile(selectedFile);
      setError('');
      parseFile(selectedFile, isExcel);
    } else {
      setError('Please select a valid CSV or Excel file! 📄');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) processFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const selectedFile = e.dataTransfer.files?.[0];
    if (selectedFile) processFile(selectedFile);
  };

  const normalizeData = (jsonData: any[]) => {
    const validTypes = ['noun', 'verb', 'adj', 'adv', 'phrasal_verb', 'idiom', 'phrase', 'noun_phrase', 'other'];
    const normalized = jsonData.map(item => {
      const entry: any = {};
      const getVal = (keys: string[]) => {
        const foundKey = Object.keys(item).find(k => keys.includes(k.toLowerCase().replace(/[^a-z]/g, '')));
        return foundKey ? String(item[foundKey]).trim() : '';
      };

      entry.word = getVal(['word', 'text', 'english']);
      entry.meaningVi = getVal(['meaningvi', 'vietnamese', 'nghia', 'definitionvi']);
      entry.example = getVal(['example', 'sentence', 'vidu']);
      
      const rawType = getVal(['type', 'loaitu', 'category']).toLowerCase();
      
      if (rawType.includes('/') || rawType.includes(',')) {
        const firstPart = rawType.split(/[/,]/)[0].trim();
        entry.type = validTypes.includes(firstPart) ? firstPart : 'other';
      } else {
        entry.type = validTypes.includes(rawType) ? rawType : 'other';
      }
      
      return entry;
    }).filter(e => e.word && e.meaningVi);

    setPreview(normalized);
  };

  const parsePastedText = (text: string) => {
    const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
    if (lines.length === 0) {
      setPreview([]);
      return;
    }

    // Usually copy from excel is tab separated
    const separator = text.includes('\t') ? '\t' : ',';
    const firstLineCols = lines[0].split(separator).map(h => h.trim().toLowerCase());
    
    // Check if the first line is actually a header row
    const isHeaderRow = firstLineCols.some(h => ['word', 'text', 'english'].includes(h.replace(/[^a-z]/g, '')));
    
    let headers: string[];
    let dataLines: string[];

    if (isHeaderRow) {
      headers = firstLineCols;
      dataLines = lines.slice(1);
    } else {
      // User didn't copy headers, assume default column order
      headers = ['word', 'meaningvi', 'type', 'example'];
      dataLines = lines; // Don't skip the first line!
    }

    const jsonData = dataLines.map(line => {
      const values = line.split(separator).map(v => v.trim());
      const entry: any = {};
      headers.forEach((h, i) => {
        entry[h] = values[i] || '';
      });
      return entry;
    });

    setError('');
    normalizeData(jsonData);
  };

  const parseFile = (file: File, isExcel: boolean) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      let jsonData: any[] = [];

      if (isExcel) {
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        jsonData = XLSX.utils.sheet_to_json(worksheet);
        normalizeData(jsonData);
      } else {
        parsePastedText(data as string);
      }
    };

    if (isExcel) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
    }
  };

  return (
    <div className="word-import">
      <div className="import-tabs">
        <button 
          className={`import-tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => { setActiveTab('upload'); setPreview([]); setError(''); }}
        >
          <Upload size={18} /> {t('words.tab_upload')}
        </button>
        <button 
          className={`import-tab ${activeTab === 'paste' ? 'active' : ''}`}
          onClick={() => { setActiveTab('paste'); setPreview([]); setError(''); }}
        >
          <ClipboardPaste size={18} /> {t('words.tab_paste')}
        </button>
      </div>

      {activeTab === 'upload' ? (
        <div 
          className="upload-zone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            accept=".csv, .xlsx, .xls" 
            id="word-upload" 
            onChange={handleFileChange} 
            hidden 
          />
          <label htmlFor="word-upload" className={`upload-label ${isDragging ? 'dragging' : ''}`}>
            {file ? <FileText size={40} className="file-icon" /> : <Upload size={32} />}
            <span>{file ? file.name : t('words.upload_click_drag')}</span>
            <p>Format: word, meaning_vi, type, example</p>
          </label>
        </div>
      ) : (
        <div className="paste-zone">
          <textarea 
            placeholder={t('words.paste_placeholder')}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            className="paste-textarea"
          />
        </div>
      )}

      {error && <div className="error-msg"><AlertCircle size={16} /> {error}</div>}

      {preview.length > 0 && (
        <div className="preview-section">
          <h4>{t('words.preview_count', { count: preview.length })}</h4>
          <div className="preview-list">
            {preview.slice(0, 5).map((p, i) => (
              <div key={i} className="preview-item">
                <strong>{p.word}</strong>: {p.meaningVi} 
                {p.type && <span className="preview-type">({p.type})</span>}
              </div>
            ))}
            {preview.length > 5 && <div className="more">{t('words.more_words', { count: preview.length - 5 })}</div>}
          </div>
        </div>
      )}

      <div className="form-actions">
        <Button variant="outline" onClick={onCancel}>{t('common.cancel')}</Button>
        <Button 
          variant="primary" 
          onClick={() => onImport(preview)} 
          disabled={preview.length === 0 || isLoading}
        >
          {isLoading ? t('common.loading') : t('words.import_all')}
        </Button>
      </div>
    </div>
  );
};

export default WordImport;
