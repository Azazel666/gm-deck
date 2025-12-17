# GM Deck

A scene-specific control panel for Foundry VTT Game Masters to quickly toggle tile visibility and execute macros.

## Features

- **Scene-Specific Decks**: Each scene maintains its own independent deck configuration
- **Quick Tile Visibility Toggle**: Add tiles to your deck and toggle their visibility with a single click
- **Visual Status Indicators**: Color-coded borders and icons show tile visibility at a glance
  - Green border: Tile is visible
  - Red border: Tile is hidden
  - Yellow border: Tile no longer exists in the scene
- **Draggable Panel**: Position the deck anywhere on your screen - your preference is saved across sessions
- **Minimize Support**: Double-click the title bar to minimize/maximize the panel
- **Easy Tile Management**:
  - Add tiles by right-clicking them on the canvas
  - Remove tiles by right-clicking buttons in the deck
- **Auto-Cleanup**: Deleted tiles are automatically removed from the deck
- **Macro Support**: Add and execute macros directly from the deck (ready for future expansion)

## Installation

### Manual Installation

1. Download the latest release
2. Extract to your Foundry VTT modules directory: `Data/modules/gm-deck`
3. Restart Foundry VTT
4. Enable "GM Deck" in your world's module settings

### Module Manifest URL

```
[Coming soon - add manifest URL when published]
```

## Usage

### Adding Tiles to the Deck

1. Place tiles in your scene
2. Right-click on any tile
3. Click the **gamepad icon** in the tile's control bar
4. The tile is now added to your GM Deck

### Toggling Tile Visibility

1. **Left-click** a tile button in the deck to toggle its visibility
2. The border color indicates the current state:
   - **Green**: Tile is visible to players
   - **Red**: Tile is hidden from players

### Removing Tiles from the Deck

1. **Right-click** a tile button in the deck
2. Confirm removal in the dialog

### Managing the Panel

- **Move**: Click and drag the "GM Deck" title bar
- **Minimize**: Double-click the title bar
- **Close/Open**: Click the gamepad icon in the Token Controls (left sidebar)

## Configuration

Access module settings via Configure Settings → Module Settings:

- **Start Collapsed**: Whether the panel starts minimized when opening a scene (default: false)
- **Button Size**: Size of the deck buttons in pixels (default: 40px, range: 32-64px)

## Compatibility

- **Foundry VTT Version**: v13 or higher
- **System**: System-agnostic (works with all game systems)
- **Conflicts**: None known

## API

GM Deck exposes an API for macro and module developers:

```javascript
// Get the GM Deck API
const api = game.modules.get('gm-deck').api;

// Refresh the deck display
api.refresh();

// Add a tile to the current scene's deck
api.addTile(tileId);

// Add a macro to the current scene's deck
api.addMacro(macroUuid);

// Remove an item from the deck
api.removeItem(itemId);

// Get the deck application instance
const app = api.getApp();
```

## Roadmap

- Drag-and-drop reordering of deck items
- Custom button labels and icons
- Folders/categories for organizing items
- Import/export deck configurations
- Support for other placeable objects (lights, sounds, etc.)

## Support

- **Issues**: [GitHub Issues](https://github.com/[your-username]/gm-deck/issues)
- **Discussions**: [GitHub Discussions](https://github.com/[your-username]/gm-deck/discussions)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This module is licensed under the MIT License. See LICENSE file for details.

## Credits

Developed by Mattias

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.
