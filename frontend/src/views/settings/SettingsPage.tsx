import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Settings as SettingsIcon, Languages, ChevronRight, Sparkles
} from 'lucide-react';
import BackButton from '../../components/BackButton';

import { useUpdateSettingsMutation, useGetSettingsQuery } from '../../store/apiSlice';
import { useCuteDialog } from '../../context/DialogContext';
import Button from '../../components/Button';
import Card from '../../components/Card';
import CuteSelect from '../../components/CuteSelect';
import './SettingsPage.css';

interface SettingsPageProps {
  onBack: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
  const { data: settingsData } = useGetSettingsQuery();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { showAlert } = useCuteDialog();
  const [updateSettings] = useUpdateSettingsMutation();

  // Settings state from user profile or defaults
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  const language = i18n.language?.startsWith('vi') ? 'vi' : 'en';

  useEffect(() => {
    if (settingsData) {
      if (settingsData.preferences?.soundEnabled !== undefined) setIsSoundEnabled(settingsData.preferences.soundEnabled);
    }
  }, [settingsData]);

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleSaveSetting = async (key: string, value: any) => {
    try {
      await updateSettings({ [key]: value }).unwrap();
    } catch (err: any) {
      showAlert(t('common.error'), err.data?.message || 'Failed to update settings', 'error');
    }
  };

  const langOptions = [
    { value: 'en', label: t('profile.lang_en') },
    { value: 'vi', label: t('profile.lang_vi') }
  ];

  return (
    <div className="settings-page">
      <div className="settings-back">
        <BackButton onClick={onBack} variant="outline" />
      </div>

      <Card className="settings-main-card">
        <div className="settings-hero">
          <div className="settings-icon-large">
            <SettingsIcon size={40} />
          </div>
          <h2>{t('settings.title')}</h2>
          <p>{t('profile.app_preferences')}</p>
        </div>

        <div className="settings-list">
          {/* App Preferences */}
          <div className="settings-group">
            <div className="settings-header">
              <Sparkles className="settings-icon" size={20} />
              <h4>{t('profile.app_preferences')}</h4>
            </div>
            <div className="settings-content">
              <div className="setting-item">
                <div className="setting-label">
                  <span>{t('profile.sound_effects') || t('profile.minigame_sounds')}</span>
                  <p>{t('profile.sound_effects_desc') || t('profile.minigame_sounds_desc')}</p>
                </div>
                <label className="cute-switch">
                  <input 
                    type="checkbox" 
                    checked={isSoundEnabled} 
                    onChange={(e) => {
                      setIsSoundEnabled(e.target.checked);
                      handleSaveSetting('soundEnabled', e.target.checked);
                    }} 
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <span>{t('profile.language')}</span>
                  <p>{t('profile.language_desc')}</p>
                </div>
                <CuteSelect 
                  options={langOptions} 
                  value={language} 
                  onChange={handleLanguageChange} 
                  className="settings-cute-select" 
                />
              </div>
            </div>
          </div>

          <div className="settings-divider"></div>

          {/* New: Language & Study Link */}
          <div className="settings-group clickable-group" onClick={() => navigate('/settings/language')}>
            <div className="settings-header">
              <Languages className="settings-icon" size={20} />
              <h4>{t('settings.language_study_title') || 'Language & Study'}</h4>
              <ChevronRight className="group-arrow" size={20} />
            </div>
            <div className="settings-content">
              <p className="group-desc">{t('settings.language_study_desc') || 'Manage word categories and flashcard preferences'}</p>
            </div>
          </div>

          <div className="settings-divider"></div>


        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
