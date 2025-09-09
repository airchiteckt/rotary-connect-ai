import { useAuth } from '@/hooks/useAuth';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Mail, Image, Users, Shield, Calendar, ArrowRight, Maximize2 } from 'lucide-react';
import WaitingListForm from '@/components/WaitingListForm';
import Footer from '@/components/Footer';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';

// Fixed logo import issue

const Index = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<{src: string, title: string, description: string} | null>(null);

  const screenshots = [
    {
      src: "/lovable-uploads/21141ed3-f3c7-46ee-b485-29732d785157.png",
      title: t('screenshots.dashboard.title'),
      description: t('screenshots.dashboard.desc')
    },
    {
      src: "/lovable-uploads/61b06b21-be3d-45b9-b1e7-178c96ace648.png",
      title: t('screenshots.secretariat.title'),
      description: t('screenshots.secretariat.desc')
    },
    {
      src: "/lovable-uploads/1081b2ef-38ca-48bd-b0ef-d77f614cd588.png",
      title: t('screenshots.communication.title'),
      description: t('screenshots.communication.desc')
    },
    {
      src: "/lovable-uploads/3817cd51-9797-4dfd-862d-bfadd56c912f.png",
      title: t('screenshots.treasury.title'),
      description: t('screenshots.treasury.desc')
    },
    {
      src: "/lovable-uploads/851999c0-2bdc-48b1-8902-2c162b5c63bf.png",
      title: t('screenshots.presidency.title'),
      description: t('screenshots.presidency.desc')
    },
    {
      src: "/lovable-uploads/df8f940f-a641-42e6-8691-e88d7428dea6.png",
      title: t('screenshots.members.title'),
      description: t('screenshots.members.desc')
    }
  ];

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
    <div className="min-h-screen bg-background overflow-x-hidden w-full">
      {/* Header */}
      <header className="w-full border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center max-w-7xl">
          <img 
            src="/lovable-uploads/fc293183-4946-4f6f-9562-6509947cf52e.png" 
            alt="FastClub Logo" 
            className="h-8 sm:h-10 flex-shrink-0"
          />
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSelector />
            <Button asChild variant="outline" size="sm" className="text-sm">
              <Link to="/auth">{t('nav.login')}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6 sm:mb-8">
            <div className="mb-4 sm:mb-6">
              <img 
                src="/lovable-uploads/fc293183-4946-4f6f-9562-6509947cf52e.png" 
                alt="FastClub Logo" 
                className="h-16 sm:h-20 mx-auto max-w-full"
              />
            </div>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('hero.subtitle')}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 max-w-md sm:max-w-2xl mx-auto">
            <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto bg-primary hover:bg-primary/90">
              <a href="#waiting-list">
                {t('nav.waitingList')}
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto"
              onClick={() => document.getElementById('screenshots')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('nav.learnMore')}
            </Button>
          </div>
        </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-8 sm:py-12 lg:py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12">{t('features.title')}</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <Card className="text-center hover:shadow-lg transition-all h-full">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-lg sm:text-xl mb-2">{t('features.documents.title')}</CardTitle>
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  {t('features.documents.desc')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all h-full">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-secondary rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-secondary-foreground" />
                </div>
                <CardTitle className="text-lg sm:text-xl mb-2">{t('features.automation.title')}</CardTitle>
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  {t('features.automation.desc')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all h-full">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-accent rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Image className="w-6 h-6 sm:w-7 sm:h-7 text-accent-foreground" />
                </div>
                <CardTitle className="text-lg sm:text-xl mb-2">{t('features.design.title')}</CardTitle>
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  {t('features.design.desc')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all h-full">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/80 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Users className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-lg sm:text-xl mb-2">{t('features.management.title')}</CardTitle>
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  {t('features.management.desc')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all h-full">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-accent/80 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-accent-foreground" />
                </div>
                <CardTitle className="text-lg sm:text-xl mb-2">{t('features.gdpr.title')}</CardTitle>
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  {t('features.gdpr.desc')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all h-full">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-secondary/80 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-secondary-foreground" />
                </div>
                <CardTitle className="text-lg sm:text-xl mb-2">{t('features.trial.title')}</CardTitle>
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  {t('features.trial.desc')}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Screenshots Gallery Section */}
      <section id="screenshots" className="w-full py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 flex flex-wrap items-center justify-center gap-2">
              <span>{t('screenshots.title')}</span>
              <img src="/lovable-uploads/fc293183-4946-4f6f-9562-6509947cf52e.png" alt="FastClub" className="h-6 sm:h-8 lg:h-10 flex-shrink-0" />
              <span>{t('screenshots.titleSuffix')}</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('screenshots.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {screenshots.map((screenshot, index) => (
              <Card 
                key={index} 
                className="overflow-hidden hover:shadow-xl transition-all duration-300 hover-scale group cursor-pointer"
                onClick={() => setSelectedImage(screenshot)}
              >
                <div 
                  className="relative aspect-video overflow-hidden bg-muted cursor-pointer"
                  onClick={() => setSelectedImage(screenshot)}
                >
                  <img 
                    src={screenshot.src} 
                    alt={screenshot.title} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 cursor-pointer"
                    onClick={() => setSelectedImage(screenshot)}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center pointer-events-none">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-3">
                      <Maximize2 className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors duration-200">
                    {screenshot.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {screenshot.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Expanded Image Modal */}
          <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
            <DialogContent className="max-w-5xl w-full max-h-[90vh]">
              {selectedImage && (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                      {selectedImage.title}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    <div className="aspect-video overflow-hidden rounded-lg bg-muted mb-4">
                      <img 
                        src={selectedImage.src} 
                        alt={selectedImage.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {selectedImage.description}
                    </p>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Waiting List Section */}
      <section id="waiting-list" className="w-full py-8 sm:py-12 lg:py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">{t('waitingList.title')}</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-2 leading-relaxed">
              <img src="/lovable-uploads/fc293183-4946-4f6f-9562-6509947cf52e.png" alt="FastClub" className="h-5 flex-shrink-0" />
              <span>{t('waitingList.subtitle')}</span>
            </p>
          </div>
          
          <div className="flex justify-center">
            <WaitingListForm />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="text-center bg-card border">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl">{t('cta.title')}</CardTitle>
              <CardDescription className="text-base sm:text-lg flex flex-wrap items-center justify-center gap-2">
                <span>{t('cta.button')}</span>
                <img src="/lovable-uploads/fc293183-4946-4f6f-9562-6509947cf52e.png" alt="FastClub" className="h-5 flex-shrink-0" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto mb-4">
                <Link to="/auth?tab=signin">
                  {t('nav.login')}
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </Button>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t('cta.security')}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
