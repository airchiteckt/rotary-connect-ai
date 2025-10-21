import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Building2, Mail, User, Lock, CheckCircle, AlertCircle } from 'lucide-react';

interface InviteDetails {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  expires_at: string;
  club_name: string;
  club_owner_name: string;
}

export default function ClubInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const inviteToken = searchParams.get('invite');

  useEffect(() => {
    if (!inviteToken) {
      navigate('/auth');
      return;
    }
    loadInviteDetails();
  }, [inviteToken]);

  const loadInviteDetails = async () => {
    if (!inviteToken) return;

    try {
      // Get invite details
      const { data: invite, error: inviteError } = await supabase
        .from('club_invites')
        .select('*')
        .eq('invite_token', inviteToken)
        .eq('status', 'pending')
        .single();

      if (inviteError || !invite) {
        toast({
          title: "Invito non valido",
          description: "Questo invito non è valido o è già stato utilizzato.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      // Check if expired
      if (new Date(invite.expires_at) < new Date()) {
        toast({
          title: "Invito scaduto",
          description: "Questo invito è scaduto. Contatta l'amministratore del club.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      // Get club owner details
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, club_name')
        .eq('user_id', invite.user_id)
        .single();

      setInviteDetails({
        ...invite,
        club_name: profile?.club_name || 'Club Rotary',
        club_owner_name: profile?.full_name || 'Amministratore',
      });
    } catch (error) {
      console.error('Error loading invite:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i dettagli dell'invito.",
        variant: "destructive",
      });
      navigate('/auth');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteDetails) return;

    if (password !== confirmPassword) {
      toast({
        title: "Errore",
        description: "Le password non coincidono",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Errore",
        description: "La password deve essere di almeno 6 caratteri",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: inviteDetails.email,
        password: password,
        options: {
          data: {
            full_name: `${inviteDetails.first_name} ${inviteDetails.last_name}`,
            club_name: inviteDetails.club_name,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (signUpError) throw signUpError;

      if (!authData.user) {
        throw new Error('Registrazione fallita');
      }

      // Accept the invite automatically
      const { error: acceptError } = await supabase.rpc('accept_club_invite', {
        invite_token_param: inviteToken
      });

      if (acceptError) {
        console.error('Error accepting invite:', acceptError);
      }

      toast({
        title: "Registrazione completata!",
        description: `Benvenuto in ${inviteDetails.club_name}! Controlla la tua email per confermare l'account.`,
      });

      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast({
        title: "Errore durante la registrazione",
        description: error.message || "Si è verificato un errore. Riprova.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!inviteDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
            <p className="text-center text-muted-foreground mt-4">Caricamento invito...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Sei stato invitato!
          </CardTitle>
          <CardDescription>
            {inviteDetails.club_owner_name} ti ha invitato a unirti a
          </CardDescription>
          <div className="text-lg font-semibold text-primary">
            {inviteDetails.club_name}
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Email:</span>
              <span className="text-muted-foreground">{inviteDetails.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Nome:</span>
              <span className="text-muted-foreground">
                {inviteDetails.first_name} {inviteDetails.last_name}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Ruolo:</span>
              <span className="text-muted-foreground capitalize">{inviteDetails.role}</span>
            </div>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">
                <Lock className="w-4 h-4 inline mr-2" />
                Crea una password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Almeno 6 caratteri"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                <Lock className="w-4 h-4 inline mr-2" />
                Conferma password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Ripeti la password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Completa la registrazione</p>
                  <p className="text-blue-700 dark:text-blue-300">
                    Crea una password per accedere a FastClub e unirti a {inviteDetails.club_name}.
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Registrazione in corso...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Completa la registrazione
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Hai già un account?{' '}
              <Button
                variant="link"
                className="p-0 h-auto text-xs"
                onClick={() => navigate('/auth')}
                type="button"
              >
                Accedi qui
              </Button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}