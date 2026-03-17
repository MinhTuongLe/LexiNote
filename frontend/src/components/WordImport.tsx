import { useState } from 'react';
import Button from './Button';
import { Upload, AlertCircle, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import './WordImport.css';

interface WordImportProps {
  onImport: (words: any[]) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const WordImport: React.FC<WordImportProps> = ({ onImport, onCancel, isLoading }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
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
    reader.onload = (e) => {
      const data = e.target?.result;
      let jsonData: any[] = [];

      if (isExcel) {
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        jsonData = XLSX.utils.sheet_to_json(worksheet);
      } else {
        const text = data as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        jsonData = lines.slice(1).filter(l => l.trim() !== '').map(line => {
          const values = line.split(',').map(v => v.trim());
          const entry: any = {};
          headers.forEach((h, i) => {
            entry[h] = values[i];
          });
          return entry;
        });
      }

      // Normalize data
      const normalized = jsonData.map(item => {
        const entry: any = {};
        const getVal = (keys: string[]) => {
          const foundKey = Object.keys(item).find(k => keys.includes(k.toLowerCase().replace(/[^a-z]/g, '')));
          return foundKey ? String(item[foundKey]).trim() : '';
        };

        entry.word = getVal(['word', 'text', 'english']);
        entry.meaningVi = getVal(['meaningvi', 'vietnamese', 'nghia', 'definitionvi']);
        entry.example = getVal(['example', 'sentence', 'vi-du']);
        
        // Handle word type normalization
        const rawType = getVal(['type', 'loaitu', 'category']).toLowerCase();
        const validTypes = ['noun', 'verb', 'adj', 'adv', 'phrasal_verb', 'idiom', 'phrase', 'noun_phrase', 'other'];
        
        if (rawType.includes('/') || rawType.includes(',')) {
          // If multiple types like 'noun/verb', take the first one if valid, else 'other'
          const firstPart = rawType.split(/[/,]/)[0].trim();
          entry.type = validTypes.includes(firstPart) ? firstPart : 'other';
        } else {
          entry.type = validTypes.includes(rawType) ? rawType : 'other';
        }
        
        return entry;
      }).filter(e => e.word && e.meaningVi);

      setPreview(normalized);
    };

    if (isExcel) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
    }
  };

  return (
    <div className="word-import">
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
          <span>{file ? file.name : 'Click or drag CSV/Excel here'}</span>
          <p>Format: word, meaning_vi, example, type</p>
        </label>
      </div>

      {error && <div className="error-msg"><AlertCircle size={16} /> {error}</div>}

      {preview.length > 0 && (
        <div className="preview-section">
          <h4>Preview ({preview.length} words found)</h4>
          <div className="preview-list">
            {preview.slice(0, 5).map((p, i) => (
              <div key={i} className="preview-item">
                <strong>{p.word}</strong>: {p.meaningVi}
              </div>
            ))}
            {preview.length > 5 && <div className="more">... and {preview.length - 5} more</div>}
          </div>
        </div>
      )}

      <div className="form-actions">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button 
          variant="primary" 
          onClick={() => onImport(preview)} 
          disabled={preview.length === 0 || isLoading}
        >
          {isLoading ? 'Importing...' : 'Import All ✨'}
        </Button>
      </div>
    </div>
  );
};

export default WordImport;
