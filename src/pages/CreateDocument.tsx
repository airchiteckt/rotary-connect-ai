import { useState, useEffect } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  ArrowLeft, 
  Save, 
  Eye, 
  Wand2, 
  Download, 
  Settings,
  Clock,
  User,
  Calendar
} from 'lucide-react';

export default function CreateDocument() {
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    type: searchParams.get('type') || 'verbali',
    content: {},
    ai_summary: '',
    status: 'draft'
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');

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
    { value: 'verbali', label: 'Verbale Riunione', icon: '📝', color: 'bg-blue-100 text-blue-800' },
    { value: 'programmi', label: 'Programma Mensile', icon: '📅', color: 'bg-green-100 text-green-800' },
    { value: 'comunicazioni', label: 'Comunicazione Ufficiale', icon: '📢', color: 'bg-purple-100 text-purple-800' },
    { value: 'circolari', label: 'Circolare', icon: '📬', color: 'bg-orange-100 text-orange-800' }
  ];

  const currentDocType = documentTypes.find(type => type.value === formData.type);

  const templates = {
    verbali: {
      sections: [
        { key: 'data', label: 'Data e Ora', type: 'datetime', required: true },
        { key: 'luogo', label: 'Luogo', type: 'text', required: true },
        { key: 'presenti', label: 'Presenti', type: 'textarea', required: true },
        { key: 'assenti', label: 'Assenti Giustificati', type: 'textarea', required: false },
        { key: 'odg', label: 'Ordine del Giorno', type: 'textarea', required: true },
        { key: 'delibere', label: 'Delibere e Decisioni', type: 'richtext', required: true },
        { key: 'varie', label: 'Varie ed Eventuali', type: 'richtext', required: false }
      ]
    },
    programmi: {
      sections: [
        { key: 'mese', label: 'Mese/Anno', type: 'text', required: true },
        { key: 'tema', label: 'Tema del Mese', type: 'text', required: true },
        { key: 'eventi', label: 'Eventi Principali', type: 'richtext', required: true },
        { key: 'riunioni', label: 'Calendario Riunioni', type: 'richtext', required: true },
        { key: 'progetti', label: 'Progetti in Corso', type: 'richtext', required: false },
        { key: 'service', label: 'Attività di Service', type: 'richtext', required: false }
      ]
    },
    comunicazioni: {
      sections: [
        { key: 'destinatari', label: 'Destinatari', type: 'text', required: true },
        { key: 'oggetto', label: 'Oggetto', type: 'text', required: true },
        { key: 'corpo', label: 'Corpo della Comunicazione', type: 'richtext', required: true },
        { key: 'scadenza', label: 'Data Scadenza', type: 'date', required: false },
        { key: 'allegati', label: 'Allegati', type: 'text', required: false }
      ]
    },
    circolari: {
      sections: [
        { key: 'numero', label: 'Numero Circolare', type: 'text', required: true },
        { key: 'oggetto', label: 'Oggetto', type: 'text', required: true },
        { key: 'contenuto', label: 'Contenuto', type: 'richtext', required: true },
        { key: 'scadenza', label: 'Scadenza Risposta', type: 'date', required: false }
      ]
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          title: formData.title,
          type: formData.type,
          content: formData.content,
          ai_summary: formData.ai_summary,
          status: formData.status,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Documento salvato",
        description: "Il documento è stato salvato con successo",
      });

      navigate('/segreteria');
    } catch (error) {
      console.error('Error saving document:', error);
      toast({
        title: "Errore",
        description: "Errore nel salvataggio del documento",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const generateWithAI = async () => {
    setIsGenerating(true);
    try {
      // Qui implementeremo l'integrazione con AI per generare contenuto
      toast({
        title: "Funzione AI",
        description: "Generazione AI in preparazione - sarà disponibile presto",
      });
    } catch (error) {
      console.error('Error generating with AI:', error);
      toast({
        title: "Errore",
        description: "Errore nella generazione AI",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderFormField = (section: any) => {
    const value = formData.content[section.key] || '';
    
    const updateContent = (key: string, value: any) => {
      setFormData(prev => ({
        ...prev,
        content: { ...prev.content, [key]: value }
      }));
    };

    switch (section.type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => updateContent(section.key, e.target.value)}
            placeholder={`Inserisci ${section.label.toLowerCase()}`}
          />
        );
      case 'datetime':
        return (
          <Input
            type="datetime-local"
            value={value}
            onChange={(e) => updateContent(section.key, e.target.value)}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => updateContent(section.key, e.target.value)}
          />
        );
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => updateContent(section.key, e.target.value)}
            placeholder={`Inserisci ${section.label.toLowerCase()}`}
            rows={3}
          />
        );
      case 'richtext':
        return (
          <Textarea
            value={value}
            onChange={(e) => updateContent(section.key, e.target.value)}
            placeholder={`Inserisci ${section.label.toLowerCase()}`}
            rows={6}
            className="min-h-[150px]"
          />
        );
      default:
        return (
          <Input
            value={value}
            onChange={(e) => updateContent(section.key, e.target.value)}
            placeholder={`Inserisci ${section.label.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/segreteria')}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Crea Documento</h1>
                <p className="text-sm text-muted-foreground">
                  {currentDocType?.label} - {currentDocType?.icon}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Anteprima
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={generateWithAI}
                disabled={isGenerating}
              >
                <Wand2 className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generando...' : 'AI Assist'}
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving || !formData.title}
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Salvando...' : 'Salva'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="settings">Impostazioni</TabsTrigger>
              <TabsTrigger value="preview">Anteprima</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-6">
              {/* Document Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <span>{currentDocType?.icon}</span>
                        {currentDocType?.label}
                      </CardTitle>
                      <CardDescription>
                        Compila i campi richiesti per creare il documento
                      </CardDescription>
                    </div>
                    <Badge className={currentDocType?.color}>
                      {formData.status === 'draft' ? 'Bozza' : 'Completato'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Titolo Documento *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Inserisci il titolo del documento"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Tipo Documento</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <span className="flex items-center gap-2">
                              <span>{type.icon}</span>
                              {type.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Document Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Contenuto Documento</CardTitle>
                  <CardDescription>
                    Compila i campi specifici per questo tipo di documento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {templates[formData.type]?.sections.map((section) => (
                      <div key={section.key} className="space-y-2">
                        <Label htmlFor={section.key}>
                          {section.label}
                          {section.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        {renderFormField(section)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Riassunto AI</CardTitle>
                  <CardDescription>
                    Riassunto automatico del documento (opzionale)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.ai_summary}
                    onChange={(e) => setFormData(prev => ({ ...prev, ai_summary: e.target.value }))}
                    placeholder="Il riassunto AI apparirà qui automaticamente..."
                    rows={3}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Impostazioni Documento</CardTitle>
                  <CardDescription>
                    Configura le impostazioni avanzate del documento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Stato Documento</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Bozza</SelectItem>
                          <SelectItem value="review">In Revisione</SelectItem>
                          <SelectItem value="approved">Approvato</SelectItem>
                          <SelectItem value="published">Pubblicato</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Autore</Label>
                      <div className="mt-1 p-2 bg-muted rounded-md flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="text-sm">{profile?.full_name}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Data Creazione</Label>
                    <div className="mt-1 p-2 bg-muted rounded-md flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{new Date().toLocaleDateString('it-IT')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview">
              <Card>
                <CardHeader>
                  <CardTitle>Anteprima Documento</CardTitle>
                  <CardDescription>
                    Visualizza come apparirà il documento finale
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-white p-8 rounded-lg border shadow-sm">
                    <div className="space-y-6">
                      <div className="text-center border-b pb-4">
                        <h1 className="text-2xl font-bold">{formData.title || 'Titolo Documento'}</h1>
                        <p className="text-muted-foreground mt-2">{currentDocType?.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {profile?.club_name} - {new Date().toLocaleDateString('it-IT')}
                        </p>
                      </div>
                      
                      {templates[formData.type]?.sections.map((section) => {
                        const value = formData.content[section.key];
                        if (!value) return null;
                        
                        return (
                          <div key={section.key} className="space-y-2">
                            <h3 className="font-semibold text-lg">{section.label}</h3>
                            <div className="text-sm whitespace-pre-wrap">{value}</div>
                          </div>
                        );
                      })}
                      
                      {formData.ai_summary && (
                        <div className="border-t pt-4">
                          <h3 className="font-semibold text-lg">Riassunto</h3>
                          <p className="text-sm text-muted-foreground mt-2">{formData.ai_summary}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}