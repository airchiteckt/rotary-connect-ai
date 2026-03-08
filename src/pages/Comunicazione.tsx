import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Megaphone, Plus, Share2, Calendar, Image } from 'lucide-react';
import { FlyerGenerator } from '@/components/FlyerGenerator';
import { useComingSoonToast } from '@/components/ComingSoonToast';
import { SectionResponsible } from '@/components/SectionResponsible';
import SectionPageLayout from '@/components/shared/SectionPageLayout';
import SectionPageHeader from '@/components/shared/SectionPageHeader';

export default function Comunicazione() {
  return (
    <SectionPageLayout bgGradient="bg-gradient-to-br from-purple-50 to-pink-100">
      {() => <ComunicazioneContent />}
    </SectionPageLayout>
  );
}

function ComunicazioneContent() {
  const { showComingSoon } = useComingSoonToast();
  const [activeTab, setActiveTab] = useState('locandine');

  return (
    <>
      <SectionPageHeader
        title="Comunicazione"
        subtitle="Strumenti per comunicazione e marketing del club"
        icon={Megaphone}
        iconColor="bg-purple-600"
        actions={
          <Button size="sm">
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Nuova Campagna</span>
          </Button>
        }
      />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <SectionResponsible section="comunicazione" />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="locandine" className="text-xs sm:text-sm">Locandine AI</TabsTrigger>
            <TabsTrigger value="social" className="text-xs sm:text-sm">Social</TabsTrigger>
            <TabsTrigger value="newsletter" className="text-xs sm:text-sm">Newsletter</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="locandine" className="space-y-6">
            <FlyerGenerator />
          </TabsContent>

          <TabsContent value="social" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {[
                { name: 'Facebook', metric: 'Post pubblicati' },
                { name: 'Instagram', metric: 'Stories create' },
                { name: 'LinkedIn', metric: 'Articoli scritti' },
              ].map(({ name, metric }) => (
                <Card key={name}>
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-sm">{name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground">{metric}</p>
                    <Button size="sm" className="w-full mt-2">Gestisci</Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Calendario Pubblicazioni</CardTitle>
                <CardDescription>Pianifica i tuoi contenuti social</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground cursor-pointer hover:bg-muted/50 rounded-lg transition-colors"
                  onClick={() => showComingSoon("Calendario Social", "Presto potrai pianificare i tuoi post sui social media")}>
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Calendario social in preparazione</p>
                  <Button variant="outline" className="mt-4" size="sm">Clicca per info</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="newsletter">
            <Card>
              <CardHeader>
                <CardTitle>Newsletter e Comunicazioni</CardTitle>
                <CardDescription>Crea e invia newsletter ai membri del club</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground cursor-pointer hover:bg-muted/50 rounded-lg transition-colors"
                  onClick={() => showComingSoon("Sistema Newsletter", "Strumenti di email marketing per comunicare con i soci")}>
                  <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Sistema newsletter in arrivo</p>
                  <Button variant="outline" className="mt-4" size="sm">Clicca per info</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics e Metriche</CardTitle>
                <CardDescription>Monitora le performance delle tue comunicazioni</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground cursor-pointer hover:bg-muted/50 rounded-lg transition-colors"
                  onClick={() => showComingSoon("Analytics Comunicazione", "Metriche di performance per i tuoi contenuti")}>
                  <Share2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Analytics in preparazione</p>
                  <Button variant="outline" className="mt-4" size="sm">Clicca per info</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
