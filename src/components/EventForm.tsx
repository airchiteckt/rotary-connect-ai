import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface EventFormProps {
  onEventCreated: () => void;
  onCancel: () => void;
}

export default function EventForm({ onEventCreated, onCancel }: EventFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'event',
    ceremony_type: '',
    event_date: undefined as Date | undefined,
    event_time: '',
    location: '',
    participants: 0,
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.event_date) return;

    setLoading(true);
    try {
      const eventData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description || null,
        event_type: formData.event_type,
        ceremony_type: formData.event_type === 'ceremony' ? formData.ceremony_type : null,
        event_date: format(formData.event_date, 'yyyy-MM-dd'),
        event_time: formData.event_time || null,
        location: formData.location || null,
        participants: formData.participants,
        notes: formData.notes || null,
        status: 'planned'
      };

      const { error } = await supabase
        .from('prefecture_events')
        .insert(eventData);

      if (error) throw error;

      toast({
        title: "Evento creato",
        description: "L'evento è stato creato con successo."
      });

      onEventCreated();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Errore",
        description: "Errore durante la creazione dell'evento.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Titolo *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => updateFormData('title', e.target.value)}
            placeholder="Inserisci il titolo dell'evento"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="event_type">Tipo Evento *</Label>
          <Select
            value={formData.event_type}
            onValueChange={(value) => updateFormData('event_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona il tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="event">Evento</SelectItem>
              <SelectItem value="ceremony">Cerimonia</SelectItem>
              <SelectItem value="protocol">Protocollo</SelectItem>
              <SelectItem value="vip_guest">Ospite VIP</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.event_type === 'ceremony' && (
        <div className="space-y-2">
          <Label htmlFor="ceremony_type">Tipo Cerimonia *</Label>
          <Select
            value={formData.ceremony_type}
            onValueChange={(value) => updateFormData('ceremony_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona il tipo di cerimonia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="insediamento">Insediamento</SelectItem>
              <SelectItem value="premiazione">Premiazione</SelectItem>
              <SelectItem value="ammissione">Ammissione</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="description">Descrizione</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          placeholder="Descrizione dell'evento"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Data Evento *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.event_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.event_date ? format(formData.event_date, "PPP") : "Seleziona data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.event_date}
                onSelect={(date) => updateFormData('event_date', date)}
                disabled={(date) => date < new Date()}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="event_time">Orario</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="event_time"
              type="time"
              value={formData.event_time}
              onChange={(e) => updateFormData('event_time', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Località</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => updateFormData('location', e.target.value)}
            placeholder="Inserisci la località"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="participants">Partecipanti Previsti</Label>
          <Input
            id="participants"
            type="number"
            value={formData.participants}
            onChange={(e) => updateFormData('participants', parseInt(e.target.value) || 0)}
            placeholder="0"
            min="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Note</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => updateFormData('notes', e.target.value)}
          placeholder="Note aggiuntive"
          rows={2}
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={loading || !formData.title || !formData.event_date}>
          {loading ? 'Creazione...' : 'Crea Evento'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Annulla
        </Button>
      </div>
    </form>
  );
}