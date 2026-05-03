import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateUser, logout } from '../../store/authSlice';
import { useUpdateProfileMutation, useChangePasswordMutation, useDeactivateAccountMutation } from '../../store/apiSlice';
import { useCuteDialog } from '../../context/DialogContext';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import { User, Mail, Lock, Pencil, Check, Eye, EyeOff, ShieldAlert, Trash2 } from 'lucide-react';
import BackButton from '../../components/BackButton';
import { useTranslation } from 'react-i18next';
import './ProfilePage.css';

const AVATAR_OPTIONS = ['🐰', '🐱', '🐶', '🦊', '🐼', '🐨', '🐸', '🦄', '🐻', '🐧', '🦁', '🐯', '🐮', '🐷', '🐵', '🦋', '🌸', '🌟', '⭐', '🔥', '💎', '🎯', '🎨', '🎭'];

interface ProfilePageProps {
  onBack: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const { user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showAlert, showConfirm } = useCuteDialog();
  const [deactivateAccount] = useDeactivateAccountMutation();

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
        <BackButton onClick={onBack} variant="outline" />
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
              <label><User size={16} /> {t('profile.display_name')}</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="form-group">
              <label>{t('profile.choose_avatar')}</label>
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
                <Check size={18} /> {isUpdatingProfile ? t('common.loading') : t('common.save')}
              </Button>
              <Button variant="outline" onClick={() => {
                setIsEditingProfile(false);
                setFullName(user?.fullName || '');
                setSelectedAvatar(user?.avatar || '🐰');
              }}>
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="profile-actions">
            <Button variant="primary" onClick={() => setIsEditingProfile(true)}>
              <Pencil size={18} /> {t('profile.edit_profile')}
            </Button>
            <Button variant="outline" onClick={() => setIsPasswordModalOpen(true)}>
              <Lock size={18} /> {t('profile.change_password')}
            </Button>
          </div>
        )}
      </Card>

      <Card className="profile-card danger-zone-card" style={{ marginTop: '20px', borderColor: '#ffeaa7' }}>
        <div className="settings-group account-danger-group">
          <div className="settings-header">
            <ShieldAlert className="settings-icon" size={20} color="#ff7675" />
            <h4 style={{ color: '#ff7675', margin: 0 }}>{t('profile.danger_zone')}</h4>
          </div>
          <div className="settings-content">
            <div className="setting-item delete-data-item" style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="setting-label">
                <span style={{ color: '#d63031', fontWeight: 'bold' }}>{t('profile.delete_all_data')}</span>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#636e72' }}>{t('profile.delete_all_data_desc')}</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => showConfirm(
                  t('profile.delete_confirm_title'),
                  t('profile.delete_confirm_msg'),
                  async () => {
                    try {
                      await deactivateAccount().unwrap();
                      showAlert(t('common.success'), t('profile.delete_success_msg') || 'Tài khoản của bạn đã được xóa và đăng xuất!', 'success');
                      dispatch(logout());
                      navigate('/login');
                    } catch (err: any) {
                      showAlert(t('common.error'), err.data?.message || 'Failed to delete data', 'error');
                    }
                  }
                )} 
                style={{ borderColor: '#ff7675', color: '#ff7675' }}
              >
                <Trash2 size={16} /> {t('common.delete')}
              </Button>
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
        title={`${t('profile.change_password')} 🔑`}
      >
        <form onSubmit={handleChangePassword} className="password-form">
          <div className="form-group">
            <label>{t('profile.current_password')}</label>
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
            <label>{t('profile.new_password')}</label>
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
            <label>{t('profile.confirm_new_password')}</label>
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
              {isChangingPassword ? t('common.loading') : t('profile.change_password')} ✨
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProfilePage;
