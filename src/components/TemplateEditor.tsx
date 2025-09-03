import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Image, Eye, Save, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TemplateSettings {
  id?: string;
  logo_url?: string;
  logo_position: 'left' | 'center' | 'right';
  logo_size: 'small' | 'medium' | 'large';
  header_text: string;
  header_font_size: 'small' | 'medium' | 'large';
  header_alignment: 'left' | 'center' | 'right';
  footer_text: string;
  footer_font_size: 'small' | 'medium' | 'large';
  footer_alignment: 'left' | 'center' | 'right';
  show_page_numbers: boolean;
  watermark_text?: string;
  watermark_opacity: number;
}

export const TemplateEditor = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  
  const [template, setTemplate] = useState<TemplateSettings>({
    logo_position: 'center',
    logo_size: 'medium',
    header_text: 'ROTARY CLUB [NOME CLUB]\nDistretto 2080',
    header_font_size: 'large',
    header_alignment: 'center',
    footer_text: 'Via [Indirizzo], [Città] - Tel. [Telefono] - Email: [email]\nwww.rotary[nomeclub].it',
    footer_font_size: 'small',
    footer_alignment: 'center',
    show_page_numbers: true,
    watermark_opacity: 0.1
  });

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Errore",
        description: "Seleziona un file immagine valido",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo_${user?.id}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('document-assets')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('document-assets')
        .getPublicUrl(fileName);

      setTemplate(prev => ({ ...prev, logo_url: data.publicUrl }));
      
      toast({
        title: "Successo",
        description: "Logo caricato correttamente",
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento del logo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('document_templates')
        .upsert({
          user_id: user.id,
          settings: template,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      toast({
        title: "Successo",
        description: "Template salvato correttamente",
      });
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Errore",
        description: "Errore nel salvataggio del template",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getLogoSizeClass = (size: string) => {
    switch (size) {
      case 'small': return 'h-12';
      case 'medium': return 'h-16';
      case 'large': return 'h-24';
      default: return 'h-16';
    }
  };

  const getFontSizeClass = (size: string) => {
    switch (size) {
      case 'small': return 'text-sm';
      case 'medium': return 'text-base';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  };

  const getAlignmentClass = (alignment: string) => {
    switch (alignment) {
      case 'left': return 'text-left';
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-center';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Editor Template</h2>
          <p className="text-muted-foreground">Personalizza l'aspetto dei tuoi documenti</p>
        </div>
        <Button onClick={handleSaveTemplate} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Salvataggio...' : 'Salva Template'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Anteprima</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Logo Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Logo
                </CardTitle>
                <CardDescription>Carica e configura il logo del tuo club</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="logo-upload">Carica Logo</Label>
                  <div className="mt-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {isLoading ? 'Caricamento...' : 'Seleziona File'}
                    </Button>
                  </div>
                  {template.logo_url && (
                    <div className="mt-4 p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Logo Corrente</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setTemplate(prev => ({ ...prev, logo_url: undefined }))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <img 
                        src={template.logo_url} 
                        alt="Logo" 
                        className="max-h-16 w-auto mx-auto"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="logo-position">Posizione</Label>
                    <select
                      className="w-full mt-1 p-2 border rounded-md"
                      value={template.logo_position}
                      onChange={(e) => setTemplate(prev => ({ 
                        ...prev, 
                        logo_position: e.target.value as 'left' | 'center' | 'right' 
                      }))}
                    >
                      <option value="left">Sinistra</option>
                      <option value="center">Centro</option>
                      <option value="right">Destra</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="logo-size">Dimensione</Label>
                    <select
                      className="w-full mt-1 p-2 border rounded-md"
                      value={template.logo_size}
                      onChange={(e) => setTemplate(prev => ({ 
                        ...prev, 
                        logo_size: e.target.value as 'small' | 'medium' | 'large' 
                      }))}
                    >
                      <option value="small">Piccolo</option>
                      <option value="medium">Medio</option>
                      <option value="large">Grande</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Header Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Intestazione</CardTitle>
                <CardDescription>Configura l'intestazione del documento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="header-text">Testo Intestazione</Label>
                  <Textarea
                    value={template.header_text}
                    onChange={(e) => setTemplate(prev => ({ ...prev, header_text: e.target.value }))}
                    placeholder="Inserisci il testo dell'intestazione..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="header-font-size">Dimensione Font</Label>
                    <select
                      className="w-full mt-1 p-2 border rounded-md"
                      value={template.header_font_size}
                      onChange={(e) => setTemplate(prev => ({ 
                        ...prev, 
                        header_font_size: e.target.value as 'small' | 'medium' | 'large' 
                      }))}
                    >
                      <option value="small">Piccolo</option>
                      <option value="medium">Medio</option>
                      <option value="large">Grande</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="header-alignment">Allineamento</Label>
                    <select
                      className="w-full mt-1 p-2 border rounded-md"
                      value={template.header_alignment}
                      onChange={(e) => setTemplate(prev => ({ 
                        ...prev, 
                        header_alignment: e.target.value as 'left' | 'center' | 'right' 
                      }))}
                    >
                      <option value="left">Sinistra</option>
                      <option value="center">Centro</option>
                      <option value="right">Destra</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Footer Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Piè di Pagina</CardTitle>
                <CardDescription>Configura il footer del documento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="footer-text">Testo Footer</Label>
                  <Textarea
                    value={template.footer_text}
                    onChange={(e) => setTemplate(prev => ({ ...prev, footer_text: e.target.value }))}
                    placeholder="Inserisci il testo del footer..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="footer-font-size">Dimensione Font</Label>
                    <select
                      className="w-full mt-1 p-2 border rounded-md"
                      value={template.footer_font_size}
                      onChange={(e) => setTemplate(prev => ({ 
                        ...prev, 
                        footer_font_size: e.target.value as 'small' | 'medium' | 'large' 
                      }))}
                    >
                      <option value="small">Piccolo</option>
                      <option value="medium">Medio</option>
                      <option value="large">Grande</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="footer-alignment">Allineamento</Label>
                    <select
                      className="w-full mt-1 p-2 border rounded-md"
                      value={template.footer_alignment}
                      onChange={(e) => setTemplate(prev => ({ 
                        ...prev, 
                        footer_alignment: e.target.value as 'left' | 'center' | 'right' 
                      }))}
                    >
                      <option value="left">Sinistra</option>
                      <option value="center">Centro</option>
                      <option value="right">Destra</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="show-page-numbers"
                    checked={template.show_page_numbers}
                    onChange={(e) => setTemplate(prev => ({ ...prev, show_page_numbers: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="show-page-numbers" className="text-sm">
                    Mostra numerazione pagine
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Watermark Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Filigrana (Opzionale)</CardTitle>
                <CardDescription>Aggiungi una filigrana al documento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="watermark-text">Testo Filigrana</Label>
                  <Input
                    value={template.watermark_text || ''}
                    onChange={(e) => setTemplate(prev => ({ ...prev, watermark_text: e.target.value }))}
                    placeholder="Es. BOZZA, CONFIDENZIALE..."
                  />
                </div>

                <div>
                  <Label htmlFor="watermark-opacity">Opacità</Label>
                  <input
                    type="range"
                    min="0"
                    max="0.5"
                    step="0.1"
                    value={template.watermark_opacity}
                    onChange={(e) => setTemplate(prev => ({ ...prev, watermark_opacity: parseFloat(e.target.value) }))}
                    className="w-full mt-2"
                  />
                  <div className="text-sm text-muted-foreground mt-1">
                    Opacità: {Math.round(template.watermark_opacity * 100)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Anteprima Template
                  </CardTitle>
                  <CardDescription>Visualizza come apparirà il tuo template nei documenti</CardDescription>
                </div>
                <Button variant="outline" onClick={() => setActiveTab('editor')}>
                  Modifica Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border border-gray-300 bg-white p-8 rounded-lg shadow-sm min-h-[800px] relative">
                {/* Watermark */}
                {template.watermark_text && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ 
                      opacity: template.watermark_opacity,
                      transform: 'rotate(-45deg)',
                      fontSize: '4rem',
                      fontWeight: 'bold',
                      color: '#666',
                      zIndex: 1
                    }}
                  >
                    {template.watermark_text}
                  </div>
                )}

                {/* Header */}
                <div className={`mb-8 pb-6 border-b ${getAlignmentClass(template.header_alignment)}`}>
                  {template.logo_url && (
                    <div className={`mb-4 ${getAlignmentClass(template.logo_position)}`}>
                      <img 
                        src={template.logo_url} 
                        alt="Logo" 
                        className={`${getLogoSizeClass(template.logo_size)} w-auto`}
                      />
                    </div>
                  )}
                  <div className={`${getFontSizeClass(template.header_font_size)} font-semibold whitespace-pre-line`}>
                    {template.header_text}
                  </div>
                </div>

                {/* Content Preview */}
                <div className="space-y-6 mb-16 relative z-10">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Titolo Documento</h3>
                    <p className="text-gray-700 mb-4">
                      Questo è un esempio di come apparirà il contenuto del documento con il template personalizzato.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-base font-medium mb-2">Sottotitolo</h4>
                    <p className="text-gray-600">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-gray-600">• Punto elenco 1</p>
                    <p className="text-gray-600">• Punto elenco 2</p>
                    <p className="text-gray-600">• Punto elenco 3</p>
                  </div>
                </div>

                {/* Footer */}
                <div className={`mt-auto pt-6 border-t ${getAlignmentClass(template.footer_alignment)}`}>
                  <div className={`${getFontSizeClass(template.footer_font_size)} text-gray-500 whitespace-pre-line relative z-10`}>
                    {template.footer_text}
                  </div>
                  {template.show_page_numbers && (
                    <div className="text-center mt-2 text-sm text-gray-400 relative z-10">
                      Pagina 1 di 1
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};