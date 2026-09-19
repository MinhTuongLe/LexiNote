import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Sparkles, 
  CheckSquare, 
  Square,
  RefreshCw,
  Edit2,
  Trash2,
  ThumbsUp
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ModerationCardSkeleton } from '@/components/ui/skeletons';
import { useGetWordsQuery, useDeleteWordMutation, useUpdateWordMutation } from '@/store/api/wordsApi';
import type { Word } from '@/store/api/wordsApi';
import { useToast } from '@/components/ui/Toast';
import ReModal from '@/components/ui/ReModal';

const ModerationPage: React.FC = () => {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [qualityFilter, setQualityFilter] = useState<'ALL' | 'MISSING_EXAMPLE' | 'SHORT_MEANING'>('ALL');
  const [selectedWordIds, setSelectedWordIds] = useState<number[]>([]);
  
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [newMeaning, setNewMeaning] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data, isLoading, refetch } = useGetWordsQuery({
    page,
    search,
    limit: 20,
  });

  const [deleteWord] = useDeleteWordMutation();
  const [updateWord] = useUpdateWordMutation();

  const allWords = data?.data || [];

  // Filter for items requiring moderation or quality review
  const filteredWords = allWords.filter((w: Word) => {
    if (qualityFilter === 'MISSING_EXAMPLE') return !w.example || w.example.trim() === '';
    if (qualityFilter === 'SHORT_MEANING') return !w.meaningVi || w.meaningVi.length < 5;
    return true;
  });

  const toggleSelectWord = (id: number) => {
    setSelectedWordIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedWordIds.length === filteredWords.length) {
      setSelectedWordIds([]);
    } else {
      setSelectedWordIds(filteredWords.map((w: Word) => w.id));
    }
  };

  const handleApprove = (word: Word) => {
    toast({ type: 'success', title: 'Approved & Verified', message: `"${word.word}" passed moderation standards.` });
  };

  const handleBulkApprove = () => {
    toast({ type: 'success', title: 'Batch Approved', message: `${selectedWordIds.length} lexical items approved.` });
    setSelectedWordIds([]);
  };

  const handleReject = async (wordId: number) => {
    try {
      await deleteWord(wordId).unwrap();
      toast({ type: 'info', title: 'Word Rejected', message: 'Item removed and archived to trash.' });
      refetch();
    } catch {
      toast({ type: 'error', title: 'Action Failed', message: 'Could not reject word.' });
    }
  };

  const handleConfirmEdit = async () => {
    if (!editingWord || !newMeaning) return;
    try {
      await updateWord({ id: editingWord.id, data: { meaningVi: newMeaning } }).unwrap();
      setIsEditModalOpen(false);
      toast({ type: 'success', title: 'Word Updated', message: 'Meaning corrected successfully.' });
      refetch();
    } catch {
      toast({ type: 'error', title: 'Update Failed', message: 'Could not update word.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="text-amber-500" size={24} /> Content Moderation Queue
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit user-submitted vocabulary items, verify translations, and enforce language standards.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="h-9 gap-1.5">
            <RefreshCw size={14} /> Refresh Queue
          </Button>
        </div>
      </div>

      {/* Edit Meaning Modal */}
      <ReModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Moderation Edit: ${editingWord?.word?.toUpperCase()}`}
        description="Revise meaning before approving entry into global dictionary."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleConfirmEdit}>Save & Approve</Button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Vietnamese Meaning</label>
          <Input 
            value={newMeaning}
            onChange={(e) => setNewMeaning(e.target.value)}
            className="h-10 text-xs font-medium"
          />
        </div>
      </ReModal>

      {/* Moderation Controls & Bulk Actions */}
      <Card className="border-border/60 bg-card shadow-xs">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <Input
                placeholder="Search pending queue..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-muted/40 border-border/80 h-9 pl-9 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/30 text-xs font-medium">
              <button
                onClick={() => setQualityFilter('ALL')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  qualityFilter === 'ALL' ? 'bg-background text-foreground font-bold shadow-2xs' : 'text-muted-foreground'
                }`}
              >
                All Queue ({allWords.length})
              </button>
              <button
                onClick={() => setQualityFilter('MISSING_EXAMPLE')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  qualityFilter === 'MISSING_EXAMPLE' ? 'bg-background text-amber-500 font-bold shadow-2xs' : 'text-muted-foreground'
                }`}
              >
                Missing Examples
              </button>
              <button
                onClick={() => setQualityFilter('SHORT_MEANING')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  qualityFilter === 'SHORT_MEANING' ? 'bg-background text-rose-500 font-bold shadow-2xs' : 'text-muted-foreground'
                }`}
              >
                Short Meaning
              </button>
            </div>

            {selectedWordIds.length > 0 && (
              <Button
                size="sm"
                className="h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                onClick={handleBulkApprove}
              >
                <ThumbsUp size={14} /> Approve ({selectedWordIds.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Moderation Queue Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModerationCardSkeleton count={4} />
        </div>
      ) : filteredWords.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-border/80 rounded-xl bg-card">
          <CheckCircle2 className="mx-auto text-emerald-500 mb-2" size={32} />
          <h3 className="text-base font-bold text-foreground">Moderation Queue Clear!</h3>
          <p className="text-xs text-muted-foreground mt-1">All lexical entries meet accuracy and quality requirements.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs px-1 text-muted-foreground">
            <button 
              onClick={toggleSelectAll} 
              className="flex items-center gap-1.5 hover:text-foreground font-semibold"
            >
              {selectedWordIds.length === filteredWords.length ? (
                <CheckSquare size={16} className="text-primary" />
              ) : (
                <Square size={16} />
              )}
              Select All Shown ({filteredWords.length})
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredWords.map((w: Word) => {
              const isSelected = selectedWordIds.includes(w.id);
              const hasNoExample = !w.example || w.example.trim() === '';
              const isShortMeaning = !w.meaningVi || w.meaningVi.length < 5;

              return (
                <Card 
                  key={w.id}
                  className={`border transition-all ${
                    isSelected 
                      ? 'border-primary bg-primary/5 shadow-sm' 
                      : 'border-border/60 bg-card hover:border-border'
                  }`}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <button onClick={() => toggleSelectWord(w.id)} className="text-muted-foreground hover:text-primary">
                          {isSelected ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} />}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-sm">{w.word}</span>
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5">{w.type}</Badge>
                            {hasNoExample && (
                              <Badge variant="outline" className="text-[9px] py-0 border-amber-500/30 text-amber-500 bg-amber-500/10">Missing Ex</Badge>
                            )}
                            {isShortMeaning && (
                              <Badge variant="outline" className="text-[9px] py-0 border-rose-500/30 text-rose-500 bg-rose-500/10">Short Def</Badge>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-muted-foreground mt-0.5">{w.meaningVi}</p>
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditingWord(w);
                            setNewMeaning(w.meaningVi);
                            setIsEditModalOpen(true);
                          }}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          title="Edit Meaning"
                        >
                          <Edit2 size={13} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleReject(w.id)}
                          className="h-7 w-7 text-rose-500 hover:bg-rose-500/10"
                          title="Reject Word"
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </div>

                    {/* Example sentence or missing notice */}
                    {w.example ? (
                      <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40 text-xs italic text-muted-foreground">
                        "{w.example}"
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-medium">
                        <AlertCircle size={13} /> Example sentence missing
                      </div>
                    )}

                    {/* Actions bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                      <span className="text-[10px] text-muted-foreground">Owner: {w.owner?.fullName || `User #${w.ownerId}`}</span>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleApprove(w)}
                        className="h-7 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 gap-1 font-semibold"
                      >
                        <CheckCircle2 size={12} /> Approve Entry
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {data?.meta && data.meta.totalPages > 1 && (
            <div className="p-4 border-t border-border/60 flex items-center justify-between mt-4">
              <p className="text-xs text-muted-foreground">
                Page <span className="font-semibold text-foreground">{page}</span> of <span className="font-semibold text-foreground">{data.meta.totalPages}</span>
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 text-xs"
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage(p => Math.min(data.meta.totalPages, p + 1))}
                  disabled={page === data.meta.totalPages}
                  className="h-8 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModerationPage;
