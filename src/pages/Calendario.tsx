import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, ArrowLeft, Home, Clock, MapPin, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { it } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  location?: string;
  type: 'document' | 'event';
  description?: string;
  source: string;
}

export default function Calendario() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    if (user) {
      loadCalendarEvents();
    }
  }, [user, currentMonth]);

  const loadCalendarEvents = async () => {
    if (!user) return;

    try {
      setLoadingEvents(true);
      
      // Get club owner ID
      const { data: ownerIdData } = await supabase.rpc('get_club_owner_id', { 
        user_uuid: user.id 
      });
      const clubOwnerId = ownerIdData || user.id;

      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);

      const allEvents: CalendarEvent[] = [];

      // Load monthly programs from documents (type='programmi')
      const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', clubOwnerId)
        .eq('type', 'programmi')
        .in('status', ['published', 'archived']);

      if (documents) {
        documents.forEach(doc => {
          // Extract calendar_incontri from content
          if (doc.content && typeof doc.content === 'object' && !Array.isArray(doc.content)) {
            const meetingsData = (doc.content as any).calendario_incontri;
            if (meetingsData && Array.isArray(meetingsData)) {
              meetingsData.forEach((meeting: any) => {
                if (meeting.data) {
                  const meetingDate = parseISO(meeting.data);
                  if (meetingDate >= monthStart && meetingDate <= monthEnd) {
                    allEvents.push({
                      id: `doc-${doc.id}-${meeting.data}`,
                      title: meeting.tipo || 'Riunione',
                      date: meetingDate,
                      time: meeting.ora,
                      location: meeting.luogo,
                      type: 'document',
                      description: meeting.descrizione,
                      source: 'Programma Mensile'
                    });
                  }
                }
              });
            }
          }
        });
      }

      // Load prefecture events
      const { data: prefectureEvents } = await supabase
        .from('prefecture_events')
        .select('*')
        .eq('user_id', clubOwnerId)
        .gte('event_date', monthStart.toISOString().split('T')[0])
        .lte('event_date', monthEnd.toISOString().split('T')[0]);

      if (prefectureEvents) {
        prefectureEvents.forEach(event => {
          allEvents.push({
            id: `event-${event.id}`,
            title: event.title,
            date: parseISO(event.event_date),
            time: event.event_time,
            location: event.location,
            type: 'event',
            description: event.description,
            source: 'Prefettura'
          });
        });
      }

      // Sort events by date
      allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

      setEvents(allEvents);
    } catch (error) {
      console.error('Error loading calendar events:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  const selectedDayEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Indietro
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Calendario Unificato</h1>
                <p className="text-sm text-muted-foreground">Programmi mensili ed eventi del club</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                    ←
                  </Button>
                  <CardTitle className="text-xl">
                    {format(currentMonth, 'MMMM yyyy', { locale: it })}
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                    →
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {monthDays.map(day => {
                    const dayEvents = getEventsForDate(day);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isToday = isSameDay(day, new Date());
                    
                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(day)}
                        className={`
                          aspect-square p-2 rounded-lg border transition-all
                          ${isSelected ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}
                          ${isToday && !isSelected ? 'border-primary border-2' : ''}
                        `}
                      >
                        <div className="text-sm font-medium">{format(day, 'd')}</div>
                        {dayEvents.length > 0 && (
                          <div className="flex justify-center gap-1 mt-1">
                            {dayEvents.slice(0, 3).map((_, i) => (
                              <div key={i} className="w-1 h-1 rounded-full bg-green-600" />
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Events List */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate 
                    ? `Eventi del ${format(selectedDate, 'd MMMM yyyy', { locale: it })}`
                    : 'Seleziona una data'
                  }
                </CardTitle>
                <CardDescription>
                  {selectedDayEvents.length === 0 
                    ? 'Nessun evento in questa data'
                    : `${selectedDayEvents.length} evento${selectedDayEvents.length > 1 ? 'i' : ''}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingEvents ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : selectedDayEvents.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDayEvents.map(event => (
                      <div key={event.id} className="border-l-4 border-green-600 pl-4 py-2">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{event.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {event.source}
                          </Badge>
                        </div>
                        {event.time && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Clock className="w-3 h-3" />
                            {event.time}
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </div>
                        )}
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : selectedDate && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nessun evento programmato per questa data</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Prossimi Eventi</CardTitle>
              </CardHeader>
              <CardContent>
                {events.filter(e => e.date >= new Date()).slice(0, 5).map(event => (
                  <div key={event.id} className="border-b last:border-0 py-3">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium text-sm">{event.title}</p>
                      <Badge variant="secondary" className="text-xs">{event.source}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(event.date, 'd MMMM yyyy', { locale: it })}
                      {event.time && ` - ${event.time}`}
                    </p>
                  </div>
                ))}
                {events.filter(e => e.date >= new Date()).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nessun evento in programma
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
