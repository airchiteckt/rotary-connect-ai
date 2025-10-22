import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions, type AppSection } from '@/hooks/usePermissions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MessageSquare, Archive, Reply } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface SectionRequest {
  id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  status: string;
  created_at: string;
  user_name?: string;
  replies?: SectionRequest[];
}

interface SectionRequestsProps {
  section: AppSection;
}

export function SectionRequests({ section }: SectionRequestsProps) {
  const { user, profile } = useAuth();
  const { hasPermission } = usePermissions();
  const [requests, setRequests] = useState<SectionRequest[]>([]);
  const [newRequest, setNewRequest] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [isResponsible, setIsResponsible] = useState(false);

  useEffect(() => {
    if (user && profile) {
      loadRequests();
      checkIfResponsible();
    }
  }, [user, profile, section, showArchived]);

  const checkIfResponsible = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('member_permissions')
      .select('is_responsible')
      .eq('user_id', user.id)
      .eq('section', section)
      .eq('is_responsible', true)
      .maybeSingle();

    if (!error && data) {
      setIsResponsible(true);
    } else {
      setIsResponsible(profile?.role === 'admin');
    }
  };

  const loadRequests = async () => {
    if (!user || !profile) return;

    const clubOwnerId = profile.role === 'admin' ? user.id : 
      (await supabase.from('club_members').select('club_owner_id').eq('user_id', user.id).maybeSingle())?.data?.club_owner_id;

    if (!clubOwnerId) return;

    const { data, error } = await supabase
      .from('section_requests')
      .select('*')
      .eq('club_owner_id', clubOwnerId)
      .eq('section', section)
      .eq('status', showArchived ? 'archived' : 'active')
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading requests:', error);
      return;
    }

    // Load user names and replies for each request
    const requestsWithReplies = await Promise.all(
      (data || []).map(async (request) => {
        // Get user name
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', request.user_id)
          .maybeSingle();

        // Get replies
        const { data: repliesData } = await supabase
          .from('section_requests')
          .select('*')
          .eq('parent_id', request.id)
          .order('created_at', { ascending: true });

        // Get user names for replies
        const repliesWithNames = await Promise.all(
          (repliesData || []).map(async (reply) => {
            const { data: replyUserProfile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', reply.user_id)
              .maybeSingle();

            return {
              ...reply,
              user_name: replyUserProfile?.full_name
            };
          })
        );

        return {
          ...request,
          user_name: userProfile?.full_name,
          replies: repliesWithNames
        };
      })
    );

    setRequests(requestsWithReplies);
  };

  const handleSubmitRequest = async () => {
    if (!user || !profile || !newRequest.trim()) return;

    const clubOwnerId = profile.role === 'admin' ? user.id : 
      (await supabase.from('club_members').select('club_owner_id').eq('user_id', user.id).maybeSingle())?.data?.club_owner_id;

    if (!clubOwnerId) return;

    const { error } = await supabase
      .from('section_requests')
      .insert({
        user_id: user.id,
        club_owner_id: clubOwnerId,
        section,
        content: newRequest,
        status: 'active'
      });

    if (error) {
      toast.error('Errore nell\'invio della richiesta');
      console.error(error);
      return;
    }

    toast.success('Richiesta inviata con successo');
    setNewRequest('');
    loadRequests();
  };

  const handleReply = async (requestId: string) => {
    if (!user || !profile || !replyContent.trim()) return;

    const clubOwnerId = profile.role === 'admin' ? user.id : 
      (await supabase.from('club_members').select('club_owner_id').eq('user_id', user.id).maybeSingle())?.data?.club_owner_id;

    if (!clubOwnerId) return;

    const { error } = await supabase
      .from('section_requests')
      .insert({
        user_id: user.id,
        club_owner_id: clubOwnerId,
        section,
        content: replyContent,
        parent_id: requestId,
        status: 'active'
      });

    if (error) {
      toast.error('Errore nell\'invio della risposta');
      console.error(error);
      return;
    }

    toast.success('Risposta inviata con successo');
    setReplyContent('');
    setReplyTo(null);
    loadRequests();
  };

  const handleArchive = async (requestId: string) => {
    const { error } = await supabase
      .from('section_requests')
      .update({ status: 'archived' })
      .eq('id', requestId);

    if (error) {
      toast.error('Errore nell\'archiviazione');
      return;
    }

    toast.success('Richiesta archiviata');
    loadRequests();
  };

  if (!hasPermission(section)) {
    return null;
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Richieste e Commenti
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived ? 'Mostra Attive' : 'Mostra Archiviate'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showArchived && (
          <div className="space-y-2">
            <Textarea
              placeholder="Scrivi una richiesta o commento..."
              value={newRequest}
              onChange={(e) => setNewRequest(e.target.value)}
              rows={3}
            />
            <Button onClick={handleSubmitRequest} disabled={!newRequest.trim()}>
              Invia Richiesta
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">
                          {request.user_name || 'Utente'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(request.created_at), "d MMM yyyy 'alle' HH:mm", { locale: it })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{request.content}</p>
                    </div>
                    {isResponsible && !showArchived && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArchive(request.id)}
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {request.replies && request.replies.length > 0 && (
                    <div className="ml-8 space-y-3 border-l-2 border-border pl-4">
                      {request.replies.map((reply) => (
                        <div key={reply.id} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Reply className="w-3 h-3" />
                            <span className="font-semibold text-sm">
                              {reply.user_name || 'Utente'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(reply.created_at), "d MMM yyyy 'alle' HH:mm", { locale: it })}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap ml-5">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {isResponsible && !showArchived && (
                    <div className="ml-8 space-y-2">
                      {replyTo === request.id ? (
                        <>
                          <Textarea
                            placeholder="Scrivi una risposta..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleReply(request.id)}
                              disabled={!replyContent.trim()}
                            >
                              Invia Risposta
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setReplyTo(null);
                                setReplyContent('');
                              }}
                            >
                              Annulla
                            </Button>
                          </div>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setReplyTo(request.id)}
                        >
                          <Reply className="w-4 h-4 mr-2" />
                          Rispondi
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {requests.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              {showArchived ? 'Nessuna richiesta archiviata' : 'Nessuna richiesta attiva'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
