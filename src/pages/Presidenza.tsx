import { useState, useEffect } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Crown, Plus, ArrowLeft, Target, Users, Calendar, Search, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PresidencyKanban from '@/components/PresidencyKanban';
import ProjectForm from '@/components/ProjectForm';
import { SectionResponsible } from '@/components/SectionResponsible';
import GoalsMilestonesManager from '@/components/GoalsMilestonesManager';
import PresidencyNotes from '@/components/PresidencyNotes';
import { CommissionManager } from '@/components/CommissionManager';

export default function Presidenza() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('progetti');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    ideaProjects: 0
  });

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      // Load projects
      const { data: projects } = await supabase
        .from('presidency_projects')
        .select('status');

      const totalProjects = projects?.length || 0;
      const activeProjects = projects?.filter(p => p.status === 'organized' || p.status === 'to_organize').length || 0;
      const completedProjects = projects?.filter(p => p.status === 'completed').length || 0;
      const ideaProjects = projects?.filter(p => p.status === 'ideas').length || 0;

      setStats({
        totalProjects,
        activeProjects,
        completedProjects,
        ideaProjects
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

  const presidentialStats = [
    { label: 'Progetti Totali', value: stats.totalProjects, color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Target },
    { label: 'Progetti Attivi', value: stats.activeProjects, color: 'text-green-600', bgColor: 'bg-green-100', icon: Calendar },
    { label: 'Completati', value: stats.completedProjects, color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Users },
    { label: 'Nuove Idee', value: stats.ideaProjects, color: 'text-orange-600', bgColor: 'bg-orange-100', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100">
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
              <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Presidenza</h1>
                <p className="text-sm text-muted-foreground">Strumenti per la governance e coordinamento del club</p>
              </div>
            </div>
            
            <Dialog open={showProjectForm} onOpenChange={setShowProjectForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuovo Progetto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crea Nuovo Progetto</DialogTitle>
                  <DialogDescription>Inserisci i dettagli del nuovo progetto presidenziale.</DialogDescription>
                </DialogHeader>
                <ProjectForm 
                  onProjectCreated={() => {
                    setShowProjectForm(false);
                    loadStats();
                  }}
                  onCancel={() => setShowProjectForm(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <SectionResponsible section="presidenza" />
        
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="progetti">Progetti</TabsTrigger>
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
                  <Dialog open={showProjectForm} onOpenChange={setShowProjectForm}>
                    <DialogTrigger asChild>
                      <Button className="flex-1">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuovo Progetto
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                  <Button variant="outline" onClick={() => setActiveTab('progetti')}>
                    <Search className="w-4 h-4 mr-2" />
                    Visualizza Kanban
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Kanban Board for Projects */}
            <PresidencyKanban onStatsUpdate={loadStats} />
          </TabsContent>

          <TabsContent value="pianificazione" className="space-y-6">
            <GoalsMilestonesManager />
            <PresidencyNotes />
          </TabsContent>

          <TabsContent value="commissioni">
            <CommissionManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}