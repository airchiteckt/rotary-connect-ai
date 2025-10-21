import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Filter, Calendar, Plus, MapPin, Clock, Users, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import EventForm from '@/components/EventForm';

interface Event {
  id: string;
  title: string;
  description?: string;
  event_type: string;
  ceremony_type?: string;
  event_date: string;
  event_time?: string;
  location?: string;
  status: string;
  participants: number;
}

interface EventManagerProps {
  onStatsUpdate: () => void;
}

export default function EventManager({ onStatsUpdate }: EventManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user]);

  const loadEvents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('prefecture_events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo evento?')) return;

    try {
      const { error } = await supabase
        .from('prefecture_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast({ title: "Evento eliminato", description: "L'evento è stato eliminato." });
      loadEvents();
      onStatsUpdate();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Errore",
        description: "Errore durante l'eliminazione dell'evento.",
        variant: "destructive"
      });
    }
  };

  const updateStatus = async (eventId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('prefecture_events')
        .update({ status: newStatus })
        .eq('id', eventId);

      if (error) throw error;

      loadEvents();
      onStatsUpdate();
      toast({ title: "Stato aggiornato", description: "Lo stato dell'evento è stato aggiornato." });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Errore",
        description: "Errore durante l'aggiornamento dello stato.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeColor = (type: string, ceremony_type?: string) => {
    if (type === 'ceremony') {
      switch (ceremony_type) {
        case 'insediamento': return 'bg-purple-100 text-purple-800';
        case 'premiazione': return 'bg-yellow-100 text-yellow-800';
        case 'ammissione': return 'bg-green-100 text-green-800';
        default: return 'bg-purple-100 text-purple-800';
      }
    }
    switch (type) {
      case 'event': return 'bg-blue-100 text-blue-800';
      case 'protocol': return 'bg-gray-100 text-gray-800';
      case 'vip_guest': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeLabel = (type: string, ceremony_type?: string) => {
    if (type === 'ceremony' && ceremony_type) {
      return ceremony_type.charAt(0).toUpperCase() + ceremony_type.slice(1);
    }
    switch (type) {
      case 'event': return 'Evento';
      case 'ceremony': return 'Cerimonia';
      case 'protocol': return 'Protocollo';
      case 'vip_guest': return 'Ospite VIP';
      default: return type;
    }
  };

  // Filter events based on search term and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesType = typeFilter === 'all' || event.event_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Cerca eventi..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti</SelectItem>
                <SelectItem value="planned">Pianificati</SelectItem>
                <SelectItem value="in_progress">In corso</SelectItem>
                <SelectItem value="completed">Completati</SelectItem>
                <SelectItem value="cancelled">Annullati</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti</SelectItem>
                <SelectItem value="event">Eventi</SelectItem>
                <SelectItem value="ceremony">Cerimonie</SelectItem>
                <SelectItem value="protocol">Protocolli</SelectItem>
                <SelectItem value="vip_guest">Ospiti VIP</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuovo Evento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crea Nuovo Evento</DialogTitle>
                </DialogHeader>
                <EventForm 
                  onEventCreated={() => {
                    setShowEventForm(false);
                    loadEvents();
                    onStatsUpdate();
                  }}
                  onCancel={() => setShowEventForm(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle>Eventi in Programma</CardTitle>
          <CardDescription>
            {filteredEvents.length} {filteredEvents.length === 1 ? 'evento' : 'eventi'} trovato/i
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEvents.length > 0 ? (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div key={event.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{event.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getEventTypeColor(event.event_type, event.ceremony_type)}>
                          {getEventTypeLabel(event.event_type, event.ceremony_type)}
                        </Badge>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status === 'planned' && 'Pianificato'}
                          {event.status === 'in_progress' && 'In corso'}
                          {event.status === 'completed' && 'Completato'}
                          {event.status === 'cancelled' && 'Annullato'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {event.description && (
                    <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{format(new Date(event.event_date), 'dd/MM/yyyy')}</span>
                    </div>
                    {event.event_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{event.event_time}</span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                    {event.participants > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{event.participants}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {event.status === 'planned' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(event.id, 'in_progress')}
                      >
                        Inizia
                      </Button>
                    )}
                    {event.status === 'in_progress' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(event.id, 'completed')}
                      >
                        Completa
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteEvent(event.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nessun evento trovato</p>
              <p className="text-sm">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'Prova a modificare i filtri di ricerca'
                  : 'Inizia organizzando il primo evento'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}