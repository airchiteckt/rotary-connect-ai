import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Users, MapPin, Clock, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  description?: string;
  participants?: number;
  status: 'planned' | 'completed' | 'cancelled';
  meeting_type: 'board' | 'general' | 'extraordinary';
}

export const BoardMeetingManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '19:00',
    location: '',
    description: '',
    meeting_type: 'board' as 'board' | 'general' | 'extraordinary'
  });

  useEffect(() => {
    if (user) {
      loadMeetings();
    }
  }, [user]);

  const loadMeetings = async () => {
    if (!user) return;

    try {
      // For now, we'll use prefecture_events as a base and filter for board meetings
      const { data, error } = await supabase
        .from('prefecture_events')
        .select('*')
        .eq('event_type', 'meeting')
        .order('event_date', { ascending: true });

      if (error) throw error;

      const formattedMeetings = data?.map(event => ({
        id: event.id,
        title: event.title,
        date: event.event_date,
        time: event.event_time || '19:00',
        location: event.location,
        description: event.description,
        participants: event.participants || 0,
        status: event.status as 'planned' | 'completed' | 'cancelled',
        meeting_type: 'board' as const
      })) || [];

      setMeetings(formattedMeetings);
    } catch (error) {
      console.error('Error loading meetings:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento delle riunioni",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const meetingData = {
        title: formData.title,
        event_date: formData.date,
        event_time: formData.time,
        location: formData.location,
        description: formData.description,
        event_type: 'meeting',
        ceremony_type: 'board_meeting',
        user_id: user.id,
        status: 'planned'
      };

      if (editingMeeting) {
        const { error } = await supabase
          .from('prefecture_events')
          .update(meetingData)
          .eq('id', editingMeeting.id);

        if (error) throw error;

        toast({
          title: "Successo",
          description: "Riunione aggiornata correttamente",
        });
      } else {
        const { error } = await supabase
          .from('prefecture_events')
          .insert(meetingData);

        if (error) throw error;

        toast({
          title: "Successo",
          description: "Riunione creata correttamente",
        });
      }

      setShowForm(false);
      setEditingMeeting(null);
      resetForm();
      loadMeetings();
    } catch (error) {
      console.error('Error saving meeting:', error);
      toast({
        title: "Errore",
        description: "Errore nel salvataggio della riunione",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      date: '',
      time: '19:00',
      location: '',
      description: '',
      meeting_type: 'board'
    });
  };

  const editMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setFormData({
      title: meeting.title,
      date: meeting.date,
      time: meeting.time,
      location: meeting.location || '',
      description: meeting.description || '',
      meeting_type: meeting.meeting_type
    });
    setShowForm(true);
  };

  const deleteMeeting = async (meetingId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa riunione?')) return;

    try {
      const { error } = await supabase
        .from('prefecture_events')
        .delete()
        .eq('id', meetingId);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Riunione eliminata correttamente",
      });
      loadMeetings();
    } catch (error) {
      console.error('Error deleting meeting:', error);
      toast({
        title: "Errore",
        description: "Errore nell'eliminazione della riunione",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completata</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Annullata</Badge>;
      default:
        return <Badge variant="secondary">Programmata</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Riunioni del Direttivo</h3>
          <p className="text-sm text-muted-foreground">
            Gestisci le riunioni del consiglio direttivo
          </p>
        </div>
        <Button onClick={() => {
          setEditingMeeting(null);
          resetForm();
          setShowForm(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Nuova Riunione
        </Button>
      </div>

      {meetings.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Non ci sono riunioni programmate. Crea la prima riunione del direttivo!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {meetings.map((meeting) => (
            <Card key={meeting.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {meeting.title}
                      {getStatusBadge(meeting.status)}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(meeting.date), 'dd MMMM yyyy', { locale: it })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {meeting.time}
                      </div>
                      {meeting.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {meeting.location}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editMeeting(meeting)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMeeting(meeting.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {meeting.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{meeting.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMeeting ? 'Modifica Riunione' : 'Nuova Riunione'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Titolo *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Riunione Consiglio Direttivo"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="time">Ora</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="location">Luogo</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Sede del club"
              />
            </div>
            <div>
              <Label htmlFor="description">Descrizione</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ordine del giorno e dettagli della riunione..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Annulla
              </Button>
              <Button type="submit">
                {editingMeeting ? 'Aggiorna' : 'Crea'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};