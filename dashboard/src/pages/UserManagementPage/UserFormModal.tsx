import React, { useState, useEffect } from 'react';
import ReModal from '@/components/ui/ReModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { DashboardUserItem } from './useUsers';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { fullName: string; email?: string }) => Promise<void>;
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
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
    } else {
      setFullName('');
      setEmail('');
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    await onSubmit(isEditing ? { fullName } : { fullName, email });
    onClose();
  };

  return (
    <ReModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Update User Profile' : 'Add New Member'}
      description={
        isEditing
          ? `Modify profile details for: ${user?.email}`
          : 'Initialize a new administrative or student account.'
      }
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={isLoading || !fullName.trim()}>
            {isLoading ? (isEditing ? 'Saving...' : 'Creating...') : isEditing ? 'Save Changes' : 'Create Account'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Full Name
          </label>
          <Input
            placeholder="e.g. Linh Nguyen"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="bg-muted/40 border-border/80 h-10 font-medium text-foreground"
            required
          />
        </div>

        {!isEditing && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="e.g. linh@lexinote.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-muted/40 border-border/80 h-10 font-medium text-foreground"
              required
            />
          </div>
        )}
      </form>
    </ReModal>
  );
};

export default UserFormModal;
