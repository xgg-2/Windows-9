import React from 'react';
import { useOS } from '../context/OSContext';
import { APPS } from '../constants';
import { AppId } from '../types';

const StartMenu: React.FC = () => {
  const { isStartMenuOpen, launchApp } = useOS();

  if (!isStartMenuOpen) return null;

  const appList: AppId[] = ['pc', 'browser', 'calc', 'notepad', 'settings', 'terminal', 'paint', 'sysinfo', 'worm'];

  return (
    <div
      className="absolute bottom-12 left-0 w-full sm:w-[650px] sm:h-[500px] bg-[#1f1f1f]/95 backdrop-blur-xl
        flex text-white z-[4999] shadow-[5px_0_25px_rgba(0,0,0,0.5)]
        origin-bottom-left animate-slide-up sm:rounded-tr-lg
        border-t border-r border-white/10
      "
      onClick={(e) => e.stopPropagation()}
      style={{ height: 'max(500px, 60vh)' }}
    >
      {/* Left Rail: User & Power */}
      <div className="w-12 bg-black/40 flex flex-col items-center py-4 gap-4 flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-xs font-bold text-black cursor-pointer hover:ring-2 ring-white/50 transition" title="User">U</div>
        <div className="flex-1"></div>
        <a href="https://github.com/xgg-2/windows-9" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 rounded-md transition text-gray-300 hover:text-white" title="GitHub Repository">
          <i className="fab fa-github"></i>
        </a>
        <button className="p-2 hover:bg-white/10 rounded-md transition text-gray-300 hover:text-white" title="Settings" onClick={() => launchApp('settings')}>
          <i className="fas fa-cog"></i>
        </button>
        <button className="p-2 hover:bg-[#e81123] rounded-md transition text-gray-300 hover:text-white mb-2" title="Power" onClick={() => window.location.reload()}>
          <i className="fas fa-power-off"></i>
        </button>
      </div>

      {/* Middle: App List */}
      <div className="w-64 bg-transparent p-4 overflow-y-auto custom-scrollbar border-r border-white/5 flex-shrink-0">
        <div className="text-xs font-bold text-gray-400 mb-4 pl-2">MOST USED</div>
        <div className="flex flex-col gap-1">
          {appList.map((id) => (
            <button
              key={id}
              className="flex items-center p-2 hover:bg-white/10 rounded text-left transition gap-3 group"
              onClick={() => launchApp(id)}
            >
              <div className={`${APPS[id].color} w-8 h-8 flex items-center justify-center rounded-sm shadow-sm`}>
                 <i className={`fas ${APPS[id].icon} text-white text-xs`}></i>
              </div>
              <span className="text-sm font-light">{APPS[id].title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Live Tiles */}
      <div className="flex-1 p-4 overflow-y-auto bg-black/20 custom-scrollbar">
        <div className="text-xs font-bold text-gray-400 mb-4">LIFE AT A GLANCE</div>
        <div className="grid grid-cols-2 gap-2">
          {appList.slice(0, 6).map((id) => (
            <button
              key={`tile-${id}`}
              className={`${APPS[id].color} p-3 h-24 flex flex-col justify-between cursor-pointer hover:opacity-90 active:scale-95 transition shadow-sm select-none ring-offset-2 ring-offset-black focus:ring-1`}
              onClick={() => launchApp(id)}
            >
              <i className={`fas ${APPS[id].icon} text-2xl self-start`}></i>
              <span className="text-xs font-semibold self-start">{APPS[id].title}</span>
            </button>
          ))}
          {/* Decorative dummy tiles */}
          <div className="bg-blue-800 p-3 h-24 flex flex-col justify-end">
             <span className="text-xs">Weather</span>
             <span className="text-lg font-bold">72° Sunny</span>
          </div>
           <div className="bg-red-700 p-3 h-24 flex flex-col justify-between">
             <i className="far fa-newspaper text-2xl"></i>
             <span className="text-xs">News</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartMenu;