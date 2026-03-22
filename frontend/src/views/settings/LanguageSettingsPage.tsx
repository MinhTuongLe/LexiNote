import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, Volume2, Languages, Plus, X, Tag
} from 'lucide-react';
import { useUpdateSettingsMutation, useGetSettingsQuery } from '../../store/apiSlice';
import { useCuteDialog } from '../../context/DialogContext';
import Button from '../../components/Button';
import Card from '../../components/Card';
import CuteSelect from '../../components/CuteSelect';
import './SettingsPage.css'; // Reuse the same CSS

interface LanguageSettingsPageProps {
  onBack: () => void;
}

const LanguageSettingsPage: React.FC<LanguageSettingsPageProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const { showAlert, showConfirm } = useCuteDialog();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();
  const { data: settingsData } = useGetSettingsQuery();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [flashcardFront, setFlashcardFront] = useState('en');
  const [customWordTypes, setCustomWordTypes] = useState<any[]>([]);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeLabel, setNewTypeLabel] = useState('');

  useEffect(() => {
    if (settingsData) {
      if (settingsData.preferences?.soundEnabled !== undefined) setSoundEnabled(settingsData.preferences.soundEnabled);
      if (settingsData.preferences?.flashcardFront !== undefined) setFlashcardFront(settingsData.preferences.flashcardFront);
      if (settingsData.wordTypes?.custom !== undefined) setCustomWordTypes(settingsData.wordTypes.custom);
    }
  }, [settingsData]);

  const handleSaveSetting = async (key: string, value: any) => {
    try {
      await updateSettings({ [key]: value }).unwrap();
    } catch (err: any) {
      showAlert(t('common.error'), err.data?.message || 'Failed to update settings', 'error');
    }
  };

  const handleAddWordType = async () => {
    if (!newTypeName || !newTypeLabel) {
      showAlert(t('settings.missing_title'), t('settings.type_fields_required'), 'error');
      return;
    }

    const value = newTypeName.toLowerCase().trim().replace(/\s+/g, '_');
    
    // Check if exists
    const systemTypes = settingsData?.wordTypes?.system || [];
    const existsInDefaults = systemTypes.includes(value);
    const existsInCustom = customWordTypes.some(t => t.value === value);
    
    if (existsInDefaults || existsInCustom) {
      showAlert(t('settings.exists_title'), t('settings.type_exists'), 'error');
      return;
    }

    const updatedTypes = [...customWordTypes, { value, label: newTypeLabel }];
    try {
      await updateSettings({ wordTypes: updatedTypes }).unwrap();
      const addedLabel = newTypeLabel;
      setNewTypeName('');
      setNewTypeLabel('');
      showAlert(t('settings.added_title'), t('settings.type_added', { label: addedLabel }), 'success');
    } catch (err: any) {
      showAlert(t('common.error'), 'Failed to add word type', 'error');
    }
  };

  const handleDeleteWordType = (value: string) => {
    showConfirm(
      t('settings.delete_type_title'),
      t('settings.delete_type_msg'),
      async () => {
        const updatedTypes = customWordTypes.filter(t => t.value !== value);
        try {
          await updateSettings({ wordTypes: updatedTypes }).unwrap();
          showAlert(t('settings.deleted_title'), t('settings.type_deleted'), 'success');
        } catch (err: any) {
          showAlert(t('common.error'), 'Failed to delete word type', 'error');
        }
      }
    );
  };

  const flashcardOptions = [
    { value: 'en', label: t('profile.flashcard_en') },
    { value: 'vi', label: t('profile.flashcard_vi') }
  ];

  return (
    <div className="settings-page">
      <div className="settings-back">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft size={18} /> {t('common.back')}
        </Button>
      </div>

      <Card className="settings-main-card">
        <div className="settings-hero">
          <div className="settings-icon-large" style={{ backgroundColor: 'var(--secondary-soft)', color: 'var(--secondary)' }}>
            <Languages size={40} />
          </div>
          <h2>{t('settings.language_settings_title') || 'Language Settings'}</h2>
          <p>{t('settings.language_settings_desc') || 'Manage word types and study preferences'}</p>
        </div>

        <div className="settings-list">
          {/* Study Options */}
          <div className="settings-group">
            <div className="settings-header">
              <Volume2 className="settings-icon" size={20} />
              <h4>{t('profile.study_options')}</h4>
            </div>
            <div className="settings-content">
              <div className="setting-item">
                <div className="setting-label">
                  <span>{t('profile.minigame_sounds')}</span>
                  <p>{t('profile.minigame_sounds_desc')}</p>
                </div>
                <label className="cute-switch">
                  <input 
                    type="checkbox" 
                    checked={soundEnabled} 
                    onChange={(e) => {
                      setSoundEnabled(e.target.checked);
                      handleSaveSetting('soundEnabled', e.target.checked);
                    }} 
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <span>{t('profile.flashcard_start')}</span>
                  <p>{t('profile.flashcard_start_desc')}</p>
                </div>
                <CuteSelect 
                  options={flashcardOptions} 
                  value={flashcardFront} 
                  onChange={(val) => {
                    setFlashcardFront(val);
                    handleSaveSetting('flashcardFront', val);
                  }} 
                  className="settings-cute-select" 
                  align='right' 
                />
              </div>
            </div>
          </div>

          <div className="settings-divider"></div>

          {/* Custom Word Types */}
          <div className="settings-group">
            <div className="settings-header">
              <Tag className="settings-icon" size={20} />
              <h4>{t('settings.word_types_manager')}</h4>
            </div>
            <div className="settings-content">
              <p className="settings-hint">{t('settings.word_types_hint')}</p>
              
              <div className="word-types-management">
                {/* System Types Summary Card */}
                <div className="types-section">
                  <h5 className="section-subtitle">{t('settings.default_types')}</h5>
                  <div className="types-grid system">
                    {(settingsData?.wordTypes?.system || []).map(type => (
                      <div key={type} className="type-pill system">
                        {t(`library.word_types.${type}`)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Types Grid */}
                <div className="types-section">
                  <h5 className="section-subtitle">{t('settings.your_categories')}</h5>
                  {customWordTypes.length === 0 ? (
                    <div className="empty-custom-types">
                      <Tag size={32} opacity={0.2} />
                      <p>{t('settings.no_custom_types')}</p>
                    </div>
                  ) : (
                    <div className="types-grid custom">
                      {customWordTypes.map((type) => (
                        <div key={type.value} className="type-card-mini animate-pop">
                          <div className="type-card-content">
                            <span className="type-card-label">{type.label}</span>
                            <span className="type-card-value">{type.value}</span>
                          </div>
                          <button 
                            className="delete-type-btn-mini" 
                            onClick={() => handleDeleteWordType(type.value)}
                            title={t('common.delete')}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <form className="add-type-form" onSubmit={(e) => { e.preventDefault(); handleAddWordType(); }}>
                <div className="form-title">
                  <strong>{t('settings.add_new_type')}</strong>
                </div>
                <div className="form-inputs">
                  <div className="input-field">
                    <label>{t('settings.value_label')}</label>
                    <input 
                      type="text" 
                      placeholder={t('settings.value_placeholder')} 
                      value={newTypeName}
                      onChange={(e) => setNewTypeName(e.target.value)}
                    />
                  </div>
                  <div className="input-field">
                    <label>{t('settings.label_label')}</label>
                    <input 
                      type="text" 
                      placeholder={t('settings.label_placeholder')} 
                      value={newTypeLabel}
                      onChange={(e) => setNewTypeLabel(e.target.value)}
                    />
                  </div>
                </div>
                <Button variant="primary" type="submit" disabled={isUpdating} style={{ width: '100%', marginTop: '8px' }}>
                  <Plus size={16} /> {t('settings.add_type')}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LanguageSettingsPage;
