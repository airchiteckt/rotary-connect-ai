import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  X, 
  Download, 
  Loader2, 
  Image as ImageIcon,
  Calendar,
  MapPin,
  Type,
  Palette,
  Square
} from 'lucide-react';

interface UploadedLogo {
  id: string;
  file: File;
  preview: string;
  description: string;
}

export const FlyerGenerator = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    location: '',
    date: '',
    additionalInfo: '',
    style: 'professionale' as const,
    format: '1:1' as const
  });
  
  const [uploadedLogos, setUploadedLogos] = useState<UploadedLogo[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const id = crypto.randomUUID();
        const preview = URL.createObjectURL(file);
        
        setUploadedLogos(prev => [...prev, {
          id,
          file,
          preview,
          description: `Logo: ${file.name}`
        }]);
      }
    });

    // Reset input
    event.target.value = '';
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const id = crypto.randomUUID();
        const preview = URL.createObjectURL(file);
        
        setUploadedLogos(prev => [...prev, {
          id,
          file,
          preview,
          description: `Logo: ${file.name}`
        }]);
      }
    });
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const removeLogo = (id: string) => {
    setUploadedLogos(prev => {
      const logo = prev.find(l => l.id === id);
      if (logo) {
        URL.revokeObjectURL(logo.preview);
      }
      return prev.filter(l => l.id !== id);
    });
  };

  const updateLogoDescription = (id: string, description: string) => {
    setUploadedLogos(prev => prev.map(logo => 
      logo.id === id ? { ...logo, description } : logo
    ));
  };

  const generateFlyer = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Errore",
        description: "Il titolo è obbligatorio",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-flyer-ai', {
        body: {
          ...formData,
          hasLogos: uploadedLogos.length > 0,
          logoDescriptions: uploadedLogos.map(logo => logo.description)
        }
      });

      if (error) throw error;

      if (data.success && data.imageData) {
        setGeneratedImage(data.imageData);
        toast({
          title: "Locandina generata!",
          description: "La tua locandina è pronta per il download"
        });
      } else {
        throw new Error(data.error || 'Errore durante la generazione');
      }

    } catch (error) {
      console.error('Error generating flyer:', error);
      toast({
        title: "Errore",
        description: "Errore durante la generazione della locandina",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadFlyer = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `locandina-${formData.title.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const styles = [
    { value: 'professionale', label: 'Professionale', description: 'Design elegante e corporate' },
    { value: 'festa', label: 'Festa', description: 'Colorato e festoso' },
    { value: 'club', label: 'Club', description: 'Stile moderno per eventi club' },
    { value: 'service', label: 'Service', description: 'Orientato al servizio comunitario' },
    { value: 'elegante', label: 'Elegante', description: 'Raffinato con accenti premium' },
    { value: 'moderno', label: 'Moderno', description: 'Minimalista e contemporaneo' }
  ];

  const formats = [
    { value: '1:1', label: 'Quadrato (1:1)', description: 'Perfetto per Instagram e Facebook post' },
    { value: '9:16', label: 'Verticale (9:16)', description: 'Ideale per Instagram Stories' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form Section */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="w-5 h-5" />
              Contenuto Locandina
            </CardTitle>
            <CardDescription>
              Inserisci le informazioni per la tua locandina
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Titolo *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Titolo principale dell'evento"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="subtitle">Sottotitolo</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => handleInputChange('subtitle', e.target.value)}
                placeholder="Sottotitolo o descrizione breve"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Luogo
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Sede dell'evento"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Data
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="additionalInfo">Informazioni aggiuntive</Label>
              <Textarea
                id="additionalInfo"
                value={formData.additionalInfo}
                onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                placeholder="Dettagli extra, contatti, info pratiche..."
                className="mt-1"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Stile e Formato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Stile</Label>
              <Select value={formData.style} onValueChange={(value) => handleInputChange('style', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {styles.map(style => (
                    <SelectItem key={style.value} value={style.value}>
                      <div>
                        <div className="font-medium">{style.label}</div>
                        <div className="text-sm text-muted-foreground">{style.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Square className="w-4 h-4" />
                Formato
              </Label>
              <Select value={formData.format} onValueChange={(value) => handleInputChange('format', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formats.map(format => (
                    <SelectItem key={format.value} value={format.value}>
                      <div>
                        <div className="font-medium">{format.label}</div>
                        <div className="text-sm text-muted-foreground">{format.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Loghi e Materiale Grafico
            </CardTitle>
            <CardDescription>
              Carica i loghi dell'associazione o altro materiale grafico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById('logo-upload')?.click()}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Trascina i file qui o clicca per selezionare
              </p>
              <p className="text-xs text-muted-foreground">
                Formati supportati: PNG, JPG, SVG
              </p>
              <input
                id="logo-upload"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {uploadedLogos.length > 0 && (
              <div className="mt-4 space-y-3">
                {uploadedLogos.map(logo => (
                  <div key={logo.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <img
                      src={logo.preview}
                      alt="Logo preview"
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <Input
                        value={logo.description}
                        onChange={(e) => updateLogoDescription(logo.id, e.target.value)}
                        placeholder="Descrizione del logo..."
                        className="text-sm"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLogo(logo.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          onClick={generateFlyer}
          disabled={isGenerating || !formData.title.trim()}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generazione in corso...
            </>
          ) : (
            'Genera Locandina AI'
          )}
        </Button>
      </div>

      {/* Preview Section */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Anteprima</CardTitle>
            <CardDescription>
              La locandina generata apparirà qui
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedImage ? (
              <div className="space-y-4">
                <div className={`mx-auto bg-gray-100 rounded-lg overflow-hidden ${formData.format === '1:1' ? 'aspect-square max-w-sm' : 'aspect-[9/16] max-w-xs'}`}>
                  <img
                    src={generatedImage}
                    alt="Locandina generata"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={downloadFlyer} className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Scarica
                  </Button>
                  <Button variant="outline" onClick={() => setGeneratedImage(null)}>
                    Nuova Locandina
                  </Button>
                </div>
              </div>
            ) : (
              <div className={`mx-auto bg-gray-50 rounded-lg flex items-center justify-center text-muted-foreground ${formData.format === '1:1' ? 'aspect-square max-w-sm' : 'aspect-[9/16] max-w-xs'}`}>
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">La locandina apparirà qui</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informazioni</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {styles.find(s => s.value === formData.style)?.label}
              </Badge>
              <Badge variant="outline">
                {formats.find(f => f.value === formData.format)?.label}
              </Badge>
              {uploadedLogos.length > 0 && (
                <Badge variant="outline">
                  {uploadedLogos.length} logo{uploadedLogos.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Le locandine vengono generate tramite AI</p>
              <p>• Il formato quadrato è perfetto per i post social</p>
              <p>• Il formato verticale è ideale per le stories</p>
              <p>• I loghi vengono integrati automaticamente nel design</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};