import React, { useRef } from 'react';
import { X, Circle } from 'lucide-react';
import { Tab } from '@/types/ide';
import { cn } from '@/lib/utils';
import { FILE_ICONS, LANGUAGE_MAP } from '@/constants/defaultFiles';

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string | null;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
}

function getTabIcon(tab: Tab): string {
  const ext = tab.fileName.split('.').pop()?.toLowerCase() ?? '';
  const lang = LANGUAGE_MAP[ext] ?? 'plaintext';
  return FILE_ICONS[lang] ?? '📄';
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (tabs.length === 0) {
    return (
      <div className="flex items-center h-9 bg-[hsl(var(--ide-tab-bar))] border-b border-[hsl(var(--ide-panel-border))]">
        <div className="flex items-center px-4 text-xs text-muted-foreground">
          No files open — select a file from the explorer
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex items-end h-9 bg-[hsl(var(--ide-tab-bar))] border-b border-[hsl(var(--ide-panel-border))] overflow-x-auto overflow-y-hidden shrink-0"
      style={{ scrollbarWidth: 'none' }}
    >
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={cn(
            'ide-tab min-w-0 max-w-[200px] h-full',
            tab.id === activeTabId ? 'ide-tab-active' : 'ide-tab-inactive'
          )}
          onClick={() => onTabClick(tab.id)}
          title={tab.filePath}
        >
          <span className="text-xs shrink-0">{getTabIcon(tab)}</span>
          <span className="truncate text-xs">{tab.fileName}</span>
          <button
            className={cn(
              'shrink-0 rounded-sm p-0.5 transition-colors ml-1',
              tab.id === activeTabId
                ? 'hover:bg-[hsl(220_13%_20%)]'
                : 'hover:bg-[hsl(220_13%_20%)]',
              'opacity-0 group-hover:opacity-100',
              tab.isDirty ? 'opacity-100' : 'opacity-0 hover:opacity-100'
            )}
            onClick={e => { e.stopPropagation(); onTabClose(tab.id); }}
          >
            {tab.isDirty ? (
              <Circle size={8} className="fill-current text-blue-400" />
            ) : (
              <X size={12} />
            )}
          </button>
        </div>
      ))}
    </div>
  );
};
