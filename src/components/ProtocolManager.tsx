import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, BookOpen, Edit, Trash2, FileText, Crown, Users as UsersIcon, Settings } from 'lucide-react';

interface Protocol {
  id: string;
  title: string;
  category: string;
  content: string;
  is_template: boolean;
  status: string;
  version: number;
}

const categoryIcons = {
  ceremony: Crown,
  event: FileText,
  guest_reception: UsersIcon,
  general: Settings
};

const categoryLabels = {
  ceremony: 'Cerimonie',
  event: 'Eventi',
  guest_reception: 'Accoglienza Ospiti',
  general: 'Generale'
};

const statusLabels = {
  draft: 'Bozza',
  approved: 'Approvato',
  archived: 'Archiviato'
};

export default function ProtocolManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProtocol, setEditingProtocol] = useState<Protocol | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [formData, setFormData] = useState({
    title: '',
    category: 'general',
    content: '',
    is_template: false,
    status: 'draft'
  });

  useEffect(() => {
    if (user) {
      loadProtocols();
    }
  }, [user]);

  const loadProtocols = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('protocols')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProtocols(data || []);
    } catch (error) {
      console.error('Error loading protocols:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'general',
      content: '',
      is_template: false,
      status: 'draft'
    });
    setEditingProtocol(null);
  };

  const openEditDialog = (protocol: Protocol) => {
    setFormData({
      title: protocol.title,
      category: protocol.category,
      content: protocol.content,
      is_template: protocol.is_template,
      status: protocol.status
    });
    setEditingProtocol(protocol);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const protocolData = {
        user_id: user.id,
        title: formData.title,
        category: formData.category,
        content: formData.content,
        is_template: formData.is_template,
        status: formData.status,
        version: editingProtocol ? editingProtocol.version + 1 : 1
      };

      if (editingProtocol) {
        const { error } = await supabase
          .from('protocols')
          .update(protocolData)
          .eq('id', editingProtocol.id);

        if (error) throw error;
        toast({ title: "Protocollo aggiornato", description: "Il protocollo è stato aggiornato con successo." });
      } else {
        const { error } = await supabase
          .from('protocols')
          .insert(protocolData);

        if (error) throw error;
        toast({ title: "Protocollo creato", description: "Il protocollo è stato creato con successo." });
      }

      loadProtocols();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving protocol:', error);
      toast({
        title: "Errore",
        description: "Errore durante il salvataggio del protocollo.",
        variant: "destructive"
      });
    }
  };

  const deleteProtocol = async (protocolId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo protocollo?')) return;

    try {
      const { error } = await supabase
        .from('protocols')
        .delete()
        .eq('id', protocolId);

      if (error) throw error;

      toast({ title: "Protocollo eliminato", description: "Il protocollo è stato eliminato." });
      loadProtocols();
    } catch (error) {
      console.error('Error deleting protocol:', error);
      toast({
        title: "Errore",
        description: "Errore durante l'eliminazione del protocollo.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredProtocols = selectedCategory === 'all' 
    ? protocols 
    : protocols.filter(p => p.category === selectedCategory);

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
        <h3 className="text-lg font-semibold">Protocolli e Procedure</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Protocollo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProtocol ? 'Modifica Protocollo' : 'Nuovo Protocollo'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titolo *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Titolo del protocollo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ceremony">Cerimonie</SelectItem>
                      <SelectItem value="event">Eventi</SelectItem>
                      <SelectItem value="guest_reception">Accoglienza Ospiti</SelectItem>
                      <SelectItem value="general">Generale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Contenuto *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Descrivi il protocollo o la procedura..."
                  rows={8}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                      <SelectItem value="draft">Bozza</SelectItem>
                      <SelectItem value="approved">Approvato</SelectItem>
                      <SelectItem value="archived">Archiviato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="is_template"
                    checked={formData.is_template}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_template: e.target.checked }))}
                    className="rounded border-input"
                  />
                  <Label htmlFor="is_template" className="text-sm">
                    Usa come template
                  </Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingProtocol ? 'Aggiorna' : 'Crea Protocollo'}
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

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Tutti</TabsTrigger>
          <TabsTrigger value="ceremony">Cerimonie</TabsTrigger>
          <TabsTrigger value="event">Eventi</TabsTrigger>
          <TabsTrigger value="guest_reception">Ospiti</TabsTrigger>
          <TabsTrigger value="general">Generale</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {filteredProtocols.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProtocols.map((protocol) => {
                const IconComponent = categoryIcons[protocol.category as keyof typeof categoryIcons];
                return (
                  <Card key={protocol.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <IconComponent className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{protocol.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {categoryLabels[protocol.category as keyof typeof categoryLabels]} • v{protocol.version}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Badge className={getStatusColor(protocol.status)}>
                            {statusLabels[protocol.status as keyof typeof statusLabels]}
                          </Badge>
                          {protocol.is_template && (
                            <Badge variant="outline">Template</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {protocol.content}
                      </p>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(protocol)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Modifica
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteProtocol(protocol.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Nessun protocollo</h3>
                  <p className="text-muted-foreground mb-4">
                    {selectedCategory === 'all' 
                      ? 'Inizia creando il primo protocollo per standardizzare le procedure del club'
                      : `Nessun protocollo nella categoria ${categoryLabels[selectedCategory as keyof typeof categoryLabels]}`
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}