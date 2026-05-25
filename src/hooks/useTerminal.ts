import { useState, useCallback, useRef } from 'react';
import { TerminalLine } from '@/types/ide';

const COMMANDS: Record<string, (args: string[]) => string[]> = {
  help: () => [
    'Available commands:',
    '  ls, dir         List files',
    '  cat <file>      Print file contents',
    '  echo <text>     Print text',
    '  clear           Clear terminal',
    '  pwd             Print working directory',
    '  node <file>     Run a JavaScript file',
    '  python <file>   Run a Python file',
    '  npm <cmd>       Run npm commands',
    '  git <cmd>       Git commands',
    '  whoami          Current user',
    '  date            Current date/time',
    '  env             Environment variables',
    '  history         Command history',
  ],
  pwd: () => ['/workspace/my-app'],
  whoami: () => ['developer'],
  date: () => [new Date().toString()],
  ls: (args) => {
    if (args.includes('-la') || args.includes('-l')) {
      return [
        'total 48',
        'drwxr-xr-x  5 dev dev 4096 May  6 10:00 .',
        'drwxr-xr-x 12 dev dev 4096 May  6 09:55 ..',
        'drwxr-xr-x  2 dev dev 4096 May  6 09:58 public',
        'drwxr-xr-x  3 dev dev 4096 May  6 10:00 src',
        '-rw-r--r--  1 dev dev  842 May  6 10:00 package.json',
        '-rw-r--r--  1 dev dev  641 May  6 10:00 README.md',
        '-rw-r--r--  1 dev dev  512 May  6 10:00 tsconfig.json',
      ];
    }
    return ['public/  src/  package.json  README.md  tsconfig.json'];
  },
  dir: () => ['public/  src/  package.json  README.md  tsconfig.json'],
  echo: (args) => [args.join(' ')],
  env: () => [
    'NODE_ENV=development',
    'PORT=3000',
    'REACT_APP_VERSION=1.0.0',
    'PATH=/usr/local/bin:/usr/bin:/bin',
  ],
  history: () => ['(Command history is session-based)'],
  node: (args) => {
    if (!args[0]) return ['Usage: node <file.js>'];
    return [`\x1b[32mRunning ${args[0]}...\x1b[0m`, 'Hello, World!', `Process exited with code 0`];
  },
  python: (args) => {
    if (!args[0]) return ['Usage: python <file.py>'];
    return [`\x1b[32mRunning ${args[0]}...\x1b[0m`, 'Python 3.11.4', 'Hello, World!', `Process exited with code 0`];
  },
  npm: (args) => {
    const sub = args[0];
    if (sub === 'install' || sub === 'i') {
      return [
        '\x1b[32m⠙ Installing packages...\x1b[0m',
        'added 847 packages, and audited 848 packages in 12s',
        '',
        '127 packages are looking for funding',
        '  run `npm fund` for details',
        '',
        '\x1b[32mfound 0 vulnerabilities\x1b[0m',
      ];
    }
    if (sub === 'run') {
      const script = args[1];
      if (script === 'dev' || script === 'start') {
        return [
          '',
          '  \x1b[36mVITE\x1b[0m v5.0.0  ready in 342 ms',
          '',
          '  ➜  Local:   \x1b[36mhttp://localhost:5173/\x1b[0m',
          '  ➜  Network: use --host to expose',
          '  ➜  press h + enter to show help',
        ];
      }
      if (script === 'build') {
        return [
          '\x1b[36mvite v5.0.0 building for production...\x1b[0m',
          '✓ 34 modules transformed.',
          'dist/index.html                  0.46 kB │ gzip:  0.30 kB',
          'dist/assets/index-DiwrgTda.css   1.39 kB │ gzip:  0.72 kB',
          'dist/assets/index-DVoHNO1Y.js  143.36 kB │ gzip: 46.09 kB',
          '\x1b[32m✓ built in 1.12s\x1b[0m',
        ];
      }
      if (script === 'test') {
        return [
          ' PASS  src/App.test.tsx',
          ' PASS  src/utils.test.ts',
          '',
          'Test Suites: 2 passed, 2 total',
          'Tests:       8 passed, 8 total',
          'Snapshots:   0 total',
          'Time:        1.234s',
          '\x1b[32mAll tests passed.\x1b[0m',
        ];
      }
      return [`Unknown script: ${script}. Available: dev, build, test`];
    }
    if (sub === 'list' || sub === 'ls') {
      return [
        'my-app@1.0.0',
        '├── react@18.2.0',
        '├── react-dom@18.2.0',
        '└── typescript@5.0.0',
      ];
    }
    return [`npm ${args.join(' ')}: command executed`];
  },
  git: (args) => {
    const sub = args[0];
    if (sub === 'status') {
      return [
        'On branch main',
        "Your branch is up to date with 'origin/main'.",
        '',
        'Changes not staged for commit:',
        '  (use "git add <file>..." to update what will be committed)',
        '',
        '\t\x1b[31mmodified:   src/App.tsx\x1b[0m',
        '\t\x1b[31mmodified:   src/App.css\x1b[0m',
        '',
        'no changes added to commit',
      ];
    }
    if (sub === 'log') {
      return [
        '\x1b[33mcommit a1b2c3d\x1b[0m (HEAD -> main)',
        'Author: Developer <dev@example.com>',
        'Date:   Tue May 6 09:55:00 2025',
        '',
        '    Initial commit',
      ];
    }
    if (sub === 'init') return ['Initialized empty Git repository in /workspace/my-app/.git/'];
    if (sub === 'add') return [`git: added ${args.slice(1).join(' ')}`];
    if (sub === 'commit') return ['[main a1b2c3d] ' + args.slice(2).join(' ')];
    if (sub === 'push') return ['Everything up-to-date'];
    if (sub === 'pull') return ['Already up to date.'];
    if (sub === 'branch') return ['* main', '  develop', '  feature/new-ui'];
    return [`git: ${args.join(' ')}: executed`];
  },
  cat: (args) => {
    if (!args[0]) return ['Usage: cat <filename>'];
    return [`(Contents of ${args[0]} would appear here)`];
  },
};

export function useTerminal() {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: '0',
      type: 'info',
      content: 'NexusIDE Terminal v1.0.0 — Type "help" for available commands.',
      timestamp: new Date(),
    },
    {
      id: '1',
      type: 'info',
      content: 'Working directory: /workspace/my-app',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const nextId = useRef(2);

  const addLine = useCallback((type: TerminalLine['type'], content: string) => {
    setLines(prev => [...prev, {
      id: String(nextId.current++),
      type,
      content,
      timestamp: new Date(),
    }]);
  }, []);

  const executeCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    addLine('input', `$ ${trimmed}`);
    setHistory(prev => [trimmed, ...prev.slice(0, 49)]);
    setHistoryIndex(-1);

    const parts = trimmed.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (command === 'clear') {
      setLines([]);
      return;
    }

    const handler = COMMANDS[command];
    if (handler) {
      const outputs = handler(args);
      outputs.forEach(out => {
        if (out.includes('error') || out.includes('Error')) {
          addLine('error', out);
        } else if (out.startsWith('✓') || out.includes('passed') || out.includes('success')) {
          addLine('success', out);
        } else {
          addLine('output', out);
        }
      });
    } else {
      addLine('error', `bash: ${command}: command not found`);
      addLine('info', 'Type "help" to see available commands.');
    }
  }, [addLine]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIndex = Math.min(historyIndex + 1, history.length - 1);
      setHistoryIndex(newIndex);
      setInput(history[newIndex] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = Math.max(historyIndex - 1, -1);
      setHistoryIndex(newIndex);
      setInput(newIndex === -1 ? '' : history[newIndex] ?? '');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const commands = Object.keys(COMMANDS);
      const match = commands.find(c => c.startsWith(input));
      if (match) setInput(match);
    }
  }, [input, history, historyIndex, executeCommand]);

  const injectCommand = useCallback((cmd: string) => {
    executeCommand(cmd);
  }, [executeCommand]);

  return {
    lines,
    input,
    setInput,
    handleKeyDown,
    executeCommand,
    injectCommand,
  };
}
