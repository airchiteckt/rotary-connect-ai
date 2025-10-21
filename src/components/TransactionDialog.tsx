import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transactionType?: 'income' | 'expense';
}

export default function TransactionDialog({
  isOpen,
  onClose,
  onSuccess,
  transactionType = 'income'
}: TransactionDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Array<{ id: string; first_name: string; last_name: string }>>([]);
  const [formData, setFormData] = useState({
    type: transactionType,
    amount: '',
    description: '',
    category: '',
    transaction_date: new Date(),
    payment_method: '',
    reference_number: '',
    notes: '',
    member_id: ''
  });

  useEffect(() => {
    if (isOpen && user) {
      loadMembers();
      setFormData(prev => ({ ...prev, type: transactionType }));
    }
  }, [isOpen, user, transactionType]);

  const loadMembers = async () => {
    if (!user) return;

    try {
      const { data: membersData, error } = await supabase
        .from('members')
        .select('id, first_name, last_name')
        .eq('status', 'active')
        .order('first_name');

      if (error) throw error;
      setMembers(membersData || []);
    } catch (error) {
      console.error('Errore nel caricamento soci:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description || !formData.category) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const transactionData = {
        user_id: user!.id,
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category,
        transaction_date: format(formData.transaction_date, 'yyyy-MM-dd'),
        payment_method: formData.payment_method || null,
        reference_number: formData.reference_number || null,
        notes: formData.notes || null,
        member_id: formData.member_id || null,
      };

      const { error } = await supabase
        .from('transactions')
        .insert([transactionData]);

      if (error) throw error;

      toast({
        title: "Successo",
        description: `${formData.type === 'income' ? 'Entrata' : 'Uscita'} registrata correttamente.`,
      });

      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Errore nella registrazione transazione:', error);
      toast({
        title: "Errore",
        description: "Impossibile registrare la transazione.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: transactionType,
      amount: '',
      description: '',
      category: '',
      transaction_date: new Date(),
      payment_method: '',
      reference_number: '',
      notes: '',
      member_id: ''
    });
  };

  const incomeCategories = [
    'Quote Soci',
    'Donazioni',
    'Raccolte Fondi',
    'Sponsor',
    'Eventi',
    'Vendite',
    'Interessi',
    'Altro'
  ];

  const expenseCategories = [
    'Cancelleria e Materiali',
    'Comunicazione',
    'Eventi e Cerimonie',
    'Formazione',
    'Regali e Riconoscimenti',
    'Servizi Professionali',
    'Spese Generali',
    'Trasporti',
    'Altro'
  ];

  const paymentMethods = [
    'Contanti',
    'Bonifico Bancario',
    'Assegno',
    'Carta di Credito',
    'PayPal',
    'Altro'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {formData.type === 'income' ? 'Registra Entrata' : 'Registra Uscita'}
          </DialogTitle>
          <DialogDescription>
            Inserisci i dettagli della {formData.type === 'income' ? 'entrata' : 'uscita'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData({ ...formData, type: value as 'income' | 'expense' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Entrata</SelectItem>
                  <SelectItem value="expense">Uscita</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Importo (€) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrizione *</Label>
            <Input
              id="description"
              placeholder="Descrizione della transazione"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona categoria" />
                </SelectTrigger>
                <SelectContent>
                  {(formData.type === 'income' ? incomeCategories : expenseCategories).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data Transazione *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.transaction_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.transaction_date ? (
                      format(formData.transaction_date, "PPP", { locale: it })
                    ) : (
                      "Seleziona data"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.transaction_date}
                    onSelect={(date) => setFormData({ ...formData, transaction_date: date || new Date() })}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_method">Metodo di Pagamento</Label>
              <Select 
                value={formData.payment_method} 
                onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona metodo" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference_number">Numero di Riferimento</Label>
              <Input
                id="reference_number"
                placeholder="es. Ricevuta #123"
                value={formData.reference_number}
                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
              />
            </div>
          </div>

          {formData.type === 'income' && formData.category === 'Quote Soci' && (
            <div className="space-y-2">
              <Label htmlFor="member_id">Socio</Label>
              <Select 
                value={formData.member_id} 
                onValueChange={(value) => setFormData({ ...formData, member_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona socio" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.first_name} {member.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Note</Label>
            <Textarea
              id="notes"
              placeholder="Note aggiuntive..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvataggio..." : "Registra Transazione"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}