import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, Award, Crown, UserCheck, Building, User, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SectionResponsible } from '@/components/SectionResponsible';
import MemberManager from '@/components/MemberManager';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SectionPageLayout from '@/components/shared/SectionPageLayout';
import SectionPageHeader from '@/components/shared/SectionPageHeader';
import SectionStatsGrid from '@/components/shared/SectionStatsGrid';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  current_position?: string;
  status: string;
}

export default function Soci() {
  return (
    <SectionPageLayout bgGradient="bg-gradient-to-br from-orange-50 to-red-100">
      {(user) => <SociContent user={user} />}
    </SectionPageLayout>
  );
}

function SociContent({ user }: { user: { id: string } }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('anagrafica');
  const [memberStats, setMemberStats] = useState({ active: 0, honorary: 0, emeritus: 0, guest: 0 });
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const hierarchyLevels: Record<string, { level: number; color: string; icon: React.ElementType }> = {
    'Presidente': { level: 1, color: 'bg-red-600', icon: Crown },
    'Vice Presidente': { level: 2, color: 'bg-orange-600', icon: User },
    'Segretario': { level: 3, color: 'bg-blue-600', icon: UserCheck },
    'Tesoriere': { level: 3, color: 'bg-green-600', icon: UserCheck },
    'Cerimoniere': { level: 4, color: 'bg-purple-600', icon: User },
    'Prefetto': { level: 4, color: 'bg-indigo-600', icon: User },
    'Consigliere': { level: 5, color: 'bg-gray-600', icon: User },
    'Past President': { level: 2, color: 'bg-amber-600', icon: Crown },
    'Socio Attivo': { level: 6, color: 'bg-slate-500', icon: User },
    'Socio Onorario': { level: 6, color: 'bg-teal-600', icon: User },
    'Socio Emerito': { level: 6, color: 'bg-cyan-600', icon: User },
  };

  useEffect(() => { fetchMembersData(); }, [user]);

  const fetchMembersData = async () => {
    try {
      const { data, error } = await supabase.from('members').select('id, first_name, last_name, current_position, status').eq('status', 'active');
      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
      toast({ title: "Errore", description: "Impossibile caricare i dati dell'organigramma.", variant: "destructive" });
    } finally { setLoadingData(false); }
  };

  const occupiedPositions = members.filter(m => m.current_position).length;
  const vacantPositions = Object.keys(hierarchyLevels).length - occupiedPositions;

  const getSortedPositions = () =>
    Object.entries(hierarchyLevels)
      .sort(([, a], [, b]) => a.level - b.level)
      .map(([position, config]) => ({
        position, ...config,
        members: members.filter(m => m.current_position === position),
      }));

  const displayStats = [
    { label: 'Soci Attivi', value: memberStats.active, color: 'text-green-600', bgColor: 'bg-green-100', icon: Users },
    { label: 'Cariche Occupate', value: occupiedPositions, color: 'text-blue-600', bgColor: 'bg-blue-100', icon: UserCheck },
    { label: 'Cariche Vacanti', value: vacantPositions, color: 'text-orange-600', bgColor: 'bg-orange-100', icon: Building },
    { label: 'Soci Onorari', value: memberStats.honorary, color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Award },
  ];

  return (
    <>
      <SectionPageHeader title="Gestione Soci" subtitle="Anagrafica e gestione membri del club" icon={Users} iconColor="bg-orange-600" />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <SectionResponsible section="soci" />
        <SectionStatsGrid stats={displayStats} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex w-auto min-w-full sm:grid sm:grid-cols-4">
              <TabsTrigger value="anagrafica" className="text-xs sm:text-sm">Anagrafica</TabsTrigger>
              <TabsTrigger value="organigramma" className="text-xs sm:text-sm">Organigramma</TabsTrigger>
              <TabsTrigger value="presenze" className="text-xs sm:text-sm">Presenze</TabsTrigger>
              <TabsTrigger value="riconoscimenti" className="text-xs sm:text-sm">Riconoscimenti</TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <TabsContent value="anagrafica" className="space-y-6">
            <MemberManager onStatsUpdate={setMemberStats} />
          </TabsContent>

          <TabsContent value="organigramma" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Struttura Organizzativa</CardTitle>
                <CardDescription>Visualizzazione gerarchica delle cariche del club</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {getSortedPositions().map(({ position, color, icon: Icon, members: posMembers }) => (
                      <div key={position} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg border bg-card gap-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 ${color} rounded-full text-white flex-shrink-0`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm sm:text-base">{position}</h3>
                            <p className="text-xs text-muted-foreground">
                              {posMembers.length > 0 ? `${posMembers.length} persona/e` : 'Posizione vacante'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-wrap ml-11 sm:ml-0">
                          {posMembers.map((m) => (
                            <Badge key={m.id} variant="secondary" className="text-xs">
                              {m.first_name} {m.last_name}
                            </Badge>
                          ))}
                          {posMembers.length === 0 && (
                            <Badge variant="outline" className="text-muted-foreground text-xs">Vacante</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="presenze">
            <Card>
              <CardHeader>
                <CardTitle>Registro Presenze</CardTitle>
                <CardDescription>Traccia le presenze alle riunioni e agli eventi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Sistema presenze in preparazione</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="riconoscimenti">
            <Card>
              <CardHeader>
                <CardTitle>Riconoscimenti e Premi</CardTitle>
                <CardDescription>Gestisci premi, distintivi e riconoscimenti</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Sistema riconoscimenti in arrivo</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
