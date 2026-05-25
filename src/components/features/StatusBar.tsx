import React from 'react';
import {
  GitBranch,
  AlertCircle,
  AlertTriangle,
  Zap,
  Check,
} from 'lucide-react';
import { Tab } from '@/types/ide';

interface StatusBarProps {
  activeTab: Tab | null;
  fileCount: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({ activeTab, fileCount }) => {
  const lines = activeTab ? activeTab.content.split('\n').length : 0;
  const chars = activeTab ? activeTab.content.length : 0;

  return (
    <div className="flex items-center justify-between h-6 bg-[hsl(var(--ide-statusbar))] px-3 shrink-0 text-[11px] text-white/90 select-none">
      {/* Left */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <GitBranch size={11} />
          <span>main</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertCircle size={11} />
          <span>0 errors</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertTriangle size={11} />
          <span>0 warnings</span>
        </div>
      </div>

      {/* Center */}
      <div className="flex items-center gap-1.5">
        <Zap size={11} />
        <span className="font-semibold tracking-wide">NexusIDE</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {activeTab && (
          <>
            <span>{activeTab.language}</span>
            <span>Ln {lines}, Col 1</span>
            <span>{chars} chars</span>
            <span>UTF-8</span>
            {activeTab.isDirty ? (
              <span className="text-yellow-300">● Unsaved</span>
            ) : (
              <span className="flex items-center gap-1 text-green-300">
                <Check size={10} /> Saved
              </span>
            )}
          </>
        )}
        <span>{fileCount} files</span>
      </div>
    </div>
  );
};
