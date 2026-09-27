import React, { useState } from 'react';
import ReModal from '@/components/ui/ReModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';
import type { Word } from '@/store/api/wordsApi';

interface RejectModerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  word?: Word | null;
  isLoading?: boolean;
}

export const RejectModerationModal: React.FC<RejectModerationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  word,
  isLoading = false,
}) => {
  const [reason, setReason] = useState('');

  const [prevWord, setPrevWord] = useState(word);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (word !== prevWord || isOpen !== prevIsOpen) {
    setPrevWord(word);
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
      title={`Reject Word Entry: ${word?.word?.toUpperCase() || ''}`}
      description="Specify the moderation reason for rejecting this word submission. An email notification will be sent to the owner."
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
            {isLoading ? 'Rejecting...' : 'Confirm Reject'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>This word entry will be marked as REJECTED and archived.</span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Rejection Reason <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="e.g. Inaccurate translation / Offensive vocabulary / Spam"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="bg-muted/40 border-border/80 h-10 font-medium text-foreground text-xs"
            required
            autoFocus
          />
        </div>
      </form>
    </ReModal>
  );
};

export default RejectModerationModal;
