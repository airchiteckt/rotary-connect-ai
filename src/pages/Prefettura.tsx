import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Shield, Plus, Search, Filter, ArrowLeft, Calendar, Award, BookOpen, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PrefectureCalendar from '@/components/PrefectureCalendar';
import EventForm from '@/components/EventForm';
import VIPGuestManager from '@/components/VIPGuestManager';
import ProtocolManager from '@/components/ProtocolManager';
import UpcomingCeremonies from '@/components/UpcomingCeremonies';
import EventManager from '@/components/EventManager';
import CeremonyKanban from '@/components/CeremonyKanban';

export default function Prefettura() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('cerimoniale');
  const [showEventForm, setShowEventForm] = useState(false);
  const [showCeremonyForm, setShowCeremonyForm] = useState(false);
  const [stats, setStats] = useState({
    totalEvents: 0,
    ceremonies: 0,
    protocols: 0,
    vipGuests: 0
  });

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      // Load events and ceremonies
      const { data: events } = await supabase
        .from('prefecture_events')
        .select('event_type, ceremony_type');

      // Load protocols
      const { data: protocols } = await supabase
        .from('protocols')
        .select('id');

      // Load VIP guests
      const { data: guests } = await supabase
        .from('vip_guests')
        .select('id')
        .eq('status', 'active');

      const totalEvents = events?.length || 0;
      const ceremonies = events?.filter(e => e.event_type === 'ceremony').length || 0;

      setStats({
        totalEvents,
        ceremonies,
        protocols: protocols?.length || 0,
        vipGuests: guests?.length || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

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
    { label: 'Eventi Organizzati', value: stats.totalEvents, color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Calendar },
    { label: 'Cerimonie', value: stats.ceremonies, color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Award },
    { label: 'Protocolli Attivi', value: stats.protocols, color: 'text-green-600', bgColor: 'bg-green-100', icon: BookOpen },
    { label: 'Ospiti VIP', value: stats.vipGuests, color: 'text-orange-600', bgColor: 'bg-orange-100', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </Button>
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Prefettura</h1>
                <p className="text-sm text-muted-foreground">Cerimoniale, protocollo e organizzazione eventi</p>
              </div>
            </div>
            
            <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuovo Evento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crea Nuovo Evento</DialogTitle>
                  <DialogDescription>Compila i dettagli dell'evento.</DialogDescription>
                </DialogHeader>
                <EventForm 
                  onEventCreated={() => {
                    setShowEventForm(false);
                    loadStats();
                  }}
                  onCancel={() => setShowEventForm(false)}
                />
              </DialogContent>
            </Dialog>
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="cerimoniale">Cerimoniale</TabsTrigger>
            <TabsTrigger value="eventi">Eventi</TabsTrigger>
            <TabsTrigger value="calendario">Calendario</TabsTrigger>
            <TabsTrigger value="protocollo">Protocollo</TabsTrigger>
            <TabsTrigger value="ospiti">Ospiti</TabsTrigger>
          </TabsList>

          <TabsContent value="cerimoniale" className="space-y-6">
            {/* Ceremonial Overview */}
            <Card className="border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  Gestione Cerimonie e Eventi
                </CardTitle>
                <CardDescription>
                  Organizza cerimonie, eventi ufficiali e attività del club
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <Dialog open={showCeremonyForm} onOpenChange={setShowCeremonyForm}>
                    <DialogTrigger asChild>
                      <Button className="flex-1">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuova Cerimonia
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Crea Nuova Cerimonia</DialogTitle>
                        <DialogDescription>Inserisci i dettagli della cerimonia.</DialogDescription>
                      </DialogHeader>
                      <EventForm 
                        presetType="ceremony"
                        onEventCreated={() => {
                          setShowCeremonyForm(false);
                          loadStats();
                        }}
                        onCancel={() => setShowCeremonyForm(false)}
                      />
                    </DialogContent>
                  </Dialog>
                  <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuovo Evento
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Crea Nuovo Evento</DialogTitle>
                        <DialogDescription>Compila i dettagli dell'evento.</DialogDescription>
                      </DialogHeader>
                      <EventForm 
                        onEventCreated={() => {
                          setShowEventForm(false);
                          loadStats();
                        }}
                        onCancel={() => setShowEventForm(false)}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" onClick={() => setActiveTab('protocollo')}>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Protocolli
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Kanban Board for Ceremonies */}
            <CeremonyKanban onStatsUpdate={loadStats} />

            {/* Upcoming Ceremonies List */}
            <UpcomingCeremonies onStatsUpdate={loadStats} />
          </TabsContent>

          <TabsContent value="eventi" className="space-y-6">
            <EventManager onStatsUpdate={loadStats} />
          </TabsContent>

          <TabsContent value="calendario" className="space-y-6">
            <PrefectureCalendar />
          </TabsContent>

          <TabsContent value="protocollo">
            <ProtocolManager />
          </TabsContent>

          <TabsContent value="ospiti">
            <VIPGuestManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}