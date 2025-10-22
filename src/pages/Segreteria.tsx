import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Search, Filter, ArrowLeft, Settings, Calendar, Edit, Eye, Trash2, Mic } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TemplateEditor } from '@/components/TemplateEditor';
import SegreteriAI from '@/components/SegreteriAI';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { SectionResponsible } from '@/components/SectionResponsible';

interface Document {
  id: string;
  title: string;
  type: 'verbali' | 'programmi' | 'comunicazioni' | 'circolari';
  status: 'draft' | 'published' | 'archived';
  document_number: string;
  created_at: string;
  updated_at: string;
}

export default function Segreteria() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('documenti');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadDocuments();
      loadTemplates();
    }
  }, [user]);

  const loadDocuments = async () => {
    try {
      // Get club owner ID first
      const { data: ownerIdData } = await supabase.rpc('get_club_owner_id', { 
        user_uuid: user?.id 
      });
      
      const clubOwnerId = ownerIdData || user?.id;
      const isOwner = clubOwnerId === user?.id;

      let query = supabase
        .from('documents')
        .select('*')
        .eq('user_id', clubOwnerId);

      // Se non sei il proprietario, mostra solo documenti pubblicati/archiviati
      if (!isOwner) {
        query = query.in('status', ['published', 'archived']);
      }

      const { data, error } = await query.order('updated_at', { ascending: false });

      if (error) throw error;
      
      setDocuments((data || []).map(doc => ({
        id: doc.id,
        title: doc.title,
        type: doc.type as 'verbali' | 'programmi' | 'comunicazioni' | 'circolari',
        status: doc.status as 'draft' | 'published' | 'archived',
        document_number: doc.document_number || '',
        created_at: doc.created_at,
        updated_at: doc.updated_at
      })));
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento dei documenti",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const loadTemplates = async () => {
    try {
      // Get club owner ID first
      const { data: ownerIdData } = await supabase.rpc('get_club_owner_id', { 
        user_uuid: user?.id 
      });
      
      const clubOwnerId = ownerIdData || user?.id;

      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('user_id', clubOwnerId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento dei template",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const deleteDocument = async (documentId: string, documentTitle: string) => {
    try {
      // Get club owner ID first
      const { data: ownerIdData } = await supabase.rpc('get_club_owner_id', { 
        user_uuid: user?.id 
      });
      
      const clubOwnerId = ownerIdData || user?.id;

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)
        .eq('user_id', clubOwnerId);

      if (error) throw error;

      toast({
        title: "Documento eliminato",
        description: `"${documentTitle}" è stato eliminato con successo`,
      });
      
      loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Errore",
        description: "Errore nell'eliminazione del documento",
        variant: "destructive",
      });
    }
  };

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
    { 
      id: 'verbali', 
      name: 'Verbali Riunioni', 
      count: documents.filter(d => d.type === 'verbali').length, 
      color: 'bg-blue-100 text-blue-800' 
    },
    { 
      id: 'programmi', 
      name: 'Programmi Mensili', 
      count: documents.filter(d => d.type === 'programmi').length, 
      color: 'bg-green-100 text-green-800' 
    },
    { 
      id: 'comunicazioni', 
      name: 'Comunicazioni Ufficiali', 
      count: documents.filter(d => d.type === 'comunicazioni').length, 
      color: 'bg-purple-100 text-purple-800' 
    },
    { 
      id: 'circolari', 
      name: 'Circolari', 
      count: documents.filter(d => d.type === 'circolari').length, 
      color: 'bg-orange-100 text-orange-800' 
    }
  ];

  const recentDocuments = documents.slice(0, 5);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Bozza</Badge>;
      case 'published':
        return <Badge variant="default">Pubblicato</Badge>;
      case 'archived':
        return <Badge variant="outline">Archiviato</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    const typeMap = {
      'verbali': 'Verbale',
      'programmi': 'Programma',
      'comunicazioni': 'Comunicazione', 
      'circolari': 'Circolare'
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
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
            
            <Button onClick={() => navigate('/create-document')}>
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Documento
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <SectionResponsible section="segreteria" />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="documenti">Documenti</TabsTrigger>
            <TabsTrigger value="segreteria-ai">
              <Mic className="w-4 h-4 mr-2" />
              Segreteria AI
            </TabsTrigger>
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
                    <Button className="w-full" variant="outline" size="sm" onClick={() => navigate(`/create-document?type=${type.id}`)}>
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
                {isLoadingDocuments ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Caricamento documenti...</p>
                  </div>
                ) : recentDocuments.length > 0 ? (
                  <div className="space-y-4">
                    {recentDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{doc.title}</h4>
                              {getStatusBadge(doc.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span>{getTypeLabel(doc.type)}</span>
                              <span>•</span>
                              <span>{doc.document_number}</span>
                              <span>•</span>
                              <span>{formatDate(doc.updated_at)}</span>
                            </div>
                          </div>
                        </div>
                         <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/document/${doc.id}?tab=preview`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/document/${doc.id}/edit`)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                           <AlertDialog>
                             <AlertDialogTrigger asChild>
                               <Button 
                                 variant="ghost" 
                                 size="sm"
                                 className="text-destructive hover:text-destructive"
                               >
                                 <Trash2 className="w-4 h-4" />
                               </Button>
                             </AlertDialogTrigger>
                             <AlertDialogContent>
                               <AlertDialogHeader>
                                 <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
                                 <AlertDialogDescription>
                                   Sei sicuro di voler eliminare il documento "{doc.title}"? 
                                   Questa azione non può essere annullata.
                                 </AlertDialogDescription>
                               </AlertDialogHeader>
                               <AlertDialogFooter>
                                 <AlertDialogCancel>Annulla</AlertDialogCancel>
                                 <AlertDialogAction 
                                   onClick={() => deleteDocument(doc.id, doc.title)}
                                   className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                 >
                                   Elimina
                                 </AlertDialogAction>
                               </AlertDialogFooter>
                             </AlertDialogContent>
                           </AlertDialog>
                         </div>
                      </div>
                    ))}
                    {documents.length > 5 && (
                      <div className="text-center pt-4">
                        <Button variant="outline" size="sm">
                          Vedi tutti i documenti ({documents.length})
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nessun documento trovato</p>
                    <p className="text-sm">Inizia creando il tuo primo documento</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="segreteria-ai" className="space-y-6">
            <SegreteriAI />
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Template Documenti</CardTitle>
                    <CardDescription>Modelli predefiniti per velocizzare la creazione di documenti</CardDescription>
                  </div>
                  <Button onClick={() => setActiveTab('editor-template')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Crea Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingTemplates ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Caricamento template...</p>
                  </div>
                ) : templates.length > 0 ? (
                  <div className="grid gap-4">
                    {templates.map((template) => (
                      <div key={template.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{template.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Creato il {new Date(template.created_at).toLocaleDateString('it-IT')}
                            </p>
                            {template.is_default && (
                              <Badge variant="secondary" className="mt-1">Default</Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setActiveTab('editor-template')}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Modifica
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                try {
                                  const { error } = await supabase
                                    .from('document_templates')
                                    .delete()
                                    .eq('id', template.id);

                                  if (error) throw error;

                                  toast({
                                    title: "Template eliminato",
                                    description: "Template eliminato con successo",
                                  });
                                  
                                  loadTemplates();
                                } catch (error) {
                                  toast({
                                    title: "Errore",
                                    description: "Errore nell'eliminazione del template",
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          <div>Logo: {(template.settings as any)?.logo_position || 'Non impostato'}</div>
                          <div>Header: {(template.settings as any)?.header_alignment || 'Non impostato'}</div>
                          <div>Footer: {(template.settings as any)?.footer_alignment || 'Non impostato'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-medium mb-2">Nessun template disponibile</h3>
                    <p className="text-muted-foreground mb-6">
                      Crea il tuo primo template per personalizzare l'aspetto dei documenti
                    </p>
                    <Button onClick={() => setActiveTab('editor-template')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Crea il tuo primo template
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="editor-template">
            <div className="mb-6">
              <Button variant="outline" onClick={() => setActiveTab('templates')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Torna ai Template
              </Button>
            </div>
            <TemplateEditor onTemplateSaved={() => {
              loadTemplates();
              setActiveTab('templates');
            }} />
          </TabsContent>

          <TabsContent value="archivio">
            <Card>
              <CardHeader>
                <CardTitle>Archivio Documenti</CardTitle>
                <CardDescription>
                  Tutti i documenti salvati ({documents.length})
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingDocuments ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Caricamento archivio...</p>
                  </div>
                ) : documents.length > 0 ? (
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{doc.title}</h4>
                              {getStatusBadge(doc.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span>{getTypeLabel(doc.type)}</span>
                              <span>•</span>
                              <span>{doc.document_number}</span>
                              <span>•</span>
                              <span>Creato: {formatDate(doc.created_at)}</span>
                              <span>•</span>
                              <span>Aggiornato: {formatDate(doc.updated_at)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/document/${doc.id}?tab=preview`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/document/${doc.id}/edit`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Archivio vuoto</p>
                    <p className="text-sm">I documenti salvati appariranno qui</p>
                  </div>
                )}
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
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200" onClick={() => navigate('/recurring-meetings')}>
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