import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, X, Calendar, Clock, MapPin, Settings } from 'lucide-react';

interface RecurringMeeting {
  id?: string;
  meeting_type: 'direttivo' | 'assemblea' | 'caminetto';
  frequency_type: 'monthly';
  frequency_value: {
    week: number;
    day: number;
  };
  meeting_time: string;
  location: string;
  is_active: boolean;
}

interface FutureMeeting {
  meeting_type: string;
  meeting_date: string;
  meeting_time: string;
  location: string;
}

export default function RecurringMeetingsSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<RecurringMeeting[]>([]);
  const [futureMeetings, setFutureMeetings] = useState<FutureMeeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const weekOptions = [
    { value: 1, label: 'Prima settimana' },
    { value: 2, label: 'Seconda settimana' },
    { value: 3, label: 'Terza settimana' },
    { value: 4, label: 'Quarta settimana' },
    { value: -1, label: 'Ultima settimana' }
  ];

  const dayOptions = [
    { value: 0, label: 'Domenica' },
    { value: 1, label: 'Lunedì' },
    { value: 2, label: 'Martedì' },
    { value: 3, label: 'Mercoledì' },
    { value: 4, label: 'Giovedì' },
    { value: 5, label: 'Venerdì' },
    { value: 6, label: 'Sabato' }
  ];

  const meetingTypes = [
    { value: 'direttivo', label: 'Consiglio Direttivo', icon: '👥' },
    { value: 'assemblea', label: 'Assemblea dei Soci', icon: '🏛️' },
    { value: 'caminetto', label: 'Caminetto', icon: '🔥' }
  ];

  useEffect(() => {
    if (user) {
      loadRecurringMeetings();
    }
  }, [user]);

  const loadRecurringMeetings = async () => {
    try {
      const { data, error } = await supabase
        .from('recurring_meetings')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true);

      if (error) throw error;

      // Cast the data to our interface type
      const typedMeetings = (data || []).map(meeting => ({
        id: meeting.id,
        meeting_type: meeting.meeting_type as 'direttivo' | 'assemblea' | 'caminetto',
        frequency_type: meeting.frequency_type as 'monthly',
        frequency_value: meeting.frequency_value as { week: number; day: number },
        meeting_time: meeting.meeting_time,
        location: meeting.location || '',
        is_active: meeting.is_active
      }));

      setMeetings(typedMeetings);
      await loadFutureMeetings();
    } catch (error) {
      console.error('Error loading recurring meetings:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento delle impostazioni",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadFutureMeetings = async () => {
    try {
      const { data, error } = await supabase
        .rpc('calculate_next_meeting_dates', {
          user_uuid: user?.id,
          months_ahead: 6
        });

      if (error) throw error;

      setFutureMeetings(data || []);
    } catch (error) {
      console.error('Error loading future meetings:', error);
    }
  };

  const addNewMeeting = () => {
    const newMeeting: RecurringMeeting = {
      meeting_type: 'direttivo',
      frequency_type: 'monthly',
      frequency_value: { week: 3, day: 4 }, // Third Thursday
      meeting_time: '19:00',
      location: '',
      is_active: true
    };
    setMeetings([...meetings, newMeeting]);
  };

  const updateMeeting = (index: number, updates: Partial<RecurringMeeting>) => {
    const updatedMeetings = [...meetings];
    updatedMeetings[index] = { ...updatedMeetings[index], ...updates };
    setMeetings(updatedMeetings);
  };

  const removeMeeting = (index: number) => {
    const updatedMeetings = meetings.filter((_, i) => i !== index);
    setMeetings(updatedMeetings);
  };

  const saveMeetings = async () => {
    setIsSaving(true);
    try {
      // Delete existing meetings
      await supabase
        .from('recurring_meetings')
        .delete()  
        .eq('user_id', user?.id);

      // Insert new meetings
      if (meetings.length > 0) {
        const meetingsToInsert = meetings.map(meeting => ({
          ...meeting,
          user_id: user?.id,
          id: undefined // Let the database generate new IDs
        }));

        const { error } = await supabase
          .from('recurring_meetings')
          .insert(meetingsToInsert);

        if (error) throw error;
      }

      await loadFutureMeetings();

      toast({
        title: "Impostazioni salvate",
        description: "Le impostazioni degli appuntamenti sono state salvate",
      });
    } catch (error) {
      console.error('Error saving meetings:', error);
      toast({
        title: "Errore",
        description: "Errore nel salvataggio delle impostazioni",  
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatFutureDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recurring Meetings Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Impostazioni Appuntamenti Ricorrenti
          </CardTitle>
          <CardDescription>
            Configura gli appuntamenti che si ripetono automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {meetings.map((meeting, index) => (
            <Card key={index} className="p-4 border-2">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium">Appuntamento {index + 1}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMeeting(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Tipo Riunione</Label>
                  <Select
                    value={meeting.meeting_type}
                    onValueChange={(value: 'direttivo' | 'assemblea' | 'caminetto') => 
                      updateMeeting(index, { meeting_type: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {meetingTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <span className="flex items-center gap-2">
                            <span>{type.icon}</span>
                            {type.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Settimana del Mese</Label>
                  <Select
                    value={meeting.frequency_value.week.toString()}
                    onValueChange={(value) => 
                      updateMeeting(index, { 
                        frequency_value: { 
                          ...meeting.frequency_value, 
                          week: parseInt(value) 
                        }
                      })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {weekOptions.map((week) => (
                        <SelectItem key={week.value} value={week.value.toString()}>
                          {week.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Giorno della Settimana</Label>
                  <Select
                    value={meeting.frequency_value.day.toString()}
                    onValueChange={(value) => 
                      updateMeeting(index, { 
                        frequency_value: { 
                          ...meeting.frequency_value, 
                          day: parseInt(value) 
                        }
                      })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dayOptions.map((day) => (
                        <SelectItem key={day.value} value={day.value.toString()}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Orario</Label>
                  <Input
                    type="time"
                    value={meeting.meeting_time}
                    onChange={(e) => updateMeeting(index, { meeting_time: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-sm">Luogo</Label>
                  <Input
                    value={meeting.location}
                    onChange={(e) => updateMeeting(index, { location: e.target.value })}
                    placeholder="Sede del club, Hotel, etc."
                    className="mt-1"
                  />
                </div>
              </div>
            </Card>
          ))}

          <div className="flex gap-2">
            <Button variant="outline" onClick={addNewMeeting} className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Appuntamento
            </Button>
            <Button onClick={saveMeetings} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salva Impostazioni'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Future Meetings Projection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Proiezione Prossimi Appuntamenti
          </CardTitle>  
          <CardDescription>
            Anteprima dei prossimi 6 mesi di appuntamenti
          </CardDescription>
        </CardHeader>
        <CardContent>
          {futureMeetings.length > 0 ? (
            <div className="space-y-3">
              {futureMeetings.map((meeting, index) => {
                const meetingInfo = meetingTypes.find(t => t.value === meeting.meeting_type);
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{meetingInfo?.icon}</span>
                      <div>
                        <h4 className="font-medium">{meetingInfo?.label}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatFutureDate(meeting.meeting_date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="w-4 h-4" />
                        {meeting.meeting_time}
                      </div>
                      {meeting.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {meeting.location}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nessun appuntamento ricorrente configurato
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}