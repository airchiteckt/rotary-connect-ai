import { Card, CardContent } from '@/components/ui/card';

interface StatItem {
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
  icon: React.ElementType;
  onClick?: () => void;
}

interface SectionStatsGridProps {
  stats: StatItem[];
  loading?: boolean;
}

export default function SectionStatsGrid({ stats, loading }: SectionStatsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className={stat.onClick ? 'cursor-pointer hover:shadow-lg transition-all duration-200' : ''}
          onClick={stat.onClick}
        >
          <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6 px-3 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{stat.label}</p>
                <p className={`text-lg sm:text-2xl font-bold ${stat.color}`}>
                  {loading ? '...' : stat.value}
                </p>
              </div>
              <div className={`p-1.5 sm:p-2 ${stat.bgColor} rounded-full flex-shrink-0`}>
                <stat.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
