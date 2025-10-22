import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, ArrowLeft, Calendar, Award } from 'lucide-react';
import HelpSupport from '@/components/HelpSupport';
import { SectionResponsible } from '@/components/SectionResponsible';
import MemberManager from '@/components/MemberManager';

export default function Soci() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Indietro
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                <Users className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Gestione Soci</h1>
                <p className="text-sm text-muted-foreground">Anagrafica e gestione membri del club</p>
              </div>
            </div>
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
            <MemberManager onStatsUpdate={setMemberStats} />
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

      
      {/* Help Support Button */}
      <HelpSupport />
    </div>
  );
}