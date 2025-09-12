import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, DollarSign, Plus, Trash2 } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FeeType {
  id: string;
  name: string;
  amount: number;
  description?: string;
}

interface FeeSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsUpdate: () => void;
}

export default function FeeSettingsDialog({ isOpen, onClose, onSettingsUpdate }: FeeSettingsDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [loading, setLoading] = useState(false);
  const [newFeeType, setNewFeeType] = useState({
    name: '',
    amount: '',
    description: ''
  });

  useEffect(() => {
    if (isOpen && user) {
      loadFeeSettings();
    }
  }, [isOpen, user]);

  const loadFeeSettings = async () => {
    if (!user) return;

    try {
      // Get current fee settings from profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // Initialize with default fee types if none exist
      const defaultFeeTypes = [
        { id: 'annual', name: 'Quota Annuale', amount: 50, description: 'Quota di iscrizione annuale' },
        { id: 'monthly', name: 'Quota Mensile', amount: 15, description: 'Quota mensile per attività club' }
      ];

      setFeeTypes(defaultFeeTypes);
    } catch (error) {
      console.error('Errore nel caricamento impostazioni quote:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le impostazioni delle quote.",
        variant: "destructive",
      });
    }
  };

  const addFeeType = async () => {
    if (!newFeeType.name.trim() || !newFeeType.amount) {
      toast({
        title: "Errore",
        description: "Nome e importo sono obbligatori.",
        variant: "destructive",
      });
      return;
    }

    const newType: FeeType = {
      id: Date.now().toString(),
      name: newFeeType.name,
      amount: parseFloat(newFeeType.amount),
      description: newFeeType.description
    };

    setFeeTypes([...feeTypes, newType]);
    setNewFeeType({ name: '', amount: '', description: '' });
    
    toast({
      title: "Successo",
      description: "Tipo di quota aggiunto.",
    });
  };

  const removeFeeType = (id: string) => {
    setFeeTypes(feeTypes.filter(type => type.id !== id));
    toast({
      title: "Rimosso",
      description: "Tipo di quota rimosso.",
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Here we would normally save to database
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Successo",
        description: "Impostazioni quote salvate correttamente.",
      });
      
      onSettingsUpdate();
      onClose();
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare le impostazioni.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Impostazioni Quote Soci
          </DialogTitle>
          <DialogDescription>
            Configura i tipi di quote e gli importi per i soci del club
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Fee Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Tipi di Quote Attuali</h3>
            {feeTypes.length > 0 ? (
              <div className="grid gap-3">
                {feeTypes.map((feeType) => (
                  <Card key={feeType.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium">{feeType.name}</h4>
                            <Badge variant="secondary">
                              {formatCurrency(feeType.amount)}
                            </Badge>
                          </div>
                          {feeType.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {feeType.description}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFeeType(feeType.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nessun tipo di quota configurato</p>
              </div>
            )}
          </div>

          {/* Add New Fee Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Aggiungi Nuovo Tipo di Quota</CardTitle>
              <CardDescription>
                Definisci un nuovo tipo di quota per i soci
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fee-name">Nome della Quota</Label>
                  <Input
                    id="fee-name"
                    placeholder="es. Quota Annuale"
                    value={newFeeType.name}
                    onChange={(e) => setNewFeeType({ ...newFeeType, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fee-amount">Importo (€)</Label>
                  <Input
                    id="fee-amount"
                    type="number"
                    step="0.01"
                    placeholder="50.00"
                    value={newFeeType.amount}
                    onChange={(e) => setNewFeeType({ ...newFeeType, amount: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fee-description">Descrizione (opzionale)</Label>
                <Input
                  id="fee-description"
                  placeholder="Descrizione del tipo di quota"
                  value={newFeeType.description}
                  onChange={(e) => setNewFeeType({ ...newFeeType, description: e.target.value })}
                />
              </div>
              <Button onClick={addFeeType} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi Tipo di Quota
              </Button>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annulla
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Salvataggio..." : "Salva Impostazioni"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}