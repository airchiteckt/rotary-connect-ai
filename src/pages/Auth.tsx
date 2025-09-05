import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Errore di accesso",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Accesso effettuato",
        description: "Benvenuto in FastClub!",
      });
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const full_name = formData.get('full_name') as string;
    const club_name = formData.get('club_name') as string;

    const { error } = await signUp(email, password, { full_name, club_name });
    
    if (error) {
      toast({
        title: "Errore di registrazione",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Registrazione completata",
        description: "Verifica la tua email per attivare l'account. Inizia il tuo mese di prova gratuito!",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-foreground">F</span>
          </div>
          <CardTitle className="text-2xl font-bold">FastClub</CardTitle>
          <CardDescription>
            Accedi o registrati per iniziare la tua prova gratuita di 30 giorni
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Accedi</TabsTrigger>
              <TabsTrigger value="signup">Registrati</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="nome@esempio.it"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Accesso in corso..." : "Accedi"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    placeholder="Mario Rossi"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="club_name">Nome Club/Associazione</Label>
                  <Input
                    id="club_name"
                    name="club_name"
                    type="text"
                    placeholder="Il tuo Club o Associazione"
                    required
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="signup_email">Email</Label>
                  <Input
                    id="signup_email"
                    name="email"
                    type="email"
                    placeholder="nome@esempio.it"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup_password">Password</Label>
                  <Input
                    id="signup_password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Registrazione in corso..." : "Inizia Prova Gratuita"}
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  Registrandoti accetti i nostri termini di servizio e la policy GDPR
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}