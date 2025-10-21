import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Search, Filter, ArrowLeft, UserPlus, Calendar, Award } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useComingSoonToast } from '@/components/ComingSoonToast';
import HelpSupport from '@/components/HelpSupport';
import { useToast } from '@/hooks/use-toast';
import { SectionResponsible } from '@/components/SectionResponsible';

export default function Soci() {
  const { user, loading } = useAuth();
  const { showComingSoon } = useComingSoonToast();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('anagrafica');
  const [memberStats, setMemberStats] = useState({
    active: 0,
    honorary: 0,
    emeritus: 0,
    guest: 0
  });

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

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const displayStats = [
    { label: 'Soci Attivi', value: memberStats.active, color: 'text-green-600', bgColor: 'bg-green-100' },
    { label: 'Soci Onorari', value: memberStats.honorary, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { label: 'Soci Emeriti', value: memberStats.emeritus, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { label: 'Ospiti', value: memberStats.guest, color: 'text-orange-600', bgColor: 'bg-orange-100' }
  ];

  const memberCategories = [
    { id: 'active', name: 'Soci Attivi', count: memberStats.active, color: 'bg-green-100 text-green-800' },
    { id: 'honorary', name: 'Soci Onorari', count: memberStats.honorary, color: 'bg-purple-100 text-purple-800' },
    { id: 'emeritus', name: 'Soci Emeriti', count: memberStats.emeritus, color: 'bg-blue-100 text-blue-800' },
    { id: 'guest', name: 'Ospiti', count: memberStats.guest, color: 'bg-orange-100 text-orange-800' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Gestione Soci</h1>
                <p className="text-sm text-muted-foreground">Anagrafica e gestione membri del club</p>
              </div>
            </div>
            
            <Button onClick={() => toast({ title: "Funzione spostata", description: "La gestione soci è ora nelle impostazioni utente con il piano Premium." })}>
              <UserPlus className="w-4 h-4 mr-2" />
              Nuovo Socio
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <SectionResponsible section="soci" />
        
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {displayStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center mx-auto mb-2`}>
                    <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="anagrafica">Anagrafica</TabsTrigger>
            <TabsTrigger value="presenze">Presenze</TabsTrigger>
            <TabsTrigger value="quote">Quote</TabsTrigger>
            <TabsTrigger value="riconoscimenti">Riconoscimenti</TabsTrigger>
          </TabsList>

          <TabsContent value="anagrafica" className="space-y-6">
            {/* Member Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {memberCategories.map((category) => (
                <Card key={category.id} className="cursor-pointer hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
                      <Badge className={category.color}>{category.count}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline" size="sm">
                      Visualizza
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Members Manager */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Gestione Soci
                </CardTitle>
                <CardDescription>
                  La gestione dei soci è ora disponibile nelle impostazioni utente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Gestione Soci Spostata</h3>
                  <p className="text-muted-foreground mb-4">
                    Per una migliore esperienza utente, la gestione completa dei soci è stata spostata 
                    nelle impostazioni del tuo account con il piano Premium.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Attiva il piano Premium dalle impostazioni per accedere alla gestione completa dell'organizzazione.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="presenze">
            <Card>
              <CardHeader>
                <CardTitle>Registro Presenze</CardTitle>
                <CardDescription>
                  Traccia le presenze alle riunioni e agli eventi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground cursor-pointer hover:bg-muted/50 rounded-lg transition-colors" onClick={() => showComingSoon("Sistema Presenze", "Presto potrai tracciare le presenze automaticamente")}>
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Sistema presenze in preparazione</p>
                  <p className="text-sm">Presto potrai tracciare le presenze automaticamente</p>
                  <Button variant="outline" className="mt-4">Clicca per info</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quote">
            <Card>
              <CardHeader>
                <CardTitle>Gestione Quote</CardTitle>
                <CardDescription>
                  Monitora pagamenti e quote associative
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground cursor-pointer hover:bg-muted/50 rounded-lg transition-colors" onClick={() => showComingSoon("Gestione Quote", "Sistema di pagamenti in preparazione")}>
                  <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Gestione quote in arrivo</p>
                  <p className="text-sm">Sistema di pagamenti in preparazione</p>
                  <Button variant="outline" className="mt-4">Clicca per info</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="riconoscimenti">
            <Card>
              <CardHeader>
                <CardTitle>Riconoscimenti e Premi</CardTitle>
                <CardDescription>
                  Gestisci premi, distintivi e riconoscimenti
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground cursor-pointer hover:bg-muted/50 rounded-lg transition-colors" onClick={() => showComingSoon("Sistema Riconoscimenti", "Traccia premi e distintivi dei soci")}>
                  <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Sistema riconoscimenti in arrivo</p>
                  <p className="text-sm">Traccia premi e distintivi dei soci</p>
                  <Button variant="outline" className="mt-4">Clicca per info</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      
      {/* Help Support Button */}
      <HelpSupport />
    </div>
  );
}