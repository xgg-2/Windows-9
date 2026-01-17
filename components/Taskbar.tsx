import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '../context/OSContext';
import { APPS } from '../constants';
import { AppId } from '../types';

const Taskbar: React.FC = () => {
  const { windows, activeWindowId, isStartMenuOpen, toggleStartMenu, focusWindow, toggleMinimize, launchApp, systemSettings, updateSystemSetting, isAssistantOpen, toggleAssistant } = useOS();
  const [time, setTime] = useState(new Date());
  
  // Flyout State: 'calendar', 'network', 'volume', 'battery', or null
  const [activeFlyout, setActiveFlyout] = useState<string | null>(null);
  
  // Calendar State
  const [viewDate, setViewDate] = useState(new Date());
  
  // Hardware Info - Default to simulated values if API fails so UI always shows
  const [battery, setBattery] = useState<{ level: number, charging: boolean }>({ level: 100, charging: true });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const flyoutRef = useRef<HTMLDivElement>(null);
  
  // Pinned Apps Configuration
  const pinnedAppIds: AppId[] = ['browser', 'pc', 'notepad', 'terminal', 'settings'];

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    // Network Listeners
    const updateOnline = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);

    // Battery API
    let battManager: any = null;
    const updateBattery = () => {
        if (battManager) {
            setBattery({ 
                level: battManager.level * 100, 
                charging: battManager.charging 
            });
        }
    };

    // Try to access Battery API
    if ('getBattery' in navigator) {
        // @ts-ignore
        navigator.getBattery().then((bm) => {
            battManager = bm;
            updateBattery();
            bm.addEventListener('levelchange', updateBattery);
            bm.addEventListener('chargingchange', updateBattery);
        }).catch(() => {
            // Fallback if promise fails
            console.log('Battery API not supported or blocked');
        });
    }

    return () => {
        clearInterval(timer);
        window.removeEventListener('online', updateOnline);
        window.removeEventListener('offline', updateOnline);
        if (battManager) {
            battManager.removeEventListener('levelchange', updateBattery);
            battManager.removeEventListener('chargingchange', updateBattery);
        }
    };
  }, []);

  useEffect(() => {
    if (isStartMenuOpen) setActiveFlyout(null);
  }, [isStartMenuOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
        // If we clicked inside the flyout, do nothing
        if (flyoutRef.current && flyoutRef.current.contains(e.target as Node)) {
            return;
        }
        // If we clicked on a system tray icon, do nothing (handled by icon's onClick)
        if ((e.target as Element).closest('.system-tray-icon')) {
            return;
        }
        // Otherwise close
        setActiveFlyout(null);
    };

    if (activeFlyout) {
        document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [activeFlyout]);

  const toggleFlyout = (name: string) => {
      setActiveFlyout(prev => {
          if (prev === name) return null;
          if (name === 'calendar') setViewDate(new Date());
          return name;
      });
  };

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const formatDate = (date: Date) => date.toLocaleDateString();

  const getBatteryIcon = () => {
      if (battery.charging && battery.level >= 100) return 'fa-plug';
      if (battery.charging) return 'fa-bolt'; // Charging indicator
      if (battery.level > 90) return 'fa-battery-full';
      if (battery.level > 60) return 'fa-battery-three-quarters';
      if (battery.level > 40) return 'fa-battery-half';
      if (battery.level > 10) return 'fa-battery-quarter';
      return 'fa-battery-empty';
  };

  // --- Calendar Logic ---
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  
  const generateCalendarDays = () => {
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      const daysInMonth = getDaysInMonth(year, month);
      const startDay = getFirstDayOfMonth(year, month);
      
      const days = [];
      // Empty slots
      for (let i = 0; i < startDay; i++) {
          days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
      }
      // Days
      for (let d = 1; d <= daysInMonth; d++) {
          const isToday = d === time.getDate() && month === time.getMonth() && year === time.getFullYear();
          days.push(
              <div 
                  key={d} 
                  className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 cursor-default border-2 border-transparent text-xs ${isToday ? 'bg-blue-600 border-blue-400 font-bold' : ''}`}
              >
                  {d}
              </div>
          );
      }
      return days;
  };

  const changeMonth = (delta: number) => {
      const newDate = new Date(viewDate);
      newDate.setMonth(newDate.getMonth() + delta);
      setViewDate(newDate);
  };
  
  // --- Taskbar Items Logic ---
  const handleAppClick = (appId: AppId) => {
      const appWindows = windows.filter(w => w.appId === appId);
      if (appWindows.length === 0) {
          launchApp(appId);
      } else if (appWindows.length === 1) {
          const w = appWindows[0];
          if (activeWindowId === w.id && !w.isMinimized) {
              toggleMinimize(w.id);
          } else {
              if (w.isMinimized) toggleMinimize(w.id);
              focusWindow(w.id);
          }
      } else {
          const activeInstance = appWindows.find(w => w.id === activeWindowId);
          if (activeInstance && !activeInstance.isMinimized) {
               toggleMinimize(activeInstance.id);
          } else {
               const target = appWindows[appWindows.length - 1];
               if (target.isMinimized) toggleMinimize(target.id);
               focusWindow(target.id);
          }
      }
  };

  const runningAppIds = windows.map(w => w.appId);
  const allTaskbarApps = Array.from(new Set([...pinnedAppIds, ...runningAppIds]));

  return (
    <>
    {/* CSS for custom range inputs */}
    <style>{`
        .taskbar-range {
            -webkit-appearance: none;
            width: 100%;
            height: 4px;
            border-radius: 2px;
            background: #4b5563;
            outline: none;
        }
        .taskbar-range::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 2px solid #1f2937;
        }
        .taskbar-range::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 2px solid #1f2937;
        }
    `}</style>

    {/* Flyouts Container - Anchored to bottom of screen above taskbar */}
    <div className="absolute inset-x-0 bottom-12 z-[5001] pointer-events-none flex justify-end px-2 text-white">
        <div ref={flyoutRef} className="pointer-events-auto relative">
            
            {/* Calendar Flyout */}
            {activeFlyout === 'calendar' && (
                <div className="absolute bottom-2 right-0 bg-[#1f1f1f]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl p-4 w-80 animate-slide-up origin-bottom-right">
                    <div className="mb-4 pl-2">
                        <div className="text-4xl font-light">{time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })}</div>
                        <div className="text-blue-400 text-sm">{time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                    <div className="border-t border-white/10 pt-4">
                        <div className="flex justify-between items-center mb-4 px-2">
                            <span className="font-semibold">{viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                            <div className="flex gap-4 text-gray-400">
                                <i className="fas fa-chevron-up cursor-pointer hover:text-white" onClick={() => changeMonth(-1)}></i>
                                <i className="fas fa-chevron-down cursor-pointer hover:text-white" onClick={() => changeMonth(1)}></i>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className="font-bold">{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center">
                            {generateCalendarDays()}
                        </div>
                    </div>
                </div>
            )}

            {/* Network Flyout */}
            {activeFlyout === 'network' && (
                <div className="absolute bottom-2 right-14 bg-[#1f1f1f]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl w-80 overflow-hidden animate-slide-up origin-bottom-right">
                    <div className="p-4 bg-black/20 border-b border-white/5">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold">Wi-Fi</span>
                            <div 
                                className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${systemSettings.wifiEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}
                                onClick={() => updateSystemSetting('wifiEnabled', !systemSettings.wifiEnabled)}
                            >
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 ${systemSettings.wifiEnabled ? 'left-6' : 'left-1'}`}></div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-bold">Airplane Mode</span>
                            <div 
                                className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${!systemSettings.wifiEnabled && !systemSettings.bluetoothEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}
                                onClick={() => {
                                    const newState = !(!systemSettings.wifiEnabled && !systemSettings.bluetoothEnabled);
                                    updateSystemSetting('wifiEnabled', !newState);
                                    updateSystemSetting('bluetoothEnabled', !newState);
                                }}
                            >
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 ${!systemSettings.wifiEnabled && !systemSettings.bluetoothEnabled ? 'left-6' : 'left-1'}`}></div>
                            </div>
                        </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2">
                        {systemSettings.wifiEnabled ? (
                            <>
                                <div className="flex items-center justify-between p-3 hover:bg-white/10 rounded cursor-pointer border-l-4 border-blue-500 bg-white/5">
                                    <div className="flex items-center gap-3">
                                        <i className="fas fa-wifi text-white"></i>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">Home Wi-Fi</span>
                                            <span className="text-[10px] text-gray-400">Connected, Secured</span>
                                        </div>
                                    </div>
                                    <button className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded border border-gray-600">Disconnect</button>
                                </div>
                                {['Office Network', 'Starbucks Wi-Fi', 'iPhone Hotspot', 'Guest Network'].map((net, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 hover:bg-white/10 rounded cursor-pointer border-l-4 border-transparent">
                                        <i className="fas fa-wifi text-gray-400"></i>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm text-gray-300">{net}</span>
                                            <span className="text-[10px] text-gray-500">Open</span>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                <i className="fas fa-wifi-slash text-3xl mb-2"></i>
                                <div>Wi-Fi is turned off</div>
                            </div>
                        )}
                    </div>
                    <div className="p-3 bg-black/20 border-t border-white/5 text-xs text-blue-400 hover:text-blue-300 cursor-pointer text-center">
                        Network & Internet settings
                    </div>
                </div>
            )}

            {/* Volume Flyout */}
            {activeFlyout === 'volume' && (
                <div className="absolute bottom-2 right-24 bg-[#1f1f1f]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl p-6 w-80 animate-slide-up origin-bottom-right">
                    <h3 className="text-sm font-semibold mb-4 text-gray-300">Speakers (Realtek High Definition Audio)</h3>
                    <div className="flex items-center gap-4">
                        <div 
                            className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 cursor-pointer"
                            onClick={() => updateSystemSetting('volume', systemSettings.volume === 0 ? 50 : 0)}
                        >
                            <i className={`fas ${systemSettings.volume === 0 ? 'fa-volume-mute' : systemSettings.volume < 50 ? 'fa-volume-down' : 'fa-volume-up'} text-xl`}></i>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={systemSettings.volume} 
                            onChange={(e) => updateSystemSetting('volume', parseInt(e.target.value))}
                            className="taskbar-range flex-1"
                        />
                        <span className="w-8 text-right font-mono">{systemSettings.volume}</span>
                    </div>
                </div>
            )}

            {/* Battery Flyout */}
            {activeFlyout === 'battery' && (
                <div className="absolute bottom-2 right-32 bg-[#1f1f1f]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl p-4 w-72 animate-slide-up origin-bottom-right">
                    <div className="flex items-center gap-4 mb-4">
                        <i className={`fas ${getBatteryIcon()} text-4xl text-gray-300`}></i>
                        <div>
                            <div className="text-2xl font-light">{Math.round(battery.level)}%</div>
                            <div className="text-xs text-gray-400">
                                {battery.charging ? 
                                    `Charging` : 
                                    `${Math.floor(battery.level * 0.8)} min remaining`
                                }
                            </div>
                        </div>
                    </div>
                    
                    {!battery.charging && (
                        <div className="mb-4">
                             <div className="flex justify-between text-xs text-gray-400 mb-1">
                                 <span>Best battery life</span>
                                 <span>Best performance</span>
                             </div>
                             <input type="range" min="0" max="3" step="1" defaultValue="1" className="taskbar-range" />
                        </div>
                    )}

                    <div className="flex items-center justify-between p-2 hover:bg-white/10 rounded cursor-pointer transition">
                        <div className="flex items-center gap-2">
                            <i className="fas fa-leaf text-green-400"></i>
                            <span className="text-sm">Battery saver</span>
                        </div>
                        <div className={`w-8 h-4 rounded-full relative ${battery.level < 20 ? 'bg-blue-600' : 'bg-gray-600'}`}>
                             <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${battery.level < 20 ? 'left-4.5' : 'left-0.5'}`}></div>
                        </div>
                    </div>
                    
                    <div className="mt-3 pt-2 border-t border-white/10 text-xs text-blue-400 hover:text-blue-300 cursor-pointer">
                        Battery settings
                    </div>
                </div>
            )}
        </div>
    </div>

    {/* Main Taskbar */}
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#141414]/90 backdrop-blur-xl border-t border-white/10 z-[5000] flex items-center px-1 select-none shadow-lg">
      
      {/* Start Button */}
      <button
        className={`h-[42px] w-[48px] flex items-center justify-center transition hover:bg-white/10 rounded-sm active:bg-white/20
          ${isStartMenuOpen ? 'bg-white/10' : ''}
        `}
        onClick={(e) => { e.stopPropagation(); toggleStartMenu(); }}
        title="Start"
      >
        <i className="fab fa-windows text-xl text-blue-400 drop-shadow-[0_0_2px_rgba(59,130,246,0.6)]"></i>
      </button>

      {/* Interactive Search Box */}
      <div 
        className="hidden sm:flex items-center bg-white/10 h-8 px-3 rounded-sm ml-2 w-64 border border-white/5 hover:bg-white/20 transition cursor-text group"
        onClick={() => toggleStartMenu()}
      >
        <i className="fas fa-search text-gray-400 text-xs mr-3 group-hover:text-white transition-colors"></i>
        <input
            type="text"
            placeholder="Type here to search"
            className="bg-transparent border-none outline-none text-white text-xs w-full placeholder-gray-400 cursor-pointer"
            readOnly
        />
      </div>

       {/* Assistant Button */}
       <button
        className={`hidden sm:flex h-[32px] w-[32px] ml-1 items-center justify-center transition hover:bg-white/10 rounded-sm active:bg-white/20 group relative overflow-hidden
          ${isAssistantOpen ? 'bg-white/10' : ''}
        `}
        onClick={(e) => { e.stopPropagation(); toggleAssistant(); }}
        title="Halo Intelligence"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <i className="fas fa-sparkles text-sm text-transparent bg-clip-text bg-gradient-to-tr from-blue-400 to-purple-400 drop-shadow-[0_0_2px_rgba(139,92,246,0.6)]"></i>
      </button>

      <div className="w-[1px] h-5 bg-white/20 mx-2 hidden sm:block"></div>

      {/* Taskbar Items (Pinned + Running) */}
      <div className="flex flex-1 gap-[2px] overflow-x-auto no-scrollbar">
        {allTaskbarApps.map((appId) => {
           const instances = windows.filter(w => w.appId === appId);
           const isOpen = instances.length > 0;
           const isActive = instances.some(w => w.id === activeWindowId && !w.isMinimized);
           
           return (
            <button
              key={appId}
              className={`
                group relative w-[42px] h-[40px] flex items-center justify-center rounded-sm transition
                ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}
              `}
              onClick={() => handleAppClick(appId)}
              title={APPS[appId]?.title}
            >
              <i className={`fas ${APPS[appId]?.icon} text-lg transition-transform active:scale-90 ${isActive ? 'text-white' : 'text-gray-300'}`}></i>
              {isOpen && (
                  <div className={`absolute bottom-0 left-1 right-1 h-[2px] rounded-full transition-all duration-300 ${isActive ? 'bg-blue-400 w-auto' : 'bg-gray-400 w-2 mx-auto group-hover:w-full'}`}></div>
              )}
            </button>
           );
        })}
      </div>

      {/* System Tray Icons */}
      <div className="flex items-center gap-1 text-white text-xs px-2 h-full">
        <div className="hidden sm:flex items-center gap-1 px-1">
            <i className="fas fa-chevron-up p-2 hover:bg-white/10 rounded cursor-pointer"></i>
        </div>
        
        {/* Battery Info (Always visible, real or sim) */}
        <div 
            className={`flex items-center gap-1 px-2 py-1 hover:bg-white/10 rounded cursor-pointer relative system-tray-icon ${activeFlyout === 'battery' ? 'bg-white/10' : ''}`}
            title={`${Math.round(battery.level)}%${battery.charging ? ' (Plugged in)' : ''}`}
            onClick={(e) => { e.stopPropagation(); toggleFlyout('battery'); }}
        >
            <i className={`fas ${getBatteryIcon()} ${battery.level <= 15 && !battery.charging ? 'text-red-500' : ''}`}></i>
            {battery.charging && battery.level < 100 && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <i className="fas fa-bolt text-[8px] text-yellow-300 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"></i>
                </div>
            )}
        </div>

        {/* Network Icon */}
        <div 
            className={`flex items-center gap-2 px-2 py-1 hover:bg-white/10 rounded cursor-pointer system-tray-icon ${activeFlyout === 'network' ? 'bg-white/10' : ''}`} 
            title={isOnline ? "Connected to Internet" : "No Internet Access"}
            onClick={(e) => { e.stopPropagation(); toggleFlyout('network'); }}
        >
             <i className={`fas ${isOnline ? 'fa-wifi' : 'fa-globe-americas'}`}></i>
             {!isOnline && <div className="absolute text-[8px] top-4 ml-2 text-white bg-red-600 rounded-full w-2 h-2 flex items-center justify-center">×</div>}
        </div>
        
        {/* Volume Icon */}
        <div 
            className={`flex items-center gap-2 px-2 py-1 hover:bg-white/10 rounded cursor-pointer system-tray-icon ${activeFlyout === 'volume' ? 'bg-white/10' : ''}`} 
            title={`Volume: ${systemSettings.volume}%`}
            onClick={(e) => { e.stopPropagation(); toggleFlyout('volume'); }}
        >
             {systemSettings.volume === 0 ? <i className="fas fa-volume-mute text-gray-400"></i> : 
              systemSettings.volume < 50 ? <i className="fas fa-volume-down"></i> : 
              <i className="fas fa-volume-up"></i>}
        </div>
        
        {/* Clock */}
        <div 
            className={`taskbar-clock flex flex-col items-end justify-center h-full px-2 py-1 hover:bg-white/10 rounded cursor-default min-w-[70px] ml-1 transition system-tray-icon ${activeFlyout === 'calendar' ? 'bg-white/10' : ''}`}
            onClick={(e) => { e.stopPropagation(); toggleFlyout('calendar'); }}
        >
          <div className="font-semibold leading-none mb-[2px]">{formatTime(time)}</div>
          <div className="text-[10px] leading-none text-gray-300">{formatDate(time)}</div>
        </div>
        
        <div className="w-1 h-full ml-1 border-l border-white/20 cursor-pointer hover:bg-white/10" title="Show Desktop"></div>
      </div>
    </div>
    </>
  );
};

export default Taskbar;