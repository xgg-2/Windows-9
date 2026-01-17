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
  const shortcuts: AppId[] = ['pc', 'browser', 'notepad', 'calc', 'settings', 'terminal', 'paint', 'sysinfo', 'worm'];
  
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, visible: true });
    closeStartMenu();
  };

  const handleDesktopClick = () => {
    if (contextMenu.visible) {
        setContextMenu({ ...contextMenu, visible: false });
    }
    closeStartMenu();
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-cover bg-center select-none transition-all duration-500"
      style={{ backgroundImage: `url(${wallpaper})` }}
      onClick={handleDesktopClick}
      onContextMenu={handleContextMenu}
    >
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
            className="w-[84px] py-2 flex flex-col items-center gap-1 rounded hover:bg-white/10 active:bg-white/20 border border-transparent hover:border-white/10 transition group text-shadow-sm focus:bg-white/20 focus:border-white/20 outline-none"
            onClick={(e) => { 
              e.stopPropagation();
              launchApp(id);
            }}
            // Support single touch for mobile
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
            className="absolute bg-white/95 backdrop-blur shadow-lg border border-gray-200 rounded py-1 z-[6000] w-48 text-sm text-gray-800"
            style={{ top: contextMenu.y, left: contextMenu.x }}
        >
            <div className="px-4 py-1 hover:bg-blue-100 cursor-pointer flex justify-between items-center">
                <span>View</span>
                <i className="fas fa-chevron-right text-[10px] text-gray-500"></i>
            </div>
            <div className="px-4 py-1 hover:bg-blue-100 cursor-pointer flex justify-between items-center">
                <span>Sort by</span>
                <i className="fas fa-chevron-right text-[10px] text-gray-500"></i>
            </div>
            <div className="px-4 py-1 hover:bg-blue-100 cursor-pointer" onClick={() => window.location.reload()}>Refresh</div>
            <div className="border-t my-1"></div>
            <div className="px-4 py-1 hover:bg-blue-100 cursor-pointer">Paste</div>
            <div className="px-4 py-1 hover:bg-blue-100 cursor-pointer text-gray-400">Paste shortcut</div>
            <div className="border-t my-1"></div>
            <div className="px-4 py-1 hover:bg-blue-100 cursor-pointer flex justify-between items-center">
                <span>New</span>
                <i className="fas fa-chevron-right text-[10px] text-gray-500"></i>
            </div>
            <div className="border-t my-1"></div>
            <div className="px-4 py-1 hover:bg-blue-100 cursor-pointer flex items-center gap-2">
                <i className="fas fa-desktop text-gray-500"></i>
                <span>Display settings</span>
            </div>
            <div 
                className="px-4 py-1 hover:bg-blue-100 cursor-pointer flex items-center gap-2"
                onClick={() => {
                    launchApp('settings');
                    setContextMenu({ ...contextMenu, visible: false });
                }}
            >
                <i className="fas fa-paint-brush text-gray-500"></i>
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