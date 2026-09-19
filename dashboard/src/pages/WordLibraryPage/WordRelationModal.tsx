import React, { useState } from 'react';
import ReModal from '@/components/ui/ReModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Tag, X } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';
import type { Word } from '@/store/api/wordsApi';

interface WordRelationModalProps {
  isOpen: boolean;
  onClose: () => void;
  word: Word | null;
  onAddRelation: (type: 'synonym' | 'antonym' | 'collocation', value: string) => Promise<void>;
  onDeleteRelation: (relationId: number) => Promise<void>;
  isLoading?: boolean;
}

export const WordRelationModal: React.FC<WordRelationModalProps> = ({
  isOpen,
  onClose,
  word,
  onAddRelation,
  onDeleteRelation,
  isLoading = false,
}) => {
  const [relType, setRelType] = useState<'synonym' | 'antonym' | 'collocation'>('synonym');
  const [relValue, setRelValue] = useState('');

  const handleAdd = async () => {
    if (!relValue.trim()) return;
    await onAddRelation(relType, relValue.trim());
    setRelValue('');
  };

  const relations = word?.relations || [];

  return (
    <ReModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manage Relations: ${word?.word?.toUpperCase() || ''}`}
      description="Add synonyms, antonyms, or collocations for this word."
      footer={
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex gap-2 items-end">
          <div className="w-1/3 space-y-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Type</label>
            <select
              value={relType}
              onChange={(e) => setRelType(e.target.value as 'synonym' | 'antonym' | 'collocation')}
              className="w-full bg-muted/40 border border-border/80 rounded-md h-9 px-2 text-xs font-semibold text-foreground focus:outline-hidden"
            >
              <option value="synonym">Synonym</option>
              <option value="antonym">Antonym</option>
              <option value="collocation">Collocation</option>
            </select>
          </div>
          <div className="w-2/3 space-y-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Value</label>
            <div className="flex gap-1">
              <Input
                value={relValue}
                onChange={(e) => setRelValue(e.target.value)}
                placeholder="e.g. chance, luck..."
                className="bg-muted/40 border-border/80 h-9 text-xs font-medium text-foreground"
              />
              <Button
                size="sm"
                className="h-9 px-3 shrink-0"
                onClick={handleAdd}
                disabled={isLoading || !relValue.trim()}
              >
                <Plus size={14} /> Add
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-border/60 space-y-2">
          <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Tag size={13} className="text-primary" /> Active Relations ({relations.length})
          </h4>
          {relations.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-2">No relations recorded yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              {relations.map((rel) => (
                <div
                  key={rel.id}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
                    rel.type === 'synonym'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : rel.type === 'antonym'
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                      : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                  }`}
                >
                  <span className="uppercase text-[9px] font-bold opacity-75">{rel.type}:</span>
                  <span>{rel.value}</span>
                  <Tooltip content="Remove relation" side="top">
                    <button
                      onClick={() => onDeleteRelation(rel.id)}
                      className="ml-1 hover:text-destructive transition-colors cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </Tooltip>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ReModal>
  );
};

export default WordRelationModal;
