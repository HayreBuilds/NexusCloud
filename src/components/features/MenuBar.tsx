import React, { useState } from 'react';
import { Zap, ChevronDown } from 'lucide-react';

interface MenuBarProps {
  onAction?: (action: string) => void;
}

const MENUS = [
  {
    label: 'File',
    items: ['New File', 'New Folder', '---', 'Open...', 'Save', 'Save All', '---', 'Close Editor'],
  },
  {
    label: 'Edit',
    items: ['Undo', 'Redo', '---', 'Cut', 'Copy', 'Paste', '---', 'Find', 'Replace'],
  },
  {
    label: 'View',
    items: ['Explorer', 'Search', 'Terminal', 'AI Agent', '---', 'Word Wrap', 'Minimap'],
  },
  {
    label: 'Terminal',
    items: ['New Terminal', 'Split Terminal', '---', 'Run Task', 'Run Build Task'],
  },
  {
    label: 'Run',
    items: ['Start Debugging', 'Run Without Debugging', '---', 'Add Configuration'],
  },
  {
    label: 'Help',
    items: ['Documentation', 'Keyboard Shortcuts', '---', 'About NexusIDE'],
  },
];

export const MenuBar: React.FC<MenuBarProps> = ({ onAction }) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <div className="flex items-center h-8 bg-[hsl(220_13%_8%)] border-b border-[hsl(var(--ide-panel-border))] px-2 shrink-0 select-none">
      {/* Logo */}
      <div className="flex items-center gap-1.5 mr-4">
        <div className="w-5 h-5 bg-primary rounded-sm flex items-center justify-center">
          <Zap size={12} className="text-primary-foreground fill-current" />
        </div>
        <span className="text-xs font-semibold text-foreground tracking-wide">NexusIDE</span>
      </div>

      {/* Menu Items */}
      <div className="flex items-center">
        {MENUS.map(menu => (
          <div key={menu.label} className="relative">
            <button
              className="flex items-center gap-0.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-[hsl(220_13%_15%)] rounded-sm transition-colors"
              onClick={() => setOpenMenu(openMenu === menu.label ? null : menu.label)}
              onMouseEnter={() => openMenu && setOpenMenu(menu.label)}
            >
              {menu.label}
            </button>
            {openMenu === menu.label && (
              <div
                className="absolute top-full left-0 mt-0.5 w-48 bg-[hsl(220_13%_14%)] border border-[hsl(var(--ide-panel-border))] rounded shadow-xl z-50 py-1"
                onMouseLeave={() => setOpenMenu(null)}
              >
                {menu.items.map((item, i) =>
                  item === '---' ? (
                    <div key={i} className="border-t border-[hsl(var(--ide-panel-border))] my-1" />
                  ) : (
                    <button
                      key={item}
                      className="w-full text-left px-3 py-1 text-xs text-foreground hover:bg-[hsl(var(--primary))] hover:text-primary-foreground transition-colors"
                      onClick={() => {
                        onAction?.(item);
                        setOpenMenu(null);
                      }}
                    >
                      {item}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[hsl(263_70%_20%)] rounded text-xs text-violet-300 border border-[hsl(263_70%_35%)]">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          AI Agent Online
        </div>
      </div>
    </div>
  );
};
