import React, { useState, useCallback, useRef } from 'react';
import { ActivityBar } from '@/components/features/ActivityBar';
import { FileExplorer } from '@/components/features/FileExplorer';
import { TabBar } from '@/components/features/TabBar';
import { CodeEditor } from '@/components/features/CodeEditor';
import { Terminal } from '@/components/features/Terminal';
import { AIAgent } from '@/components/features/AIAgent';
import { MenuBar } from '@/components/features/MenuBar';
import { StatusBar } from '@/components/features/StatusBar';
import { SearchPanel } from '@/components/features/SearchPanel';
import { useFileSystem } from '@/hooks/useFileSystem';
import { useTerminal } from '@/hooks/useTerminal';
import { useAIAgent } from '@/hooks/useAIAgent';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, PanelLeft, Bot, X } from 'lucide-react';

function countAllFiles(nodes: any[]): number {
  let count = 0;
  for (const node of nodes) {
    if (node.type === 'file') count++;
    if (node.children) count += countAllFiles(node.children);
  }
  return count;
}

export const IDELayout: React.FC = () => {
  const [activeView, setActiveView] = useState('explorer');
  const [showTerminal, setShowTerminal] = useState(true);
  const [showAI, setShowAI] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [aiPanelWidth, setAIPanelWidth] = useState(340);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [isDraggingSidebar, setIsDraggingSidebar] = useState(false);
  const [isDraggingAI, setIsDraggingAI] = useState(false);
  const [isDraggingTerminal, setIsDraggingTerminal] = useState(false);

  const fs = useFileSystem();
  const terminal = useTerminal();

  const aiContext = {
    activeFile: fs.activeTab?.fileName,
    activeContent: fs.activeTab?.content,
    terminalInject: terminal.injectCommand,
    onCodeUpdate: (content: string) => {
      if (fs.activeTab) fs.updateTabContent(fs.activeTab.id, content);
    },
  };

  const agent = useAIAgent(aiContext);

  // Sidebar resize
  const handleSidebarMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingSidebar(true);
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const onMove = (e: MouseEvent) => {
      const delta = e.clientX - startX;
      setSidebarWidth(Math.max(160, Math.min(480, startWidth + delta)));
    };
    const onUp = () => {
      setIsDraggingSidebar(false);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [sidebarWidth]);

  // AI panel resize
  const handleAIMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingAI(true);
    const startX = e.clientX;
    const startWidth = aiPanelWidth;

    const onMove = (e: MouseEvent) => {
      const delta = startX - e.clientX;
      setAIPanelWidth(Math.max(240, Math.min(600, startWidth + delta)));
    };
    const onUp = () => {
      setIsDraggingAI(false);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [aiPanelWidth]);

  // Terminal resize
  const handleTerminalMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingTerminal(true);
    const startY = e.clientY;
    const startHeight = terminalHeight;

    const onMove = (e: MouseEvent) => {
      const delta = startY - e.clientY;
      setTerminalHeight(Math.max(100, Math.min(500, startHeight + delta)));
    };
    const onUp = () => {
      setIsDraggingTerminal(false);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [terminalHeight]);

  const handleMenuAction = (action: string) => {
    if (action === 'Terminal') setShowTerminal(v => !v);
    if (action === 'AI Agent') setShowAI(v => !v);
    if (action === 'New File') fs.createFile(null, 'untitled.ts');
  };

  const handleActivityView = (view: string) => {
    if (view === 'terminal') { setShowTerminal(v => !v); return; }
    if (view === 'ai') { setShowAI(v => !v); return; }
    setActiveView(view);
  };

  const fileCount = countAllFiles(fs.fileTree);

  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden bg-[hsl(var(--ide-bg))]"
      style={{ userSelect: isDraggingSidebar || isDraggingAI || isDraggingTerminal ? 'none' : 'auto' }}
    >
      {/* Menu Bar */}
      <MenuBar onAction={handleMenuAction} />

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        <ActivityBar activeView={activeView} onViewChange={handleActivityView} />

        {/* Sidebar */}
        <div
          className="flex flex-col bg-[hsl(var(--ide-sidebar))] border-r border-[hsl(var(--ide-panel-border))] shrink-0 overflow-hidden"
          style={{ width: sidebarWidth }}
        >
          {activeView === 'explorer' && (
            <FileExplorer
              fileTree={fs.fileTree}
              selectedFileId={fs.selectedFileId}
              onFileOpen={fs.openFile}
              onFolderToggle={fs.toggleFolderOpen}
              onCreateFile={fs.createFile}
              onCreateFolder={fs.createFolder}
              onDeleteFile={fs.deleteFile}
              onRenameFile={fs.renameFile}
            />
          )}
          {activeView === 'search' && (
            <SearchPanel
              fileTree={fs.fileTree}
              onFileOpen={fs.openFile}
            />
          )}
          {activeView === 'git' && (
            <div className="p-4 text-xs text-muted-foreground">
              <div className="font-semibold uppercase tracking-wider mb-3 text-xs">Source Control</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1 px-2 bg-[hsl(220_13%_14%)] rounded">
                  <span className="text-orange-400">M</span>
                  <span className="truncate flex-1 ml-2">src/App.tsx</span>
                </div>
                <div className="flex items-center justify-between py-1 px-2 bg-[hsl(220_13%_14%)] rounded">
                  <span className="text-orange-400">M</span>
                  <span className="truncate flex-1 ml-2">src/App.css</span>
                </div>
              </div>
              <button className="mt-4 w-full py-1.5 bg-primary text-primary-foreground text-xs rounded hover:opacity-90 transition-opacity">
                Commit Changes
              </button>
            </div>
          )}
          {activeView === 'extensions' && (
            <div className="p-4 text-xs text-muted-foreground">
              <div className="font-semibold uppercase tracking-wider mb-3">Extensions</div>
              {['ESLint', 'Prettier', 'TypeScript Hero', 'Tailwind CSS IntelliSense'].map(ext => (
                <div key={ext} className="flex items-center justify-between py-2 border-b border-[hsl(var(--ide-panel-border))]">
                  <span className="text-foreground text-xs">{ext}</span>
                  <span className="text-green-400 text-[10px]">Installed</span>
                </div>
              ))}
            </div>
          )}
          {activeView === 'run' && (
            <div className="p-4 text-xs text-muted-foreground">
              <div className="font-semibold uppercase tracking-wider mb-3">Run & Debug</div>
              <div className="space-y-2">
                {['npm run dev', 'npm run build', 'npm run test', 'npm run lint'].map(cmd => (
                  <button
                    key={cmd}
                    className="w-full text-left py-1.5 px-2 bg-[hsl(220_13%_14%)] hover:bg-[hsl(220_13%_18%)] rounded text-xs text-foreground flex items-center gap-2 transition-colors"
                    onClick={() => { terminal.injectCommand(cmd); setShowTerminal(true); }}
                  >
                    <span className="text-green-400">▶</span>
                    <span className="font-mono">{cmd}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar resizer */}
        <div
          className="w-1 bg-[hsl(var(--ide-panel-border))] hover:bg-primary cursor-col-resize transition-colors shrink-0"
          onMouseDown={handleSidebarMouseDown}
        />

        {/* Editor + Terminal column */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Tab bar */}
          <TabBar
            tabs={fs.tabs}
            activeTabId={fs.activeTabId}
            onTabClick={(id) => {
              const tab = fs.tabs.find(t => t.id === id);
              if (tab) { fs.setActiveTabId(id); fs.setSelectedFileId(tab.fileId); }
            }}
            onTabClose={fs.closeTab}
          />

          {/* Editor */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <CodeEditor
              activeTab={fs.activeTab}
              onContentChange={fs.updateTabContent}
              onSave={fs.saveTab}
            />
          </div>

          {/* Terminal resizer */}
          {showTerminal && (
            <div
              className="h-1 bg-[hsl(var(--ide-panel-border))] hover:bg-primary cursor-row-resize transition-colors shrink-0"
              onMouseDown={handleTerminalMouseDown}
            />
          )}

          {/* Terminal */}
          {showTerminal && (
            <div
              className="shrink-0 border-t border-[hsl(var(--ide-panel-border))]"
              style={{ height: terminalHeight }}
            >
              <Terminal
                lines={terminal.lines}
                input={terminal.input}
                onInputChange={terminal.setInput}
                onKeyDown={terminal.handleKeyDown}
                onClear={() => { /* handled internally */ }}
              />
            </div>
          )}
        </div>

        {/* AI Panel resizer */}
        {showAI && (
          <div
            className="w-1 bg-[hsl(var(--ide-panel-border))] hover:bg-[hsl(263_70%_60%)] cursor-col-resize transition-colors shrink-0"
            onMouseDown={handleAIMouseDown}
          />
        )}

        {/* AI Panel */}
        {showAI && (
          <div
            className="flex flex-col border-l border-[hsl(var(--ide-panel-border))] shrink-0 overflow-hidden"
            style={{ width: aiPanelWidth }}
          >
            <AIAgent
              messages={agent.messages}
              isThinking={agent.isThinking}
              onSend={agent.sendMessage}
              onStop={agent.stopGeneration}
            />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <StatusBar activeTab={fs.activeTab} fileCount={fileCount} />
    </div>
  );
};
