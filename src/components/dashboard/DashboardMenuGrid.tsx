import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, FileText, DollarSign, Crown, Building, Megaphone, Users, UserCheck } from 'lucide-react';
import { AppSection } from '@/hooks/usePermissions';

interface MenuItem {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
  section: AppSection;
}

const menuItems: MenuItem[] = [
  { title: 'Segreteria', description: 'Documenti, verbali, programmi mensili e comunicazioni ufficiali', icon: FileText, href: '/segreteria', color: 'bg-blue-600', section: 'segreteria' },
  { title: 'Tesoreria', description: 'Gestione finanziaria, bilanci e quote soci', icon: DollarSign, href: '/tesoreria', color: 'bg-emerald-600', section: 'tesoreria' },
  { title: 'Presidenza', description: 'Strumenti per la governance e coordinamento club', icon: Crown, href: '/presidenza', color: 'bg-amber-600', section: 'presidenza' },
  { title: 'Prefettura', description: 'Cerimoniale, protocollo e organizzazione eventi', icon: Shield, href: '/prefettura', color: 'bg-red-600', section: 'prefettura' },
  { title: 'Direttivo', description: 'Coordinamento consiglio direttivo e commissioni', icon: Building, href: '/direttivo', color: 'bg-indigo-600', section: 'direttivo' },
  { title: 'Comunicazione', description: 'Locandine, social media e comunicazione esterna', icon: Megaphone, href: '/comunicazione', color: 'bg-purple-600', section: 'comunicazione' },
  { title: 'Soci e Organigramma', description: 'Anagrafica soci, cariche e struttura organizzativa', icon: Users, href: '/soci', color: 'bg-orange-600', section: 'soci' },
  { title: 'Commissioni', description: 'Gestione commissioni e assegnazione progetti', icon: UserCheck, href: '/commissioni', color: 'bg-pink-600', section: 'commissioni' },
];

interface DashboardMenuGridProps {
  hasPermission: (section: AppSection) => boolean;
}

export default function DashboardMenuGrid({ hasPermission }: DashboardMenuGridProps) {
  const navigate = useNavigate();
  const accessibleItems = menuItems.filter((item) => hasPermission(item.section));

  if (accessibleItems.length === 0) {
    return (
      <div className="grid grid-cols-1">
        <Card>
          <CardContent className="pt-6 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Accesso Limitato</h3>
            <p className="text-muted-foreground mb-4">
              Non hai ancora i permessi per accedere alle sezioni dell'app.
            </p>
            <p className="text-sm text-muted-foreground">
              Contatta l'amministratore del tuo club per richiedere l'accesso alle sezioni di cui hai bisogno.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {accessibleItems.map((item) => (
        <Card key={item.title} className="cursor-pointer hover:shadow-lg transition-all duration-200 group">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-lg ${item.color} text-white`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="group-hover:text-primary transition-colors">{item.title}</CardTitle>
                <CardDescription className="mt-1">{item.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" onClick={() => navigate(item.href)}>
              Accedi a {item.title}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
