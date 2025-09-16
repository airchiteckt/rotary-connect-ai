import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileText, Mail, Image, Users, Calendar, Settings, LogOut, Crown, DollarSign, Shield, UserCheck, Megaphone, Building } from 'lucide-react';

export default function Dashboard() {
  const { user, loading, isTrialValid, profile, signOut, checkTrialStatus } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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
            <p className="mb-4 text-sm text-muted-foreground flex items-center gap-1">
              Per continuare ad utilizzare <img src="/lovable-uploads/fc293183-4946-4f6f-9562-6509947cf52e.png" alt="FastClub" className="h-4" />, contatta il nostro team per attivare l'abbonamento.
            </p>
            <div className="space-y-2">
              <Button className="w-full">Contatta il Team</Button>
              <Button variant="outline" onClick={() => {
                signOut();
                toast({
                  title: "Logout effettuato",
                  description: "A presto!",
                });
              }} className="w-full">
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
      title: "Segreteria",
      description: "Documenti, verbali, programmi mensili e comunicazioni ufficiali",
      icon: FileText,
      href: "/segreteria",
      color: "bg-blue-600"
    },
    {
      title: "Tesoreria", 
      description: "Gestione finanziaria, bilanci e quote soci",
      icon: DollarSign,
      href: "/tesoreria",
      color: "bg-emerald-600"
    },
    {
      title: "Organigramma", 
      description: "Struttura sociale e organizzativa del club",
      icon: Building,
      href: "/organigramma",
      color: "bg-blue-600"
    },
    {
      title: "Presidenza",
      description: "Strumenti per la governance e coordinamento club",
      icon: Crown,
      href: "/presidenza", 
      color: "bg-amber-600"
    },
    {
      title: "Prefettura",
      description: "Cerimoniale, protocollo e organizzazione eventi",
      icon: Shield,
      href: "/prefettura",
      color: "bg-red-600"
    },
    {
      title: "Direttivo",
      description: "Coordinamento consiglio direttivo e commissioni",
      icon: Building,
      href: "/direttivo",
      color: "bg-indigo-600"
    },
    {
      title: "Comunicazione",
      description: "Locandine, social media e comunicazione esterna",
      icon: Megaphone,
      href: "/comunicazione",
      color: "bg-purple-600"
    },
    {
      title: "Soci",
      description: "Anagrafica soci, presenze e gestione membri",
      icon: Users,
      href: "/soci",
      color: "bg-orange-600"
    },
    {
      title: "Commissioni",
      description: "Gestione commissioni e assegnazione progetti",
      icon: UserCheck,
      href: "/commissioni",
      color: "bg-pink-600"
    }
  ];

  const daysRemaining = profile?.trial_start_date ? 
    Math.max(0, 30 - Math.floor((Date.now() - new Date(profile.trial_start_date).getTime()) / (1000 * 60 * 60 * 24))) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm sm:text-lg font-bold text-primary-foreground">F</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold truncate flex items-center">
                  <img src="/lovable-uploads/fc293183-4946-4f6f-9562-6509947cf52e.png" alt="FastClub" className="h-5 sm:h-6" />
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{profile?.club_name || 'Il tuo Club'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-4 flex-shrink-0">
              <Badge variant={daysRemaining > 7 ? "default" : "destructive"} className="text-xs sm:text-sm">
                <span className="hidden sm:inline">{daysRemaining} giorni rimasti</span>
                <span className="sm:hidden">{daysRemaining}g</span>
              </Badge>
              <div className="text-right hidden md:block">
                <p className="font-medium text-sm truncate max-w-[120px]">{profile?.full_name}</p>
                <p className="text-xs text-muted-foreground capitalize">{profile?.role}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => {
                signOut();
                toast({
                  title: "Logout effettuato",
                  description: "A presto!",
                });
              }} className="p-2">
                <LogOut className="w-4 h-4" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Benvenuto, {profile?.full_name?.split(' ')[0] || 'Amico'}!</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Automatizza e ottimizza la gestione del tuo club con AI avanzata e automazioni intelligenti.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <Card>
            <CardContent className="pt-2 sm:pt-4 pb-2 sm:pb-4">
              <div className="text-center">
                <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-muted-foreground">Documenti</p>
                <p className="text-sm sm:text-lg font-bold">0</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-2 sm:pt-4 pb-2 sm:pb-4">
              <div className="text-center">
                <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-muted-foreground">Budget</p>
                <p className="text-sm sm:text-lg font-bold">€0</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-2 sm:pt-4 pb-2 sm:pb-4">
              <div className="text-center">
                <Building className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-muted-foreground">Cariche</p>
                <p className="text-sm sm:text-lg font-bold">0</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-2 sm:pt-4 pb-2 sm:pb-4">
              <div className="text-center">
                <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-amber-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-muted-foreground">Progetti</p>
                <p className="text-sm sm:text-lg font-bold">0</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-2 sm:pt-4 pb-2 sm:pb-4">
              <div className="text-center">
                <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-red-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-muted-foreground">Eventi</p>
                <p className="text-sm sm:text-lg font-bold">0</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-2 sm:pt-4 pb-2 sm:pb-4">
              <div className="text-center">
                <Building className="w-4 h-4 sm:w-6 sm:h-6 text-indigo-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-muted-foreground">Commissioni</p>
                <p className="text-sm sm:text-lg font-bold">0</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-2 sm:pt-4 pb-2 sm:pb-4">
              <div className="text-center">
                <Megaphone className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-muted-foreground">Campagne</p>
                <p className="text-sm sm:text-lg font-bold">0</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-2 sm:pt-4 pb-2 sm:pb-4">
              <div className="text-center">
                <Users className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-muted-foreground">Soci Attivi</p>
                <p className="text-sm sm:text-lg font-bold">0</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Menu */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                <Button className="w-full" variant="outline" onClick={() => navigate(item.href)}>
                  Accedi a {item.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trial Notice */}
        <Card className="mt-6 sm:mt-8 border-amber-200 bg-amber-50/50">
          <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
            <div className="flex items-start sm:items-center space-x-3">
              <Calendar className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div className="min-w-0">
                <p className="font-medium text-amber-800 text-sm sm:text-base">Periodo di Prova Attivo</p>
                <p className="text-xs sm:text-sm text-amber-700 mt-1">
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