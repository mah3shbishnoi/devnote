# DevNote — Professional Developer Documentation Workspace

> A browser-native, local-first technical documentation IDE engineered for software developers, technical writers, and systems architects.

DevNote provides an information-dense, high-efficiency environment for creating, structuring, editing, previewing, and querying Markdown documentation entirely within the browser. Powered by native IndexedDB persistence and zero tracking, DevNote offers a distraction-free documentation experience that feels like an intentional desktop engineering tool.

---

## Features

* **Local-First Architecture:** Complete client-side persistence powered by browser IndexedDB. All documents, nested folders, and metadata survive page reloads and browser restarts without requiring an external backend.
* **Dual-Pane Synchronized Preview:** Live GitHub Flavored Markdown (GFM) rendering with code syntax highlighting, interactive task list toggles, and tables with automatic overflow containers.
* **Hierarchical File Explorer:** Nested folders and files with expand/collapse states, item count indicators, context menus, and inline creation.
* **Multi-Tab Document Workspace:** Manage multiple active files across tabs with unsaved dirty state indicators, quick close buttons, and keyboard navigation.
* **Fast In-Memory Full-Text Search (`⌘P` / `Ctrl+P`):** Real-time search indexing matching document titles and body content with contextual snippet excerpts.
* **Command Palette (`⌘K` / `Ctrl+K`):** Global command dispatcher supporting quick actions (file creation, folder operations, view mode toggling, theme switching, and exports) completely via keyboard.
* **Code Block Enhancements:** Syntax highlighting across major languages via Prism.js with uppercase language badge tags and 1-click clipboard copy buttons.
* **Document Management:** Full lifecycle support for creating, renaming, deleting (with confirmation safeguards), duplicating, and moving files between directories.
* **Import & Export:** Native text and code file import, single-file export, and structured ZIP workspace archive export.
* **Real-Time Document Telemetry:** Live line and column tracking, word count, character count, and estimated reading time.
* **Engineered Dark & Light Themes:** High-contrast, mature palettes tailored for technical documentation and developer environments.
* **Desktop-First Responsive Fallback:** Optimized for workstation productivity with clean responsive fallbacks that prevent broken layouts or horizontal overflows.

---

## Tech Stack

* **Structure:** Semantic HTML5
* **Styling:** Custom Vanilla CSS3 Design System (Custom properties, zero utility frameworks)
* **Logic:** Modern JavaScript (ES6+ Modules)
* **Persistence:** Native Browser IndexedDB (Transactional Object Stores) & LocalStorage (UI Preferences)
* **Markdown Engine:** Marked.js (GFM compliant)
* **Syntax Highlighting:** Prism.js (Custom dark & light theme styling)
* **Bundler & Dev Server:** Vite 6

---

## Architecture

DevNote is structured using modular, decoupled vanilla JavaScript modules with a unidirectional event-driven state architecture:

```
src/
├── core/
│   ├── state.js          # Central reactive state store & pub/sub event bus
│   ├── events.js         # Domain event constants
│   └── shortcuts.js      # Global keyboard shortcut dispatcher & platform detector
├── storage/
│   ├── db.js             # IndexedDB wrapper managing folders, documents, and migrations
│   ├── preferences.js    # LocalStorage manager for theme, view mode, and sidebar states
│   └── seeds.js          # Realistic technical documentation fixtures
├── components/
│   ├── navbar/           # Top bar breadcrumbs, search triggers, view modes, theme toggle
│   ├── sidebar/          # File tree, filter input, folder groups, context menus
│   ├── tabs/             # Multi-tab strip, active tab indicators, dirty tracking
│   ├── editor/           # Source Markdown editor, line numbers gutter, formatting toolbar
│   ├── preview/          # Marked pipeline, Prism highlighter, interactive task checkboxes
│   ├── palette/          # Fuzzy command palette modal (⌘K)
│   ├── search/           # Global full-text document query modal (⌘P)
│   ├── dialogs/          # Accessible confirm, prompt, and move modal dialogs
│   ├── statusbar/        # Real-time statistics, line/col, and sync status
│   ├── toast/            # Non-blocking notification service
│   └── mobile/           # Clean mobile fallback banner
├── utils/
│   ├── dom.js            # Safe DOM manipulation helpers
│   ├── icons.js          # Precision SVG icon definitions
│   ├── stats.js          # Word, character, and reading time algorithms
│   ├── export.js         # Single file & ZIP archive download triggers
│   └── import.js         # Client-side FileReader markdown import pipeline
└── styles/
    ├── tokens.css        # Palette tokens, radii, elevations, and layout dimensions
    ├── typography.css    # Monospace & interface font hierarchies
    ├── layout.css        # Application split-pane layout
    ├── editor.css        # Gutter synchronization & textarea styling
    ├── preview.css       # Rendered typography, tables, and syntax highlighting
    └── modals.css        # Palettes, dialogs, and shortcut cheat sheets
```

---

## Getting Started

### Prerequisites

* Node.js v18.0.0 or later
* npm v9.0.0 or later

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mah3shbishnoi/devnote.git
   cd devnote
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `⌘K` / `Ctrl+K` | Open Command Palette |
| `⌘P` / `Ctrl+P` | Quick Document & Content Search |
| `⌘N` / `Ctrl+N` | Create New Document |
| `⌘\` / `Ctrl+\` | Toggle Sidebar Visibility |
| `?` | Show Keyboard Shortcuts Cheat Sheet |
| `⌘B` / `Ctrl+B` | Bold Selection (`**text**`) |
| `⌘I` / `Ctrl+I` | Italic Selection (`*text*`) |
| `Tab` | Indent 2 Spaces / Indent Selection |
| `Shift + Tab` | Outdent Line / Outdent Selection |
| `Esc` | Dismiss Active Modal, Palette, or Context Menu |

---

## Future Improvements

* **Offline P2P Document Sharing:** WebRTC peer-to-peer workspace sync between local browsers without remote servers.
* **Vim Navigation Mode:** Optional modal editing keybindings (`hjkl`, normal/insert mode) in the source editor.
* **Mermaid Diagram Support:** Client-side parsing and rendering of architecture sequence and flowchart diagrams.
* **Document Version History:** Snapshot timeline diffs stored within IndexedDB object stores.
* **Encrypted Export:** AES-GCM password-protected workspace export archives.

---

## License

MIT License © 2025 Mahesh Bishnoi
