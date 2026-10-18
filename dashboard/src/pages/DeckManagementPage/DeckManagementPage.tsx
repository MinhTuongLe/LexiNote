import React from 'react';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/Toast';
import PageHeader from '@/components/common/PageHeader';
import { useCreateAdminDeckMutation, useDeleteAdminDeckMutation, useGetAdminDecksQuery } from '@/store/api/decksApi';
import { parseDeckWords } from './deckUtils';

const DeckManagementPage: React.FC = () => {
  const { toast } = useToast();
  const { data, isLoading } = useGetAdminDecksQuery();
  const [createDeck, { isLoading: isCreating }] = useCreateAdminDeckMutation();
  const [deleteDeck] = useDeleteAdminDeckMutation();
  const [isCreatingOpen, setIsCreatingOpen] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState('GENERAL');
  const [level, setLevel] = React.useState('Intermediate');
  const [rawWords, setRawWords] = React.useState('');

  const handleCreate = async () => {
    const words = parseDeckWords(rawWords);
    if (!title.trim() || words.length === 0) {
      toast.error('Missing deck data', 'Add a title and at least one valid word row.');
      return;
    }
    try {
      await createDeck({ title: title.trim(), description, category, level, words }).unwrap();
      setTitle('');
      setDescription('');
      setRawWords('');
      setIsCreatingOpen(false);
      toast.success('Deck Created', 'Curated vocabulary deck created successfully.');
    } catch {
      toast.error('Create Failed', 'Could not create curated deck.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this curated deck?')) return;
    try {
      await deleteDeck(id).unwrap();
      toast.success('Deck Deleted', 'Curated deck removed successfully.');
    } catch {
      toast.error('Delete Failed', 'Could not delete curated deck.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deck Management"
        description="Create and maintain curated vocabulary decks for learners."
        action={<Button onClick={() => setIsCreatingOpen((open) => !open)}><Plus size={15} className="mr-1.5" /> New Deck</Button>}
      />

      {isCreatingOpen && (
        <Card className="border-border/60 bg-card shadow-xs">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input 
                aria-label="Deck title" 
                placeholder="Deck title" 
                value={title} 
                onChange={(event) => setTitle(event.target.value)} 
              />
              <Input 
                aria-label="Deck category" 
                placeholder="Category (e.g. GENERAL, TOEIC)" 
                value={category} 
                onChange={(event) => setCategory(event.target.value)} 
              />
              <Input 
                aria-label="Proficiency level" 
                placeholder="Level (e.g. Beginner, Intermediate)" 
                value={level} 
                onChange={(event) => setLevel(event.target.value)} 
              />
              <Input 
                aria-label="Deck description" 
                placeholder="Description" 
                value={description} 
                onChange={(event) => setDescription(event.target.value)} 
              />
            </div>
            <Textarea
              aria-label="Curated words input"
              value={rawWords}
              onChange={(event) => setRawWords(event.target.value)}
              placeholder="One word per line: english | Vietnamese meaning | type"
              rows={8}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreatingOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={isCreating}>{isCreating ? 'Creating...' : 'Create Deck'}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading curated decks...</p>
      ) : (data?.data || []).length === 0 ? (
        <Card className="border-border/60 bg-card/60 border-dashed">
          <CardContent className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
              <BookOpen size={20} />
            </div>
            <h3 className="text-sm font-semibold text-foreground">No Curated Decks Yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
              Create structured vocabulary decks with curated words to help learners build their vocabulary.
            </p>
            <Button size="sm" onClick={() => setIsCreatingOpen(true)}>
              <Plus size={14} className="mr-1.5" /> Create First Deck
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(data?.data || []).map((deck) => (
            <Card key={deck.id} className="border-border/60 bg-card shadow-xs">
              <CardContent className="p-5">
                <div className="flex justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><BookOpen size={18} /></div>
                    <div><h3 className="font-bold text-foreground">{deck.title}</h3><p className="text-xs text-muted-foreground">{deck.category} · {deck.level}</p></div>
                  </div>
                  <Button variant="ghost" size="sm" aria-label={`Delete ${deck.title}`} onClick={() => handleDelete(deck.id)}><Trash2 size={15} /></Button>
                </div>
                <p className="text-xs text-muted-foreground mt-4 line-clamp-2">{deck.description || 'No description'}</p>
                <p className="text-xs font-semibold text-primary mt-3">{deck.wordCount ?? 0} words</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeckManagementPage;
