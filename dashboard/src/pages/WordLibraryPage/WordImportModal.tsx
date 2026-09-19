import React, { useState } from 'react';
import ReModal from '@/components/ui/ReModal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface WordImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (rawWords: string) => Promise<void>;
  isLoading?: boolean;
}

export const WordImportModal: React.FC<WordImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  isLoading = false,
}) => {
  const [batchData, setBatchData] = useState('');

  const handleImport = async () => {
    if (!batchData.trim()) return;
    await onImport(batchData);
    setBatchData('');
    onClose();
  };

  return (
    <ReModal
      isOpen={isOpen}
      onClose={onClose}
      title="Batch Word Import"
      description="Inject multiple vocabulary words into the global database."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleImport} disabled={isLoading || !batchData.trim()}>
            {isLoading ? 'Importing...' : 'Start Import'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Raw Words (Comma Separated)
          </label>
          <Textarea
            placeholder="e.g. ephemeral, serendipity, pragmatic..."
            value={batchData}
            onChange={(e) => setBatchData(e.target.value)}
            className="bg-muted/40 border-border/80 min-h-[140px] rounded-lg p-3 font-mono text-xs text-foreground"
          />
        </div>
      </div>
    </ReModal>
  );
};

export default WordImportModal;
