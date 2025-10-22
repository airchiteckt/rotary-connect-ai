import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { StickyNote, Archive, Trash2, User, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface Note {
  id: string;
  content: string;
  status: string;
  created_by_user_id: string;
  created_at: string;
  user_id: string;
}

interface NoteWithAuthor extends Note {
  author_name?: string;
}

export default function PresidencyNotes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<NoteWithAuthor[]>([]);
  const [newNote, setNewNote] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [user, showArchived]);

  const loadNotes = async () => {
    if (!user) return;

    try {
      const status = showArchived ? 'archived' : 'active';
      const { data: notesData, error } = await supabase
        .from('presidency_notes')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch author names
      if (notesData && notesData.length > 0) {
        const authorIds = [...new Set(notesData.map((n) => n.created_by_user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', authorIds);

        const profilesMap = new Map(
          profilesData?.map((p) => [p.user_id, p.full_name]) || []
        );

        const notesWithAuthors = notesData.map((note) => ({
          ...note,
          author_name: profilesMap.get(note.created_by_user_id) || 'Utente sconosciuto'
        }));

        setNotes(notesWithAuthors);
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const handleAddNote = async () => {
    if (!user || !newNote.trim()) return;

    try {
      const { error } = await supabase
        .from('presidency_notes')
        .insert({
          user_id: user.id,
          content: newNote.trim(),
          created_by_user_id: user.id
        });

      if (error) throw error;

      toast({ title: 'Appunto aggiunto' });
      setNewNote('');
      loadNotes();
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile aggiungere l\'appunto',
        variant: 'destructive'
      });
    }
  };

  const archiveNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('presidency_notes')
        .update({ status: 'archived' })
        .eq('id', noteId);

      if (error) throw error;

      toast({ title: 'Appunto archiviato' });
      loadNotes();
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile archiviare l\'appunto',
        variant: 'destructive'
      });
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!confirm('Eliminare questo appunto?')) return;

    try {
      const { error } = await supabase
        .from('presidency_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      toast({ title: 'Appunto eliminato' });
      loadNotes();
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare l\'appunto',
        variant: 'destructive'
      });
    }
  };

  const restoreNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('presidency_notes')
        .update({ status: 'active' })
        .eq('id', noteId);

      if (error) throw error;

      toast({ title: 'Appunto ripristinato' });
      loadNotes();
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile ripristinare l\'appunto',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <StickyNote className="w-5 h-5 text-primary" />
              Appunti Presidenza
            </CardTitle>
            <CardDescription>Note e annotazioni cronologiche</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
          >
            <Archive className="w-4 h-4 mr-2" />
            {showArchived ? 'Mostra Attivi' : 'Mostra Archiviati'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showArchived && (
          <div className="space-y-3">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Scrivi un nuovo appunto..."
              rows={3}
            />
            <Button onClick={handleAddNote} disabled={!newNote.trim()}>
              Aggiungi Appunto
            </Button>
          </div>
        )}

        <div className="space-y-3 mt-6">
          {notes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <StickyNote className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{showArchived ? 'Nessun appunto archiviato' : 'Nessun appunto'}</p>
            </div>
          ) : (
            notes.map((note) => (
              <Card key={note.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="whitespace-pre-wrap">{note.content}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {note.author_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(note.created_at), 'dd MMM yyyy HH:mm', { locale: it })}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!showArchived ? (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => archiveNote(note.id)}
                            title="Archivia"
                          >
                            <Archive className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNote(note.id)}
                            title="Elimina"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => restoreNote(note.id)}
                            title="Ripristina"
                          >
                            Ripristina
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNote(note.id)}
                            title="Elimina"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}