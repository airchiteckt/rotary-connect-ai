import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Calendar, Users, Crown, Mail, Phone, Globe, ArrowLeft, Clock, Briefcase, Award } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface ClubProfile {
  id: string;
  user_id: string;
  full_name: string;
  club_name: string;
  club_slug: string;
  role: string;
  default_location?: string;
  default_logo_url?: string;
  president_name?: string;
  secretary_name?: string;
  created_at: string;
  phone?: string;
  default_footer_data?: string;
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

interface OrganizationMember {
  id: string;
  full_name: string;
  current_position: string;
  membership_start_date: string;
  email: string;
}

export default function ClubPage() {
  const { clubSlug } = useParams();
  const navigate = useNavigate();
  const [clubProfile, setClubProfile] = useState<ClubProfile | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<ClubEvent[]>([]);
  const [organizationMembers, setOrganizationMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (clubSlug) {
      loadClubData();
    }
  }, [clubSlug]);

  const loadClubData = async () => {
    try {
      console.log('Loading club data for slug:', clubSlug);

      // Load club profile with anonymous access
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('club_slug', clubSlug)
        .maybeSingle();

      console.log('Profile data:', profile, 'Error:', profileError);

      if (profileError) {
        console.error('Profile error:', profileError);
        setNotFound(true);
        return;
      }

      if (!profile) {
        console.log('No profile found');
        setNotFound(true);
        return;
      }

      setClubProfile(profile);

      // Load upcoming events
      try {
        const { data: events, error: eventsError } = await supabase
          .from('prefecture_events')
          .select('*')
          .eq('user_id', profile.user_id)
          .gte('event_date', new Date().toISOString().split('T')[0])
          .order('event_date', { ascending: true })
          .limit(10);

        if (!eventsError && events) {
          setUpcomingEvents(events);
        }
      } catch (err) {
        console.log('Error loading events:', err);
      }

      // Load organization members (from members table)
      try {
        const { data: orgMembers, error: orgMembersError } = await supabase
          .from('members')
          .select('id, first_name, last_name, current_position, membership_start_date, email')
          .eq('user_id', profile.user_id)
          .eq('status', 'active')
          .order('membership_start_date', { ascending: true });

        if (!orgMembersError && orgMembers) {
          const formattedOrgMembers = orgMembers.map(member => ({
            id: member.id,
            full_name: `${member.first_name} ${member.last_name}`,
            current_position: member.current_position || 'Socio',
            membership_start_date: member.membership_start_date,
            email: member.email
          }));
          
          setOrganizationMembers(formattedOrgMembers);
        }
      } catch (err) {
        console.log('Error loading organization members:', err);
      }

    } catch (error) {
      console.error('Error loading club data:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="about">Il Club</TabsTrigger>
            <TabsTrigger value="organization">Organigramma</TabsTrigger>
            <TabsTrigger value="events">Eventi</TabsTrigger>
            <TabsTrigger value="contact">Contatti</TabsTrigger>
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
                    <h3 className="font-semibold mb-2">Dettagli</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Nome:</strong> {clubProfile.club_name}</p>
                      <p><strong>Responsabile:</strong> {clubProfile.full_name}</p>
                      {clubProfile.default_location && (
                        <p><strong>Località:</strong> {clubProfile.default_location}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Organigramma</h3>
                    <div className="space-y-3 text-sm">
                      {clubProfile.president_name && (
                        <div className="bg-primary/5 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Crown className="w-4 h-4 text-primary" />
                            <span className="font-medium">Presidente</span>
                          </div>
                          <p className="text-sm">{clubProfile.president_name}</p>
                        </div>
                      )}
                      {clubProfile.secretary_name && (
                        <div className="bg-secondary/5 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Briefcase className="w-4 h-4 text-secondary" />
                            <span className="font-medium">Segretario</span>
                          </div>
                          <p className="text-sm">{clubProfile.secretary_name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="organization" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Organigramma del Club
                </CardTitle>
                <CardDescription>
                  La struttura organizzativa e i ruoli all'interno del club
                </CardDescription>
              </CardHeader>
              <CardContent>
                {organizationMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">Nessun membro dell'organizzazione disponibile</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Array.from(new Set(organizationMembers.map(m => m.current_position))).map((position) => {
                      const membersInPosition = organizationMembers.filter(m => m.current_position === position);
                      return (
                        <div key={position} className="border rounded-lg p-4">
                          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-primary" />
                            {position}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {membersInPosition.map((member) => (
                              <Card key={member.id} className="bg-secondary/5">
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-3">
                                    <Avatar>
                                      <AvatarFallback>
                                        {member.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium truncate">{member.full_name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        Dal {format(new Date(member.membership_start_date), 'MMM yyyy', { locale: it })}
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Calendario Eventi
                </CardTitle>
                <CardDescription>
                  Gli eventi e le attività in programma del nostro club
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Nessun evento in programma</h3>
                    <p className="text-muted-foreground">
                      Al momento non ci sono eventi programmati. Torna presto per aggiornamenti!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Calendario visivo */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 space-y-4">
                        {upcomingEvents.map((event) => (
                          <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                            <CardContent className="p-0">
                              <div className="flex">
                                {/* Data laterale colorata */}
                                <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 flex flex-col items-center justify-center min-w-[100px]">
                                  <div className="text-3xl font-bold">
                                    {format(new Date(event.event_date), 'dd', { locale: it })}
                                  </div>
                                  <div className="text-sm uppercase tracking-wide">
                                    {format(new Date(event.event_date), 'MMM', { locale: it })}
                                  </div>
                                  <div className="text-xs mt-1">
                                    {format(new Date(event.event_date), 'yyyy', { locale: it })}
                                  </div>
                                </div>
                                
                                {/* Contenuto evento */}
                                <div className="flex-1 p-6">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                      <h3 className="font-bold text-xl mb-1">{event.title}</h3>
                                      <Badge variant="outline" className="capitalize">
                                        {event.event_type}
                                      </Badge>
                                    </div>
                                  </div>
                                  
                                  {event.description && (
                                    <p className="text-muted-foreground mb-4 leading-relaxed">{event.description}</p>
                                  )}
                                  
                                  <div className="flex flex-wrap gap-4 text-sm">
                                    {event.event_time && (
                                      <div className="flex items-center gap-2 bg-secondary/20 px-3 py-1 rounded-full">
                                        <Clock className="w-4 h-4 text-primary" />
                                        <span>{event.event_time}</span>
                                      </div>
                                    )}
                                    {event.location && (
                                      <div className="flex items-center gap-2 bg-secondary/20 px-3 py-1 rounded-full">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        <span>{event.location}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      
                      {/* Sidebar calendario compatto */}
                      <div className="space-y-6">
                        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Calendar className="w-5 h-5" />
                              Prossimi Eventi
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {upcomingEvents.slice(0, 5).map((event) => (
                              <div key={event.id} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                                <div className="bg-primary text-primary-foreground rounded-lg p-2 text-center min-w-[50px]">
                                  <div className="text-lg font-bold">
                                    {format(new Date(event.event_date), 'dd', { locale: it })}
                                  </div>
                                  <div className="text-xs">
                                    {format(new Date(event.event_date), 'MMM', { locale: it })}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm truncate">{event.title}</h4>
                                  {event.event_time && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {event.event_time}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        {/* Statistiche eventi */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">Statistiche</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Eventi programmati</span>
                              <Badge variant="secondary">{upcomingEvents.length}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Questo mese</span>
                              <Badge variant="outline">
                                {upcomingEvents.filter(e => 
                                  format(new Date(e.event_date), 'MM-yyyy') === format(new Date(), 'MM-yyyy')
                                ).length}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Contatti
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Contatti Istituzionali</h3>
                    <div className="space-y-2 text-sm">
                      {clubProfile.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{clubProfile.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>Contatta tramite questo sito</span>
                      </div>
                    </div>
                  </div>
                  
                  {clubProfile.default_footer_data && (
                    <div>
                      <h3 className="font-semibold mb-2">Informazioni Aggiuntive</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {clubProfile.default_footer_data}
                      </p>
                    </div>
                  )}
                </div>
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