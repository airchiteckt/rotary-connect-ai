import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Search, Filter, ArrowLeft, UserPlus, Calendar, Award } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Soci() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('anagrafica');

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

  const memberStats = [
    { label: 'Soci Attivi', value: 0, color: 'text-green-600', bgColor: 'bg-green-100' },
    { label: 'Nuovi Soci', value: 0, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { label: 'In Scadenza', value: 0, color: 'text-orange-600', bgColor: 'bg-orange-100' },
    { label: 'Onorari', value: 0, color: 'text-purple-600', bgColor: 'bg-purple-100' }
  ];

  const memberCategories = [
    { id: 'attivi', name: 'Soci Attivi', count: 0, color: 'bg-green-100 text-green-800' },
    { id: 'onorari', name: 'Soci Onorari', count: 0, color: 'bg-purple-100 text-purple-800' },
    { id: 'emeriti', name: 'Soci Emeriti', count: 0, color: 'bg-blue-100 text-blue-800' },
    { id: 'ospiti', name: 'Ospiti', count: 0, color: 'bg-orange-100 text-orange-800' }
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
            
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Nuovo Socio
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {memberStats.map((stat, index) => (
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
            {/* Search and Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Cerca soci..." 
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtri
                  </Button>
                  <Button variant="outline">
                    Esporta Lista
                  </Button>
                </div>
              </CardContent>
            </Card>

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

            {/* Members List */}
            <Card>
              <CardHeader>
                <CardTitle>Elenco Soci</CardTitle>
                <CardDescription>
                  Tutti i membri del club
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nessun socio registrato</p>
                  <p className="text-sm">Inizia aggiungendo i membri del tuo club</p>
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
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Sistema presenze in preparazione</p>
                  <p className="text-sm">Presto potrai tracciare le presenze automaticamente</p>
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
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Gestione quote in arrivo</p>
                  <p className="text-sm">Sistema di pagamenti in preparazione</p>
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
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Sistema riconoscimenti in arrivo</p>
                  <p className="text-sm">Traccia premi e distintivi dei soci</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}