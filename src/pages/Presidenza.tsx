import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Crown, Plus, Target, Users, Calendar, FileText, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import PresidencyKanban from '@/components/PresidencyKanban';
import ProjectForm from '@/components/ProjectForm';
import { SectionResponsible } from '@/components/SectionResponsible';
import GoalsMilestonesManager from '@/components/GoalsMilestonesManager';
import PresidencyNotes from '@/components/PresidencyNotes';
import SectionPageLayout from '@/components/shared/SectionPageLayout';
import SectionPageHeader from '@/components/shared/SectionPageHeader';
import SectionStatsGrid from '@/components/shared/SectionStatsGrid';

export default function Presidenza() {
  return (
    <SectionPageLayout bgGradient="bg-gradient-to-br from-amber-50 to-yellow-100">
      {(user) => <PresidenzaContent user={user} />}
    </SectionPageLayout>
  );
}

function PresidenzaContent({ user }: { user: { id: string } }) {
  const [activeTab, setActiveTab] = useState('progetti');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [stats, setStats] = useState({ totalProjects: 0, activeProjects: 0, completedProjects: 0, ideaProjects: 0 });

  useEffect(() => { loadStats(); }, [user]);

  const loadStats = async () => {
    try {
      const { data: projects } = await supabase.from('presidency_projects').select('status');
      setStats({
        totalProjects: projects?.length || 0,
        activeProjects: projects?.filter(p => p.status === 'organized' || p.status === 'to_organize').length || 0,
        completedProjects: projects?.filter(p => p.status === 'completed').length || 0,
        ideaProjects: projects?.filter(p => p.status === 'ideas').length || 0,
      });
    } catch (error) { console.error('Error loading stats:', error); }
  };

  const presidentialStats = [
    { label: 'Progetti Totali', value: stats.totalProjects, color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Target },
    { label: 'Progetti Attivi', value: stats.activeProjects, color: 'text-green-600', bgColor: 'bg-green-100', icon: Calendar },
    { label: 'Completati', value: stats.completedProjects, color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Users },
    { label: 'Nuove Idee', value: stats.ideaProjects, color: 'text-orange-600', bgColor: 'bg-orange-100', icon: FileText },
  ];

  return (
    <>
      <SectionPageHeader
        title="Presidenza"
        subtitle="Strumenti per la governance e coordinamento del club"
        icon={Crown}
        iconColor="bg-amber-600"
        actions={
          <Dialog open={showProjectForm} onOpenChange={setShowProjectForm}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Nuovo Progetto</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crea Nuovo Progetto</DialogTitle>
                <DialogDescription>Inserisci i dettagli del nuovo progetto presidenziale.</DialogDescription>
              </DialogHeader>
              <ProjectForm onProjectCreated={() => { setShowProjectForm(false); loadStats(); }} onCancel={() => setShowProjectForm(false)} />
            </DialogContent>
          </Dialog>
        }
      />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <SectionResponsible section="presidenza" />
        <SectionStatsGrid stats={presidentialStats} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="progetti" className="text-xs sm:text-sm">Progetti</TabsTrigger>
            <TabsTrigger value="pianificazione" className="text-xs sm:text-sm">Pianificazione</TabsTrigger>
          </TabsList>

          <TabsContent value="progetti" className="space-y-4 sm:space-y-6">
            <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Target className="w-5 h-5 text-amber-600" />
                  Gestione Progetti
                </CardTitle>
                <CardDescription>Monitora e coordina tutti i progetti del club</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Dialog open={showProjectForm} onOpenChange={setShowProjectForm}>
                    <DialogTrigger asChild>
                      <Button className="flex-1" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuovo Progetto
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Search className="w-4 h-4 mr-2" />
                    Visualizza Kanban
                  </Button>
                </div>
              </CardContent>
            </Card>
            <PresidencyKanban onStatsUpdate={loadStats} />
          </TabsContent>

          <TabsContent value="pianificazione" className="space-y-4 sm:space-y-6">
            <GoalsMilestonesManager />
            <PresidencyNotes />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
