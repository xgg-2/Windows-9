# Windows 9 Simulator — Elegant Desktop Experience

A technical, web-based simulator that recreates a desktop operating system experience inside the browser, blending classic desktop aesthetics with modern web architecture. This repository is a sandbox for UI/UX experimentation, architecture prototypes, and modular app design.

---

## Preview

![Windows 9 Simulator Preview 1](https://i.imgur.com/tXktLco.jpeg)  
![Windows 9 Simulator Preview 2](https://i.imgur.com/8UkfZTP.jpeg)  
![Windows 9 Simulator Preview 3](https://i.imgur.com/2regheZ.jpeg)

---

> IMPORTANT  
> Preliminary release: This project is early-stage and intended for experimental development and technical exploration.

---

## Quick Summary

Windows 9 Simulator is a modular, extensible environment that simulates desktop interactions (windows, taskbar, start menu, desktop icons) using modern web technologies. It aims to be a foundation for trying UI patterns, window management, and simulated OS behaviors.

---

## Key Features

- Retro-Modern UI: A deliberate mix of classic desktop cues with contemporary web design.
- Desktop Environment: Movable/resizable windows, a functional taskbar, start menu, and interactive desktop icons.
- Extensible Architecture: Plug-in style modules so new apps and utilities can be added easily.
- Responsive Core: Designed to simulate OS-like interactions across screen sizes and input types (mouse, keyboard, touch).

---

## Technology Stack (suggested)

- Runtime / Bundler: Node.js, Vite
- Frontend: HTML/CSS (Tailwind optional) + Vanilla JS or a framework (React, Svelte, Solid)
- State Management: Zustand / Redux / Pinia (depending on framework)
- Icons: Fluent UI / FontAwesome / SVG icon sets
- Persistence: IndexedDB (for simulated file system and saved desktop state)
- Testing: Playwright / Cypress (UI behavior & window management)

---

## Installation

1. Clone the repository:
```bash
git clone https://github.com/xgg-2/windows-9.git
cd windows-9
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run development server:
```bash
npm run dev
# or
yarn dev
```

Open your browser at: http://localhost:5173

---

## Design Recommendations — Elegant Windows 9 Theme

These actionable suggestions help unify the look and feel and make the simulator feel polished.

1. Color Palette (example)
   - Background / Primary dark: #0F172A
   - Window surface / Light background: #F4F6F8 / #FFFFFF
   - Accent / Fluent blue: #0078D7
   - Muted text / secondary: #6B7280
   - Shadow: rgba(2,6,23,0.08)

2. Typography
   - Prefer: "Segoe UI", "Inter", system-ui, -apple-system, "Helvetica Neue"
   - Scale: H1 28px, H2 20px, Body 14–16px
   - Use consistent spacing scale: 4 / 8 / 12 / 16 / 24

3. Window chrome & interactions
   - Titlebar: compact with small control buttons (minimize, maximize, close)
   - Window shadow and subtle blur for depth (backdrop-filter where available)
   - Smooth transitions: 150–200ms ease for drag, resize, open/close
   - Drag & drop feel: pointer-cursor, momentum-like easing for window movement

4. Taskbar & Start menu
   - Semi-transparent taskbar with slight blur
   - Center-left aligned system tray and clock
   - Start menu as a card/panel anchored to the taskbar with layered shadows

5. Icons & Imagery
   - Use SVG icons for crispness at any scale
   - App icons: rounded square masks with subtle inner shadow for a consistent silhouette
   - Favor flat, minimal glyphs with a single accent color for active states

6. Accessibility
   - Maintain contrast ratios >= 4.5:1 for body text
   - Keyboard navigation for window focus, switch (Alt/Cmd+Tab), and shortcuts
   - aria-labels and role semantics for interactive elements

---

## Design Tokens (example)

Include a small tokens file in the repo to centralize colors, spacing, and typography.

CSS variables (place in src/styles/variables.css):
```css
:root{
  --bg-900: #0F172A;
  --surface-100: #F4F6F8;
  --accent-500: #0078D7;
  --muted-400: #6B7280;
  --shadow-1: 0 8px 24px rgba(2,6,23,0.08);

  --font-sans: "Segoe UI", Inter, system-ui, -apple-system, "Helvetica Neue";
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
}
```

JSON tokens (for design systems / tooling):
```json
{
  "color": {
    "background": "#0F172A",
    "surface": "#F4F6F8",
    "accent": "#0078D7",
    "muted": "#6B7280"
  },
  "spacing": {
    "xs": 4,
    "sm": 8,
    "md": 16,
    "lg": 24
  },
  "typography": {
    "fontFamily": "Segoe UI, Inter, system-ui",
    "body": 16,
    "heading": 28
  }
}
```

---

## Recommended Component Breakdown

- Window Manager (z-index stacking, focus, restore/minimize/close)
- Taskbar (running apps, quick-launch, system tray)
- Start Menu (app launcher, search)
- Desktop Grid & Icons (context menu, shortcuts)
- App Shell (each app packaged with its own manifest and entry)
- Persistence Layer (IndexedDB or localStorage adapter)
- Theme Provider (light / dark / retro presets)

---

## Roadmap & Development Focus

- Window management: robust edge-snapping, tiling, and workspace support
- Simulated file system: IndexedDB-backed FS with simple API
- App API: messaging bus for apps to interact with system services
- Theming: runtime theme switching + saved user profiles
- Accessibility improvements and keyboard-first interactions

---

## Contributing

Contributions, issues, and PRs are welcome. Recommended workflow:
- Open an issue to discuss larger features before coding
- Follow existing code style or propose ESLint/Prettier configs
- Keep feature PRs focused and include screenshots or recordings for UI changes

---

## Limitations & Notes

- Some UI elements are placeholders and may not be fully interactive yet.
- Architecture is evolving; expect breaking changes as features are added.
- This project is intended as a learning and prototyping playground.

---

## License

Open-source — feel free to use, modify, and distribute for educational and development purposes.

---

Windows 9 Simulator — Exploring operating system design through modern web technologies
