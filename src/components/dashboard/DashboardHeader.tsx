import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut } from 'lucide-react';
import UserSettings from '@/components/UserSettings';

interface DashboardHeaderProps {
  clubName?: string | null;
  fullName?: string | null;
  role?: string | null;
  subscriptionType?: string | null;
  daysRemaining: number;
  onLogout: () => void;
}

export default function DashboardHeader({
  clubName,
  fullName,
  role,
  subscriptionType,
  daysRemaining,
  onLogout,
}: DashboardHeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm sm:text-lg font-bold text-primary-foreground">F</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate flex items-center">
                <img
                  src="/lovable-uploads/fc293183-4946-4f6f-9562-6509947cf52e.png"
                  alt="FastClub"
                  className="h-5 sm:h-6"
                />
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {clubName || 'Il tuo Club'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-4 flex-shrink-0">
            {subscriptionType === 'trial' && (
              <Badge
                variant={daysRemaining > 7 ? 'default' : 'destructive'}
                className="text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">{daysRemaining} giorni rimasti</span>
                <span className="sm:hidden">{daysRemaining}g</span>
              </Badge>
            )}
            <div className="text-right hidden md:block">
              <p className="font-medium text-sm truncate max-w-[120px]">{fullName}</p>
              <p className="text-xs text-muted-foreground capitalize">{role}</p>
            </div>
            <UserSettings />
            <Button variant="ghost" size="sm" onClick={onLogout} className="p-2">
              <LogOut className="w-4 h-4" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
