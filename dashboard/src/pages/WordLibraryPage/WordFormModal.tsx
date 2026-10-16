import React, { useState } from 'react';
import ReModal from '@/components/ui/ReModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Word } from '@/store/api/wordsApi';

interface WordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { meaningVi: string; example: string; phonetic?: string; audioUrl?: string }) => Promise<void>;
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
  const [meaningVi, setMeaningVi] = useState(word?.meaningVi || '');
  const [example, setExample] = useState(word?.example || '');
  const [phonetic, setPhonetic] = useState(word?.phonetic || '');
  const [audioUrl, setAudioUrl] = useState(word?.audioUrl || '');

  const [prevWord, setPrevWord] = useState(word);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  // Sync state during rendering when props change
  if (word !== prevWord || isOpen !== prevIsOpen) {
    setPrevWord(word);
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setMeaningVi(word?.meaningVi || '');
      setExample(word?.example || '');
      setPhonetic(word?.phonetic || '');
      setAudioUrl(word?.audioUrl || '');
    }
  }

  const handleSubmit = async () => {
    if (!meaningVi.trim()) return;
    await onSubmit({ meaningVi, example, phonetic, audioUrl });
    onClose();
  };

  return (
    <ReModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Word: ${word?.word?.toUpperCase() || ''}`}
      description="Modify the semantic definition, IPA phonetic spelling, audio URL, and example sentence."
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
            Semantic Meaning (VI) <span className="text-destructive">*</span>
          </label>
          <Input
            value={meaningVi}
            onChange={(e) => setMeaningVi(e.target.value)}
            className="h-10 font-medium text-foreground bg-background"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Phonetic IPA (Pronunciation)
            </label>
            <Input
              placeholder="e.g. /ˈlex.ɪ.noʊt/"
              value={phonetic}
              onChange={(e) => setPhonetic(e.target.value)}
              className="h-10 font-mono text-xs text-foreground bg-background"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Audio Pronunciation URL
            </label>
            <Input
              placeholder="e.g. https://.../audio.mp3"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              className="h-10 font-mono text-xs text-foreground bg-background"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Example Sentence
          </label>
          <Textarea
            value={example}
            onChange={(e) => setExample(e.target.value)}
            placeholder="e.g. She found the book by pure serendipity."
            className="min-h-22.5 rounded-lg p-3 text-xs font-medium text-foreground bg-background"
          />
        </div>
      </div>
    </ReModal>
  );
};

export default WordFormModal;

