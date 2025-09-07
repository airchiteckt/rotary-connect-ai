import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Mail, Image, Users, Shield, Calendar, ArrowRight } from 'lucide-react';
import WaitingListForm from '@/components/WaitingListForm';
import Footer from '@/components/Footer';

// Fixed logo import issue

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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8 sm:py-12 lg:py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <div className="mb-4 sm:mb-6">
              <img 
                src="/lovable-uploads/fc293183-4946-4f6f-9562-6509947cf52e.png" 
                alt="FastClub Logo" 
                className="h-16 sm:h-20 mx-auto"
              />
            </div>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 px-4">
              La piattaforma intelligente per automatizzare la gestione del tuo club o associazione. 
              Documenti AI, comunicazioni smart e automazioni avanzate per semplificare ogni processo.
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
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Documenti AI</CardTitle>
                <CardDescription className="text-sm sm:text-base px-2">
                  Genera automaticamente programmi, verbali e comunicazioni con AI. Template intelligenti e content generation avanzato
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Automazioni Smart</CardTitle>
                <CardDescription className="text-sm sm:text-base px-2">
                  Automatizza comunicazioni e notifiche. Gestione intelligente di membri e categorie con workflow avanzati
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Image className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Design AI</CardTitle>
                <CardDescription className="text-sm sm:text-base px-2">
                  Crea locandine e materiali grafici professionali per eventi con AI generativa. Ogni design unico e su misura
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-chart-4 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Gestione Intelligente</CardTitle>
                <CardDescription className="text-sm sm:text-base px-2">
                  CRM avanzato per membri e contatti. Analytics automatico e insights per ottimizzare le attività del club
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-chart-5 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
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
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-chart-3 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
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

      {/* Screenshots Gallery Section */}
      <section className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 flex items-center justify-center gap-2">
              Esplora <img src="/lovable-uploads/fc293183-4946-4f6f-9562-6509947cf52e.png" alt="FastClub" className="h-8 sm:h-10" /> in Dettaglio
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 px-4">
              Scopri tutte le sezioni e funzionalità per la gestione completa del tuo club
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <Card className="overflow-hidden hover:shadow-lg transition-all">
              <div className="aspect-video overflow-hidden">
                <img 
                  src="/lovable-uploads/21141ed3-f3c7-46ee-b485-29732d785157.png" 
                  alt="Dashboard del Club" 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">Dashboard del Club</CardTitle>
                <CardDescription className="text-sm">
                  Panoramica completa con statistiche in tempo reale, navigazione intuitiva tra le sezioni del club
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-all">
              <div className="aspect-video overflow-hidden">
                <img 
                  src="/lovable-uploads/61b06b21-be3d-45b9-b1e7-178c96ace648.png" 
                  alt="Segreteria Digitale" 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">Segreteria Digitale</CardTitle>
                <CardDescription className="text-sm">
                  Gestione documenti, verbali riunioni, programmi mensili e comunicazioni ufficiali
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-all">
              <div className="aspect-video overflow-hidden">
                <img 
                  src="/lovable-uploads/1081b2ef-38ca-48bd-b0ef-d77f614cd588.png" 
                  alt="Comunicazione AI" 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">Comunicazione AI</CardTitle>
                <CardDescription className="text-sm">
                  Generatore intelligente di locandine, gestione social media e strumenti di marketing
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-all">
              <div className="aspect-video overflow-hidden">
                <img 
                  src="/lovable-uploads/3817cd51-9797-4dfd-862d-bfadd56c912f.png" 
                  alt="Tesoreria Avanzata" 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">Tesoreria Avanzata</CardTitle>
                <CardDescription className="text-sm">
                  Bilanci, transazioni, report finanziari e gestione budget del club
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-all">
              <div className="aspect-video overflow-hidden">
                <img 
                  src="/lovable-uploads/851999c0-2bdc-48b1-8902-2c162b5c63bf.png" 
                  alt="Area Presidenza" 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">Area Presidenza</CardTitle>
                <CardDescription className="text-sm">
                  Coordinamento progetti, governance del club e strumenti di leadership
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-all">
              <div className="aspect-video overflow-hidden">
                <img 
                  src="/lovable-uploads/df8f940f-a641-42e6-8691-e88d7428dea6.png" 
                  alt="Gestione Soci" 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">Gestione Soci</CardTitle>
                <CardDescription className="text-sm">
                  Anagrafica completa, presenze, quote sociali e riconoscimenti membri
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Waiting List Section */}
      <section className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 px-4">Entra in Lista d'Attesa</h2>
            <p className="text-base sm:text-lg text-muted-foreground px-4 max-w-2xl mx-auto flex items-center justify-center gap-2 flex-wrap">
              <img src="/lovable-uploads/fc293183-4946-4f6f-9562-6509947cf52e.png" alt="FastClub" className="h-5" /> è attualmente in fase di sviluppo. Registrati per essere tra i primi 
              a ricevere l'accesso quando sarà disponibile.
            </p>
          </div>
          
          <div className="flex justify-center px-4">
            <WaitingListForm />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        <Card className="max-w-2xl mx-auto text-center bg-card border mx-4">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl px-4">Hai già un account?</CardTitle>
            <CardDescription className="text-base sm:text-lg px-4 flex items-center justify-center gap-2">
              Accedi per iniziare subito con <img src="/lovable-uploads/fc293183-4946-4f6f-9562-6509947cf52e.png" alt="FastClub" className="h-5" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto">
              <a href="/auth">
                Accedi alla Piattaforma
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </Button>
            <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4 px-4">
              Accesso sicuro • Dati protetti • Supporto 24/7
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
