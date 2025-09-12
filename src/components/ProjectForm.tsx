import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { format } from 'date-fns';
import { CalendarIcon, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ProjectFormProps {
  onProjectCreated: () => void;
  onCancel: () => void;
  presetStatus?: 'ideas' | 'to_organize' | 'organized' | 'completed';
  project?: any; // For editing existing projects
}

export default function ProjectForm({ onProjectCreated, onCancel, presetStatus, project }: ProjectFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    status: project?.status || presetStatus || 'ideas',
    priority: project?.priority || 'medium',
    budget: project?.budget || '',
    deadline: project?.deadline ? new Date(project.deadline) : undefined as Date | undefined,
    assigned_to: project?.assigned_to || '',
    notes: project?.notes || '',
    progress: project?.progress || 0,
    commission_id: project?.commission_id || 'none'
  });

  useEffect(() => {
    const fetchCommissions = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('commissions')
          .select('*')
          .eq('user_id', user.id)
          .order('name');
        
        if (data) setCommissions(data);
      } catch (error) {
        console.error('Error fetching commissions:', error);
      }
    };

    fetchCommissions();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.title.trim()) {
      toast({
        title: 'Titolo mancante',
        description: 'Inserisci il titolo del progetto.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const projectData = {
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        status: formData.status,
        priority: formData.priority,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        deadline: formData.deadline ? format(formData.deadline, 'yyyy-MM-dd') : null,
        assigned_to: formData.assigned_to.trim() || null,
        notes: formData.notes.trim() || null,
        progress: formData.progress,
        commission_id: formData.commission_id === 'none' ? null : formData.commission_id || null
      };

      if (project) {
        // Update existing project
        const { error } = await supabase
          .from('presidency_projects')
          .update(projectData)
          .eq('id', project.id);

        if (error) throw error;
        toast({ title: "Progetto aggiornato", description: "Il progetto è stato aggiornato con successo." });
      } else {
        // Create new project
        const { error } = await supabase
          .from('presidency_projects')
          .insert(projectData);

        if (error) throw error;
        toast({ title: "Progetto creato", description: "Il progetto è stato creato con successo." });
      }

      onProjectCreated();
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: "Errore",
        description: "Errore durante il salvataggio del progetto.",
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
          <Label htmlFor="title">Titolo Progetto *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => updateFormData('title', e.target.value)}
            placeholder="Inserisci il titolo del progetto"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Stato</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => updateFormData('status', value)}
            disabled={!!presetStatus}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona lo stato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ideas">Idee</SelectItem>
              <SelectItem value="to_organize">Da Organizzare</SelectItem>
              <SelectItem value="organized">Organizzati</SelectItem>
              <SelectItem value="completed">Completati</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrizione</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          placeholder="Descrizione del progetto"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priorità</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => updateFormData('priority', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Bassa</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget">Budget (€)</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="budget"
              type="number"
              step="0.01"
              value={formData.budget}
              onChange={(e) => updateFormData('budget', e.target.value)}
              placeholder="0.00"
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Scadenza</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.deadline && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.deadline ? format(formData.deadline, "PPP") : "Seleziona data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.deadline}
                onSelect={(date) => updateFormData('deadline', date)}
                disabled={(date) => date < new Date()}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="assigned_to">Assegnato a</Label>
        <Input
          id="assigned_to"
          value={formData.assigned_to}
          onChange={(e) => updateFormData('assigned_to', e.target.value)}
          placeholder="Nome del responsabile"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="commission">Commissione</Label>
        <Select
          value={formData.commission_id}
          onValueChange={(value) => updateFormData('commission_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleziona una commissione (opzionale)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nessuna commissione</SelectItem>
            {commissions.map((commission) => (
              <SelectItem key={commission.id} value={commission.id}>
                {commission.name} - {commission.responsible_person}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Progresso: {formData.progress}%</Label>
        <Slider
          value={[formData.progress]}
          onValueChange={(value) => updateFormData('progress', value[0])}
          max={100}
          step={5}
          className="w-full"
        />
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
        <Button type="submit" disabled={loading || !formData.title.trim()}>
          {loading ? 'Salvataggio...' : project ? 'Aggiorna Progetto' : 'Crea Progetto'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Annulla
        </Button>
      </div>
    </form>
  );
}