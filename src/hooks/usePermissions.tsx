import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppSection = 
  | 'dashboard'
  | 'segreteria'
  | 'tesoreria'
  | 'presidenza'
  | 'prefettura'
  | 'direttivo'
  | 'comunicazione'
  | 'soci'
  | 'commissioni'
  | 'organigramma';

export const SECTION_LABELS: Record<AppSection, string> = {
  dashboard: 'Dashboard',
  segreteria: 'Segreteria',
  tesoreria: 'Tesoreria',
  presidenza: 'Presidenza',
  prefettura: 'Prefettura',
  direttivo: 'Direttivo',
  comunicazione: 'Comunicazione',
  soci: 'Soci',
  commissioni: 'Commissioni',
  organigramma: 'Organigramma'
};

export const ALL_SECTIONS: AppSection[] = Object.keys(SECTION_LABELS) as AppSection[];

export function usePermissions() {
  const { user, profile } = useAuth();
  const [userPermissions, setUserPermissions] = useState<AppSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUserPermissions([]);
      setLoading(false);
      return;
    }

    loadUserPermissions();
  }, [user, profile]);

  const loadUserPermissions = async () => {
    if (!user) return;

    try {
      // Admin has access to all sections
      if (profile?.role === 'admin') {
        setUserPermissions(ALL_SECTIONS);
        setLoading(false);
        return;
      }

      // Load user permissions from database
      const { data: permissions, error } = await supabase
        .from('member_permissions')
        .select('section')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading permissions:', error);
        setUserPermissions([]);
      } else {
        setUserPermissions(permissions.map(p => p.section as AppSection));
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      setUserPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (section: AppSection): boolean => {
    if (profile?.role === 'admin') return true;
    return userPermissions.includes(section);
  };

  const getAccessibleSections = (): AppSection[] => {
    if (profile?.role === 'admin') return ALL_SECTIONS;
    return userPermissions;
  };

  return {
    userPermissions,
    loading,
    hasPermission,
    getAccessibleSections,
    refreshPermissions: loadUserPermissions
  };
}