import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Globe, Copy, ExternalLink, Save, Eye, Settings } from 'lucide-react';

export default function PublicPageManager() {
  const { profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    club_name: profile?.club_name || '',
    bio: profile?.bio || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    president_name: profile?.president_name || '',
    secretary_name: profile?.secretary_name || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('user_id', profile?.user_id);

      if (error) throw error;

      setIsEditing(false);
      toast({
        title: "Profilo aggiornato",
        description: "Le informazioni della pagina pubblica sono state salvate.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare le modifiche. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const copyPublicUrl = () => {
    if (profile?.club_slug) {
      // Use production domain fastclub.it
      const url = `https://fastclub.it/club/${profile.club_slug}`;
      navigator.clipboard.writeText(url);
      toast({
        title: "URL copiato!",
        description: "Il link della pagina pubblica è stato copiato negli appunti.",
      });
    }
  };

  const openPublicPage = () => {
    if (profile?.club_slug) {
      // Use production domain fastclub.it
      window.open(`https://fastclub.it/club/${profile.club_slug}`, '_blank');
    }
  };

  if (!profile?.club_slug) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Pagina Pubblica del Club
          </CardTitle>
          <CardDescription>
            Il tuo club non ha ancora una pagina pubblica configurata.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            La pagina pubblica verrà creata automaticamente una volta completato il profilo del club.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Public Page Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Pagina Pubblica del Club
          </CardTitle>
          <CardDescription>
            Gestisci le informazioni visibili sulla pagina pubblica del tuo club
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-primary/5 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">URL della Pagina Pubblica</h3>
                <code className="text-sm bg-white px-2 py-1 rounded border mt-1 inline-block">
                  fastclub.it/club/{profile.club_slug}
                </code>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyPublicUrl}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={openPublicPage}>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Questa pagina è visibile a tutti e contiene le informazioni del club, l'organigramma, i membri e gli eventi.
            </p>
          </div>

          <div className="flex justify-between items-center">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              Pagina Pubblica Attiva
            </Badge>
            <Button 
              variant={isEditing ? "default" : "outline"} 
              onClick={() => setIsEditing(!isEditing)}
            >
              <Settings className="w-4 h-4 mr-2" />
              {isEditing ? "Annulla" : "Modifica"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Modifica Informazioni Pubbliche</CardTitle>
            <CardDescription>
              Aggiorna le informazioni che verranno mostrate sulla pagina pubblica del club
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="club_name">Nome del Club</Label>
                <Input
                  id="club_name"
                  value={formData.club_name}
                  onChange={(e) => setFormData({ ...formData, club_name: e.target.value })}
                  placeholder="Nome del club"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Numero di telefono"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Descrizione del Club</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Descrizione breve del club e delle sue attività"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="address">Indirizzo</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Indirizzo completo del club"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="president_name">Nome del Presidente</Label>
                <Input
                  id="president_name"
                  value={formData.president_name}
                  onChange={(e) => setFormData({ ...formData, president_name: e.target.value })}
                  placeholder="Nome del presidente"
                />
              </div>
              <div>
                <Label htmlFor="secretary_name">Nome del Segretario</Label>
                <Input
                  id="secretary_name"
                  value={formData.secretary_name}
                  onChange={(e) => setFormData({ ...formData, secretary_name: e.target.value })}
                  placeholder="Nome del segretario"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Annulla
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Salvataggio..." : "Salva Modifiche"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Contenuti della Pagina Pubblica</CardTitle>
          <CardDescription>
            La tua pagina pubblica include automaticamente le seguenti sezioni
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Il Club</h4>
              <p className="text-sm text-muted-foreground">
                Informazioni generali, contatti istituzionali e descrizione
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Organigramma</h4>
              <p className="text-sm text-muted-foreground">
                Struttura organizzativa e ruoli dei membri
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Membri</h4>
              <p className="text-sm text-muted-foreground">
                Lista dei membri attivi del club
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Eventi</h4>
              <p className="text-sm text-muted-foreground">
                Calendario degli eventi programmati
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}