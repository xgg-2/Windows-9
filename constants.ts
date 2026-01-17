import { AppConfig, AppId } from './types';

export const APPS: Record<AppId, AppConfig> = {
  pc: {
    id: 'pc',
    title: 'This PC',
    icon: 'fa-desktop',
    color: 'bg-blue-600',
    preferredWidth: 900,
    preferredHeight: 600,
  },
  browser: {
    id: 'browser',
    title: 'Internet Explorer 12',
    icon: 'fa-globe',
    color: 'bg-cyan-600',
    preferredWidth: 1000,
    preferredHeight: 700,
  },
  calc: {
    id: 'calc',
    title: 'Calculator',
    icon: 'fa-calculator',
    color: 'bg-green-600',
    preferredWidth: 320,
    preferredHeight: 480,
  },
  notepad: {
    id: 'notepad',
    title: 'Notepad',
    icon: 'fa-file-alt',
    color: 'bg-gray-600',
    preferredWidth: 600,
    preferredHeight: 450,
  },
  settings: {
    id: 'settings',
    title: 'Settings',
    icon: 'fa-cog',
    color: 'bg-purple-600',
    preferredWidth: 900,
    preferredHeight: 650,
  },
  terminal: {
    id: 'terminal',
    title: 'Command Prompt',
    icon: 'fa-terminal',
    color: 'bg-gray-800',
    preferredWidth: 600,
    preferredHeight: 400,
  },
  paint: {
    id: 'paint',
    title: 'Paint',
    icon: 'fa-palette',
    color: 'bg-pink-600',
    preferredWidth: 800,
    preferredHeight: 600,
  },
  sysinfo: {
    id: 'sysinfo',
    title: 'System Info',
    icon: 'fa-info-circle',
    color: 'bg-teal-600',
    preferredWidth: 500,
    preferredHeight: 600,
  },
  worm: {
    id: 'worm',
    title: 'Worm',
    icon: 'fa-gamepad',
    color: 'bg-green-700',
    preferredWidth: 400,
    preferredHeight: 480,
  },
  vault: {
    id: 'vault',
    title: 'Mind Vault',
    icon: 'fa-user-shield',
    color: 'bg-neutral-800',
    preferredWidth: 400,
    preferredHeight: 500,
  }
};

export const WALLPAPER_URL = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';

export const WALLPAPERS = [
  { name: 'Mountains', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80' },
  { name: 'Abstract Blue', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80' },
  { name: 'City Night', url: 'https://images.unsplash.com/photo-1519501025264-658c15403220?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80' },
  { name: 'Dark Nebula', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80' },
  { name: 'Windows Classic', url: 'https://4kwallpapers.com/images/wallpapers/windows-xp-bliss-3840x2160-12046.jpg' }
];