# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GM Deck is a FoundryVTT module that provides a scene-specific control panel for Game Masters. It allows GMs to quickly toggle tile visibility and execute macros through a customizable floating panel.

## Architecture

### Core Components

1. **main.js** - Module initialization and lifecycle management
   - Registers module settings (position, collapse state, button size)
   - Exposes public API at `game.modules.get('gm-deck').api`
   - Manages hooks for canvas/scene changes and tile updates
   - Creates new GMDeckApp instance on `canvasReady` hook
   - Only renders for GM users (`game.user.isGM`)

2. **gm-deck-app.js** - ApplicationV2 UI implementation
   - Extends `HandlebarsApplicationMixin(ApplicationV2)` (Foundry v13 pattern)
   - Manages panel rendering, positioning, and collapse state
   - Handles drag-and-drop for tiles and macros
   - Provides visual feedback for tile visibility states
   - Event handlers for item execution and context menu (removal)

3. **gm-deck-data.js** - Data persistence and business logic
   - All deck items stored in scene flags: `canvas.scene.getFlag('gm-deck', 'items')`
   - Each item has: `{id, name, icon, type, targetId}`
   - Supports two item types: 'tile-toggle' and 'macro'
   - Handles tile visibility toggling and macro execution
   - Validates items before adding (checks for duplicates, existence)

### Data Flow

- **Scene-Specific Storage**: Deck items are stored per-scene using scene flags, so each scene has its own independent deck configuration
- **Lifecycle**: On scene change (`canvasReady`), the app closes and recreates with the new scene's deck data
- **Tile References**: Tiles are referenced by document ID (not UUID), macros use full UUID
- **Cleanup**: When a tile is deleted from the scene (`deleteTile` hook), it's automatically removed from the deck

### UI Pattern

The module uses FoundryVTT v13's ApplicationV2 API:
- `static DEFAULT_OPTIONS` defines window configuration
- `static PARTS` defines template parts (single 'panel' part)
- `_prepareContext()` returns data for Handlebars template
- `_onRender()` called after rendering for DOM manipulation
- Private methods use `#method()` syntax

### Position System

Panel positioning uses CSS classes:
- Six position options: top-left, top-right, bottom-left, bottom-right, left-center, right-center
- CSS classes applied: `.pos-{position}` on `.gm-deck` element
- Uses fixed positioning with transforms for vertical centering

## Module API

External modules and macros can interact with GM Deck via:

```javascript
const api = game.modules.get('gm-deck').api;
api.getApp()           // Returns the GMDeckApp instance
api.refresh()          // Re-renders the panel
api.toggle()           // Toggles collapse state
api.addTile(tileId)    // Adds a tile to the deck
api.addMacro(macroUuid) // Adds a macro to the deck
api.removeItem(itemId)  // Removes an item from the deck
```

## Key Behaviors

- **GM-Only**: Module only activates for users with GM privileges
- **Scene-Specific**: Each scene maintains its own deck configuration
- **Auto-Cleanup**: Deleted tiles are automatically removed from the deck
- **Live Updates**: Panel re-renders when tiles are updated (visibility changes)
- **Duplicate Prevention**: Cannot add the same tile or macro twice to a deck
- **Visual Feedback**: Items show executing state briefly when clicked

## File Structure

```
gm-deck/
├── scripts/
│   ├── main.js           # Entry point, hooks, settings
│   ├── gm-deck-app.js    # ApplicationV2 UI
│   └── gm-deck-data.js   # Data management
├── templates/
│   └── gm-deck.hbs       # Handlebars template
├── styles/
│   └── gm-deck.css       # Complete styling
├── lang/
│   └── en.json           # Localization strings
└── module.json           # Foundry module manifest
```

## Development Notes

- **No Build Process**: This is a simple ES6 module with no build/compile step
- **FoundryVTT Version**: Requires v13+ (uses ApplicationV2)
- **Drag-and-Drop**: Accepts both Tile and Macro drops, handles multiple data formats
- **Item IDs**: Generated using `foundry.utils.randomID()`
- **Notifications**: Uses `ui.notifications` for user feedback
- **Dialogs**: Uses `foundry.applications.api.DialogV2.confirm()` for confirmations
