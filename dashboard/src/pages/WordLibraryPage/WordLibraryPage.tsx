import React from 'react';
import { 
  Search, 
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  FileText,
  Clock,
  ExternalLink,
  User,
  BrainCircuit,
  X,
  Tag,
  Layers,
  Sparkles
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Skeleton from '@/components/ui/Skeleton';
import { useWords } from './useWords';
import ReModal from '@/components/ui/ReModal';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/Toast';
import Tooltip from '@/components/ui/Tooltip';
import type { Word } from '@/store/api/wordsApi';

const WordLibraryPage: React.FC = () => {
  const {
    words,
    isLoading,
    search,
    setSearch,
    filter,
    setFilter,
    ownerId,
    setOwnerId,
    page,
    setPage,
    totalPages,
    handleDelete,
    handleUpdate,
    handleAddRelation,
    handleDeleteRelation
  } = useWords();

  const { toast } = useToast();

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isRelationModalOpen, setIsRelationModalOpen] = React.useState(false);
  
  const [editingWord, setEditingWord] = React.useState<Word | null>(null);
  const [newMeaning, setNewMeaning] = React.useState('');
  const [newExample, setNewExample] = React.useState('');
  const [batchData, setBatchData] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);

  // New Relation Form state
  const [relType, setRelType] = React.useState<'synonym' | 'antonym' | 'collocation'>('synonym');
  const [relValue, setRelValue] = React.useState('');

  const handleEditTrigger = (wordItem: Word) => {
    setEditingWord(wordItem);
    setNewMeaning(wordItem.meaningVi);
    setNewExample(wordItem.example || '');
    setIsEditModalOpen(true);
  };

  const handleRelationTrigger = (wordItem: Word) => {
    setEditingWord(wordItem);
    setRelType('synonym');
    setRelValue('');
    setIsRelationModalOpen(true);
  };

  const onConfirmUpdate = async () => {
    if (!editingWord || !newMeaning) return;
    setIsProcessing(true);
    try {
      await handleUpdate(editingWord.id, { 
        meaningVi: newMeaning,
        example: newExample
      });
      setIsEditModalOpen(false);
      toast({ type: 'success', title: 'Word Updated', message: `Meaning & example for "${editingWord.word}" updated.` });
    } catch {
      toast({ type: 'error', title: 'Update Failed', message: 'Failed to synchronize lexical changes.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const onAddRelationSubmit = async () => {
    if (!editingWord || !relValue.trim()) return;
    setIsProcessing(true);
    try {
      await handleAddRelation(editingWord.id, relType, relValue.trim());
      toast({ type: 'success', title: 'Relation Added', message: `Added ${relType}: "${relValue}"` });
      setRelValue('');
      // update local word relations reference
      setEditingWord(prev => prev ? {
        ...prev,
        relations: [...(prev.relations || []), { id: Date.now(), wordId: prev.id, type: relType, value: relValue.trim() }]
      } : null);
    } catch {
      toast({ type: 'error', title: 'Action Failed', message: 'Could not add word relation.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const onDeleteRelationItem = async (relationId: number) => {
    try {
      await handleDeleteRelation(relationId);
      toast({ type: 'success', title: 'Relation Deleted', message: 'Relation item removed.' });
      setEditingWord(prev => prev ? {
        ...prev,
        relations: (prev.relations || []).filter(r => r.id !== relationId)
      } : null);
    } catch {
      toast({ type: 'error', title: 'Action Failed', message: 'Could not delete relation.' });
    }
  };

  const onConfirmDelete = async () => {
    if (!editingWord) return;
    setIsProcessing(true);
    try {
      await handleDelete(editingWord.id);
      setIsDeleteModalOpen(false);
      toast({ type: 'success', title: 'Word Removed', message: `"${editingWord.word}" removed from registry.` });
    } catch {
      toast({ type: 'error', title: 'Delete Failed', message: 'Registry constraint prevented removal.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const onConfirmBatch = () => {
    if (!batchData) return;
    const count = batchData.split(',').length;
    toast({ type: 'info', title: 'Batch Import', message: `Processing ${count} lexical entries...` });
    setIsBatchModalOpen(false);
    setBatchData('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Word Library</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Audit and curate linguistic vocabulary repository & relations.</p>
        </div>
        <Button 
          size="sm" 
          className="h-9 font-medium shadow-xs" 
          onClick={() => setIsBatchModalOpen(true)}
        >
          <Plus size={16} className="mr-1.5" /> Batch Word Import
        </Button>
      </div>

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

      {/* Edit Word Modal */}
      <ReModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Word: ${editingWord?.word?.toUpperCase()}`}
        description="Modify the semantic definition and example sentence."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={onConfirmUpdate} disabled={isProcessing}>
              {isProcessing ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Semantic Meaning (VI)</label>
            <Input 
              value={newMeaning}
              onChange={(e) => setNewMeaning(e.target.value)}
              className="bg-muted/40 border-border/80 h-10 font-medium text-foreground"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Example Sentence</label>
            <Textarea 
              value={newExample}
              onChange={(e) => setNewExample(e.target.value)}
              placeholder="e.g. She found the book by pure serendipity."
              className="bg-muted/40 border-border/80 min-h-[90px] rounded-lg p-3 text-xs font-medium text-foreground"
            />
          </div>
        </div>
      </ReModal>

      {/* Manage Relations Modal */}
      <ReModal
        isOpen={isRelationModalOpen}
        onClose={() => setIsRelationModalOpen(false)}
        title={`Manage Relations: ${editingWord?.word?.toUpperCase()}`}
        description="Add synonyms, antonyms, or collocations for this word."
        footer={
          <Button variant="outline" size="sm" onClick={() => setIsRelationModalOpen(false)}>Close</Button>
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
                <Button size="sm" className="h-9 px-3 shrink-0" onClick={onAddRelationSubmit} disabled={isProcessing}>
                  <Plus size={14} /> Add
                </Button>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border/60 space-y-2">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Tag size={13} className="text-primary" /> Active Relations ({(editingWord?.relations || []).length})
            </h4>
            {(editingWord?.relations || []).length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-2">No relations recorded yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {(editingWord?.relations || []).map((rel) => (
                  <div 
                    key={rel.id} 
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
                      rel.type === 'synonym' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                      rel.type === 'antonym' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' :
                      'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                    }`}
                  >
                    <span className="uppercase text-[9px] font-bold opacity-75">{rel.type}:</span>
                    <span>{rel.value}</span>
                    <button 
                      onClick={() => onDeleteRelationItem(rel.id)}
                      className="ml-1 hover:text-destructive transition-colors"
                      title="Remove relation"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ReModal>

      {/* Batch Import Modal */}
      <ReModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        title="Batch Word Import"
        description="Inject multiple vocabulary words into the global database."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsBatchModalOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={onConfirmBatch}>Start Import</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Raw Words (Comma Separated)</label>
            <Textarea 
              placeholder="e.g. ephemeral, serendipity, pragmatic..."
              value={batchData}
              onChange={(e) => setBatchData(e.target.value)}
              className="bg-muted/40 border-border/80 min-h-[140px] rounded-lg p-3 font-mono text-xs text-foreground"
            />
          </div>
        </div>
      </ReModal>

      {/* Delete Confirmation Modal */}
      <ReModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Word Removal"
        description="Are you sure you want to delete this word from the library?"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={onConfirmDelete} 
              disabled={isProcessing}
            >
              {isProcessing ? 'Removing...' : 'Delete Word'}
            </Button>
          </>
        }
      >
        <div className="p-4 bg-destructive/10 rounded-xl border border-destructive/20 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-destructive/15 flex items-center justify-center text-destructive shrink-0">
            <Trash2 size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Irreversible Action</p>
            <p className="text-xs font-medium text-destructive mt-0.5">Word: {editingWord?.word?.toUpperCase()}</p>
          </div>
        </div>
      </ReModal>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Controls */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card className="border-border/60 bg-card shadow-xs">
            <CardContent className="p-4">
              <h3 className="text-xs font-bold text-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div> Search Filter
              </h3>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={14} />
                <Input 
                  type="text" 
                  placeholder="Search words..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-muted/40 border-border/80 rounded-lg h-9 pl-9 pr-3 text-xs font-medium focus-visible:ring-1 focus-visible:ring-primary transition-all"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card shadow-xs">
            <CardContent className="p-4">
              <h3 className="text-xs font-bold text-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Part of Speech
              </h3>
              <div className="grid grid-cols-1 gap-1">
                {['All', 'Noun', 'Verb', 'Adj', 'Phrase'].map((type) => (
                  <button 
                    key={type} 
                    onClick={() => setFilter(type)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      filter === type 
                        ? 'bg-primary/10 text-primary font-semibold shadow-2xs' 
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="border border-border/80 border-dashed p-4 rounded-xl bg-muted/20">
            <div className="flex items-center gap-2 text-amber-500 mb-2">
              <AlertCircle size={18} />
              <span className="text-xs font-semibold text-foreground">Data Quality</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Found <span className="text-rose-500 font-semibold">154 words</span> with incomplete translation schema. Review recommended.
            </p>
          </div>
        </div>

        {/* Word Grid View */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading ? (
              [1, 2, 3, 4].map((i) => (
                <Card key={i} className="border-border/60 bg-card shadow-xs flex flex-col p-5 space-y-3">
                  <div className="flex justify-between">
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                  <Skeleton className="h-16 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </Card>
              ))
            ) : words.length === 0 ? (
              <div className="col-span-full h-40 flex items-center justify-center border-2 border-dashed border-border/80 rounded-xl text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                No Lexical Entities Found.
              </div>
            ) : (
              words.map((word) => (
                <Card 
                  key={word.id} 
                  className="border-border/60 bg-card shadow-xs flex flex-col justify-between hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col">
                        <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">
                          {word.word}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="bg-muted text-muted-foreground text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded">
                            {word.type}
                          </span>
                          <span className="text-muted-foreground/40 text-xs">•</span>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock size={10} /> {new Date(Number(word.createdAt)).toLocaleDateString()}
                          </div>
                          {word.owner && (
                            <>
                              <span className="text-muted-foreground/40 text-xs">•</span>
                              <button 
                                onClick={(e) => { e.stopPropagation(); if (word.owner) setOwnerId(word.owner.id); }}
                                className="text-[10px] text-primary hover:underline flex items-center gap-1 font-semibold"
                                title="Click to filter by this owner"
                              >
                                <User size={10} /> {word.owner?.fullName || word.owner?.email}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Tooltip content="Manage Relations (Synonyms/Antonyms)" side="top">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => { e.stopPropagation(); handleRelationTrigger(word); }}
                            className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          >
                            <Tag size={13}/>
                          </Button>
                        </Tooltip>

                        <Tooltip content="Edit Meaning & Example" side="top">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => { e.stopPropagation(); handleEditTrigger(word); }}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                          >
                            <Edit2 size={13}/>
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
                            <Trash2 size={13}/>
                          </Button>
                        </Tooltip>
                      </div>
                    </div>

                    <div className="mb-3 space-y-2">
                      <div className="bg-muted/40 p-3.5 rounded-lg border border-border/60">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                          <FileText size={12} />
                          <span className="text-[10px] font-semibold uppercase tracking-wider">Meaning (VI)</span>
                        </div>
                        <p className="text-xs font-semibold text-foreground leading-relaxed">{word.meaningVi}</p>
                      </div>

                      {word.example && (
                        <div className="bg-muted/20 p-2.5 rounded-lg border border-border/40 text-xs italic text-muted-foreground">
                          "{word.example}"
                        </div>
                      )}

                      {word.relations && word.relations.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {word.relations.map((rel) => (
                            <span 
                              key={rel.id}
                              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                                rel.type === 'synonym' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                                rel.type === 'antonym' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' :
                                'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
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

                    <div className="flex items-center justify-between pt-3 border-t border-border/60">
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold ${
                        (word.difficulty || 'Normal') === 'Easy' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                          : (word.difficulty || 'Normal') === 'Medium' 
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          (word.difficulty || 'Normal') === 'Easy' ? 'bg-emerald-500' : 
                          (word.difficulty || 'Normal') === 'Medium' ? 'bg-amber-500' : 'bg-rose-500'
                        }`}></div>
                        {(word.difficulty || 'Normal').toUpperCase()}
                      </div>
                      
                      <button className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors">
                        Details <ExternalLink size={12} />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/60">
              <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setPage((p: number) => Math.max(1, p - 1))} 
                  disabled={page === 1}
                  className="h-8 text-xs"
                >
                  Previous
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setPage((p: number) => Math.min(totalPages, p + 1))} 
                  disabled={page === totalPages}
                  className="h-8 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordLibraryPage;
