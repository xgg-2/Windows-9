import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '../../context/OSContext';
import { WALLPAPERS, APPS } from '../../constants';

// --- Reusable Components (Defined outside to prevent re-renders) ---

const SidebarItem = ({ 
    id, 
    icon, 
    label, 
    isActive, 
    onClick 
}: { 
    id: string, 
    icon: string, 
    label: string, 
    isActive: boolean, 
    onClick: (id: string) => void 
}) => (
    <div 
      onClick={() => onClick(id)}
      className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all mb-1 select-none group
          ${isActive ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-200 text-gray-700'}
      `}
    >
        <div className={`w-7 h-7 flex items-center justify-center rounded ${isActive ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-white'}`}>
             <i className={`fas ${icon} text-sm ${isActive ? 'text-white' : 'text-gray-500'}`}></i>
        </div>
        <span className="text-sm font-medium">{label}</span>
    </div>
);

const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: (val: boolean) => void }) => (
    <div 
      className={`relative inline-block w-11 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
      onClick={() => onChange(!checked)}
    >
        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}></span>
    </div>
);

const SettingSection = ({ title, icon, children }: { title: string, icon: string, children: React.ReactNode }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-100">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <i className={`fas ${icon} text-blue-600`}></i>
            </div>
            <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

// --- Main Component ---

const SettingsApp: React.FC = () => {
  const { setWallpaper, systemSettings, updateSystemSetting, wallpaper } = useOS();
  const [activeTab, setActiveTab] = useState('System');
  
  // Update State
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateStatus, setUpdateStatus] = useState("You're up to date");

  // Apps State
  const [appSearch, setAppSearch] = useState('');
  
  // Real Device State
  const [networkStats, setNetworkStats] = useState({ type: 'Unknown', speed: 0, rtt: 0, onLine: true });
  const [batteryInfo, setBatteryInfo] = useState<{ level: number, charging: boolean } | null>(null);
  const [hardwareInfo, setHardwareInfo] = useState({ cores: 0, platform: 'Unknown', userAgent: '' });

  // Bluetooth State
  const [isScanningBT, setIsScanningBT] = useState(false);
  const [btDevices, setBtDevices] = useState([
      { id: 1, name: 'MX Master 3', icon: 'fa-mouse', status: 'Connected' },
      { id: 2, name: 'WH-1000XM4', icon: 'fa-headphones', status: 'Paired' }
  ]);

  // Account State
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---

  useEffect(() => {
    // 1. Network Info
    const updateNetwork = () => {
        // @ts-ignore
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        setNetworkStats({
            type: conn ? conn.effectiveType : 'Unknown',
            speed: conn ? conn.downlink : 0,
            rtt: conn ? conn.rtt : 0,
            onLine: navigator.onLine
        });
    };
    updateNetwork();
    window.addEventListener('online', updateNetwork);
    window.addEventListener('offline', updateNetwork);
    // @ts-ignore
    if (navigator.connection) {
        // @ts-ignore
        navigator.connection.addEventListener('change', updateNetwork);
    }

    // 2. Battery Info
    // @ts-ignore
    if (navigator.getBattery) {
        // @ts-ignore
        navigator.getBattery().then(battery => {
            const updateBattery = () => {
                setBatteryInfo({
                    level: Math.round(battery.level * 100),
                    charging: battery.charging
                });
            };
            updateBattery();
            battery.addEventListener('levelchange', updateBattery);
            battery.addEventListener('chargingchange', updateBattery);
        });
    }

    // 3. Hardware Info
    setHardwareInfo({
        cores: navigator.hardwareConcurrency || 4,
        platform: navigator.platform || 'Unknown Device',
        userAgent: navigator.userAgent
    });

    return () => {
        window.removeEventListener('online', updateNetwork);
        window.removeEventListener('offline', updateNetwork);
    };
  }, []);

  // --- Handlers ---

  const handleCheckUpdate = () => {
      setCheckingUpdate(true);
      setUpdateStatus("Checking for updates...");
      setUpdateProgress(0);
      
      const interval = setInterval(() => {
          setUpdateProgress(prev => {
              if (prev >= 100) {
                  clearInterval(interval);
                  setCheckingUpdate(false);
                  setUpdateStatus("You're up to date");
                  return 100;
              }
              return prev + 10;
          });
      }, 300);
  };

  const playTestSound = () => {
      const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
      
      // Use system volume
      const vol = systemSettings.volume / 100;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
  };

  const scanBluetooth = () => {
      setIsScanningBT(true);
      setTimeout(() => {
          setIsScanningBT(false);
          if (btDevices.length < 4) {
              setBtDevices([...btDevices, { 
                  id: Date.now(), 
                  name: `Unknown Device ${Math.floor(Math.random()*100)}`, 
                  icon: 'fa-mobile-alt', 
                  status: 'Ready to pair' 
              }]);
          }
      }, 2000);
  };

  const handleProfilePic = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (ev) => setProfileImage(ev.target?.result as string);
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  return (
    <div className="flex h-full bg-[#f8f9fa] select-none font-sans overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-[#f0f3f6] p-4 flex flex-col border-r border-gray-200">
             <div className="flex items-center gap-3 mb-8 px-2 mt-2">
                 <div className="relative">
                    {profileImage ? (
                        <img src={profileImage} alt="Profile" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-sm">
                            {systemSettings.userName.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                 </div>
                 <div className="overflow-hidden">
                     <div className="text-sm font-bold text-gray-800 truncate">{systemSettings.userName}</div>
                     <div className="text-xs text-gray-500">Administrator</div>
                 </div>
             </div>
             
             <div className="mb-4">
                 <div className="relative">
                    <i className="fas fa-search absolute left-3 top-2.5 text-gray-400 text-xs"></i>
                    <input className="w-full bg-white border border-gray-200 rounded-md pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Find a setting" />
                 </div>
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                 <SidebarItem id="System" icon="fa-laptop" label="System" isActive={activeTab === 'System'} onClick={setActiveTab} />
                 <SidebarItem id="Bluetooth" icon="fa-bluetooth" label="Bluetooth & devices" isActive={activeTab === 'Bluetooth'} onClick={setActiveTab} />
                 <SidebarItem id="Network" icon="fa-wifi" label="Network & internet" isActive={activeTab === 'Network'} onClick={setActiveTab} />
                 <SidebarItem id="Personalization" icon="fa-paint-brush" label="Personalization" isActive={activeTab === 'Personalization'} onClick={setActiveTab} />
                 <SidebarItem id="Apps" icon="fa-th-large" label="Apps" isActive={activeTab === 'Apps'} onClick={setActiveTab} />
                 <SidebarItem id="Accounts" icon="fa-user-circle" label="Accounts" isActive={activeTab === 'Accounts'} onClick={setActiveTab} />
                 <SidebarItem id="Update" icon="fa-sync" label="Windows Update" isActive={activeTab === 'Update'} onClick={setActiveTab} />
             </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-8 overflow-y-auto h-full custom-scrollbar">
                <header className="mb-8">
                    <h1 className="text-3xl font-light text-gray-800">{activeTab}</h1>
                </header>

                <div className="max-w-3xl space-y-6 animate-popIn">

                {activeTab === 'System' && (
                    <>
                        <SettingSection title="Display" icon="fa-sun">
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-medium">Brightness</span>
                                        <span className="text-sm text-gray-500">{systemSettings.brightness}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="20" 
                                        max="100" 
                                        value={systemSettings.brightness} 
                                        onChange={(e) => updateSystemSetting('brightness', parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <div className="text-sm font-medium">Night light</div>
                                        <div className="text-xs text-gray-500">Use warmer colors to help block blue light</div>
                                    </div>
                                    <ToggleSwitch checked={systemSettings.nightLight} onChange={(val) => updateSystemSetting('nightLight', val)} />
                                </div>
                            </div>
                        </SettingSection>

                        <SettingSection title="Sound" icon="fa-volume-up">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium">Volume</span>
                                    <span className="text-sm text-gray-500">{systemSettings.volume}%</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <i className={`fas ${systemSettings.volume === 0 ? 'fa-volume-mute' : 'fa-volume-up'} text-gray-400 w-5`}></i>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        value={systemSettings.volume} 
                                        onChange={(e) => {
                                            updateSystemSetting('volume', parseInt(e.target.value));
                                        }}
                                        onMouseUp={playTestSound}
                                        onTouchEnd={playTestSound}
                                        className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                </div>
                                <button 
                                    onClick={playTestSound} 
                                    className="mt-4 text-xs font-medium text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded transition"
                                >
                                    <i className="fas fa-play mr-2"></i>Test Sound
                                </button>
                            </div>
                        </SettingSection>

                        <SettingSection title="Power & Battery" icon="fa-battery-half">
                            {batteryInfo ? (
                                <div className="flex items-center gap-6">
                                    <div className="relative w-16 h-8 border-2 border-gray-400 rounded-lg p-0.5">
                                        <div 
                                            className={`h-full rounded ${batteryInfo.level < 20 ? 'bg-red-500' : 'bg-green-500'}`} 
                                            style={{ width: `${batteryInfo.level}%` }}
                                        ></div>
                                        {batteryInfo.charging && <i className="fas fa-bolt absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-xs drop-shadow-md"></i>}
                                    </div>
                                    <div>
                                        <div className="text-2xl font-light">{batteryInfo.level}%</div>
                                        <div className="text-xs text-gray-500">
                                            {batteryInfo.charging ? 'Plugged in' : 'On battery'}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500">Battery information not available on this device.</div>
                            )}
                        </SettingSection>

                        <SettingSection title="Storage" icon="fa-hdd">
                             <div className="space-y-2">
                                 <div className="flex justify-between text-sm">
                                     <span>Local Disk (C:)</span>
                                     <span className="text-gray-500">210 GB used / 250 GB</span>
                                 </div>
                                 <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
                                     <div className="w-[60%] bg-blue-600 h-full" title="Apps"></div>
                                     <div className="w-[15%] bg-purple-500 h-full" title="Docs"></div>
                                     <div className="w-[10%] bg-orange-400 h-full" title="Temp"></div>
                                 </div>
                                 <div className="flex gap-4 text-xs mt-2">
                                     <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-600 rounded-full"></div>Apps</div>
                                     <div className="flex items-center gap-1"><div className="w-2 h-2 bg-purple-500 rounded-full"></div>Files</div>
                                     <div className="flex items-center gap-1"><div className="w-2 h-2 bg-orange-400 rounded-full"></div>System</div>
                                 </div>
                             </div>
                        </SettingSection>
                    </>
                )}

                {activeTab === 'Bluetooth' && (
                    <>
                        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <i className="fab fa-bluetooth-b text-blue-600 text-xl"></i>
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">Bluetooth</div>
                                    <div className="text-xs text-gray-500">Discoverable as "{systemSettings.userName}'s PC"</div>
                                </div>
                            </div>
                            <ToggleSwitch checked={systemSettings.bluetoothEnabled} onChange={(val) => updateSystemSetting('bluetoothEnabled', val)} />
                        </div>
                        
                        {systemSettings.bluetoothEnabled && (
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-4">
                                     <h3 className="font-medium text-gray-700">Devices</h3>
                                     <button 
                                        onClick={scanBluetooth}
                                        className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition flex items-center gap-2"
                                        disabled={isScanningBT}
                                     >
                                         {isScanningBT ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-plus"></i>}
                                         {isScanningBT ? 'Scanning...' : 'Add Device'}
                                     </button>
                                </div>
                                <div className="space-y-2">
                                    {btDevices.map(dev => (
                                        <div key={dev.id} className="flex items-center justify-between p-3 border border-gray-100 rounded hover:bg-gray-50 transition">
                                            <div className="flex items-center gap-4">
                                                <i className={`fas ${dev.icon} text-gray-400 text-lg w-6 text-center`}></i>
                                                <div>
                                                    <div className="text-sm font-medium">{dev.name}</div>
                                                    <div className="text-xs text-gray-400">{dev.status}</div>
                                                </div>
                                            </div>
                                            <button className="text-gray-400 hover:text-red-500 px-2"><i className="fas fa-ellipsis-v"></i></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'Network' && (
                    <>
                         <div className="bg-white border border-gray-200 rounded-lg p-6 text-center mb-4 relative overflow-hidden">
                             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
                             <i className={`fas ${networkStats.onLine ? 'fa-globe' : 'fa-globe-americas'} text-5xl mb-4 ${networkStats.onLine ? 'text-blue-600' : 'text-gray-300'}`}></i>
                             <h2 className="text-xl font-medium">{networkStats.onLine ? 'Connected' : 'Not Connected'}</h2>
                             <p className="text-sm text-gray-500 mb-6">{networkStats.onLine ? 'You are connected to the internet' : 'No internet access'}</p>
                             
                             <div className="grid grid-cols-3 gap-4 border-t pt-4">
                                 <div>
                                     <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Type</div>
                                     <div className="text-sm font-medium capitalize">{networkStats.type}</div>
                                 </div>
                                 <div>
                                     <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Speed</div>
                                     <div className="text-sm font-medium">{networkStats.speed} Mbps</div>
                                 </div>
                                 <div>
                                     <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Usage</div>
                                     <div className="text-sm font-medium text-blue-600">12.4 GB</div>
                                 </div>
                             </div>
                         </div>

                         <div className="bg-white border border-gray-200 rounded-lg divide-y">
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-600">
                                        <i className="fas fa-wifi"></i>
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">Wi-Fi</div>
                                        <div className="text-xs text-gray-500">Connect to known networks</div>
                                    </div>
                                </div>
                                <ToggleSwitch checked={systemSettings.wifiEnabled} onChange={(val) => updateSystemSetting('wifiEnabled', val)} />
                            </div>
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-600">
                                        <i className="fas fa-plane"></i>
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">Airplane mode</div>
                                        <div className="text-xs text-gray-500">Stop all wireless communication</div>
                                    </div>
                                </div>
                                <ToggleSwitch checked={!systemSettings.wifiEnabled && !systemSettings.bluetoothEnabled} onChange={(val) => {
                                    updateSystemSetting('wifiEnabled', !val);
                                    updateSystemSetting('bluetoothEnabled', !val);
                                }} />
                            </div>
                         </div>
                    </>
                )}

                {activeTab === 'Personalization' && (
                    <div className="space-y-6">
                        <SettingSection title="Wallpaper" icon="fa-image">
                            <div className="grid grid-cols-3 gap-3">
                                {WALLPAPERS.map((wp, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`aspect-video rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${wallpaper === wp.url ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-transparent hover:border-gray-300'}`}
                                        onClick={() => setWallpaper(wp.url)}
                                    >
                                        <img src={wp.url} alt={wp.name} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </SettingSection>

                        <SettingSection title="Theme & Color" icon="fa-palette">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium block mb-2">Taskbar Transparency</label>
                                    <div className="flex gap-2">
                                        {['#ffffff1a', '#0000004d', '#3b82f64d'].map(color => (
                                            <div 
                                                key={color}
                                                className={`w-10 h-10 rounded-full cursor-pointer border-2 ${(systemSettings as any).taskbarColor === color ? 'border-blue-500' : 'border-gray-200'}`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => updateSystemSetting('taskbarColor' as any, color)}
                                            ></div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-2 border-t">
                                    <div>
                                        <div className="text-sm font-medium">Dark Mode</div>
                                        <div className="text-xs text-gray-500">Switch between light and dark system themes</div>
                                    </div>
                                    <ToggleSwitch 
                                        checked={(systemSettings as any).theme === 'dark'} 
                                        onChange={(val) => updateSystemSetting('theme' as any, val ? 'dark' : 'light')} 
                                    />
                                </div>
                            </div>
                        </SettingSection>
                    </div>
                )}
                
                {activeTab === 'Apps' && (
                    <div className="space-y-4">
                         <div className="flex gap-2">
                             <div className="flex-1 relative">
                                 <i className="fas fa-search absolute left-3 top-2.5 text-gray-400 text-xs"></i>
                                 <input 
                                    className="w-full bg-white border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500" 
                                    placeholder="Search apps"
                                    value={appSearch}
                                    onChange={(e) => setAppSearch(e.target.value)}
                                />
                             </div>
                             <div className="bg-white border px-3 py-2 rounded-md text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-50">
                                 Filter by <i className="fas fa-chevron-down ml-1 text-xs"></i>
                             </div>
                         </div>

                         <div className="bg-white border rounded-lg divide-y">
                             {Object.values(APPS)
                                .filter(app => app.title.toLowerCase().includes(appSearch.toLowerCase()))
                                .map((app) => (
                                 <div key={app.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition group">
                                     <div className="flex items-center gap-4">
                                         <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${app.color} text-white shadow-sm`}>
                                             <i className={`fas ${app.icon}`}></i>
                                         </div>
                                         <div>
                                             <div className="font-medium text-sm text-gray-900">{app.title}</div>
                                             <div className="text-xs text-gray-500">1.0.0 • Microsoft Corporation</div>
                                         </div>
                                     </div>
                                     <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                         <button className="text-xs text-gray-600 hover:text-black mr-4 font-medium">Advanced options</button>
                                         <button className="text-xs text-gray-600 hover:text-red-600 font-medium">Uninstall</button>
                                     </div>
                                 </div>
                             ))}
                             {Object.values(APPS).filter(app => app.title.toLowerCase().includes(appSearch.toLowerCase())).length === 0 && (
                                 <div className="p-8 text-center text-gray-500 text-sm">No apps found</div>
                             )}
                         </div>
                    </div>
                )}

                {activeTab === 'Accounts' && (
                    <div className="space-y-4">
                         <div className="bg-white border rounded-lg p-6 flex items-center gap-6">
                             <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                 {profileImage ? (
                                    <img src={profileImage} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                                 ) : (
                                    <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                                        {systemSettings.userName.charAt(0).toUpperCase()}
                                    </div>
                                 )}
                                 <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                     <i className="fas fa-camera text-white"></i>
                                 </div>
                                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleProfilePic} />
                             </div>
                             
                             <div className="flex-1">
                                 <div className="flex items-center gap-2 mb-1">
                                     <input 
                                        type="text" 
                                        value={systemSettings.userName} 
                                        onChange={(e) => updateSystemSetting('userName', e.target.value)}
                                        className="text-2xl font-semibold bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500/20 rounded px-1 w-full"
                                     />
                                     <i className="fas fa-pen text-xs text-gray-400"></i>
                                 </div>
                                 <div className="text-sm text-gray-500 flex items-center gap-2">
                                     <span>Administrator</span>
                                     <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                     <span>Local Account</span>
                                 </div>
                             </div>
                         </div>

                         <div className="bg-white border rounded-lg divide-y">
                             <div className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                                 <div className="flex items-center gap-3">
                                     <i className="fas fa-key text-gray-400 w-5"></i>
                                     <span className="text-sm">Sign-in options</span>
                                 </div>
                                 <i className="fas fa-chevron-right text-xs text-gray-300"></i>
                             </div>
                             <div className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                                 <div className="flex items-center gap-3">
                                     <i className="fas fa-users text-gray-400 w-5"></i>
                                     <span className="text-sm">Family & other users</span>
                                 </div>
                                 <i className="fas fa-chevron-right text-xs text-gray-300"></i>
                             </div>
                         </div>
                    </div>
                )}

                {activeTab === 'Update' && (
                    <div className="bg-white border rounded-lg p-8 flex flex-col items-center text-center space-y-6">
                        <div className="relative">
                            <i className={`fas ${checkingUpdate ? 'fa-sync fa-spin text-blue-500' : 'fa-check-circle text-green-500'} text-6xl`}></i>
                        </div>
                        <div>
                            <h2 className="text-2xl font-medium">{updateStatus}</h2>
                            <p className="text-sm text-gray-500 mt-1">Last checked: Today, {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                        
                        {checkingUpdate && (
                            <div className="w-full max-w-xs h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${updateProgress}%` }}></div>
                            </div>
                        )}

                        <button 
                            onClick={handleCheckUpdate}
                            disabled={checkingUpdate}
                            className={`px-6 py-2 rounded-md font-medium transition-all ${checkingUpdate ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'}`}
                        >
                            Check for updates
                        </button>
                    </div>
                )}

                </div>
            </div>
        </div>
    </div>
  );
};

export default SettingsApp;
