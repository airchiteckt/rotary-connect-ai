import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface DashboardStats {
  activeMembers: number;
  projects: number;
  events: number;
  commissions: number;
  upcomingEvents: number;
}

export function useDashboardStats(user: User | null) {
  const [stats, setStats] = useState<DashboardStats>({
    activeMembers: 0,
    projects: 0,
    events: 0,
    commissions: 0,
    upcomingEvents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadStats();
  }, [user]);

  const loadStats = async () => {
    if (!user) return;
    try {
      setLoading(true);

      const { data: ownerIdData } = await supabase.rpc('get_club_owner_id', {
        user_uuid: user.id,
      });
      const clubOwnerId = ownerIdData || user.id;

      const [membersRes, projectsRes, eventsRes, commissionsRes] = await Promise.all([
        supabase
          .from('members')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', clubOwnerId)
          .eq('status', 'active'),
        supabase
          .from('presidency_projects')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', clubOwnerId),
        supabase
          .from('prefecture_events')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', clubOwnerId),
        supabase
          .from('commissions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', clubOwnerId),
      ]);

      // Monthly events calculation
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      const { count: prefectureMonthCount } = await supabase
        .from('prefecture_events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', clubOwnerId)
        .gte('event_date', firstDay)
        .lte('event_date', lastDay);

      let totalMonthEvents = prefectureMonthCount || 0;

      const { data: programDocs } = await supabase
        .from('documents')
        .select('content')
        .eq('user_id', clubOwnerId)
        .eq('type', 'programmi')
        .in('status', ['published', 'archived']);

      if (programDocs) {
        programDocs.forEach((doc) => {
          if (doc.content && typeof doc.content === 'object' && !Array.isArray(doc.content)) {
            const content = doc.content as any;
            const arrays = ['calendario_incontri', 'attivita_servizio', 'agenda_distrettuale'];
            arrays.forEach((key) => {
              if (content[key] && Array.isArray(content[key])) {
                content[key].forEach((item: any) => {
                  if (item.data && item.data >= firstDay && item.data <= lastDay) {
                    totalMonthEvents++;
                  }
                });
              }
            });
          }
        });
      }

      setStats({
        activeMembers: membersRes.count || 0,
        projects: projectsRes.count || 0,
        events: eventsRes.count || 0,
        commissions: commissionsRes.count || 0,
        upcomingEvents: totalMonthEvents,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading };
}
