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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, User, Shield, Bell, Palette, Upload, Save, CreditCard, Users, Copy, Crown, Gift, UserPlus, Mail, Clock, CheckCircle, XCircle, Trash2, Edit, History, Calendar, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { SectionPermissionSelector } from './SectionPermissionSelector';
import { MemberPermissionsManager } from './MemberPermissionsManager';
import { type AppSection } from '@/hooks/usePermissions';

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
  const [memberCount, setMemberCount] = useState(1);
  const [monthlyPrice, setMonthlyPrice] = useState(15);
  const [isPremium, setIsPremium] = useState(false);
  
  // Organization management state
  const [clubMembers, setClubMembers] = useState<any[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'member'
  });
  const [selectedPermissions, setSelectedPermissions] = useState<AppSection[]>([]);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || '',
        club_name: profile.club_name || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        address: profile.address || ''
      });
      setIsPremium(profile.subscription_type === 'active');
      loadMemberCount();
      if (profile.subscription_type === 'active') {
        loadOrganizationData();
      }
    }
  }, [profile]);

  const loadMemberCount = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('get_club_member_count', { club_owner_uuid: user.id });

      if (error) throw error;
      const count = data || 1;
      setMemberCount(count);

      // Calculate price
      const { data: priceData, error: priceError } = await supabase
        .rpc('calculate_club_price', { member_count: count });

      if (priceError) throw priceError;
      setMonthlyPrice(priceData || 15);
    } catch (error) {
      console.error('Error loading member count:', error);
    }
  };

  const loadOrganizationData = async () => {
    if (!user) return;

    try {
      // Load club members from club_members table
      const { data: clubMembersData, error: membersError } = await supabase
        .from('club_members')
        .select('id, user_id, role, status, joined_at')
        .eq('club_owner_id', user.id)
        .eq('status', 'active');

      if (membersError) throw membersError;

      // Get profile data for each member
      const membersWithProfiles = [];
      for (const member of clubMembersData || []) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('user_id', member.user_id)
          .single();

        membersWithProfiles.push({
          ...member,
          profiles: profile || { full_name: 'Nome non disponibile', role: 'member' }
        });
      }

      setClubMembers(membersWithProfiles);

      // Load pending invites
      const { data: invites, error: invitesError } = await supabase
        .from('club_invites')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending');

      if (invitesError) throw invitesError;
      setPendingInvites(invites || []);
    } catch (error) {
      console.error('Error loading organization data:', error);
    }
  };

  const activatePremium = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_type: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setIsPremium(true);
      loadOrganizationData();
      
      toast({
        title: "Premium Attivato!",
        description: "Ora puoi gestire la tua organizzazione e invitare membri.",
      });
    } catch (error) {
      console.error('Error activating premium:', error);
      toast({
        title: "Errore",
        description: "Impossibile attivare il piano premium. Riprova.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || profile?.role !== 'admin') {
      toast({
        title: "Accesso negato",
        description: "Solo gli amministratori possono invitare nuovi membri.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('club_invites')
        .insert({
          user_id: user.id,
          email: inviteForm.email,
          first_name: inviteForm.first_name,
          last_name: inviteForm.last_name,
          role: inviteForm.role,
          permissions: selectedPermissions
        } as any);

      if (error) throw error;

      setInviteForm({ email: '', first_name: '', last_name: '', role: 'member' });
      setSelectedPermissions([]);
      loadOrganizationData();
      
      toast({
        title: "Invito inviato!",
        description: `Invito inviato a ${inviteForm.email}`,
      });
    } catch (error) {
      console.error('Error sending invite:', error);
      toast({
        title: "Errore",
        description: "Impossibile inviare l'invito. Riprova.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteInvite = async (inviteId: string) => {
    if (profile?.role !== 'admin') {
      toast({
        title: "Accesso negato",
        description: "Solo gli amministratori possono eliminare inviti.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('club_invites')
        .delete()
        .eq('id', inviteId);

      if (error) throw error;

      loadOrganizationData();
      toast({
        title: "Invito eliminato",
        description: "L'invito è stato eliminato con successo.",
      });
    } catch (error) {
      console.error('Error deleting invite:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare l'invito.",
        variant: "destructive",
      });
    }
  };

  const updateMemberRole = async (userId: string, newRole: string) => {
    if (profile?.role !== 'admin') {
      toast({
        title: "Accesso negato",
        description: "Solo gli amministratori possono modificare i ruoli.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      loadOrganizationData();
      toast({
        title: "Ruolo aggiornato",
        description: `Ruolo aggiornato a ${newRole}.`,
      });
    } catch (error) {
      console.error('Error updating member role:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il ruolo.",
        variant: "destructive",
      });
    }
  };

  const removeMember = async (memberId: string) => {
    if (profile?.role !== 'admin') {
      toast({
        title: "Accesso negato",
        description: "Solo gli amministratori possono rimuovere membri.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('club_members')
        .update({ status: 'inactive' })
        .eq('id', memberId);

      if (error) throw error;

      loadOrganizationData();
      toast({
        title: "Membro rimosso",
        description: "Il membro è stato rimosso dall'organizzazione.",
      });
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Errore",
        description: "Impossibile rimuovere il membro.",
        variant: "destructive",
      });
    }
  };

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
        .eq('user_id', user.id);

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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'treasurer':
        return 'secondary';
      default:
        return 'outline';
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Impostazioni Account
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profilo</TabsTrigger>
            <TabsTrigger value="subscription">Abbonamento</TabsTrigger>
            <TabsTrigger value="organization" disabled={!isPremium}>
              Organizzazione {!isPremium && <Badge variant="outline" className="ml-1 text-xs">Premium</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 mt-6">
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
                      <Badge variant={getRoleColor(profile?.role || 'member')}>
                        {profile?.role === 'admin' && '👑 '}
                        {profile?.role === 'treasurer' && '💰 '}
                        {profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1) || 'Membro'}
                      </Badge>
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
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6 mt-6">
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

                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium">Membri del Club</span>
                    <p className="text-xs text-muted-foreground">
                      Membri attivi nel tuo club
                    </p>
                  </div>
                  <Badge variant="outline">{memberCount}</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium">Costo Mensile</span>
                    <p className="text-xs text-muted-foreground">
                      Basato sul numero di membri
                    </p>
                  </div>
                  <Badge variant="default">€{monthlyPrice}/mese</Badge>
                </div>

                <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
                  <p><strong>Piano tariffario:</strong></p>
                  <p>• Fino a 20 membri: €15/mese</p>
                  <p>• Fino a 30 membri: €25/mese</p> 
                  <p>• Fino a 50 membri: €35/mese</p>
                  <p>• Oltre 50 membri: €50/mese</p>
                </div>
                
                {!isPremium && (
                  <Button 
                    className="w-full" 
                    onClick={activatePremium}
                    disabled={isLoading}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {isLoading ? 'Attivazione...' : `Attiva Premium - €${monthlyPrice}/mese`}
                  </Button>
                )}
                
                {isPremium && (
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <Crown className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="text-green-800 font-medium">Premium Attivo</p>
                    <p className="text-xs text-green-600">Organizzazione attiva</p>
                  </div>
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
          </TabsContent>

          <TabsContent value="organization">
            {!isPremium ? (
              <Card>
                <CardHeader>
                  <CardTitle>Gestione Organizzazione</CardTitle>
                  <CardDescription>
                    Passa al piano premium per gestire la tua organizzazione e invitare membri.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={activatePremium} disabled={isLoading}>
                    {isLoading ? "Attivazione..." : "Attiva Premium"}
                  </Button>
                </CardContent>
              </Card>
            ) : profile?.role !== 'admin' ? (
              <Card>
                <CardHeader>
                  <CardTitle>Accesso Limitato</CardTitle>
                  <CardDescription>
                    Solo gli amministratori possono gestire l'organizzazione e invitare nuovi membri.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Il tuo ruolo attuale: <span className="font-medium capitalize">{profile?.role}</span>
                  </div>
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      Per ottenere i permessi di amministratore, contatta un amministratore esistente del club.
                    </p>
                  </div>
                  
                  {profile?.club_slug && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Pagina Pubblica del Club</h4>
                      <p className="text-sm text-blue-800 mb-3">
                        Il tuo club ha una pagina pubblica accessibile a tutti:
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-white px-2 py-1 rounded border">
                          fastclub.it/club/{profile.club_slug}
                        </code>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(`/club/${profile.club_slug}`, '_blank')}
                        >
                          Visualizza
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Organization Header */}
                <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-green-600" />
                      Gestione Organizzazione - Amministratore
                    </CardTitle>
                    <CardDescription>
                      Gestisci i membri della tua organizzazione e invita nuovi collaboratori
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-4 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{clubMembers.length}</div>
                        <div className="text-sm text-muted-foreground">Membri Attivi</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{pendingInvites.length}</div>
                        <div className="text-sm text-muted-foreground">Inviti Pendenti</div>
                      </div>
                    </div>

                    {/* Public Club Page Link */}
                    {profile?.club_slug && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Pagina Pubblica del Club
                        </h4>
                        <p className="text-sm text-blue-800 mb-3">
                          Il tuo club ha una pagina pubblica accessibile a tutti. Condividila per far conoscere la vostra organizzazione!
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="text-sm bg-white px-3 py-2 rounded border flex-1 min-w-0">
                            fastclub.it/club/{profile.club_slug}
                          </code>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(`/club/${profile.club_slug}`, '_blank')}
                          >
                            <Globe className="w-4 h-4 mr-1" />
                            Visualizza
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/club/${profile.club_slug}`);
                              toast({
                                title: "URL copiato!",
                                description: "Il link della pagina pubblica è stato copiato negli appunti.",
                              });
                            }}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copia
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Invite Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="w-5 h-5" />
                      Invita Nuovo Membro
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={sendInvite} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first_name">Nome</Label>
                          <Input
                            id="first_name"
                            value={inviteForm.first_name}
                            onChange={(e) => setInviteForm({...inviteForm, first_name: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last_name">Cognome</Label>
                          <Input
                            id="last_name"
                            value={inviteForm.last_name}
                            onChange={(e) => setInviteForm({...inviteForm, last_name: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={inviteForm.email}
                          onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="role">Ruolo</Label>
                        <Select value={inviteForm.role} onValueChange={(value) => setInviteForm({...inviteForm, role: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona ruolo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Membro</SelectItem>
                            <SelectItem value="moderator">Moderatore</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Permissions Selector - Only show for non-admin roles */}
                      {inviteForm.role !== 'admin' && (
                        <SectionPermissionSelector
                          selectedPermissions={selectedPermissions}
                          onPermissionsChange={setSelectedPermissions}
                          title="Sezioni Accessibili"
                        />
                      )}
                      
                      <Button type="submit" disabled={isLoading} className="w-full">
                        <UserPlus className="w-4 h-4 mr-2" />
                        {isLoading ? 'Invio...' : 'Invia Invito'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Club Members */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Membri del Club ({clubMembers.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {clubMembers.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Nessun membro ancora</p>
                        <p className="text-sm">Inizia invitando i membri del tuo club</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Ruolo</TableHead>
                            <TableHead>Data Iscrizione</TableHead>
                            <TableHead className="min-w-[200px]">Azioni</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {clubMembers.map((member) => (
                            <TableRow key={member.id}>
                              <TableCell>{member.profiles?.full_name || 'N/A'}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={getRoleColor(member.profiles?.role)} 
                                  className="capitalize"
                                >
                                  {member.profiles?.role === 'admin' && '👑 '}
                                  {member.profiles?.role === 'treasurer' && '💰 '}
                                  {member.profiles?.role || member.role}
                                </Badge>
                              </TableCell>
                              <TableCell>{new Date(member.joined_at).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <div className="flex gap-2 flex-wrap">
                                  {member.profiles?.role !== 'admin' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateMemberRole(member.user_id, 'admin')}
                                    >
                                      Rendi Admin
                                    </Button>
                                  )}
                                  {member.profiles?.role !== 'treasurer' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateMemberRole(member.user_id, 'treasurer')}
                                    >
                                      Rendi Tesoriere
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeMember(member.id)}
                                  >
                                    Rimuovi
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                {/* Pending Invites */}
                {pendingInvites.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        Inviti Pendenti ({pendingInvites.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Ruolo</TableHead>
                            <TableHead>Scadenza</TableHead>
                            <TableHead>Azioni</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingInvites.map((invite) => (
                            <TableRow key={invite.id}>
                              <TableCell>{invite.first_name} {invite.last_name}</TableCell>
                              <TableCell>{invite.email}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {invite.role}
                                </Badge>
                              </TableCell>
                              <TableCell>{new Date(invite.expires_at).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteInvite(invite.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
      
      {/* Permissions Manager */}
      <MemberPermissionsManager
        isOpen={permissionsDialogOpen}
        onOpenChange={setPermissionsDialogOpen}
        member={selectedMember}
      />
    </Dialog>
  );
}