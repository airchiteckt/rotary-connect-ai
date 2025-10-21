import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Users, Mail, Phone, Edit, Trash2 } from 'lucide-react';

interface VIPGuest {
  id: string;
  name: string;
  title?: string;
  organization?: string;
  email?: string;
  phone?: string;
  special_requirements?: string;
  protocol_notes?: string;
  status: string;
}

export default function VIPGuestManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [guests, setGuests] = useState<VIPGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<VIPGuest | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    organization: '',
    email: '',
    phone: '',
    special_requirements: '',
    protocol_notes: '',
    status: 'active'
  });

  useEffect(() => {
    if (user) {
      loadGuests();
    }
  }, [user]);

  const loadGuests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('vip_guests')
        .select('*')
        .order('name');

      if (error) throw error;
      setGuests(data || []);
    } catch (error) {
      console.error('Error loading guests:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      organization: '',
      email: '',
      phone: '',
      special_requirements: '',
      protocol_notes: '',
      status: 'active'
    });
    setEditingGuest(null);
  };

  const openEditDialog = (guest: VIPGuest) => {
    setFormData({
      name: guest.name,
      title: guest.title || '',
      organization: guest.organization || '',
      email: guest.email || '',
      phone: guest.phone || '',
      special_requirements: guest.special_requirements || '',
      protocol_notes: guest.protocol_notes || '',
      status: guest.status
    });
    setEditingGuest(guest);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const guestData = {
        user_id: user.id,
        name: formData.name,
        title: formData.title || null,
        organization: formData.organization || null,
        email: formData.email || null,
        phone: formData.phone || null,
        special_requirements: formData.special_requirements || null,
        protocol_notes: formData.protocol_notes || null,
        status: formData.status
      };

      if (editingGuest) {
        const { error } = await supabase
          .from('vip_guests')
          .update(guestData)
          .eq('id', editingGuest.id);

        if (error) throw error;
        toast({ title: "Ospite aggiornato", description: "Le informazioni dell'ospite sono state aggiornate." });
      } else {
        const { error } = await supabase
          .from('vip_guests')
          .insert(guestData);

        if (error) throw error;
        toast({ title: "Ospite aggiunto", description: "L'ospite VIP è stato aggiunto con successo." });
      }

      loadGuests();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving guest:', error);
      toast({
        title: "Errore",
        description: "Errore durante il salvataggio dell'ospite.",
        variant: "destructive"
      });
    }
  };

  const deleteGuest = async (guestId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo ospite VIP?')) return;

    try {
      const { error } = await supabase
        .from('vip_guests')
        .delete()
        .eq('id', guestId);

      if (error) throw error;

      toast({ title: "Ospite eliminato", description: "L'ospite VIP è stato eliminato." });
      loadGuests();
    } catch (error) {
      console.error('Error deleting guest:', error);
      toast({
        title: "Errore",
        description: "Errore durante l'eliminazione dell'ospite.",
        variant: "destructive"
      });
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
        <h3 className="text-lg font-semibold">Gestione Ospiti VIP</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Ospite VIP
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingGuest ? 'Modifica Ospite VIP' : 'Nuovo Ospite VIP'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome e cognome"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Titolo/Carica</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="es. Sindaco, Governatore, Presidente"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization">Organizzazione</Label>
                <Input
                  id="organization"
                  value={formData.organization}
                  onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                  placeholder="Ente o organizzazione di appartenenza"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+39 123 456 7890"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="special_requirements">Esigenze Speciali</Label>
                <Textarea
                  id="special_requirements"
                  value={formData.special_requirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, special_requirements: e.target.value }))}
                  placeholder="Esigenze alimentari, mobilità, ecc."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="protocol_notes">Note Protocollo</Label>
                <Textarea
                  id="protocol_notes"
                  value={formData.protocol_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, protocol_notes: e.target.value }))}
                  placeholder="Note per l'accoglienza e il protocollo"
                  rows={2}
                />
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
                    <SelectItem value="inactive">Non attivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingGuest ? 'Aggiorna' : 'Aggiungi'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Annulla
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {guests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {guests.map((guest) => (
            <Card key={guest.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{guest.name}</CardTitle>
                    {guest.title && (
                      <p className="text-sm text-muted-foreground mt-1">{guest.title}</p>
                    )}
                    {guest.organization && (
                      <p className="text-sm text-muted-foreground">{guest.organization}</p>
                    )}
                  </div>
                  <Badge variant={guest.status === 'active' ? 'default' : 'secondary'}>
                    {guest.status === 'active' ? 'Attivo' : 'Non attivo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {guest.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{guest.email}</span>
                    </div>
                  )}
                  {guest.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{guest.phone}</span>
                    </div>
                  )}
                  
                  {guest.special_requirements && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Esigenze Speciali:</p>
                      <p className="text-sm">{guest.special_requirements}</p>
                    </div>
                  )}
                  
                  {guest.protocol_notes && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Note Protocollo:</p>
                      <p className="text-sm">{guest.protocol_notes}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(guest)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Modifica
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteGuest(guest.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Nessun ospite VIP</h3>
              <p className="text-muted-foreground mb-4">
                Inizia aggiungendo il primo ospite VIP per gestire l'accoglienza e il protocollo
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}