import { User } from 'lucide-react';

interface MobileHeaderProps {
  title: string;
  subtitle: string;
  stats?: Array<{
    label: string;
    value: number | string;
  }>;
  color?: 'primary' | 'purple' | 'orange';
}

export function MobileHeader({ title, subtitle, stats, color = 'primary' }: MobileHeaderProps) {
  const gradientColors = {
    primary: 'from-primary-600 to-primary-700',
    purple: 'from-purple-600 to-purple-700',
    orange: 'from-orange-600 to-orange-700',
  };

  return (
    <div className={`bg-gradient-to-r ${gradientColors[color]} text-white sticky top-0 z-10 shadow-lg`}>
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/70 text-sm font-medium">{subtitle}</p>
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
        </div>
        
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <p className="text-white/70 text-xs mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
