import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, MapPin, Users, Plus, Edit, Trash2, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import EventForm from '@/components/EventForm';

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

interface Column {
  id: string;
  title: string;
  status: string;
  ceremonies: Ceremony[];
  color: string;
  bgColor: string;
}

interface CeremonyKanbanProps {
  onStatsUpdate: () => void;
}

export default function CeremonyKanban({ onStatsUpdate }: CeremonyKanbanProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'planned',
      title: 'Da Programmare',
      status: 'planned',
      ceremonies: [],
      color: 'text-blue-700',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'in_progress',
      title: 'Programmate',
      status: 'in_progress',
      ceremonies: [],
      color: 'text-orange-700',
      bgColor: 'bg-orange-50'
    },
    {
      id: 'completed',
      title: 'Eseguite',
      status: 'completed',
      ceremonies: [],
      color: 'text-green-700',
      bgColor: 'bg-green-50'
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);

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
        .eq('user_id', user.id)
        .order('event_date', { ascending: true });

      if (error) throw error;

      const ceremonies = data || [];
      
      // Group ceremonies by status
      setColumns(prevColumns => 
        prevColumns.map(column => ({
          ...column,
          ceremonies: ceremonies.filter(ceremony => ceremony.status === column.status)
        }))
      );
    } catch (error) {
      console.error('Error loading ceremonies:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area
    if (!destination) return;

    // If dropped in the same place
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    const newStatus = destination.droppableId;
    
    try {
      // Update status in database
      const { error } = await supabase
        .from('prefecture_events')
        .update({ status: newStatus })
        .eq('id', draggableId);

      if (error) throw error;

      // Update local state
      const newColumns = [...columns];
      
      // Remove from source column
      const sourceColumn = newColumns.find(col => col.id === source.droppableId);
      const destColumn = newColumns.find(col => col.id === destination.droppableId);
      
      if (sourceColumn && destColumn) {
        const [movedCeremony] = sourceColumn.ceremonies.splice(source.index, 1);
        movedCeremony.status = newStatus;
        destColumn.ceremonies.splice(destination.index, 0, movedCeremony);
        
        setColumns(newColumns);
        onStatsUpdate();
        
        toast({
          title: "Stato aggiornato",
          description: `La cerimonia è stata spostata in "${destColumn.title}"`
        });
      }
    } catch (error) {
      console.error('Error updating ceremony status:', error);
      toast({
        title: "Errore",
        description: "Errore durante l'aggiornamento dello stato.",
        variant: "destructive"
      });
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

  const getCeremonyTypeLabel = (type?: string) => {
    switch (type) {
      case 'insediamento': return 'Insediamento';
      case 'premiazione': return 'Premiazione';
      case 'ammissione': return 'Ammissione';
      default: return 'Cerimonia';
    }
  };

  const getCeremonyTypeColor = (type?: string) => {
    switch (type) {
      case 'insediamento': return 'bg-purple-100 text-purple-800';
      case 'premiazione': return 'bg-yellow-100 text-yellow-800';
      case 'ammissione': return 'bg-green-100 text-green-800';
      default: return 'bg-purple-100 text-purple-800';
    }
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Kanban Cerimonie e Eventi</h3>
          <p className="text-sm text-muted-foreground">
            Trascina cerimonie ed eventi tra le colonne per cambiare stato
          </p>
        </div>
        <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuova Cerimonia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crea Nuova Cerimonia</DialogTitle>
              <p className="sr-only">Compila i dettagli per creare una nuova cerimonia.</p>
            </DialogHeader>
            <EventForm 
              presetType="ceremony"
              onEventCreated={() => {
                setShowEventForm(false);
                loadCeremonies();
                onStatsUpdate();
              }}
              onCancel={() => setShowEventForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div key={column.id} className={`${column.bgColor} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className={`font-semibold ${column.color}`}>
                  {column.title}
                </h4>
                <Badge variant="secondary" className={`${column.color} bg-white`}>
                  {column.ceremonies.length}
                </Badge>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 min-h-[400px] p-2 rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? 'bg-white/50' : ''
                    }`}
                  >
                    {column.ceremonies.map((ceremony, index) => (
                      <Draggable
                        key={ceremony.id}
                        draggableId={ceremony.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`cursor-move transition-shadow ${
                              snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                            }`}
                          >
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between gap-2">
                                <CardTitle className="text-sm font-medium flex-1">
                                  {ceremony.title}
                                </CardTitle>
                                <div className="flex flex-col gap-1">
                                  {ceremony.ceremony_type && (
                                    <Badge className={getCeremonyTypeColor(ceremony.ceremony_type)}>
                                      {getCeremonyTypeLabel(ceremony.ceremony_type)}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              {ceremony.description && (
                                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                  {ceremony.description}
                                </p>
                              )}
                              
                              <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Calendar className="w-3 h-3" />
                                  <span>{format(new Date(ceremony.event_date), 'dd/MM/yyyy')}</span>
                                </div>
                                
                                {ceremony.event_time && (
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    <span>{ceremony.event_time}</span>
                                  </div>
                                )}
                                
                                {ceremony.location && (
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <MapPin className="w-3 h-3" />
                                    <span className="truncate">{ceremony.location}</span>
                                  </div>
                                )}
                                
                                {ceremony.participants > 0 && (
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Users className="w-3 h-3" />
                                    <span>{ceremony.participants} partecipanti</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex gap-1 mt-3">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteCeremony(ceremony.id);
                                  }}
                                  className="text-red-600 hover:text-red-700 h-6 px-2"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    
                    {column.ceremonies.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <Award className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm">Nessuna cerimonia</p>
                        <p className="text-xs">in questa fase</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}