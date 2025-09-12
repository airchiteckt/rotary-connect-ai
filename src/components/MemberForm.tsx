import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
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
  email: string;
  membership_start_date: string;
  current_position?: string;
  notes?: string;
  status: string;
}

interface MemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  member?: Member | null;
  onSuccess: () => void;
}

export default function MemberForm({ isOpen, onClose, member, onSuccess }: MemberFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    membership_start_date: new Date(),
    current_position: '',
    notes: '',
    status: 'active'
  });

  useEffect(() => {
    if (member) {
      setFormData({
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        membership_start_date: new Date(member.membership_start_date),
        current_position: member.current_position || '',
        notes: member.notes || '',
        status: member.status
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        membership_start_date: new Date(),
        current_position: '',
        notes: '',
        status: 'active'
      });
    }
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const memberData = {
        user_id: user.id,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        membership_start_date: format(formData.membership_start_date, 'yyyy-MM-dd'),
        current_position: formData.current_position.trim() || null,
        notes: formData.notes.trim() || null,
        status: formData.status
      };

      if (member) {
        const { error } = await supabase
          .from('members')
          .update(memberData)
          .eq('id', member.id);
        
        if (error) throw error;
        
        toast({
          title: "Socio aggiornato",
          description: "I dati del socio sono stati aggiornati con successo.",
        });
      } else {
        const { error } = await supabase
          .from('members')
          .insert([memberData]);
        
        if (error) throw error;
        
        toast({
          title: "Socio aggiunto",
          description: "Il nuovo socio è stato aggiunto con successo.",
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Errore nel salvare il socio:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nel salvare i dati del socio.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {member ? 'Modifica Socio' : 'Nuovo Socio'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Nome *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Cognome *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Data Inizio Associazione *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.membership_start_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.membership_start_date ? (
                    format(formData.membership_start_date, "PPP", { locale: it })
                  ) : (
                    <span>Seleziona una data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.membership_start_date}
                  onSelect={(date) => date && setFormData(prev => ({ ...prev, membership_start_date: date }))}
                  initialFocus
                  className="p-3 pointer-events-auto"
                  locale={it}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_position">Carica Attuale</Label>
            <Select
              value={formData.current_position}
              onValueChange={(value) => setFormData(prev => ({ ...prev, current_position: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona una carica" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nessuna carica</SelectItem>
                {positions.map((position) => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Stato</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Attivo</SelectItem>
                <SelectItem value="honorary">Onorario</SelectItem>
                <SelectItem value="emeritus">Emerito</SelectItem>
                <SelectItem value="guest">Ospite</SelectItem>
                <SelectItem value="inactive">Non Attivo</SelectItem>
              </SelectContent>
            </Select>
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
            <Button type="button" variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : (member ? 'Aggiorna' : 'Aggiungi')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}