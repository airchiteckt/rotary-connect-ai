import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, Plus, Search, Filter, ArrowLeft, Calendar, Award, BookOpen, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Prefettura() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('cerimoniale');

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

  const protocolStats = [
    { label: 'Eventi Organizzati', value: 0, color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Calendar },
    { label: 'Cerimonie', value: 0, color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Award },
    { label: 'Protocolli Attivi', value: 0, color: 'text-green-600', bgColor: 'bg-green-100', icon: BookOpen },
    { label: 'Ospiti VIP', value: 0, color: 'text-orange-600', bgColor: 'bg-orange-100', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Prefettura</h1>
                <p className="text-sm text-muted-foreground">Cerimoniale, protocollo e organizzazione eventi</p>
              </div>
            </div>
            
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Evento
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Protocol Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {protocolStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className={`p-2 ${stat.bgColor} rounded-full`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cerimoniale">Cerimoniale</TabsTrigger>
            <TabsTrigger value="eventi">Eventi</TabsTrigger>
            <TabsTrigger value="protocollo">Protocollo</TabsTrigger>
            <TabsTrigger value="ospiti">Ospiti</TabsTrigger>
          </TabsList>

          <TabsContent value="cerimoniale" className="space-y-6">
            {/* Ceremonial Overview */}
            <Card className="border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  Gestione Cerimoniale
                </CardTitle>
                <CardDescription>
                  Organizza cerimonie e eventi ufficiali del club
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <Button className="flex-1">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuova Cerimonia
                  </Button>
                  <Button variant="outline">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Protocolli
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ceremonial Types */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Insediamenti</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground">Programmati</p>
                    <Button size="sm" className="w-full">Organizza</Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Premiazioni</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground">In programma</p>
                    <Button size="sm" className="w-full">Pianifica</Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Ammissioni</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground">Pendenti</p>
                    <Button size="sm" className="w-full">Gestisci</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Cerimonie Programmate</CardTitle>
                <CardDescription>
                  Prossimi eventi cerimoniali
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nessuna cerimonia programmata</p>
                  <p className="text-sm">Inizia organizzando il primo evento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="eventi" className="space-y-6">
            {/* Event Management */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Cerca eventi..." 
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtri
                  </Button>
                  <Button variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Calendario
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Eventi in Programma</CardTitle>
                <CardDescription>
                  Tutti gli eventi organizzati dal club
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nessun evento programmato</p>
                  <p className="text-sm">Inizia organizzando il primo evento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="protocollo">
            <Card>
              <CardHeader>
                <CardTitle>Protocolli e Procedure</CardTitle>
                <CardDescription>
                  Linee guida per cerimonie e eventi ufficiali
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Protocolli in preparazione</p>
                  <p className="text-sm">Database procedure in arrivo</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ospiti">
            <Card>
              <CardHeader>
                <CardTitle>Gestione Ospiti VIP</CardTitle>
                <CardDescription>
                  Organizza accoglienza e protocollo per ospiti speciali
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Sistema ospiti in preparazione</p>
                  <p className="text-sm">Gestione VIP in arrivo</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}