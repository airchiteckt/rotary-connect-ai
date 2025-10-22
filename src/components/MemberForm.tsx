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
  responsible_commission_id?: string;
  responsible_sections?: string[];
  profession?: string;
  awards?: string;
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
  const [commissions, setCommissions] = useState<Array<{ id: string; name: string }>>([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    membership_start_date: new Date(),
    current_position: '',
    notes: '',
    status: 'active',
    responsible_commission_id: '',
    responsible_sections: [] as string[],
    profession: '',
    awards: ''
  });

  useEffect(() => {
    loadCommissions();
  }, [user]);

  useEffect(() => {
    if (member) {
      setFormData({
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        membership_start_date: new Date(member.membership_start_date),
        current_position: member.current_position || '',
        notes: member.notes || '',
        status: member.status,
        responsible_commission_id: member.responsible_commission_id || '',
        responsible_sections: member.responsible_sections || [],
        profession: member.profession || '',
        awards: member.awards || ''
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        membership_start_date: new Date(),
        current_position: '',
        notes: '',
        status: 'active',
        responsible_commission_id: '',
        responsible_sections: [],
        profession: '',
        awards: ''
      });
    }
  }, [member]);

  const loadCommissions = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('commissions')
        .select('id, name')
        .order('name');
      setCommissions(data || []);
    } catch (error) {
      console.error('Errore nel caricamento delle commissioni:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      if (member) {
        // Modifica socio esistente
        const memberData = {
          user_id: user.id,
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          email: formData.email.trim(),
          membership_start_date: format(formData.membership_start_date, 'yyyy-MM-dd'),
          current_position: formData.current_position.trim() || null,
          notes: formData.notes.trim() || null,
          status: formData.status,
          responsible_commission_id: formData.responsible_commission_id || null,
          responsible_sections: formData.responsible_sections.length > 0 
            ? formData.responsible_sections as any 
            : [],
          profession: formData.profession.trim() || null,
          awards: formData.awards.trim() || null
        };

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
        // Nuovo socio - crea invito e invia email
        // Prima controlla se esiste già un invito per questa email
        const { data: existingInvites } = await supabase
          .from('club_invites')
          .select('id, status')
          .eq('user_id', user.id)
          .eq('email', formData.email.trim());

        // Se esiste un invito già accettato o scaduto, eliminalo
        if (existingInvites && existingInvites.length > 0) {
          const invitesToDelete = existingInvites.map(inv => inv.id);
          await supabase
            .from('club_invites')
            .delete()
            .in('id', invitesToDelete);
        }

        const permissions = formData.responsible_sections.length > 0 
          ? formData.responsible_sections as any 
          : null;

        const { data: inviteData, error: inviteError } = await supabase
          .from('club_invites')
          .insert({
            user_id: user.id,
            email: formData.email.trim(),
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
            role: 'member',
            permissions: permissions,
            responsible_sections: [] as any
          } as any)
          .select('id')
          .single();
        
        if (inviteError) throw inviteError;

        // Invia email di invito
        if (inviteData) {
          try {
            const { error: emailError } = await supabase.functions.invoke('send-club-invite', {
              body: { inviteId: inviteData.id }
            });

            if (emailError) {
              console.error('Error sending invite email:', emailError);
              // Non blocchiamo l'operazione se l'email fallisce
            }
          } catch (emailError) {
            console.error('Error sending invite email:', emailError);
          }
        }
        
        toast({
          title: "Invito inviato",
          description: `Email di invito inviata a ${formData.email}. Il socio potrà registrarsi e accedere al club.`,
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Errore nel salvare il socio:', error);
      toast({
        title: "Errore",
        description: member 
          ? "Si è verificato un errore nell'aggiornamento del socio." 
          : "Si è verificato un errore nell'invio dell'invito.",
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

  const sections = [
    { value: 'presidenza', label: 'Presidenza' },
    { value: 'segreteria', label: 'Segreteria' },
    { value: 'tesoreria', label: 'Tesoreria' },
    { value: 'soci', label: 'Soci' },
    { value: 'prefettura', label: 'Prefettura' },
    { value: 'direttivo', label: 'Direttivo' },
    { value: 'commissioni', label: 'Commissioni' },
    { value: 'comunicazione', label: 'Comunicazione' }
  ];

  const toggleSection = (sectionValue: string) => {
    setFormData(prev => ({
      ...prev,
      responsible_sections: prev.responsible_sections.includes(sectionValue)
        ? prev.responsible_sections.filter(s => s !== sectionValue)
        : [...prev.responsible_sections, sectionValue]
    }));
  };

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
              value={formData.current_position || undefined}
              onValueChange={(value) => setFormData(prev => ({ ...prev, current_position: value || '' }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona una carica (opzionale)" />
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
            <Label htmlFor="responsible_commission">Responsabile Commissione</Label>
            <Select
              value={formData.responsible_commission_id || undefined}
              onValueChange={(value) => setFormData(prev => ({ ...prev, responsible_commission_id: value || '' }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nessuna commissione (opzionale)" />
              </SelectTrigger>
              <SelectContent>
                {commissions.map((commission) => (
                  <SelectItem key={commission.id} value={commission.id}>
                    {commission.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Responsabile Sezioni Gestionale</Label>
            <div className="grid grid-cols-2 gap-2 p-3 border rounded-md">
              {sections.map((section) => (
                <div key={section.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`section-${section.value}`}
                    checked={formData.responsible_sections.includes(section.value)}
                    onChange={() => toggleSection(section.value)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={`section-${section.value}`} className="text-sm font-normal cursor-pointer">
                    {section.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profession">Professione</Label>
            <Input
              id="profession"
              value={formData.profession}
              onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
              placeholder="Es: Ingegnere, Medico, Avvocato..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="awards">Riconoscimenti</Label>
            <Textarea
              id="awards"
              value={formData.awards}
              onChange={(e) => setFormData(prev => ({ ...prev, awards: e.target.value }))}
              placeholder="Elenca premi, distintivi e riconoscimenti ricevuti..."
              rows={2}
            />
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