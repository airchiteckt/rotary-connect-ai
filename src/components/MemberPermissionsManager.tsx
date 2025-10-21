import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SectionPermissionSelector } from './SectionPermissionSelector';
import { type AppSection } from '@/hooks/usePermissions';

interface MemberPermissionsManagerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  member: {
    user_id: string;
    profile?: {
      full_name?: string;
      role?: string;
    };
  } | null;
}

export function MemberPermissionsManager({
  isOpen,
  onOpenChange,
  member
}: MemberPermissionsManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [memberPermissions, setMemberPermissions] = useState<AppSection[]>([]);
  const [responsibleSections, setResponsibleSections] = useState<AppSection[]>([]);

  useEffect(() => {
    if (isOpen && member) {
      loadMemberPermissions();
    }
  }, [isOpen, member]);

  const loadMemberPermissions = async () => {
    if (!member) return;

    try {
      const { data: permissions, error } = await supabase
        .from('member_permissions')
        .select('section, is_responsible')
        .eq('user_id', member.user_id)
        .eq('club_owner_id', user?.id);

      if (error) throw error;

      setMemberPermissions(permissions.map(p => p.section as AppSection));
      setResponsibleSections(
        permissions
          .filter(p => p.is_responsible)
          .map(p => p.section as AppSection)
      );
    } catch (error) {
      console.error('Error loading member permissions:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile caricare i permessi del membro."
      });
    }
  };

  const handleSavePermissions = async () => {
    if (!member || !user) return;

    setLoading(true);
    try {
      // Delete existing permissions
      await supabase
        .from('member_permissions')
        .delete()
        .eq('user_id', member.user_id)
        .eq('club_owner_id', user.id);

      // Insert new permissions
      if (memberPermissions.length > 0) {
        const permissionsToInsert = memberPermissions.map(section => ({
          user_id: member.user_id,
          section: section,
          club_owner_id: user.id,
          is_responsible: responsibleSections.includes(section)
        }));

        const { error: insertError } = await supabase
          .from('member_permissions')
          .insert(permissionsToInsert);

        if (insertError) throw insertError;
      }

      toast({
        title: "Permessi aggiornati",
        description: "I permessi del membro sono stati aggiornati con successo."
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile aggiornare i permessi del membro."
      });
    } finally {
      setLoading(false);
    }
  };

  if (!member) return null;

  // Don't show permissions manager for admin users
  if (member.profile?.role === 'admin') {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permessi - {member.profile?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <p className="text-muted-foreground">
              Gli amministratori hanno accesso completo a tutte le sezioni.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gestisci Permessi - {member.profile?.full_name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <SectionPermissionSelector
            selectedPermissions={memberPermissions}
            onPermissionsChange={setMemberPermissions}
            responsibleSections={responsibleSections}
            onResponsibleChange={setResponsibleSections}
            title="Sezioni Accessibili"
          />
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button onClick={handleSavePermissions} disabled={loading}>
              {loading ? "Salvando..." : "Salva Permessi"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}