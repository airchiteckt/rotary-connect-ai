import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Search, Filter, ArrowLeft, Settings, Calendar, Edit, Eye, Trash2, Mic } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TemplateEditor } from '@/components/TemplateEditor';
import SegreteriAI from '@/components/SegreteriAI';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { SectionResponsible } from '@/components/SectionResponsible';
import SectionPageLayout from '@/components/shared/SectionPageLayout';
import SectionPageHeader from '@/components/shared/SectionPageHeader';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface Document {
  id: string;
  title: string;
  type: 'verbali' | 'programmi' | 'comunicazioni' | 'circolari';
  status: 'draft' | 'published' | 'archived';
  document_number: string;
  created_at: string;
  updated_at: string;
  approved: boolean;
}

export default function Segreteria() {
  return (
    <SectionPageLayout bgGradient="bg-gradient-to-br from-blue-50 to-indigo-100">
      {(user) => <SegreteriaContent user={user} />}
    </SectionPageLayout>
  );
}

function SegreteriaContent({ user }: { user: { id: string } }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('documenti');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
    loadTemplates();
  }, [user]);

  const getClubOwnerId = async () => {
    const { data } = await supabase.rpc('get_club_owner_id', { user_uuid: user.id });
    return data || user.id;
  };

  const loadDocuments = async () => {
    try {
      const clubOwnerId = await getClubOwnerId();
      const isOwner = clubOwnerId === user.id;

      let query = supabase.from('documents').select('*').eq('user_id', clubOwnerId);
      if (!isOwner) query = query.in('status', ['published', 'archived']);

      const { data, error } = await query.order('updated_at', { ascending: false });
      if (error) throw error;
      
      setDocuments((data || []).map(doc => ({
        id: doc.id, title: doc.title,
        type: doc.type as Document['type'],
        status: doc.status as Document['status'],
        document_number: doc.document_number || '',
        created_at: doc.created_at, updated_at: doc.updated_at,
        approved: doc.approved || false
      })));
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({ title: "Errore", description: "Errore nel caricamento dei documenti", variant: "destructive" });
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const clubOwnerId = await getClubOwnerId();
      const { data, error } = await supabase
        .from('document_templates').select('*')
        .eq('user_id', clubOwnerId).order('updated_at', { ascending: false });
      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({ title: "Errore", description: "Errore nel caricamento dei template", variant: "destructive" });
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const deleteDocument = async (documentId: string, documentTitle: string) => {
    try {
      const clubOwnerId = await getClubOwnerId();
      const { error } = await supabase.from('documents').delete().eq('id', documentId).eq('user_id', clubOwnerId);
      if (error) throw error;
      toast({ title: "Documento eliminato", description: `"${documentTitle}" è stato eliminato con successo` });
      loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({ title: "Errore", description: "Errore nell'eliminazione del documento", variant: "destructive" });
    }
  };

  const toggleApproved = async (documentId: string, currentApproved: boolean) => {
    try {
      const clubOwnerId = await getClubOwnerId();
      const newStatus = !currentApproved ? 'published' : 'draft';
      const { error } = await supabase.from('documents')
        .update({ approved: !currentApproved, status: newStatus })
        .eq('id', documentId).eq('user_id', clubOwnerId);
      if (error) throw error;
      toast({
        title: !currentApproved ? "Documento approvato" : "Approvazione rimossa",
        description: !currentApproved ? "Il documento è stato approvato e pubblicato" : "Il documento è tornato in bozza",
      });
      loadDocuments();
    } catch (error) {
      console.error('Error toggling approval:', error);
      toast({ title: "Errore", description: "Errore nell'aggiornamento dello stato di approvazione", variant: "destructive" });
    }
  };

  const documentTypes = [
    { id: 'verbali', name: 'Verbali Riunioni', count: documents.filter(d => d.type === 'verbali').length, color: 'bg-blue-100 text-blue-800' },
    { id: 'programmi', name: 'Programmi Mensili', count: documents.filter(d => d.type === 'programmi').length, color: 'bg-green-100 text-green-800' },
    { id: 'comunicazioni', name: 'Comunicazioni', count: documents.filter(d => d.type === 'comunicazioni').length, color: 'bg-purple-100 text-purple-800' },
    { id: 'circolari', name: 'Circolari', count: documents.filter(d => d.type === 'circolari').length, color: 'bg-orange-100 text-orange-800' }
  ];

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'secondary' | 'default' | 'outline' }> = {
      draft: { label: 'Bozza', variant: 'secondary' },
      published: { label: 'Pubblicato', variant: 'default' },
      archived: { label: 'Archiviato', variant: 'outline' },
    };
    const config = map[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = { verbali: 'Verbale', programmi: 'Programma', comunicazioni: 'Comunicazione', circolari: 'Circolare' };
    return map[type] || type;
  };

  const recentDocuments = documents.slice(0, 5);

  return (
    <>
      <SectionPageHeader
        title="Segreteria"
        subtitle="Gestione documenti e comunicazioni ufficiali"
        icon={FileText}
        iconColor="bg-blue-600"
        actions={
          <Button size="sm" onClick={() => navigate('/create-document')}>
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Nuovo Documento</span>
          </Button>
        }
      />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <SectionResponsible section="segreteria" />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex w-auto min-w-full sm:grid sm:grid-cols-6">
              <TabsTrigger value="documenti" className="text-xs sm:text-sm">Documenti</TabsTrigger>
              <TabsTrigger value="segreteria-ai" className="text-xs sm:text-sm">
                <Mic className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                AI
              </TabsTrigger>
              <TabsTrigger value="templates" className="text-xs sm:text-sm">Template</TabsTrigger>
              <TabsTrigger value="archivio" className="text-xs sm:text-sm">Archivio</TabsTrigger>
              <TabsTrigger value="statistiche" className="text-xs sm:text-sm">Statistiche</TabsTrigger>
              <TabsTrigger value="impostazioni" className="text-xs sm:text-sm">Impostazioni</TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <TabsContent value="documenti" className="space-y-4 sm:space-y-6">
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Cerca documenti..." className="pl-10" />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtri
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              {documentTypes.map((type) => (
                <Card key={type.id} className="cursor-pointer hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs sm:text-sm font-medium">{type.name}</CardTitle>
                      <Badge className={type.color}>{type.count}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                    <Button className="w-full" variant="outline" size="sm" onClick={() => navigate(`/create-document?type=${type.id}`)}>
                      Gestisci
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Documenti Recenti</CardTitle>
                <CardDescription>Gli ultimi documenti creati o modificati</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingDocuments ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Caricamento documenti...</p>
                  </div>
                ) : recentDocuments.length > 0 ? (
                  <div className="space-y-3">
                    {recentDocuments.map((doc) => (
                      <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 gap-3">
                        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-medium text-sm sm:text-base truncate">{doc.title}</h4>
                              {getStatusBadge(doc.status)}
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-1 flex-wrap">
                              <span>{getTypeLabel(doc.type)}</span>
                              <span className="hidden sm:inline">•</span>
                              <span className="hidden sm:inline">{doc.document_number}</span>
                              <span className="hidden sm:inline">•</span>
                              <span>{formatDate(doc.updated_at)}</span>
                            </div>
                            {(doc.type === 'verbali' || doc.type === 'programmi') && (
                              <div className="flex items-center gap-2 mt-2">
                                <Checkbox id={`approved-${doc.id}`} checked={doc.approved} onCheckedChange={() => toggleApproved(doc.id, doc.approved)} />
                                <Label htmlFor={`approved-${doc.id}`} className="text-sm font-medium cursor-pointer">Approvato</Label>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 self-end sm:self-center flex-shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/document/${doc.id}?tab=preview`)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/document/${doc.id}/edit`)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Sei sicuro di voler eliminare il documento "{doc.title}"? Questa azione non può essere annullata.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annulla</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteDocument(doc.id, doc.title)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
                        <Button variant="outline" size="sm" onClick={() => setActiveTab('archivio')}>
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base sm:text-lg">Template Documenti</CardTitle>
                    <CardDescription>Modelli predefiniti per velocizzare la creazione</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => setActiveTab('editor-template')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Crea Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingTemplates ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Caricamento template...</p>
                  </div>
                ) : templates.length > 0 ? (
                  <div className="grid gap-4">
                    {templates.map((template) => (
                      <div key={template.id} className="border rounded-lg p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 mb-2">
                          <div>
                            <h3 className="font-medium text-sm sm:text-base">{template.name}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Creato il {new Date(template.created_at).toLocaleDateString('it-IT')}
                            </p>
                            {template.is_default && <Badge variant="secondary" className="mt-1">Default</Badge>}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setActiveTab('editor-template')}>
                              <Edit className="h-4 w-4 mr-1" />
                              Modifica
                            </Button>
                            <Button variant="outline" size="sm" onClick={async () => {
                              try {
                                const { error } = await supabase.from('document_templates').delete().eq('id', template.id);
                                if (error) throw error;
                                toast({ title: "Template eliminato", description: "Template eliminato con successo" });
                                loadTemplates();
                              } catch {
                                toast({ title: "Errore", description: "Errore nell'eliminazione del template", variant: "destructive" });
                              }
                            }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          <div>Logo: {(template.settings as any)?.logo_position || 'Non impostato'}</div>
                          <div>Header: {(template.settings as any)?.header_alignment || 'Non impostato'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-medium mb-2">Nessun template disponibile</h3>
                    <p className="text-muted-foreground mb-6">Crea il tuo primo template per personalizzare l'aspetto dei documenti</p>
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
            <TemplateEditor onTemplateSaved={() => { loadTemplates(); setActiveTab('templates'); }} />
          </TabsContent>

          <TabsContent value="archivio">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Archivio Documenti</CardTitle>
                <CardDescription>Tutti i documenti salvati ({documents.length})</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingDocuments ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Caricamento archivio...</p>
                  </div>
                ) : documents.length > 0 ? (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 gap-2">
                        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-medium text-sm truncate">{doc.title}</h4>
                              {getStatusBadge(doc.status)}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                              <span>{getTypeLabel(doc.type)}</span>
                              <span>•</span>
                              <span>{doc.document_number}</span>
                              <span className="hidden sm:inline">•</span>
                              <span className="hidden sm:inline">{formatDate(doc.updated_at)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 self-end sm:self-center flex-shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/document/${doc.id}?tab=preview`)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/document/${doc.id}/edit`)}>
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
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistiche">
            <Card>
              <CardHeader>
                <CardTitle>Statistiche e Report</CardTitle>
                <CardDescription>Analisi dell'attività documentale</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Statistiche in preparazione</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="impostazioni" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200" onClick={() => navigate('/recurring-meetings')}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-sm sm:text-base">Appuntamenti Ricorrenti</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Configura riunioni automatiche</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                    Imposta appuntamenti che si ripetono automaticamente.
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
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-sm sm:text-base">Template Personalizzati</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Modifica i template esistenti</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    <Settings className="w-4 h-4 mr-2" />
                    Prossimamente
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
