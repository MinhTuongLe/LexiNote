import React, { useState, useEffect } from 'react';
import ReModal from '@/components/ui/ReModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Word } from '@/store/api/wordsApi';

interface WordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { meaningVi: string; example: string }) => Promise<void>;
  word: Word | null;
  isLoading?: boolean;
}

export const WordFormModal: React.FC<WordFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  word,
  isLoading = false,
}) => {
  const [meaningVi, setMeaningVi] = useState('');
  const [example, setExample] = useState('');

  useEffect(() => {
    if (word) {
      setMeaningVi(word.meaningVi || '');
      setExample(word.example || '');
    }
  }, [word, isOpen]);

  const handleSubmit = async () => {
    if (!meaningVi.trim()) return;
    await onSubmit({ meaningVi, example });
    onClose();
  };

  return (
    <ReModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Word: ${word?.word?.toUpperCase() || ''}`}
      description="Modify the semantic definition and example sentence."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={isLoading || !meaningVi.trim()}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Semantic Meaning (VI)
          </label>
          <Input
            value={meaningVi}
            onChange={(e) => setMeaningVi(e.target.value)}
            className="bg-muted/40 border-border/80 h-10 font-medium text-foreground"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Example Sentence
          </label>
          <Textarea
            value={example}
            onChange={(e) => setExample(e.target.value)}
            placeholder="e.g. She found the book by pure serendipity."
            className="bg-muted/40 border-border/80 min-h-[90px] rounded-lg p-3 text-xs font-medium text-foreground"
          />
        </div>
      </div>
    </ReModal>
  );
};

export default WordFormModal;
