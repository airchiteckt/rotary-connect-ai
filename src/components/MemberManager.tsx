import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Users, Search, Edit, Trash2, History, Mail, Calendar, Clock, CheckCircle, XCircle, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import MemberForm from './MemberForm';
import PositionHistoryManager from './PositionHistoryManager';

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  membership_start_date: string;
  current_position?: string;
  notes?: string;
  status: string;
  created_at: string;
  responsible_commission_id?: string;
  responsible_sections?: string[];
  profession?: string;
  awards?: string;
}

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

interface MemberManagerProps {
  onStatsUpdate: (stats: { active: number; honorary: number; emeritus: number; guest: number }) => void;
}

export default function MemberManager({ onStatsUpdate }: MemberManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<ClubInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadMembers();
      loadInvites();
    }
  }, [user]);

  const loadInvites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('club_invites')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvites(data || []);
    } catch (error) {
      console.error('Errore nel caricamento degli inviti:', error);
    }
  };

  const loadMembers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMembers(data || []);
      updateStats(data || []);
    } catch (error) {
      console.error('Errore nel caricamento dei soci:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nel caricamento dei soci.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (membersList: Member[]) => {
    const stats = {
      active: membersList.filter(m => m.status === 'active').length,
      honorary: membersList.filter(m => m.status === 'honorary').length,
      emeritus: membersList.filter(m => m.status === 'emeritus').length,
      guest: membersList.filter(m => m.status === 'guest').length
    };
    onStatsUpdate(stats);
  };

  const filteredMembers = members.filter(member =>
    `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.current_position && member.current_position.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const deleteMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Socio eliminato",
        description: "Il socio è stato eliminato con successo.",
      });

      loadMembers();
    } catch (error) {
      console.error('Errore nell\'eliminazione del socio:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nell'eliminazione del socio.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (member: Member) => {
    setSelectedMember(member);
    setIsFormOpen(true);
  };

  const openHistoryDialog = (member: Member) => {
    setSelectedMember(member);
    setIsHistoryOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Attivo</Badge>;
      case 'honorary':
        return <Badge className="bg-blue-100 text-blue-800">Onorario</Badge>;
      case 'emeritus':
        return <Badge className="bg-purple-100 text-purple-800">Emerito</Badge>;
      case 'guest':
        return <Badge className="bg-gray-100 text-gray-800">Ospite</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getInviteStatusIcon = (status: string) => {
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

  const getInviteStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Invitato - Non ancora su FastClub</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">Accettato</Badge>;
      case 'expired':
        return <Badge variant="destructive">Scaduto</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
        title: "Successo",
        description: "Invito eliminato correttamente.",
      });

      loadInvites();
    } catch (error) {
      console.error('Errore nell\'eliminazione dell\'invito:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nell'eliminazione dell'invito.",
        variant: "destructive",
      });
    }
  };

  const resendInvite = async (inviteId: string) => {
    try {
      // Chiama l'edge function per reinviare l'email
      const { error: emailError } = await supabase.functions.invoke('send-club-invite', {
        body: { inviteId }
      });

      if (emailError) throw emailError;

      toast({
        title: "Email inviata",
        description: "L'email di invito è stata reinviata con successo.",
      });
    } catch (error) {
      console.error('Errore nel reinvio dell\'email:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nel reinvio dell'email di invito.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Gestione Soci ({members.length})</span>
            </CardTitle>
            <Button onClick={() => setIsFormOpen(true)}>
              Nuovo Socio
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca soci..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {filteredMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{members.length === 0 ? 'Nessun socio registrato' : 'Nessun socio trovato'}</p>
                <p className="text-sm">
                  {members.length === 0 ? 'Inizia aggiungendo i membri del tuo club' : 'Prova a modificare i criteri di ricerca'}
                </p>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Carica</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead>Inizio</TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {member.first_name} {member.last_name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span>{member.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {member.current_position || 'Nessuna carica'}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(member.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{format(new Date(member.membership_start_date), 'dd/MM/yyyy', { locale: it })}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openHistoryDialog(member)}
                              title="Cronologia cariche"
                            >
                              <History className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(member)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Sei sicuro di voler eliminare {member.first_name} {member.last_name}? 
                                    Questa azione non può essere annullata.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteMember(member.id)}>
                                    Elimina
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invited Members Section */}
      {invites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="w-5 h-5" />
              <span>Membri Invitati ({invites.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                I seguenti membri sono stati invitati ma non si sono ancora uniti a FastClub:
              </div>
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
                          {getInviteStatusIcon(invite.status)}
                          {getInviteStatusBadge(invite.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{format(new Date(invite.created_at), 'dd/MM/yyyy', { locale: it })}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(invite.expires_at), 'dd/MM/yyyy', { locale: it })}
                      </TableCell>
                      <TableCell>
                        {invite.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => resendInvite(invite.id)}
                              title="Reinvia email di invito"
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" title="Elimina invito">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Conferma eliminazione invito</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Sei sicuro di voler eliminare l'invito per {invite.first_name} {invite.last_name}? 
                                    Questa azione non può essere annullata.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteInvite(invite.id)}>
                                    Elimina
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <MemberForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        onSuccess={() => {
          loadMembers();
          loadInvites();
        }}
      />

      {selectedMember && (
        <PositionHistoryManager
          isOpen={isHistoryOpen}
          onClose={() => {
            setIsHistoryOpen(false);
            setSelectedMember(null);
          }}
          member={selectedMember}
          onPositionUpdate={() => {
            loadMembers();
            loadInvites();
          }}
        />
      )}
    </>
  );
}