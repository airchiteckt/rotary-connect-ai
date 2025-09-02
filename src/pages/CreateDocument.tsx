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
  Calendar,
  Plus,
  X,
  MapPin
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
        { key: 'mese', label: 'Mese', type: 'month-select', required: true },
        { key: 'anno_rotariano', label: 'Anno Rotariano', type: 'rotary-year', required: true },
        { key: 'tema', label: 'Tema del Mese', type: 'text', required: true },
        { key: 'eventi', label: 'Eventi Principali', type: 'events', required: true },
        { key: 'riunioni', label: 'Calendario Riunioni', type: 'meetings', required: true },
        { key: 'comunicazioni_presidente', label: 'Comunicazioni dal Presidente', type: 'richtext', required: false },
        { key: 'progetti', label: 'Progetti in Corso', type: 'richtext', required: false },
        { key: 'service', label: 'Attività di Service', type: 'richtext', required: false },
        { key: 'background_template', label: 'Template di Sfondo', type: 'template-select', required: false }
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
      const { data, error } = await supabase.functions.invoke('generate-document-ai', {
        body: {
          type: formData.type,
          currentContent: formData.content,
          clubName: profile?.club_name || 'Rotary Club',
          additionalContext: formData.title
        }
      });

      if (error) throw error;

      if (data.success) {
        // Apply AI suggestions to form content
        const updatedContent = { ...formData.content };
        Object.entries(data.suggestions).forEach(([key, value]) => {
          if (!updatedContent[key] || updatedContent[key].trim() === '') {
            updatedContent[key] = value;
          }
        });

        setFormData(prev => ({
          ...prev,
          content: updatedContent,
          ai_summary: data.summary || prev.ai_summary
        }));

        toast({
          title: "Contenuto generato con AI",
          description: "I campi sono stati compilati automaticamente",
        });
      } else {
        throw new Error(data.error || 'Errore nella generazione AI');
      }
    } catch (error) {
      console.error('Error generating with AI:', error);
      toast({
        title: "Errore",
        description: "Errore nella generazione AI. Riprova più tardi.",
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
      case 'events':
        const events = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-4">
            {events.map((event, index) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-sm">Evento {index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const updatedEvents = events.filter((_, i) => i !== index);
                      updateContent(section.key, updatedEvents);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Titolo *</Label>
                    <Input
                      value={event.title || ''}
                      onChange={(e) => {
                        const updatedEvents = [...events];
                        updatedEvents[index] = { ...event, title: e.target.value };
                        updateContent(section.key, updatedEvents);
                      }}
                      placeholder="Nome evento"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Data *</Label>
                    <Input
                      type="date"
                      value={event.date || ''}
                      onChange={(e) => {
                        const updatedEvents = [...events];
                        updatedEvents[index] = { ...event, date: e.target.value };
                        updateContent(section.key, updatedEvents);
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Luogo</Label>
                    <Input
                      value={event.location || ''}
                      onChange={(e) => {
                        const updatedEvents = [...events];
                        updatedEvents[index] = { ...event, location: e.target.value };
                        updateContent(section.key, updatedEvents);
                      }}
                      placeholder="Luogo evento"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Orario</Label>
                    <Input
                      type="time"
                      value={event.time || ''}
                      onChange={(e) => {
                        const updatedEvents = [...events];
                        updatedEvents[index] = { ...event, time: e.target.value };
                        updateContent(section.key, updatedEvents);
                      }}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <Label className="text-xs">Descrizione</Label>
                  <Textarea
                    value={event.description || ''}
                    onChange={(e) => {
                      const updatedEvents = [...events];
                      updatedEvents[index] = { ...event, description: e.target.value };
                      updateContent(section.key, updatedEvents);
                    }}
                    placeholder="Descrizione dell'evento"
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </Card>
            ))}
            <Button
              variant="outline"
              onClick={() => {
                const newEvent = {
                  title: '',
                  date: '',
                  location: '',
                  time: '',
                  description: ''
                };
                updateContent(section.key, [...events, newEvent]);
              }}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Evento
            </Button>
          </div>
        );
      case 'meetings':
        const meetings = Array.isArray(value) ? value : [];
        const meetingTypes = [
          { value: 'direttivo', label: 'Consiglio Direttivo', icon: '👥' },
          { value: 'assemblea', label: 'Assemblea dei Soci', icon: '🏛️' },
          { value: 'caminetto', label: 'Caminetto', icon: '🔥' }
        ];
        return (
          <div className="space-y-4">
            {meetings.map((meeting, index) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-sm">Riunione {index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const updatedMeetings = meetings.filter((_, i) => i !== index);
                      updateContent(section.key, updatedMeetings);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Tipo Riunione *</Label>
                    <Select
                      value={meeting.type || ''}
                      onValueChange={(selectedType) => {
                        const updatedMeetings = [...meetings];
                        updatedMeetings[index] = { ...meeting, type: selectedType };
                        updateContent(section.key, updatedMeetings);
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Seleziona tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {meetingTypes.map((type) => (
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
                  <div>
                    <Label className="text-xs">Data *</Label>
                    <Input
                      type="date"
                      value={meeting.date || ''}
                      onChange={(e) => {
                        const updatedMeetings = [...meetings];
                        updatedMeetings[index] = { ...meeting, date: e.target.value };
                        updateContent(section.key, updatedMeetings);
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Orario</Label>
                    <Input
                      type="time"
                      value={meeting.time || ''}
                      onChange={(e) => {
                        const updatedMeetings = [...meetings];
                        updatedMeetings[index] = { ...meeting, time: e.target.value };
                        updateContent(section.key, updatedMeetings);
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Luogo</Label>
                    <Input
                      value={meeting.location || ''}
                      onChange={(e) => {
                        const updatedMeetings = [...meetings];
                        updatedMeetings[index] = { ...meeting, location: e.target.value };
                        updateContent(section.key, updatedMeetings);
                      }}
                      placeholder="Luogo riunione"
                      className="mt-1"
                    />
                  </div>
                </div>
              </Card>
            ))}
            <Button
              variant="outline"
              onClick={() => {
                const newMeeting = {
                  type: '',
                  date: '',
                  time: '',
                  location: ''
                };
                updateContent(section.key, [...meetings, newMeeting]);
              }}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Riunione
            </Button>
          </div>
        );
      case 'month-select':
        const months = [
          { value: 'gennaio', label: 'Gennaio', short: 'Genn' },
          { value: 'febbraio', label: 'Febbraio', short: 'Febb' },
          { value: 'marzo', label: 'Marzo', short: 'Mar' },
          { value: 'aprile', label: 'Aprile', short: 'Apr' },
          { value: 'maggio', label: 'Maggio', short: 'Mag' },
          { value: 'giugno', label: 'Giugno', short: 'Giu' },
          { value: 'luglio', label: 'Luglio', short: 'Lug' },
          { value: 'agosto', label: 'Agosto', short: 'Ago' },
          { value: 'settembre', label: 'Settembre', short: 'Sett' },
          { value: 'ottobre', label: 'Ottobre', short: 'Ott' },
          { value: 'novembre', label: 'Novembre', short: 'Nov' },
          { value: 'dicembre', label: 'Dicembre', short: 'Dic' }
        ];
        return (
          <Select
            value={value}
            onValueChange={(selectedValue) => updateContent(section.key, selectedValue)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona mese" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  <span className="flex items-center gap-2">
                    <span className="font-medium">{month.short}</span>
                    <span className="text-muted-foreground">({month.label})</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'rotary-year':
        const currentYear = new Date().getFullYear();
        const rotaryYear = `A.R. ${currentYear}-${currentYear + 1}`;
        // Auto-populate if empty
        if (!value) {
          updateContent(section.key, rotaryYear);
        }
        return (
          <div className="bg-muted p-3 rounded-md flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">{rotaryYear}</span>
            <span className="text-xs text-muted-foreground ml-auto">Anno Rotariano Corrente</span>
          </div>
        );
      case 'template-select':
        const templates = [
          { value: 'classic', label: 'Template Classico', description: 'Design tradizionale con intestazione Rotary' },
          { value: 'modern', label: 'Template Moderno', description: 'Design contemporaneo con elementi grafici' },
          { value: 'elegant', label: 'Template Elegante', description: 'Stile raffinato con bordi decorativi' },
          { value: 'minimal', label: 'Template Minimal', description: 'Design pulito e minimalista' }
        ];
        return (
          <Select
            value={value}
            onValueChange={(selectedValue) => updateContent(section.key, selectedValue)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona template di sfondo" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.value} value={template.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{template.label}</span>
                    <span className="text-xs text-muted-foreground">{template.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                        
                        // Handle month-select display
                        if (section.type === 'month-select') {
                          return (
                            <div key={section.key} className="space-y-2">
                              <h3 className="font-semibold text-lg">{section.label}</h3>
                              <div className="text-sm capitalize font-medium">{value}</div>
                            </div>
                          );
                        }
                        
                        // Handle rotary-year display
                        if (section.type === 'rotary-year') {
                          return (
                            <div key={section.key} className="space-y-2">
                              <h3 className="font-semibold text-lg">{section.label}</h3>
                              <div className="text-sm font-medium text-blue-600">{value}</div>
                            </div>
                          );
                        }
                        
                        // Handle template-select display
                        if (section.type === 'template-select') {
                          const templateLabels = {
                            'classic': 'Template Classico',
                            'modern': 'Template Moderno', 
                            'elegant': 'Template Elegante',
                            'minimal': 'Template Minimal'
                          };
                          return (
                            <div key={section.key} className="space-y-2">
                              <h3 className="font-semibold text-lg">{section.label}</h3>
                              <div className="text-sm">{templateLabels[value] || value}</div>
                            </div>
                          );
                        }
                        
                        // Handle events display
                        if (section.type === 'events' && Array.isArray(value)) {
                          return (
                            <div key={section.key} className="space-y-3">
                              <h3 className="font-semibold text-lg">{section.label}</h3>
                              <div className="space-y-3">
                                {value.map((event, index) => (
                                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-start justify-between mb-2">
                                      <h4 className="font-medium text-base">{event.title}</h4>
                                      {event.date && (
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                          <Calendar className="w-4 h-4" />
                                          {new Date(event.date).toLocaleDateString('it-IT')}
                                          {event.time && ` - ${event.time}`}
                                        </div>
                                      )}
                                    </div>
                                    {event.location && (
                                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                                        <MapPin className="w-4 h-4" />
                                        {event.location}
                                      </div>
                                    )}
                                    {event.description && (
                                      <p className="text-sm text-gray-700">{event.description}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        
                        // Handle meetings display
                        if (section.type === 'meetings' && Array.isArray(value)) {
                          const meetingTypeLabels = {
                            'direttivo': { label: 'Consiglio Direttivo', icon: '👥' },
                            'assemblea': { label: 'Assemblea dei Soci', icon: '🏛️' },
                            'caminetto': { label: 'Caminetto', icon: '🔥' }
                          };
                          
                          return (
                            <div key={section.key} className="space-y-3">
                              <h3 className="font-semibold text-lg">{section.label}</h3>
                              <div className="space-y-3">
                                {value.map((meeting, index) => {
                                  const meetingInfo = meetingTypeLabels[meeting.type];
                                  return (
                                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <span>{meetingInfo?.icon}</span>
                                          <h4 className="font-medium text-base">{meetingInfo?.label}</h4>
                                        </div>
                                        {meeting.date && (
                                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(meeting.date).toLocaleDateString('it-IT')}
                                            {meeting.time && ` - ${meeting.time}`}
                                          </div>
                                        )}
                                      </div>
                                      {meeting.location && (
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                          <MapPin className="w-4 h-4" />
                                          {meeting.location}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }
                        
                        // Handle regular text fields
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