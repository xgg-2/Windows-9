import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { FileSystemItem } from '../../types';

interface PCAppProps {
    windowId?: string;
}

const PCApp: React.FC<PCAppProps> = () => {
  const { fs, fsReadDir, launchApp, fsMakeDir, fsWriteFile, fsRename, fsDelete } = useOS();
  const [currentPath, setCurrentPath] = useState<string>('root');
  const [history, setHistory] = useState<string[]>(['root']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedItemName, setSelectedItemName] = useState<string | null>(null);
  const [renamingItem, setRenamingItem] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  
  // Drives are "roots" in our logic for now
  const drives = [
      { name: 'C:', label: 'Local Disk (C:)', used: '75%', free: '40 GB free' },
      { name: 'D:', label: 'Data (D:)', used: '10%', free: '400 GB free' }
  ];

  // Derive contents based on currentPath
  let items: FileSystemItem[] = [];
  
  if (currentPath === 'root') {
      items = []; 
  } else {
      const dirContents = fsReadDir(currentPath);
      if (dirContents) {
          items = dirContents;
      }
  }

  const navigate = (path: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(path);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentPath(path);
    setSelectedItemName(null);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentPath(history[newIndex]);
      setSelectedItemName(null);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentPath(history[newIndex]);
      setSelectedItemName(null);
    }
  };

  const goUp = () => {
    if (currentPath === 'root') return;
    const parts = currentPath.split('/');
    if (parts.length <= 1 || (parts.length === 1 && parts[0].includes(':'))) {
        navigate('root');
    } else {
        parts.pop();
        navigate(parts.join('/'));
    }
  };

  const handleItemDoubleClick = (item: FileSystemItem) => {
      if (item.type === 'folder') {
          navigate(currentPath === 'root' ? item.name : `${currentPath}/${item.name}`);
      } else {
          const fullPath = `${currentPath}/${item.name}`;
          if (item.name.endsWith('.txt')) {
              launchApp('notepad', { file: fullPath });
          } else if (item.content?.startsWith('data:image')) {
              // Image preview - for now just notepad or alert
              alert('Image file detected: ' + item.name);
          } else {
              alert(`Cannot open ${item.name}. No app associated.`);
          }
      }
  };

  const handleCreateFolder = () => {
    if (currentPath === 'root') return;
    const name = `New Folder ${items.filter(i => i.name.startsWith('New Folder')).length || ''}`.trim();
    fsMakeDir(`${currentPath}/${name}`);
  };

  const handleCreateFile = () => {
    if (currentPath === 'root') return;
    const name = `New Text Document ${items.filter(i => i.name.startsWith('New Text Document')).length || ''}.txt`.trim();
    fsWriteFile(`${currentPath}/${name}`, '');
  };

  const handleRename = () => {
    if (!selectedItemName) return;
    setRenamingItem(selectedItemName);
    setNewName(selectedItemName);
  };

  const submitRename = () => {
    if (renamingItem && newName && newName !== renamingItem) {
        fsRename(`${currentPath}/${renamingItem}`, newName);
    }
    setRenamingItem(null);
  };

  const handleDelete = () => {
    if (selectedItemName && confirm(`Delete ${selectedItemName}?`)) {
        fsDelete(`${currentPath}/${selectedItemName}`);
        setSelectedItemName(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentPath === 'root' || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
        const content = event.target?.result as string;
        fsWriteFile(`${currentPath}/${file.name}`, content);
    };
    reader.readAsDataURL(file); // This will save photos as Base64 strings in memory
  };

  return (
    <div className="flex h-full flex-col select-none text-sm" onClick={() => { setSelectedItemName(null); setRenamingItem(null); }}>
      {/* Ribbon / Toolbar */}
      <div className="bg-[#f5f6f7] border-b border-gray-300 p-1 flex gap-4 text-xs">
          <div className="flex flex-col items-center px-3 py-1 hover:bg-white/50 rounded cursor-pointer group" onClick={(e) => { e.stopPropagation(); handleCreateFolder(); }}>
              <i className="fas fa-folder-plus text-yellow-500 text-lg group-active:scale-95"></i>
              <span>New folder</span>
          </div>
          <div className="flex flex-col items-center px-3 py-1 hover:bg-white/50 rounded cursor-pointer group" onClick={(e) => { e.stopPropagation(); handleCreateFile(); }}>
              <i className="fas fa-file-circle-plus text-blue-500 text-lg group-active:scale-95"></i>
              <span>New file</span>
          </div>
          <label className="flex flex-col items-center px-3 py-1 hover:bg-white/50 rounded cursor-pointer group relative">
              <i className="fas fa-upload text-green-600 text-lg group-active:scale-95"></i>
              <span>Upload</span>
              <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>
          <div className="w-[1px] bg-gray-300 my-1"></div>
          <div className={`flex flex-col items-center px-3 py-1 rounded cursor-pointer group ${!selectedItemName ? 'opacity-30 pointer-events-none' : 'hover:bg-white/50'}`} onClick={(e) => { e.stopPropagation(); handleRename(); }}>
              <i className="fas fa-i-cursor text-gray-600 text-lg group-active:scale-95"></i>
              <span>Rename</span>
          </div>
          <div className={`flex flex-col items-center px-3 py-1 rounded cursor-pointer group ${!selectedItemName ? 'opacity-30 pointer-events-none' : 'hover:bg-red-50 text-red-600'}`} onClick={(e) => { e.stopPropagation(); handleDelete(); }}>
              <i className="fas fa-trash-can text-lg group-active:scale-95"></i>
              <span>Delete</span>
          </div>
      </div>

      {/* Address Bar */}
      <div className="bg-white border-b border-gray-200 p-2 flex gap-2">
         <div className="flex items-center gap-1 text-gray-500">
            <button className={`p-1 hover:bg-gray-100 rounded ${historyIndex === 0 ? 'opacity-30' : ''}`} onClick={(e) => { e.stopPropagation(); goBack(); }} disabled={historyIndex===0}><i className="fas fa-arrow-left"></i></button>
            <button className={`p-1 hover:bg-gray-100 rounded ${historyIndex === history.length-1 ? 'opacity-30' : ''}`} onClick={(e) => { e.stopPropagation(); goForward(); }} disabled={historyIndex===history.length-1}><i className="fas fa-arrow-right"></i></button>
            <button className="p-1 hover:bg-gray-100 rounded" onClick={(e) => { e.stopPropagation(); goUp(); }}><i className="fas fa-arrow-up"></i></button>
         </div>
         <div className="flex-1 border border-gray-300 flex items-center px-2 h-7 bg-white hover:border-gray-400">
            <i className="fas fa-folder text-yellow-500 mr-2"></i>
            <span className="truncate">{currentPath === 'root' ? 'This PC' : currentPath}</span>
         </div>
         <div className="w-48 border border-gray-300 flex items-center px-2 h-7 bg-white text-gray-400 hover:border-gray-400">
             Search
         </div>
      </div>

      <div className="flex flex-1 overflow-hidden bg-white">
          {/* Sidebar */}
          <div className="w-48 border-r border-gray-200 p-2 hidden sm:flex flex-col gap-1 overflow-y-auto">
              <div className="font-semibold text-gray-500 text-xs px-2 mb-1">Quick Access</div>
              {['Desktop', 'Downloads', 'Documents', 'Pictures'].map(f => (
                  <div key={f} className="flex items-center gap-2 px-2 py-1 hover:bg-blue-50 cursor-pointer rounded text-gray-700" onClick={() => navigate(`C:/Users/Admin/${f}`)}>
                      <i className={`fas ${f === 'Pictures' ? 'fa-image text-pink-500' : 'fa-folder text-blue-500'}`}></i> {f}
                  </div>
              ))}
              <div className="font-semibold text-gray-500 text-xs px-2 mt-3 mb-1">This PC</div>
              <div className="flex items-center gap-2 px-2 py-1 hover:bg-blue-50 cursor-pointer rounded text-gray-700" onClick={() => navigate('C:')}>
                   <i className="fas fa-hdd text-gray-500"></i> Local Disk (C:)
              </div>
          </div>

          {/* Main View */}
          <div className="flex-1 p-2 overflow-y-auto">
              {currentPath === 'root' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {drives.map(drive => (
                          <div 
                            key={drive.name} 
                            className="flex items-center gap-3 p-2 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded cursor-pointer"
                            onDoubleClick={() => navigate(drive.name)}
                          >
                              <i className="fas fa-hdd text-4xl text-gray-500"></i>
                              <div className="flex-1">
                                  <div className="font-medium text-sm">{drive.label}</div>
                                  <div className="h-3 bg-gray-200 rounded-full mt-1 border border-gray-300 relative overflow-hidden">
                                      <div className="bg-blue-500 h-full absolute top-0 left-0" style={{ width: drive.used }}></div>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">{drive.free}</div>
                              </div>
                          </div>
                      ))}
                  </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                    {items.length === 0 && <div className="col-span-full text-gray-400 italic p-4">This folder is empty.</div>}
                    {items.map(item => (
                        <div 
                            key={item.name}
                            className={`flex flex-col items-center p-2 border border-transparent rounded hover:bg-blue-50 hover:border-blue-200 cursor-pointer group ${selectedItemName === item.name ? 'bg-blue-100 border-blue-300' : ''}`}
                            onClick={(e) => { e.stopPropagation(); setSelectedItemName(item.name); }}
                            onDoubleClick={(e) => { e.stopPropagation(); handleItemDoubleClick(item); }}
                        >
                             <div className="relative mb-1">
                                {item.content?.startsWith('data:image') ? (
                                    <div className="w-12 h-12 rounded border border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                                        <img src={item.content} alt={item.name} className="max-w-full max-h-full object-cover" />
                                    </div>
                                ) : (
                                    <i className={`text-4xl ${item.type === 'folder' ? 'fas fa-folder text-yellow-400' : 'fas fa-file-alt text-white drop-shadow-md relative'}`}>
                                        {item.type === 'file' && <i className="fas fa-file-lines text-gray-600 text-[16px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></i>}
                                    </i>
                                )}
                             </div>
                             {renamingItem === item.name ? (
                                 <input 
                                    autoFocus
                                    className="text-xs text-center border border-blue-500 outline-none w-full px-1"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onBlur={submitRename}
                                    onKeyDown={(e) => e.key === 'Enter' && submitRename()}
                                    onClick={(e) => e.stopPropagation()}
                                 />
                             ) : (
                                 <span className="text-xs text-center line-clamp-2 w-full break-words group-hover:text-blue-700">{item.name}</span>
                             )}
                        </div>
                    ))}
                </div>
              )}
          </div>
      </div>
      
      {/* Footer */}
      <div className="h-6 bg-white border-t border-gray-200 flex items-center px-2 text-xs text-gray-500">
          <span className="mr-4">{currentPath === 'root' ? '2 items' : `${items.length} items`}</span>
          {selectedItemName && <span className="truncate">Selected: {selectedItemName}</span>}
      </div>
    </div>
  );
};

export default PCApp;
