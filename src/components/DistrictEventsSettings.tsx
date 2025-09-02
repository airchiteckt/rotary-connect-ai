import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, X, Calendar } from 'lucide-react';

interface DistrictEvent {
  id?: string;
  nome: string;
  luogo: string;
  giorno: number | null;
  mese: number | null;
  giorni_consecutivi: number;
  descrizione: string;
}

export default function DistrictEventsSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<DistrictEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultEvents: Omit<DistrictEvent, 'id'>[] = [
    {
      nome: 'Seminario Immagine Pubblica e Comunicazione',
      luogo: 'Benevento',
      giorno: null,
      mese: null,
      giorni_consecutivi: 1,
      descrizione: 'Seminario Immagine Pubblica e Comunicazione'
    },
    {
      nome: 'Domenica della Salute',
      luogo: 'Benevento',
      giorno: 21,
      mese: null,
      giorni_consecutivi: 1,
      descrizione: 'Domenica della Salute'
    },
    {
      nome: 'Institute Europa - Medio Oriente - Africa',
      luogo: 'Bruxelles',
      giorno: 25,
      mese: null,
      giorni_consecutivi: 4,
      descrizione: 'Institute Europa - Medio Oriente - Africa (25, 26, 27 e 28)'
    }
  ];

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user]);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('district_events')
        .select('*')
        .eq('user_id', user?.id)
        .order('nome');

      if (error) throw error;

      // If no events exist, create the default ones
      if (!data || data.length === 0) {
        await initializeDefaultEvents();
      } else {
        setEvents(data);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento degli eventi distrettuali",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultEvents = async () => {
    try {
      const eventsToInsert = defaultEvents.map(event => ({
        ...event,
        user_id: user?.id
      }));

      const { data, error } = await supabase
        .from('district_events')
        .insert(eventsToInsert)
        .select();

      if (error) throw error;
      
      setEvents(data || []);
      toast({
        title: "Eventi inizializzati",
        description: "Eventi distrettuali di default creati con successo",
      });
    } catch (error) {
      console.error('Error initializing default events:', error);
      toast({
        title: "Errore",
        description: "Errore nell'inizializzazione degli eventi di default",
        variant: "destructive",
      });
    }
  };

  const saveEvent = async (event: DistrictEvent) => {
    try {
      if (event.id) {
        // Update existing event
        const { error } = await supabase
          .from('district_events')
          .update({
            nome: event.nome,
            luogo: event.luogo,
            giorno: event.giorno,
            mese: event.mese,
            giorni_consecutivi: event.giorni_consecutivi,
            descrizione: event.descrizione
          })
          .eq('id', event.id)
          .eq('user_id', user?.id);

        if (error) throw error;
      } else {
        // Create new event
        const { data, error } = await supabase
          .from('district_events')
          .insert({
            ...event,
            user_id: user?.id
          })
          .select()
          .single();

        if (error) throw error;

        setEvents(prev => [...prev, data]);
        return;
      }

      await loadEvents();
      toast({
        title: "Evento salvato",
        description: "L'evento distrettuale è stato salvato con successo",
      });
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "Errore",
        description: "Errore nel salvataggio dell'evento",
        variant: "destructive",
      });
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('district_events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setEvents(prev => prev.filter(e => e.id !== eventId));
      toast({
        title: "Evento eliminato",
        description: "L'evento distrettuale è stato eliminato",
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Errore",
        description: "Errore nell'eliminazione dell'evento",
        variant: "destructive",
      });
    }
  };

  const addNewEvent = () => {
    const newEvent: DistrictEvent = {
      nome: '',
      luogo: '',
      giorno: null,
      mese: null,
      giorni_consecutivi: 1,
      descrizione: ''
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (index: number, updates: Partial<DistrictEvent>) => {
    setEvents(prev => prev.map((event, i) => 
      i === index ? { ...event, ...updates } : event
    ));
  };

  const months = [
    { value: null, label: 'Ogni mese' },
    { value: 1, label: 'Gennaio' },
    { value: 2, label: 'Febbraio' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Aprile' },
    { value: 5, label: 'Maggio' },
    { value: 6, label: 'Giugno' },
    { value: 7, label: 'Luglio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Settembre' },
    { value: 10, label: 'Ottobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Dicembre' }
  ];

  if (loading) {
    return <div>Caricamento eventi distrettuali...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Eventi Distrettuali
        </CardTitle>
        <CardDescription>
          Gestisci gli eventi distrettuali che verranno caricati automaticamente nei programmi mensili
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {events.map((event, index) => (
          <Card key={event.id || index} className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Evento {index + 1}</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => saveEvent(event)}
                    disabled={!event.nome.trim()}
                  >
                    Salva
                  </Button>
                  {event.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteEvent(event.id!)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome Evento *</Label>
                  <Input
                    value={event.nome}
                    onChange={(e) => updateEvent(index, { nome: e.target.value })}
                    placeholder="Nome dell'evento"
                  />
                </div>

                <div>
                  <Label>Luogo</Label>
                  <Input
                    value={event.luogo}
                    onChange={(e) => updateEvent(index, { luogo: e.target.value })}
                    placeholder="Luogo dell'evento"
                  />
                </div>

                <div>
                  <Label>Mese</Label>
                  <Select 
                    value={event.mese?.toString() || 'null'} 
                    onValueChange={(value) => updateEvent(index, { 
                      mese: value === 'null' ? null : parseInt(value) 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map(month => (
                        <SelectItem key={month.value?.toString() || 'null'} value={month.value?.toString() || 'null'}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Giorno del mese</Label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={event.giorno || ''}
                    onChange={(e) => updateEvent(index, { 
                      giorno: e.target.value ? parseInt(e.target.value) : null 
                    })}
                    placeholder="Giorno (1-31) o lascia vuoto"
                  />
                </div>

                <div>
                  <Label>Giorni consecutivi</Label>
                  <Input
                    type="number"
                    min="1"
                    max="7"
                    value={event.giorni_consecutivi}
                    onChange={(e) => updateEvent(index, { 
                      giorni_consecutivi: parseInt(e.target.value) || 1 
                    })}
                  />
                </div>
              </div>

              <div>
                <Label>Descrizione</Label>
                <Textarea
                  value={event.descrizione}
                  onChange={(e) => updateEvent(index, { descrizione: e.target.value })}
                  placeholder="Descrizione dell'evento"
                  rows={2}
                />
              </div>
            </div>
          </Card>
        ))}

        <Button onClick={addNewEvent} variant="outline" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Aggiungi Evento Distrettuale
        </Button>
      </CardContent>
    </Card>
  );
}