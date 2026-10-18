import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WORD_TYPES } from '../constants/wordTypes';
import { useGetSettingsQuery } from '../store/apiSlice';
import Button from './Button';
import CuteSelect from './CuteSelect';
import type { CreateWordDTO, CustomWordType, WordRelation } from '../types';
import './WordForm.css';

interface WordFormProps {
  onSubmit: (data: CreateWordDTO) => void;
  onCancel: () => void;
  initialData?: CreateWordDTO & { relations?: WordRelation[] };
}

const WordForm: React.FC<WordFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const { data: settingsData } = useGetSettingsQuery();
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateWordDTO>(initialData || {
    word: '',
    meaningVi: '',
    example: '',
    type: 'noun'
  });
  const relationSynonyms = initialData?.relations?.filter((relation) => relation.type === 'synonym').map((relation) => relation.value) || [];
  const relationAntonyms = initialData?.relations?.filter((relation) => relation.type === 'antonym').map((relation) => relation.value) || [];
  const [synonymsText, setSynonymsText] = useState(initialData?.synonyms?.join(', ') || relationSynonyms.join(', '));
  const [antonymsText, setAntonymsText] = useState(initialData?.antonyms?.join(', ') || relationAntonyms.join(', '));
  const [validationError, setValidationError] = useState('');

  const wordTypeOptions = [
    ...WORD_TYPES.map(type => ({
      value: type.value,
      label: t(`library.word_types.${type.value}`)
    })),
    ...(settingsData?.wordTypes?.custom || []).map((type: CustomWordType) => ({
      value: type.value,
      label: type.label
    }))
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const word = formData.word.trim();
    const meaningVi = formData.meaningVi.trim();
    if (!word || !meaningVi) {
      setValidationError('Word and Vietnamese meaning are required.');
      return;
    }
    setValidationError('');
    onSubmit({
      word,
      meaningVi,
      type: formData.type,
      phonetic: formData.phonetic?.trim(),
      audioUrl: formData.audioUrl?.trim(),
      example: formData.example?.trim(),
      synonyms: synonymsText.split(',').map((value) => value.trim()).filter(Boolean),
      antonyms: antonymsText.split(',').map((value) => value.trim()).filter(Boolean),
    });
  };

  return (
    <form className="word-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>{t('words.word')}</label>
        <input 
          type="text" 
          name="word" 
          placeholder="Enter word..." 
          value={formData.word} 
        onChange={(event) => { setValidationError(''); handleChange(event); }}
        aria-invalid={Boolean(validationError) && !formData.word.trim()}
          required 
        />
      </div>

      <div className="form-group">
        <label>{t('words.meaning_vi')}</label>
        <input 
          type="text" 
          name="meaningVi" 
          placeholder="Nghĩa tiếng Việt..." 
          value={formData.meaningVi} 
        onChange={(event) => { setValidationError(''); handleChange(event); }}
          required 
        />
      </div>

      <div className="form-group">
        <CuteSelect 
          label={t('words.type')}
          options={wordTypeOptions}
          value={formData.type}
          onChange={(val) => setFormData({ ...formData, type: val })}
        />
      </div>

      <div className="form-group">
        <label>{t('words.phonetic', 'Phonetic')}</label>
        <input type="text" name="phonetic" placeholder="/ˈwɜːrd/" value={formData.phonetic || ''} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>{t('words.audio_url', 'Audio URL')}</label>
        <input type="url" name="audioUrl" placeholder="https://..." value={formData.audioUrl || ''} onChange={handleChange} />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>{t('words.synonyms', 'Synonyms')}</label>
          <input type="text" value={synonymsText} onChange={(event) => setSynonymsText(event.target.value)} placeholder="comma separated" />
        </div>
        <div className="form-group">
          <label>{t('words.antonyms', 'Antonyms')}</label>
          <input type="text" value={antonymsText} onChange={(event) => setAntonymsText(event.target.value)} placeholder="comma separated" />
        </div>
      </div>

      <div className="form-group">
        <label>{t('words.example')}</label>
        <textarea 
          name="example" 
          placeholder="How is it used?" 
          value={formData.example} 
          onChange={handleChange} 
        />
      </div>

      {validationError && <p className="form-error" role="alert">{validationError}</p>}

      <div className="form-actions">
        <Button variant="outline" type="button" onClick={onCancel}>{t('common.cancel')}</Button>
        <Button variant="primary" type="submit">
          {initialData ? `${t('common.edit')} ✨` : `${t('common.save')} ✨`}
        </Button>
      </div>
    </form>
  );
};

export default WordForm;
