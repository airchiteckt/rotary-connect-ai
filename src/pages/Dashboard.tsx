import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Mail, Image, Users, Calendar, Settings, LogOut } from 'lucide-react';

export default function Dashboard() {
  const { user, loading, isTrialValid, profile, signOut, checkTrialStatus } = useAuth();

  useEffect(() => {
    if (user) {
      checkTrialStatus();
    }
  }, [user, checkTrialStatus]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Show trial expired message
  if (!isTrialValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
        <Card className="max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-red-600">Periodo di Prova Scaduto</CardTitle>
            <CardDescription>
              Il tuo periodo di prova gratuito di 30 giorni è terminato.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Per continuare ad utilizzare il gestionale Rotary, contatta il nostro team per attivare l'abbonamento.
            </p>
            <div className="space-y-2">
              <Button className="w-full">Contatta il Team</Button>
              <Button variant="outline" onClick={signOut} className="w-full">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const menuItems = [
    {
      title: "Documenti",
      description: "Crea programmi mensili, verbali e comunicazioni con AI",
      icon: FileText,
      href: "/documents",
      color: "bg-blue-500"
    },
    {
      title: "Email",
      description: "Gestisci anagrafiche e invii email di massa",
      icon: Mail,
      href: "/emails",
      color: "bg-green-500"
    },
    {
      title: "Locandine",
      description: "Genera flyer per eventi con intelligenza artificiale",
      icon: Image,
      href: "/flyers",
      color: "bg-purple-500"
    },
    {
      title: "Contatti",
      description: "Gestisci l'anagrafica dei membri e categorie",
      icon: Users,
      href: "/contacts",
      color: "bg-orange-500"
    }
  ];

  const daysRemaining = profile?.trial_start_date ? 
    Math.max(0, 30 - Math.floor((Date.now() - new Date(profile.trial_start_date).getTime()) / (1000 * 60 * 60 * 24))) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">R</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Gestionale Rotary</h1>
                <p className="text-sm text-muted-foreground">{profile?.club_name || 'Club Rotary'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant={daysRemaining > 7 ? "default" : "destructive"}>
                {daysRemaining} giorni rimasti
              </Badge>
              <div className="text-right">
                <p className="font-medium">{profile?.full_name}</p>
                <p className="text-sm text-muted-foreground capitalize">{profile?.role}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Benvenuto, {profile?.full_name?.split(' ')[0] || 'Rotariano'}!</h2>
          <p className="text-muted-foreground">
            Gestisci le attività del tuo club Rotary con strumenti professionali e intelligenza artificiale.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Documenti</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email Inviate</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <Mail className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Locandine</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <Image className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contatti</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <Users className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item) => (
            <Card key={item.title} className="cursor-pointer hover:shadow-lg transition-all duration-200 group">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${item.color} text-white`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {item.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Accedi a {item.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trial Notice */}
        <Card className="mt-8 border-amber-200 bg-amber-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">Periodo di Prova Attivo</p>
                <p className="text-sm text-amber-700">
                  Hai ancora {daysRemaining} giorni per testare tutte le funzionalità del gestionale.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}