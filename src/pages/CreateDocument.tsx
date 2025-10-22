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
  Home,
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
  footerData?: string;
  defaultLocation?: string;
  secretaryName?: string;
  presidentName?: string;
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
    logoUrl: '',
    headerText: '',
    footerData: '',
    defaultLocation: '',
    secretaryName: '',
    presidentName: ''
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDocument, setIsLoadingDocument] = useState(!!documentId);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'editor');
  const [documentNumber, setDocumentNumber] = useState<string>('');
  const [userTemplates, setUserTemplates] = useState<any[]>([]);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

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
        { key: 'anno_sociale', label: 'Anno Sociale', type: 'social-year', required: false },
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

  // Load profile defaults on component mount
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadUserTemplates = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
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
          logoUrl: data.logo_url || '',
          headerText: data.signature_url || '',
          footerData: data.template_url || ''
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

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('default_logo_url, default_footer_data, default_location, secretary_name, president_name, header_text')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      // Load default settings for new documents or if existing document doesn't have these settings
      if (data) {
        setFormData(prev => ({
          ...prev,
          logoUrl: !documentId ? (data.default_logo_url || prev.logoUrl) : (prev.logoUrl || data.default_logo_url || ''),
          footerData: !documentId ? (data.default_footer_data || prev.footerData) : (prev.footerData || data.default_footer_data || ''),
          defaultLocation: !documentId ? (data.default_location || prev.defaultLocation) : (prev.defaultLocation || data.default_location || ''),
          secretaryName: !documentId ? (data.secretary_name || prev.secretaryName) : (prev.secretaryName || data.secretary_name || ''),
          presidentName: !documentId ? (data.president_name || prev.presidentName) : (prev.presidentName || data.president_name || ''),
          headerText: !documentId ? (data.header_text || prev.headerText) : (prev.headerText || data.header_text || '')
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const updateProfileDefaults = async (logoUrl?: string, footerData?: string, location?: string, secretary?: string, president?: string) => {
    if (!user) return;
    
    try {
      const updateData: any = {};
      if (logoUrl !== undefined) updateData.default_logo_url = logoUrl;
      if (footerData !== undefined) updateData.default_footer_data = footerData;
      if (location !== undefined) updateData.default_location = location;
      if (secretary !== undefined) updateData.secretary_name = secretary;
      if (president !== undefined) updateData.president_name = president;
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating profile defaults:', error);
      }
    } catch (error) {
      console.error('Error updating profile defaults:', error);
    }
  };

  // Helper function to get the correct logo URL
  const getLogoUrl = () => {
    return formData.logoUrl || profile?.default_logo_url || '';
  };

  const saveSettings = async () => {
    if (!user) return;
    
    setIsSavingSettings(true);
    try {
      const updateData = {
        default_logo_url: formData.logoUrl || null,
        default_footer_data: formData.footerData || null,
        default_location: formData.defaultLocation || null,
        secretary_name: formData.secretaryName || null,
        president_name: formData.presidentName || null,
        header_text: formData.headerText || null
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error saving settings:', error);
        toast({
          title: "Errore",
          description: "Errore nel salvataggio delle impostazioni",
          variant: "destructive"
        });
      } else {
        // Update profile state to reflect the changes immediately
        if (profile) {
          Object.assign(profile, {
            default_logo_url: formData.logoUrl,
            default_footer_data: formData.footerData,
            default_location: formData.defaultLocation,
            secretary_name: formData.secretaryName,
            president_name: formData.presidentName,
            header_text: formData.headerText
          });
        }
        
        toast({
          title: "Successo",
          description: "Impostazioni salvate e mantenute come predefinite"
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Errore",
        description: "Errore nel salvataggio delle impostazioni",
        variant: "destructive"
      });
    } finally {
      setIsSavingSettings(false);
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

  // Auto-set title when document type changes
  useEffect(() => {
    if (formData.type === 'programmi' && !documentId) {
      const currentMonth = 'settembre'; // Default to September for social year
      setFormData(prev => ({
        ...prev,
        title: 'Programma mensile',
        content: {
          ...prev.content,
          mese: currentMonth
        }
      }));
    }
  }, [formData.type, documentId]);

  const generateAI = async () => {
    if (!user) return;

    setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke('generate-document-ai', {
        body: {
          type: formData.type,
          currentContent: formData.content,
          clubName: profile?.club_name || 'Il tuo Club',
          additionalContext: ''
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { suggestions, summary } = response.data;
      
      if (suggestions) {
        setFormData(prev => ({
          ...prev,
          content: { ...prev.content, ...suggestions }
        }));
        
        // Mostra il summary generato dall'AI
        if (summary) {
          toast({
            title: "Contenuto e Riassunto generati",
            description: `${summary}`,
            duration: 8000,
          });
        } else {
          toast({
            title: "Contenuto generato",
            description: "I contenuti sono stati generati con successo dall'AI",
          });
        }
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
        logo_url: formData.logoUrl,
        signature_url: formData.headerText,
        template_url: formData.footerData
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
                placeholder="Riflessione collegata al tema del mese o all'attività principale..."
                rows={4}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">Tema del Mese</Label>
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
                        <SelectItem value="riflessione">Riflessione Tematica</SelectItem>
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

  const renderPDFPreviewSection = (section: any, value: any) => {
    // Handle month-select display
    if (section.type === 'month-select') {
      return (
        <div key={section.key} style={{ marginBottom: '16px' }}>
          <h3 style={{ fontWeight: '600', fontSize: '18px', marginBottom: '8px', color: '#1f2937' }}>{section.label}</h3>
          <div style={{ fontSize: '14px', fontWeight: '500', textTransform: 'capitalize' }}>{value}</div>
        </div>
      );
    }
    
    // Handle social-year display
    if (section.type === 'social-year') {
      return (
        <div key={section.key} style={{ marginBottom: '16px' }}>
          <h3 style={{ fontWeight: '600', fontSize: '18px', marginBottom: '8px', color: '#1f2937' }}>{section.label}</h3>
          <div style={{ fontSize: '14px', fontWeight: '500', color: '#2563eb' }}>{value}</div>
        </div>
      );
    }
    
    // Handle club-meetings display
    if (section.type === 'club-meetings' && Array.isArray(value)) {
      return (
        <div key={section.key} style={{ marginBottom: '20px' }}>
          <h3 style={{ fontWeight: '600', fontSize: '18px', marginBottom: '12px', color: '#1f2937' }}>{section.label}</h3>
          <div>
            {value.map((meeting, index) => (
              <div key={index} style={{ 
                backgroundColor: '#f9fafb', 
                padding: '16px', 
                marginBottom: '12px', 
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h4 style={{ fontWeight: '500', fontSize: '16px', margin: '0' }}>{meeting.nome}</h4>
                  {meeting.data && (
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      📅 {new Date(meeting.data).toLocaleDateString('it-IT')}
                      {meeting.orario && ` - ${meeting.orario}`}
                    </div>
                  )}
                </div>
                {meeting.luogo && (
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                    📍 {meeting.luogo}
                  </div>
                )}
                {meeting.descrizione && (
                  <p style={{ fontSize: '14px', color: '#374151', margin: '0' }}>{meeting.descrizione}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    // Handle agenda_distrettuale display
    if ((section.type === 'district-agenda' || section.type === 'agenda_distrettuale') && Array.isArray(value)) {
      return (
        <div key={section.key} style={{ marginBottom: '20px' }}>
          <h3 style={{ fontWeight: '600', fontSize: '18px', marginBottom: '12px', color: '#1f2937' }}>{section.label}</h3>
          <div>
            {value.map((item, index) => (
              <div key={index} style={{ 
                backgroundColor: '#f9fafb', 
                padding: '12px', 
                marginBottom: '8px', 
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '14px' }}>
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
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
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
        return (
          <div key={section.key} style={{ marginBottom: '20px' }}>
            <h3 style={{ fontWeight: '600', fontSize: '18px', marginBottom: '12px', color: '#1f2937' }}>{section.label}</h3>
            <div>
              {value.map((item, index) => (
                <div key={index} style={{ 
                  backgroundColor: '#f9fafb', 
                  padding: '12px', 
                  marginBottom: '8px', 
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb'
                }}>
                  {Object.entries(item).map(([key, val]) => (
                    val && (
                      <div key={key} style={{ marginBottom: '4px' }}>
                        <span style={{ fontWeight: '500', fontSize: '14px', color: '#6b7280', textTransform: 'capitalize' }}>
                          {key.replace(/_/g, ' ')}: 
                        </span>
                        <span style={{ marginLeft: '8px', fontSize: '14px' }}>
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
        <div key={section.key} style={{ marginBottom: '16px' }}>
          <h3 style={{ fontWeight: '600', fontSize: '18px', marginBottom: '8px', color: '#1f2937' }}>{section.label}</h3>
          <div style={{ 
            backgroundColor: '#f9fafb', 
            padding: '12px', 
            borderRadius: '6px',
            border: '1px solid #e5e7eb'
          }}>
            {Object.entries(value).map(([key, val]) => (
              val && (
                <div key={key} style={{ marginBottom: '4px' }}>
                  <span style={{ fontWeight: '500', fontSize: '14px', color: '#6b7280', textTransform: 'capitalize' }}>
                    {key.replace(/_/g, ' ')}: 
                  </span>
                  <span style={{ marginLeft: '8px', fontSize: '14px' }}>{String(val)}</span>
                </div>
              )
            ))}
          </div>
        </div>
      );
    }
    
    // Handle regular text fields
    return (
      <div key={section.key} style={{ marginBottom: '16px' }}>
        <h3 style={{ fontWeight: '600', fontSize: '18px', marginBottom: '8px', color: '#1f2937' }}>{section.label}</h3>
        <div style={{ fontSize: '14px', whiteSpace: 'pre-wrap' }}>{value}</div>
      </div>
    );
  };

  const downloadPDF = async () => {
    try {
      toast({
        title: "PDF",
        description: "Generazione PDF in corso..."
      });
      
      // Create a temporary element for PDF generation with inline styles
      const tempElement = document.createElement('div');
      tempElement.style.cssText = `
        padding: 32px;
        background: white;
        color: black;
        font-family: Arial, sans-serif;
        line-height: 1.5;
      `;

      // Build the PDF content with inline styles
      let pdfContent = '';

      // Logo - Handle logo loading properly
      const logoUrl = getLogoUrl();
      let logoBase64 = '';
      
      if (logoUrl) {
        try {
          // Convert image to base64 to ensure it works in PDF
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              canvas.width = img.width;
              canvas.height = img.height;
              ctx?.drawImage(img, 0, 0);
              logoBase64 = canvas.toDataURL('image/png');
              resolve(logoBase64);
            };
            img.onerror = () => {
              console.error('Errore nel caricamento del logo');
              resolve(''); // Continue without logo if it fails to load
            };
            img.src = logoUrl;
          });
          
          if (logoBase64) {
            pdfContent += `
              <div style="text-align: center; margin-bottom: 16px;">
                <img src="${logoBase64}" alt="Logo Club" style="height: 64px; margin: 0 auto;" />
              </div>
            `;
          }
        } catch (error) {
          console.error('Errore nella conversione del logo:', error);
          // Continue without logo if conversion fails
        }
      }

      // Header text only (no rotary year badge)
      if (formData.headerText) {
        pdfContent += `
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="font-size: 18px; font-weight: 600; color: #2563eb; margin: 0;">${formData.headerText}</h2>
          </div>
        `;
      }

      // Title section - Special handling for programmi type
      if (formData.type === 'programmi') {
        const mese = formData.content['mese'] || 'Settembre';
        const meseCapitalized = mese.charAt(0).toUpperCase() + mese.slice(1);
        pdfContent += `
          <div style="margin-bottom: 24px;">
            <div style="text-align: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 16px;">
              <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 8px 0;">Programma Mensile - ${meseCapitalized} - A.R. 2025/2026</h1>
              <p style="font-size: 14px; color: #6b7280; margin: 0;">
                ${profile?.club_name} - ${new Date().toLocaleDateString('it-IT')}
              </p>
            </div>
          </div>
        `;
      } else {
        pdfContent += `
          <div style="margin-bottom: 24px;">
            <div style="text-align: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 16px;">
              <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 8px 0;">${formData.title || 'Titolo Documento'}</h1>
              <p style="color: #6b7280; margin: 8px 0;">${currentDocType?.label}</p>
              <p style="font-size: 14px; color: #6b7280; margin: 0;">
                ${profile?.club_name} - ${new Date().toLocaleDateString('it-IT')}
              </p>
            </div>
          </div>
        `;
      }

      // Content sections
      for (const section of templates[formData.type]?.sections || []) {
        const value = formData.content[section.key];
        if (value && section.key !== 'anno_sociale' && section.key !== 'mese') { // Skip social year and month as they're shown in header
          const sectionElement = document.createElement('div');
          const renderedSection = renderPDFPreviewSection(section, value);
          if (renderedSection) {
            // Convert React element to HTML string for inline styles
            const tempDiv = document.createElement('div');
            const reactElement = renderedSection as React.ReactElement;
            
            if (section.type === 'social-year') {
              pdfContent += `
                <div style="margin-bottom: 16px;">
                  <h3 style="font-weight: 600; font-size: 18px; margin-bottom: 8px; color: #1f2937;">${section.label}</h3>
                  <div style="font-size: 14px; font-weight: 500; color: #2563eb;">${value}</div>
                </div>
              `;
            } else if (section.type === 'club-meetings' && Array.isArray(value)) {
              pdfContent += `
                <div style="margin-bottom: 20px;">
                  <h3 style="font-weight: 600; font-size: 18px; margin-bottom: 12px; color: #1f2937;">${section.label}</h3>
                  <div>
                    ${value.map((meeting, index) => `
                      <div style="background-color: #f9fafb; padding: 16px; margin-bottom: 12px; border-radius: 8px; border: 1px solid #e5e7eb;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                          <h4 style="font-weight: 500; font-size: 16px; margin: 0;">${meeting.nome}</h4>
                          ${meeting.data ? `
                            <div style="font-size: 14px; color: #6b7280;">
                              📅 ${new Date(meeting.data).toLocaleDateString('it-IT')}${meeting.orario ? ` - ${meeting.orario}` : ''}
                            </div>
                          ` : ''}
                        </div>
                        ${meeting.luogo ? `
                          <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">
                            📍 ${meeting.luogo}
                          </div>
                        ` : ''}
                        ${meeting.descrizione ? `
                          <p style="font-size: 14px; color: #374151; margin: 0;">${meeting.descrizione}</p>
                        ` : ''}
                      </div>
                    `).join('')}
                  </div>
                </div>
              `;
            } else if (section.type === 'service-activities' && Array.isArray(value)) {
              pdfContent += `
                <div style="margin-bottom: 20px;">
                  <h3 style="font-weight: 600; font-size: 18px; margin-bottom: 12px; color: #1f2937;">${section.label}</h3>
                  <div>
                    ${value.map((activity, index) => `
                      <div style="background-color: #f9fafb; padding: 12px; margin-bottom: 8px; border-radius: 6px; border: 1px solid #e5e7eb;">
                        <div style="font-size: 14px; font-weight: 500;">
                          ${activity.testo || `Attività ${index + 1}`}
                        </div>
                        ${activity.data ? `
                          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
                            📅 ${new Date(activity.data).toLocaleDateString('it-IT')}${activity.orario ? ` - ${activity.orario}` : ''}
                          </div>
                        ` : ''}
                        ${activity.descrizione ? `
                          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
                            ${activity.descrizione}
                          </div>
                        ` : ''}
                      </div>
                    `).join('')}
                  </div>
                </div>
              `;
            } else if ((section.type === 'district-agenda' || section.type === 'agenda_distrettuale') && Array.isArray(value)) {
              pdfContent += `
                <div style="margin-bottom: 20px;">
                  <h3 style="font-weight: 600; font-size: 18px; margin-bottom: 12px; color: #1f2937;">${section.label}</h3>
                  <div>
                    ${value.map((item, index) => `
                      <div style="background-color: #f9fafb; padding: 12px; margin-bottom: 8px; border-radius: 6px; border: 1px solid #e5e7eb;">
                        <div style="font-size: 14px;">
                          ${item.testo && item.data && item.luogo 
                            ? `${item.testo} - ${new Date(item.data).toLocaleDateString('it-IT')} - ${item.luogo}`
                            : item.testo && item.data
                            ? `${item.testo} - ${new Date(item.data).toLocaleDateString('it-IT')}`
                            : item.testo && item.luogo
                            ? `${item.testo} - ${item.luogo}`
                            : item.testo || 'Evento senza titolo'
                          }
                        </div>
                        ${item.descrizione ? `
                          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
                            ${item.descrizione}
                          </div>
                        ` : ''}
                      </div>
                    `).join('')}
                  </div>
                </div>
              `;
            } else {
              // Handle regular text fields
              pdfContent += `
                <div style="margin-bottom: 16px;">
                  <h3 style="font-weight: 600; font-size: 18px; margin-bottom: 8px; color: #1f2937;">${section.label}</h3>
                  <div style="font-size: 14px; white-space: pre-wrap;">${value}</div>
                </div>
              `;
            }
          }
        }
      }

      // Signatures section
      if (formData.defaultLocation || formData.secretaryName || formData.presidentName) {
        pdfContent += `
          <div style="margin-top: 32px; text-align: left;">
            <div style="margin-bottom: 16px;">
              <span style="font-weight: 500;">
                ${formData.defaultLocation || '[Luogo]'}, ${new Date().toLocaleDateString('it-IT')}
              </span>
            </div>
            
            <div style="display: flex; justify-content: space-between;">
              <div style="flex: 1; margin-right: 32px;">
                <div style="font-weight: 500; margin-bottom: 8px;">Il Segretario</div>
                <div>${formData.secretaryName || '[Nome Segretario]'}</div>
              </div>
              <div style="flex: 1;">
                <div style="font-weight: 500; margin-bottom: 8px;">Il Presidente</div>
                <div>${formData.presidentName || '[Nome Presidente]'}</div>
              </div>
            </div>
          </div>
        `;
      }

      // Footer
      if (formData.footerData) {
        pdfContent += `
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
            <div style="font-size: 12px; color: #6b7280; white-space: pre-line;">
              ${formData.footerData}
            </div>
          </div>
        `;
      }

      tempElement.innerHTML = pdfContent;
      document.body.appendChild(tempElement);

      // Dynamically import html2pdf
      const html2pdf = (await import('html2pdf.js')).default;
      
      const opt = {
        margin: [0.6, 0.2, 0.8, 0.2], // Increased top and bottom margins for header/footer
        filename: `${formData.title || 'documento'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'in', 
          format: 'a4', 
          orientation: 'portrait',
          putOnlyUsedFonts: true,
          compress: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(tempElement).toPdf().get('pdf').then((pdf) => {
        // Add header and footer to each page
        const totalPages = pdf.internal.getNumberOfPages();
        
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          
          // Add footer to all pages except first
          if (i > 1) {
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            // Footer area (bottom of page)
            const footerY = pageHeight - 1.0;
            
            // Add a separator line
            pdf.setDrawColor(200);
            pdf.setLineWidth(0.01);
            pdf.line(0.5, footerY, pageWidth - 0.5, footerY);
            
            // Add logo in footer - posizione corretta a sinistra
            if (logoBase64) {
              try {
                pdf.addImage(logoBase64, 'PNG', 0.5, footerY + 0.1, 0.5, 0.25);
              } catch (error) {
                console.error('Error adding logo to footer:', error);
              }
            }
            
            // Add header text in footer - posizione corretta al centro
            if (formData.headerText) {
              pdf.setFontSize(8);
              pdf.setTextColor(100);
              const textWidth = pdf.getTextWidth(formData.headerText);
              const centerX = (pageWidth - textWidth) / 2;
              pdf.text(formData.headerText, centerX, footerY + 0.2);
            }
            
            // Add page number
            pdf.setFontSize(8);
            pdf.setTextColor(100);
            const pageText = `Pagina ${i} di ${totalPages}`;
            const pageTextWidth = pdf.getTextWidth(pageText);
            pdf.text(pageText, pageWidth - pageTextWidth - 0.5, footerY - 0.05);
          }
        }
      }).save();
      
      // Clean up
      document.body.removeChild(tempElement);
      
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
    // Handle social-year display
    if (section.type === 'social-year') {
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
    
    // Handle service-activities display with essential data only
    if (section.type === 'service-activities' && Array.isArray(value)) {
      return (
        <div key={section.key} className="space-y-3">
          <h3 className="font-semibold text-lg">{section.label}</h3>
          <div className="space-y-2">
            {value.map((activity, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg border">
                <div className="text-sm font-medium">
                  {activity.testo || `Attività ${index + 1}`}
                </div>
                {activity.data && (
                  <div className="text-sm text-gray-600 mt-1">
                    📅 {new Date(activity.data).toLocaleDateString('it-IT')}
                    {activity.orario && ` - ${activity.orario}`}
                  </div>
                )}
                {activity.descrizione && (
                  <div className="text-xs text-gray-600 mt-1">
                    {activity.descrizione}
                  </div>
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
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <Button variant="outline" size="sm" onClick={() => navigate('/segreteria')} className="flex-shrink-0">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Indietro
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')} className="flex-shrink-0">
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                {currentDocType?.icon && <currentDocType.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold truncate">
                  {documentId ? 'Modifica' : 'Crea'} {currentDocType?.label}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {documentNumber && `${documentNumber} • `}
                  {profile?.club_name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={generateAI}
                disabled={isGenerating}
                className="hidden sm:flex items-center gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
                <span className="hidden md:inline">
                  {isGenerating ? 'Generando...' : 'AI Assistant'}
                </span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={generateAI}
                disabled={isGenerating}
                className="sm:hidden p-2"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
              </Button>
              <Button onClick={saveDocument} disabled={isSaving} size="sm" className="hidden sm:flex">
                <Save className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{isSaving ? 'Salvataggio...' : 'Salva'}</span>
              </Button>
              <Button onClick={saveDocument} disabled={isSaving} size="sm" className="sm:hidden p-2">
                <Save className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={downloadPDF} size="sm" className="hidden md:flex">
                <Download className="w-4 h-4 mr-2" />
                Scarica PDF
              </Button>
              <Button variant="outline" onClick={downloadPDF} size="sm" className="md:hidden p-2">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-3 h-10 sm:h-11">
              <TabsTrigger value="editor" className="text-xs sm:text-sm">Editor</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs sm:text-sm">Impostazioni</TabsTrigger>
              <TabsTrigger value="preview" className="text-xs sm:text-sm">Anteprima</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-4 sm:space-y-6">
              {/* Document Info */}
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="text-lg sm:text-xl">Informazioni Documento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium">Titolo Documento *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Inserisci il titolo del documento..."
                        className="text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Tipo Documento</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value: FormData['type']) => setFormData(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger className="text-sm">
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
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
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
                      <Label>Logo Club</Label>
                      <div className="mt-1 space-y-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file && user) {
                              try {
                                // Upload file to Supabase Storage
                                const fileExt = file.name.split('.').pop();
                                const fileName = `logo_${Date.now()}.${fileExt}`;
                                const filePath = `${user.id}/${fileName}`;

                                const { error: uploadError } = await supabase.storage
                                  .from('document-assets')
                                  .upload(filePath, file);

                                if (uploadError) {
                                  console.error('Error uploading file:', uploadError);
                                  toast({
                                    title: "Errore",
                                    description: "Errore nel caricamento del logo",
                                    variant: "destructive"
                                  });
                                  return;
                                }

                                // Get public URL
                                const { data: { publicUrl } } = supabase.storage
                                  .from('document-assets')
                                  .getPublicUrl(filePath);

                                // Update form data and save as default
                                setFormData(prev => ({ ...prev, logoUrl: publicUrl }));
                                await updateProfileDefaults(publicUrl, undefined, undefined, undefined, undefined);

                                toast({
                                  title: "Successo",
                                  description: "Logo caricato e salvato come predefinito"
                                });
                              } catch (error) {
                                console.error('Error uploading logo:', error);
                                toast({
                                  title: "Errore",
                                  description: "Errore nel caricamento del logo",
                                  variant: "destructive"
                                });
                              }
                            }
                          }}
                        />
                        {getLogoUrl() && (
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-muted-foreground">
                              Logo {formData.logoUrl ? 'personalizzato' : 'predefinito'}
                            </div>
                            <img src={getLogoUrl()} alt="Logo preview" className="h-8 w-8 object-contain rounded" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                     <div>
                      <Label>Intestazione Personalizzata</Label>
                      <Input
                        value={formData.headerText || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData(prev => ({ ...prev, headerText: value }));
                        }}
                        placeholder="Es. Nome del Club o Associazione..."
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label>Dati Rotary a Piè di Pagina</Label>
                      <Textarea
                        value={formData.footerData || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData(prev => ({ ...prev, footerData: value }));
                        }}
                        placeholder="Es. Rotary Club di [Nome] - Distretto [Numero]&#10;Via [Indirizzo], [Città]&#10;www.rotary[nome].it - info@rotary[nome].it"
                        rows={4}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label>Luogo</Label>
                      <Input
                        value={formData.defaultLocation || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData(prev => ({ ...prev, defaultLocation: value }));
                        }}
                        placeholder="Es. Hotel Villa Giulia, Valmontone"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label>Nome e Cognome Segretario</Label>
                      <Input
                        value={formData.secretaryName || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData(prev => ({ ...prev, secretaryName: value }));
                        }}
                        placeholder="Es. Mario Rossi"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label>Nome e Cognome Presidente</Label>
                      <Input
                        value={formData.presidentName || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData(prev => ({ ...prev, presidentName: value }));
                        }}
                        placeholder="Es. Giuseppe Bianchi"
                        className="mt-1"
                      />
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
                  
                  <div className="flex justify-end pt-4 border-t">
                    <Button 
                      onClick={saveSettings} 
                      disabled={isSavingSettings}
                      className="w-full sm:w-auto"
                    >
                      {isSavingSettings ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                          Salvataggio...
                        </>
                      ) : (
                        'Salva Impostazioni'
                      )}
                    </Button>
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
                  <div id="document-preview" className="p-8 rounded-lg border bg-card text-card-foreground">
                    {getLogoUrl() && (
                      <div className="text-center mb-4">
                        <img src={getLogoUrl()} alt="Logo Club" className="h-16 mx-auto" />
                      </div>
                    )}
                    
                     {formData.headerText && (
                       <div className="text-center mb-6">
                         <h2 className="text-lg font-semibold text-primary">{formData.headerText}</h2>
                       </div>
                     )}
                    
                    <div className="space-y-6">
                        <div className="text-center border-b pb-4">
                           {formData.type === 'programmi' ? (
                            <>
                               <h1 className="text-2xl font-bold">
                                 Programma Mensile - {formData.content['mese'] ? formData.content['mese'].charAt(0).toUpperCase() + formData.content['mese'].slice(1) : 'Settembre'} - A.R. 2025/2026
                               </h1>
                            </>
                          ) : (
                           <>
                             <h1 className="text-2xl font-bold">{formData.title || 'Titolo Documento'}</h1>
                             <p className="text-muted-foreground mt-2">{currentDocType?.label}</p>
                           </>
                         )}
                         <p className="text-sm text-muted-foreground">
                           {profile?.club_name} - {new Date().toLocaleDateString('it-IT')}
                         </p>
                       </div>
                      
                       {templates[formData.type]?.sections.map((section) => {
                         const value = formData.content[section.key];
                         if (!value || section.key === 'anno_sociale' || section.key === 'mese') return null; // Skip social year and month as they're shown in header
                         return renderPreviewSection(section, value);
                       })}
                      
                      {(formData.defaultLocation || formData.secretaryName || formData.presidentName) && (
                        <div className="mt-8 text-left">
                          <div className="mb-4">
                            <span className="font-medium">
                              {formData.defaultLocation || '[Luogo]'}, {new Date().toLocaleDateString('it-IT')}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-8">
                            <div>
                              <div className="font-medium mb-2">Il Segretario</div>
                              <div>{formData.secretaryName || '[Nome Segretario]'}</div>
                            </div>
                            <div>
                              <div className="font-medium mb-2">Il Presidente</div>
                              <div>{formData.presidentName || '[Nome Presidente]'}</div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {formData.footerData && (
                        <div className="mt-8 pt-6 border-t text-center">
                          <div className="text-xs text-muted-foreground whitespace-pre-line">
                            {formData.footerData}
                          </div>
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
