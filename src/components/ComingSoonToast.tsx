import { useToast } from '@/hooks/use-toast';
import { Clock, AlertCircle } from 'lucide-react';

interface ComingSoonToastProps {
  featureName: string;
  description?: string;
}

export const useComingSoonToast = () => {
  const { toast } = useToast();

  const showComingSoon = (featureName: string, description?: string) => {
    toast({
      title: (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Funzione in Arrivo</span>
        </div>
      ) as any,
      description: description || `La funzione "${featureName}" sarà disponibile presto. Stiamo lavorando per implementarla!`,
      duration: 4000,
    });
  };

  return { showComingSoon };
};

export default function ComingSoonToast({ featureName, description }: ComingSoonToastProps) {
  const { showComingSoon } = useComingSoonToast();

  const handleClick = () => {
    showComingSoon(featureName, description);
  };

  return { handleClick };
}