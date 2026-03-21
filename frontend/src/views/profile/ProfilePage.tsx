import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../../store/authSlice';
import { useUpdateProfileMutation, useChangePasswordMutation } from '../../store/apiSlice';
import { useCuteDialog } from '../../context/DialogContext';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import CuteSelect from '../../components/CuteSelect';
import { User, Mail, Lock, Pencil, Check, ArrowLeft, Moon, Volume2, Trash2, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import './ProfilePage.css';

const AVATAR_OPTIONS = ['🐰', '🐱', '🐶', '🦊', '🐼', '🐨', '🐸', '🦄', '🐻', '🐧', '🦁', '🐯', '🐮', '🐷', '🐵', '🦋', '🌸', '🌟', '⭐', '🔥', '💎', '🎯', '🎨', '🎭'];

interface ProfilePageProps {
  onBack: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const { user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const { showAlert } = useCuteDialog();

  // Profile edit
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '🐰');
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();

  // Password change modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  // Settings state mockups
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [language, setLanguage] = useState('en');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [flashcardFront, setFlashcardFront] = useState('en');
  const [rememberLogin, setRememberLogin] = useState(true);

  const langOptions = [
    { value: 'en', label: 'English' },
    { value: 'vi', label: 'Tiếng Việt' }
  ];

  const flashcardOptions = [
    { value: 'en', label: 'English Word' },
    { value: 'vi', label: 'Vietnamese Meaning' }
  ];

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setSelectedAvatar(user.avatar);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      const result = await updateProfile({
        fullName,
        avatar: selectedAvatar,
      }).unwrap();
      dispatch(updateUser(result.user));
      setIsEditingProfile(false);
      showAlert('Updated! ✨', 'Your profile has been updated!', 'success');
    } catch (err: any) {
      showAlert('Error! 😿', err.data?.message || 'Failed to update profile.', 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      showAlert('Too Short! 🔑', 'Password must be at least 6 characters.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert('Mismatch! 🔑', 'New passwords do not match.', 'error');
      return;
    }

    try {
      await changePassword({ currentPassword, newPassword }).unwrap();
      showAlert('Success! 🎉', 'Your password has been changed!', 'success');
      setIsPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showAlert('Error! 😿', err.data?.message || 'Failed to change password.', 'error');
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-back">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft size={18} /> Back
        </Button>
      </div>

      <Card className="profile-card">
        <div className="profile-hero">
          <div className="profile-avatar-large">
            {isEditingProfile ? selectedAvatar : user?.avatar || '🐰'}
          </div>
          <h2>{user?.fullName}</h2>
          <p className="profile-email">
            <Mail size={16} /> {user?.email}
          </p>
        </div>

        {isEditingProfile ? (
          <div className="profile-edit-section">
            <div className="form-group">
              <label><User size={16} /> Display Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="form-group">
              <label>Choose Your Avatar</label>
              <div className="avatar-grid">
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={`avatar-option ${selectedAvatar === emoji ? 'selected' : ''}`}
                    onClick={() => setSelectedAvatar(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="profile-edit-actions">
              <Button variant="primary" onClick={handleSaveProfile} disabled={isUpdatingProfile}>
                <Check size={18} /> {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => {
                setIsEditingProfile(false);
                setFullName(user?.fullName || '');
                setSelectedAvatar(user?.avatar || '🐰');
              }}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="profile-actions">
            <Button variant="primary" onClick={() => setIsEditingProfile(true)}>
              <Pencil size={18} /> Edit Profile
            </Button>
            <Button variant="outline" onClick={() => setIsPasswordModalOpen(true)}>
              <Lock size={18} /> Change Password
            </Button>
          </div>
        )}
      </Card>

      {/* General Settings Section */}
      <Card className="settings-main-card">
        <h3 className="settings-main-title">General Settings</h3>

        <div className="settings-list">
          {/* App Preferences */}
          <div className="settings-group">
            <div className="settings-header">
              <Moon className="settings-icon" size={20} />
              <h4>App Preferences</h4>
            </div>
            <div className="settings-content">
              <div className="setting-item">
                <div className="setting-label">
                  <span>Dark Theme</span>
                  <p>Toggle dark mode for night time study.</p>
                </div>
                <label className="cute-switch">
                  <input type="checkbox" checked={isDarkTheme} onChange={(e) => setIsDarkTheme(e.target.checked)} />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <span>Language</span>
                  <p>App interface language.</p>
                </div>
                <CuteSelect options={langOptions} value={language} onChange={setLanguage} className="settings-cute-select" />
              </div>
            </div>
          </div>

          <div className="settings-divider"></div>

          {/* Study Options */}
          <div className="settings-group">
            <div className="settings-header">
              <Volume2 className="settings-icon" size={20} />
              <h4>Study Options</h4>
            </div>
            <div className="settings-content">
              <div className="setting-item">
                <div className="setting-label">
                  <span>Minigame Sounds</span>
                  <p>Play 'ting ting' effects in games.</p>
                </div>
                <label className="cute-switch">
                  <input type="checkbox" checked={soundEnabled} onChange={(e) => setSoundEnabled(e.target.checked)} />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <span>Flashcard Start</span>
                  <p>Which side to show first.</p>
                </div>
                <CuteSelect options={flashcardOptions} value={flashcardFront} onChange={setFlashcardFront} className="settings-cute-select" />
              </div>
            </div>
          </div>

          <div className="settings-divider"></div>

          {/* Account Data */}
          <div className="settings-group account-danger-group">
            <div className="settings-header">
              <ShieldAlert className="settings-icon" size={20} color="#ff7675" />
              <h4 style={{ color: '#ff7675' }}>Account & Data</h4>
            </div>
            <div className="settings-content">
              <div className="setting-item">
                <div className="setting-label">
                  <span>Remember Login</span>
                  <p>Keep me logged in on this device.</p>
                </div>
                <label className="cute-switch">
                  <input type="checkbox" checked={rememberLogin} onChange={(e) => setRememberLogin(e.target.checked)} />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-item delete-data-item">
                <div className="setting-label">
                  <span style={{ color: '#d63031', fontWeight: 'bold' }}>Delete All Data</span>
                  <p>Permanently remove your account and all words.</p>
                </div>
                <Button variant="outline" onClick={() => showAlert('Notice', 'Feature coming soon!', 'alert')} style={{ borderColor: '#ff7675', color: '#ff7675' }}>
                  <Trash2 size={16} /> Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }}
        title="Change Password 🔑"
      >
        <form onSubmit={handleChangePassword} className="password-form">
          <div className="form-group">
            <label>Current Password</label>
            <div className="password-input-wrapper">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <button type="button" className="password-toggle-btn" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
              <button type="button" className="password-toggle-btn" onClick={() => setShowNewPassword(!showNewPassword)}>
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
              <button type="button" className="password-toggle-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="password-form-actions">
            <Button variant="primary" type="submit" disabled={isChangingPassword}>
              {isChangingPassword ? 'Changing...' : 'Change Password ✨'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProfilePage;
