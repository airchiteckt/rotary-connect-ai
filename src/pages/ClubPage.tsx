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

export default function ClubPage() {
  const { clubSlug } = useParams();
  const navigate = useNavigate();
  const [clubProfile, setClubProfile] = useState<ClubProfile | null>(null);
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="about">Il Club</TabsTrigger>
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