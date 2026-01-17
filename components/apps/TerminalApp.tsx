import React, { useState, useRef, useEffect } from 'react';
import { useOS } from '../../context/OSContext';

const TerminalApp: React.FC = () => {
  const { fsReadDir, fsMakeDir } = useOS();
  const [history, setHistory] = useState<string[]>(['Microsoft Windows [Version 10.0.19045.3693]', '(c) Microsoft Corporation. All rights reserved.', '']);
  const [input, setInput] = useState('');
  const [currentDir, setCurrentDir] = useState('C:/Users/Admin');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmdLine = input.trim();
    const parts = cmdLine.split(' ');
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ');

    const newHistory = [...history, `${currentDir}> ${input}`];

    if (cmd === 'help') {
        newHistory.push('Supported commands:', '  dir, cls, echo, mkdir, cd (simulated), ver, whoami');
    } else if (cmd === 'cls') {
        setHistory([]);
        setInput('');
        return;
    } else if (cmd === 'dir') {
        // Read from currentDir in VFS
        const items = fsReadDir(currentDir);
        if (items) {
            newHistory.push(` Directory of ${currentDir}`, '');
            items.forEach(item => {
                const date = new Date().toLocaleDateString();
                const type = item.type === 'folder' ? '<DIR>' : '     ';
                newHistory.push(`${date}  12:00 PM    ${type}    ${item.name}`);
            });
            newHistory.push('', `${items.length} File(s)`);
        } else {
            newHistory.push('File Not Found'); // Simplified
        }
    } else if (cmd === 'mkdir') {
        if (arg) {
            fsMakeDir(`${currentDir}/${arg}`);
            // No output on success usually
        } else {
            newHistory.push('The syntax of the command is incorrect.');
        }
    } else if (cmd === 'echo') {
        newHistory.push(arg);
    } else if (cmd === 'cd') {
        // Basic simulation of CD (only supports absolute paths or simple relative folders for now in this demo)
        if (arg === '..') {
            const parts = currentDir.split('/');
            parts.pop();
            setCurrentDir(parts.join('/') || 'C:');
        } else if (arg) {
             // Assume entering a folder in current dir
             const target = `${currentDir}/${arg}`;
             const exists = fsReadDir(target);
             if (exists) {
                 setCurrentDir(target);
             } else {
                 newHistory.push('The system cannot find the path specified.');
             }
        } else {
            newHistory.push(currentDir);
        }
    } else if (cmd === 'ver') {
        newHistory.push('Windows 9 Professional [Version 2026.1]');
    } else if (cmd === 'whoami') {
        newHistory.push('windows9\\admin');
    } else if (cmd !== '') {
        newHistory.push(`'${cmd}' is not recognized as an internal or external command.`);
    }

    if (cmd !== 'cls') {
       newHistory.push('');
    }

    setHistory(newHistory);
    setInput('');
  };

  return (
    <div 
        className="h-full bg-black text-gray-200 font-mono text-sm p-2 overflow-y-auto flex flex-col" 
        onClick={() => inputRef.current?.focus()}
        ref={containerRef}
    >
        {history.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap">{line}</div>
        ))}
        <form onSubmit={handleCommand} className="flex">
            <span className="whitespace-nowrap mr-2">{currentDir.replace(/\//g, '\\')}&gt;</span>
            <input 
                ref={inputRef}
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="bg-transparent outline-none flex-1 text-gray-200"
                autoFocus
                autoComplete="off"
            />
        </form>
    </div>
  );
};

export default TerminalApp;