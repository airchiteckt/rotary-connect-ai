import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CeremonyStatsProps {
  stats: {
    totalEvents: number;
    ceremonies: number;
    protocols: number;
    vipGuests: number;
  };
  onCreateCeremony: () => void;
}

export default function CeremonyStats({ stats, onCreateCeremony }: CeremonyStatsProps) {
  const { user } = useAuth();
  const [ceremonyStats, setCeremonyStats] = useState({
    insediamenti: 0,
    premiazioni: 0,
    ammissioni: 0
  });

  useEffect(() => {
    if (user) {
      loadCeremonyStats();
    }
  }, [user, stats.ceremonies]);

  const loadCeremonyStats = async () => {
    if (!user) return;

    try {
      const { data: ceremonies } = await supabase
        .from('prefecture_events')
        .select('ceremony_type')
        .eq('event_type', 'ceremony');

      const statsCount = {
        insediamenti: ceremonies?.filter(c => c.ceremony_type === 'insediamento').length || 0,
        premiazioni: ceremonies?.filter(c => c.ceremony_type === 'premiazione').length || 0,
        ammissioni: ceremonies?.filter(c => c.ceremony_type === 'ammissione').length || 0
      };

      setCeremonyStats(statsCount);
    } catch (error) {
      console.error('Error loading ceremony stats:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Insediamenti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-2xl font-bold">{ceremonyStats.insediamenti}</p>
            <p className="text-xs text-muted-foreground">Programmati</p>
            <Button size="sm" className="w-full" onClick={onCreateCeremony}>
              Organizza
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Premiazioni</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-2xl font-bold">{ceremonyStats.premiazioni}</p>
            <p className="text-xs text-muted-foreground">In programma</p>
            <Button size="sm" className="w-full" onClick={onCreateCeremony}>
              Pianifica
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Ammissioni</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-2xl font-bold">{ceremonyStats.ammissioni}</p>
            <p className="text-xs text-muted-foreground">Pendenti</p>
            <Button size="sm" className="w-full" onClick={onCreateCeremony}>
              Gestisci
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}