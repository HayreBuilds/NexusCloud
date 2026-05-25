import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Square,
  CheckCircle,
  Loader2,
  AlertCircle,
  ChevronDown,
  Sparkles,
  Code,
  Terminal,
  FileText,
  Image,
} from 'lucide-react';
import { AgentMessage, AgentToolCall } from '@/types/ide';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface AIAgentProps {
  messages: AgentMessage[];
  isThinking: boolean;
  onSend: (message: string) => void;
  onStop: () => void;
}

const TOOL_ICONS: Record<string, React.FC<{ size: number; className?: string }>> = {
  read_file: FileText,
  write_file: FileText,
  read_workspace: FileText,
  analyze_workspace: FileText,
  analyze_code: Code,
  run_terminal: Terminal,
  generate_image: Image,
  generate_pdf: FileText,
};

const QUICK_PROMPTS = [
  { label: 'Fix bugs', prompt: 'Debug and fix any issues in the current file', icon: AlertCircle },
  { label: 'Write tests', prompt: 'Generate unit tests for the current file', icon: CheckCircle },
  { label: 'New component', prompt: 'Create a reusable React component with TypeScript', icon: Code },
  { label: 'Run dev server', prompt: 'Install dependencies and run the development server', icon: Terminal },
];

const ToolCallCard: React.FC<{ toolCall: AgentToolCall }> = ({ toolCall }) => {
  const IconComp = TOOL_ICONS[toolCall.tool] ?? Code;
  return (
    <div className="agent-tool-card">
      <div className="flex items-center gap-2 mb-1">
        {toolCall.status === 'running' ? (
          <Loader2 size={12} className="text-violet-400 animate-spin" />
        ) : toolCall.status === 'success' ? (
          <CheckCircle size={12} className="text-green-400" />
        ) : (
          <AlertCircle size={12} className="text-red-400" />
        )}
        <IconComp size={12} className="text-violet-400" />
        <span className="text-violet-300 font-semibold">{toolCall.tool}</span>
        {toolCall.status === 'running' && (
          <span className="text-muted-foreground ml-auto text-[10px]">running...</span>
        )}
      </div>
      {toolCall.input && (
        <div className="text-muted-foreground pl-5 text-[10px]">
          <span className="text-blue-400">→</span> {toolCall.input}
        </div>
      )}
      {toolCall.output && toolCall.status === 'success' && (
        <div className="text-green-400 pl-5 text-[10px]">
          <span>✓</span> {toolCall.output}
        </div>
      )}
    </div>
  );
};

const MessageBubble: React.FC<{ message: AgentMessage }> = ({ message }) => {
  if (message.role === 'user') {
    return (
      <div className="agent-message-user">
        <p className="text-sm text-foreground whitespace-pre-wrap">{message.content}</p>
      </div>
    );
  }

  return (
    <div className="agent-message-ai">
      <div className="flex items-start gap-2 mb-2">
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shrink-0 mt-0.5">
          <Bot size={12} className="text-white" />
        </div>
        <span className="text-xs font-semibold text-violet-300">Nexus AI</span>
        {message.isStreaming && (
          <div className="flex items-center gap-1 ml-auto">
            <div className="w-1 h-1 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-1 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1 h-1 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      {/* Tool calls */}
      {message.toolCalls && message.toolCalls.length > 0 && (
        <div className="mb-2 pl-7">
          {message.toolCalls.map(tc => (
            <ToolCallCard key={tc.id} toolCall={tc} />
          ))}
        </div>
      )}

      {/* Content */}
      {message.content && (
        <div className="pl-7">
          <div className="text-sm text-foreground leading-relaxed prose prose-invert prose-sm max-w-none">
            <MessageContent content={message.content} isStreaming={message.isStreaming} />
          </div>
        </div>
      )}
    </div>
  );
};

const MessageContent: React.FC<{ content: string; isStreaming?: boolean }> = ({ content, isStreaming }) => {
  // Simple markdown-like rendering
  const parts = content.split(/(```[\s\S]*?```|`[^`]+`|\*\*[^*]+\*\*)/g);

  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).split('\n');
          const lang = lines[0].trim();
          const code = lines.slice(1).join('\n');
          return (
            <pre key={i} className="my-2 p-3 bg-[hsl(220_13%_10%)] rounded-md border border-[hsl(220_13%_18%)] overflow-x-auto text-xs font-mono text-[#abb2bf]">
              {lang && <div className="text-[10px] text-muted-foreground mb-1 font-sans">{lang}</div>}
              <code>{code}</code>
            </pre>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i} className="px-1 py-0.5 bg-[hsl(220_13%_15%)] rounded text-blue-300 text-xs font-mono">{part.slice(1, -1)}</code>;
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>;
        }
        // Handle line breaks and bullet points
        return (
          <span key={i}>
            {part.split('\n').map((line, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {line.startsWith('- ') || line.startsWith('• ') ? (
                  <span className="flex items-start gap-1.5 my-0.5">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{line.slice(2)}</span>
                  </span>
                ) : line.match(/^\d+\.\s/) ? (
                  <span className="flex items-start gap-1.5 my-0.5">
                    <span className="text-primary shrink-0">{line.match(/^\d+/)![0]}.</span>
                    <span>{line.replace(/^\d+\.\s/, '')}</span>
                  </span>
                ) : (
                  line
                )}
              </span>
            ))}
          </span>
        );
      })}
      {isStreaming && <span className="typing-cursor" />}
    </span>
  );
};

export const AIAgent: React.FC<AIAgentProps> = ({
  messages,
  isThinking,
  onSend,
  onStop,
}) => {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;
    onSend(trimmed);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <div className="flex flex-col h-full bg-[hsl(220_13%_10%)]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[hsl(var(--ide-panel-border))] shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
          <Sparkles size={14} className="text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">Nexus AI Agent</div>
          <div className="text-[10px] text-muted-foreground">Multi-modal · Workspace-aware</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] text-green-400">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isThinking && (
          <div className="flex items-center gap-2 px-3">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
              <Bot size={12} className="text-white" />
            </div>
            <div className="flex items-center gap-1">
              <Loader2 size={12} className="text-violet-400 animate-spin" />
              <span className="text-xs text-muted-foreground">Nexus is thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="px-3 pb-2 grid grid-cols-2 gap-1.5">
          {QUICK_PROMPTS.map(({ label, prompt, icon: Icon }) => (
            <button
              key={label}
              onClick={() => onSend(prompt)}
              className="flex items-center gap-1.5 px-2 py-1.5 bg-[hsl(220_13%_14%)] border border-[hsl(220_13%_20%)] rounded-lg text-xs text-muted-foreground hover:text-foreground hover:border-[hsl(var(--primary))] transition-colors text-left"
            >
              <Icon size={12} className="shrink-0 text-violet-400" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-3 pb-3 shrink-0">
        <div className="flex items-end gap-2 bg-[hsl(220_13%_13%)] border border-[hsl(220_13%_20%)] rounded-xl p-2 focus-within:border-[hsl(var(--primary))] transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask Nexus anything... (Enter to send, Shift+Enter for new line)"
            className="flex-1 bg-transparent text-sm text-foreground resize-none outline-none placeholder:text-muted-foreground leading-relaxed min-h-[20px] max-h-[120px]"
            rows={1}
          />
          {isThinking ? (
            <button
              onClick={onStop}
              className="shrink-0 w-8 h-8 flex items-center justify-center bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              title="Stop generation"
            >
              <Square size={14} className="text-white" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="shrink-0 w-8 h-8 flex items-center justify-center bg-primary hover:bg-[hsl(217_91%_55%)] disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
              title="Send (Enter)"
            >
              <Send size={14} className="text-primary-foreground" />
            </button>
          )}
        </div>
        <div className="text-[10px] text-muted-foreground text-center mt-1.5">
          Nexus can read/write workspace files and execute terminal commands
        </div>
      </div>
    </div>
  );
};
