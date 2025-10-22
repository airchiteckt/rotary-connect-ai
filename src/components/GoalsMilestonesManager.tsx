import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Calendar, Trash2, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Goal {
  id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  status: string;
  progress: number;
  created_at: string;
}


export default function GoalsMilestonesManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    target_date: '',
    progress: 0
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const { data: goalsData } = await supabase
        .from('goals')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      setGoals(goalsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSaveGoal = async () => {
    if (!user || !goalForm.title.trim()) return;

    try {
      if (editingGoal) {
        const { error } = await supabase
          .from('goals')
          .update({
            title: goalForm.title,
            description: goalForm.description,
            target_date: goalForm.target_date || null,
            progress: goalForm.progress
          })
          .eq('id', editingGoal.id);

        if (error) throw error;
        toast({ title: 'Obiettivo aggiornato' });
      } else {
        const { error } = await supabase
          .from('goals')
          .insert({
            user_id: user.id,
            title: goalForm.title,
            description: goalForm.description,
            target_date: goalForm.target_date || null,
            progress: goalForm.progress
          });

        if (error) throw error;
        toast({ title: 'Obiettivo creato' });
      }

      setShowGoalDialog(false);
      setEditingGoal(null);
      setGoalForm({ title: '', description: '', target_date: '', progress: 0 });
      loadData();
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile salvare l\'obiettivo',
        variant: 'destructive'
      });
    }
  };


  const deleteGoal = async (goalId: string) => {
    if (!confirm('Eliminare questo obiettivo?')) return;

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
      toast({ title: 'Obiettivo eliminato' });
      loadData();
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare l\'obiettivo',
        variant: 'destructive'
      });
    }
  };


  const editGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setGoalForm({
      title: goal.title,
      description: goal.description || '',
      target_date: goal.target_date || '',
      progress: goal.progress
    });
    setShowGoalDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Goals Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Obiettivi
              </CardTitle>
              <CardDescription>Definisci gli obiettivi del club</CardDescription>
            </div>
            <Dialog open={showGoalDialog} onOpenChange={(open) => {
              setShowGoalDialog(open);
              if (!open) {
                setEditingGoal(null);
                setGoalForm({ title: '', description: '', target_date: '', progress: 0 });
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuovo Obiettivo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingGoal ? 'Modifica Obiettivo' : 'Nuovo Obiettivo'}</DialogTitle>
                  <DialogDescription>Inserisci i dettagli dell'obiettivo strategico</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Titolo *</Label>
                    <Input
                      value={goalForm.title}
                      onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                      placeholder="Es: Aumentare il numero di soci del 20%"
                    />
                  </div>
                  <div>
                    <Label>Descrizione</Label>
                    <Textarea
                      value={goalForm.description}
                      onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                      placeholder="Descrivi l'obiettivo..."
                    />
                  </div>
                  <div>
                    <Label>Data Obiettivo</Label>
                    <Input
                      type="date"
                      value={goalForm.target_date}
                      onChange={(e) => setGoalForm({ ...goalForm, target_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Progresso (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={goalForm.progress}
                      onChange={(e) => setGoalForm({ ...goalForm, progress: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveGoal} className="flex-1">
                      {editingGoal ? 'Aggiorna' : 'Crea'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowGoalDialog(false)}>
                      Annulla
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {goals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nessun obiettivo definito</p>
              </div>
            ) : (
              goals.map((goal) => (
                <Card key={goal.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold">{goal.title}</h4>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => editGoal(goal)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteGoal(goal.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {goal.target_date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>Scadenza: {format(new Date(goal.target_date), 'dd/MM/yyyy')}</span>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Progresso</span>
                          <span className="font-semibold">{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}