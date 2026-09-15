import React from 'react';
import { 
  Search, 
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  FileText,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Skeleton from '@/components/ui/Skeleton';
import { useWords } from './useWords';
import ReModal from '@/components/ui/ReModal';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/Toast';

const WordLibraryPage: React.FC = () => {
  const {
    words,
    isLoading,
    search,
    setSearch,
    filter,
    setFilter,
    page,
    setPage,
    totalPages,
    handleDelete,
    handleUpdate
  } = useWords();

  const { toast } = useToast();

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  
  const [editingWord, setEditingWord] = React.useState<any>(null);
  const [newMeaning, setNewMeaning] = React.useState('');
  const [batchData, setBatchData] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleEditTrigger = (word: any) => {
    setEditingWord(word);
    setNewMeaning(word.meaningVi);
    setIsEditModalOpen(true);
  };

  const onConfirmUpdate = async () => {
    if (!editingWord || !newMeaning) return;
    setIsProcessing(true);
    try {
      await handleUpdate(editingWord.id, { meaningVi: newMeaning });
      setIsEditModalOpen(false);
      toast({ type: 'success', title: 'Word Updated', message: `Meaning for "${editingWord.word}" has been revised.` });
    } catch (e) {
      toast({ type: 'error', title: 'Update Failed', message: 'Failed to synchronize lexical changes.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const onConfirmDelete = async () => {
    if (!editingWord) return;
    setIsProcessing(true);
    try {
      await handleDelete(editingWord.id);
      setIsDeleteModalOpen(false);
      toast({ type: 'success', title: 'Word Removed', message: `"${editingWord.word}" removed from registry.` });
    } catch (e) {
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
          <p className="text-xs text-muted-foreground mt-0.5">Audit and curate linguistic vocabulary repository.</p>
        </div>
        <Button 
          size="sm" 
          className="h-9 font-medium shadow-xs" 
          onClick={() => setIsBatchModalOpen(true)}
        >
          <Plus size={16} className="mr-1.5" /> Batch Word Import
        </Button>
      </div>

      {/* Edit Word Modal */}
      <ReModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Word: ${editingWord?.word?.toUpperCase()}`}
        description="Modify the semantic definition for this regional entry."
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
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="bg-muted text-muted-foreground text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded">
                            {word.type}
                          </span>
                          <span className="text-muted-foreground/40 text-xs">•</span>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock size={10} /> {new Date(Number(word.createdAt)).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => { e.stopPropagation(); handleEditTrigger(word); }}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                          <Edit2 size={13}/>
                        </Button>
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
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="bg-muted/40 p-3.5 rounded-lg border border-border/60">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                          <FileText size={12} />
                          <span className="text-[10px] font-semibold uppercase tracking-wider">Meaning (VI)</span>
                        </div>
                        <p className="text-xs font-semibold text-foreground leading-relaxed">{word.meaningVi}</p>
                      </div>
                    </div>

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
        </div>
      </div>
    </div>
  );
};

export default WordLibraryPage;
