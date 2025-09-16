import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Plus, Search, Filter, ArrowLeft, Image, Share2, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FlyerGenerator } from '@/components/FlyerGenerator';
import { useComingSoonToast } from '@/components/ComingSoonToast';
import HelpSupport from '@/components/HelpSupport';

export default function Comunicazione() {
  const { user, loading } = useAuth();
  const { showComingSoon } = useComingSoonToast();
  const [activeTab, setActiveTab] = useState('locandine');

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

  const communicationTools = [
    { 
      id: 'locandine', 
      name: 'Generatore Locandine AI', 
      description: 'Crea locandine professionali con intelligenza artificiale',
      count: 0, 
      color: 'bg-purple-100 text-purple-800',
      icon: Image
    },
    { 
      id: 'social', 
      name: 'Social Media', 
      description: 'Gestisci i post per Facebook, Instagram e LinkedIn',
      count: 0, 
      color: 'bg-blue-100 text-blue-800',
      icon: Share2
    },
    { 
      id: 'newsletter', 
      name: 'Newsletter', 
      description: 'Crea e invia newsletter ai membri del club',
      count: 0, 
      color: 'bg-green-100 text-green-800',
      icon: Megaphone
    },
    { 
      id: 'eventi', 
      name: 'Comunicazione Eventi', 
      description: 'Promuovi eventi e attività del club',
      count: 0, 
      color: 'bg-orange-100 text-orange-800',
      icon: Calendar
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Comunicazione</h1>
                <p className="text-sm text-muted-foreground">Strumenti per comunicazione e marketing del club</p>
              </div>
            </div>
            
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuova Campagna
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="locandine">Locandine AI</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="locandine" className="space-y-6">
            <FlyerGenerator />
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            {/* Social Media Tools */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Facebook</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground">Post pubblicati</p>
                    <Button size="sm" className="w-full">Gestisci</Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Instagram</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground">Stories create</p>
                    <Button size="sm" className="w-full">Gestisci</Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">LinkedIn</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground">Articoli scritti</p>
                    <Button size="sm" className="w-full">Gestisci</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Calendario Pubblicazioni</CardTitle>
                <CardDescription>
                  Pianifica i tuoi contenuti social
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground cursor-pointer hover:bg-muted/50 rounded-lg transition-colors" onClick={() => showComingSoon("Calendario Social", "Presto potrai pianificare i tuoi post sui social media")}>
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Calendario social in preparazione</p>
                  <p className="text-sm">Presto potrai pianificare i tuoi post</p>
                  <Button variant="outline" className="mt-4">Clicca per info</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="newsletter">
            <Card>
              <CardHeader>
                <CardTitle>Newsletter e Comunicazioni</CardTitle>
                <CardDescription>
                  Crea e invia newsletter ai membri del club
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground cursor-pointer hover:bg-muted/50 rounded-lg transition-colors" onClick={() => showComingSoon("Sistema Newsletter", "Strumenti di email marketing per comunicare con i soci")}>
                  <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Sistema newsletter in arrivo</p>
                  <p className="text-sm">Strumenti di email marketing in preparazione</p>
                  <Button variant="outline" className="mt-4">Clicca per info</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics e Metriche</CardTitle>
                <CardDescription>
                  Monitora le performance delle tue comunicazioni
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground cursor-pointer hover:bg-muted/50 rounded-lg transition-colors" onClick={() => showComingSoon("Analytics Comunicazione", "Metriche di performance per i tuoi contenuti")}>
                  <Share2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Analytics in preparazione</p>
                  <p className="text-sm">Le metriche di performance appariranno qui</p>
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