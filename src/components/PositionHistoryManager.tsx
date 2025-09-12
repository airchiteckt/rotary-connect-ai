import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Plus, Edit, Trash2, History } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  current_position?: string;
}

interface PositionHistory {
  id: string;
  position: string;
  start_date: string;
  end_date?: string;
  notes?: string;
  created_at: string;
}

interface PositionHistoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
  onPositionUpdate: () => void;
}

export default function PositionHistoryManager({ isOpen, onClose, member, onPositionUpdate }: PositionHistoryManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [history, setHistory] = useState<PositionHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<PositionHistory | null>(null);
  const [formData, setFormData] = useState({
    position: '',
    start_date: new Date(),
    end_date: null as Date | null,
    notes: ''
  });

  useEffect(() => {
    if (isOpen && member) {
      loadPositionHistory();
    }
  }, [isOpen, member]);

  const loadPositionHistory = async () => {
    if (!user || !member) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('position_history')
        .select('*')
        .eq('member_id', member.id)
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });

      if (error) throw error;

      setHistory(data || []);
    } catch (error) {
      console.error('Errore nel caricamento della cronologia:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nel caricamento della cronologia.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      position: '',
      start_date: new Date(),
      end_date: null,
      notes: ''
    });
    setEditingPosition(null);
  };

  const openAddForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditForm = (position: PositionHistory) => {
    setFormData({
      position: position.position,
      start_date: new Date(position.start_date),
      end_date: position.end_date ? new Date(position.end_date) : null,
      notes: position.notes || ''
    });
    setEditingPosition(position);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !member) return;

    setLoading(true);
    try {
      const positionData = {
        member_id: member.id,
        user_id: user.id,
        position: formData.position.trim(),
        start_date: format(formData.start_date, 'yyyy-MM-dd'),
        end_date: formData.end_date ? format(formData.end_date, 'yyyy-MM-dd') : null,
        notes: formData.notes.trim() || null
      };

      if (editingPosition) {
        const { error } = await supabase
          .from('position_history')
          .update(positionData)
          .eq('id', editingPosition.id);
        
        if (error) throw error;
        
        toast({
          title: "Cronologia aggiornata",
          description: "La cronologia delle cariche è stata aggiornata.",
        });
      } else {
        const { error } = await supabase
          .from('position_history')
          .insert([positionData]);
        
        if (error) throw error;
        
        toast({
          title: "Carica aggiunta",
          description: "La nuova carica è stata aggiunta alla cronologia.",
        });

        // Se è la carica più recente, aggiorna la current_position del membro
        if (!formData.end_date) {
          await supabase
            .from('members')
            .update({ current_position: formData.position })
            .eq('id', member.id);
          
          onPositionUpdate();
        }
      }

      setIsFormOpen(false);
      resetForm();
      loadPositionHistory();
    } catch (error) {
      console.error('Errore nel salvare la carica:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nel salvare la carica.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePosition = async (positionId: string) => {
    try {
      const { error } = await supabase
        .from('position_history')
        .delete()
        .eq('id', positionId);

      if (error) throw error;

      toast({
        title: "Carica eliminata",
        description: "La carica è stata eliminata dalla cronologia.",
      });

      loadPositionHistory();
    } catch (error) {
      console.error('Errore nell\'eliminazione della carica:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nell'eliminazione della carica.",
        variant: "destructive",
      });
    }
  };

  const positions = [
    'Presidente',
    'Vice Presidente',
    'Segretario',
    'Tesoriere',
    'Cerimoniere',
    'Prefetto',
    'Consigliere',
    'Past President',
    'Socio Attivo',
    'Socio Onorario',
    'Socio Emerito'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <History className="w-5 h-5" />
            <span>Cronologia Cariche - {member.first_name} {member.last_name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Carica attuale: <span className="font-medium">{member.current_position || 'Nessuna carica'}</span>
            </p>
            <Button onClick={openAddForm}>
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Carica
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nessuna carica registrata</p>
              <p className="text-sm">Inizia aggiungendo le cariche ricoperte dal socio</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((position) => (
                <Card key={position.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{position.position}</CardTitle>
                      <div className="flex items-center space-x-2">
                        {!position.end_date && (
                          <Badge className="bg-green-100 text-green-800">
                            Carica Attuale
                          </Badge>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => openEditForm(position)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deletePosition(position.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      {format(new Date(position.start_date), 'dd/MM/yyyy', { locale: it })}
                      {position.end_date && (
                        <> - {format(new Date(position.end_date), 'dd/MM/yyyy', { locale: it })}</>
                      )}
                    </CardDescription>
                  </CardHeader>
                  {position.notes && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{position.notes}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Form per aggiungere/modificare carica */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPosition ? 'Modifica Carica' : 'Nuova Carica'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="position">Carica *</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona una carica" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data Inizio *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.start_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.start_date ? (
                        format(formData.start_date, "PPP", { locale: it })
                      ) : (
                        <span>Seleziona una data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.start_date}
                      onSelect={(date) => date && setFormData(prev => ({ ...prev, start_date: date }))}
                      initialFocus
                      className="p-3 pointer-events-auto"
                      locale={it}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Data Fine (opzionale)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.end_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.end_date ? (
                        format(formData.end_date, "PPP", { locale: it })
                      ) : (
                        <span>Carica attiva</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.end_date}
                      onSelect={(date) => setFormData(prev => ({ ...prev, end_date: date }))}
                      initialFocus
                      className="p-3 pointer-events-auto"
                      locale={it}
                    />
                  </PopoverContent>
                </Popover>
                {formData.end_date && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, end_date: null }))}
                  >
                    Rimuovi data fine
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Note</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Annulla
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : (editingPosition ? 'Aggiorna' : 'Aggiungi')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}