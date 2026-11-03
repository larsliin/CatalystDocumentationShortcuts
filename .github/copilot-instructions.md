# Config Copier Chrome Extension

A Chrome extension that copies configuration data from downloaded config files to the clipboard when clicking the extension button in the toolbar.

## Purpose and scope

Build a lightweight Chrome extension that:
1. Detects when a config file is downloaded on the current webpage
2. Loads and parses the config file
3. Copies the configuration data to the clipboard when the user clicks the extension button
4. Provides clear feedback to the user about the operation

Keep the interface simple and focused. Do not add unrelated features like file viewing, editing, or web services unless explicitly requested.

## Stack and implementation

- **Frontend**: Vue 3 with Composition API and `<script setup>` syntax
- **Build tool**: Vite for bundling the extension
- **Extension structure**:
  - `Popup.vue` - UI shown when clicking the extension button
  - `popup.js` - Popup entry point
  - `background.js` - Service Worker managing config retrieval and clipboard operations
  - `content.js` - Content script running on webpages
  - `manifest.json` - Chrome extension configuration
  - `public/` - Static assets including icons and popup HTML
- Keep Vue component files under 500 lines; split into smaller focused components if needed
- Use the existing Vite setup and npm scripts; add dependencies only when necessary

## Config file handling

- Config files are downloaded via the browser's default download mechanism
- Support JSON format by default
- Parse config files safely and handle parse errors gracefully
- Store config in Chrome storage API (chrome.storage.local)
- Retrieve config when the popup is opened
- Copy config as a formatted string to the clipboard

## Popup UI and interaction

- Display the current config data in a readable format
- Show a "Copy to Clipboard" button that copies the full config
- Provide clear success/error feedback messages
- Display loading states while retrieving config
- Handle cases where no config has been loaded yet

## Browser API usage

- Use `chrome.storage.local` for persisting config data
- Use `chrome.downloads` API to detect and monitor downloaded files
- Use the Clipboard API to copy data to clipboard
- Ensure proper permissions in manifest.json for all required APIs

## Building and testing

- Build the extension with `npm run build:extension`
- The build output is in `dist-extension/` directory
- Load the extension in Chrome by going to `chrome://extensions/`, enabling Developer Mode, and clicking "Load unpacked"
- Test the complete workflow: file download → popup click → clipboard copy

### Git: never commit or push without permission

If multiple files have been edited, first ask: "Should the files be committed as one commit or in related commits?"

**Never** run `git commit` or `git push` (or any equivalent) on your own — not even when you have permission to execute commands without confirmation. Always ask the user first and wait for an explicit "yes" before committing or pushing. This applies to every branch, every change, and every situation, no exceptions.

Do not ask the user to provide or approve a commit message. Infer a concise, appropriate commit message from the changes.

When asking for permission or gathering additional information needed for the commit:
- Use the `vscode_askQuestions` tool to present options and collect structured user input
- Offer predefined options for commit grouping, target branch, or push destination when applicable
- Clearly describe what will happen and why you need confirmation
- Wait for the user's response before proceeding with the git operation

After a commit is successfully created, the next action must be a `vscode_askQuestions` call asking whether to push the commit(s). Do not end the turn with a status-only message or run `git push` before receiving the user's answer. Use predefined yes/no options to make this as simple as possible, and only push after an explicit yes.

If a push to GitHub over HTTPS is blocked because Git is not authenticated:
- Ask the user to authenticate through Git Credential Manager.
- Run `git credential-manager github login` in an interactive terminal so the user can complete sign-in. If the agent's terminal cannot open interactive authentication, ask the user to run the command in their own terminal.
- Wait for authentication to complete before retrying the authorized push. Authentication does not replace the explicit permission required to push.
- Never ask the user to paste passwords or access tokens into chat or store them in repository files.

### NEVER auto-create documentation files

**CRITICAL RULE: Do NOT create .md documentation files during normal code editing.**

Copilot must **NEVER EVER** auto-generate documentation markdown files like:
- ❌ SETUP_SUMMARY.md
- ❌ BUILD_STATUS.md
- ❌ COMPONENT_STRUCTURE.md
- ❌ QUICK_START.md
- ❌ FINAL_SUMMARY.md
- ❌ INDEX.md
- ❌ COMPLETION_CHECKLIST.md
- ❌ Any other auto-generated .md files

**Why:** Auto-creating documentation files clutters the repository with noise and creates unnecessary commits.

**When to create documentation:**
- ✅ Only when the user **explicitly requests** it: "Create a guide for...", "Document this...", "Write a README...", etc.
- ✅ Never as a side-effect of fixing bugs or adding features
- ✅ The user will ask for documentation when they actually need it

**What to do instead:**
- Focus on the requested code changes
- Provide explanations in your response chat (don't put them in files)
- Let the user decide if documentation files are needed

