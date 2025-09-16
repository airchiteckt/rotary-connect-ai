import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Auth() {
  const { user, signIn, signUp } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'signin') {
      setActiveTab('signin');
    }
  }, [location]);

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
        description: "Benvenuto!",
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
    const referral_code = formData.get('referral_code') as string;

    try {
      // Use Supabase directly to get user data for referral handling
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name, club_name }
        }
      });
      
      if (error) throw error;

      // Handle referral code if provided and user was created
      if (data?.user && referral_code) {
        const { data: referralResult } = await supabase.rpc('handle_referral_signup', {
          new_user_id: data.user.id,
          referral_code_input: referral_code.toUpperCase()
        });
        
        if (referralResult) {
          toast({
            title: "Registrazione completata",
            description: "Verifica la tua email per attivare l'account. Hai ottenuto 3 mesi bonus con il codice referral!",
          });
        } else {
          toast({
            title: "Registrazione completata",
            description: "Verifica la tua email per attivare l'account. Codice referral non valido o già utilizzato.",
          });
        }
      } else {
        toast({
          title: "Registrazione completata",
          description: "Verifica la tua email per attivare l'account. Inizia il tuo mese di prova gratuito!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Errore di registrazione",
        description: error.message,
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center">
            <img src="/lovable-uploads/fc293183-4946-4f6f-9562-6509947cf52e.png" alt={t('auth.title')} className="h-8" />
          </CardTitle>
          <CardDescription>
            {t('auth.description')}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin" className="w-full">{t('auth.login')}</TabsTrigger>
              <TabsTrigger value="signup" className="w-full">{t('auth.register')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t('auth.emailPlaceholder')}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder={t('auth.passwordPlaceholder')}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t('auth.loggingIn') : t('auth.login')}
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
                    placeholder="Il tuo nome completo"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="club_name">Nome Club</Label>
                  <Input
                    id="club_name"
                    name="club_name"
                    type="text"
                    placeholder="Nome del tuo club"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="referral_code" className="text-green-700 font-medium">
                    🎁 Codice Referral (opzionale)
                  </Label>
                  <Input
                    id="referral_code"
                    name="referral_code"
                    type="text"
                    placeholder="Inserisci il codice di invito"
                    className="font-mono uppercase border-green-200 focus:border-green-400 bg-green-50"
                    onChange={(e) => e.target.value = e.target.value.toUpperCase()}
                  />
                  <div className="bg-green-100 border border-green-200 rounded-lg p-2">
                    <p className="text-xs text-green-700 font-medium flex items-center gap-1">
                      💡 <strong>Bonus speciale:</strong> Con un codice referral ottieni 3 mesi gratuiti aggiuntivi!
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Il club che ti ha invitato riceverà anche 3 mesi bonus.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup_email">{t('auth.email')}</Label>
                  <Input
                    id="signup_email"
                    name="email"
                    type="email"
                    placeholder={t('auth.emailPlaceholder')}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup_password">{t('auth.password')}</Label>
                  <Input
                    id="signup_password"
                    name="password"
                    type="password"
                    placeholder={t('auth.passwordPlaceholder')}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Registrazione...' : 'Registrati - Prova Gratuita 30 giorni'}
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  Registrandoti accetti i nostri termini di servizio e la privacy policy
                </p>
              </form>
            </TabsContent>
            
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}