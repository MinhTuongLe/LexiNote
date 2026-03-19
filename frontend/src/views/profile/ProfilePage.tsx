import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../../store/authSlice';
import { useUpdateProfileMutation, useChangePasswordMutation } from '../../store/apiSlice';
import { useCuteDialog } from '../../context/DialogContext';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import { User, Mail, Lock, Pencil, Check, ArrowLeft } from 'lucide-react';
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
            <input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
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
