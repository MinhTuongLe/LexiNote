import React, { useState } from 'react';
import { 
  Search, 
  Plus,
  Edit2,
  Trash2,
  User,
  BrainCircuit,
  X,
  Tag,
  Layers
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WordCardSkeleton } from '@/components/ui/skeletons';
import { useWords } from './useWords';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useToast } from '@/components/ui/Toast';
import Tooltip from '@/components/ui/Tooltip';
import PageHeader from '@/components/common/PageHeader';
import Pagination from '@/components/common/Pagination';
import WordFormModal from './WordFormModal';
import WordRelationModal from './WordRelationModal';
import WordImportModal from './WordImportModal';
import type { Word } from '@/store/api/wordsApi';

const WordLibraryPage: React.FC = () => {
  const {
    words,
    isLoading,
    search,
    setSearch,
    page,
    setPage,
    type,
    setType,
    ownerId,
    setOwnerId,
    totalPages,
    totalWords,
    handleUpdateWord,
    handleDelete,
    handleAddRelation,
    handleDeleteRelation,
  } = useWords();

  const { toast } = useToast();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRelationModalOpen, setIsRelationModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEditTrigger = (word: Word) => {
    setEditingWord(word);
    setIsEditModalOpen(true);
  };

  const handleRelationTrigger = (word: Word) => {
    setEditingWord(word);
    setIsRelationModalOpen(true);
  };

  const onConfirmUpdate = async (data: { meaningVi: string; example: string }) => {
    if (!editingWord) return;
    setIsProcessing(true);
    try {
      await handleUpdateWord(editingWord.id, data);
      toast.success('Word Updated', `Updated definition for "${editingWord.word}"`);
      setIsEditModalOpen(false);
    } catch {
      toast.error('Update Failed', 'Could not update word definition.');
    } finally {
      setIsProcessing(false);
    }
  };

  const onAddRelationSubmit = async (type: 'synonym' | 'antonym' | 'collocation', value: string) => {
    if (!editingWord) return;
    setIsProcessing(true);
    try {
      await handleAddRelation(editingWord.id, type, value);
      toast.success('Relation Added', `Added ${type}: "${value}"`);
      setEditingWord((prev) =>
        prev
          ? {
              ...prev,
              relations: [...(prev.relations || []), { id: Date.now(), wordId: prev.id, type, value }],
            }
          : null
      );
    } catch {
      toast.error('Action Failed', 'Could not add word relation.');
    } finally {
      setIsProcessing(false);
    }
  };

  const onDeleteRelationItem = async (relationId: number) => {
    try {
      await handleDeleteRelation(relationId);
      toast.success('Relation Deleted', 'Relation item removed.');
      setEditingWord((prev) =>
        prev
          ? {
              ...prev,
              relations: (prev.relations || []).filter((r) => r.id !== relationId),
            }
          : null
      );
    } catch {
      toast.error('Action Failed', 'Could not delete relation.');
    }
  };

  const onConfirmDelete = async () => {
    if (!editingWord) return;
    setIsProcessing(true);
    try {
      await handleDelete(editingWord.id);
      setIsDeleteModalOpen(false);
      toast.success('Word Removed', `"${editingWord.word}" removed from registry.`);
    } catch {
      toast.error('Delete Failed', 'Registry constraint prevented removal.');
    } finally {
      setIsProcessing(false);
    }
  };

  const onConfirmBatch = async (rawWords: string) => {
    const count = rawWords.split(',').length;
    toast.info('Batch Import', `Processing ${count} lexical entries...`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header Component */}
      <PageHeader
        title="Word Library"
        description="Audit and curate linguistic vocabulary repository & relations."
        action={
          <Button 
            size="sm" 
            className="h-9 font-medium shadow-xs" 
            onClick={() => setIsBatchModalOpen(true)}
          >
            <Plus size={16} className="mr-1.5" /> Batch Word Import
          </Button>
        }
      />

      {ownerId && (
        <div className="flex items-center justify-between p-3 rounded-xl border border-primary/30 bg-primary/10 text-primary text-xs font-semibold">
          <div className="flex items-center gap-2">
            <User size={16} />
            <span>Filtering words owned by User #{ownerId}</span>
          </div>
          <Button
            size="xs"
            variant="ghost"
            onClick={() => setOwnerId(undefined)}
            className="h-6 px-2 text-primary hover:bg-primary/20 gap-1"
          >
            <X size={12} /> Clear Filter
          </Button>
        </div>
      )}

      {/* Edit Word Modal Component */}
      <WordFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={onConfirmUpdate}
        word={editingWord}
        isLoading={isProcessing}
      />

      {/* Word Relations Modal Component */}
      <WordRelationModal
        isOpen={isRelationModalOpen}
        onClose={() => setIsRelationModalOpen(false)}
        word={editingWord}
        onAddRelation={onAddRelationSubmit}
        onDeleteRelation={onDeleteRelationItem}
        isLoading={isProcessing}
      />

      {/* Batch Import Modal Component */}
      <WordImportModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onImport={onConfirmBatch}
      />

      {/* Delete Word Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={onConfirmDelete}
        title="Confirm Word Removal"
        description={`Are you sure you want to delete "${editingWord?.word}" from the active database registry?`}
        confirmText="Remove Word"
        variant="danger"
        isLoading={isProcessing}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar Filters */}
        <div className="w-full lg:w-64 space-y-4 shrink-0">
          <Card className="border-border/60 bg-card p-4 shadow-xs rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Layers size={14} className="text-primary" /> Lexical Category
            </h3>
            <div className="space-y-1">
              {(['all', 'noun', 'verb', 'adjective', 'adverb'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    type === t
                      ? 'bg-primary/10 text-primary font-bold shadow-2xs border border-primary/20'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <span className="capitalize">{t}</span>
                  {type === t && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Main Word Grid Section */}
        <div className="flex-1 space-y-4">
          <Card className="border-border/60 bg-card p-3 shadow-xs rounded-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
              <Input
                placeholder="Search vocabulary by keyword, definition, or example..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 bg-muted/20 border-border/60 text-xs font-medium text-foreground focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
          </Card>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading ? (
              <WordCardSkeleton count={4} />
            ) : words.length === 0 ? (
              <div className="col-span-full bg-card border border-border/60 rounded-xl p-12 text-center text-muted-foreground text-xs">
                No vocabulary records matched your filter criteria.
              </div>
            ) : (
              words.map((word) => (
                <Card
                  key={word.id}
                  className="border-border/60 bg-card hover:border-primary/40 transition-all shadow-xs group overflow-hidden rounded-xl"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                            {word.word}
                          </h3>
                          <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-semibold uppercase">
                            {word.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1">
                          <User size={12} />
                          <button
                            onClick={() => setOwnerId(word.ownerId)}
                            className="hover:underline hover:text-foreground"
                          >
                            Owner #{word.ownerId}
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Tooltip content="Manage Relations (Synonyms/Antonyms)" side="top">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRelationTrigger(word);
                            }}
                            className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          >
                            <Tag size={13} />
                          </Button>
                        </Tooltip>

                        <Tooltip content="Edit Meaning & Example" side="top">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTrigger(word);
                            }}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                          >
                            <Edit2 size={13} />
                          </Button>
                        </Tooltip>

                        <Tooltip content="Delete Word" side="top">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingWord(word);
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            <Trash2 size={13} />
                          </Button>
                        </Tooltip>
                      </div>
                    </div>

                    <div className="mb-3 space-y-2">
                      <div className="bg-muted/40 p-3.5 rounded-lg border border-border/60">
                        <p className="text-xs font-semibold text-foreground leading-relaxed">
                          {word.meaningVi}
                        </p>
                        {word.example && (
                          <p className="text-[11px] text-muted-foreground italic mt-1 leading-relaxed">
                            "{word.example}"
                          </p>
                        )}
                      </div>

                      {word.relations && word.relations.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {word.relations.map((rel) => (
                            <span
                              key={rel.id}
                              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                                rel.type === 'synonym'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                  : rel.type === 'antonym'
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                                  : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                              }`}
                            >
                              <span className="uppercase text-[8px] opacity-70">{rel.type}:</span>
                              {rel.value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* SRS Stats Summary Bar */}
                    {word.reviews?.[0] ? (
                      <div className="flex items-center justify-between text-[11px] font-mono p-2 rounded-lg bg-muted/20 border border-border/40 mb-3">
                        <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold">
                          <BrainCircuit size={12} /> EF: {word.reviews[0].easeFactor}
                        </span>
                        <span className="text-muted-foreground">
                          ✓ {word.reviews[0].correctCount} / ✗ {word.reviews[0].wrongCount}
                        </span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-muted-foreground italic px-1 mb-3">
                        New word (No SRS reviews yet)
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Reusable Pagination Component */}
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={totalWords}
          />
        </div>
      </div>
    </div>
  );
};

export default WordLibraryPage;
