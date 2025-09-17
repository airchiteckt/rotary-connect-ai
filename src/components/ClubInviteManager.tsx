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
import { UserPlus, Mail, Clock, CheckCircle, XCircle, Trash2, Users } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

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
  profiles: {
    full_name: string;
    email?: string;
  };
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
      // Get club members with their user profiles
      const { data: membersData, error } = await supabase
        .from('club_members')
        .select('id, user_id, role, status, joined_at')
        .eq('club_owner_id', user.id)
        .order('joined_at', { ascending: false });

      if (error) throw error;

      // Get profiles for each member
      const membersWithProfiles = [];
      for (const member of membersData || []) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', member.user_id)
          .single();

        membersWithProfiles.push({
          ...member,
          profiles: {
            full_name: profile?.full_name || 'Nome non disponibile'
          }
        });
      }

      setMembers(membersWithProfiles);
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
      const { error } = await supabase
        .from('club_invites')
        .insert({
          user_id: user.id,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role
        } as any);

      if (error) throw error;

      // Send invite email
      const { data: insertedInvite } = await supabase
        .from('club_invites')
        .select('id')
        .eq('email', formData.email)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (insertedInvite) {
        // Call the send-club-invite function
        const { error: emailError } = await supabase.functions.invoke('send-club-invite', {
          body: { inviteId: insertedInvite.id }
        });

        if (emailError) {
          console.error('Error sending invite email:', emailError);
          // Don't fail the whole operation if email fails
        }
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

      {/* Active Members */}
      {members.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Membri Attivi</CardTitle>
            <CardDescription>Membri che hanno accettato l'invito al club</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Ruolo</TableHead>
                  <TableHead>Data Adesione</TableHead>
                  <TableHead>Stato</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.profiles.full_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{member.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(member.joined_at), 'dd MMM yyyy', { locale: it })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                        {member.status === 'active' ? 'Attivo' : member.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pending Invites */}
      <Card>
        <CardHeader>
          <CardTitle>Inviti Inviati</CardTitle>
          <CardDescription>Gestisci gli inviti inviati ai nuovi membri</CardDescription>
        </CardHeader>
        <CardContent>
          {invites.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nessun invito inviato ancora</p>
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
                  <TableHead>Data Invito</TableHead>
                  <TableHead>Scadenza</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell className="font-medium">
                      {invite.first_name} {invite.last_name}
                    </TableCell>
                    <TableCell>{invite.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{invite.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(invite.status)}
                        {getStatusBadge(invite.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(invite.created_at), 'dd MMM yyyy', { locale: it })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(invite.expires_at), 'dd MMM yyyy', { locale: it })}
                    </TableCell>
                    <TableCell>
                      {invite.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteInvite(invite.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}