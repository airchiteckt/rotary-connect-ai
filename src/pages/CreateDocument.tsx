import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Save, 
  Wand2, 
  Eye, 
  Settings, 
  Calendar, 
  MapPin, 
  Plus, 
  X, 
  User, 
  ArrowLeft,
  Upload,
  Loader2,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FormData {
  title: string;
  type: 'verbali' | 'programmi' | 'comunicazioni' | 'circolari';
  content: Record<string, any>;
  status: string;
  logoUrl?: string;
  headerText?: string;
}

export default function CreateDocument() {
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id: documentId } = useParams();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    type: (searchParams.get('type') as FormData['type']) || 'verbali',
    content: {},
    status: 'draft',
    backgroundTemplate: 'classic'
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDocument, setIsLoadingDocument] = useState(!!documentId);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'editor');
  const [documentNumber, setDocumentNumber] = useState<string>('');
  const [userTemplates, setUserTemplates] = useState<any[]>([]);

  const templates = {
    verbali: {
      sections: [
        { key: 'data_riunione', label: 'Data Riunione', type: 'date', required: true },
        { key: 'luogo', label: 'Luogo', type: 'text', required: true },
        { key: 'presenti', label: 'Presenti', type: 'richtext', required: true },
        { key: 'assenti', label: 'Assenti Giustificati', type: 'richtext', required: false },
        { key: 'ordine_giorno', label: 'Ordine del Giorno', type: 'richtext', required: true },
        { key: 'delibere', label: 'Deliberazioni', type: 'richtext', required: true },
        { key: 'prossima_riunione', label: 'Prossima Riunione', type: 'text', required: false }
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
        { key: 'sezione_motivazionale', label: 'Sezione motivazionale o culturale', type: 'motivational-section', required: false }
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
        { key: 'numero_circolare', label: 'Numero Circolare', type: 'text', required: true },
        { key: 'oggetto', label: 'Oggetto', type: 'text', required: true },
        { key: 'contenuto', label: 'Contenuto', type: 'richtext', required: true },
        { key: 'scadenza', label: 'Data Scadenza', type: 'date', required: false }
      ]
    }
  };

  // Load existing document if documentId is provided
  useEffect(() => {
    if (documentId && user) {
      loadDocument(documentId);
    }
  }, [documentId, user]);

  // Load user templates on component mount
  useEffect(() => {
    loadUserTemplates();
  }, [user]);

  const loadUserTemplates = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      setUserTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadDocument = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error loading document:', error);
        toast({
          title: "Errore",
          description: "Impossibile caricare il documento",
          variant: "destructive",
        });
        navigate('/segreteria');
        return;
      }

      if (data) {
        setFormData({
          title: data.title,
          type: data.type as FormData['type'],
          content: data.content as Record<string, any>,
          status: data.status || 'draft',
          backgroundTemplate: (data as any).background_template || 'classic'
        });
        setDocumentNumber(data.document_number || '');
      }
    } catch (error) {
      console.error('Error loading document:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento del documento",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDocument(false);
    }
  };

  const currentDocType = [
    { value: 'verbali', label: 'Verbale Riunione', icon: FileText },
    { value: 'programmi', label: 'Programma Mensile', icon: Calendar },
    { value: 'comunicazioni', label: 'Comunicazione Ufficiale', icon: FileText },
    { value: 'circolari', label: 'Circolare', icon: FileText }
  ].find(type => type.value === formData.type);

  const updateContent = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      content: { ...prev.content, [key]: value }
    }));
  };

  const generateAI = async () => {
    if (!user) return;

    setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke('generate-document-ai', {
        body: {
          type: formData.type,
          currentContent: formData.content,
          clubName: profile?.club_name || 'Rotary Club',
          additionalContext: ''
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { suggestions } = response.data;
      
      if (suggestions) {
        setFormData(prev => ({
          ...prev,
          content: { ...prev.content, ...suggestions }
        }));
        
        toast({
          title: "Contenuto generato",
          description: "I contenuti sono stati generati con successo dall'AI",
        });
      }
    } catch (error) {
      console.error('Error generating AI content:', error);
      toast({
        title: "Errore",
        description: "Errore nella generazione dei contenuti AI",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveDocument = async () => {
    if (!user || !formData.title.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci un titolo per il documento",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const documentData = {
        title: formData.title,
        type: formData.type,
        content: formData.content,
        status: formData.status,
        user_id: user.id,
        background_template: formData.backgroundTemplate
      };

      if (documentId) {
        // Update existing document
        const { error } = await supabase
          .from('documents')
          .update(documentData)
          .eq('id', documentId)
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: "Successo",
          description: "Documento aggiornato correttamente",
        });
      } else {
        // Create new document
        const { data, error } = await supabase
          .from('documents')
          .insert(documentData)
          .select('*')
          .single();

        if (error) throw error;

        setDocumentNumber(data.document_number || '');
        navigate(`/document/${data.id}/edit`, { replace: true });
        
        toast({
          title: "Successo",
          description: "Documento salvato correttamente",
        });
      }
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

  const loadFromPrevious = async () => {
    if (!user) return;

    try {
      // Load club meetings for the current/next month  
      const { data: meetingData, error: meetingError } = await supabase.rpc('calculate_next_meeting_dates', {
        user_uuid: user?.id,
        months_ahead: 1 // Load only current month
      });

      // Load district events for the current/next month
      const { data: districtData, error: districtError } = await supabase.rpc('get_district_events_for_month', {
        user_uuid: user?.id,
        target_month: new Date().getMonth() + 1 // JavaScript months are 0-based, SQL months are 1-based
      });

      if (meetingError) {
        console.error('Error loading meetings:', meetingError);
      }
      if (districtError) {
        console.error('Error loading district events:', districtError);
      }

      // Convert club meetings to the format expected by the form
      const futureMeetings = (meetingData || []).map(meeting => ({
        nome: meeting.meeting_type,
        data: meeting.meeting_date,
        orario: meeting.meeting_time,
        luogo: meeting.location || '',
        descrizione: ''
      }));

      // Convert district events to the same format
      const districtMeetings = (districtData || []).map(event => ({
        testo: event.nome,
        data: event.data_evento,
        orario: '', // District events don't have specific times
        luogo: event.luogo || '',
        descrizione: event.descrizione || ''
      }));

      // Combine both types of meetings
      const allMeetings = [...futureMeetings, ...districtMeetings];

      // Update the form content with the loaded meetings
      if (futureMeetings.length > 0) {
        updateContent('calendario_incontri', futureMeetings);
      }
      
      if (districtMeetings.length > 0) {
        updateContent('agenda_distrettuale', districtMeetings);
      }

      toast({
        title: "Eventi caricati",
        description: `Caricati ${futureMeetings.length} appuntamenti club e ${districtMeetings.length} eventi distrettuali del mese corrente`,
      });
    } catch (error) {
      console.error('Error loading previous data:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento dei dati precedenti",
        variant: "destructive",
      });
    }
  };

  const renderFormSection = (section: any) => {
    const value = formData.content[section.key];

    switch (section.type) {
      case 'text':
        return (
          <Input
            value={value || ''}
            onChange={(e) => updateContent(section.key, e.target.value)}
            placeholder={`Inserisci ${section.label.toLowerCase()}...`}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => updateContent(section.key, e.target.value)}
          />
        );
      case 'richtext':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => updateContent(section.key, e.target.value)}
            placeholder={`Inserisci ${section.label.toLowerCase()}...`}
            rows={6}
          />
        );
      case 'month-select':
        const currentMonth = new Date().toLocaleDateString('it-IT', { month: 'long' });
        if (!value) {
          updateContent(section.key, currentMonth);
        }
        return (
          <div className="bg-muted p-3 rounded-md flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="font-medium capitalize">{currentMonth}</span>
            <span className="text-xs text-muted-foreground ml-auto">Mese Corrente</span>
          </div>
        );
      case 'rotary-year':
        const currentDate = new Date();
        const rotaryYear = currentDate.getMonth() >= 6 ? 
          `A.R. ${currentDate.getFullYear()}-${currentDate.getFullYear() + 1}` :
          `A.R. ${currentDate.getFullYear() - 1}-${currentDate.getFullYear()}`;
        
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
                placeholder="Ringraziamenti per le attività svolte e motivazione per quelle future..."
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
            {clubMeetings.map((meeting, index) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-sm">Incontro {index + 1}</h4>
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
                      placeholder="Nome incontro"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Data</Label>
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
                      placeholder="Luogo incontro"
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
                    placeholder="Descrizione dell'incontro"
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
              Aggiungi Incontro
            </Button>
            <Button
              variant="outline"
              onClick={loadFromPrevious}
              className="w-full"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Carica Riunioni Pianificate
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
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Tipo *</Label>
                    <Select
                      value={communication.tipo || ''}
                      onValueChange={(selectedValue) => {
                        const updatedCommunications = [...clubCommunications];
                        updatedCommunications[index] = { ...communication, tipo: selectedValue };
                        updateContent(section.key, updatedCommunications);
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Seleziona tipo comunicazione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compleanni">Compleanni Soci</SelectItem>
                        <SelectItem value="anniversari">Anniversari</SelectItem>
                        <SelectItem value="nuovi_ingressi">Nuovi Ingressi</SelectItem>
                        <SelectItem value="comunicazioni_direttivo">Comunicazioni del Direttivo</SelectItem>
                        <SelectItem value="scadenze">Scadenze Importanti</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Titolo *</Label>
                    <Input
                      value={communication.titolo || ''}
                      onChange={(e) => {
                        const updatedCommunications = [...clubCommunications];
                        updatedCommunications[index] = { ...communication, titolo: e.target.value };
                        updateContent(section.key, updatedCommunications);
                      }}
                      placeholder="Titolo della comunicazione"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Contenuto</Label>
                    <Textarea
                      value={communication.contenuto || ''}
                      onChange={(e) => {
                        const updatedCommunications = [...clubCommunications];
                        updatedCommunications[index] = { ...communication, contenuto: e.target.value };
                        updateContent(section.key, updatedCommunications);
                      }}
                      placeholder="Contenuto della comunicazione"
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>
              </Card>
            ))}
            <Button
              variant="outline"
              onClick={() => {
                const newCommunication = {
                  tipo: '',
                  titolo: '',
                  contenuto: ''
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
                  <h4 className="font-medium text-sm">Elemento {index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const updatedSection = motivationalSection.filter((_, i) => i !== index);
                      updateContent(section.key, updatedSection);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Tipo *</Label>
                    <Select
                      value={item.tipo || ''}
                      onValueChange={(selectedValue) => {
                        const updatedSection = [...motivationalSection];
                        updatedSection[index] = { ...item, tipo: selectedValue };
                        updateContent(section.key, updatedSection);
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Seleziona tipo contenuto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="riflessione">Riflessione Rotary</SelectItem>
                        <SelectItem value="progetto_internazionale">Progetto Internazionale</SelectItem>
                        <SelectItem value="citazione">Citazione Motivazionale</SelectItem>
                        <SelectItem value="articolo">Articolo Culturale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Titolo *</Label>
                    <Input
                      value={item.titolo || ''}
                      onChange={(e) => {
                        const updatedSection = [...motivationalSection];
                        updatedSection[index] = { ...item, titolo: e.target.value };
                        updateContent(section.key, updatedSection);
                      }}
                      placeholder="Titolo del contenuto"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Contenuto</Label>
                    <Textarea
                      value={item.contenuto || ''}
                      onChange={(e) => {
                        const updatedSection = [...motivationalSection];
                        updatedSection[index] = { ...item, contenuto: e.target.value };
                        updateContent(section.key, updatedSection);
                      }}
                      placeholder="Contenuto dettagliato"
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                </div>
              </Card>
            ))}
            <Button
              variant="outline"
              onClick={() => {
                const newItem = {
                  tipo: '',
                  titolo: '',
                  contenuto: ''
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
            value={value || ''}
            onChange={(e) => updateContent(section.key, e.target.value)}
            placeholder={`Inserisci ${section.label.toLowerCase()}...`}
          />
        );
    }
  };

  const getTemplateStyles = (template: string) => {
    switch (template) {
      case 'modern':
        return 'bg-gradient-to-br from-blue-50 to-indigo-100 border-l-4 border-blue-500';
      case 'elegant':
        return 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 shadow-lg';
      case 'minimal':
        return 'bg-gray-50 border-0 shadow-none';
      case 'classic':
      default:
        return 'bg-white border shadow-sm';
    }
  };

  const downloadPDF = async () => {
    const element = document.getElementById('document-preview');
    if (!element) {
      toast({
        title: "Errore",
        description: "Errore nella creazione del PDF",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "PDF",
        description: "Generazione PDF in corso..."
      });
      
      // Dynamically import html2pdf
      const html2pdf = (await import('html2pdf.js')).default;
      
      const opt = {
        margin: 1,
        filename: `${formData.title || 'documento'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
      toast({
        title: "Successo", 
        description: "PDF scaricato con successo!"
      });
    } catch (error) {
      console.error('Errore nella generazione del PDF:', error);
      toast({
        title: "Errore",
        description: "Errore nella generazione del PDF",
        variant: "destructive"
      });
    }
  };

  const renderPreviewSection = (section: any, value: any) => {
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
    
    // Handle club-meetings display
    if (section.type === 'club-meetings' && Array.isArray(value)) {
      return (
        <div key={section.key} className="space-y-3">
          <h3 className="font-semibold text-lg">{section.label}</h3>
          <div className="space-y-3">
            {value.map((meeting, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-base">{meeting.nome}</h4>
                  {meeting.data && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(meeting.data).toLocaleDateString('it-IT')}
                      {meeting.orario && ` - ${meeting.orario}`}
                    </div>
                  )}
                </div>
                {meeting.luogo && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4" />
                    {meeting.luogo}
                  </div>
                )}
                {meeting.descrizione && (
                  <p className="text-sm text-gray-700">{meeting.descrizione}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    // Handle agenda_distrettuale display with new format
    if ((section.type === 'district-agenda' || section.type === 'agenda_distrettuale') && Array.isArray(value)) {
      return (
        <div key={section.key} className="space-y-3">
          <h3 className="font-semibold text-lg">{section.label}</h3>
          <div className="space-y-2">
            {value.map((item, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg border">
                <div className="text-sm">
                  {item.testo && item.data && item.luogo 
                    ? `${item.testo} - ${new Date(item.data).toLocaleDateString('it-IT')} - ${item.luogo}`
                    : item.testo && item.data
                    ? `${item.testo} - ${new Date(item.data).toLocaleDateString('it-IT')}`
                    : item.testo && item.luogo
                    ? `${item.testo} - ${item.luogo}`
                    : item.testo || 'Evento senza titolo'
                  }
                </div>
                {item.descrizione && (
                  <div className="text-xs text-gray-600 mt-1">
                    {item.descrizione}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    // Handle regular text fields - check if value is object/array first
    if (typeof value === 'object' && value !== null) {
      // If it's an array of objects, display them nicely
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
        // Default formatting for other sections
        return (
          <div key={section.key} className="space-y-3">
            <h3 className="font-semibold text-lg">{section.label}</h3>
            <div className="space-y-2">
              {value.map((item, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg border">
                  {Object.entries(item).map(([key, val]) => (
                    val && (
                      <div key={key} className="mb-1 last:mb-0">
                        <span className="font-medium capitalize text-sm text-gray-600">
                          {key.replace(/_/g, ' ')}: 
                        </span>
                        <span className="ml-2 text-sm">
                          {typeof val === 'string' && key === 'data' 
                            ? new Date(val).toLocaleDateString('it-IT')
                            : String(val)
                          }
                        </span>
                      </div>
                    )
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      }
      
      // For other objects, show as key-value pairs
      return (
        <div key={section.key} className="space-y-2">
          <h3 className="font-semibold text-lg">{section.label}</h3>
          <div className="bg-gray-50 p-3 rounded-lg border">
            {Object.entries(value).map(([key, val]) => (
              val && (
                <div key={key} className="mb-1 last:mb-0">
                  <span className="font-medium capitalize text-sm text-gray-600">
                    {key.replace(/_/g, ' ')}: 
                  </span>
                  <span className="ml-2 text-sm">{String(val)}</span>
                </div>
              )
            ))}
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
  };

  if (loading || isLoadingDocument) {
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
    navigate('/auth');
    return null;
  }

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
                {currentDocType?.icon && <currentDocType.icon className="w-5 h-5 text-white" />}
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  {documentId ? 'Modifica' : 'Crea'} {currentDocType?.label}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {documentNumber && `${documentNumber} • `}
                  {profile?.club_name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={generateAI}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
                {isGenerating ? 'Generando...' : 'AI Assistant'}
              </Button>
              <Button onClick={saveDocument} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Salvataggio...' : 'Salva'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="settings">Impostazioni</TabsTrigger>
              <TabsTrigger value="preview">Anteprima</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-6">
              {/* Document Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Informazioni Documento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Titolo Documento *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Inserisci il titolo del documento..."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Tipo Documento</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value: FormData['type']) => setFormData(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="verbali">Verbale Riunione</SelectItem>
                          <SelectItem value="programmi">Programma Mensile</SelectItem>
                          <SelectItem value="comunicazioni">Comunicazione Ufficiale</SelectItem>
                          <SelectItem value="circolari">Circolare</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dynamic Form Sections */}
              <div className="grid grid-cols-1 gap-6">
                {templates[formData.type]?.sections.map((section) => (
                  <Card key={section.key}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {section.label}
                          {section.required && <span className="text-red-500 ml-1">*</span>}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {renderFormSection(section)}
                    </CardContent>
                  </Card>
                ))}
              </div>
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
                      <Label>Template di Sfondo</Label>
                      <Select
                        value={formData.backgroundTemplate || 'classic'}
                        onValueChange={(selectedValue) => 
                          setFormData(prev => ({ ...prev, backgroundTemplate: selectedValue }))
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="classic">
                            <div className="flex flex-col">
                              <span className="font-medium">Template Classico</span>
                              <span className="text-xs text-muted-foreground">Design tradizionale con intestazione Rotary</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="modern">
                            <div className="flex flex-col">
                              <span className="font-medium">Template Moderno</span>
                              <span className="text-xs text-muted-foreground">Design contemporaneo con elementi grafici</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="elegant">
                            <div className="flex flex-col">
                              <span className="font-medium">Template Elegante</span>
                              <span className="text-xs text-muted-foreground">Stile raffinato con bordi decorativi</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="minimal">
                            <div className="flex flex-col">
                              <span className="font-medium">Template Minimal</span>
                              <span className="text-xs text-muted-foreground">Design pulito e minimalista</span>
                            </div>
                          </SelectItem>
                          {userTemplates.map((template) => (
                            <SelectItem key={`user_${template.id}`} value={`user_${template.id}`}>
                              <div className="flex flex-col">
                                <span className="font-medium">{template.name}</span>
                                <span className="text-xs text-muted-foreground">Template personalizzato</span>
                              </div>
                            </SelectItem>
                          ))}
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
                  <div className={`p-8 rounded-lg ${getTemplateStyles(formData.backgroundTemplate || 'classic')}`}>
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
                        return renderPreviewSection(section, value);
                      })}
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
