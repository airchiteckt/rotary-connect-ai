import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Building, Plus, Search, Filter, ArrowLeft, Users, FileText, Calendar, Vote } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { CommissionManager } from '@/components/CommissionManager';
import { BoardMeetingManager } from '@/components/BoardMeetingManager';
import { BoardResolutionManager } from '@/components/BoardResolutionManager';

export default function Direttivo() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('riunioni');
  const [boardMembers, setBoardMembers] = useState<Record<string, any>>({});
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [stats, setStats] = useState({
    boardMembers: 0,
    meetings: 0,
    resolutions: 0,
    commissions: 0
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

  useEffect(() => {
    loadBoardMembers();
    loadStats();
  }, [user]);

  const loadStats = async () => {
    if (!user) return;
    
    try {
      // Get commissions count
      const { data: commissions, error: commissionsError } = await supabase
        .from('commissions')
        .select('id');

      if (commissionsError) throw commissionsError;

      setStats(prev => ({
        ...prev,
        commissions: commissions?.length || 0
      }));
    } catch (error) {
      console.error('Errore nel caricamento statistiche:', error);
    }
  };

  const loadBoardMembers = async () => {
    if (!user) return;
    
    try {
      setLoadingMembers(true);
      const { data: members, error } = await supabase
        .from('members')
        .select('*')
        .not('current_position', 'is', null);

      if (error) throw error;

      // Group members by position
      const membersByPosition: Record<string, any> = {};
      members?.forEach(member => {
        if (member.current_position) {
          membersByPosition[member.current_position] = member;
        }
      });

      setBoardMembers(membersByPosition);
      setStats(prev => ({
        ...prev,
        boardMembers: Object.keys(membersByPosition).length
      }));
    } catch (error) {
      console.error('Errore nel caricamento membri direttivo:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const boardStats = [
    { label: 'Membri Direttivo', value: stats.boardMembers, color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Users },
    { label: 'Riunioni Mensili', value: stats.meetings, color: 'text-green-600', bgColor: 'bg-green-100', icon: Calendar },
    { label: 'Delibere', value: stats.resolutions, color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Vote },
    { label: 'Commissioni', value: stats.commissions, color: 'text-orange-600', bgColor: 'bg-orange-100', icon: Building }
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
            <BoardMeetingManager />
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
              {['Presidente', 'Vice Presidente', 'Segretario', 'Tesoriere', 'Prefetto', 'Consigliere'].map((position) => {
                const assignedMember = boardMembers[position];
                return (
                  <Card key={position}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">{position}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {loadingMembers ? (
                          <p className="text-sm text-muted-foreground">Caricamento...</p>
                        ) : assignedMember ? (
                          <div>
                            <p className="text-sm font-medium">{assignedMember.first_name} {assignedMember.last_name}</p>
                            <p className="text-xs text-muted-foreground">{assignedMember.email}</p>
                            <Badge variant="secondary" className="text-xs mt-1">Assegnato</Badge>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Non assegnato</p>
                        )}
                        <Button size="sm" className="w-full" variant={assignedMember ? "outline" : "default"}>
                          {assignedMember ? 'Modifica' : 'Assegna'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Membri del Direttivo</CardTitle>
                <CardDescription>
                  Elenco dei membri del consiglio direttivo
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingMembers ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Caricamento membri...</p>
                  </div>
                ) : Object.keys(boardMembers).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(boardMembers).map(([position, member]) => (
                      <div key={position} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{member.first_name} {member.last_name}</p>
                            <p className="text-sm text-muted-foreground">{position}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">{member.email}</p>
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

          <TabsContent value="commissioni">
            <CommissionManager />
          </TabsContent>

          <TabsContent value="delibere">
            <BoardResolutionManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}