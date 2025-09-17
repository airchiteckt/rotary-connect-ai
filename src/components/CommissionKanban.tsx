import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Calendar, DollarSign, User, Plus, Edit, Trash2, Lightbulb, ClipboardList, CheckCircle2, Target, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import ProjectForm from '@/components/ProjectForm';
import { Tables } from "@/integrations/supabase/types";

type Commission = Tables<"commissions">;

interface Project {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  budget?: number;
  deadline?: string;
  assigned_to?: string;
  notes?: string;
  progress: number;
  commission_id?: string;
}

interface Column {
  id: string;
  title: string;
  status: string;
  projects: Project[];
  color: string;
  bgColor: string;
  icon: any;
}

interface CommissionKanbanProps {
  commission: Commission;
  onBack: () => void;
}

export default function CommissionKanban({ commission, onBack }: CommissionKanbanProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'ideas',
      title: 'Idee',
      status: 'ideas',
      projects: [],
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
      icon: Lightbulb
    },
    {
      id: 'to_organize',
      title: 'Da Organizzare',
      status: 'to_organize',
      projects: [],
      color: 'text-orange-700',
      bgColor: 'bg-orange-50',
      icon: ClipboardList
    },
    {
      id: 'organized',
      title: 'Organizzati',
      status: 'organized',
      projects: [],
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      icon: Target
    },
    {
      id: 'completed',
      title: 'Completati',
      status: 'completed',
      projects: [],
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      icon: CheckCircle2
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user, commission.id]);

  const loadProjects = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('presidency_projects')
        .select('*')
        .eq('user_id', user.id)
        .eq('commission_id', commission.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const projects = data || [];
      
      // Group projects by status
      setColumns(prevColumns => 
        prevColumns.map(column => ({
          ...column,
          projects: projects.filter(project => project.status === column.status)
        }))
      );
    } catch (error) {
      console.error('Error loading projects:', error);
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
        .from('presidency_projects')
        .update({ status: newStatus })
        .eq('id', draggableId);

      if (error) throw error;

      // Update local state
      const newColumns = [...columns];
      
      // Remove from source column
      const sourceColumn = newColumns.find(col => col.id === source.droppableId);
      const destColumn = newColumns.find(col => col.id === destination.droppableId);
      
      if (sourceColumn && destColumn) {
        const [movedProject] = sourceColumn.projects.splice(source.index, 1);
        movedProject.status = newStatus;
        destColumn.projects.splice(destination.index, 0, movedProject);
        
        setColumns(newColumns);
        
        toast({
          title: "Stato aggiornato",
          description: `Il progetto è stato spostato in "${destColumn.title}"`
        });
      }
    } catch (error) {
      console.error('Error updating project status:', error);
      toast({
        title: "Errore",
        description: "Errore durante l'aggiornamento dello stato.",
        variant: "destructive"
      });
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo progetto?')) return;

    try {
      const { error } = await supabase
        .from('presidency_projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      toast({ title: "Progetto eliminato", description: "Il progetto è stato eliminato." });
      loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Errore",
        description: "Errore durante l'eliminazione del progetto.",
        variant: "destructive"
      });
    }
  };

  const editProject = (project: Project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Bassa';
      default: return priority;
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
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Indietro
          </Button>
          <div>
            <h3 className="text-lg font-semibold">Kanban - {commission.name}</h3>
            <p className="text-sm text-muted-foreground">
              Responsabile: {commission.responsible_person}
            </p>
          </div>
        </div>
        <Dialog open={showProjectForm} onOpenChange={(open) => {
          setShowProjectForm(open);
          if (!open) {
            setEditingProject(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Progetto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProject ? 'Modifica Progetto' : 'Crea Nuovo Progetto'}
              </DialogTitle>
              <DialogDescription>
                {editingProject ? 'Modifica i dettagli del progetto.' : 'Inserisci i dettagli del nuovo progetto per la commissione.'}
              </DialogDescription>
            </DialogHeader>
            <ProjectForm 
              project={editingProject}
              commissionId={commission.id}
              onProjectCreated={() => {
                setShowProjectForm(false);
                setEditingProject(null);
                loadProjects();
              }}
              onCancel={() => {
                setShowProjectForm(false);
                setEditingProject(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => {
            const IconComponent = column.icon;
            return (
              <div key={column.id} className={`${column.bgColor} rounded-lg p-4`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <IconComponent className={`w-5 h-5 ${column.color}`} />
                    <h4 className={`font-semibold ${column.color}`}>
                      {column.title}
                    </h4>
                  </div>
                  <Badge variant="secondary" className={`${column.color} bg-white`}>
                    {column.projects.length}
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
                      {column.projects.map((project, index) => (
                        <Draggable
                          key={project.id}
                          draggableId={project.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`cursor-move transition-shadow ${
                                snapshot.isDragging ? 'shadow-lg rotate-1' : ''
                              }`}
                            >
                              <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                  <CardTitle className="text-sm font-medium">
                                    {project.title}
                                  </CardTitle>
                                  <Badge className={getPriorityColor(project.priority)}>
                                    {getPriorityLabel(project.priority)}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0">
                                {project.description && (
                                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                    {project.description}
                                  </p>
                                )}
                                
                                {project.progress > 0 && (
                                  <div className="mb-3">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                      <span>Progresso</span>
                                      <span>{project.progress}%</span>
                                    </div>
                                    <Progress value={project.progress} className="h-1" />
                                  </div>
                                )}
                                
                                <div className="space-y-2 text-xs">
                                  {project.deadline && (
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <Calendar className="w-3 h-3" />
                                      <span>{format(new Date(project.deadline), 'dd/MM/yyyy')}</span>
                                    </div>
                                  )}
                                  
                                  {project.budget && (
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <DollarSign className="w-3 h-3" />
                                      <span>€{project.budget.toLocaleString('it-IT')}</span>
                                    </div>
                                  )}
                                  
                                  {project.assigned_to && (
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <User className="w-3 h-3" />
                                      <span className="truncate">{project.assigned_to}</span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex gap-1 mt-3">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      editProject(project);
                                    }}
                                    className="h-6 px-2 flex-1"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteProject(project.id);
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
                      
                      {column.projects.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                          <IconComponent className="w-8 h-8 mb-2 opacity-50" />
                          <p className="text-sm">Nessun progetto</p>
                          <p className="text-xs">in questa fase</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}