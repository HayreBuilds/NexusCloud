import { FileNode } from '@/types/ide';

export const DEFAULT_WORKSPACE: FileNode[] = [
  {
    id: 'src',
    name: 'src',
    type: 'folder',
    path: '/src',
    isOpen: true,
    children: [
      {
        id: 'app-tsx',
        name: 'App.tsx',
        type: 'file',
        path: '/src/App.tsx',
        language: 'typescript',
        content: `import React, { useState } from 'react';
import './App.css';

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: 'Build something amazing', done: false },
    { id: 2, text: 'Ship to production', done: false },
  ]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now(), text: input, done: false }]);
    setInput('');
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <div className="app">
      <h1>My Todo App</h1>
      <div className="input-row">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTodo()}
          placeholder="Add a task..."
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul>
        {todos.map(todo => (
          <li
            key={todo.id}
            onClick={() => toggleTodo(todo.id)}
            style={{ textDecoration: todo.done ? 'line-through' : 'none' }}
          >
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;`,
      },
      {
        id: 'app-css',
        name: 'App.css',
        type: 'file',
        path: '/src/App.css',
        language: 'css',
        content: `.app {
  max-width: 600px;
  margin: 40px auto;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 24px;
  color: #1a1a2e;
}

.input-row {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

input {
  flex: 1;
  padding: 10px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

input:focus {
  border-color: #3b82f6;
}

button {
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 12px 16px;
  margin-bottom: 8px;
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

li:hover {
  background: #e2e8f0;
}`,
      },
      {
        id: 'index-tsx',
        name: 'index.tsx',
        type: 'file',
        path: '/src/index.tsx',
        language: 'typescript',
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
      },
      {
        id: 'utils-ts',
        name: 'utils.ts',
        type: 'file',
        path: '/src/utils.ts',
        language: 'typescript',
        content: `/**
 * Utility functions for the application
 */

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

export function clsx(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}`,
      },
    ],
  },
  {
    id: 'public',
    name: 'public',
    type: 'folder',
    path: '/public',
    isOpen: false,
    children: [
      {
        id: 'index-html',
        name: 'index.html',
        type: 'file',
        path: '/public/index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My App</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
      },
    ],
  },
  {
    id: 'package-json',
    name: 'package.json',
    type: 'file',
    path: '/package.json',
    language: 'json',
    content: `{
  "name": "my-app",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}`,
  },
  {
    id: 'readme-md',
    name: 'README.md',
    type: 'file',
    path: '/README.md',
    language: 'markdown',
    content: `# My App

A React + TypeScript application.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Features

- ⚡ Vite for fast development
- ⚛️ React 18 with hooks
- 🔷 TypeScript for type safety
- 🎨 Modern CSS

## Structure

\`\`\`
src/
├── App.tsx       # Main component
├── App.css       # Styles
├── index.tsx     # Entry point
└── utils.ts      # Utilities
\`\`\`

## License

MIT`,
  },
  {
    id: 'tsconfig-json',
    name: 'tsconfig.json',
    type: 'file',
    path: '/tsconfig.json',
    language: 'json',
    content: `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`,
  },
];

export const LANGUAGE_MAP: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  py: 'python',
  html: 'html',
  css: 'css',
  scss: 'css',
  json: 'json',
  md: 'markdown',
  rs: 'rust',
  go: 'go',
  java: 'java',
  cpp: 'cpp',
  c: 'cpp',
  sh: 'bash',
  bash: 'bash',
  txt: 'plaintext',
};

export const FILE_ICONS: Record<string, string> = {
  typescript: '🔷',
  javascript: '🟨',
  python: '🐍',
  html: '🌐',
  css: '🎨',
  json: '{}',
  markdown: '📝',
  rust: '🦀',
  go: '🔵',
  java: '☕',
  cpp: '⚙️',
  bash: '💻',
  plaintext: '📄',
};
