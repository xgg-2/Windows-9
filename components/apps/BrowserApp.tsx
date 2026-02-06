import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useOS } from '../../context/OSContext';

interface Tab {
  id: number;
  history: string[];
  currentIndex: number;
  title: string;
  loading: boolean;
  favicon?: string;
}

interface Bookmark {
    title: string;
    url: string;
    icon?: string;
}

interface HistoryItem {
    url: string;
    title: string;
    timestamp: Date;
}

interface DownloadItem {
    id: number;
    filename: string;
    totalSize: string;
    progress: number;
    status: 'Downloading' | 'Completed' | 'Cancelled';
}

const BrowserApp: React.FC = () => {
  const { systemSettings } = useOS();
  
  const [tabs, setTabs] = useState<Tab[]>([{ 
      id: 1, 
      history: ['browser://home'], 
      currentIndex: 0, 
      title: 'New Tab',
      loading: false
  }]);
  const [activeTabId, setActiveTabId] = useState(1);
  
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
      const saved = localStorage.getItem('browser_bookmarks');
      return saved ? JSON.parse(saved) : [
          { title: 'Wikipedia', url: 'https://www.wikipedia.org' },
          { title: 'Github', url: 'https://github.com' },
          { title: 'Bing', url: 'https://www.bing.com' }
      ];
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
      const saved = localStorage.getItem('browser_history');
      if (saved) {
          const parsed = JSON.parse(saved);
          return parsed.map((item: any) => ({ ...item, timestamp: new Date(item.timestamp) }));
      }
      return [];
  });

  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  
  const [urlInput, setUrlInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [iframeKey, setIframeKey] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const currentUrl = activeTab.history[activeTab.currentIndex];

  useEffect(() => {
      localStorage.setItem('browser_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
      localStorage.setItem('browser_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    setUrlInput(currentUrl.startsWith('browser://') ? '' : currentUrl);
    setShowSuggestions(false);
  }, [currentUrl, activeTabId]);

  useEffect(() => {
      const closeMenu = () => setShowMenu(false);
      if (showMenu) document.addEventListener('click', closeMenu);
      return () => document.removeEventListener('click', closeMenu);
  }, [showMenu]);

  const getFavicon = (url: string) => {
      if (url.startsWith('browser://')) return undefined;
      try {
          const domain = new URL(url).hostname;
          return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
      } catch {
          return undefined;
      }
  };

  const getTitleFromUrl = (url: string) => {
      if (url === 'browser://home') return 'New Tab';
      if (url === 'browser://history') return 'History';
      if (url === 'browser://bookmarks') return 'Bookmarks';
      if (url === 'browser://downloads') return 'Downloads';
      if (url === 'browser://settings') return 'Settings';
      if (url.startsWith('browser://search')) return `${url.split('q=')[1]?.split('&')[0] || 'Search'}`;
      try {
          return new URL(url).hostname;
      } catch {
          return url;
      }
  };

  const updateTab = (id: number, updates: Partial<Tab>) => {
      setTabs(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const navigateTo = useCallback((url: string) => {
      const title = getTitleFromUrl(url);
      const favicon = getFavicon(url);
      
      if (!url.startsWith('browser://')) {
          setHistory(prev => {
              const newHistory = [{ url, title, timestamp: new Date() }, ...prev];
              return newHistory.slice(0, 100); 
          });
      }

      setTabs(prev => {
          return prev.map(t => {
              if (t.id === activeTabId) {
                  const newHistory = t.history.slice(0, t.currentIndex + 1);
                  newHistory.push(url);
                  return {
                      ...t,
                      history: newHistory,
                      currentIndex: newHistory.length - 1,
                      loading: true,
                      title: title,
                      favicon: favicon
                  };
              }
              return t;
          });
      });
      
      setIframeKey(k => k + 1);
      setShowSuggestions(false);
      
      setTimeout(() => {
          updateTab(activeTabId, { loading: false });
      }, 1000);
  }, [activeTabId]);

  const performNavigate = (input: string) => {
      let target = input.trim();
      if (!target) return;
      
      const isUrl = (target.includes('.') && !target.includes(' ')) || 
                    target.startsWith('http://') || 
                    target.startsWith('https://') ||
                    target.startsWith('browser://') ||
                    target.startsWith('localhost');

      if (isUrl && !target.startsWith('?')) {
          if (!target.startsWith('http') && !target.startsWith('browser://')) {
              target = 'https://' + target;
          }
          navigateTo(target);
      } else {
          navigateTo(`browser://search?q=${encodeURIComponent(target)}`);
      }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setUrlInput(val);
      
      if (val.trim().length > 0) {
          const uniqueSuggestions = new Set<string>();
          bookmarks.forEach(b => {
              if (b.url.toLowerCase().includes(val.toLowerCase()) || b.title.toLowerCase().includes(val.toLowerCase())) {
                  uniqueSuggestions.add(b.url);
              }
          });
          history.slice(0, 50).forEach(h => {
              if (h.url.toLowerCase().includes(val.toLowerCase()) || h.title.toLowerCase().includes(val.toLowerCase())) {
                  uniqueSuggestions.add(h.url);
              }
          });
          setSuggestions(Array.from(uniqueSuggestions).slice(0, 6));
          setShowSuggestions(true);
      } else {
          setShowSuggestions(false);
      }
  };

  const handleGo = (e: React.FormEvent) => {
    e.preventDefault();
    performNavigate(urlInput);
  };

  const goBack = () => {
      if (activeTab.currentIndex > 0) {
          const prevUrl = activeTab.history[activeTab.currentIndex - 1];
          updateTab(activeTabId, { 
              currentIndex: activeTab.currentIndex - 1,
              title: getTitleFromUrl(prevUrl),
              favicon: getFavicon(prevUrl)
          });
      }
  };

  const goForward = () => {
      if (activeTab.currentIndex < activeTab.history.length - 1) {
          const nextUrl = activeTab.history[activeTab.currentIndex + 1];
          updateTab(activeTabId, { 
              currentIndex: activeTab.currentIndex + 1,
              title: getTitleFromUrl(nextUrl),
              favicon: getFavicon(nextUrl)
          });
      }
  };

  const refresh = () => {
      updateTab(activeTabId, { loading: true });
      setIframeKey(k => k + 1);
      setTimeout(() => updateTab(activeTabId, { loading: false }), 800);
  };

  const addTab = useCallback(() => {
    const newId = Date.now();
    const newTab: Tab = { 
        id: newId, 
        history: ['browser://home'], 
        currentIndex: 0, 
        title: 'New Tab',
        loading: false
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newId);
  }, []);

  const closeTab = useCallback((e: React.MouseEvent | KeyboardEvent, id: number) => {
    if (e.type === 'click') e.stopPropagation();
    
    setTabs(prev => {
        if (prev.length === 1) {
            return [{ 
                id: prev[0].id, 
                history: ['browser://home'], 
                currentIndex: 0, 
                title: 'New Tab',
                loading: false
            }];
        }
        
        const newTabs = prev.filter(t => t.id !== id);
        if (id === activeTabId) {
            setActiveTabId(newTabs[newTabs.length - 1].id);
        }
        return newTabs;
    });
  }, [activeTabId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        addTab();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault();
        closeTab(e, activeTabId);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        refresh();
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId, addTab, closeTab]);

  const toggleBookmark = () => {
      const isBookmarked = bookmarks.some(b => b.url === currentUrl);
      if (isBookmarked) {
          setBookmarks(prev => prev.filter(b => b.url !== currentUrl));
      } else {
          setBookmarks(prev => [...prev, { title: activeTab.title, url: currentUrl, icon: activeTab.favicon }]);
      }
  };

  const renderInternalPage = (type: string) => {
      if (type === 'home') {
          return (
            <div className="flex flex-col items-center h-full bg-[#f9f9f9] animate-popIn pt-32 md:pt-48 overflow-y-auto">
                <div className="mb-8 flex flex-col items-center select-none">
                    <i className="fab fa-edge text-6xl text-blue-600 mb-4 drop-shadow-md"></i>
                    <div className="text-2xl font-light text-gray-700">Browser</div>
                </div>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const val = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value;
                    performNavigate(val);
                }} className="w-full max-w-lg px-4 flex flex-col items-center relative z-10">
                    <div className="w-full flex items-center shadow-md border border-gray-200 rounded-full bg-white px-4 py-3 hover:shadow-lg transition-all focus-within:shadow-lg ring-offset-2 focus-within:ring-2 ring-blue-100 mb-6">
                        <i className="fas fa-search text-gray-400 mr-3"></i>
                        <input 
                            name="q"
                            className="flex-1 outline-none text-gray-700 placeholder-gray-400"
                            placeholder="Search the web or enter URL"
                            autoComplete="off"
                            autoFocus
                        />
                    </div>
                    
                    <div className="flex gap-4">
                        <button type="submit" className="px-6 py-2 bg-[#f8f9fa] border border-[#f8f9fa] hover:border-[#dadce0] hover:shadow-sm rounded text-sm text-[#3c4043] transition-all">
                            Google Search
                        </button>
                        <button 
                            type="button" 
                            className="px-6 py-2 bg-[#f8f9fa] border border-[#f8f9fa] hover:border-[#dadce0] hover:shadow-sm rounded text-sm text-[#3c4043] transition-all"
                            onClick={() => navigateTo('https://www.google.com/doodles')}
                        >
                            I'm Feeling Lucky
                        </button>
                    </div>
                </form>
                
                <div className="grid grid-cols-4 gap-6 mt-12">
                    {bookmarks.slice(0, 8).map((site, i) => (
                        <button 
                            key={i}
                            className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-white hover:shadow-md transition active:scale-95 w-24"
                            onClick={() => navigateTo(site.url)}
                        >
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-2xl text-gray-700 overflow-hidden">
                                {getFavicon(site.url) ? (
                                    <img src={getFavicon(site.url)} alt="" className="w-6 h-6" />
                                ) : (
                                    <i className="fas fa-globe"></i>
                                )}
                            </div>
                            <span className="text-xs text-gray-600 font-medium truncate w-full text-center">{site.title}</span>
                        </button>
                    ))}
                    <button 
                        className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-white hover:shadow-md transition active:scale-95 w-24"
                        onClick={() => navigateTo('browser://bookmarks')}
                    >
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl text-gray-500">
                            <i className="fas fa-plus"></i>
                        </div>
                        <span className="text-xs text-gray-600 font-medium">Add</span>
                    </button>
                </div>
            </div>
          );
      }

      if (type.startsWith('search')) {
          const query = decodeURIComponent(currentUrl.split('q=')[1]?.split('&')[0] || '');
          return (
            <div className="h-full bg-white overflow-y-auto p-8 animate-popIn">
                <div className="flex items-center gap-4 mb-6 border-b pb-4">
                    <div className="font-bold text-xl text-blue-600">Bing</div>
                    <div className="flex-1 bg-white border rounded-full px-4 py-2 shadow-sm flex items-center max-w-xl">
                        <span className="flex-1 text-gray-700">{query}</span>
                        <i className="fas fa-search text-gray-400 cursor-pointer hover:text-blue-500" onClick={() => performNavigate(query)}></i>
                    </div>
                </div>
                <div className="text-sm text-gray-500 mb-4">About {Math.floor(Math.random() * 1000000)} results (0.42 seconds)</div>
                
                <div className="flex flex-col gap-8 max-w-3xl">
                    <div className="group">
                        <div className="text-xs text-gray-500 mb-0.5">https://en.wikipedia.org/wiki/{query}</div>
                        <div className="text-xl text-[#1a0dab] hover:underline cursor-pointer mb-1 visited:text-[#609]" onClick={() => navigateTo(`https://en.wikipedia.org/wiki/${query}`)}>
                            {query} - Wikipedia
                        </div>
                        <div className="text-sm text-gray-600 leading-snug">
                            {query} is a search term you entered. Wikipedia is a free online encyclopedia, created and edited by volunteers around the world...
                        </div>
                    </div>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="group">
                            <div className="text-xs text-gray-500 mb-0.5">https://www.example.com/result-{i}</div>
                            <div className="text-xl text-[#1a0dab] hover:underline cursor-pointer mb-1 visited:text-[#609]" onClick={() => navigateTo(`https://example.com`)}>
                                Result {i} for {query}
                            </div>
                            <div className="text-sm text-gray-600 leading-snug">
                                This is a simulated search result description for {query}. It contains standard text to make the page look realistic.
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          );
      }

      if (type === 'history') {
          return (
            <div className="h-full bg-white overflow-y-auto p-8 animate-popIn max-w-4xl mx-auto">
                <h1 className="text-2xl font-semibold mb-6">History</h1>
                <div className="bg-white rounded-md shadow-sm border border-gray-200">
                    {history.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No history yet.</div>
                    ) : (
                        <div className="divide-y">
                            {history.map((h, i) => (
                                <div key={i} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                                    <div className="text-xs text-gray-400 w-24">{new Date(h.timestamp).toLocaleTimeString()}</div>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="font-medium truncate hover:underline cursor-pointer text-blue-600" onClick={() => navigateTo(h.url)}>{h.title}</div>
                                        <div className="text-xs text-gray-500 truncate">{h.url}</div>
                                    </div>
                                    <button className="text-gray-400 hover:text-red-500" onClick={() => setHistory(prev => prev.filter((_, idx) => idx !== i))}>
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <button onClick={() => setHistory([])} className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm font-medium">Clear browsing data</button>
            </div>
          );
      }

      if (type === 'bookmarks') {
          return (
            <div className="h-full bg-white overflow-y-auto p-8 animate-popIn max-w-4xl mx-auto">
                <h1 className="text-2xl font-semibold mb-6">Bookmarks</h1>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {bookmarks.map((b, i) => (
                        <div key={i} className="border rounded-lg p-4 hover:shadow-md transition bg-white flex items-center gap-3 cursor-pointer group" onClick={() => navigateTo(b.url)}>
                             <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center overflow-hidden">
                                {getFavicon(b.url) ? <img src={getFavicon(b.url)} alt="" className="w-5 h-5"/> : <i className="fas fa-globe text-gray-400"></i>}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <div className="font-medium truncate group-hover:text-blue-600">{b.title}</div>
                                <div className="text-xs text-gray-500 truncate">{b.url}</div>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-2" onClick={(e) => { e.stopPropagation(); setBookmarks(prev => prev.filter(bk => bk.url !== b.url)); }}>
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                    ))}
                 </div>
            </div>
          );
      }

      if (type === 'downloads') {
          return (
            <div className="h-full bg-white overflow-y-auto p-8 animate-popIn max-w-3xl mx-auto">
                <h1 className="text-2xl font-semibold mb-6">Downloads</h1>
                {downloads.length === 0 ? (
                    <div className="text-center text-gray-500 mt-12">
                        <i className="fas fa-download text-4xl mb-4 opacity-20"></i>
                        <p>No downloads yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {downloads.map(d => (
                            <div key={d.id} className="border rounded-lg p-4 flex gap-4 items-center">
                                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                                    <i className="fas fa-file"></i>
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium">{d.filename}</div>
                                    {d.status === 'Downloading' ? (
                                        <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${d.progress}%` }}></div>
                                        </div>
                                    ) : (
                                        <div className={`text-sm ${d.status === 'Completed' ? 'text-green-600' : 'text-red-600'}`}>
                                            {d.status} • {d.totalSize}
                                        </div>
                                    )}
                                </div>
                                {d.status === 'Downloading' && (
                                    <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                                        <i className="fas fa-times"></i>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                <button 
                    onClick={() => {
                        const newId = Date.now();
                        setDownloads(prev => [{ id: newId, filename: `Setup_Installer_${newId.toString().slice(-4)}.exe`, totalSize: '15.4 MB', progress: 0, status: 'Downloading' }, ...prev]);
                        let progress = 0;
                        const interval = setInterval(() => {
                            progress += 5;
                            setDownloads(prev => prev.map(d => d.id === newId ? { ...d, progress: Math.min(100, progress) } : d));
                            if (progress >= 100) {
                                clearInterval(interval);
                                setDownloads(prev => prev.map(d => d.id === newId ? { ...d, status: 'Completed' } : d));
                            }
                        }, 100);
                    }}
                    className="mt-8 text-sm text-gray-500 underline"
                >
                    Simulate a download
                </button>
            </div>
          );
      }

      if (type === 'settings') {
          return (
              <div className="h-full bg-[#f8f9fa] overflow-y-auto p-8 animate-popIn">
                  <div className="max-w-2xl mx-auto">
                      <h1 className="text-2xl font-semibold mb-6 text-gray-800">Settings</h1>
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y">
                          <div className="p-4 flex items-center justify-between">
                              <div>
                                  <div className="font-medium">Default Browser</div>
                                  <div className="text-sm text-gray-500">Make Browser your default browser</div>
                              </div>
                              <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Make Default</button>
                          </div>
                          <div className="p-4 flex items-center justify-between">
                              <div>
                                  <div className="font-medium">Appearance</div>
                                  <div className="text-sm text-gray-500">Theme, fonts, and zoom</div>
                              </div>
                              <i className="fas fa-chevron-right text-gray-400"></i>
                          </div>
                      </div>
                      <div className="mt-8 text-center text-xs text-gray-400">
                          Browser Version 102.0.5005.61 (Official Build) (64-bit)
                      </div>
                  </div>
              </div>
          );
      }

      return null;
  };

  const renderContent = () => {
    if (currentUrl.startsWith('browser://')) {
        const type = currentUrl.replace('browser://', '').split('?')[0];
        const internalPage = renderInternalPage(type);
        if (internalPage) return internalPage;
    }

    if (!systemSettings.wifiEnabled) {
         return (
            <div className="flex flex-col items-center justify-center h-full bg-[#f9f9f9] animate-popIn p-10 text-gray-700">
                <i className="fas fa-wifi-slash text-6xl text-gray-400 mb-6"></i>
                <div className="text-2xl font-medium mb-2">No Internet Connection</div>
                <div className="text-sm text-gray-500 text-center max-w-md mb-8">
                    Your computer is offline. Check your Wi-Fi settings in the Settings app.
                </div>
                <div className="bg-gray-200 rounded px-4 py-2 font-mono text-xs text-gray-600">
                    ERR_INTERNET_DISCONNECTED
                </div>
            </div>
         );
    }

    return (
        <div className="relative w-full h-full bg-white">
            <div className="absolute top-0 left-0 right-0 bg-[#fff3cd] border-b border-[#ffeeba] px-4 py-2 text-xs text-[#856404] flex justify-between items-center z-10">
                <span>If the site refuses to connect, it likely blocks embedding (X-Frame-Options).</span>
                <a href={currentUrl} target="_blank" rel="noreferrer" className="underline hover:text-black font-semibold">Open externally</a>
            </div>
            <iframe 
                key={iframeKey}
                src={currentUrl} 
                className="w-full h-full border-none pt-8"
                title="Content"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-presentation"
            />
        </div>
    );
  };

  const isBookmarked = bookmarks.some(b => b.url === currentUrl);

  return (
    <div className="flex flex-col h-full bg-[#dfe1e5] select-none font-sans" onClick={() => setShowSuggestions(false)}>
        <div className="flex items-end px-2 pt-2 gap-1 overflow-x-auto no-scrollbar pr-10">
            {tabs.map(tab => (
                <div 
                    key={tab.id}
                    className={`
                        group flex items-center min-w-[140px] max-w-[200px] h-8 px-3 text-xs rounded-t-lg cursor-default relative transition-colors duration-150
                        ${activeTabId === tab.id ? 'bg-white text-gray-800 shadow-[0_0_5px_rgba(0,0,0,0.1)] z-10' : 'bg-transparent text-gray-600 hover:bg-white/50'}
                    `}
                    onClick={() => setActiveTabId(tab.id)}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        if(tabs.length > 1) closeTab(e as any, tab.id);
                    }}
                >
                    {tab.loading ? (
                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2 flex-shrink-0"></div>
                    ) : (
                        tab.favicon ? 
                            <img src={tab.favicon} alt="" className="w-3.5 h-3.5 mr-2 opacity-80" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.querySelector('i')?.classList.remove('hidden'); }} /> 
                            : <i className={`fas fa-globe mr-2 text-[10px] ${activeTabId === tab.id ? 'text-blue-500' : 'text-gray-400'}`}></i>
                    )}
                    <span className="flex-1 truncate mr-2 select-none">{tab.title}</span>
                    <div 
                        className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-gray-200 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => closeTab(e, tab.id)}
                    >
                        <i className="fas fa-times text-[10px]"></i>
                    </div>
                </div>
            ))}
            <div 
                className="w-7 h-7 flex items-center justify-center hover:bg-gray-300 rounded-full cursor-pointer ml-1 transition-colors"
                onClick={addTab}
                title="New Tab (Ctrl+T)"
            >
                <i className="fas fa-plus text-xs text-gray-600"></i>
            </div>
        </div>

        <div className="h-10 bg-white border-b flex items-center px-2 gap-2 shadow-sm z-20 relative">
            <div className="flex gap-1">
                <button 
                    className={`w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition ${activeTab.currentIndex === 0 ? 'text-gray-300 cursor-default' : 'text-gray-600'}`}
                    onClick={goBack}
                    disabled={activeTab.currentIndex === 0}
                >
                    <i className="fas fa-arrow-left"></i>
                </button>
                <button 
                    className={`w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition ${activeTab.currentIndex === activeTab.history.length - 1 ? 'text-gray-300 cursor-default' : 'text-gray-600'}`}
                    onClick={goForward}
                    disabled={activeTab.currentIndex === activeTab.history.length - 1}
                >
                    <i className="fas fa-arrow-right"></i>
                </button>
                <button 
                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 transition"
                    onClick={refresh}
                    title="Refresh (Ctrl+R)"
                >
                    <i className={`fas ${activeTab.loading ? 'fa-times' : 'fa-rotate-right'} ${activeTab.loading ? 'text-red-500' : ''}`}></i>
                </button>
                <button 
                     className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 transition"
                     onClick={() => navigateTo('browser://home')}
                >
                     <i className="fas fa-home"></i>
                </button>
            </div>
            
            <form className="flex-1 flex relative" onSubmit={handleGo}>
                <div className={`flex-1 bg-[#f1f3f4] rounded-full px-4 text-sm flex items-center hover:shadow-inner h-7 transition-all focus-within:bg-white focus-within:shadow-md border border-transparent focus-within:border-blue-500 ${activeTab.loading ? 'ring-1 ring-blue-100' : ''} ${showSuggestions && suggestions.length > 0 ? 'rounded-b-none border-b-0' : ''}`}>
                    <i className={`fas ${currentUrl.startsWith('https') ? 'fa-lock text-green-600' : 'fa-info-circle text-gray-400'} mr-2 text-[10px]`}></i>
                    <input 
                        className="flex-1 outline-none bg-transparent text-gray-700 w-full placeholder-gray-500" 
                        value={urlInput}
                        onChange={handleInputChange}
                        onFocus={() => { if(urlInput) setShowSuggestions(true); }}
                        placeholder="Search web or enter URL"
                    />
                    <div className="flex items-center gap-1">
                        {urlInput && (
                            <i className="fas fa-times-circle text-gray-400 cursor-pointer hover:text-gray-600 text-xs mr-1" onClick={() => { setUrlInput(''); setShowSuggestions(false); }}></i>
                        )}
                        <i 
                            className={`far fa-star text-sm cursor-pointer hover:scale-110 transition ${isBookmarked ? 'text-blue-500 fas' : 'text-gray-400'}`}
                            onClick={toggleBookmark}
                        ></i>
                    </div>
                </div>

                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-lg border border-t-0 border-gray-200 z-50 py-2">
                        {suggestions.map((s, i) => (
                            <div 
                                key={i} 
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3 text-sm text-gray-700"
                                onClick={() => performNavigate(s)}
                            >
                                <i className="far fa-clock text-gray-400 text-xs"></i>
                                <span className="truncate">{s}</span>
                            </div>
                        ))}
                    </div>
                )}
            </form>

            <div className="relative">
                <div 
                    className={`w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 cursor-pointer ${showMenu ? 'bg-gray-200' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                >
                    <i className="fas fa-ellipsis-v"></i>
                </div>
                
                {showMenu && (
                    <div 
                        className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 text-gray-700 text-sm animate-popIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center" onClick={() => { addTab(); setShowMenu(false); }}>
                            <span>New tab</span>
                            <span className="text-gray-400 text-xs">Ctrl+T</span>
                        </div>
                        <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center">
                            <span>New window</span>
                            <span className="text-gray-400 text-xs">Ctrl+N</span>
                        </div>
                        <div className="border-t my-1"></div>
                        <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center" onClick={() => { navigateTo('browser://history'); setShowMenu(false); }}>
                            <span>History</span>
                            <span className="text-gray-400 text-xs">Ctrl+H</span>
                        </div>
                        <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center" onClick={() => { navigateTo('browser://downloads'); setShowMenu(false); }}>
                            <span>Downloads</span>
                            <span className="text-gray-400 text-xs">Ctrl+J</span>
                        </div>
                        <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center" onClick={() => { navigateTo('browser://bookmarks'); setShowMenu(false); }}>
                            <span>Bookmarks</span>
                            <span className="text-gray-400 text-xs">Ctrl+Shift+O</span>
                        </div>
                        <div className="border-t my-1"></div>
                        <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => { navigateTo('browser://settings'); setShowMenu(false); }}>
                            Settings
                        </div>
                        <div className="border-t my-1"></div>
                        <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Help</div>
                        <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Exit</div>
                    </div>
                )}
            </div>

            {activeTab.loading && (
                <div className="absolute bottom-[-1px] left-0 h-[2px] bg-blue-500 animate-[loading_1s_ease-in-out_infinite] w-full origin-left z-30"></div>
            )}
        </div>

        <div className="flex-1 bg-white relative overflow-hidden">
            {renderContent()}
        </div>
        
        <style>{`
            @keyframes loading {
                0% { transform: scaleX(0); transform-origin: left; }
                50% { transform: scaleX(0.5); }
                100% { transform: scaleX(1); transform-origin: right; opacity: 0; }
            }
        `}</style>
    </div>
  );
}

export default BrowserApp;

