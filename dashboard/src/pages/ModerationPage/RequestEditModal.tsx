import React, { useState } from 'react';
import ReModal from '@/components/ui/ReModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HelpCircle } from 'lucide-react';
import type { Word } from '@/store/api/wordsApi';

interface RequestEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (note: string) => Promise<void>;
  word?: Word | null;
  isLoading?: boolean;
}

export const RequestEditModal: React.FC<RequestEditModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  word,
  isLoading = false,
}) => {
  const [note, setNote] = useState('');

  const [prevWord, setPrevWord] = useState(word);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (word !== prevWord || isOpen !== prevIsOpen) {
    setPrevWord(word);
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setNote('');
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    await onConfirm(note.trim());
    onClose();
  };

  return (
    <ReModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Request Revision: ${word?.word?.toUpperCase() || ''}`}
      description="Send guidance to the author on what needs to be fixed before approving this word entry."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            size="sm" 
            onClick={handleSubmit} 
            disabled={isLoading || !note.trim()}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
          >
            {isLoading ? 'Sending...' : 'Send Revision Request'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 p-3 text-sm text-amber-600 bg-amber-500/10 rounded-lg border border-amber-500/20 dark:text-amber-400">
          <HelpCircle className="h-5 w-5 shrink-0" />
          <span>Status will change to NEEDS_EDIT and the author will be notified to revise their submission.</span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Revision Instructions <span className="text-amber-500">*</span>
          </label>
          <Input
            placeholder="e.g. Please add an example sentence / Fix Vietnamese translation spelling"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="bg-muted/40 border-border/80 h-10 font-medium text-foreground text-xs"
            required
            autoFocus
          />
        </div>
      </form>
    </ReModal>
  );
};

export default RequestEditModal;
