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
    style: 'professionale' as const
  });
  
  const [uploadedLogos, setUploadedLogos] = useState<UploadedLogo[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{
    post: string | null;
    story: string | null;
  }>({ post: null, story: null });

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
    setGeneratedImages({ post: null, story: null });

    try {
      // Convert logos to base64
      const logoData = await Promise.all(
        uploadedLogos.map(async (logo) => {
          return new Promise<{description: string, data: string, mimeType: string}>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const base64Data = (reader.result as string).split(',')[1]; // Remove data:image/...;base64, prefix
              resolve({
                description: logo.description,
                data: base64Data,
                mimeType: logo.file.type
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(logo.file);
          });
        })
      );

      // Generate both formats simultaneously
      const [postResult, storyResult] = await Promise.all([
        // Generate 1:1 format for post
        supabase.functions.invoke('generate-flyer-ai', {
          body: {
            ...formData,
            format: '1:1',
            hasLogos: uploadedLogos.length > 0,
            logoDescriptions: uploadedLogos.map(logo => logo.description),
            logos: logoData
          }
        }),
        // Generate 9:16 format for story
        supabase.functions.invoke('generate-flyer-ai', {
          body: {
            ...formData,
            format: '9:16',
            hasLogos: uploadedLogos.length > 0,
            logoDescriptions: uploadedLogos.map(logo => logo.description),
            logos: logoData
          }
        })
      ]);

      // Handle post result
      if (postResult.error) {
        console.error('Error generating post:', postResult.error);
        throw new Error('Errore nella generazione del post');
      }

      // Handle story result
      if (storyResult.error) {
        console.error('Error generating story:', storyResult.error);
        throw new Error('Errore nella generazione della story');
      }

      // Process and set images
      const results = { post: null as string | null, story: null as string | null };

      if (postResult.data?.success && (postResult.data.imageUrl || postResult.data.imageData)) {
        const imageData = postResult.data.imageUrl || postResult.data.imageData;
        results.post = imageData.startsWith('data:') 
          ? imageData 
          : `data:image/png;base64,${imageData}`;
      }

      if (storyResult.data?.success && (storyResult.data.imageUrl || storyResult.data.imageData)) {
        const imageData = storyResult.data.imageUrl || storyResult.data.imageData;
        results.story = imageData.startsWith('data:') 
          ? imageData 
          : `data:image/png;base64,${imageData}`;
      }

      if (results.post || results.story) {
        setGeneratedImages(results);
        toast({
          title: "Locandine generate!",
          description: `Generati ${results.post && results.story ? 'entrambi i formati' : 'un formato'} con successo`
        });
      } else {
        throw new Error('Nessuna immagine generata con successo');
      }

    } catch (error) {
      console.error('Error generating flyers:', error);
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore durante la generazione delle locandine",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadFlyer = (type: 'post' | 'story') => {
    const image = generatedImages[type];
    if (!image) return;
    
    const link = document.createElement('a');
    link.href = image;
    const formatLabel = type === 'post' ? 'post-1x1' : 'story-9x16';
    link.download = `locandina-${formData.title.replace(/\s+/g, '-').toLowerCase()}-${formatLabel}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = () => {
    if (generatedImages.post) downloadFlyer('post');
    if (generatedImages.story) downloadFlyer('story');
  };

  const styles = [
    { value: 'professionale', label: 'Professionale', description: 'Design elegante e corporate' },
    { value: 'festa', label: 'Festa', description: 'Colorato e festoso' },
    { value: 'club', label: 'Club', description: 'Stile moderno per eventi club' },
    { value: 'service', label: 'Service', description: 'Orientato al servizio comunitario' },
    { value: 'elegante', label: 'Elegante', description: 'Raffinato con accenti premium' },
    { value: 'moderno', label: 'Moderno', description: 'Minimalista e contemporaneo' }
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
            'Genera Locandine (Post + Story)'
          )}
        </Button>
      </div>

      {/* Preview Section */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Anteprima</CardTitle>
            <CardDescription>
              Le locandine generate appariranno qui (Post 1:1 + Story 9:16)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedImages.post || generatedImages.story ? (
              <div className="space-y-6">
                {/* Post Format 1:1 */}
                {generatedImages.post && (
                  <div>
                    <h4 className="font-semibold mb-3 text-center">Post Instagram/Facebook (1:1)</h4>
                    <div className="mx-auto bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 aspect-square max-w-sm">
                      <img
                        src={generatedImages.post}
                        alt="Locandina Post 1:1"
                        className="w-full h-full object-contain bg-white"
                        onError={(e) => {
                          console.error('Error loading post image:', e);
                        }}
                      />
                    </div>
                    <div className="mt-2 flex justify-center">
                      <Button 
                        onClick={() => downloadFlyer('post')} 
                        variant="outline"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Scarica Post
                      </Button>
                    </div>
                  </div>
                )}

                {/* Story Format 9:16 */}
                {generatedImages.story && (
                  <div>
                    <h4 className="font-semibold mb-3 text-center">Story Instagram (9:16)</h4>
                    <div className="mx-auto bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 aspect-[9/16] max-w-xs">
                      <img
                        src={generatedImages.story}
                        alt="Locandina Story 9:16"
                        className="w-full h-full object-contain bg-white"
                        onError={(e) => {
                          console.error('Error loading story image:', e);
                        }}
                      />
                    </div>
                    <div className="mt-2 flex justify-center">
                      <Button 
                        onClick={() => downloadFlyer('story')} 
                        variant="outline"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Scarica Story
                      </Button>
                    </div>
                  </div>
                )}

                {/* Download All Button */}
                {generatedImages.post && generatedImages.story && (
                  <div className="flex justify-center pt-4 border-t">
                    <Button onClick={downloadAll} className="w-full max-w-xs">
                      <Download className="w-4 h-4 mr-2" />
                      Scarica Entrambe
                    </Button>
                  </div>
                )}

                <div className="flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setGeneratedImages({ post: null, story: null })}
                  >
                    Genera Nuove Locandine
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="flex justify-center space-x-8 mb-4">
                  <div className="aspect-square w-20 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <ImageIcon className="w-8 h-8 opacity-50" />
                  </div>
                  <div className="aspect-[9/16] w-12 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <ImageIcon className="w-6 h-6 opacity-50" />
                  </div>
                </div>
                <p className="text-sm">Le locandine appariranno qui</p>
                <p className="text-xs text-muted-foreground">Formato Post (1:1) e Story (9:16)</p>
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
                Post 1:1 + Story 9:16
              </Badge>
              {uploadedLogos.length > 0 && (
                <Badge variant="outline">
                  {uploadedLogos.length} logo{uploadedLogos.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Genera automaticamente entrambi i formati</p>
              <p>• Post 1:1: perfetto per Instagram e Facebook</p>
              <p>• Story 9:16: ideale per Instagram Stories</p>
              <p>• I loghi vengono integrati automaticamente</p>
              <p>• Scarica singolarmente o entrambi insieme</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};