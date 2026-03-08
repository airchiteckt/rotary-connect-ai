import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

interface TrialNoticeProps {
  daysRemaining: number;
  isAdmin: boolean;
}

export default function TrialNotice({ daysRemaining, isAdmin }: TrialNoticeProps) {
  const navigate = useNavigate();

  return (
    <Card className="mt-6 sm:mt-8 border-amber-200 bg-amber-50/50">
      <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
        <div className="flex items-start sm:items-center space-x-3">
          <Calendar className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5 sm:mt-0" />
          <div className="min-w-0">
            <p className="font-medium text-amber-800 text-sm sm:text-base">
              Periodo di Prova del Club Attivo
            </p>
            <p className="text-xs sm:text-sm text-amber-700 mt-1">
              Al club rimangono {daysRemaining} giorni per testare tutte le funzionalità del gestionale.
            </p>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 text-amber-800 border-amber-300 hover:bg-amber-100"
                onClick={() => navigate('/dashboard')}
              >
                Attiva Abbonamento Premium
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
