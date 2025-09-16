import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Calendar, Users, Crown, Mail, Phone, Globe, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface ClubProfile {
  id: string;
  full_name: string;
  club_name: string;
  club_slug: string;
  role: string;
  bio?: string;
  phone?: string;
  address?: string;
  default_location?: string;
  default_logo_url?: string;
  president_name?: string;
  secretary_name?: string;
  created_at: string;
}

interface ClubMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles: {
    full_name: string;
    role: string;
  };
}

interface ClubEvent {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  location?: string;
  event_type: string;
}

export default function ClubPage() {
  const { clubSlug } = useParams();
  const navigate = useNavigate();
  const [clubProfile, setClubProfile] = useState<ClubProfile | null>(null);
  const [clubMembers, setClubMembers] = useState<ClubMember[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (clubSlug) {
      loadClubData();
    }
  }, [clubSlug]);

  const loadClubData = async () => {
    try {
      // Load club profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('club_slug', clubSlug)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          setNotFound(true);
        }
        throw profileError;
      }

      setClubProfile(profile);

      // Load club members
      const { data: membersData, error: membersError } = await supabase
        .from('club_members')
        .select('id, user_id, role, joined_at')
        .eq('club_owner_id', profile.user_id)
        .eq('status', 'active');

      if (membersError) throw membersError;

      // Get profile data for each member
      const membersWithProfiles = [];
      for (const member of membersData || []) {
        const { data: memberProfile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('user_id', member.user_id)
          .single();

        membersWithProfiles.push({
          ...member,
          profiles: memberProfile || { full_name: 'Nome non disponibile', role: 'member' }
        });
      }

      setClubMembers(membersWithProfiles);

      // Load upcoming events
      const { data: events, error: eventsError } = await supabase
        .from('prefecture_events')
        .select('*')
        .eq('user_id', profile.user_id)
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true })
        .limit(5);

      if (eventsError) throw eventsError;
      setUpcomingEvents(events || []);

    } catch (error) {
      console.error('Error loading club data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'treasurer':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return '👑';
      case 'treasurer':
        return '💰';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento del club...</p>
        </div>
      </div>
    );
  }

  if (notFound || !clubProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Club Non Trovato</CardTitle>
            <CardDescription>
              Il club che stai cercando non esiste o non è più disponibile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna alla Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
            </Button>
            <div className="text-sm text-muted-foreground">
              fastclub.it/{clubSlug}
            </div>
          </div>
        </div>
      </div>

      {/* Club Hero */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-6">
              <AvatarImage src={clubProfile.default_logo_url} />
              <AvatarFallback className="text-2xl">
                {clubProfile.club_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'RC'}
              </AvatarFallback>
            </Avatar>
            
            <h1 className="text-4xl font-bold mb-4">{clubProfile.club_name}</h1>
            
            {clubProfile.bio && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                {clubProfile.bio}
              </p>
            )}

            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-6">
              {clubProfile.default_location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {clubProfile.default_location}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Fondato il {format(new Date(clubProfile.created_at), 'dd MMMM yyyy', { locale: it })}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {clubMembers.length + 1} Membri
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              {clubProfile.president_name && (
                <Badge variant="default" className="flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Presidente: {clubProfile.president_name}
                </Badge>
              )}
              {clubProfile.secretary_name && (
                <Badge variant="secondary">
                  Segretario: {clubProfile.secretary_name}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="about">Il Club</TabsTrigger>
            <TabsTrigger value="members">Membri</TabsTrigger>
            <TabsTrigger value="events">Eventi</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Informazioni del Club
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Contatti</h3>
                    <div className="space-y-2 text-sm">
                      {clubProfile.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          {clubProfile.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        Contatta tramite questo sito
                      </div>
                    </div>
                  </div>
                  
                  {clubProfile.address && (
                    <div>
                      <h3 className="font-semibold mb-2">Indirizzo</h3>
                      <p className="text-sm text-muted-foreground">
                        {clubProfile.address}
                      </p>
                    </div>
                  )}
                </div>

                {clubProfile.bio && (
                  <div>
                    <h3 className="font-semibold mb-2">Chi Siamo</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {clubProfile.bio}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Membri del Club ({clubMembers.length + 1})
                </CardTitle>
                <CardDescription>
                  I membri che compongono la nostra organizzazione
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Club Owner */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {clubProfile.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{clubProfile.full_name}</p>
                          <Badge variant={getRoleColor(clubProfile.role)} className="text-xs">
                            {getRoleIcon(clubProfile.role)} {clubProfile.role?.charAt(0).toUpperCase() + clubProfile.role?.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Other Members */}
                  {clubMembers.map((member) => (
                    <Card key={member.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {member.profiles?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{member.profiles?.full_name || 'Nome non disponibile'}</p>
                            <div className="flex flex-col gap-1">
                              <Badge variant={getRoleColor(member.profiles?.role)} className="text-xs w-fit">
                                {getRoleIcon(member.profiles?.role)} {member.profiles?.role?.charAt(0).toUpperCase() + member.profiles?.role?.slice(1)}
                              </Badge>
                              <p className="text-xs text-muted-foreground">
                                Dal {format(new Date(member.joined_at), 'MMM yyyy', { locale: it })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Prossimi Eventi
                </CardTitle>
                <CardDescription>
                  Gli eventi e le attività in programma del nostro club
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">Nessun evento in programma al momento</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <Card key={event.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{event.title}</h3>
                              {event.description && (
                                <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {format(new Date(event.event_date), 'dd MMMM yyyy', { locale: it })}
                                  {event.event_time && ` alle ${event.event_time}`}
                                </div>
                                {event.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {event.location}
                                  </div>
                                )
                                }
                              </div>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {event.event_type}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                    }
                  </div>
                )
                }
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Separator className="mb-6" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Powered by
              </span>
              <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/')}>
                FastClub
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 {clubProfile.club_name}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
