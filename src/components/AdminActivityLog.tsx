import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Activity, RotateCcw, Eye, Trash2, Edit, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ActivityLog {
  id: string;
  admin_id: string;
  action_type: string;
  table_name: string;
  record_id: string;
  old_data: any;
  new_data: any;
  created_at: string;
}

interface DataSnapshot {
  id: string;
  table_name: string;
  record_id: string;
  snapshot_data: any;
  created_at: string;
}

const TABLE_LABELS: Record<string, string> = {
  members: 'Soci',
  transactions: 'Transazioni',
  documents: 'Documenti',
  budgets: 'Budget',
  commissions: 'Commissioni',
  prefecture_events: 'Eventi Prefettura',
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
  INSERT: <Plus className="w-4 h-4 text-green-500" />,
  UPDATE: <Edit className="w-4 h-4 text-blue-500" />,
  DELETE: <Trash2 className="w-4 h-4 text-red-500" />,
};

export function AdminActivityLog() {
  const { user, profile } = useAuth();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [snapshots, setSnapshots] = useState<DataSnapshot[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      loadActivities();
      loadSnapshots();
    }
  }, [user, profile]);

  const loadActivities = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('admin_activity_log')
      .select('*')
      .eq('club_owner_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error loading activities:', error);
      return;
    }

    setActivities(data || []);
  };

  const loadSnapshots = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('data_snapshots')
      .select('*')
      .eq('club_owner_id', user.id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading snapshots:', error);
      return;
    }

    setSnapshots(data || []);
  };

  const handleRestore = async (snapshot: DataSnapshot) => {
    if (!user) return;

    const confirmed = window.confirm(
      `Sei sicuro di voler ripristinare questo record dalla tabella ${TABLE_LABELS[snapshot.table_name] || snapshot.table_name}?`
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      // Cast table_name to 'any' to bypass TypeScript strict checking for dynamic table names
      const tableName = snapshot.table_name as any;
      
      const { error } = await supabase
        .from(tableName)
        .update(snapshot.snapshot_data)
        .eq('id', snapshot.record_id);

      if (error) throw error;

      toast.success('Dati ripristinati con successo');
      loadActivities();
    } catch (error) {
      console.error('Error restoring data:', error);
      toast.error('Errore nel ripristino dei dati');
    } finally {
      setLoading(false);
    }
  };

  const showDetails = (activity: ActivityLog) => {
    setSelectedActivity(activity);
    setDetailsOpen(true);
  };

  const getActionBadge = (action: string) => {
    const variants = {
      INSERT: 'default' as const,
      UPDATE: 'secondary' as const,
      DELETE: 'destructive' as const,
    };

    return (
      <Badge variant={variants[action] || 'default'}>
        {action === 'INSERT' ? 'Creazione' : action === 'UPDATE' ? 'Modifica' : 'Eliminazione'}
      </Badge>
    );
  };

  const cleanupOldSnapshots = async () => {
    try {
      const { error } = await supabase.rpc('cleanup_old_snapshots');
      
      if (error) throw error;

      toast.success('Pulizia completata');
      loadSnapshots();
    } catch (error) {
      console.error('Error cleaning up:', error);
      toast.error('Errore nella pulizia');
    }
  };

  if (profile?.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Log Attività Admin
            </CardTitle>
            <Button onClick={cleanupOldSnapshots} variant="outline" size="sm">
              Pulisci Vecchi Backup
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Ora</TableHead>
                  <TableHead>Azione</TableHead>
                  <TableHead>Tabella</TableHead>
                  <TableHead>Dettagli</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="text-sm">
                      {format(new Date(activity.created_at), "dd/MM/yyyy HH:mm:ss", { locale: it })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {ACTION_ICONS[activity.action_type]}
                        {getActionBadge(activity.action_type)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {TABLE_LABELS[activity.table_name] || activity.table_name}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => showDetails(activity)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            Backup Dati (Ultimi 24 ore)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Ora</TableHead>
                  <TableHead>Tabella</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {snapshots.map((snapshot) => (
                  <TableRow key={snapshot.id}>
                    <TableCell className="text-sm">
                      {format(new Date(snapshot.created_at), "dd/MM/yyyy HH:mm:ss", { locale: it })}
                    </TableCell>
                    <TableCell>
                      {TABLE_LABELS[snapshot.table_name] || snapshot.table_name}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(snapshot)}
                        disabled={loading}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Ripristina
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {snapshots.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Nessun backup disponibile
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Dettagli Attività</DialogTitle>
            <DialogDescription>
              Visualizza i dettagli completi dell'operazione
            </DialogDescription>
          </DialogHeader>
          {selectedActivity && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold">Data/Ora:</p>
                  <p className="text-sm">
                    {format(new Date(selectedActivity.created_at), "dd/MM/yyyy HH:mm:ss", { locale: it })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Azione:</p>
                  {getActionBadge(selectedActivity.action_type)}
                </div>
                <div>
                  <p className="text-sm font-semibold">Tabella:</p>
                  <p className="text-sm">
                    {TABLE_LABELS[selectedActivity.table_name] || selectedActivity.table_name}
                  </p>
                </div>
              </div>

              {selectedActivity.old_data && (
                <div>
                  <p className="text-sm font-semibold mb-2">Dati Precedenti:</p>
                  <ScrollArea className="h-48 rounded border p-4">
                    <pre className="text-xs">
                      {JSON.stringify(selectedActivity.old_data, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}

              {selectedActivity.new_data && (
                <div>
                  <p className="text-sm font-semibold mb-2">Nuovi Dati:</p>
                  <ScrollArea className="h-48 rounded border p-4">
                    <pre className="text-xs">
                      {JSON.stringify(selectedActivity.new_data, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
