import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Crown, Shield, Building, Calendar } from 'lucide-react';
import { DashboardStats } from '@/hooks/useDashboardStats';

interface DashboardQuickStatsProps {
  stats: DashboardStats;
  loading: boolean;
  hasPermission: (section: string) => boolean;
}

export default function DashboardQuickStats({ stats, loading, hasPermission }: DashboardQuickStatsProps) {
  const navigate = useNavigate();

  const statItems = [
    { icon: Users, color: 'text-orange-600', label: 'Soci Attivi', value: stats.activeMembers, section: 'soci', href: '/soci' },
    { icon: Crown, color: 'text-amber-600', label: 'Progetti', value: stats.projects, section: 'presidenza', href: '/presidenza' },
    { icon: Shield, color: 'text-red-600', label: 'Eventi', value: stats.events, section: 'prefettura', href: '/prefettura' },
    { icon: Building, color: 'text-indigo-600', label: 'Commissioni', value: stats.commissions, section: 'commissioni', href: '/commissioni' },
    { icon: Calendar, color: 'text-green-600', label: 'Questo Mese', value: stats.upcomingEvents, section: null, href: '/calendario' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4 mb-6 sm:mb-8">
      {statItems.map((item) => (
        <Card
          key={item.label}
          className="cursor-pointer hover:shadow-lg transition-all duration-200"
          onClick={() => {
            if (!item.section || hasPermission(item.section)) {
              navigate(item.href);
            }
          }}
        >
          <CardContent className="pt-2 sm:pt-4 pb-2 sm:pb-4">
            <div className="text-center">
              <item.icon className={`w-4 h-4 sm:w-6 sm:h-6 ${item.color} mx-auto mb-1`} />
              <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
              <p className="text-sm sm:text-lg font-bold">{loading ? '...' : item.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
