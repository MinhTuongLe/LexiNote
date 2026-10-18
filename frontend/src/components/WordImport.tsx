import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import { Upload, AlertCircle, FileText, ClipboardPaste } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { ImportedWord } from '../types';
import { normalizeWordType } from '../utils/wordTypeUtils';
import './WordImport.css';

interface WordImportProps {
  onImport: (words: ImportedWord[]) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const normalizeData = (jsonData: Record<string, unknown>[]): ImportedWord[] => {
  return jsonData.map(item => {
    const entry: ImportedWord = { word: '', meaningVi: '', type: 'other' };
    const getVal = (keys: string[]) => {
      const foundKey = Object.keys(item).find(k => keys.includes(k.toLowerCase().replace(/[^a-z]/g, '')));
      return foundKey && item[foundKey] !== undefined && item[foundKey] !== null ? String(item[foundKey]).trim() : '';
    };

    entry.word = getVal(['word', 'text', 'english']);
    entry.meaningVi = getVal(['meaningvi', 'vietnamese', 'nghia', 'definitionvi']);
    entry.example = getVal(['example', 'sentence', 'vidu']);
    entry.phonetic = getVal(['phonetic', 'pronunciation']);
    entry.audioUrl = getVal(['audiourl', 'audio', 'audio_url']);
    const rawType = getVal(['type', 'loaitu', 'category']).toLowerCase();
    const firstType = rawType.split(/[/,]/)[0].trim();
    entry.type = normalizeWordType(firstType);
    return entry;
  }).filter(entry => entry.word && entry.meaningVi);
};

const parseDelimitedLine = (line: string, separator: string): string[] => {
  const values: string[] = [];
  let current = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && line[index + 1] === '"' && quoted) {
      current += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === separator && !quoted) {
      values.push(current.trim());
      current = '';
    } else {
      current += character;
    }
  }
  values.push(current.trim());
  return values;
};

const parsePastedText = (text: string): ImportedWord[] => {
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length === 0) return [];

  const separator = text.includes('\t') ? '\t' : ',';
  const firstLineCols = parseDelimitedLine(lines[0], separator).map(header => header.trim().toLowerCase());
  const isHeaderRow = firstLineCols.some(header => ['word', 'text', 'english'].includes(header.replace(/[^a-z]/g, '')));
  const headers = isHeaderRow ? firstLineCols : ['word', 'meaningvi', 'type', 'example'];
  const dataLines = isHeaderRow ? lines.slice(1) : lines;
  const jsonData = dataLines.map(line => {
    const values = parseDelimitedLine(line, separator);
    const entry: Record<string, unknown> = {};
    headers.forEach((header, index) => { entry[header] = values[index] || ''; });
    return entry;
  });
  return normalizeData(jsonData);
};

const WordImport: React.FC<WordImportProps> = ({ onImport, onCancel, isLoading }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [pasteText, setPasteText] = useState('');
  const [filePreview, setFilePreview] = useState<ImportedWord[]>([]);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

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

  const parseFile = (file: File, isExcel: boolean) => {
    const reader = new FileReader();
    reader.onerror = () => setError('Could not read this file. Please try another CSV or Excel file.');
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let jsonData: Record<string, unknown>[] = [];

        if (isExcel) {
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);
          setFilePreview(normalizeData(jsonData));
        } else if (typeof data === 'string') {
          setFilePreview(parsePastedText(data));
        }
      } catch {
        setError('This file could not be parsed. Check its format and try again.');
      }
    };

    if (isExcel) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
    }
  };

  const preview = useMemo(
    () => activeTab === 'paste' ? parsePastedText(pasteText) : filePreview,
    [activeTab, filePreview, pasteText]
  );

  return (
    <div className="word-import">
      <div className="import-tabs">
        <button 
          type="button"
          className={`import-tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => { setActiveTab('upload'); setFilePreview([]); setError(''); }}
        >
          <Upload size={18} /> {t('words.tab_upload')}
        </button>
        <button 
          type="button"
          className={`import-tab ${activeTab === 'paste' ? 'active' : ''}`}
          onClick={() => { setActiveTab('paste'); setFilePreview([]); setError(''); }}
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
