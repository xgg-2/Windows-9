import React, { useState, useRef, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { WALLPAPERS } from '../../constants';

// --- This PC ---
export const PCApp: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>('root'); // 'root', 'C:', 'D:'

  const goBack = () => {
    if (currentPath !== 'root') setCurrentPath('root');
  };

  const drives = [
    { id: 'C:', name: 'Local Disk (C:)', icon: 'fa-hdd', color: 'text-gray-500', bar: 'bg-blue-500', percent: '75%', free: '40 GB free of 250 GB' },
    { id: 'D:', name: 'DVD Drive (D:)', icon: 'fa-compact-disc', color: 'text-gray-400', bar: 'bg-gray-200', percent: '0%', free: '0 bytes free' }
  ];

  const cFiles = [
    { name: 'Windows', type: 'folder' },
    { name: 'Program Files', type: 'folder' },
    { name: 'Users', type: 'folder' },
    { name: 'secret_plans.txt', type: 'file' }
  ];

  return (
    <div className="flex h-full flex-col select-none">
      <div className="bg-[#f0f0f0] border-b p-2 flex gap-2 text-sm text-gray-600">
         <div className="flex items-center gap-2 border-r pr-2 border-gray-300">
            <button className={`hover:bg-gray-200 px-2 rounded ${currentPath === 'root' ? 'opacity-50' : ''}`} onClick={goBack}>
                <i className="fas fa-arrow-left"></i>
            </button>
            <button className="hover:bg-gray-200 px-2 rounded opacity-50">
                <i className="fas fa-arrow-up"></i>
            </button>
         </div>
         <div className="flex-1 bg-white border border-gray-300 px-2 flex items-center text-xs h-6">
            <i className="fas fa-desktop text-gray-500 mr-2"></i>
            <span>{currentPath === 'root' ? 'This PC' : `This PC > ${currentPath}`}</span>
         </div>
      </div>
      
      <div className="flex-1 p-4 bg-white overflow-y-auto">
        {currentPath === 'root' ? (
            <>
                <h3 className="text-sm font-bold text-gray-600 mb-2 border-b pb-1">Devices and drives ({drives.length})</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {drives.map(drive => (
                    <div 
                        key={drive.id}
                        className="flex gap-2 p-2 hover:bg-blue-50 border border-transparent hover:border-blue-200 cursor-pointer rounded group"
                        onDoubleClick={() => setCurrentPath(drive.id)}
                    >
                    <i className={`fas ${drive.icon} text-3xl ${drive.color} group-hover:text-gray-600`}></i>
                    <div className="flex flex-col flex-1">
                        <span className="text-xs font-bold">{drive.name}</span>
                        <div className="w-full h-3 bg-gray-200 rounded-full mt-1 overflow-hidden border border-gray-300">
                        <div className={`h-full ${drive.bar}`} style={{ width: drive.percent }}></div>
                        </div>
                        <span className="text-[10px] text-gray-500 mt-1">{drive.free}</span>
                    </div>
                    </div>
                ))}
                </div>
            </>
        ) : (
            <>
                 <h3 className="text-sm font-bold text-gray-600 mb-2 border-b pb-1">Files in {currentPath}</h3>
                 <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                    {currentPath === 'C:' ? cFiles.map((file, idx) => (
                         <div key={idx} className="flex flex-col items-center gap-1 p-2 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded cursor-pointer">
                             <i className={`fas ${file.type === 'folder' ? 'fa-folder text-yellow-400' : 'fa-file-alt text-gray-500'} text-3xl`}></i>
                             <span className="text-xs text-center break-all">{file.name}</span>
                         </div>
                    )) : (
                        <div className="col-span-4 text-gray-500 italic text-sm">This folder is empty.</div>
                    )}
                 </div>
            </>
        )}
      </div>
    </div>
  );
};

// --- Browser ---
export const BrowserApp: React.FC = () => {
  const [url, setUrl] = useState('https://www.wikipedia.org');
  const [iframeSrc, setIframeSrc] = useState('https://www.wikipedia.org');
  
  const handleGo = (e: React.FormEvent) => {
    e.preventDefault();
    let target = url;
    if (!target.startsWith('http')) {
        target = 'https://' + target;
    }
    setIframeSrc(target);
    setUrl(target);
  };

  return (
    <div className="flex flex-col h-full bg-white select-none">
        <div className="h-9 bg-[#f0f0f0] border-b flex items-center px-2 gap-2 shadow-sm">
        <i className="fas fa-arrow-left text-gray-400 cursor-pointer hover:text-black"></i>
        <i className="fas fa-arrow-right text-gray-400 cursor-pointer hover:text-black"></i>
        <i className="fas fa-rotate-right text-gray-600 cursor-pointer hover:text-blue-600" onClick={() => setIframeSrc(url)}></i>
        <form className="flex-1 flex" onSubmit={handleGo}>
            <div className="flex-1 bg-white border border-gray-300 h-7 rounded px-2 text-xs flex items-center shadow-inner">
                <i className="fas fa-lock text-green-600 mr-2 text-[10px]"></i>
                <input 
                    className="flex-1 outline-none text-gray-700 w-full" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />
            </div>
            <button type="submit" className="ml-2 bg-gray-200 px-3 h-7 rounded text-xs border border-gray-300 hover:bg-gray-300">Go</button>
        </form>
        </div>
        <div className="flex-1 bg-white relative">
            <iframe 
                src={iframeSrc} 
                className="w-full h-full border-none" 
                title="Browser"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
            {/* Overlay for "This site cannot be reached" simulation could go here if iframe fails to load (hard to detect cross-origin) */}
        </div>
    </div>
  );
}

// --- Calculator ---
export const CalculatorApp: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [shouldReset, setShouldReset] = useState(false);

  const handleInput = (val: string) => {
    if (val === 'C') {
      setDisplay('0');
      setShouldReset(false);
    } else if (val === 'CE') {
      setDisplay('0');
    } else if (val === '=') {
      try {
        // eslint-disable-next-line no-new-func
        const result = new Function('return ' + display)();
        setDisplay(String(result));
        setShouldReset(true);
      } catch {
        setDisplay('Error');
        setShouldReset(true);
      }
    } else {
      if (display === '0' || shouldReset) {
        setDisplay(val);
        setShouldReset(false);
      } else {
        setDisplay(display + val);
      }
    }
  };

  const buttons = [
    { label: 'C', type: 'op' }, { label: 'CE', type: 'op' }, { label: '%', type: 'op' }, { label: '/', type: 'op', val: '/' },
    { label: '7', type: 'num' }, { label: '8', type: 'num' }, { label: '9', type: 'num' }, { label: '×', type: 'op', val: '*' },
    { label: '4', type: 'num' }, { label: '5', type: 'num' }, { label: '6', type: 'num' }, { label: '-', type: 'op', val: '-' },
    { label: '1', type: 'num' }, { label: '2', type: 'num' }, { label: '3', type: 'num' }, { label: '+', type: 'op', val: '+' },
    { label: '0', type: 'num', wide: true }, { label: '.', type: 'num' }, { label: '=', type: 'eq', val: '=' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f2f2f2] select-none">
      <div className="p-4 text-right text-3xl font-light bg-[#e6e6e6] mb-1 truncate text-gray-800 h-20 flex items-center justify-end">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-1 p-1 flex-1">
        {buttons.map((btn, idx) => (
          <button
            key={idx}
            className={`
              ${btn.wide ? 'col-span-2' : ''}
              ${btn.type === 'op' ? 'bg-[#f0f0f0] text-blue-600 hover:bg-gray-200' : ''}
              ${btn.type === 'num' ? 'bg-white font-bold hover:bg-gray-100' : ''}
              ${btn.type === 'eq' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
              text-lg transition active:scale-95 border border-gray-300 rounded-sm
            `}
            onClick={() => handleInput(btn.val || btn.label)}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Notepad ---
export const NotepadApp: React.FC = () => {
  const [text, setText] = useState("Welcome to Windows 9 Professional.\n\nYes, you can edit this text.\nTry dragging this window using the title bar!");
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.txt';
    a.click();
    URL.revokeObjectURL(url);
    setActiveMenu(null);
  };

  const handleOpenClick = () => {
    fileInputRef.current?.click();
    setActiveMenu(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setText(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleTimeDate = () => {
    const now = new Date().toLocaleString();
    if (textareaRef.current) {
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const newText = text.substring(0, start) + now + text.substring(end);
        setText(newText);
        setTimeout(() => {
            textareaRef.current?.focus();
            textareaRef.current?.setSelectionRange(start + now.length, start + now.length);
        }, 0);
    }
    setActiveMenu(null);
  };

  const handleSelectAll = () => {
    textareaRef.current?.select();
    setActiveMenu(null);
  };

  const handleFindNext = () => {
    if (!textareaRef.current || !findText) return;
    
    const textarea = textareaRef.current;
    const content = textarea.value;
    let searchStart = textarea.selectionEnd;
    let index = content.indexOf(findText, searchStart);
    
    if (index === -1) {
        index = content.indexOf(findText, 0);
    }
    
    if (index !== -1) {
        textarea.focus();
        textarea.setSelectionRange(index, index + findText.length);
    }
  };

  const handleReplace = () => {
     if (!textareaRef.current || !findText) return;
     const textarea = textareaRef.current;
     const start = textarea.selectionStart;
     const end = textarea.selectionEnd;
     const selectedText = textarea.value.substring(start, end);
     
     if (selectedText === findText) {
         const newText = text.substring(0, start) + replaceText + text.substring(end);
         setText(newText);
         setTimeout(() => {
             if (textareaRef.current) {
                 textareaRef.current.focus();
                 textareaRef.current.setSelectionRange(start + replaceText.length, start + replaceText.length);
                 handleFindNext(); 
             }
         }, 0);
     } else {
         handleFindNext();
     }
  };

  const handleReplaceAll = () => {
      if (!findText) return;
      const newText = text.split(findText).join(replaceText);
      setText(newText);
      setShowFindReplace(false);
  };

  const toggleMenu = (menu: string) => {
      setActiveMenu(activeMenu === menu ? null : menu);
  };

  return (
    <div className="flex flex-col h-full bg-white relative" onClick={() => setActiveMenu(null)}>
      <input type="file" ref={fileInputRef} className="hidden" accept=".txt" onChange={handleFileChange} />
      
      {/* Menu Bar */}
      <div className="text-xs text-black border-b flex p-1 bg-white select-none z-20">
        <div className="relative">
             <span 
                className={`px-2 cursor-pointer hover:bg-blue-600 hover:text-white ${activeMenu === 'file' ? 'bg-blue-600 text-white' : ''}`}
                onClick={(e) => { e.stopPropagation(); toggleMenu('file'); }}
             >
                File
             </span>
             {activeMenu === 'file' && (
                 <div className="absolute top-full left-0 bg-white border shadow-[2px_2px_5px_rgba(0,0,0,0.2)] py-1 w-32 min-w-max z-50">
                     <div className="px-4 py-1 hover:bg-blue-600 hover:text-white cursor-pointer" onClick={() => { setText(''); setActiveMenu(null); }}>New</div>
                     <div className="px-4 py-1 hover:bg-blue-600 hover:text-white cursor-pointer" onClick={handleOpenClick}>Open...</div>
                     <div className="px-4 py-1 hover:bg-blue-600 hover:text-white cursor-pointer" onClick={handleSave}>Save</div>
                     <div className="border-t my-1"></div>
                     <div className="px-4 py-1 hover:bg-blue-600 hover:text-white cursor-pointer">Exit</div>
                 </div>
             )}
        </div>
        
        <div className="relative">
             <span 
                className={`px-2 cursor-pointer hover:bg-blue-600 hover:text-white ${activeMenu === 'edit' ? 'bg-blue-600 text-white' : ''}`}
                onClick={(e) => { e.stopPropagation(); toggleMenu('edit'); }}
             >
                Edit
             </span>
             {activeMenu === 'edit' && (
                 <div className="absolute top-full left-0 bg-white border shadow-[2px_2px_5px_rgba(0,0,0,0.2)] py-1 w-32 min-w-max z-50">
                     <div className="px-4 py-1 hover:bg-blue-600 hover:text-white cursor-pointer">Undo</div>
                     <div className="border-t my-1"></div>
                     <div className="px-4 py-1 hover:bg-blue-600 hover:text-white cursor-pointer">Cut</div>
                     <div className="px-4 py-1 hover:bg-blue-600 hover:text-white cursor-pointer">Copy</div>
                     <div className="px-4 py-1 hover:bg-blue-600 hover:text-white cursor-pointer">Paste</div>
                     <div className="px-4 py-1 hover:bg-blue-600 hover:text-white cursor-pointer">Delete</div>
                     <div className="border-t my-1"></div>
                     <div 
                        className="px-4 py-1 hover:bg-blue-600 hover:text-white cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowFindReplace(true);
                            setActiveMenu(null);
                        }}
                     >
                        Find/Replace...
                     </div>
                     <div className="px-4 py-1 hover:bg-blue-600 hover:text-white cursor-pointer" onClick={handleSelectAll}>Select All</div>
                     <div className="px-4 py-1 hover:bg-blue-600 hover:text-white cursor-pointer" onClick={handleTimeDate}>Time/Date</div>
                 </div>
             )}
        </div>
        
        <div className="relative">
             <span className="px-2 cursor-pointer hover:bg-blue-600 hover:text-white">Format</span>
        </div>
      </div>

      <textarea
        ref={textareaRef}
        className="flex-1 w-full p-2 outline-none resize-none font-mono text-sm leading-normal text-gray-800"
        spellCheck={false}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {/* Find/Replace Modal */}
      {showFindReplace && (
        <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[350px] bg-[#f0f0f0] border border-gray-400 shadow-[5px_5px_15px_rgba(0,0,0,0.3)] p-1 z-30 font-sans text-xs select-none"
            onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] text-white px-2 py-1 flex justify-between items-center mb-3">
             <span className="font-bold">Find and Replace</span>
             <button onClick={() => setShowFindReplace(false)} className="bg-[#c75050] hover:bg-red-600 w-4 h-4 flex items-center justify-center rounded-sm text-[10px]">✕</button>
          </div>
          
          <div className="px-3 pb-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <label className="w-20">Find what:</label>
                    <input 
                        type="text" 
                        value={findText}
                        onChange={(e) => setFindText(e.target.value)}
                        className="flex-1 border border-gray-400 p-1 outline-none focus:border-blue-500"
                        autoFocus
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label className="w-20">Replace with:</label>
                    <input 
                        type="text" 
                        value={replaceText}
                        onChange={(e) => setReplaceText(e.target.value)}
                        className="flex-1 border border-gray-400 p-1 outline-none focus:border-blue-500"
                    />
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2 mt-4">
                  <button onClick={handleFindNext} className="w-20 py-1 border border-gray-400 bg-[#e1e1e1] hover:bg-[#e5f1fb] hover:border-[#0078d7] active:bg-[#cce4f7] transition-colors focus:ring-1 ring-blue-300 outline-none">Find Next</button>
                  <button onClick={handleReplace} className="w-20 py-1 border border-gray-400 bg-[#e1e1e1] hover:bg-[#e5f1fb] hover:border-[#0078d7] active:bg-[#cce4f7] transition-colors focus:ring-1 ring-blue-300 outline-none">Replace</button>
                  <button onClick={handleReplaceAll} className="w-20 py-1 border border-gray-400 bg-[#e1e1e1] hover:bg-[#e5f1fb] hover:border-[#0078d7] active:bg-[#cce4f7] transition-colors focus:ring-1 ring-blue-300 outline-none">Replace All</button>
                  <button onClick={() => setShowFindReplace(false)} className="w-20 py-1 border border-gray-400 bg-[#e1e1e1] hover:bg-[#e5f1fb] hover:border-[#0078d7] active:bg-[#cce4f7] transition-colors focus:ring-1 ring-blue-300 outline-none">Cancel</button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Settings ---
export const SettingsApp: React.FC = () => {
  const { setWallpaper } = useOS();
  const [activeTab, setActiveTab] = useState('System');

  return (
    <div className="flex h-full bg-white select-none">
        <div className="w-1/3 bg-gray-100 border-r p-2 flex flex-col gap-1">
            {['System', 'Personalization', 'Network', 'Update'].map(tab => (
                <div 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`p-2 rounded text-sm cursor-pointer transition ${activeTab === tab ? 'bg-blue-500 text-white font-medium' : 'hover:bg-gray-200 text-gray-700'}`}
                >
                    {tab}
                </div>
            ))}
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'System' && (
                <>
                    <h2 className="text-xl font-light mb-4 text-gray-800">About Windows</h2>
                    <div className="flex items-center gap-4 mb-6">
                        <i className="fab fa-windows text-4xl text-blue-500"></i>
                        <div>
                        <div className="font-bold text-gray-800">Windows 9 Pro</div>
                        <div className="text-sm text-gray-500">Version 2026.1</div>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">This OS is running in your browser.</p>
                </>
            )}
            {activeTab === 'Personalization' && (
                <>
                     <h2 className="text-xl font-light mb-4 text-gray-800">Background</h2>
                     <p className="text-sm text-gray-600 mb-2">Choose your wallpaper</p>
                     <div className="grid grid-cols-2 gap-4">
                        {WALLPAPERS.map((wp, idx) => (
                            <div key={idx} className="group cursor-pointer" onClick={() => setWallpaper(wp.url)}>
                                <div className="aspect-video rounded overflow-hidden border-2 border-transparent group-hover:border-blue-500 shadow-sm">
                                    <img src={wp.url} alt={wp.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="text-xs mt-1 text-gray-600">{wp.name}</div>
                            </div>
                        ))}
                     </div>
                </>
            )}
            {activeTab === 'Network' && (
                 <>
                    <h2 className="text-xl font-light mb-4 text-gray-800">Network & Internet</h2>
                    <div className="flex items-center gap-3 mb-4">
                        <i className="fas fa-wifi text-2xl text-gray-600"></i>
                        <div>
                            <div className="font-bold">Wi-Fi</div>
                            <div className="text-sm text-gray-500">Connected, secure</div>
                        </div>
                    </div>
                    <div className="text-sm text-blue-600 hover:underline cursor-pointer">Show available networks</div>
                 </>
            )}
            {activeTab === 'Update' && (
                <>
                    <h2 className="text-xl font-light mb-4 text-gray-800">Windows Update</h2>
                    <div className="text-sm text-gray-600 mb-4">You're up to date</div>
                    <button className="bg-gray-200 px-4 py-1 text-sm border border-gray-300 shadow-sm active:bg-gray-300 hover:bg-gray-100 rounded">
                        Check for updates
                    </button>
                </>
            )}
        </div>
    </div>
  );
};

// --- Terminal ---
export const TerminalApp: React.FC = () => {
  const [history, setHistory] = useState<string[]>(['Microsoft Windows [Version 10.0.19045.3693]', '(c) Microsoft Corporation. All rights reserved.', '']);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    const newHistory = [...history, `C:\\Users\\Admin> ${input}`];

    if (cmd === 'help') {
        newHistory.push('Supported commands:', '  help    - Show this help', '  dir     - List directory contents', '  cls     - Clear screen', '  ver     - Show OS version', '  echo    - Display message', '  whoami  - Display current user');
    } else if (cmd === 'cls') {
        setHistory([]);
        setInput('');
        return;
    } else if (cmd === 'ver') {
        newHistory.push('Windows 9 Professional [Version 2026.1]');
    } else if (cmd === 'dir') {
        newHistory.push(' Directory of C:\\Users\\Admin', '', '01/01/2026  12:00 PM    <DIR>          .', '01/01/2026  12:00 PM    <DIR>          ..', '01/01/2026  12:00 PM    <DIR>          Documents', '01/01/2026  12:00 PM    <DIR>          Downloads', '01/01/2026  12:00 PM               142 secret_plans.txt');
    } else if (cmd.startsWith('echo ')) {
        newHistory.push(input.substring(5));
    } else if (cmd === 'whoami') {
        newHistory.push('windows9\\admin');
    } else if (cmd !== '') {
        newHistory.push(`'${cmd.split(' ')[0]}' is not recognized as an internal or external command,`, 'operable program or batch file.');
    } else {
        // empty enter
    }

    // Add empty line for visual spacing
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
            <span className="whitespace-nowrap mr-2">C:\Users\Admin&gt;</span>
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

// --- Paint ---
export const PaintApp: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [color, setColor] = useState('#000000');
    const [size, setSize] = useState(3);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Initial white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    const startDraw = (e: React.MouseEvent) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDraw = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.beginPath();
        }
    };

    const draw = (e: React.MouseEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.strokeStyle = color;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const colors = ['#000000', '#787c7e', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#800000', '#008000', '#000080', '#808000', '#800080', '#008080'];

    return (
        <div className="flex flex-col h-full bg-[#f0f0f0] select-none">
            {/* Toolbar */}
            <div className="h-24 bg-[#f5f6f7] border-b flex items-center p-2 gap-4">
                <div className="flex flex-col gap-1 border-r pr-4">
                    <div className="text-xs text-gray-600 mb-1">Tools</div>
                    <div className="flex gap-1">
                        <button 
                            className={`p-1 border rounded ${color !== '#ffffff' ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-200'}`} 
                            onClick={() => setColor('#000000')}
                            title="Brush"
                        >
                            <i className="fas fa-paint-brush"></i>
                        </button>
                        <button 
                            className={`p-1 border rounded ${color === '#ffffff' ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-200'}`} 
                            onClick={() => setColor('#ffffff')}
                            title="Eraser"
                        >
                             <i className="fas fa-eraser"></i>
                        </button>
                        <button className="p-1 border rounded hover:bg-gray-200" onClick={clearCanvas} title="Clear All">
                             <i className="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-1 border-r pr-4">
                     <div className="text-xs text-gray-600 mb-1">Size</div>
                     <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full bg-black cursor-pointer ${size === 3 ? 'ring-2 ring-blue-400' : ''}`} onClick={() => setSize(3)}></div>
                         <div className={`w-3 h-3 rounded-full bg-black cursor-pointer ${size === 6 ? 'ring-2 ring-blue-400' : ''}`} onClick={() => setSize(6)}></div>
                         <div className={`w-4 h-4 rounded-full bg-black cursor-pointer ${size === 10 ? 'ring-2 ring-blue-400' : ''}`} onClick={() => setSize(10)}></div>
                         <div className={`w-6 h-6 rounded-full bg-black cursor-pointer ${size === 15 ? 'ring-2 ring-blue-400' : ''}`} onClick={() => setSize(15)}></div>
                     </div>
                </div>

                <div className="flex-1">
                     <div className="text-xs text-gray-600 mb-1">Colors</div>
                     <div className="flex flex-wrap gap-1 w-48">
                         {colors.map(c => (
                             <div 
                                key={c}
                                className={`w-5 h-5 border cursor-pointer ${color === c ? 'ring-2 ring-blue-400 z-10' : 'border-gray-400'}`}
                                style={{ backgroundColor: c }}
                                onClick={() => setColor(c)}
                             ></div>
                         ))}
                     </div>
                </div>
            </div>

            <div className="flex-1 bg-gray-200 p-4 overflow-auto flex justify-center items-center">
                 <canvas 
                    ref={canvasRef}
                    width={800}
                    height={600}
                    className="bg-white shadow-lg cursor-crosshair"
                    onMouseDown={startDraw}
                    onMouseUp={stopDraw}
                    onMouseLeave={stopDraw}
                    onMouseMove={draw}
                 />
            </div>
        </div>
    );
};
