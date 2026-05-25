export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string;
  children?: FileNode[];
  isOpen?: boolean;
  language?: string;
}

export interface Tab {
  id: string;
  fileId: string;
  fileName: string;
  filePath: string;
  content: string;
  isDirty: boolean;
  language: string;
}

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'info';
  content: string;
  timestamp: Date;
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  toolCalls?: AgentToolCall[];
  isStreaming?: boolean;
}

export interface AgentToolCall {
  id: string;
  tool: string;
  status: 'running' | 'success' | 'error';
  input?: string;
  output?: string;
}

export type PanelLayout = {
  sidebarWidth: number;
  aiPanelWidth: number;
  terminalHeight: number;
  showSidebar: boolean;
  showAIPanel: boolean;
  showTerminal: boolean;
};

export type FileLanguage =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'html'
  | 'css'
  | 'json'
  | 'markdown'
  | 'plaintext'
  | 'rust'
  | 'go'
  | 'java'
  | 'cpp'
  | 'bash';

export interface WorkspaceStats {
  totalFiles: number;
  totalLines: number;
  language: string;
}
