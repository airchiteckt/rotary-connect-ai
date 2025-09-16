import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Search, ArrowLeft, Crown, UserCheck, Building, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  current_position?: string;
  status: string;
}

interface PositionStats {
  total_positions: number;
  occupied_positions: number;
  vacant_positions: number;
}

export default function Organigramma() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('struttura');
  const [members, setMembers] = useState<Member[]>([]);
  const [positionStats, setPositionStats] = useState<PositionStats>({
    total_positions: 0,
    occupied_positions: 0,
    vacant_positions: 0
  });
  const [loadingData, setLoadingData] = useState(true);

  const hierarchyLevels = {
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
    'Socio Emerito': { level: 6, color: 'bg-cyan-600', icon: User }
  };

  const fetchMembersData = async () => {
    if (!user) return;

    try {
      const { data: membersData, error } = await supabase
        .from('members')
        .select('id, first_name, last_name, current_position, status')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (error) throw error;

      setMembers(membersData || []);

      // Calculate position statistics
      const totalPositions = Object.keys(hierarchyLevels).length;
      const occupiedPositions = membersData?.filter(m => m.current_position).length || 0;
      const vacantPositions = totalPositions - occupiedPositions;

      setPositionStats({
        total_positions: totalPositions,
        occupied_positions: occupiedPositions,
        vacant_positions: vacantPositions
      });

    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i dati dell'organigramma.",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchMembersData();
  }, [user]);

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

  const getPositionMembers = (position: string) => {
    return members.filter(member => member.current_position === position);
  };

  const getSortedPositions = () => {
    return Object.entries(hierarchyLevels)
      .sort(([,a], [,b]) => a.level - b.level)
      .map(([position, config]) => ({
        position,
        ...config,
        members: getPositionMembers(position)
      }));
  };

  const organigraphyStats = [
    { 
      label: 'Cariche Totali', 
      value: positionStats.total_positions, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100',
      icon: Building
    },
    { 
      label: 'Cariche Occupate', 
      value: positionStats.occupied_positions, 
      color: 'text-green-600', 
      bgColor: 'bg-green-100',
      icon: UserCheck
    },
    { 
      label: 'Cariche Vacanti', 
      value: positionStats.vacant_positions, 
      color: 'text-orange-600', 
      bgColor: 'bg-orange-100',
      icon: User
    },
    { 
      label: 'Soci Attivi', 
      value: members.length, 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-100',
      icon: Users
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Organigramma</h1>
                <p className="text-sm text-muted-foreground">Struttura sociale e organizzativa del club</p>
              </div>
            </div>
            
            <Button onClick={() => navigate('/soci')}>
              <Plus className="w-4 h-4 mr-2" />
              Gestisci Soci
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {organigraphyStats.map((stat, index) => (
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="struttura">Struttura</TabsTrigger>
            <TabsTrigger value="cariche">Cariche</TabsTrigger>
            <TabsTrigger value="cronologia">Cronologia</TabsTrigger>
          </TabsList>

          <TabsContent value="struttura" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Struttura Organizzativa</CardTitle>
                <CardDescription>
                  Visualizzazione gerarchica delle cariche del club
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Caricamento struttura...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {getSortedPositions().map(({ position, color, icon: Icon, members }) => (
                      <div key={position} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 ${color} rounded-full text-white`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{position}</h3>
                            <p className="text-sm text-muted-foreground">
                              {members.length > 0 ? 
                                `${members.length} persona/e` : 
                                'Posizione vacante'
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {members.map((member) => (
                            <Badge key={member.id} variant="secondary">
                              {member.first_name} {member.last_name}
                            </Badge>
                          ))}
                          {members.length === 0 && (
                            <Badge variant="outline" className="text-muted-foreground">
                              Vacante
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cariche" className="space-y-6">
            {/* Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Cerca per nome o carica..." 
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dettaglio Cariche</CardTitle>
                <CardDescription>
                  Elenco completo dei soci e relative cariche
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Caricamento...</p>
                  </div>
                ) : members.length > 0 ? (
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium">{member.first_name} {member.last_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {member.current_position || 'Nessuna carica assegnata'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {member.current_position && (
                            <Badge 
                              className={`${hierarchyLevels[member.current_position as keyof typeof hierarchyLevels]?.color || 'bg-gray-600'} text-white`}
                            >
                              {member.current_position}
                            </Badge>
                          )}
                          <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                            {member.status === 'active' ? 'Attivo' : member.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nessun socio trovato</p>
                    <p className="text-sm">Aggiungi i primi soci dalla sezione Soci</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cronologia">
            <Card>
              <CardHeader>
                <CardTitle>Cronologia Cariche</CardTitle>
                <CardDescription>
                  Storico delle assegnazioni e cambiamenti di carica
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Cronologia in preparazione</p>
                  <p className="text-sm">Lo storico delle cariche sarà disponibile a breve</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}