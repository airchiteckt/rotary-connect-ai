import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

interface SectionPageHeaderProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  iconColor: string;
  actions?: React.ReactNode;
}

export default function SectionPageHeader({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  actions,
}: SectionPageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => navigate('/dashboard')}>
                <Home className="w-4 h-4" />
              </Button>
            </div>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 ${iconColor} rounded-full flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold truncate">{title}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate hidden sm:block">{subtitle}</p>
            </div>
          </div>
          {actions && <div className="flex-shrink-0">{actions}</div>}
        </div>
      </div>
    </header>
  );
}
