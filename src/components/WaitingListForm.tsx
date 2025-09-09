import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Mail } from 'lucide-react';

interface WaitingListFormData {
  firstName: string;
  lastName: string;
  clubName: string;
  city: string;
  email: string;
}

const WaitingListForm = () => {
  const [formData, setFormData] = useState<WaitingListFormData>({
    firstName: '',
    lastName: '',
    clubName: '',
    city: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field: keyof WaitingListFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.clubName || !formData.city || !formData.email) {
      toast.error('Tutti i campi sono obbligatori');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('waiting_list')
        .insert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          club_name: formData.clubName,
          city: formData.city,
          email: formData.email
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('Questa email è già registrata nella waiting list');
        } else {
          toast.error('Errore durante la registrazione. Riprova più tardi.');
        }
        return;
      }

      // Send welcome email
      try {
        console.log('Attempting to send welcome email to:', formData.email);
        const welcomeResponse = await supabase.functions.invoke('send-email', {
          body: {
            type: 'welcome',
            to: formData.email,
            data: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              clubName: formData.clubName,
              city: formData.city
            }
          }
        });
        console.log('Welcome email response:', welcomeResponse);
        if (welcomeResponse.error) {
          console.error('Welcome email error:', welcomeResponse.error);
        } else {
          console.log('Welcome email sent successfully');
        }
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Don't fail the registration if email fails
      }

      // Send notification email to admin
      try {
        console.log('Attempting to send notification email to: stanislaoelefante@gmail.com');
        const notificationResponse = await supabase.functions.invoke('send-email', {
          body: {
            type: 'notification',
            to: 'stanislaoelefante@gmail.com',
            subject: 'Nuova iscrizione alla waiting list di FastClub',
            data: {
              title: 'Nuova Iscrizione alla Waiting List',
              content: `
                <h3>Dettagli del nuovo iscritto:</h3>
                <ul style="line-height: 1.8;">
                  <li><strong>Nome:</strong> ${formData.firstName} ${formData.lastName}</li>
                  <li><strong>Email:</strong> ${formData.email}</li>
                  <li><strong>Club/Associazione:</strong> ${formData.clubName}</li>
                  <li><strong>Città:</strong> ${formData.city}</li>
                  <li><strong>Data iscrizione:</strong> ${new Date().toLocaleDateString('it-IT')}</li>
                </ul>
                <p>Puoi gestire la waiting list dal dashboard di Supabase.</p>
              `
            }
          }
        });
        console.log('Notification email response:', notificationResponse);
        if (notificationResponse.error) {
          console.error('Notification email error:', notificationResponse.error);
        } else {
          console.log('Admin notification email sent successfully');
        }
      } catch (emailError) {
        console.error('Error sending admin notification email:', emailError);
        // Don't fail the registration if email fails
      }

      setIsSubmitted(true);
      toast.success('Registrazione completata! Controlla la tua email per il messaggio di benvenuto.');
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        clubName: '',
        city: '',
        email: ''
      });
    } catch (error) {
      console.error('Error submitting waiting list form:', error);
      toast.error('Errore durante la registrazione. Riprova più tardi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-md mx-auto bg-card border">
        <CardContent className="text-center py-8 px-6">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Registrazione Completata!</h3>
          <p className="text-muted-foreground flex items-center gap-2">
            Grazie per il tuo interesse. Ti contatteremo presto con tutti i dettagli di <img src="/lovable-uploads/fc293183-4946-4f6f-9562-6509947cf52e.png" alt="FastClub" className="h-4" />.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl sm:text-2xl">Entra in Lista d'Attesa</CardTitle>
        <CardDescription className="text-sm sm:text-base flex items-center justify-center gap-2">
          Sii tra i primi a scoprire <img src="/lovable-uploads/fc293183-4946-4f6f-9562-6509947cf52e.png" alt="FastClub" className="h-4" /> quando sarà disponibile
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium">Nome *</Label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Il tuo nome"
                className="h-10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium">Cognome *</Label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Il tuo cognome"
                className="h-10"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="clubName" className="text-sm font-medium">Nome Club/Associazione *</Label>
            <Input
              id="clubName"
              type="text"
              value={formData.clubName}
              onChange={(e) => handleInputChange('clubName', e.target.value)}
              placeholder="Nome del tuo club o associazione"
              className="h-10"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium">Città *</Label>
            <Input
              id="city"
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="La tua città"
              className="h-10"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="la.tua.email@esempio.com"
              className="h-10"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-10 text-base"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Registrazione...
              </>
            ) : (
              'Entra in Lista d\'Attesa'
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center mt-3">
            * Campi obbligatori. La tua email non sarà condivisa con terzi.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default WaitingListForm;