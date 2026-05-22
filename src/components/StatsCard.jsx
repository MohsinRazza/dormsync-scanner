import { Card, CardContent } from './ui/card';
import { cn } from '../lib/utils';

const StatsCard = ({ label, value, icon: Icon, description, variant = 'default', onClick }) => {
  const variants = {
    default: 'bg-white dark:bg-slate-950',
    warning: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800',
    danger: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
  };

  const iconBgColors = {
    default: 'bg-cyan-50 dark:bg-cyan-950',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30',
    danger: 'bg-red-100 dark:bg-red-900/30'
  };

  const iconColors = {
    default: 'text-cyan-600 dark:text-cyan-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    danger: 'text-red-600 dark:text-red-400'
  };

  return (
    <Card 
      onClick={onClick}
      className={cn(variants[variant], onClick && 'cursor-pointer hover:shadow-md transition-shadow')}
    >
      <CardContent className="p-3 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400">
              {label}
            </p>
            <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-1 md:mt-2">
              {value}
            </p>
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 md:mt-1">
                {description}
              </p>
            )}
          </div>
          <div className={cn("ml-2 md:ml-4 p-2 md:p-3 rounded-lg", iconBgColors[variant])}>
            <Icon className={cn("w-4 h-4 md:w-6 md:h-6", iconColors[variant])} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
