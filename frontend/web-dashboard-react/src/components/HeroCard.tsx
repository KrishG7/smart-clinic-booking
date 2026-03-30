import React from 'react';
import { cn } from '../lib/cn';

// Ensure strict adherence to component-template specifications
interface HeroCardProps {
  readonly title: string;
  readonly value: string;
  readonly trend?: string;
  readonly className?: string;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  title,
  value,
  trend,
  className = '',
}) => {
  return (
    <div className={cn('glass-panel p-6 flex flex-col gap-2 transition-transform hover:scale-105', className)}>
      <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
      <div className="flex items-end gap-3">
        <span className="text-4xl font-bold text-white">{value}</span>
        {trend && (
          <span className={cn(
            "text-sm font-semibold mb-1", 
            trend.startsWith('-') ? "text-brand-500" : "text-emerald-400"
          )}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};

export default HeroCard;
