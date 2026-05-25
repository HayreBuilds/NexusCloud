import { useState, useCallback, useRef } from 'react';
import { AgentMessage, AgentToolCall } from '@/types/ide';

interface AIContext {
  activeFile?: string;
  activeContent?: string;
  terminalInject?: (cmd: string) => void;
  onCodeUpdate?: (content: string) => void;
}

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

const AGENT_RESPONSES = [
  {
    keywords: ['hello', 'hi', 'hey', 'greetings'],
    response: `Hello! I'm **Nexus**, your AI coding agent. I can help you:

- 📝 **Write & refactor code** in any language
- 🔧 **Debug issues** and explain errors  
- 🚀 **Run commands** in the terminal
- 📄 **Generate files** — components, tests, configs
- 🎨 **Create assets** — images, documents, presentations
- 🧠 **Explain concepts** with examples

What would you like to build today?`,
    tools: [],
  },
  {
    keywords: ['create', 'generate', 'write', 'component', 'react'],
    response: `I'll create a React component for you. Let me analyze your workspace and generate the code.`,
    tools: [
      { tool: 'read_workspace', input: '/src/**/*.tsx', output: 'Analyzed 3 files' },
      { tool: 'write_file', input: '/src/components/Button.tsx', output: 'File created successfully' },
    ],
    code: `Here's a reusable **Button** component:

\`\`\`tsx
import React from 'react';

interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
}) => {
  const base = 'rounded-lg font-semibold transition-all focus:outline-none';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={\`\${base} \${variants[variant]} \${sizes[size]}\`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};
\`\`\`

The component supports 3 variants, 3 sizes, and is fully typed with TypeScript. Would you like me to add it to your workspace?`,
  },
  {
    keywords: ['install', 'npm', 'package', 'dependency'],
    response: `I'll install the dependencies for you via the terminal.`,
    tools: [
      { tool: 'run_terminal', input: 'npm install', output: 'Packages installed successfully' },
    ],
    terminalCmd: 'npm install',
    code: `Dependencies installed! I ran:

\`\`\`bash
npm install
\`\`\`

Your packages are now available. Would you like me to import anything specific?`,
  },
  {
    keywords: ['build', 'compile', 'production'],
    response: `Running the production build for you.`,
    tools: [
      { tool: 'run_terminal', input: 'npm run build', output: 'Build completed in 1.12s' },
    ],
    terminalCmd: 'npm run build',
    code: `Build completed successfully! ✓

Output files are in the \`dist/\` directory:
- \`dist/index.html\` — 0.46 kB
- \`dist/assets/index.css\` — 1.39 kB  
- \`dist/assets/index.js\` — 143.36 kB (46 kB gzipped)

Ready for deployment!`,
  },
  {
    keywords: ['debug', 'error', 'fix', 'bug', 'issue'],
    response: `Let me analyze the code for issues.`,
    tools: [
      { tool: 'read_file', input: 'active file', output: 'File read successfully' },
      { tool: 'analyze_code', input: 'static analysis', output: 'Found 2 potential issues' },
    ],
    code: `I found **2 potential issues** in your code:

**Issue 1** — Missing dependency in useEffect:
\`\`\`tsx
// ❌ Before
useEffect(() => {
  fetchData(userId);
}, []); // userId missing from deps

// ✅ After  
useEffect(() => {
  fetchData(userId);
}, [userId]);
\`\`\`

**Issue 2** — Unhandled promise rejection:
\`\`\`tsx
// ❌ Before
async function fetchData() {
  const res = await fetch('/api/data');
  return res.json();
}

// ✅ After
async function fetchData() {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    return res.json();
  } catch (err) {
    console.error('Fetch failed:', err);
    throw err;
  }
}
\`\`\`

Want me to apply these fixes automatically?`,
  },
  {
    keywords: ['test', 'testing', 'unit test', 'jest'],
    response: `I'll generate unit tests for your code.`,
    tools: [
      { tool: 'read_file', input: 'src/utils.ts', output: 'Read 4 functions' },
      { tool: 'write_file', input: 'src/utils.test.ts', output: 'Tests written' },
      { tool: 'run_terminal', input: 'npm run test', output: '8 tests passed' },
    ],
    terminalCmd: 'npm run test',
    code: `Generated tests for your utility functions:

\`\`\`typescript
import { formatDate, debounce, generateId, clsx } from './utils';

describe('formatDate', () => {
  it('formats a date correctly', () => {
    const date = new Date('2025-05-06');
    expect(formatDate(date)).toBe('May 6, 2025');
  });
});

describe('debounce', () => {
  jest.useFakeTimers();
  
  it('delays function execution', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 300);
    debounced();
    debounced();
    expect(fn).not.toBeCalled();
    jest.runAllTimers();
    expect(fn).toBeCalledTimes(1);
  });
});

describe('generateId', () => {
  it('generates unique IDs', () => {
    const ids = new Set([generateId(), generateId(), generateId()]);
    expect(ids.size).toBe(3);
  });
});
\`\`\`

All 8 tests pass! ✓`,
  },
  {
    keywords: ['document', 'pdf', 'report'],
    response: `I'll generate a PDF report for your project.`,
    tools: [
      { tool: 'analyze_workspace', input: '/workspace', output: 'Project analyzed' },
      { tool: 'generate_pdf', input: 'project-report.pdf', output: 'PDF generated at /dist/project-report.pdf' },
    ],
    code: `Generated **project-report.pdf** with:

📄 **Contents:**
- Executive Summary
- Architecture Overview  
- File Structure (12 files)
- Code Quality Metrics
- Dependencies List
- API Documentation

The PDF is saved to \`/dist/project-report.pdf\` (24 KB). 

Want me to customize the report template or add more sections?`,
  },
  {
    keywords: ['image', 'generate image', 'create image'],
    response: `I'll generate an image for your project.`,
    tools: [
      { tool: 'generate_image', input: 'hero-banner.png', output: 'Image generated: 1200x630px' },
    ],
    code: `Generated **hero-banner.png** (1200×630px):

🖼️ A professional hero banner with:
- Gradient background (blue → violet)
- App name typography
- Feature highlights
- CTA button mockup

Saved to \`/public/hero-banner.png\`. 

Want different dimensions, style, or content? I can also generate:
- Icons and logos
- Social media assets (OG images, Twitter cards)
- UI mockups and wireframes
- Product screenshots`,
  },
];

const DEFAULT_RESPONSE = `I understand your request. Let me help you with that.

Based on your workspace context, here's my recommendation:

1. **Analyze** the current codebase structure
2. **Plan** the implementation approach  
3. **Execute** the changes with best practices

Could you provide more details about what you're trying to accomplish? I can then give you a more specific and actionable response.

You can ask me to:
- Write or refactor code
- Run terminal commands
- Generate documentation
- Debug issues
- Create new files or components`;

function findResponse(input: string) {
  const lower = input.toLowerCase();
  return AGENT_RESPONSES.find(r => r.keywords.some(k => lower.includes(k)));
}

export function useAIAgent(context: AIContext) {
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm **Nexus**, your AI coding agent embedded in NexusIDE.

I have full access to your workspace and can autonomously:
- 📝 Read, write, and refactor code
- 🖥️ Execute terminal commands  
- 🔍 Debug and analyze issues
- 📄 Generate documents and assets
- 🎨 Create images and media

**Getting started:** Open a file and ask me anything about it, or describe what you'd like to build!`,
      timestamp: new Date(),
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const abortRef = useRef(false);

  const sendMessage = useCallback(async (userInput: string) => {
    if (!userInput.trim() || isThinking) return;

    const userMsg: AgentMessage = {
      id: generateId(),
      role: 'user',
      content: userInput,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);
    abortRef.current = false;

    const matched = findResponse(userInput);

    // Simulate thinking delay
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
    if (abortRef.current) return;

    const toolCalls: AgentToolCall[] = (matched?.tools ?? []).map(t => ({
      id: generateId(),
      tool: t.tool,
      status: 'running' as const,
      input: t.input,
      output: t.output,
    }));

    const assistantId = generateId();
    const assistantMsg: AgentMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      isStreaming: true,
    };

    setMessages(prev => [...prev, assistantMsg]);
    setIsThinking(false);

    // Simulate tool execution
    if (toolCalls.length > 0) {
      for (let i = 0; i < toolCalls.length; i++) {
        await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
        if (abortRef.current) return;

        // Inject terminal command if applicable
        if (toolCalls[i].tool === 'run_terminal' && matched?.terminalCmd && context.terminalInject) {
          context.terminalInject(matched.terminalCmd);
        }

        setMessages(prev => prev.map(m => {
          if (m.id !== assistantId) return m;
          return {
            ...m,
            toolCalls: m.toolCalls?.map((tc, idx) =>
              idx === i ? { ...tc, status: 'success' as const } : tc
            ),
          };
        }));
      }
      await new Promise(r => setTimeout(r, 300));
    }

    // Stream the response text
    const fullText = matched
      ? `${matched.response}\n\n${matched.code ?? ''}`
      : DEFAULT_RESPONSE;

    const words = fullText.split(' ');
    let accumulated = '';

    for (let i = 0; i < words.length; i++) {
      if (abortRef.current) return;
      accumulated += (i === 0 ? '' : ' ') + words[i];
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, content: accumulated } : m
      ));
      await new Promise(r => setTimeout(r, 15 + Math.random() * 10));
    }

    setMessages(prev => prev.map(m =>
      m.id === assistantId ? { ...m, isStreaming: false } : m
    ));
  }, [isThinking, context]);

  const stopGeneration = useCallback(() => {
    abortRef.current = true;
    setIsThinking(false);
    setMessages(prev => prev.map(m =>
      m.isStreaming ? { ...m, isStreaming: false } : m
    ));
  }, []);

  return { messages, isThinking, sendMessage, stopGeneration };
}
