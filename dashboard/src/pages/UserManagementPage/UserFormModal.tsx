import React, { useState } from 'react';
import ReModal from '@/components/ui/ReModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { DashboardUserItem } from './useUsers';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { fullName: string; email?: string; password?: string; role?: 'ADMIN' | 'MEMBER' }) => Promise<void>;
  user?: DashboardUserItem | null;
  isLoading?: boolean;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
  isLoading = false,
}) => {
  const isEditing = !!user;
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MEMBER'>((user?.role as 'ADMIN' | 'MEMBER') || 'MEMBER');

  const [prevUser, setPrevUser] = useState(user);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (user !== prevUser || isOpen !== prevIsOpen) {
    setPrevUser(user);
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setFullName(user?.fullName || '');
      setEmail(user?.email || '');
      setPassword('');
      setRole((user?.role as 'ADMIN' | 'MEMBER') || 'MEMBER');
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    if (isEditing) {
      await onSubmit({ fullName });
    } else {
      await onSubmit({ 
        fullName: fullName.trim(), 
        email: email.trim(), 
        password: password.trim() || undefined,
        role 
      });
    }
    onClose();
  };

  return (
    <ReModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Update User Profile' : 'Add New User Account'}
      description={
        isEditing
          ? `Modify profile details for: ${user?.email}`
          : 'Create a new administrative or student account with customized roles and credentials.'
      }
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={isLoading || !fullName.trim() || (!isEditing && !email.trim())}>
            {isLoading ? (isEditing ? 'Saving...' : 'Creating...') : isEditing ? 'Save Changes' : 'Create Account'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Full Name <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="e.g. Linh Nguyen"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-10 font-medium text-foreground bg-background"
            required
          />
        </div>

        {!isEditing && (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Email Address <span className="text-destructive">*</span>
              </label>
              <Input
                type="email"
                placeholder="e.g. linh@lexinote.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 font-medium text-foreground bg-background"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Password <span className="text-muted-foreground font-normal">(Default: 123456)</span>
                </label>
                <Input
                  type="password"
                  placeholder="Optional custom password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 font-medium text-foreground bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  User Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'ADMIN' | 'MEMBER')}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium text-foreground transition-all outline-none focus:border-ring focus:ring-2 focus:ring-ring/40 shadow-xs"
                >
                  <option value="MEMBER">Member (Student)</option>
                  <option value="ADMIN">Admin (System Manager)</option>
                </select>
              </div>
            </div>
          </>
        )}
      </form>
    </ReModal>
  );
};

export default UserFormModal;
