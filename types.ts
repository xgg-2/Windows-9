export type AppId = 'pc' | 'browser' | 'calc' | 'notepad' | 'settings' | 'terminal' | 'paint' | 'sysinfo' | 'worm' | 'chrono';

export interface AppConfig {
  id: AppId;
  title: string;
  icon: string;
  color: string;
  preferredWidth?: number;
  preferredHeight?: number;
}

export interface WindowState {
  id: string; // Unique instance ID
  appId: AppId;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  launchArgs?: any; // e.g. { filePath: 'C:/Users/Admin/Documents/note.txt' }
}

export interface SystemSettings {
  wifiEnabled: boolean;
  bluetoothEnabled: boolean;
  nightLight: boolean;
  brightness: number; // 0-100
  volume: number; // 0-100
  userName: string;
  taskbarColor: string;
  theme: 'light' | 'dark';
}

// Virtual File System Types
export interface FileSystemItem {
  name: string;
  type: 'file' | 'folder';
  content?: string; // For files
  children?: FileSystemItem[]; // For folders
  parent?: FileSystemItem | null; // internal ref
}

export interface OSContextType {
  windows: WindowState[];
  activeWindowId: string | null;
  isStartMenuOpen: boolean;
  wallpaper: string;
  systemSettings: SystemSettings;
  fs: FileSystemItem[]; // Root of file system
  launchApp: (appId: AppId, args?: any) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  toggleMinimize: (id: string) => void;
  toggleMaximize: (id: string) => void;
  updateWindowSize: (id: string, newRect: Partial<WindowState>) => void;
  toggleStartMenu: () => void;
  closeStartMenu: () => void;
  setWallpaper: (url: string) => void;
  setSystemSettings: React.Dispatch<React.SetStateAction<SystemSettings>>;
  updateSystemSetting: <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => void;
  
  // File System Actions
  fsReadFile: (path: string) => string | null;
  fsWriteFile: (path: string, content: string) => void;
  fsMakeDir: (path: string) => void;
  fsReadDir: (path: string) => FileSystemItem[] | null;
  fsRename: (path: string, newName: string) => void;
  fsDelete: (path: string) => void;

  // Assistant
  isAssistantOpen: boolean;
  toggleAssistant: () => void;
}
