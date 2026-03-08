import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface SectionPageLayoutProps {
  bgGradient: string;
  children: (user: NonNullable<ReturnType<typeof useAuth>['user']>) => React.ReactNode;
}

export default function SectionPageLayout({ bgGradient, children }: SectionPageLayoutProps) {
  const { user, loading } = useAuth();

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

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className={`min-h-screen ${bgGradient}`}>
      {children(user)}
    </div>
  );
}
