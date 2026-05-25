import React, { useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, X, Plus, Trash2 } from 'lucide-react';
import { TerminalLine } from '@/types/ide';
import { cn } from '@/lib/utils';

interface TerminalProps {
  lines: TerminalLine[];
  input: string;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

function getLineColor(type: TerminalLine['type']): string {
  switch (type) {
    case 'input': return 'text-[hsl(217_91%_70%)]';
    case 'error': return 'text-red-400';
    case 'success': return 'text-green-400';
    case 'info': return 'text-yellow-400';
    default: return 'text-[hsl(213_31%_80%)]';
  }
}

function renderLine(content: string): string {
  // Handle ANSI-like color codes
  return content
    .replace(/\x1b\[32m/g, '<span style="color:#98c379">')
    .replace(/\x1b\[36m/g, '<span style="color:#56b6c2">')
    .replace(/\x1b\[33m/g, '<span style="color:#e5c07b">')
    .replace(/\x1b\[31m/g, '<span style="color:#e06c75">')
    .replace(/\x1b\[0m/g, '</span>');
}

export const Terminal: React.FC<TerminalProps> = ({
  lines,
  input,
  onInputChange,
  onKeyDown,
  onClear,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--ide-terminal))]">
      {/* Terminal header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[hsl(var(--ide-panel-border))] shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-0.5 bg-[hsl(220_13%_12%)] rounded-sm border-b-2 border-[hsl(var(--primary))] text-xs text-foreground cursor-pointer">
            <TerminalIcon size={12} />
            <span>bash</span>
          </div>
          <button className="p-1 rounded hover:bg-[hsl(220_13%_16%)] text-muted-foreground hover:text-foreground">
            <Plus size={12} />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onClear}
            title="Clear Terminal"
            className="p-1 rounded hover:bg-[hsl(220_13%_16%)] text-muted-foreground hover:text-foreground transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Output */}
      <div
        className="flex-1 overflow-y-auto px-4 py-2 font-mono text-xs"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map(line => (
          <div
            key={line.id}
            className={cn('leading-5', getLineColor(line.type))}
            dangerouslySetInnerHTML={{ __html: renderLine(line.content) }}
          />
        ))}

        {/* Input line */}
        <div className="flex items-center mt-1">
          <span className="text-green-400 mr-2">
            developer@nexusIDE:~/my-app$
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 bg-transparent text-foreground outline-none font-mono text-xs caret-green-400"
            spellCheck={false}
            autoComplete="off"
            autoFocus
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
