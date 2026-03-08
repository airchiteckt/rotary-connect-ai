import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Shield, Plus, Calendar, Award, BookOpen, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import PrefectureCalendar from '@/components/PrefectureCalendar';
import EventForm from '@/components/EventForm';
import VIPGuestManager from '@/components/VIPGuestManager';
import ProtocolManager from '@/components/ProtocolManager';
import UpcomingCeremonies from '@/components/UpcomingCeremonies';
import EventManager from '@/components/EventManager';
import CeremonyKanban from '@/components/CeremonyKanban';
import { SectionResponsible } from '@/components/SectionResponsible';
import SectionPageLayout from '@/components/shared/SectionPageLayout';
import SectionPageHeader from '@/components/shared/SectionPageHeader';
import SectionStatsGrid from '@/components/shared/SectionStatsGrid';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export default function Prefettura() {
  return (
    <SectionPageLayout bgGradient="bg-gradient-to-br from-red-50 to-pink-100">
      {(user) => <PrefetturaContent user={user} />}
    </SectionPageLayout>
  );
}

function PrefetturaContent({ user }: { user: { id: string } }) {
  const [activeTab, setActiveTab] = useState('cerimoniale');
  const [showEventForm, setShowEventForm] = useState(false);
  const [showCeremonyForm, setShowCeremonyForm] = useState(false);
  const [stats, setStats] = useState({ totalEvents: 0, ceremonies: 0, protocols: 0, vipGuests: 0 });

  useEffect(() => { loadStats(); }, [user]);

  const loadStats = async () => {
    try {
      const [{ data: events }, { data: protocols }, { data: guests }] = await Promise.all([
        supabase.from('prefecture_events').select('event_type, ceremony_type'),
        supabase.from('protocols').select('id'),
        supabase.from('vip_guests').select('id').eq('status', 'active'),
      ]);
      setStats({
        totalEvents: events?.length || 0,
        ceremonies: events?.filter(e => e.event_type === 'ceremony').length || 0,
        protocols: protocols?.length || 0,
        vipGuests: guests?.length || 0,
      });
    } catch (error) { console.error('Error loading stats:', error); }
  };

  const protocolStats = [
    { label: 'Eventi', value: stats.totalEvents, color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Calendar },
    { label: 'Cerimonie', value: stats.ceremonies, color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Award },
    { label: 'Protocolli', value: stats.protocols, color: 'text-green-600', bgColor: 'bg-green-100', icon: BookOpen },
    { label: 'Ospiti VIP', value: stats.vipGuests, color: 'text-orange-600', bgColor: 'bg-orange-100', icon: Users },
  ];

  return (
    <>
      <SectionPageHeader
        title="Prefettura"
        subtitle="Cerimoniale, protocollo e organizzazione eventi"
        icon={Shield}
        iconColor="bg-red-600"
        actions={
          <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Nuovo Evento</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crea Nuovo Evento</DialogTitle>
                <DialogDescription>Compila i dettagli dell'evento.</DialogDescription>
              </DialogHeader>
              <EventForm onEventCreated={() => { setShowEventForm(false); loadStats(); }} onCancel={() => setShowEventForm(false)} />
            </DialogContent>
          </Dialog>
        }
      />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <SectionResponsible section="prefettura" />
        <SectionStatsGrid stats={protocolStats} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex w-auto min-w-full sm:grid sm:grid-cols-5">
              <TabsTrigger value="cerimoniale" className="text-xs sm:text-sm">Cerimoniale</TabsTrigger>
              <TabsTrigger value="eventi" className="text-xs sm:text-sm">Eventi</TabsTrigger>
              <TabsTrigger value="calendario" className="text-xs sm:text-sm">Calendario</TabsTrigger>
              <TabsTrigger value="protocollo" className="text-xs sm:text-sm">Protocollo</TabsTrigger>
              <TabsTrigger value="ospiti" className="text-xs sm:text-sm">Ospiti</TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <TabsContent value="cerimoniale" className="space-y-4 sm:space-y-6">
            <Card className="border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Shield className="w-5 h-5 text-red-600" />
                  Gestione Cerimonie e Eventi
                </CardTitle>
                <CardDescription>Organizza cerimonie, eventi ufficiali e attività</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Dialog open={showCeremonyForm} onOpenChange={setShowCeremonyForm}>
                    <DialogTrigger asChild>
                      <Button className="flex-1" size="sm"><Plus className="w-4 h-4 mr-2" />Nuova Cerimonia</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Crea Nuova Cerimonia</DialogTitle>
                        <DialogDescription>Inserisci i dettagli della cerimonia.</DialogDescription>
                      </DialogHeader>
                      <EventForm presetType="ceremony" onEventCreated={() => { setShowCeremonyForm(false); loadStats(); }} onCancel={() => setShowCeremonyForm(false)} />
                    </DialogContent>
                  </Dialog>
                  <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1" size="sm"><Plus className="w-4 h-4 mr-2" />Nuovo Evento</Button>
                    </DialogTrigger>
                  </Dialog>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setActiveTab('protocollo')}>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Protocolli
                  </Button>
                </div>
              </CardContent>
            </Card>
            <CeremonyKanban onStatsUpdate={loadStats} />
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
    </>
  );
}
