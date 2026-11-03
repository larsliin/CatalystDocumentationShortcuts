# Catalyst Documentation Shortcuts - Chrome Extension

A lightweight Chrome extension that generates quick links to documentation websites based on the current domain URL. Click the extension button to open documentation links with a single click or copy them to your clipboard.

## 🎯 Features

- **Vue 3 Popup UI** - Modern, reactive interface built with Vue 3 Composition API
- **Quick Documentation Links** - One-click access to relevant documentation
- **Copy Links** - Copy documentation URLs directly to clipboard
- **Open in New Tab** - Open documentation in a new Chrome tab
- **Hardcoded Link Management** - Simple, fast link access without external data
- **Bootstrap Icons** - Icon library for UI elements
- **TypeScript Support** - Full type safety with TypeScript
- **Vite Build System** - Fast development and production builds with icon and favicon generation
- **Dark/Light Theme Support** - Consistent styling with theme variables

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Chrome browser
- npm

### Installation & Build

```bash
# Install dependencies
npm install

# Build the extension
npm run build:extension
```

### Loading in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer Mode** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select the `dist-extension` folder from the project directory
5. The extension is now installed and ready to use!

## 📁 Project Structure

```
CatalystDocsumentationShortcuts/
├── src/
│   ├── Popup.vue                    # Main Vue popup component
│   ├── components/
│   │   ├── bascomponents/           # Reusable base components
│   │   │   ├── BaseAlert.vue        # Alert component
│   │   │   ├── BaseButton.vue       # Button component
│   │   │   ├── BaseCheckbox.vue     # Checkbox component
│   │   │   └── BaseFeedbackBadge.vue # Feedback badge
│   ├── composables/                 # Reusable logic
│   ├── utils/                       # Utility functions
│   ├── assets/                      # Static assets
│   ├── popup.js                     # Popup entry point
│   ├── background.js                # Service Worker
│   ├── content.js                   # Content script
│   ├── main.js                      # Vue app initialization
│   ├── style.css                    # Global styles
│   └── env.d.ts                     # TypeScript environment definitions
├── public/
│   ├── manifest.json                # Extension configuration (Manifest v3)
│   ├── popup.html                   # Popup HTML
│   ├── popup-init.js                # Popup initialization
│   ├── icons/                       # Extension icons (16, 48, 128px)
│   ├── icons.svg                    # SVG icon source
│   ├── favicon.png                  # Favicon
│   └── favicon.svg                  # Favicon SVG
├── scripts/
│   ├── prepare-extension.js         # Post-build extension setup
│   ├── convert-icons.js             # SVG to PNG icon conversion
│   └── generate-favicon.js          # Favicon generation
├── dist-extension/                  # Build output (ready to load in Chrome)
├── vite.config.ts                   # Vite configuration
├── tsconfig.json                    # TypeScript configuration
├── eslint.config.js                 # ESLint configuration
├── stylelint.config.js              # Stylelint configuration
└── package.json                     # Project dependencies and scripts
```

## 📜 npm Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite development server (http://localhost:9001) |
| `npm run type-check` | Run TypeScript type checking |
| `npm run lint` | Run ESLint on all source files |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run build:icons` | Convert SVG icons to PNG (16, 48, 128px) |
| `npm run build:favicon` | Generate favicon files from SVG |
| `npm run build:extension` | Complete build: type-check → lint-check → build icons/favicon → bundle with Vite → prepare extension |
| `npm run preview` | Preview production build locally |

## 🔧 How It Works

1. **Click Extension** - User clicks the Catalyst Documentation Shortcuts icon in the Chrome toolbar
2. **View Links** - Popup opens with hardcoded documentation links
3. **Access Documentation** - Choose how to access:
   - Click "Open Documentation" to open in a new tab
   - Click the copy icon to copy the link to clipboard
4. **Clipboard Ready** - Link is copied and ready to paste anywhere

## 🛠️ Tech Stack

### Frontend
- **Vue 3** - Latest with Composition API and `<script setup>` syntax
- **TypeScript** - Full type safety across the codebase
- **Bootstrap Icons** - Icon library for UI elements

### Build & Tooling
- **Vite 8** - Lightning-fast bundling with optimized output
- **ESLint** - Code quality with Vue 3, TypeScript, and stylistic rules
- **Stylelint** - CSS linting for style consistency
- **Vue TSC** - TypeScript type checking for Vue components
- **Sharp** - Image processing for icon and favicon generation

### Extension APIs
- **Manifest v3** - Latest Chrome extension platform
- **Tabs API** - Open documentation in new tabs
- **Clipboard API** - Clipboard write access
- **Scripting API** - Content script management
- **Active Tab API** - Current tab access

## 📝 Development Guide

### Making Changes

1. Edit files in `src/`
2. TypeScript types are checked automatically during build
3. Rebuild extension: `npm run build:extension`
4. Reload extension in Chrome (or enable auto-reload in developer mode)
5. Test the updated extension

### Code Quality

Run linting before committing:
```bash
npm run lint:fix        # Auto-fix issues
npm run type-check      # Verify TypeScript
npm run build:extension # Full validation before build
```

### Adding Dependencies

- Only add packages to `package.json` when genuinely necessary
- Run `npm install` after modifying `package.json`
- Verify build completes successfully

## 🔐 Security & Privacy

- ✅ No external data transmission - all links are hardcoded
- ✅ No data persistence required - links are loaded on demand
- ✅ Offline capable - works without internet
- ✅ No analytics or tracking - complete privacy

## 📄 License

This project is open source and available under the MIT License.
