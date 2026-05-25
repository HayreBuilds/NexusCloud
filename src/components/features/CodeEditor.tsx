import React, { useEffect, useRef } from 'react';
import { Tab } from '@/types/ide';
import { FileText } from 'lucide-react';

interface CodeEditorProps {
  activeTab: Tab | null;
  onContentChange: (tabId: string, content: string) => void;
  onSave: (tabId: string) => void;
}

// Inline syntax highlighter for display
function highlightCode(code: string, language: string): string {
  let escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  if (language === 'json') {
    return escaped
      .replace(/("(?:[^"\\]|\\.)*")\s*:/g, '<span class="syntax-keyword">$1</span>:')
      .replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span class="syntax-string">$1</span>')
      .replace(/:\s*(\d+\.?\d*)/g, ': <span class="syntax-number">$1</span>')
      .replace(/:\s*(true|false|null)/g, ': <span class="syntax-keyword">$1</span>');
  }

  if (language === 'markdown') {
    return escaped
      .replace(/^(#{1,6})\s(.+)$/gm, '<span class="syntax-keyword">$1 $2</span>')
      .replace(/`([^`]+)`/g, '<span class="syntax-string">`$1`</span>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  }

  // TypeScript/JavaScript/general
  return escaped
    .replace(/(\/\/[^\n]*)/g, '<span class="syntax-comment">$1</span>')
    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="syntax-comment">$1</span>')
    .replace(/\b(import|export|from|const|let|var|function|class|interface|type|return|if|else|for|while|do|switch|case|break|continue|new|this|typeof|instanceof|async|await|extends|implements|default|null|undefined|true|false|void|in|of)\b/g, '<span class="syntax-keyword">$1</span>')
    .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, '<span class="syntax-string">$1</span>')
    .replace(/\b([A-Z][a-zA-Z0-9]*)\b(?!\s*:)/g, '<span style="color:#e5c07b">$1</span>')
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="syntax-number">$1</span>');
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  activeTab,
  onContentChange,
  onSave,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (textareaRef.current && activeTab) {
      textareaRef.current.value = activeTab.content;
    }
  }, [activeTab?.id]);

  const syncScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!activeTab) return;
    onContentChange(activeTab.id, e.target.value);
    if (highlightRef.current) {
      highlightRef.current.innerHTML = highlightCode(e.target.value, activeTab.language) + '\n';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!activeTab) return;

    // Save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      onSave(activeTab.id);
      return;
    }

    // Tab key → insert spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = textarea.value.slice(0, start) + '  ' + textarea.value.slice(end);
      textarea.value = newValue;
      textarea.selectionStart = textarea.selectionEnd = start + 2;
      onContentChange(activeTab.id, newValue);
      if (highlightRef.current) {
        highlightRef.current.innerHTML = highlightCode(newValue, activeTab.language) + '\n';
      }
    }

    // Auto-close brackets
    const pairs: Record<string, string> = { '{': '}', '[': ']', '(': ')', '"': '"', "'": "'", '`': '`' };
    if (pairs[e.key] && !e.ctrlKey && !e.metaKey) {
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      if (start === end) {
        e.preventDefault();
        const closing = pairs[e.key];
        const newValue = textarea.value.slice(0, start) + e.key + closing + textarea.value.slice(end);
        textarea.value = newValue;
        textarea.selectionStart = textarea.selectionEnd = start + 1;
        onContentChange(activeTab.id, newValue);
        if (highlightRef.current) {
          highlightRef.current.innerHTML = highlightCode(newValue, activeTab.language) + '\n';
        }
      }
    }
  };

  if (!activeTab) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[hsl(var(--ide-bg))] text-muted-foreground select-none">
        <div className="flex flex-col items-center gap-6 max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(220_13%_13%)] flex items-center justify-center border border-[hsl(var(--ide-panel-border))]">
            <FileText size={28} className="text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No file open</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Open a file from the explorer or ask the AI agent to create one for you.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full">
            {[
              { key: 'Ctrl+N', desc: 'New File' },
              { key: 'Ctrl+P', desc: 'Quick Open' },
              { key: 'Ctrl+`', desc: 'Terminal' },
              { key: 'Ctrl+J', desc: 'AI Agent' },
            ].map(({ key, desc }) => (
              <div key={key} className="flex items-center gap-2 px-3 py-2 bg-[hsl(220_13%_12%)] rounded-lg border border-[hsl(var(--ide-panel-border))]">
                <kbd className="text-xs font-mono bg-[hsl(220_13%_18%)] px-1.5 py-0.5 rounded text-primary border border-[hsl(220_13%_25%)]">{key}</kbd>
                <span className="text-xs text-muted-foreground">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const highlighted = highlightCode(activeTab.content, activeTab.language) + '\n';
  const lines = activeTab.content.split('\n');

  return (
    <div className="flex-1 flex overflow-hidden bg-[hsl(var(--ide-bg))]">
      {/* Line numbers */}
      <div className="flex flex-col items-end px-3 py-4 bg-[hsl(var(--ide-bg))] text-muted-foreground font-mono text-xs leading-6 select-none shrink-0 border-r border-[hsl(var(--ide-panel-border))] overflow-hidden"
        style={{ minWidth: '48px' }}
      >
        {lines.map((_, i) => (
          <div key={i} className="leading-6 opacity-40">{i + 1}</div>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1 relative overflow-hidden">
        <pre
          ref={highlightRef}
          aria-hidden="true"
          className="absolute inset-0 p-4 font-mono text-sm leading-6 overflow-auto pointer-events-none whitespace-pre"
          dangerouslySetInnerHTML={{ __html: highlighted }}
          style={{ color: '#abb2bf', fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace" }}
        />
        <textarea
          ref={textareaRef}
          defaultValue={activeTab.content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onScroll={syncScroll}
          className="absolute inset-0 p-4 font-mono text-sm leading-6 bg-transparent text-transparent caret-white resize-none outline-none overflow-auto whitespace-pre spellcheck-false"
          style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            caretColor: 'hsl(217 91% 60%)',
          }}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
    </div>
  );
};
