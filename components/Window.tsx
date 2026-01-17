import React, { useState, useEffect, useRef } from 'react';
import { WindowState } from '../types';
import { useOS } from '../context/OSContext';
import { APPS } from '../constants';

// Import individual apps
import PCApp from './apps/PCApp';
import BrowserApp from './apps/BrowserApp';
import CalculatorApp from './apps/CalculatorApp';
import NotepadApp from './apps/NotepadApp';
import SettingsApp from './apps/SettingsApp';
import TerminalApp from './apps/TerminalApp';
import PaintApp from './apps/PaintApp';
import SystemInfoApp from './apps/SystemInfoApp';
import WormApp from './apps/WormApp';

interface WindowProps {
  windowState: WindowState;
}

const Window: React.FC<WindowProps> = ({ windowState }) => {
  const { activeWindowId, closeWindow, focusWindow, toggleMinimize, toggleMaximize, updateWindowSize } = useOS();
  const { id, appId, title, x, y, width, height, isMinimized, isMaximized, zIndex } = windowState;
  const config = APPS[appId];

  // Dragging State
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Resizing State
  const [isResizing, setIsResizing] = useState(false);
  const resizeDir = useRef<string | null>(null);
  const startResize = useRef({ x: 0, y: 0, w: 0, h: 0, mx: 0, my: 0 });

  // --- Title Bar Dragging ---
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (isMaximized || isResizing) return;
    
    // Check if clicked buttons
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;

    focusWindow(id);
    setIsDragging(true);

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    dragOffset.current = {
      x: clientX - x,
      y: clientY - y
    };
  };

  // --- Resizing ---
  const handleResizeStart = (e: React.MouseEvent, dir: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (isMaximized) return;
    
    focusWindow(id);
    setIsResizing(true);
    resizeDir.current = dir;
    startResize.current = { x, y, w: width, h: height, mx: e.clientX, my: e.clientY };
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;

      // Drag Window
      if (isDragging) {
        e.preventDefault();
        let newX = clientX - dragOffset.current.x;
        let newY = clientY - dragOffset.current.y;
        
        // Basic screen boundary (top only)
        if (newY < 0) newY = 0;
        
        updateWindowSize(id, { x: newX, y: newY });
      }

      // Resize Window
      if (isResizing && resizeDir.current) {
         e.preventDefault();
         const dx = clientX - startResize.current.mx;
         const dy = clientY - startResize.current.my;
         let { x, y, w, h } = startResize.current;
         const dir = resizeDir.current;
         
         const minW = 300;
         const minH = 200;

         if (dir.includes('e')) {
             w = Math.max(minW, startResize.current.w + dx);
         }
         if (dir.includes('s')) {
             h = Math.max(minH, startResize.current.h + dy);
         }
         if (dir.includes('w')) {
             const newW = Math.max(minW, startResize.current.w - dx);
             // Only update X if width actually changed (hit min width check)
             if (newW !== minW || startResize.current.w - dx > minW) {
                 x = startResize.current.x + (startResize.current.w - newW);
                 w = newW;
             }
         }
         if (dir.includes('n')) {
             const newH = Math.max(minH, startResize.current.h - dy);
             if (newH !== minH || startResize.current.h - dy > minH) {
                 y = startResize.current.y + (startResize.current.h - newH);
                 h = newH;
             }
         }

         updateWindowSize(id, { x, y, width: w, height: h });
      }
    };

    const handleUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      resizeDir.current = null;
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, isResizing, id, updateWindowSize]);

  if (isMinimized) return null;

  const renderAppContent = () => {
    switch (appId) {
      case 'pc': return <PCApp windowId={id} />;
      case 'browser': return <BrowserApp />;
      case 'calc': return <CalculatorApp />;
      case 'notepad': return <NotepadApp windowId={id} initFile={windowState.launchArgs?.file} />;
      case 'settings': return <SettingsApp />;
      case 'terminal': return <TerminalApp />;
      case 'paint': return <PaintApp />;
      case 'sysinfo': return <SystemInfoApp />;
      case 'worm': return <WormApp />;
      default: return <div className="p-4">Unknown App</div>;
    }
  };

  const style: React.CSSProperties = isMaximized
    ? { top: 0, left: 0, width: '100%', height: 'calc(100vh - 48px)', transform: 'none', borderRadius: 0 }
    : { top: y, left: x, width, height };

  return (
    <div
      className={`absolute flex flex-col bg-white/95 backdrop-blur-md shadow-2xl transition-shadow duration-200 border border-gray-400
        ${!isMaximized ? 'rounded-lg' : ''}
        ${activeWindowId === id ? 'shadow-blue-500/30 border-blue-400' : ''}
      `}
      style={{
        ...style,
        zIndex,
        animation: 'popIn 0.15s cubic-bezier(0.1, 0.9, 0.2, 1)'
      }}
      onMouseDown={() => focusWindow(id)}
      onTouchStart={() => focusWindow(id)}
    >
      {/* Resize Handles (Only when not maximized) */}
      {!isMaximized && (
          <>
            <div className="absolute top-0 left-0 w-2 h-full cursor-w-resize z-50" onMouseDown={(e) => handleResizeStart(e, 'w')}></div>
            <div className="absolute top-0 right-0 w-2 h-full cursor-e-resize z-50" onMouseDown={(e) => handleResizeStart(e, 'e')}></div>
            <div className="absolute top-0 left-0 w-full h-2 cursor-n-resize z-50" onMouseDown={(e) => handleResizeStart(e, 'n')}></div>
            <div className="absolute bottom-0 left-0 w-full h-2 cursor-s-resize z-50" onMouseDown={(e) => handleResizeStart(e, 's')}></div>
            <div className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-50" onMouseDown={(e) => handleResizeStart(e, 'nw')}></div>
            <div className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-50" onMouseDown={(e) => handleResizeStart(e, 'ne')}></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-50" onMouseDown={(e) => handleResizeStart(e, 'sw')}></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50" onMouseDown={(e) => handleResizeStart(e, 'se')}></div>
          </>
      )}

      {/* Title Bar */}
      <div
        className={`h-9 bg-[#f3f3f3] border-b border-gray-300 flex items-center justify-between px-3 select-none flex-shrink-0 ${!isMaximized ? 'rounded-t-lg' : ''}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        style={{ cursor: isMaximized ? 'default' : 'default' }}
      >
        <div className="flex items-center gap-2 pointer-events-none opacity-80 pl-1">
          <i className={`fas ${config.icon} text-xs text-blue-600`}></i>
          <span className="text-xs font-semibold text-gray-800">{title}</span>
        </div>
        <div className="flex h-full items-center gap-1 z-50">
          <button
            className="w-10 h-full flex items-center justify-center hover:bg-gray-300 transition"
            onClick={(e) => { e.stopPropagation(); toggleMinimize(id); }}
            title="Minimize"
          >
            <div className="w-2.5 h-0.5 bg-black"></div>
          </button>
          <button
            className="w-10 h-full flex items-center justify-center hover:bg-gray-300 transition"
            onClick={(e) => { e.stopPropagation(); toggleMaximize(id); }}
            title="Maximize"
          >
            {isMaximized ? (
               <i className="far fa-window-restore text-xs"></i>
            ) : (
                <div className="w-2.5 h-2.5 border border-black"></div>
            )}
          </button>
          <button
            className={`w-12 h-full flex items-center justify-center hover:bg-[#e81123] hover:text-white transition group ${!isMaximized ? 'rounded-tr-lg' : ''}`}
            onClick={(e) => { e.stopPropagation(); closeWindow(id); }}
            title="Close"
          >
            <i className="fas fa-times text-[17px] mt-[1px]"></i>
          </button>
        </div>
      </div>
      
      {/* App Body - Removed overflow-hidden to allow menus to popup over window borders */}
      <div className={`flex-1 relative bg-white overflow-auto ${!isMaximized ? 'rounded-b-lg' : ''}`}>
        {renderAppContent()}
      </div>
    </div>
  );
};

export default Window;