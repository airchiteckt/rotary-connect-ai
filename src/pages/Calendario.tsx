import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { it } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import SectionPageLayout from '@/components/shared/SectionPageLayout';
import SectionPageHeader from '@/components/shared/SectionPageHeader';

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
  return (
    <SectionPageLayout bgGradient="bg-gradient-to-br from-green-50 to-blue-100">
      {(user) => <CalendarioContent user={user} />}
    </SectionPageLayout>
  );
}

function CalendarioContent({ user }: { user: { id: string } }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => { loadCalendarEvents(); }, [user, currentMonth]);

  const loadCalendarEvents = async () => {
    try {
      setLoadingEvents(true);
      const { data: ownerIdData } = await supabase.rpc('get_club_owner_id', { user_uuid: user.id });
      const clubOwnerId = ownerIdData || user.id;
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      const allEvents: CalendarEvent[] = [];

      const [{ data: documents }, { data: prefectureEvents }] = await Promise.all([
        supabase.from('documents').select('*').eq('user_id', clubOwnerId).eq('type', 'programmi').in('status', ['published', 'archived']),
        supabase.from('prefecture_events').select('*').eq('user_id', clubOwnerId)
          .gte('event_date', monthStart.toISOString().split('T')[0])
          .lte('event_date', monthEnd.toISOString().split('T')[0]),
      ]);

      if (documents) {
        documents.forEach(doc => {
          if (doc.content && typeof doc.content === 'object' && !Array.isArray(doc.content)) {
            const content = doc.content as any;
            const sources: [string, string, string][] = [
              ['calendario_incontri', 'nome', 'Riunioni di Club'],
              ['attivita_servizio', 'testo', 'Attività di Servizio'],
              ['agenda_distrettuale', 'testo', 'Agenda Distrettuale'],
            ];
            sources.forEach(([key, titleField, source]) => {
              if (content[key] && Array.isArray(content[key])) {
                content[key].forEach((item: any) => {
                  if (item.data) {
                    const d = parseISO(item.data);
                    if (d >= monthStart && d <= monthEnd) {
                      allEvents.push({
                        id: `${key}-${doc.id}-${item.data}`, title: item[titleField] || source,
                        date: d, time: item.orario, location: item.luogo,
                        type: 'document', description: item.descrizione, source,
                      });
                    }
                  }
                });
              }
            });
          }
        });
      }

      if (prefectureEvents) {
        prefectureEvents.forEach(e => {
          allEvents.push({
            id: `event-${e.id}`, title: e.title, date: parseISO(e.event_date),
            time: e.event_time, location: e.location, type: 'event',
            description: e.description, source: 'Prefettura',
          });
        });
      }

      allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
      setEvents(allEvents);
    } catch (error) { console.error('Error loading calendar events:', error); }
    finally { setLoadingEvents(false); }
  };

  const monthDays = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const getEventsForDate = (date: Date) => events.filter(e => isSameDay(e.date, date));
  const selectedDayEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <>
      <SectionPageHeader title="Calendario Unificato" subtitle="Programmi mensili ed eventi del club" icon={CalendarIcon} iconColor="bg-green-600" />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>←</Button>
                  <CardTitle className="text-base sm:text-xl">
                    {format(currentMonth, 'MMMM yyyy', { locale: it })}
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>→</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-4">
                  {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((day, i) => (
                    <div key={i} className="text-center text-xs font-medium text-muted-foreground p-1 sm:p-2">
                      <span className="sm:hidden">{day}</span>
                      <span className="hidden sm:inline">{['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'][i]}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {monthDays.map(day => {
                    const dayEvents = getEventsForDate(day);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isToday = isSameDay(day, new Date());
                    return (
                      <button key={day.toISOString()} onClick={() => setSelectedDate(day)}
                        className={`aspect-square p-1 sm:p-2 rounded-lg border transition-all text-xs sm:text-sm
                          ${isSelected ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}
                          ${isToday && !isSelected ? 'border-primary border-2' : ''}`}>
                        <div className="font-medium">{format(day, 'd')}</div>
                        {dayEvents.length > 0 && (
                          <div className="flex justify-center gap-0.5 mt-0.5">
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

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg">
                  {selectedDate ? `Eventi del ${format(selectedDate, 'd MMMM yyyy', { locale: it })}` : 'Seleziona una data'}
                </CardTitle>
                <CardDescription>
                  {selectedDayEvents.length === 0 ? 'Nessun evento in questa data' : `${selectedDayEvents.length} evento${selectedDayEvents.length > 1 ? 'i' : ''}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingEvents ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                  </div>
                ) : selectedDayEvents.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDayEvents.map(event => (
                      <div key={event.id} className="border-l-4 border-green-600 pl-3 sm:pl-4 py-2">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{event.title}</h4>
                          <Badge variant="outline" className="text-xs flex-shrink-0">{event.source}</Badge>
                        </div>
                        {event.time && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock className="w-3 h-3" />{event.time}</div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{event.location}</div>
                        )}
                        {event.description && <p className="text-xs text-muted-foreground mt-1">{event.description}</p>}
                      </div>
                    ))}
                  </div>
                ) : selectedDate && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Nessun evento programmato</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Prossimi Eventi</CardTitle>
              </CardHeader>
              <CardContent>
                {events.filter(e => e.date >= new Date()).slice(0, 5).map(event => (
                  <div key={event.id} className="border-b last:border-0 py-2 sm:py-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-medium text-xs sm:text-sm">{event.title}</p>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">{event.source}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(event.date, 'd MMMM yyyy', { locale: it })}{event.time && ` - ${event.time}`}
                    </p>
                  </div>
                ))}
                {events.filter(e => e.date >= new Date()).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Nessun evento in programma</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
