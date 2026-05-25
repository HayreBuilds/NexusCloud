import React, { useState } from 'react';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import { FileNode } from '@/types/ide';

interface SearchPanelProps {
  fileTree: FileNode[];
  onFileOpen: (fileId: string) => void;
}

function getAllFiles(nodes: FileNode[]): FileNode[] {
  const files: FileNode[] = [];
  for (const node of nodes) {
    if (node.type === 'file') files.push(node);
    if (node.children) files.push(...getAllFiles(node.children));
  }
  return files;
}

interface SearchResult {
  file: FileNode;
  lineNumber: number;
  lineContent: string;
  matchStart: number;
  matchEnd: number;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({ fileTree, onFileOpen }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

  const handleSearch = (q: string) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); return; }

    const files = getAllFiles(fileTree);
    const found: SearchResult[] = [];

    files.forEach(file => {
      const content = file.content ?? '';
      const lines = content.split('\n');
      lines.forEach((line, i) => {
        const idx = line.toLowerCase().indexOf(q.toLowerCase());
        if (idx !== -1) {
          found.push({
            file,
            lineNumber: i + 1,
            lineContent: line,
            matchStart: idx,
            matchEnd: idx + q.length,
          });
        }
      });
    });

    setResults(found.slice(0, 100));
    setExpandedFiles(new Set(found.map(r => r.file.id)));
  };

  const groupedResults = results.reduce((acc, result) => {
    const key = result.file.id;
    if (!acc[key]) acc[key] = { file: result.file, results: [] };
    acc[key].results.push(result);
    return acc;
  }, {} as Record<string, { file: FileNode; results: SearchResult[] }>);

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-[hsl(var(--ide-panel-border))]">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Search</span>
      </div>

      <div className="p-3">
        <div className="flex items-center gap-2 bg-[hsl(220_13%_14%)] border border-[hsl(220_13%_20%)] rounded px-2 py-1.5 focus-within:border-primary transition-colors">
          <Search size={12} className="text-muted-foreground shrink-0" />
          <input
            value={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search files..."
            className="flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
            autoFocus
          />
        </div>
        {results.length > 0 && (
          <div className="mt-1 text-[10px] text-muted-foreground">
            {results.length} result{results.length !== 1 ? 's' : ''} in {Object.keys(groupedResults).length} file{Object.keys(groupedResults).length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {Object.values(groupedResults).map(({ file, results: fileResults }) => {
          const isExpanded = expandedFiles.has(file.id);
          return (
            <div key={file.id} className="mb-2">
              <button
                className="flex items-center gap-1.5 w-full text-left px-1 py-0.5 hover:bg-[hsl(220_13%_16%)] rounded"
                onClick={() => {
                  setExpandedFiles(prev => {
                    const next = new Set(prev);
                    next.has(file.id) ? next.delete(file.id) : next.add(file.id);
                    return next;
                  });
                }}
              >
                {isExpanded ? <ChevronDown size={12} className="shrink-0" /> : <ChevronRight size={12} className="shrink-0" />}
                <span className="text-xs font-medium text-foreground truncate">{file.name}</span>
                <span className="ml-auto text-[10px] text-muted-foreground shrink-0">{fileResults.length}</span>
              </button>

              {isExpanded && fileResults.map((result, i) => (
                <button
                  key={i}
                  className="w-full text-left pl-5 pr-2 py-0.5 hover:bg-[hsl(220_13%_16%)] rounded"
                  onClick={() => onFileOpen(result.file.id)}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] text-muted-foreground shrink-0 w-6">{result.lineNumber}</span>
                    <span className="text-[11px] text-muted-foreground truncate font-mono">
                      {result.lineContent.slice(0, result.matchStart)}
                      <mark className="bg-[hsl(217_91%_30%)] text-primary rounded-sm">{result.lineContent.slice(result.matchStart, result.matchEnd)}</mark>
                      {result.lineContent.slice(result.matchEnd)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          );
        })}

        {query && results.length === 0 && (
          <div className="text-center py-8 text-xs text-muted-foreground">
            No results found for "{query}"
          </div>
        )}
      </div>
    </div>
  );
};
