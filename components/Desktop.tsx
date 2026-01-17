import React, { useState } from 'react';
import { useOS } from '../context/OSContext';
import { APPS } from '../constants';
import Window from './Window';
import Taskbar from './Taskbar';
import StartMenu from './StartMenu';
import Assistant from './Assistant';
import { AppId } from '../types';

const Desktop: React.FC = () => {
  const { windows, launchApp, closeStartMenu, wallpaper, systemSettings } = useOS();
  const shortcuts: AppId[] = ['pc', 'browser', 'notepad', 'calc', 'settings', 'terminal', 'paint', 'sysinfo', 'worm', 'chrono'];
  
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean; submenu: string | null }>({ x: 0, y: 0, visible: false, submenu: null });
  const [selection, setSelection] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  const [selectedIds, setSelectedIds] = useState<AppId[]>([]);
  const [draggedId, setDraggedId] = useState<AppId | null>(null);
  const [iconPositions, setIconPositions] = useState<Record<string, { x: number; y: number }>>({});

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const x = Math.min(e.clientX, window.innerWidth - 200);
    const y = Math.min(e.clientY, window.innerHeight - 300);
    setContextMenu({ x, y, visible: true, submenu: null });
    closeStartMenu();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button')) return;
    
    setSelection({ startX: e.clientX, startY: e.clientY, endX: e.clientX, endY: e.clientY });
    setSelectedIds([]);
    if (contextMenu.visible) {
        setContextMenu({ ...contextMenu, visible: false, submenu: null });
    }
    closeStartMenu();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (selection) {
      setSelection({ ...selection, endX: e.clientX, endY: e.clientY });
      
      // Basic selection logic
      const rect = {
        left: Math.min(selection.startX, e.clientX),
        top: Math.min(selection.startY, e.clientY),
        right: Math.max(selection.startX, e.clientX),
        bottom: Math.max(selection.startY, e.clientY)
      };

      const newlySelected: AppId[] = [];
      const buttons = document.querySelectorAll('.desktop-icon');
      buttons.forEach(btn => {
          const btnRect = btn.getBoundingClientRect();
          const appId = btn.getAttribute('data-id') as AppId;
          if (
              btnRect.left < rect.right &&
              btnRect.right > rect.left &&
              btnRect.top < rect.bottom &&
              btnRect.bottom > rect.top
          ) {
              newlySelected.push(appId);
          }
      });
      setSelectedIds(newlySelected);
    }
  };

  const handleMouseUp = () => {
    setSelection(null);
  };

  const handleDragStart = (e: React.DragEvent, id: AppId) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedId) {
        setIconPositions(prev => ({
            ...prev,
            [draggedId]: { x: e.clientX - 42, y: e.clientY - 42 }
        }));
    }
    setDraggedId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setContextMenu({ ...contextMenu, visible: false });
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-cover bg-center select-none transition-all duration-500"
      style={{ backgroundImage: `url(${wallpaper})` }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {selection && (
          <div 
            className="absolute border border-blue-500 bg-blue-500/30 z-[5500] pointer-events-none"
            style={{
                left: Math.min(selection.startX, selection.endX),
                top: Math.min(selection.startY, selection.endY),
                width: Math.abs(selection.endX - selection.startX),
                height: Math.abs(selection.endY - selection.startY)
            }}
          />
      )}
      {/* Night Light Overlay */}
      {systemSettings.nightLight && (
        <div className="absolute inset-0 bg-orange-500 mix-blend-multiply opacity-20 pointer-events-none z-[9990]"></div>
      )}
      
      {/* Brightness Overlay */}
      <div 
        className="absolute inset-0 bg-black pointer-events-none z-[9991]"
        style={{ opacity: (100 - systemSettings.brightness) / 100 }}
      ></div>

      {/* Desktop Icons */}
      <div className="absolute top-0 left-0 bottom-12 p-2 flex flex-col flex-wrap content-start gap-2 z-0">
        {shortcuts.map((id) => (
          <button
            key={id}
            data-id={id}
            draggable
            onDragStart={(e) => handleDragStart(e, id)}
            className={`desktop-icon w-[84px] py-2 flex flex-col items-center gap-1 rounded hover:bg-white/10 active:bg-white/20 border border-transparent hover:border-white/10 transition group text-shadow-sm focus:bg-white/20 focus:border-white/20 outline-none
                ${selectedIds.includes(id) ? 'bg-white/20 border-white/20' : ''}
            `}
            style={iconPositions[id] ? { position: 'absolute', left: iconPositions[id].x, top: iconPositions[id].y } : {}}
            onClick={(e) => { 
              e.stopPropagation();
              launchApp(id);
            }}
            onTouchEnd={() => {
                launchApp(id);
            }}
          >
            <i className={`fas ${APPS[id].icon} text-3xl text-white drop-shadow-md mb-1`}></i>
            <span className="text-xs text-white text-center leading-tight line-clamp-2 drop-shadow-md px-1 group-hover:line-clamp-none">
              {APPS[id].title}
            </span>
          </button>
        ))}
      </div>

      {/* Window Layer */}
      <div className="absolute inset-0 bottom-12 z-10 pointer-events-none">
         {/* Windows need pointer-events-auto on themselves */}
        {windows.map((windowState) => (
            <div key={windowState.id} className="pointer-events-auto">
                <Window windowState={windowState} />
            </div>
        ))}
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div 
            className="absolute bg-white/95 backdrop-blur shadow-xl border border-gray-300 rounded-sm py-1 z-[6000] w-56 text-sm text-gray-800 animate-popIn"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
        >
            <div 
                className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-default flex justify-between items-center group relative"
                onMouseEnter={() => setContextMenu(prev => ({ ...prev, submenu: 'view' }))}
            >
                <div className="flex items-center gap-2">
                    <i className="far fa-eye w-4"></i>
                    <span>View</span>
                </div>
                <i className="fas fa-chevron-right text-[10px] opacity-50 group-hover:opacity-100"></i>
                
                {contextMenu.submenu === 'view' && (
                    <div className="absolute left-full top-0 ml-[1px] bg-white/95 backdrop-blur shadow-xl border border-gray-300 rounded-sm py-1 w-48 text-gray-800">
                        <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2">
                             <i className="fas fa-check text-[10px] w-4"></i>
                             <span>Large icons</span>
                        </div>
                        <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2">
                             <div className="w-4"></div>
                             <span>Medium icons</span>
                        </div>
                        <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2">
                             <div className="w-4"></div>
                             <span>Small icons</span>
                        </div>
                        <div className="border-t my-1 opacity-50"></div>
                        <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2">
                             <i className="fas fa-check text-[10px] w-4"></i>
                             <span>Auto arrange icons</span>
                        </div>
                    </div>
                )}
            </div>

            <div 
                className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-default flex justify-between items-center group relative"
                onMouseEnter={() => setContextMenu(prev => ({ ...prev, submenu: 'sort' }))}
            >
                <div className="flex items-center gap-2">
                    <i className="fas fa-sort-amount-down w-4"></i>
                    <span>Sort by</span>
                </div>
                <i className="fas fa-chevron-right text-[10px] opacity-50 group-hover:opacity-100"></i>
                
                {contextMenu.submenu === 'sort' && (
                    <div className="absolute left-full top-0 ml-[1px] bg-white/95 backdrop-blur shadow-xl border border-gray-300 rounded-sm py-1 w-40 text-gray-800">
                        <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white">Name</div>
                        <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white">Size</div>
                        <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white">Item type</div>
                        <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white">Date modified</div>
                    </div>
                )}
            </div>

            <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-default flex items-center gap-2" onClick={handleRefresh}>
                <i className="fas fa-sync-alt w-4"></i>
                <span>Refresh</span>
            </div>
            
            <div className="border-t my-1 opacity-50"></div>
            
            <div className="px-3 py-1.5 text-gray-400 cursor-default flex items-center gap-2">
                <i className="fas fa-paste w-4"></i>
                <span>Paste</span>
            </div>
            <div className="px-3 py-1.5 text-gray-400 cursor-default flex items-center gap-2">
                <i className="fas fa-link w-4"></i>
                <span>Paste shortcut</span>
            </div>
            
            <div className="border-t my-1 opacity-50"></div>

            <div 
                className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-default flex justify-between items-center group relative"
                onMouseEnter={() => setContextMenu(prev => ({ ...prev, submenu: 'new' }))}
            >
                <div className="flex items-center gap-2">
                    <i className="fas fa-plus w-4"></i>
                    <span>New</span>
                </div>
                <i className="fas fa-chevron-right text-[10px] opacity-50 group-hover:opacity-100"></i>
                
                {contextMenu.submenu === 'new' && (
                    <div className="absolute left-full top-0 ml-[1px] bg-white/95 backdrop-blur shadow-xl border border-gray-300 rounded-sm py-1 w-48 text-gray-800">
                        <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2">
                             <i className="fas fa-folder text-yellow-500 w-4"></i>
                             <span>Folder</span>
                        </div>
                        <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2">
                             <i className="fas fa-link w-4"></i>
                             <span>Shortcut</span>
                        </div>
                        <div className="border-t my-1 opacity-50"></div>
                        <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2">
                             <i className="fas fa-file-alt text-gray-500 w-4"></i>
                             <span>Text Document</span>
                        </div>
                        <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2">
                             <i className="fas fa-palette text-pink-500 w-4"></i>
                             <span>Paint Drawing</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t my-1 opacity-50"></div>

            <div 
                className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-default flex items-center gap-2"
                onClick={() => {
                    launchApp('settings');
                    setContextMenu({ ...contextMenu, visible: false, submenu: null });
                }}
            >
                <i className="fas fa-desktop w-4 opacity-70"></i>
                <span>Display settings</span>
            </div>
            <div 
                className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-default flex items-center gap-2"
                onClick={() => {
                    launchApp('settings');
                    setContextMenu({ ...contextMenu, visible: false, submenu: null });
                }}
            >
                <i className="fas fa-paint-brush w-4 opacity-70"></i>
                <span>Personalize</span>
            </div>
        </div>
      )}

      <StartMenu />
      <Assistant />
      <Taskbar />
    </div>
  );
};

export default Desktop;