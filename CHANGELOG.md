# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-16

### Added

- Initial release of GM Deck
- Scene-specific tile management deck
- Tile visibility toggle with single click
- Visual status indicators for tiles:
  - Green border for visible tiles
  - Red border for hidden tiles
  - Yellow border for missing/deleted tiles
  - Status icons (eye/eye-slash) on each button
- Right-click context menu on tiles to add them to the deck
- Right-click deck buttons to remove items
- Draggable panel with persistent position (saved per client)
- Panel can be minimized by double-clicking the title bar
- Auto-opens when loading/switching scenes
- Toggle button in Token Controls to show/hide the panel
- Automatic cleanup of deleted tiles from the deck
- Configurable button size (32-64px)
- Configurable start state (collapsed/expanded)
- Macro support infrastructure (UI ready, execution functional)
- Public API for macro and module developers
- FoundryVTT v13 ApplicationV2 compatibility
- ES6 module architecture
- Localization support (English included)

### Technical Details

- Uses ApplicationV2 with HandlebarsApplicationMixin for modern Foundry v13 compatibility
- Scene flags for data storage (deck configurations are scene-specific)
- Client settings for UI preferences (position, button size)
- Hook-based architecture for tile updates and deletions
- Drag-and-drop support for tiles and macros onto the panel

### Known Limitations

- Macros section is visible but not yet fully integrated with macro directory
- No drag-to-reorder functionality for deck items yet
- Panel position is absolute (not responsive to window resize)

[1.0.0]: https://github.com/[your-username]/gm-deck/releases/tag/v1.0.0
