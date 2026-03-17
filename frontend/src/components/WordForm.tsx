import React, { useState } from 'react';
import Button from './Button';
import type { CreateWordDTO } from '../types';
import './WordForm.css';

interface WordFormProps {
  onSubmit: (data: CreateWordDTO) => void;
  onCancel: () => void;
}

const WordForm: React.FC<WordFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CreateWordDTO>({
    word: '',
    meaningVi: '',
    example: '',
    type: 'noun',
    synonyms: [],
    antonyms: []
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="word-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Word *</label>
        <input 
          type="text" 
          name="word" 
          value={formData.word} 
          onChange={handleChange} 
          required 
          placeholder="e.g. Ephemeral"
        />
      </div>

      <div className="form-group">
        <label>Type</label>
          <select name="type" value={formData.type} onChange={handleChange}>
            <option value="noun">Noun</option>
            <option value="verb">Verb</option>
            <option value="adj">Adjective</option>
            <option value="adv">Adverb</option>
            <option value="phrasal_verb">Phrasal Verb</option>
            <option value="idiom">Idiom</option>
            <option value="phrase">Phrase</option>
            <option value="noun_phrase">Noun Phrase</option>
          </select>
      </div>

      <div className="form-group">
        <label>Meaning (Vietnamese) *</label>
        <input 
          type="text" 
          name="meaningVi" 
          value={formData.meaningVi} 
          onChange={handleChange} 
          required 
          placeholder="Nghĩa tiếng Việt"
        />
      </div>

      <div className="form-group">
        <label>Example Sentence</label>
        <textarea 
          name="example" 
          value={formData.example} 
          onChange={handleChange} 
          placeholder="How is it used in a sentence?"
        />
      </div>

      <div className="form-actions">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary">Save Word</Button>
      </div>
    </form>
  );
};

export default WordForm;
