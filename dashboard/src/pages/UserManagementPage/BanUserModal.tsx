import React, { useState } from 'react';
import ReModal from '@/components/ui/ReModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle } from 'lucide-react';
import type { DashboardUserItem } from './useUsers';

interface BanUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  user?: DashboardUserItem | null;
  isLoading?: boolean;
}

export const BanUserModal: React.FC<BanUserModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  user,
  isLoading = false,
}) => {
  const [reason, setReason] = useState('');

  const [prevUser, setPrevUser] = useState(user);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (user !== prevUser || isOpen !== prevIsOpen) {
    setPrevUser(user);
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setReason('');
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    await onConfirm(reason.trim());
    onClose();
  };

  return (
    <ReModal
      isOpen={isOpen}
      onClose={onClose}
      title="Ban Account & Revoke Sessions"
      description={`Specify the administrative reason for suspending ${user?.email || 'this user'}. This will revoke all active login sessions.`}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleSubmit} 
            disabled={isLoading || !reason.trim()}
          >
            {isLoading ? 'Banning...' : 'Confirm Ban'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>The user will be immediately logged out of all active devices.</span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Ban Reason <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="e.g. Violation of Community Standards / Spam Activity"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="bg-muted/40 border-border/80 h-10 font-medium text-foreground"
            required
            autoFocus
          />
        </div>
      </form>
    </ReModal>
  );
};

export default BanUserModal;
