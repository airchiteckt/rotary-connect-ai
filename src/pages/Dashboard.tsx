import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogOut } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { useDashboardStats } from '@/hooks/useDashboardStats';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardQuickStats from '@/components/dashboard/DashboardQuickStats';
import DashboardMenuGrid from '@/components/dashboard/DashboardMenuGrid';
import TrialNotice from '@/components/dashboard/TrialNotice';

export default function Dashboard() {
  const { user, loading, isTrialValid, profile, clubOwnerProfile, signOut, checkTrialStatus } = useAuth();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();
  const { stats, loading: loadingStats } = useDashboardStats(user);

  useEffect(() => {
    if (user) checkTrialStatus();
  }, [user, checkTrialStatus]);

  const handleLogout = () => {
    signOut();
    toast({ title: 'Logout effettuato', description: 'A presto!' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const subscriptionProfile = clubOwnerProfile || profile;

  if (!clubOwnerProfile && profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
        <Card className="max-w-md text-center">
          <CardHeader>
            <CardTitle>Invito in Attesa</CardTitle>
            <CardDescription>Il tuo account non è ancora associato a un club.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Controlla la tua email per il link di invito e completare l'associazione al club.
            </p>
            <Button variant="outline" onClick={handleLogout} className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isTrialValid && subscriptionProfile?.subscription_type !== 'active') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
        <Card className="max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-destructive">Periodo di Prova del Club Scaduto</CardTitle>
            <CardDescription>Il periodo di prova del club è terminato.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground flex items-center gap-1">
              Per continuare ad utilizzare{' '}
              <img src="/lovable-uploads/fc293183-4946-4f6f-9562-6509947cf52e.png" alt="FastClub" className="h-4" />
              , contatta il nostro team per attivare l'abbonamento.
            </p>
            <div className="space-y-2">
              <Button className="w-full">Contatta il Team</Button>
              <Button variant="outline" onClick={handleLogout} className="w-full">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const trialStartDate = subscriptionProfile?.trial_start_date
    ? new Date(subscriptionProfile.trial_start_date)
    : new Date();
  const totalDays = 120 + (subscriptionProfile?.bonus_months || 0) * 30;
  const daysSinceStart = Math.floor(
    (new Date().getTime() - trialStartDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysRemaining = Math.max(0, totalDays - daysSinceStart);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <DashboardHeader
        clubName={profile?.club_name}
        fullName={profile?.full_name}
        role={profile?.role}
        subscriptionType={subscriptionProfile?.subscription_type}
        daysRemaining={daysRemaining}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            Benvenuto, {profile?.full_name?.split(' ')[0] || 'Amico'}!
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Automatizza e ottimizza la gestione del tuo club con AI avanzata e automazioni intelligenti.
          </p>
        </div>

        <DashboardQuickStats stats={stats} loading={loadingStats} hasPermission={hasPermission} />
        <DashboardMenuGrid hasPermission={hasPermission} />

        {subscriptionProfile?.subscription_type === 'trial' && (
          <TrialNotice daysRemaining={daysRemaining} isAdmin={profile?.role === 'admin'} />
        )}
      </main>

    </div>
  );
}
