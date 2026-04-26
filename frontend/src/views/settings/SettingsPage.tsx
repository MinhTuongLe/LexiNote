import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Moon, ShieldAlert, Trash2, 
  Settings as SettingsIcon, Languages, ChevronRight, Sparkles
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { useUpdateSettingsMutation, useGetSettingsQuery, useDeactivateAccountMutation } from '../../store/apiSlice';
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
  const dispatch = useDispatch();
  const { showAlert, showConfirm } = useCuteDialog();
  const [updateSettings] = useUpdateSettingsMutation();
  const [deactivateAccount] = useDeactivateAccountMutation();

  // Settings state from user profile or defaults
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const language = i18n.language?.startsWith('vi') ? 'vi' : 'en';

  useEffect(() => {
    if (settingsData) {
      if (settingsData.preferences?.darkTheme !== undefined) setIsDarkTheme(settingsData.preferences.darkTheme);
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
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft size={18} /> {t('common.back')}
        </Button>
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
              <Moon className="settings-icon" size={20} />
              <h4>{t('profile.app_preferences')}</h4>
            </div>
            <div className="settings-content">
              <div className="setting-item">
                <div className="setting-label">
                  <span>{t('profile.dark_mode')}</span>
                  <p>{t('profile.dark_mode_desc')}</p>
                </div>
                <label className="cute-switch">
                  <input 
                    type="checkbox" 
                    checked={isDarkTheme} 
                    onChange={(e) => {
                      setIsDarkTheme(e.target.checked);
                      handleSaveSetting('darkTheme', e.target.checked);
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

        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
