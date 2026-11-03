# Catalyst Documentation Shortcuts

Catalyst Documentation Shortcuts is a lightweight Chrome extension for developers working in Catalyst/Brief environments. It helps you quickly open the right documentation for the current app or environment without manually searching for the correct link.

## What it does

When you click the extension icon, it inspects the active tab and builds relevant documentation URLs for the current environment. It supports:

- localhost/local development setups
- environment-specific app config lookups
- opening documentation in a new tab
- copying a documentation URL to the clipboard

This keeps the workflow fast and reduces time spent navigating between the app and docs.

## Tech stack

- Vue 3 with Composition API
- TypeScript
- Vite
- Chrome Manifest V3 extension APIs
- ESLint and Stylelint
- Bootstrap Icons
- Sharp for icon/favicon generation

## Prerequisites

- Node.js 18+
- npm
- Chrome or a Chromium-based browser

## Install

```bash
npm install
```

## Available npm scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Starts the Vite dev server. |
| `npm run type-check` | Runs TypeScript and Vue type checks with `vue-tsc`. |
| `npm run lint` | Runs ESLint across the project. |
| `npm run lint:fix` | Auto-fixes ESLint issues where possible. |
| `npm run build:icons` | Generates PNG icon assets from the SVG source. |
| `npm run build:favicon` | Generates favicon assets. |
| `npm run build:extension` | Runs type checks, generates icons/favicon, builds the extension, and prepares it for Chrome. |
| `npm run preview` | Serves the production build locally for previewing. |

## Run locally

### Development

```bash
npm run dev
```

### Build the extension

```bash
npm run build:extension
```

The output is generated in `dist-extension/`.

## Load in Chrome

1. Open `chrome://extensions/`
2. Enable Developer Mode
3. Click `Load unpacked`
4. Select the `dist-extension` folder in this project

## Project structure

```text
.
├── public/              # Extension assets and manifest
├── scripts/             # Icon/favicon and packaging scripts
├── src/                 # Vue app and extension logic
├── dist-extension/      # Built extension output
├── config.example.json  # Example config
├── eslint.config.js     # ESLint config
├── package.json         # Scripts and dependencies
├── README.md            # Project docs
├── vite.config.ts       # Vite config
├── tsconfig.json        # TypeScript config
├── stylelint.config.js  # Stylelint config
└── ...
```

## Notes

- This app is intentionally lightweight and focused on quick documentation access.
- It is designed to help developers move faster between an app and the relevant docs.
- Local config support is included so localhost setups can resolve environment-specific documentation links.

## License

This project is open source and available under the MIT License.
