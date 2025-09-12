import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

type Commission = Tables<"commissions">;

interface CommissionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commission?: Commission;
  onSuccess: () => void;
}

export const CommissionForm = ({ open, onOpenChange, commission, onSuccess }: CommissionFormProps) => {
  const [name, setName] = useState(commission?.name || '');
  const [description, setDescription] = useState(commission?.description || '');
  const [responsiblePerson, setResponsiblePerson] = useState(commission?.responsible_person || '');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !responsiblePerson.trim()) {
      toast({
        title: "Errore",
        description: "Nome commissione e responsabile sono obbligatori",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      if (commission) {
        const { error } = await supabase
          .from('commissions')
          .update({
            name,
            description,
            responsible_person: responsiblePerson,
          })
          .eq('id', commission.id);

        if (error) throw error;
        toast({
          title: "Successo",
          description: "Commissione aggiornata correttamente",
        });
      } else {
        const { error } = await supabase
          .from('commissions')
          .insert({
            user_id: user.id,
            name,
            description,
            responsible_person: responsiblePerson,
          });

        if (error) throw error;
        toast({
          title: "Successo",
          description: "Commissione creata correttamente",
        });
      }

      onSuccess();
      onOpenChange(false);
      setName('');
      setDescription('');
      setResponsiblePerson('');
    } catch (error) {
      console.error('Error saving commission:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {commission ? 'Modifica Commissione' : 'Nuova Commissione'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome Commissione *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es. Commissione Eventi"
              required
            />
          </div>
          <div>
            <Label htmlFor="responsible">Responsabile *</Label>
            <Input
              id="responsible"
              value={responsiblePerson}
              onChange={(e) => setResponsiblePerson(e.target.value)}
              placeholder="Nome del responsabile"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrizione della commissione..."
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvataggio...' : commission ? 'Aggiorna' : 'Crea'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};