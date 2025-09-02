import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Crown, Plus, Search, Filter, ArrowLeft, Target, Calendar, Users, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Presidenza() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('progetti');

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

  const presidentialStats = [
    { label: 'Progetti Attivi', value: 0, color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Target },
    { label: 'Eventi Pianificati', value: 0, color: 'text-green-600', bgColor: 'bg-green-100', icon: Calendar },
    { label: 'Commissioni', value: 0, color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Users },
    { label: 'Documenti', value: 0, color: 'text-orange-600', bgColor: 'bg-orange-100', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Presidenza</h1>
                <p className="text-sm text-muted-foreground">Strumenti per la governance e coordinamento del club</p>
              </div>
            </div>
            
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Progetto
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Presidential Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {presidentialStats.map((stat, index) => (
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
            <TabsTrigger value="progetti">Progetti</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
            <TabsTrigger value="pianificazione">Pianificazione</TabsTrigger>
            <TabsTrigger value="commissioni">Commissioni</TabsTrigger>
          </TabsList>

          <TabsContent value="progetti" className="space-y-6">
            {/* Project Overview */}
            <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-600" />
                  Gestione Progetti
                </CardTitle>
                <CardDescription>
                  Monitora e coordina tutti i progetti del club
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <Button className="flex-1">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuovo Progetto
                  </Button>
                  <Button variant="outline">
                    <Search className="w-4 h-4 mr-2" />
                    Visualizza Tutti
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Active Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Progetti Attivi</CardTitle>
                <CardDescription>
                  Progetti in corso di realizzazione
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nessun progetto attivo</p>
                  <p className="text-sm">Inizia creando il primo progetto del club</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="governance" className="space-y-6">
            {/* Governance Tools */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Consiglio Direttivo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground">Riunioni programmate</p>
                    <Button size="sm" className="w-full">Gestisci</Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Decisioni</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground">In sospeso</p>
                    <Button size="sm" className="w-full">Visualizza</Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Votazioni</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground">Attive</p>
                    <Button size="sm" className="w-full">Crea</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Sistema di Governance</CardTitle>
                <CardDescription>
                  Strumenti per la gestione democratica del club
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Crown className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Sistema governance in preparazione</p>
                  <p className="text-sm">Strumenti di votazione e decisioni in arrivo</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pianificazione">
            <Card>
              <CardHeader>
                <CardTitle>Pianificazione Strategica</CardTitle>
                <CardDescription>
                  Pianifica obiettivi e strategie del club
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Strumenti di pianificazione in arrivo</p>
                  <p className="text-sm">Sistema di pianificazione strategica in preparazione</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissioni">
            <Card>
              <CardHeader>
                <CardTitle>Gestione Commissioni</CardTitle>
                <CardDescription>
                  Coordina le commissioni e i gruppi di lavoro
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Sistema commissioni in preparazione</p>
                  <p className="text-sm">Gestione gruppi di lavoro in arrivo</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}