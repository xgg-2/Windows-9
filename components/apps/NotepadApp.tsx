import React, { useState, useRef, useEffect } from 'react';
import { useOS } from '../../context/OSContext';

interface NotepadProps {
    windowId?: string;
    initFile?: string;
}

const NotepadApp: React.FC<NotepadProps> = ({ initFile }) => {
  const { fsReadFile, fsWriteFile } = useOS();
  const [text, setText] = useState("");
  const [filePath, setFilePath] = useState<string | null>(null);
  
  // Font State
  const [fontFamily, setFontFamily] = useState('font-mono');
  const [fontSize, setFontSize] = useState(14);
  
  // UI State
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [wordWrap, setWordWrap] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      if (initFile) {
          const content = fsReadFile(initFile);
          if (content !== null) {
              setText(content);
              setFilePath(initFile);
          } else {
              setText(`Error: Could not read file ${initFile}`);
          }
      } else {
          setText("Untitled");
          setFilePath(null);
      }
  }, [initFile, fsReadFile]);

  const updateCursorPos = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
      const target = e.target as HTMLTextAreaElement;
      const val = target.value.substring(0, target.selectionStart);
      const lines = val.split('\n');
      setCursorPos({ 
          line: lines.length, 
          col: lines[lines.length - 1].length + 1 
      });
  };

  const handleSave = () => {
      if (filePath) {
          fsWriteFile(filePath, text);
          // Visual feedback could be added here
      } else {
          alert("Save As not fully implemented in simulation. Saving to C:/Users/Admin/Documents/saved_file.txt");
          const defaultPath = 'C:/Users/Admin/Documents/saved_file.txt';
          fsWriteFile(defaultPath, text);
          setFilePath(defaultPath);
      }
      setActiveMenu(null);
  };

  const toggleMenu = (menu: string) => {
      setActiveMenu(activeMenu === menu ? null : menu);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setText(ev.target?.result as string);
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative text-black" onClick={() => setActiveMenu(null)}>
      <input type="file" ref={fileInputRef} className="hidden" accept=".txt" onChange={handleFileChange} />
      
      {/* Menu Bar */}
      <div className="text-[13px] text-black border-b border-[#e5e5e5] flex px-0 bg-white select-none z-20 shadow-sm h-7 items-center">
        {['File', 'Edit', 'Format', 'View', 'Help'].map((menu) => (
             <div className="relative" key={menu}>
             <span 
                className={`px-3 py-1 cursor-default hover:bg-[#e5f3ff] hover:text-black transition-colors ${activeMenu === menu.toLowerCase() ? 'bg-[#cce8ff]' : ''}`}
                onClick={(e) => { e.stopPropagation(); toggleMenu(menu.toLowerCase()); }}
             >
                {menu}
             </span>
             {activeMenu === menu.toLowerCase() && (
                 <div className="absolute top-full left-0 bg-white border border-[#cccccc] shadow-md py-1 w-48 min-w-max z-50 text-black">
                     {menu === 'File' && <>
                        <div className="px-6 py-1 hover:bg-blue-600 hover:text-white cursor-pointer" onClick={() => { setText(''); setFilePath(null); }}>New</div>
                        <div className="px-6 py-1 hover:bg-blue-600 hover:text-white cursor-pointer" onClick={() => fileInputRef.current?.click()}>Open...</div>
                        <div className="px-6 py-1 hover:bg-blue-600 hover:text-white cursor-pointer" onClick={handleSave}>Save</div>
                        <div className="border-t my-1 border-gray-200"></div>
                        <div className="px-6 py-1 hover:bg-blue-600 hover:text-white cursor-pointer">Exit</div>
                     </>}
                     {menu === 'Format' && <>
                        <div className="px-6 py-1 hover:bg-blue-600 hover:text-white cursor-pointer flex items-center" onClick={() => setWordWrap(!wordWrap)}>
                            <span className="w-5">{wordWrap && <i className="fas fa-check text-xs"></i>}</span>
                            <span>Word Wrap</span>
                        </div>
                     </>}
                     {/* Placeholder for other menus */}
                     {!['File', 'Format'].includes(menu) && (
                         <div className="px-6 py-1 text-gray-400 cursor-default">Not implemented</div>
                     )}
                 </div>
             )}
        </div>
        ))}
      </div>

      <textarea
        ref={textareaRef}
        className={`flex-1 w-full p-2 outline-none resize-none bg-white text-black select-text ${fontFamily} ${wordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre overflow-x-auto'}`}
        style={{ fontSize: `${fontSize}px` }}
        spellCheck={false}
        value={text}
        onChange={(e) => { setText(e.target.value); updateCursorPos(e); }}
        onKeyUp={updateCursorPos}
        onClick={updateCursorPos}
      />

      <div className="bg-[#f0f0f0] border-t border-[#e5e5e5] px-3 h-6 text-xs text-gray-600 flex justify-end gap-4 items-center select-none">
         <div className="border-l pl-2 border-gray-300">{filePath || 'Untitled'}</div>
         <div className="border-l pl-2 border-gray-300">Ln {cursorPos.line}, Col {cursorPos.col}</div>
         <div className="border-l pl-2 border-gray-300">UTF-8</div>
      </div>
    </div>
  );
};

export default NotepadApp;