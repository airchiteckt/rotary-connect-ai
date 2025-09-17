import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { HelpCircle, Bug, MessageCircle, Send, Phone, Mail } from 'lucide-react';

export default function HelpSupport() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    subject: '',
    description: '',
    priority: 'medium'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'support',
          to: 'info@fastclub.it',
          data: {
            type: formData.type,
            subject: formData.subject,
            description: formData.description,
            priority: formData.priority,
            userEmail: user?.email,
            userName: profile?.first_name && profile?.last_name 
              ? `${profile.first_name} ${profile.last_name}`
              : user?.email
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Richiesta inviata",
        description: "Il nostro team ti risponderà via email al più presto. Grazie!",
      });

      setFormData({
        type: '',
        subject: '',
        description: '',
        priority: 'medium'
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Errore invio richiesta:', error);
      toast({
        title: "Errore",
        description: "Impossibile inviare la richiesta. Riprova o contattaci direttamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Help Button */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 w-12 h-12"
            aria-label="Aiuto e Supporto"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Aiuto e Supporto
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">info@fastclub.it</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Telefono</p>
                      <p className="text-sm text-muted-foreground">+39 000 000 0000</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => setFormData(prev => ({ ...prev, type: 'bug' }))}
              >
                <Bug className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium">Segnala Bug</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => setFormData(prev => ({ ...prev, type: 'feature' }))}
              >
                <MessageCircle className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">Richiedi Funzione</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => setFormData(prev => ({ ...prev, type: 'support' }))}
              >
                <HelpCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Supporto Generico</span>
              </Button>
            </div>

            {/* Support Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Invia Richiesta</CardTitle>
                <CardDescription>
                  Descrivi il tuo problema o la tua richiesta. Ti risponderemo al più presto!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo di Richiesta</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona il tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bug">🐛 Segnalazione Bug</SelectItem>
                          <SelectItem value="feature">💡 Richiesta Funzione</SelectItem>
                          <SelectItem value="support">❓ Supporto Generico</SelectItem>
                          <SelectItem value="billing">💳 Problemi di Fatturazione</SelectItem>
                          <SelectItem value="data">📊 Problemi con i Dati</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Priorità</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona priorità" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">🟢 Bassa</SelectItem>
                          <SelectItem value="medium">🟡 Media</SelectItem>
                          <SelectItem value="high">🟠 Alta</SelectItem>
                          <SelectItem value="urgent">🔴 Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Oggetto</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Riassumi brevemente il problema o la richiesta"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrizione Dettagliata</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrivi nel dettaglio il problema, i passaggi per riprodurlo, o la funzione che vorresti vedere implementata..."
                      rows={5}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    {isLoading ? 'Invio in corso...' : 'Invia Richiesta'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* FAQ Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Domande Frequenti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="ghost" className="w-full justify-start h-auto p-3 text-left">
                  <div>
                    <p className="font-medium">Come posso cambiare la password?</p>
                    <p className="text-sm text-muted-foreground">Funzione in arrivo - contattaci per assistenza</p>
                  </div>
                </Button>
                
                <Button variant="ghost" className="w-full justify-start h-auto p-3 text-left">
                  <div>
                    <p className="font-medium">Come funziona il periodo di prova?</p>
                    <p className="text-sm text-muted-foreground">30 giorni gratuiti per testare tutte le funzionalità</p>
                  </div>
                </Button>
                
                <Button variant="ghost" className="w-full justify-start h-auto p-3 text-left">
                  <div>
                    <p className="font-medium">I miei dati sono sicuri?</p>
                    <p className="text-sm text-muted-foreground">Sì, utilizziamo crittografia e standard di sicurezza elevati</p>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}