# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2024-12-21

### Added

- **Additional Font Options**: Expanded font selection for text layers with 7 new Foundry VTT fonts:
  - Amiri (elegant serif font with Arabic origins)
  - Bruno Ace (bold, modern display font)
  - Courier (classic monospace typewriter font)
  - Modesto Condensed (condensed vintage display font)
  - Signika (rounded, friendly sans-serif)
  - Times (classic serif newspaper font)
  - All fonts are now sorted alphabetically for easier selection
- **Line Height Control for Text Layers**: Added line-height control for text layers
  - Adjustable from 0.5 to 5.0 in 0.1 increments
  - Default value of 1.0 (normal spacing)
  - Perfect for multi-line text to control spacing between lines
  - Allows for tight, condensed text (< 1.0) or spacious, airy text (> 1.0)

## [1.0.0] - 2024-12-20

### Added

#### GM Deck Panel
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

#### Cinematic Cut-in Overlays
- Full cinematic cut-in overlay system for JRPG/Visual Novel style character introductions
- 9 backdrop styles with unique visual designs:
  - **Diagonal Solid**: JRPG-style diagonal shape with solid customizable color (primary color only)
  - **Black Banner**: Horizontal black banner with fixed golden borders (no color customization)
  - **Checkered Pattern**: Diamond/checkered pattern with customizable colors (primary for pattern, secondary for background)
  - **Vertical Split**: Vertical gradient split blending primary color with dark (primary color only)
  - **Gradient Burst**: Radial gradient burst blending primary color with transparency (primary color only)
  - **Minimal Fade**: Semi-transparent fade with frosted glass blur effect (primary color only)
  - **Ornate Frame**: Decorative frame with inner glow and double border (primary color only)
  - **Corner Brackets**: Sci-fi tactical UI style corner brackets (primary and secondary colors)
  - **Angular Mask**: Advanced character masking with angular geometric shapes (character clipped within diagonal bars, primary and secondary colors)
- Color customization system:
  - Customize primary and/or secondary colors based on backdrop type
  - Intelligent UI that shows/hides color pickers based on selected backdrop
  - Primary-only backdrops show one color picker (Diagonal Solid, Vertical Split, etc.)
  - Dual-color backdrops show both pickers (Checkered Pattern, Corner Brackets, Angular Mask)
  - Black Banner has no color customization (always uses fixed colors)
  - Live color picker with real-time preview
  - Reset to defaults option
  - Colors stored per cut-in configuration
  - CSS variable-based implementation for performance
- Multi-layer text overlay system:
  - Add unlimited text layers with individual styling
  - 9 preset positions (Top/Middle/Bottom × Left/Center/Right)
  - Fine-tune positioning with X/Y pixel offsets
  - Custom font selection from available system fonts
  - Font size control (12-120px)
  - Text color picker
  - Optional background panels with custom colors
  - Drag-to-reorder layers
  - Collapsible layer editor for cleaner UI
- 5 entrance animation styles:
  - Slide Right (character and backdrop slide in from right)
  - Slide Left (character and backdrop slide in from left)
  - Fade (smooth opacity fade-in)
  - Zoom (scale up from center)
  - Diagonal Sweep (diagonal entrance from corner)
- Customizable animation timing:
  - Entrance duration (100-3000ms)
  - Exit duration (100-2000ms)
  - Separate timing controls for precise control
- 3 dismissal modes:
  - **Auto-Dismiss**: Automatically closes after configurable delay (1-10 seconds)
  - **User-Dismiss**: Any player can click anywhere to dismiss
  - **GM-Dismiss**: Only GM can dismiss for all connected players with dedicated button
  - Per-cutin override or use module default setting
- Preset management system:
  - Save cut-in configurations as reusable presets
  - Load presets from dropdown selector
  - Set default preset for new cut-ins
  - Manage presets in module settings (delete, set default)
  - Presets include all configuration except cutin name
- Audience targeting:
  - Show to all players
  - Or select specific individual players
  - Targeted delivery via socket system
- Character image positioning:
  - Horizontal alignment (Left/Center/Right)
  - Vertical alignment (Top/Center/Bottom)
  - Special handling for angular-mask backdrop (45% scale, centered vertically)
- Socket-based multiplayer synchronization:
  - Cut-ins broadcast to selected audience
  - GM can dismiss for all connected players
  - Unique cutin IDs for tracking instances
- Live preview functionality (GM-only, local preview before showing to players)
- Edit existing cut-ins from deck context menu
- Full integration with GM Deck panel (cut-ins appear as deck items)

#### Technical Features
- FoundryVTT v13 ApplicationV2 compatibility
- ES6 module architecture with proper imports
- Localization support (English included)
- Scene flags for data storage (deck configurations are scene-specific)
- Client settings for UI preferences (position, button size)
- Hook-based architecture for tile updates and deletions
- Drag-and-drop support for tiles and macros onto the panel
- Socket system for multiplayer cut-in synchronization
- CSS custom properties for dynamic color customization
- Advanced CSS clip-path and masking techniques for angular-mask backdrop
- Handlebars templates with helper functions (eq helper for conditionals)

### Known Limitations

- No drag-to-reorder functionality for deck items in the panel yet
- Panel position is absolute (not responsive to window resize)
- Angular-mask backdrop neon glow effect is simplified (thin line, no advanced glow yet)
- Text layer drag-to-reorder works but may need refinement for better UX
- No sound effect integration for cut-ins yet
- Cut-ins cannot be triggered programmatically via API (must be clicked from deck)

[1.0.0]: https://github.com/Azazel666/gm-deck/releases/tag/v1.0.0
