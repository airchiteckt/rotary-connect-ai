import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { type AppSection, SECTION_LABELS } from '@/hooks/usePermissions';

interface SectionResponsibleProps {
  section: AppSection;
}

export function SectionResponsible({ section }: SectionResponsibleProps) {
  const { user } = useAuth();
  const [responsible, setResponsible] = useState<{
    full_name: string;
    email: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResponsible();
  }, [section, user]);

  const loadResponsible = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get club owner ID
      const { data: ownerIdData } = await supabase
        .rpc('get_club_owner_id', { user_uuid: user.id });
      
      const clubOwnerId = ownerIdData || user.id;

      // Get responsible person for this section
      const { data: permissions, error } = await supabase
        .from('member_permissions')
        .select('user_id')
        .eq('club_owner_id', clubOwnerId)
        .eq('section', section)
        .eq('is_responsible', true)
        .maybeSingle();

      if (error || !permissions) {
        setResponsible(null);
        return;
      }

      // Get profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', permissions.user_id)
        .maybeSingle();

      // Get email
      const { data: emailData } = await supabase
        .rpc('get_user_email', { user_uuid: permissions.user_id });

      if (profile) {
        setResponsible({
          full_name: profile.full_name || 'Nome non disponibile',
          email: emailData || 'Email non disponibile'
        });
      }
    } catch (error) {
      console.error('Error loading responsible:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!responsible) {
    return null;
  }

  return (
    <Card className="p-4 mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
          <Star className="w-5 h-5 text-amber-600 fill-amber-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm">Responsabile {SECTION_LABELS[section]}</h3>
            <Badge variant="outline" className="bg-white">
              <User className="w-3 h-3 mr-1" />
              {responsible.full_name}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{responsible.email}</p>
        </div>
      </div>
    </Card>
  );
}
