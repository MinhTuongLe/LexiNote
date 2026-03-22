import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WORD_TYPES } from '../constants/wordTypes';
import { useGetSettingsQuery } from '../store/apiSlice';
import Button from './Button';
import CuteSelect from './CuteSelect';
import type { CreateWordDTO } from '../types';
import './WordForm.css';

interface WordFormProps {
  onSubmit: (data: CreateWordDTO) => void;
  onCancel: () => void;
  initialData?: CreateWordDTO;
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

  const wordTypeOptions = [
    ...WORD_TYPES.map(type => ({
      value: type.value,
      label: t(`library.word_types.${type.value}`)
    })),
    ...(settingsData?.wordTypes?.custom || []).map((type: any) => ({
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
    onSubmit(formData);
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
          onChange={handleChange} 
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
          onChange={handleChange} 
          required 
        />
      </div>

      <div className="form-group">
        <CuteSelect 
          label={t('words.type')}
          options={wordTypeOptions}
          value={formData.type}
          onChange={(val) => setFormData({ ...formData, type: val as any })}
        />
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
