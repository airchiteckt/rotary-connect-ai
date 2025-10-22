import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Mail, Clock, CheckCircle, XCircle, Trash2, Users, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { SectionPermissionSelector } from './SectionPermissionSelector';
import { type AppSection } from '@/hooks/usePermissions';

interface ClubInvite {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  expires_at: string;
  created_at: string;
}

interface ClubMember {
  id: string;
  user_id: string;
  role: string;
  status: string;
  joined_at: string;
  full_name: string;
  email: string;
}

export default function ClubInviteManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [invites, setInvites] = useState<ClubInvite[]>([]);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [memberCount, setMemberCount] = useState(1);
  const [monthlyPrice, setMonthlyPrice] = useState(15);
  const [selectedMember, setSelectedMember] = useState<ClubMember | null>(null);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [memberPermissions, setMemberPermissions] = useState<AppSection[]>([]);
  
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'member'
  });

  useEffect(() => {
    if (user) {
      loadInvites();
      loadMembers();
      loadMemberCount();

      // Setup real-time subscription for invites
      const invitesChannel = supabase
        .channel('club-invites-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'club_invites',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            loadInvites();
          }
        )
        .subscribe();

      // Setup real-time subscription for members
      const membersChannel = supabase
        .channel('club-members-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'club_members',
            filter: `club_owner_id=eq.${user.id}`
          },
          () => {
            loadMembers();
            loadMemberCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(invitesChannel);
        supabase.removeChannel(membersChannel);
      };
    }
  }, [user]);

  const loadInvites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('club_invites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvites(data || []);
    } catch (error) {
      console.error('Error loading invites:', error);
    }
  };

  const loadMembers = async () => {
    if (!user) return;

    try {
      // Get club members with their profiles
      const { data: membersData, error } = await supabase
        .from('club_members')
        .select(`
          id,
          user_id,
          role,
          status,
          joined_at
        `)
        .eq('club_owner_id', user.id)
        .eq('status', 'active')
        .order('joined_at', { ascending: false });

      if (error) throw error;

      // Get profiles and emails for each member  
      const membersWithInfo = await Promise.all(
        (membersData || []).map(async (member) => {
          // Get profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', member.user_id)
            .maybeSingle();

          // Get email from auth metadata via RPC or just show it's available
          // Since we can't access auth.users directly, we'll fetch from invites or show placeholder
          const { data: inviteData } = await supabase
            .from('club_invites')
            .select('email')
            .eq('user_id', user.id)
            .or(`email.eq.${profile?.full_name}`)
            .maybeSingle();

          return {
            ...member,
            full_name: profile?.full_name || 'Nome non disponibile',
            email: inviteData?.email || '(Email privata)'
          };
        })
      );

      setMembers(membersWithInfo);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      // Insert the invite and get the ID directly
      const { data: insertedInvite, error } = await supabase
        .from('club_invites')
        .insert({
          user_id: user.id,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role
        } as any)
        .select('id')
        .single();

      if (error) throw error;

      // Send invite email
      if (insertedInvite?.id) {
        console.log('Sending invite email for ID:', insertedInvite.id);
        
        try {
          const { data: emailData, error: emailError } = await supabase.functions.invoke('send-club-invite', {
            body: { inviteId: insertedInvite.id }
          });

          console.log('Email function response:', { emailData, emailError });

          if (emailError) {
            console.error('Error sending invite email:', emailError);
            throw new Error(`Email error: ${emailError.message || JSON.stringify(emailError)}`);
          }
          
          console.log('Invite email sent successfully');
        } catch (emailErr: any) {
          console.error('Exception sending email:', emailErr);
          toast({
            title: "Invito salvato",
            description: `L'invito è stato creato ma c'è stato un errore nell'invio dell'email: ${emailErr.message}`,
            variant: "destructive",
          });
          loadInvites();
          setFormData({ email: '', first_name: '', last_name: '', role: 'member' });
          setIsOpen(false);
          setIsLoading(false);
          return;
        }
      } else {
        throw new Error('Impossibile recuperare l\'ID dell\'invito creato');
      }

      toast({
        title: "Invito inviato",
        description: `L'invito è stato inviato a ${formData.email}`,
      });

      setFormData({ email: '', first_name: '', last_name: '', role: 'member' });
      setIsOpen(false);
      loadInvites();
    } catch (error: any) {
      console.error('Error sending invite:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile inviare l'invito",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('club_invites')
        .delete()
        .eq('id', inviteId);

      if (error) throw error;

      toast({
        title: "Invito eliminato",
        description: "L'invito è stato rimosso con successo",
      });

      loadInvites();
    } catch (error: any) {
      console.error('Error deleting invite:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare l'invito",
        variant: "destructive",
      });
    }
  };

  const loadMemberPermissions = async (userId: string) => {
    if (!user) return;

    try {
      const { data: permissions, error } = await supabase
        .from('member_permissions')
        .select('section')
        .eq('user_id', userId)
        .eq('club_owner_id', user.id);

      if (error) throw error;
      setMemberPermissions(permissions?.map(p => p.section as AppSection) || []);
    } catch (error) {
      console.error('Error loading permissions:', error);
    }
  };

  const saveMemberPermissions = async () => {
    if (!user || !selectedMember) return;

    try {
      // Delete existing permissions
      await supabase
        .from('member_permissions')
        .delete()
        .eq('user_id', selectedMember.user_id)
        .eq('club_owner_id', user.id);

      // Insert new permissions
      if (memberPermissions.length > 0) {
        const { error } = await supabase
          .from('member_permissions')
          .insert(
            memberPermissions.map(section => ({
              user_id: selectedMember.user_id,
              club_owner_id: user.id,
              section
            }))
          );

        if (error) throw error;
      }

      toast({
        title: "Permessi aggiornati",
        description: "I permessi del membro sono stati aggiornati con successo",
      });

      setIsPermissionsOpen(false);
      setSelectedMember(null);
    } catch (error: any) {
      console.error('Error saving permissions:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare i permessi",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'expired':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      accepted: "default",
      expired: "destructive"
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status === 'pending' ? 'In attesa' : 
         status === 'accepted' ? 'Accettato' : 
         status === 'expired' ? 'Scaduto' : status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Member Count and Pricing Card */}
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-600" />
            Membri del Club
          </CardTitle>
          <CardDescription>
            Gestisci i membri del tuo club e invita nuovi collaboratori
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-amber-600">{memberCount}</div>
              <div className="text-sm text-muted-foreground">Membri Totali</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-green-600">€{monthlyPrice}</div>
              <div className="text-sm text-muted-foreground">Costo/Mese</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{invites.filter(i => i.status === 'pending').length}</div>
              <div className="text-sm text-muted-foreground">Inviti Pendenti</div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground mb-4">
            <p><strong>Piano tariffario:</strong></p>
            <p>• Fino a 20 membri: €15/mese</p>
            <p>• Fino a 30 membri: €25/mese</p>
            <p>• Fino a 50 membri: €35/mese</p>
            <p>• Oltre 50 membri: €50/mese</p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <UserPlus className="w-4 h-4 mr-2" />
                Invita Nuovo Membro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invita Nuovo Membro</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Nome</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Cognome</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Ruolo</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Membro</SelectItem>
                      <SelectItem value="secretary">Segretario</SelectItem>
                      <SelectItem value="treasurer">Tesoriere</SelectItem>
                      <SelectItem value="admin">Amministratore</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? 'Invio...' : 'Invia Invito'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Annulla
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* All Club Members - Active and Pending */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Membri del Club ({members.length + invites.filter(i => i.status === 'pending').length})
          </CardTitle>
          <CardDescription>Tutti i membri del club inclusi inviti in attesa</CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 && invites.length === 0 ? (
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
                  <TableHead>Email</TableHead>
                  <TableHead>Ruolo</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Active Members */}
                {members.map((member) => (
                  <TableRow key={`member-${member.id}`}>
                    <TableCell className="font-medium">
                      {member.full_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{member.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{member.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <Badge variant="default">Attivo</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(member.joined_at), 'dd/MM/yyyy', { locale: it })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            setSelectedMember(member);
                            await loadMemberPermissions(member.user_id);
                            setIsPermissionsOpen(true);
                          }}
                          title="Gestisci Permessi"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Pending Invites */}
                {invites.filter(i => i.status === 'pending').map((invite) => (
                  <TableRow key={`invite-${invite.id}`}>
                    <TableCell className="font-medium">
                      {invite.first_name} {invite.last_name}
                    </TableCell>
                    <TableCell>{invite.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{invite.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-yellow-500" />
                        <Badge variant="secondary">In attesa</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(invite.created_at), 'dd MMM yyyy', { locale: it })}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteInvite(invite.id)}
                        title="Elimina invito"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Permissions Manager Dialog */}
      {selectedMember && (
        <Dialog open={isPermissionsOpen} onOpenChange={(open) => {
          setIsPermissionsOpen(open);
          if (!open) {
            setSelectedMember(null);
            setMemberPermissions([]);
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Gestisci Permessi - {selectedMember.full_name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Seleziona le sezioni a cui {selectedMember.full_name} può accedere:
              </p>
              <SectionPermissionSelector
                selectedPermissions={memberPermissions}
                onPermissionsChange={setMemberPermissions}
                showSelectAll={true}
              />
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsPermissionsOpen(false);
                    setSelectedMember(null);
                    setMemberPermissions([]);
                  }}
                >
                  Annulla
                </Button>
                <Button onClick={saveMemberPermissions}>
                  Salva Permessi
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}