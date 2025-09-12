import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CalendarDays, Clock, MapPin } from 'lucide-react';

interface PrefectureEvent {
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

export default function PrefectureCalendar() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<PrefectureEvent[]>([]);
  const [loading, setLoading] = useState(true);

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
        .eq('user_id', user.id)
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter(event => event.event_date === dateStr);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const hasEventsOnDate = (date: Date) => {
    return getEventsForDate(date).length > 0;
  };

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Calendario Eventi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border pointer-events-auto"
            modifiers={{
              hasEvents: (date) => hasEventsOnDate(date)
            }}
            modifiersStyles={{
              hasEvents: {
                backgroundColor: 'rgb(239 246 255)',
                border: '1px solid rgb(147 197 253)',
                borderRadius: '6px'
              }
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate ? format(selectedDate, 'dd MMMM yyyy') : 'Seleziona una data'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDate ? (
            <div className="space-y-4">
              {getEventsForDate(selectedDate).length > 0 ? (
                getEventsForDate(selectedDate).map((event) => (
                  <div key={event.id} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold">{event.title}</h4>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status === 'planned' && 'Pianificato'}
                        {event.status === 'in_progress' && 'In corso'}
                        {event.status === 'completed' && 'Completato'}
                        {event.status === 'cancelled' && 'Annullato'}
                      </Badge>
                    </div>
                    
                    {event.description && (
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getEventTypeColor(event.event_type, event.ceremony_type)}>
                        {event.event_type === 'ceremony' && event.ceremony_type && (
                          <>
                            {event.ceremony_type.charAt(0).toUpperCase() + event.ceremony_type.slice(1)}
                          </>
                        )}
                        {event.event_type === 'event' && 'Evento'}
                        {event.event_type === 'protocol' && 'Protocollo'}
                        {event.event_type === 'vip_guest' && 'Ospite VIP'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {event.event_time && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {event.event_time}
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </div>
                      )}
                    </div>
                    
                    {event.participants > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Partecipanti: {event.participants}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nessun evento per questa data</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Seleziona una data per visualizzare gli eventi</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}