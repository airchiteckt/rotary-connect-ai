import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CommissionForm } from './CommissionForm';
import { Tables } from "@/integrations/supabase/types";

type Commission = Tables<"commissions">;
type Project = Tables<"presidency_projects">;

export const CommissionManager = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState<Commission | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [commissionsResult, projectsResult] = await Promise.all([
        supabase
          .from('commissions')
          .select('*')
          .eq('user_id', user.id)
          .order('name'),
        supabase
          .from('presidency_projects')
          .select('*')
          .eq('user_id', user.id)
          .not('commission_id', 'is', null)
      ]);

      if (commissionsResult.data) setCommissions(commissionsResult.data);
      if (projectsResult.data) setProjects(projectsResult.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento dei dati",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (commission: Commission) => {
    if (!confirm(`Sei sicuro di voler eliminare la commissione "${commission.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('commissions')
        .delete()
        .eq('id', commission.id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Commissione eliminata correttamente",
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting commission:', error);
      toast({
        title: "Errore",
        description: "Errore nell'eliminazione della commissione",
        variant: "destructive",
      });
    }
  };

  const getCommissionProjects = (commissionId: string) => {
    return projects.filter(project => project.commission_id === commissionId);
  };

  if (isLoading) {
    return <div>Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Commissioni</h2>
          <p className="text-muted-foreground">
            Gestisci le commissioni e visualizza i progetti assegnati
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedCommission(undefined);
            setShowForm(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuova Commissione
        </Button>
      </div>

      {commissions.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Non ci sono commissioni create. Crea la tua prima commissione!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {commissions.map((commission) => {
            const commissionProjects = getCommissionProjects(commission.id);
            return (
              <Card key={commission.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {commission.name}
                        <Badge variant="secondary">
                          {commissionProjects.length} progetti
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Responsabile: {commission.responsible_person}
                      </p>
                      {commission.description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {commission.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCommission(commission);
                          setShowForm(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(commission)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {commissionProjects.length > 0 && (
                  <CardContent>
                    <h4 className="font-medium mb-3">Progetti Assegnati:</h4>
                    <div className="space-y-2">
                      {commissionProjects.map((project) => (
                        <div
                          key={project.id}
                          className="flex justify-between items-center p-3 bg-muted rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{project.title}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline">{project.status}</Badge>
                              {project.priority && (
                                <Badge
                                  variant={
                                    project.priority === 'high'
                                      ? 'destructive'
                                      : project.priority === 'medium'
                                      ? 'default'
                                      : 'secondary'
                                  }
                                >
                                  {project.priority}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {project.progress !== null && (
                            <div className="text-sm text-muted-foreground">
                              {project.progress}% completato
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <CommissionForm
        open={showForm}
        onOpenChange={setShowForm}
        commission={selectedCommission}
        onSuccess={fetchData}
      />
    </div>
  );
};