import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Building, Plus, Search, Filter, Users, Calendar, Vote } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { BoardMeetingManager } from '@/components/BoardMeetingManager';
import { BoardResolutionManager } from '@/components/BoardResolutionManager';
import { SectionResponsible } from '@/components/SectionResponsible';
import SectionPageLayout from '@/components/shared/SectionPageLayout';
import SectionPageHeader from '@/components/shared/SectionPageHeader';
import SectionStatsGrid from '@/components/shared/SectionStatsGrid';

export default function Direttivo() {
  return (
    <SectionPageLayout bgGradient="bg-gradient-to-br from-indigo-50 to-blue-100">
      {(user) => <DirettivoContent user={user} />}
    </SectionPageLayout>
  );
}

function DirettivoContent({ user }: { user: { id: string } }) {
  const [activeTab, setActiveTab] = useState('riunioni');
  const [boardMembers, setBoardMembers] = useState<Record<string, any>>({});
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [stats, setStats] = useState({ boardMembers: 0, meetings: 0, resolutions: 0, commissions: 0 });

  useEffect(() => {
    loadBoardMembers();
    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      const [{ data: commissions }, { data: events }, { data: docs }] = await Promise.all([
        supabase.from('commissions').select('id'),
        supabase.from('prefecture_events').select('id').eq('event_type', 'meeting'),
        supabase.from('documents').select('id').eq('type', 'verbali'),
      ]);
      setStats(prev => ({
        ...prev,
        commissions: commissions?.length || 0,
        meetings: events?.length || 0,
        resolutions: docs?.length || 0,
      }));
    } catch (error) { console.error('Errore nel caricamento statistiche:', error); }
  };

  const loadBoardMembers = async () => {
    try {
      setLoadingMembers(true);
      const { data: members, error } = await supabase.from('members').select('*').not('current_position', 'is', null);
      if (error) throw error;
      const membersByPosition: Record<string, any> = {};
      members?.forEach(m => { if (m.current_position) membersByPosition[m.current_position] = m; });
      setBoardMembers(membersByPosition);
      setStats(prev => ({ ...prev, boardMembers: Object.keys(membersByPosition).length }));
    } catch (error) { console.error('Errore nel caricamento membri direttivo:', error); }
    finally { setLoadingMembers(false); }
  };

  const boardStats = [
    { label: 'Membri Direttivo', value: stats.boardMembers, color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Users },
    { label: 'Riunioni', value: stats.meetings, color: 'text-green-600', bgColor: 'bg-green-100', icon: Calendar },
    { label: 'Delibere', value: stats.resolutions, color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Vote },
    { label: 'Commissioni', value: stats.commissions, color: 'text-orange-600', bgColor: 'bg-orange-100', icon: Building },
  ];

  const positions = ['Presidente', 'Vice Presidente', 'Segretario', 'Tesoriere', 'Prefetto', 'Consigliere'];

  return (
    <>
      <SectionPageHeader
        title="Consiglio Direttivo"
        subtitle="Coordinamento direttivo e commissioni"
        icon={Building}
        iconColor="bg-indigo-600"
        actions={
          <Button size="sm">
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Nuova Riunione</span>
          </Button>
        }
      />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <SectionResponsible section="direttivo" />
        <SectionStatsGrid stats={boardStats} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="riunioni" className="text-xs sm:text-sm">Riunioni</TabsTrigger>
            <TabsTrigger value="membri" className="text-xs sm:text-sm">Membri</TabsTrigger>
            <TabsTrigger value="delibere" className="text-xs sm:text-sm">Delibere</TabsTrigger>
          </TabsList>

          <TabsContent value="riunioni" className="space-y-6">
            <BoardMeetingManager />
          </TabsContent>

          <TabsContent value="membri" className="space-y-4 sm:space-y-6">
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Cerca membri del direttivo..." className="pl-10" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" />Filtri</Button>
                    <Button size="sm"><Plus className="w-4 h-4 mr-2" />Aggiungi</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {positions.map((position) => {
                const member = boardMembers[position];
                return (
                  <Card key={position}>
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="text-sm">{position}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingMembers ? (
                        <p className="text-sm text-muted-foreground">Caricamento...</p>
                      ) : member ? (
                        <div>
                          <p className="text-sm font-medium">{member.first_name} {member.last_name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                          <Badge variant="secondary" className="text-xs mt-1">Assegnato</Badge>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Non assegnato</p>
                      )}
                      <Button size="sm" className="w-full mt-2" variant={member ? "outline" : "default"}>
                        {member ? 'Modifica' : 'Assegna'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Membri del Direttivo</CardTitle>
                <CardDescription>Elenco dei membri del consiglio direttivo</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingMembers ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                  </div>
                ) : Object.keys(boardMembers).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(boardMembers).map(([position, member]) => (
                      <div key={position} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{member.first_name} {member.last_name}</p>
                            <p className="text-xs text-muted-foreground">{position}</p>
                          </div>
                        </div>
                        <div className="sm:text-right">
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                          <Badge variant="secondary" className="text-xs">
                            Dal {new Date(member.membership_start_date).toLocaleDateString('it-IT')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nessun membro assegnato</p>
                    <p className="text-sm">Inizia assegnando i ruoli del direttivo</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delibere">
            <BoardResolutionManager />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
