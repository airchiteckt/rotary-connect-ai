import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, User, Shield, Bell, Palette, Upload, Save, CreditCard, Users, Copy, Crown, Gift } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function UserSettings() {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || '',
    club_name: profile?.club_name || '',
    bio: profile?.bio || '',
    phone: profile?.phone || '',
    address: profile?.address || ''
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || '',
        club_name: profile.club_name || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        address: profile.address || ''
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          club_name: profileData.club_name,
          bio: profileData.bio,
          phone: profileData.phone,
          address: profileData.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profilo aggiornato",
        description: "Le tue informazioni sono state salvate con successo.",
      });
    } catch (error) {
      console.error('Errore aggiornamento profilo:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il profilo. Riprova.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalTrialDays = 30 + ((profile?.bonus_months || 0) * 30);
  const daysRemaining = profile?.trial_start_date ? 
    Math.max(0, totalTrialDays - Math.floor((Date.now() - new Date(profile.trial_start_date).getTime()) / (1000 * 60 * 60 * 24))) : 0;
  
  const copyReferralCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      toast({
        title: "Codice copiato",
        description: "Il tuo codice referral è stato copiato negli appunti.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Impostazioni</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Impostazioni Account
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5" />
                Profilo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="text-lg">
                    {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">{profile?.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant={daysRemaining > 7 ? "default" : "destructive"}>
                      {daysRemaining} giorni di prova rimasti
                    </Badge>
                    {profile?.bonus_months > 0 && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Gift className="w-3 h-3" />
                        +{profile.bonus_months} mesi bonus
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Il tuo nome completo"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="club_name">Nome Club</Label>
                  <Input
                    id="club_name"
                    value={profileData.club_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, club_name: e.target.value }))}
                    placeholder="Nome del tuo club"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefono</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Il tuo numero di telefono"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Indirizzo</Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Il tuo indirizzo"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Raccontaci qualcosa di te e del tuo club..."
                  rows={3}
                />
              </div>

              <Button onClick={handleSaveProfile} disabled={isLoading} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Salvando...' : 'Salva Modifiche'}
              </Button>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5" />
                Informazioni Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Email</span>
                <span className="text-sm text-muted-foreground">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Data Registrazione</span>
                <span className="text-sm text-muted-foreground">
                  {profile?.created_at ? format(new Date(profile.created_at), 'dd MMMM yyyy', { locale: it }) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Stato Account</span>
                <Badge variant={daysRemaining > 0 ? "default" : "destructive"}>
                  {daysRemaining > 0 ? 'Prova Attiva' : 'Prova Scaduta'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Subscription */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="w-5 h-5" />
                Piano di Abbonamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm font-medium">Piano Attuale</span>
                  <p className="text-xs text-muted-foreground">
                    {profile?.subscription_type === 'trial' ? 'Prova Gratuita' : 
                     profile?.subscription_type === 'active' ? 'Premium' : 'Scaduto'}
                  </p>
                </div>
                <Badge variant={profile?.subscription_type === 'active' ? "default" : 
                              profile?.subscription_type === 'trial' ? "secondary" : "destructive"}>
                  {profile?.subscription_type === 'active' && <Crown className="w-3 h-3 mr-1" />}
                  {profile?.subscription_type === 'trial' ? 'Prova' : 
                   profile?.subscription_type === 'active' ? 'Premium' : 'Scaduto'}
                </Badge>
              </div>
              
              {profile?.subscription_type !== 'active' && (
                <Button 
                  className="w-full" 
                  onClick={() => toast({ title: "Funzione in arrivo", description: "Il pagamento sarà disponibile presto." })}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Passa a Premium - €29.90/mese
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Referral System */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5" />
                Sistema Referral
              </CardTitle>
              <CardDescription>
                Invita altri club e ottieni 3 mesi gratis per ogni invito (max 4 inviti)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Il tuo codice referral</Label>
                <div className="flex gap-2">
                  <Input 
                    value={profile?.referral_code || ''} 
                    readOnly 
                    className="font-mono"
                  />
                  <Button 
                    size="icon" 
                    variant="outline"
                    onClick={copyReferralCode}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {profile?.referral_count || 0}/4
                  </div>
                  <div className="text-sm text-muted-foreground">Inviti utilizzati</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {profile?.bonus_months || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Mesi bonus ottenuti</div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Condividi il tuo codice con altri club. Quando si iscriveranno, entrambi otterrete 3 mesi gratuiti!
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="w-5 h-5" />
                Preferenze
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm font-medium">Tema</span>
                  <p className="text-xs text-muted-foreground">Scegli il tema dell'interfaccia</p>
                </div>
                <Badge variant="outline">Sistema</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm font-medium">Lingua</span>
                  <p className="text-xs text-muted-foreground">Lingua dell'interfaccia</p>
                </div>
                <Badge variant="outline">Italiano</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button variant="outline" onClick={() => toast({ title: "Funzione in arrivo", description: "La modifica password sarà disponibile presto." })}>
              Cambia Password
            </Button>
            <Button variant="destructive" onClick={() => {
              signOut();
              setIsOpen(false);
              toast({ title: "Logout effettuato", description: "A presto!" });
            }}>
              Esci dall'Account
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}