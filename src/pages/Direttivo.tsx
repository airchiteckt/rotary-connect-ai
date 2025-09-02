import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Building, Plus, Search, Filter, ArrowLeft, Users, FileText, Calendar, Vote } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Direttivo() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('riunioni');

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

  const boardStats = [
    { label: 'Membri Direttivo', value: 0, color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Users },
    { label: 'Riunioni Mensili', value: 0, color: 'text-green-600', bgColor: 'bg-green-100', icon: Calendar },
    { label: 'Delibere', value: 0, color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Vote },
    { label: 'Commissioni', value: 0, color: 'text-orange-600', bgColor: 'bg-orange-100', icon: Building }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Consiglio Direttivo</h1>
                <p className="text-sm text-muted-foreground">Coordinamento direttivo e commissioni</p>
              </div>
            </div>
            
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuova Riunione
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Board Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {boardStats.map((stat, index) => (
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
            <TabsTrigger value="riunioni">Riunioni</TabsTrigger>
            <TabsTrigger value="membri">Membri</TabsTrigger>
            <TabsTrigger value="commissioni">Commissioni</TabsTrigger>
            <TabsTrigger value="delibere">Delibere</TabsTrigger>
          </TabsList>

          <TabsContent value="riunioni" className="space-y-6">
            {/* Meeting Overview */}
            <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Gestione Riunioni
                </CardTitle>
                <CardDescription>
                  Organizza e monitora le riunioni del consiglio direttivo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <Button className="flex-1">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuova Riunione
                  </Button>
                  <Button variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Calendario
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Meetings */}
            <Card>
              <CardHeader>
                <CardTitle>Prossime Riunioni</CardTitle>
                <CardDescription>
                  Riunioni programmate del consiglio direttivo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nessuna riunione programmata</p>
                  <p className="text-sm">Pianifica la prima riunione del direttivo</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="membri" className="space-y-6">
            {/* Board Members */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Cerca membri del direttivo..." 
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtri
                  </Button>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Aggiungi Membro
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Board Positions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['Presidente', 'Vice Presidente', 'Segretario', 'Tesoriere', 'Prefetto', 'Consigliere'].map((position) => (
                <Card key={position}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{position}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Non assegnato</p>
                      <Button size="sm" className="w-full">Assegna</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Membri del Direttivo</CardTitle>
                <CardDescription>
                  Elenco dei membri del consiglio direttivo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nessun membro assegnato</p>
                  <p className="text-sm">Inizia assegnando i ruoli del direttivo</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissioni">
            <Card>
              <CardHeader>
                <CardTitle>Commissioni Attive</CardTitle>
                <CardDescription>
                  Gestisci le commissioni e i gruppi di lavoro
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nessuna commissione attiva</p>
                  <p className="text-sm">Crea la prima commissione del club</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delibere">
            <Card>
              <CardHeader>
                <CardTitle>Delibere e Decisioni</CardTitle>
                <CardDescription>
                  Registra e monitora le delibere del consiglio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Vote className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nessuna delibera registrata</p>
                  <p className="text-sm">Le delibere del direttivo appariranno qui</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}