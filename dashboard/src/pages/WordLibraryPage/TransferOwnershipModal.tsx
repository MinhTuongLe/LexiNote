import React, { useState } from 'react';
import ReModal from '@/components/ui/ReModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserCheck } from 'lucide-react';
import type { Word } from '@/store/api/wordsApi';

interface TransferOwnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newOwnerId: number) => Promise<void>;
  word?: Word | null;
  isLoading?: boolean;
}

export const TransferOwnershipModal: React.FC<TransferOwnershipModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  word,
  isLoading = false,
}) => {
  const [newOwnerId, setNewOwnerId] = useState('');

  const [prevWord, setPrevWord] = useState(word);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (word !== prevWord || isOpen !== prevIsOpen) {
    setPrevWord(word);
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setNewOwnerId('');
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = parseInt(newOwnerId);
    if (isNaN(targetId) || targetId <= 0) return;
    await onConfirm(targetId);
    onClose();
  };

  return (
    <ReModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Transfer Ownership: ${word?.word?.toUpperCase() || ''}`}
      description={`Reassign word ownership from ${word?.owner?.fullName || `User #${word?.ownerId}`} to another user.`}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            size="sm" 
            onClick={handleSubmit} 
            disabled={isLoading || !newOwnerId.trim() || isNaN(parseInt(newOwnerId))}
          >
            {isLoading ? 'Transferring...' : 'Transfer Ownership'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 p-3 text-sm text-primary bg-primary/10 rounded-lg border border-primary/20">
          <UserCheck className="h-5 w-5 shrink-0" />
          <span>The word and its study reviews will be transferred to the new owner's vocabulary library.</span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            New Owner User ID <span className="text-destructive">*</span>
          </label>
          <Input
            type="number"
            placeholder="e.g. 12"
            value={newOwnerId}
            onChange={(e) => setNewOwnerId(e.target.value)}
            className="bg-muted/40 border-border/80 h-10 font-mono text-foreground"
            required
            autoFocus
          />
        </div>
      </form>
    </ReModal>
  );
};

export default TransferOwnershipModal;
