import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, X } from 'lucide-react';

const SystemTerminal = () => {
    const [history, setHistory] = useState([
        { type: 'system', text: 'Super Admin Terminal v1.0.0' },
        { type: 'system', text: 'Type "help" for available commands' },
    ]);
    const [input, setInput] = useState('');
    const [commandHistory, setCommandHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const inputRef = useRef(null);
    const bottomRef = useRef(null);

    const commands = {
        help: () => `Available commands:
  help              - Show this help
  clear             - Clear terminal
  ls                - List files
  ps                - List processes
  top               - System resources
  docker ps         - List containers
  npm list          - List packages
  git status        - Git status
  cat <file>        - View file
  tail -f logs      - Follow logs
  curl <url>        - HTTP request
  mongo             - MongoDB shell
  redis-cli         - Redis CLI
  node -e <code>    - Execute JavaScript
  
System commands:
  restart <service> - Restart service
  backup            - Create backup
  deploy            - Deploy changes
  rollback          - Rollback deployment`,

        clear: () => {
            setHistory([]);
            return null;
        },

        ls: () => `total 48
drwxr-xr-x  12 user  staff   384 Nov  4 05:00 .
drwxr-xr-x  25 user  staff   800 Nov  3 12:00 ..
-rw-r--r--   1 user  staff   2.1K Nov  4 04:30 package.json
drwxr-xr-x   8 user  staff   256 Nov  4 03:00 src
drwxr-xr-x   6 user  staff   192 Nov  4 02:00 dashboard
drwxr-xr-x   4 user  staff   128 Nov  3 18:00 tests
-rw-r--r--   1 user  staff   1.5K Nov  4 01:00 README.md
drwxr-xr-x  12 user  staff   384 Nov  4 05:00 node_modules`,

        ps: () => `  PID TTY           TIME CMD
 1234 ttys000    0:00.45 node server.js
 1235 ttys000    0:02.13 mongod
 1236 ttys000    0:00.12 redis-server
 1237 ttys000    0:01.23 nginx`,

        top: () => `Processes: 245 total, 2 running, 243 sleeping
Load Avg: 2.45, 2.12, 1.98
CPU usage: 45.2% user, 12.3% sys, 42.5% idle
Memory: 8.5GB used, 7.5GB free
Swap: 2.1GB used

PID    COMMAND      %CPU  %MEM
1234   node         45.2  12.3
1235   mongod       12.1   8.5
1236   redis         2.3   1.2`,

        'docker ps': () => `CONTAINER ID   IMAGE              STATUS         PORTS
abc123def456   cocolu-api:latest  Up 2 hours     0.0.0.0:3001->3001/tcp
def456ghi789   mongo:7.0          Up 2 hours     0.0.0.0:27017->27017/tcp
ghi789jkl012   redis:7-alpine     Up 2 hours     0.0.0.0:6379->6379/tcp`,

        'npm list': () => `cocolu-ventas@1.0.0
├── express@4.18.2
├── mongoose@8.0.0
├── react@18.2.0
├── reactflow@11.10.0
└── bcrypt@5.1.1`,

        'git status': () => `On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  modified:   src/core/rbac/SuperAdmin.js
  modified:   dashboard/src/components/superadmin/

Untracked files:
  src/api/superadmin.routes.js

no changes added to commit`,
    };

    const executeCommand = async (cmd) => {
        const trimmedCmd = cmd.trim();
        
        setHistory(prev => [...prev, { type: 'command', text: `$ ${trimmedCmd}` }]);
        setCommandHistory(prev => [trimmedCmd, ...prev]);
        setHistoryIndex(-1);

        if (!trimmedCmd) return;

        // Check if command exists
        if (commands[trimmedCmd]) {
            const output = commands[trimmedCmd]();
            if (output) {
                setHistory(prev => [...prev, { type: 'output', text: output }]);
            }
        } else if (trimmedCmd.startsWith('cat ')) {
            const file = trimmedCmd.substring(4);
            setHistory(prev => [...prev, { 
                type: 'output', 
                text: `// Content of ${file}\nconst example = 'file content here';` 
            }]);
        } else if (trimmedCmd.startsWith('node -e ')) {
            const code = trimmedCmd.substring(8);
            try {
                const result = eval(code);
                setHistory(prev => [...prev, { type: 'output', text: String(result) }]);
            } catch (err) {
                setHistory(prev => [...prev, { type: 'error', text: err.message }]);
            }
        } else {
            setHistory(prev => [...prev, { 
                type: 'error', 
                text: `Command not found: ${trimmedCmd}. Type 'help' for available commands.` 
            }]);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            executeCommand(input);
            setInput('');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setInput(commandHistory[newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInput(commandHistory[newIndex]);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInput('');
            }
        }
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    return (
        <div className="h-screen bg-black text-green-400 font-mono text-sm flex flex-col">
            {/* Terminal Header */}
            <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
                <div className="flex items-center gap-2">
                    <TerminalIcon size={16} className="text-green-400" />
                    <span className="text-white font-semibold">System Terminal</span>
                    <span className="text-xs text-gray-400">alberto@cocoluventas:~</span>
                </div>
                <button className="text-gray-400 hover:text-white">
                    <X size={16} />
                </button>
            </div>

            {/* Terminal Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {history.map((item, i) => (
                    <div key={i} className={`mb-1 ${
                        item.type === 'command' ? 'text-green-400' :
                        item.type === 'error' ? 'text-red-400' :
                        'text-gray-300'
                    }`}>
                        <pre className="whitespace-pre-wrap font-mono">{item.text}</pre>
                    </div>
                ))}
                
                {/* Input Line */}
                <div className="flex items-center gap-2">
                    <span className="text-green-400">$</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-transparent outline-none text-green-400"
                        autoFocus
                        spellCheck="false"
                    />
                </div>

                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default SystemTerminal;
