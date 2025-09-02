import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Search, Filter, ArrowLeft, Settings, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Segreteria() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('documenti');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const documentTypes = [
    { id: 'verbali', name: 'Verbali Riunioni', count: 0, color: 'bg-blue-100 text-blue-800' },
    { id: 'programmi', name: 'Programmi Mensili', count: 0, color: 'bg-green-100 text-green-800' },
    { id: 'comunicazioni', name: 'Comunicazioni Ufficiali', count: 0, color: 'bg-purple-100 text-purple-800' },
    { id: 'circolari', name: 'Circolari', count: 0, color: 'bg-orange-100 text-orange-800' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Segreteria</h1>
                <p className="text-sm text-muted-foreground">Gestione documenti e comunicazioni ufficiali</p>
              </div>
            </div>
            
            <Button onClick={() => window.location.href = '/create-document'}>
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Documento
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="documenti">Documenti</TabsTrigger>
            <TabsTrigger value="templates">Template</TabsTrigger>
            <TabsTrigger value="archivio">Archivio</TabsTrigger>
            <TabsTrigger value="statistiche">Statistiche</TabsTrigger>
            <TabsTrigger value="impostazioni">Impostazioni</TabsTrigger>
          </TabsList>

          <TabsContent value="documenti" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Cerca documenti..." 
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtri
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Document Types */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {documentTypes.map((type) => (
                <Card key={type.id} className="cursor-pointer hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{type.name}</CardTitle>
                      <Badge className={type.color}>{type.count}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline" size="sm" onClick={() => window.location.href = `/create-document?type=${type.id}`}>
                      Gestisci
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Documenti Recenti</CardTitle>
                <CardDescription>
                  Gli ultimi documenti creati o modificati
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nessun documento trovato</p>
                  <p className="text-sm">Inizia creando il tuo primo documento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Template Documenti</CardTitle>
                <CardDescription>
                  Modelli predefiniti per velocizzare la creazione di documenti
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Template in arrivo</p>
                  <p className="text-sm">Stiamo preparando i modelli per te</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="archivio">
            <Card>
              <CardHeader>
                <CardTitle>Archivio Documenti</CardTitle>
                <CardDescription>
                  Documenti archiviati e cronologia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Archivio vuoto</p>
                  <p className="text-sm">I documenti archiviati appariranno qui</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistiche">
            <Card>
              <CardHeader>
                <CardTitle>Statistiche e Report</CardTitle>
                <CardDescription>
                  Analisi dell'attività documentale
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Statistiche in preparazione</p>
                  <p className="text-sm">Le metriche appariranno qui</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="impostazioni" className="space-y-6">
            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200" onClick={() => window.location.href = '/recurring-meetings'}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Appuntamenti Ricorrenti</CardTitle>
                      <CardDescription className="text-sm">
                        Configura riunioni automatiche
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Imposta appuntamenti che si ripetono automaticamente come Consiglio Direttivo ogni terzo giovedì del mese.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Configura
                  </Button>
                </CardContent>
              </Card>

              <Card className="opacity-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Template Personalizzati</CardTitle>
                      <CardDescription className="text-sm">
                        Modifica i template esistenti
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Personalizza i template per adattarli alle esigenze del tuo club.
                  </p>
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    <Settings className="w-4 h-4 mr-2" />
                    Prossimamente
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Settings Information */}
            <Card>
              <CardHeader>
                <CardTitle>Impostazioni Segreteria</CardTitle>
                <CardDescription>
                  Configura le impostazioni per ottimizzare il tuo flusso di lavoro
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium text-sm">Appuntamenti Ricorrenti</h4>
                  <p className="text-sm text-muted-foreground">
                    Configura riunioni che si ripetono automaticamente (es. Consiglio Direttivo ogni terzo giovedì). 
                    Una volta configurate, potrai caricarle automaticamente nei programmi mensili.
                  </p>
                </div>
                
                <div className="border-l-4 border-gray-300 pl-4 opacity-60">
                  <h4 className="font-medium text-sm">Firme Digitali</h4>
                  <p className="text-sm text-muted-foreground">
                    Carica le firme dei membri del direttivo per l'inserimento automatico nei documenti.
                  </p>
                </div>
                
                <div className="border-l-4 border-gray-300 pl-4 opacity-60">
                  <h4 className="font-medium text-sm">Modelli Club</h4>
                  <p className="text-sm text-muted-foreground">
                    Personalizza i template con logo, intestazioni e piè di pagina del tuo club.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}