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
  const [documentNumber, setDocumentNumber] = useState<string>('');

  // Auto-generate title when type or relevant content changes
  useEffect(() => {
    generateAutoTitle();
  }, [formData.type, formData.content]);

  const generateAutoTitle = () => {
    let autoTitle = '';
    const clubName = profile?.club_name || 'Rotary Club';
    const content = formData.content as any; // Type assertion for content access
    
    switch (formData.type) {
      case 'verbali':
        const data = content?.data;
        if (data) {
          const date = new Date(data);
          const dateStr = date.toLocaleDateString('it-IT', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          });
          autoTitle = `Verbale di Riunione del ${dateStr} - ${clubName}`;
        } else {
          autoTitle = `Verbale di Riunione - ${clubName}`;
        }
        break;
        
      case 'programmi':
        const mese = content?.mese;
        if (mese) {
          const meseCapitalized = mese.charAt(0).toUpperCase() + mese.slice(1);
          autoTitle = `Programma del Mese di ${meseCapitalized} - ${clubName}`;
        } else {
          autoTitle = `Programma del Mese - ${clubName}`;
        }
        break;
        
      case 'comunicazioni':
        const oggetto = content?.oggetto;
        if (oggetto) {
          autoTitle = `Comunicazione: ${oggetto} - ${clubName}`;
        } else {
          autoTitle = `Comunicazione Ufficiale - ${clubName}`;
        }
        break;
        
      case 'circolari':
        const numero = content?.numero;
        const oggettoCircolare = content?.oggetto;
        if (numero && oggettoCircolare) {
          autoTitle = `Circolare n.${numero}: ${oggettoCircolare} - ${clubName}`;
        } else if (numero) {
          autoTitle = `Circolare n.${numero} - ${clubName}`;
        } else {
          autoTitle = `Circolare - ${clubName}`;
        }
        break;
        
      default:
        autoTitle = `Documento - ${clubName}`;
    }
    
    // Only update if title is empty or was auto-generated (contains club name)
    if (!formData.title || formData.title.includes(clubName)) {
      setFormData(prev => ({ ...prev, title: autoTitle }));
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
        { key: 'anno_rotariano', label: 'Anno Rotariano', type: 'rotary-year', required: false },
        { key: 'messaggio_presidente', label: 'Messaggio del Presidente', type: 'president-message', required: false },
        { key: 'calendario_incontri', label: 'Calendario degli incontri e attività', type: 'club-meetings', required: true },
        { key: 'attivita_servizio', label: 'Attività di servizio', type: 'service-activities', required: false },
        { key: 'comunicazioni_club', label: 'Comunicazioni di club', type: 'club-communications', required: false },
        { key: 'agenda_distrettuale', label: 'Agenda distrettuale e internazionale', type: 'district-agenda', required: false },
        { key: 'sezione_motivazionale', label: 'Sezione motivazionale o culturale', type: 'motivational-section', required: false },
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
        })
        .select('document_number');

      if (error) throw error;

      // Get the generated document number
      if (data && data[0]?.document_number) {
        setDocumentNumber(data[0].document_number);
      }

      toast({
        title: "Documento salvato",
        description: `Il documento ${data[0]?.document_number || ''} è stato salvato con successo`,
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

  const loadRecurringMeetings = async (sectionKey: string) => {
    try {
      const [meetingsData, districtData] = await Promise.all([
        supabase.rpc('calculate_next_meeting_dates', {
          user_uuid: user?.id,
          months_ahead: 1 // Load only current month
        }),
        supabase.rpc('get_district_events_for_month', {
          user_uuid: user?.id,
          target_month: new Date().getMonth() + 1 // JavaScript months are 0-based, SQL months are 1-based
        })
      ]);

      if (meetingsData.error) throw meetingsData.error;
      if (districtData.error) throw districtData.error;

      // Get current month and year
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Filter meetings to include only those in the current month
      const currentMonthMeetings = (meetingsData.data || []).filter(meeting => {
        const meetingDate = new Date(meeting.meeting_date);
        return meetingDate.getMonth() === currentMonth && 
               meetingDate.getFullYear() === currentYear;
      });

      // Convert the future meetings data to the meeting format expected by the form
      const futureMeetings = currentMonthMeetings.map(meeting => ({
        nome: meeting.meeting_type,
        data: meeting.meeting_date,
        orario: meeting.meeting_time,
        luogo: meeting.location || '',
        descrizione: ''
      }));

      // Convert district events to the same format
      const districtMeetings = (districtData.data || []).map(event => ({
        nome: event.nome,
        data: event.data_evento,
        orario: '', // District events don't have specific times
        luogo: event.luogo || '',
        descrizione: event.descrizione || ''
      }));

      // Combine both types of meetings
      const allMeetings = [...futureMeetings, ...districtMeetings];

      // Update the form content with the loaded meetings
      setFormData(prev => ({
        ...prev,
        content: { ...prev.content, [sectionKey]: allMeetings }
      }));

      toast({
        title: "Eventi caricati",
        description: `Caricati ${futureMeetings.length} appuntamenti club e ${districtMeetings.length} eventi distrettuali del mese corrente`,
      });
    } catch (error) {
      console.error('Error loading meetings:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento degli appuntamenti",
        variant: "destructive",
      });
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
            <div className="flex gap-2">
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
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi Riunione
              </Button>
              <Button
                variant="secondary"
                onClick={() => loadRecurringMeetings(section.key)}
                size="sm"
              >
                <Settings className="w-4 h-4 mr-2" />
                Carica Ricorrenti
              </Button>
            </div>
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
      case 'president-message':
        const presMessage = typeof value === 'object' ? value : {};
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold">Saluto ai soci</Label>
              <Textarea
                value={presMessage.saluto || ''}
                onChange={(e) => {
                  updateContent(section.key, { ...presMessage, saluto: e.target.value });
                }}
                placeholder="Saluto iniziale del presidente ai soci..."
                rows={3}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">Riflessione sul mese in corso</Label>
              <Textarea
                value={presMessage.riflessione_mese || ''}
                onChange={(e) => {
                  updateContent(section.key, { ...presMessage, riflessione_mese: e.target.value });
                }}
                placeholder="Riflessione collegata al tema Rotary internazionale del mese..."
                rows={4}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">Tema Rotary Internazionale</Label>
              <Input
                value={presMessage.tema_rotary || ''}
                onChange={(e) => {
                  updateContent(section.key, { ...presMessage, tema_rotary: e.target.value });
                }}
                placeholder="Es. Mese dell'Azione Professionale"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">Ringraziamenti e motivazione</Label>
              <Textarea
                value={presMessage.ringraziamenti || ''}
                onChange={(e) => {
                  updateContent(section.key, { ...presMessage, ringraziamenti: e.target.value });
                }}
                placeholder="Ringraziamenti e parole di motivazione per i soci..."
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
        );
      case 'club-meetings':
        const clubMeetings = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                onClick={() => loadRecurringMeetings(section.key)}
                className="flex-1"
              >
                <Clock className="w-4 h-4 mr-2" />
                Carica Ricorrenti
              </Button>
            </div>
            
            {clubMeetings.map((meeting, index) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-sm">Appuntamento {index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const updatedMeetings = clubMeetings.filter((_, i) => i !== index);
                      updateContent(section.key, updatedMeetings);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Nome *</Label>
                    <Input
                      value={meeting.nome || ''}
                      onChange={(e) => {
                        const updatedMeetings = [...clubMeetings];
                        updatedMeetings[index] = { ...meeting, nome: e.target.value };
                        updateContent(section.key, updatedMeetings);
                      }}
                      placeholder="Nome appuntamento"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Data *</Label>
                    <Input
                      type="date"
                      value={meeting.data || ''}
                      onChange={(e) => {
                        const updatedMeetings = [...clubMeetings];
                        updatedMeetings[index] = { ...meeting, data: e.target.value };
                        updateContent(section.key, updatedMeetings);
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Orario</Label>
                    <Input
                      type="time"
                      value={meeting.orario || ''}
                      onChange={(e) => {
                        const updatedMeetings = [...clubMeetings];
                        updatedMeetings[index] = { ...meeting, orario: e.target.value };
                        updateContent(section.key, updatedMeetings);
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Luogo</Label>
                    <Input
                      value={meeting.luogo || ''}
                      onChange={(e) => {
                        const updatedMeetings = [...clubMeetings];
                        updatedMeetings[index] = { ...meeting, luogo: e.target.value };
                        updateContent(section.key, updatedMeetings);
                      }}
                      placeholder="Luogo appuntamento"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <Label className="text-xs">Descrizione</Label>
                  <Textarea
                    value={meeting.descrizione || ''}
                    onChange={(e) => {
                      const updatedMeetings = [...clubMeetings];
                      updatedMeetings[index] = { ...meeting, descrizione: e.target.value };
                      updateContent(section.key, updatedMeetings);
                    }}
                    placeholder="Descrizione dell'appuntamento"
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </Card>
            ))}
            <Button
              variant="outline"
              onClick={() => {
                const newMeeting = {
                  nome: '',
                  data: '',
                  orario: '',
                  luogo: '',
                  descrizione: ''
                };
                updateContent(section.key, [...clubMeetings, newMeeting]);
              }}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Appuntamento
            </Button>
          </div>
        );
      case 'service-activities':
        const serviceActivities = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-4">            
            {serviceActivities.map((activity, index) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-sm">Attività {index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const updatedActivities = serviceActivities.filter((_, i) => i !== index);
                      updateContent(section.key, updatedActivities);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Testo *</Label>
                    <Input
                      value={activity.testo || ''}
                      onChange={(e) => {
                        const updatedActivities = [...serviceActivities];
                        updatedActivities[index] = { ...activity, testo: e.target.value };
                        updateContent(section.key, updatedActivities);
                      }}
                      placeholder="Nome attività"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Data</Label>
                    <Input
                      type="date"
                      value={activity.data || ''}
                      onChange={(e) => {
                        const updatedActivities = [...serviceActivities];
                        updatedActivities[index] = { ...activity, data: e.target.value };
                        updateContent(section.key, updatedActivities);
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Orario</Label>
                    <Input
                      type="time"
                      value={activity.orario || ''}
                      onChange={(e) => {
                        const updatedActivities = [...serviceActivities];
                        updatedActivities[index] = { ...activity, orario: e.target.value };
                        updateContent(section.key, updatedActivities);
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Luogo</Label>
                    <Input
                      value={activity.luogo || ''}
                      onChange={(e) => {
                        const updatedActivities = [...serviceActivities];
                        updatedActivities[index] = { ...activity, luogo: e.target.value };
                        updateContent(section.key, updatedActivities);
                      }}
                      placeholder="Luogo attività"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <Label className="text-xs">Descrizione</Label>
                  <Textarea
                    value={activity.descrizione || ''}
                    onChange={(e) => {
                      const updatedActivities = [...serviceActivities];
                      updatedActivities[index] = { ...activity, descrizione: e.target.value };
                      updateContent(section.key, updatedActivities);
                    }}
                    placeholder="Descrizione dell'attività"
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </Card>
            ))}
            <Button
              variant="outline"
              onClick={() => {
                const newActivity = {
                  testo: '',
                  data: '',
                  orario: '',
                  luogo: '',
                  descrizione: ''
                };
                updateContent(section.key, [...serviceActivities, newActivity]);
              }}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Attività
            </Button>
          </div>
        );
      case 'club-communications':
        const clubCommunications = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-4">            
            {clubCommunications.map((communication, index) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-sm">Comunicazione {index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const updatedCommunications = clubCommunications.filter((_, i) => i !== index);
                      updateContent(section.key, updatedCommunications);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Testo *</Label>
                    <Input
                      value={communication.testo || ''}
                      onChange={(e) => {
                        const updatedCommunications = [...clubCommunications];
                        updatedCommunications[index] = { ...communication, testo: e.target.value };
                        updateContent(section.key, updatedCommunications);
                      }}
                      placeholder="Titolo comunicazione"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Data</Label>
                    <Input
                      type="date"
                      value={communication.data || ''}
                      onChange={(e) => {
                        const updatedCommunications = [...clubCommunications];
                        updatedCommunications[index] = { ...communication, data: e.target.value };
                        updateContent(section.key, updatedCommunications);
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Orario</Label>
                    <Input
                      type="time"
                      value={communication.orario || ''}
                      onChange={(e) => {
                        const updatedCommunications = [...clubCommunications];
                        updatedCommunications[index] = { ...communication, orario: e.target.value };
                        updateContent(section.key, updatedCommunications);
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Luogo</Label>
                    <Input
                      value={communication.luogo || ''}
                      onChange={(e) => {
                        const updatedCommunications = [...clubCommunications];
                        updatedCommunications[index] = { ...communication, luogo: e.target.value };
                        updateContent(section.key, updatedCommunications);
                      }}
                      placeholder="Luogo comunicazione"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <Label className="text-xs">Descrizione</Label>
                  <Textarea
                    value={communication.descrizione || ''}
                    onChange={(e) => {
                      const updatedCommunications = [...clubCommunications];
                      updatedCommunications[index] = { ...communication, descrizione: e.target.value };
                      updateContent(section.key, updatedCommunications);
                    }}
                    placeholder="Descrizione della comunicazione"
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </Card>
            ))}
            <Button
              variant="outline"
              onClick={() => {
                const newCommunication = {
                  testo: '',
                  data: '',
                  orario: '',
                  luogo: '',
                  descrizione: ''
                };
                updateContent(section.key, [...clubCommunications, newCommunication]);
              }}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Comunicazione
            </Button>
          </div>
        );
      case 'district-agenda':
        const districtAgenda = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-4">            
            {districtAgenda.map((event, index) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-sm">Evento Distrettuale {index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const updatedEvents = districtAgenda.filter((_, i) => i !== index);
                      updateContent(section.key, updatedEvents);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Testo *</Label>
                    <Input
                      value={event.testo || ''}
                      onChange={(e) => {
                        const updatedEvents = [...districtAgenda];
                        updatedEvents[index] = { ...event, testo: e.target.value };
                        updateContent(section.key, updatedEvents);
                      }}
                      placeholder="Nome evento"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Data</Label>
                    <Input
                      type="date"
                      value={event.data || ''}
                      onChange={(e) => {
                        const updatedEvents = [...districtAgenda];
                        updatedEvents[index] = { ...event, data: e.target.value };
                        updateContent(section.key, updatedEvents);
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Orario</Label>
                    <Input
                      type="time"
                      value={event.orario || ''}
                      onChange={(e) => {
                        const updatedEvents = [...districtAgenda];
                        updatedEvents[index] = { ...event, orario: e.target.value };
                        updateContent(section.key, updatedEvents);
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Luogo</Label>
                    <Input
                      value={event.luogo || ''}
                      onChange={(e) => {
                        const updatedEvents = [...districtAgenda];
                        updatedEvents[index] = { ...event, luogo: e.target.value };
                        updateContent(section.key, updatedEvents);
                      }}
                      placeholder="Luogo evento"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <Label className="text-xs">Descrizione</Label>
                  <Textarea
                    value={event.descrizione || ''}
                    onChange={(e) => {
                      const updatedEvents = [...districtAgenda];
                      updatedEvents[index] = { ...event, descrizione: e.target.value };
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
                  testo: '',
                  data: '',
                  orario: '',
                  luogo: '',
                  descrizione: ''
                };
                updateContent(section.key, [...districtAgenda, newEvent]);
              }}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Evento
            </Button>
          </div>
        );
      case 'motivational-section':
        const motivationalSection = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-4">            
            {motivationalSection.map((item, index) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-sm">Elemento Motivazionale {index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const updatedItems = motivationalSection.filter((_, i) => i !== index);
                      updateContent(section.key, updatedItems);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Testo *</Label>
                    <Input
                      value={item.testo || ''}
                      onChange={(e) => {
                        const updatedItems = [...motivationalSection];
                        updatedItems[index] = { ...item, testo: e.target.value };
                        updateContent(section.key, updatedItems);
                      }}
                      placeholder="Titolo elemento"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Data</Label>
                    <Input
                      type="date"
                      value={item.data || ''}
                      onChange={(e) => {
                        const updatedItems = [...motivationalSection];
                        updatedItems[index] = { ...item, data: e.target.value };
                        updateContent(section.key, updatedItems);
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Orario</Label>
                    <Input
                      type="time"
                      value={item.orario || ''}
                      onChange={(e) => {
                        const updatedItems = [...motivationalSection];
                        updatedItems[index] = { ...item, orario: e.target.value };
                        updateContent(section.key, updatedItems);
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Luogo</Label>
                    <Input
                      value={item.luogo || ''}
                      onChange={(e) => {
                        const updatedItems = [...motivationalSection];
                        updatedItems[index] = { ...item, luogo: e.target.value };
                        updateContent(section.key, updatedItems);
                      }}
                      placeholder="Luogo elemento"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <Label className="text-xs">Descrizione</Label>
                  <Textarea
                    value={item.descrizione || ''}
                    onChange={(e) => {
                      const updatedItems = [...motivationalSection];
                      updatedItems[index] = { ...item, descrizione: e.target.value };
                      updateContent(section.key, updatedItems);
                    }}
                    placeholder="Descrizione dell'elemento"
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </Card>
            ))}
            <Button
              variant="outline"
              onClick={() => {
                const newItem = {
                  testo: '',
                  data: '',
                  orario: '',
                  luogo: '',
                  descrizione: ''
                };
                updateContent(section.key, [...motivationalSection, newItem]);
              }}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Elemento
            </Button>
          </div>
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
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    {currentDocType?.label} - {currentDocType?.icon}
                  </p>
                  {documentNumber && (
                    <Badge variant="secondary" className="text-xs">
                      {documentNumber}
                    </Badge>
                  )}
                </div>
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