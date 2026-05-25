import React from 'react';
import { cn } from '@/lib/utils';
import {
  Files,
  Search,
  GitBranch,
  Settings,
  Bot,
  Terminal,
  Package,
  Play,
} from 'lucide-react';

interface ActivityBarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const TOP_ITEMS = [
  { id: 'explorer', icon: Files, label: 'Explorer' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'git', icon: GitBranch, label: 'Source Control' },
  { id: 'extensions', icon: Package, label: 'Extensions' },
  { id: 'run', icon: Play, label: 'Run & Debug' },
];

const BOTTOM_ITEMS = [
  { id: 'ai', icon: Bot, label: 'AI Agent' },
  { id: 'terminal', icon: Terminal, label: 'Terminal' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export const ActivityBar: React.FC<ActivityBarProps> = ({ activeView, onViewChange }) => {
  return (
    <div className="flex flex-col items-center justify-between w-12 bg-[hsl(var(--ide-activity))] border-r border-[hsl(var(--ide-panel-border))] py-2 shrink-0">
      <div className="flex flex-col items-center gap-1">
        {TOP_ITEMS.map(item => (
          <button
            key={item.id}
            title={item.label}
            onClick={() => onViewChange(item.id)}
            className={cn(
              'w-10 h-10 flex items-center justify-center rounded-sm transition-all relative group',
              activeView === item.id
                ? 'text-foreground after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2 after:w-0.5 after:h-6 after:bg-primary after:rounded-r'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <item.icon size={20} strokeWidth={1.5} />
            <span className="absolute left-full ml-3 px-2 py-1 text-xs bg-[hsl(220_13%_20%)] text-foreground rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-[hsl(var(--ide-panel-border))]">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-1">
        {BOTTOM_ITEMS.map(item => (
          <button
            key={item.id}
            title={item.label}
            onClick={() => onViewChange(item.id)}
            className={cn(
              'w-10 h-10 flex items-center justify-center rounded-sm transition-all relative group',
              activeView === item.id
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground',
              item.id === 'ai' && 'text-violet-400 hover:text-violet-300'
            )}
          >
            <item.icon size={20} strokeWidth={1.5} />
            <span className="absolute left-full ml-3 px-2 py-1 text-xs bg-[hsl(220_13%_20%)] text-foreground rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-[hsl(var(--ide-panel-border))]">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
