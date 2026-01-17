# Windows 9 Professional

## Overview

A web-based operating system simulation that recreates a Windows-like desktop environment in the browser. The application features a complete window management system, taskbar, start menu, and multiple functional applications including a file explorer, browser, calculator, notepad, paint, terminal, and settings panel. Built as a single-page React application with no backend requirements.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6 for fast development and production builds
- **Styling**: Tailwind CSS loaded via CDN, with custom CSS animations for window effects
- **State Management**: React Context API (`OSContext`) for global OS state including windows, file system, and settings

### Component Structure
- **Desktop**: Main container managing wallpaper, desktop icons, and context menus
- **Window**: Draggable, resizable window component with title bar controls (minimize, maximize, close)
- **Taskbar**: System tray with clock, network/battery indicators, pinned apps, and notification flyouts
- **StartMenu**: Application launcher with user controls and power options
- **Apps**: Individual application components (Browser, Calculator, Notepad, PC/File Explorer, Settings, Terminal, Paint, SystemInfo, Worm game)

### Window Management
- Each window has unique instance ID, position, size, z-index tracking
- Windows support drag-to-move, resize from edges, minimize, maximize, and focus management
- State stored in `WindowState` interface with properties for position, dimensions, and display modes

### Virtual File System
- In-memory file system using `FileSystemItem` interface
- Supports folders and files with content
- Operations: read directory, read file, write file, make directory
- Initial structure mimics Windows with C:/Users/Admin paths

### Application Launch System
- Apps defined in `constants.ts` with preferred dimensions and icons
- `launchApp` function creates new window instances with unique IDs
- Apps can receive launch arguments (e.g., file paths for Notepad)

### Design Patterns
- **Provider Pattern**: OSContext wraps entire app for global state access
- **Component Composition**: Window component renders appropriate app based on `appId`
- **Controlled Components**: Form inputs in apps (calculator, notepad) managed through React state

## External Dependencies

### CDN Resources
- **Tailwind CSS**: Styling framework loaded from CDN
- **Font Awesome 6.4**: Icon library for all UI icons
- **Google Fonts**: Segoe UI font family

### NPM Packages
- `react` and `react-dom`: UI framework
- `vite`: Development server and build tool
- `@vitejs/plugin-react`: React plugin for Vite
- `typescript`: Type checking

### Browser APIs Used
- Battery Status API (for taskbar battery indicator)
- Network Information API (online/offline detection)
- Clipboard API (copy functionality in various apps)
- Canvas API (Paint app drawing)

### Optional Integration
- Gemini API key support configured in Vite for potential AI assistant features (referenced in environment config but not fully implemented in visible code)