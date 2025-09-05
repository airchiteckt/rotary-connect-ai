import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Mail, Image, Users, Shield, Calendar, ArrowRight } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8 sm:py-12 lg:py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <span className="text-2xl sm:text-3xl font-bold text-primary-foreground">R</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent px-2">
              Gestionale Rotary
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 px-4">
              La piattaforma completa per la gestione digitale del tuo Club Rotary. 
              Crea documenti professionali, gestisci comunicazioni e genera locandine con l'intelligenza artificiale.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 px-4">
            <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto">
              <a href="/auth">
                Inizia Prova Gratuita
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </Button>
            <Button variant="outline" size="lg" className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto">
              Scopri di Più
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 px-4">Funzionalità Principali</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-2">
            <Card className="text-center hover:shadow-lg transition-all">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Documenti Intelligenti</CardTitle>
                <CardDescription className="text-sm sm:text-base px-2">
                  Crea programmi mensili, verbali e comunicazioni con template professionali e AI summary automatico
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Email Marketing</CardTitle>
                <CardDescription className="text-sm sm:text-base px-2">
                  Gestisci anagrafiche per categorie e invia comunicazioni di massa con configurazione avanzata
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Image className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Locandine AI</CardTitle>
                <CardDescription className="text-sm sm:text-base px-2">
                  Genera flyer professionali per eventi in diversi formati con intelligenza artificiale
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Gestione Contatti</CardTitle>
                <CardDescription className="text-sm sm:text-base px-2">
                  Organizza membri per categorie: soci club, direttivo, distrettuale e molto altro
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl">GDPR Compliant</CardTitle>
                <CardDescription className="text-sm sm:text-base px-2">
                  Conforme alle normative GDPR per la protezione e sicurezza dei dati dei tuoi membri
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Prova Gratuita</CardTitle>
                <CardDescription className="text-sm sm:text-base px-2">
                  30 giorni di prova gratuita per testare tutte le funzionalità senza impegno
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        <Card className="max-w-2xl mx-auto text-center bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 mx-4">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl px-4">Pronto per iniziare?</CardTitle>
            <CardDescription className="text-base sm:text-lg px-4">
              Trasforma la gestione del tuo Club Rotary con tecnologie all'avanguardia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto">
              <a href="/auth">
                Inizia la Tua Prova Gratuita
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </Button>
            <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4 px-4">
              Nessun impegno • 30 giorni gratuiti • Supporto completo
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Index;
