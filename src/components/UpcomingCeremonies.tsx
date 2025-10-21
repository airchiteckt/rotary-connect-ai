import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Calendar, MapPin, Clock, Users, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Ceremony {
  id: string;
  title: string;
  description?: string;
  ceremony_type?: string;
  event_date: string;
  event_time?: string;
  location?: string;
  status: string;
  participants: number;
}

interface UpcomingCeremoniesProps {
  onStatsUpdate: () => void;
}

export default function UpcomingCeremonies({ onStatsUpdate }: UpcomingCeremoniesProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ceremonies, setCeremonies] = useState<Ceremony[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCeremonies();
    }
  }, [user]);

  const loadCeremonies = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('prefecture_events')
        .select('*')
        .eq('event_type', 'ceremony')
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true })
        .limit(5);

      if (error) throw error;
      setCeremonies(data || []);
    } catch (error) {
      console.error('Error loading ceremonies:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCeremony = async (ceremonyId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa cerimonia?')) return;

    try {
      const { error } = await supabase
        .from('prefecture_events')
        .delete()
        .eq('id', ceremonyId);

      if (error) throw error;

      toast({ title: "Cerimonia eliminata", description: "La cerimonia è stata eliminata." });
      loadCeremonies();
      onStatsUpdate();
    } catch (error) {
      console.error('Error deleting ceremony:', error);
      toast({
        title: "Errore",
        description: "Errore durante l'eliminazione della cerimonia.",
        variant: "destructive"
      });
    }
  };

  const updateStatus = async (ceremonyId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('prefecture_events')
        .update({ status: newStatus })
        .eq('id', ceremonyId);

      if (error) throw error;

      loadCeremonies();
      onStatsUpdate();
      toast({ title: "Stato aggiornato", description: "Lo stato della cerimonia è stato aggiornato." });
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

  const getCeremonyTypeLabel = (type?: string) => {
    switch (type) {
      case 'insediamento': return 'Insediamento';
      case 'premiazione': return 'Premiazione';
      case 'ammissione': return 'Ammissione';
      default: return 'Cerimonia';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cerimonie Programmate</CardTitle>
        <CardDescription>
          Prossimi eventi cerimoniali
        </CardDescription>
      </CardHeader>
      <CardContent>
        {ceremonies.length > 0 ? (
          <div className="space-y-4">
            {ceremonies.map((ceremony) => (
              <div key={ceremony.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{ceremony.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-purple-100 text-purple-800">
                        {getCeremonyTypeLabel(ceremony.ceremony_type)}
                      </Badge>
                      <Badge className={getStatusColor(ceremony.status)}>
                        {ceremony.status === 'planned' && 'Pianificato'}
                        {ceremony.status === 'in_progress' && 'In corso'}
                        {ceremony.status === 'completed' && 'Completato'}
                        {ceremony.status === 'cancelled' && 'Annullato'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {ceremony.description && (
                  <p className="text-sm text-muted-foreground mb-3">{ceremony.description}</p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{format(new Date(ceremony.event_date), 'dd/MM/yyyy')}</span>
                  </div>
                  {ceremony.event_time && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{ceremony.event_time}</span>
                    </div>
                  )}
                  {ceremony.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{ceremony.location}</span>
                    </div>
                  )}
                  {ceremony.participants > 0 && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{ceremony.participants}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {ceremony.status === 'planned' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(ceremony.id, 'in_progress')}
                    >
                      Inizia
                    </Button>
                  )}
                  {ceremony.status === 'in_progress' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(ceremony.id, 'completed')}
                    >
                      Completa
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteCeremony(ceremony.id)}
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
            <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nessuna cerimonia programmata</p>
            <p className="text-sm">Inizia organizzando il primo evento</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}