import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { AppId, OSContextType, WindowState, SystemSettings, FileSystemItem } from '../types';
import { APPS, WALLPAPER_URL } from '../constants';

const OSContext = createContext<OSContextType | undefined>(undefined);

export const useOS = () => {
  const context = useContext(OSContext);
  if (!context) {
    throw new Error('useOS must be used within an OSProvider');
  }
  return context;
};

// Initial File System
const INITIAL_FS: FileSystemItem[] = [
  {
    name: 'C:',
    type: 'folder',
    children: [
      {
        name: 'Users',
        type: 'folder',
        children: [
          {
            name: 'Admin',
            type: 'folder',
            children: [
              { name: 'Documents', type: 'folder', children: [
                { name: 'todo.txt', type: 'file', content: '1. Build OS\n2. Drink Coffee' },
                { name: 'project_ideas.txt', type: 'file', content: 'A web based OS simulation.' }
              ]},
              { name: 'Downloads', type: 'folder', children: [] },
              { name: 'Desktop', type: 'folder', children: [] },
              { name: 'Pictures', type: 'folder', children: [] },
              { name: 'welcome.txt', type: 'file', content: 'Welcome to Windows 9 Professional!' }
            ]
          }
        ]
      },
      {
        name: 'Windows',
        type: 'folder',
        children: []
      }
    ]
  },
  {
     name: 'D:',
     type: 'folder',
     children: []
  }
];

export const OSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [globalZIndex, setGlobalZIndex] = useState(100);
  const [wallpaper, setWallpaper] = useState(WALLPAPER_URL);
  
  // Load initial state from LocalStorage if available
  const [fs, setFs] = useState<FileSystemItem[]>(() => {
    const saved = localStorage.getItem('win9_fs');
    return saved ? JSON.parse(saved) : INITIAL_FS;
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('win9_settings');
    if (saved) return JSON.parse(saved);
    return {
        wifiEnabled: true,
        bluetoothEnabled: true,
        nightLight: false,
        brightness: 100,
        volume: 50,
        userName: 'Admin User',
        taskbarColor: '#ffffff1a',
        theme: 'light'
    };
  });

  // Persist FS to LocalStorage
  useEffect(() => {
    localStorage.setItem('win9_fs', JSON.stringify(fs));
  }, [fs]);

  // Persist Settings
  useEffect(() => {
    localStorage.setItem('win9_settings', JSON.stringify(systemSettings));
  }, [systemSettings]);

  // --- File System Helpers ---
  
  const getPathArray = (path: string) => {
     return path.split('/').filter(p => p && p !== 'root');
  };

  const findItem = (path: string): FileSystemItem | null => {
      const parts = getPathArray(path);
      let current: FileSystemItem[] | undefined = fs;
      let found: FileSystemItem | null = null;

      if (path === 'root') return { name: 'root', type: 'folder', children: fs };

      for (let i = 0; i < parts.length; i++) {
          if (!current) return null;
          const part = parts[i];
          found = current.find(item => item.name === part) || null;
          if (!found) return null;
          if (i < parts.length - 1) {
              if (found.type !== 'folder') return null;
              current = found.children;
          }
      }
      return found;
  };

  const fsReadFile = useCallback((path: string): string | null => {
      const item = findItem(path);
      return (item && item.type === 'file') ? (item.content || '') : null;
  }, [fs]);

  const fsReadDir = useCallback((path: string): FileSystemItem[] | null => {
      const item = findItem(path);
      return (item && item.type === 'folder') ? (item.children || []) : null;
  }, [fs]);

  const fsWriteFile = useCallback((path: string, content: string) => {
      setFs(prev => {
          const newFs = JSON.parse(JSON.stringify(prev));
          const parts = path.split('/').filter(p => p);
          const fileName = parts.pop();
          let current = newFs;
          
          for (const part of parts) {
              const folder = current.find((i: any) => i.name === part && i.type === 'folder');
              if (!folder) return prev;
              current = folder.children;
          }

          const existing = current.find((i: any) => i.name === fileName);
          if (existing) {
              existing.content = content;
          } else {
              current.push({ name: fileName, type: 'file', content });
          }
          return newFs;
      });
  }, []);

  const fsMakeDir = useCallback((path: string) => {
      setFs(prev => {
          const newFs = JSON.parse(JSON.stringify(prev));
          const parts = path.split('/').filter(p => p);
          const dirName = parts.pop();
          let current = newFs;

          for (const part of parts) {
              const folder = current.find((i: any) => i.name === part && i.type === 'folder');
              if (!folder) return prev;
              current = folder.children;
          }

          if (!current.find((i: any) => i.name === dirName)) {
              current.push({ name: dirName, type: 'folder', children: [] });
          }
          return newFs;
      });
  }, []);

  const fsRename = useCallback((path: string, newName: string) => {
    setFs(prev => {
        const newFs = JSON.parse(JSON.stringify(prev));
        const parts = path.split('/').filter(p => p);
        const oldName = parts.pop();
        let current = newFs;

        for (const part of parts) {
            const folder = current.find((i: any) => i.name === part && i.type === 'folder');
            if (!folder) return prev;
            current = folder.children;
        }

        const item = current.find((i: any) => i.name === oldName);
        if (item) item.name = newName;
        return newFs;
    });
  }, []);

  const fsDelete = useCallback((path: string) => {
    setFs(prev => {
        const newFs = JSON.parse(JSON.stringify(prev));
        const parts = path.split('/').filter(p => p);
        const itemName = parts.pop();
        let current = newFs;

        for (const part of parts) {
            const folder = current.find((i: any) => i.name === part && i.type === 'folder');
            if (!folder) return prev;
            current = folder.children;
        }

        const index = current.findIndex((i: any) => i.name === itemName);
        if (index !== -1) current.splice(index, 1);
        return newFs;
    });
  }, []);

  // --- Window Management ---

  const updateSystemSetting = useCallback(<K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
    setSystemSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const getNextZIndex = useCallback(() => {
    setGlobalZIndex((prev) => prev + 1);
    return globalZIndex + 1;
  }, [globalZIndex]);

  const focusWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: getNextZIndex(), isMinimized: false } : w))
    );
    setActiveWindowId(id);
    setIsStartMenuOpen(false);
  }, [getNextZIndex]);

  const launchApp = useCallback((appId: AppId, args?: any) => {
    if (!args) {
        const existingWindow = windows.find((w) => w.appId === appId && !w.launchArgs);
        if (existingWindow) {
          focusWindow(existingWindow.id);
          return;
        }
    }

    const appConfig = APPS[appId];
    const offset = windows.length * 30;
    const isMobile = window.innerWidth < 768;

    const newWindow: WindowState = {
      id: `${appId}-${Date.now()}`,
      appId,
      title: args?.fileName ? `${args.fileName} - ${appConfig.title}` : appConfig.title,
      x: isMobile ? 0 : 100 + (offset % 200),
      y: isMobile ? 0 : 50 + (offset % 200),
      width: isMobile ? window.innerWidth : (appConfig.preferredWidth || 600),
      height: isMobile ? window.innerHeight : (appConfig.preferredHeight || 400),
      isMinimized: false,
      isMaximized: isMobile,
      zIndex: getNextZIndex(),
      launchArgs: args
    };

    setWindows((prev) => [...prev, newWindow]);
    setActiveWindowId(newWindow.id);
    setIsStartMenuOpen(false);
  }, [windows, getNextZIndex, focusWindow]);

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  }, [activeWindowId]);

  const toggleMinimize = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        const newMinimized = !w.isMinimized;
        if (!newMinimized) {
            return { ...w, isMinimized: false, zIndex: getNextZIndex() };
        }
        return { ...w, isMinimized: true };
      })
    );
    if (activeWindowId === id) {
        setActiveWindowId(null);
    }
  }, [activeWindowId, getNextZIndex]);

  const toggleMaximize = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w))
    );
    focusWindow(id);
  }, [focusWindow]);

  const updateWindowSize = useCallback((id: string, newRect: Partial<WindowState>) => {
      setWindows(prev => prev.map(w => w.id === id ? { ...w, ...newRect } : w));
  }, []);

  const toggleStartMenu = useCallback(() => {
    setIsStartMenuOpen((prev) => !prev);
    setIsAssistantOpen(false);
  }, []);

  const closeStartMenu = useCallback(() => {
    setIsStartMenuOpen(false);
  }, []);
  
  const toggleAssistant = useCallback(() => {
    setIsAssistantOpen((prev) => !prev);
    setIsStartMenuOpen(false);
  }, []);

  return (
    <OSContext.Provider
      value={{
        windows,
        activeWindowId,
        isStartMenuOpen,
        wallpaper,
        systemSettings,
        fs,
        launchApp,
        closeWindow,
        focusWindow,
        toggleMinimize,
        toggleMaximize,
        updateWindowSize,
        toggleStartMenu,
        closeStartMenu,
        setWallpaper,
        setSystemSettings,
        updateSystemSetting,
        fsReadFile,
        fsWriteFile,
        fsMakeDir,
        fsReadDir,
        fsRename,
        fsDelete,
        isAssistantOpen,
        toggleAssistant
      }}
    >
      {children}
    </OSContext.Provider>
  );
};
