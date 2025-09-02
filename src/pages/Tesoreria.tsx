import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Plus, Search, Filter, ArrowLeft, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Tesoreria() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('bilancio');

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

  const financialStats = [
    { label: 'Entrate Totali', value: '€0', trend: 'up', color: 'text-green-600', bgColor: 'bg-green-100' },
    { label: 'Uscite Totali', value: '€0', trend: 'down', color: 'text-red-600', bgColor: 'bg-red-100' },
    { label: 'Saldo Attuale', value: '€0', trend: 'neutral', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { label: 'Budget Rimanente', value: '€0', trend: 'neutral', color: 'text-purple-600', bgColor: 'bg-purple-100' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Tesoreria</h1>
                <p className="text-sm text-muted-foreground">Gestione finanziaria e bilanci del club</p>
              </div>
            </div>
            
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuova Transazione
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Financial Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {financialStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className={`p-2 ${stat.bgColor} rounded-full`}>
                    {stat.trend === 'up' && <TrendingUp className={`w-4 h-4 ${stat.color}`} />}
                    {stat.trend === 'down' && <TrendingDown className={`w-4 h-4 ${stat.color}`} />}
                    {stat.trend === 'neutral' && <DollarSign className={`w-4 h-4 ${stat.color}`} />}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bilancio">Bilancio</TabsTrigger>
            <TabsTrigger value="transazioni">Transazioni</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="report">Report</TabsTrigger>
          </TabsList>

          <TabsContent value="bilancio" className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    Nuova Entrata
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline" size="sm">
                    Registra Entrata
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    Nuova Uscita
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline" size="sm">
                    Registra Uscita
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-blue-600" />
                    Genera Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline" size="sm">
                    Crea Report
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Balance Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Riepilogo Bilancio</CardTitle>
                <CardDescription>
                  Panoramica finanziaria del club
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nessuna transazione registrata</p>
                  <p className="text-sm">Inizia registrando le prime entrate e uscite</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transazioni" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Cerca transazioni..." 
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtri
                  </Button>
                  <Button variant="outline">
                    Esporta
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storico Transazioni</CardTitle>
                <CardDescription>
                  Tutte le entrate e uscite del club
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nessuna transazione trovata</p>
                  <p className="text-sm">Le transazioni appariranno qui</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budget">
            <Card>
              <CardHeader>
                <CardTitle>Gestione Budget</CardTitle>
                <CardDescription>
                  Pianifica e monitora i budget per progetti e attività
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <PieChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Sistema budget in preparazione</p>
                  <p className="text-sm">Strumenti di pianificazione finanziaria in arrivo</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="report">
            <Card>
              <CardHeader>
                <CardTitle>Report Finanziari</CardTitle>
                <CardDescription>
                  Analisi e report dettagliati delle finanze del club
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Report in preparazione</p>
                  <p className="text-sm">Analytics finanziarie in arrivo</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}