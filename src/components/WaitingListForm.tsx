import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface WaitingListFormData {
  firstName: string;
  lastName: string;
  clubName: string;
  city: string;
  email: string;
}

const WaitingListForm = () => {
  const { t } = useLanguage();
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
      toast.error(t('form.error.allFields'));
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
          toast.error(t('form.error.emailExists'));
        } else {
          toast.error(t('form.error.generic'));
        }
        return;
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
      toast.success(t('form.success.toast'));
      
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
      toast.error(t('form.error.generic'));
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
          <h3 className="text-lg font-semibold mb-2">{t('form.success.title')}</h3>
          <p className="text-muted-foreground flex items-center gap-2">
            {t('form.success.message')} <img src="/lovable-uploads/fc293183-4946-4f6f-9562-6509947cf52e.png" alt="FastClub" className="h-4" />.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl sm:text-2xl">{t('form.title')}</CardTitle>
        <CardDescription className="text-sm sm:text-base flex items-center justify-center gap-2">
          {t('form.subtitle')} <img src="/lovable-uploads/fc293183-4946-4f6f-9562-6509947cf52e.png" alt="FastClub" className="h-4" /> {t('form.subtitleSuffix')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium">{t('form.firstName')} *</Label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder={t('form.firstNamePlaceholder')}
                className="h-10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium">{t('form.lastName')} *</Label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder={t('form.lastNamePlaceholder')}
                className="h-10"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="clubName" className="text-sm font-medium">{t('form.clubName')} *</Label>
            <Input
              id="clubName"
              type="text"
              value={formData.clubName}
              onChange={(e) => handleInputChange('clubName', e.target.value)}
              placeholder={t('form.clubNamePlaceholder')}
              className="h-10"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium">{t('form.city')} *</Label>
            <Input
              id="city"
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder={t('form.cityPlaceholder')}
              className="h-10"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">{t('form.email')} *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder={t('form.emailPlaceholder')}
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
                {t('form.submitting')}
              </>
            ) : (
              t('form.submit')
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center mt-3">
            {t('form.required')}
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default WaitingListForm;