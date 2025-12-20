# GM Deck

A scene-specific control panel for Foundry VTT Game Masters to quickly toggle tile visibility and execute macros.

## Features

### GM Deck Panel

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
- **Macro Support**: Add and execute macros directly from the deck

### Cinematic Cut-in Overlays

- **Visual Novel/JRPG Style Cut-ins**: Create dramatic character introductions and story moments
- **9 Backdrop Styles**: From minimal fades to ornate frames and angular geometric patterns
- **Character Masking**: Advanced angular-mask backdrop that clips character within geometric shapes
- **Color Customization**: Change primary and secondary colors of any backdrop to match your game's theme
- **Text Overlays**: Add multiple customizable text layers with:
  - Custom positioning (9 preset positions + X/Y offsets)
  - Font selection, size, and color
  - Optional background panels
  - Drag-to-reorder layers
- **5 Animation Styles**: Slide Right, Slide Left, Fade, Zoom, Diagonal Sweep
- **3 Dismissal Modes**:
  - **Auto-Dismiss**: Automatically closes after a configurable delay
  - **User-Dismiss**: Any player can click to dismiss
  - **GM-Dismiss**: Only GM can dismiss for all connected players
- **Preset System**: Save and load cut-in configurations for quick reuse
- **Audience Control**: Show cut-ins to all players or select specific players
- **Live Preview**: Preview your cut-in before showing it to players
- **Socket-Based Multiplayer**: Cut-ins are synchronized across all connected clients

## Installation

### Manual Installation

1. Download the latest release
2. Extract to your Foundry VTT modules directory: `Data/modules/gm-deck`
3. Restart Foundry VTT
4. Enable "GM Deck" in your world's module settings

### Module Manifest URL

```
https://github.com/Azazel666/gm-deck/releases/latest/download/module.json
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

### Creating Cinematic Cut-ins

#### Opening the Cut-in Editor

1. Open the GM Deck panel
2. Click the **"Create Cut-in"** button
3. The Cut-in Configuration window appears

#### Configuring Your Cut-in

**Basic Setup:**
1. **Cutin Name**: Give your cut-in a descriptive name
2. **Character Image**: Click "Select Image" to choose a character portrait or artwork
3. **Image Alignment**: Choose horizontal alignment (Left/Center/Right)

**Backdrop & Colors:**
1. **Backdrop Style**: Choose from 9 styles:
   - **Diagonal Solid**: JRPG-style diagonal shape with solid color
   - **Black Banner**: Horizontal black banner with golden borders (no customization)
   - **Checkered Pattern**: Diamond/checkered pattern with two colors
   - **Vertical Split**: Vertical gradient split
   - **Gradient Burst**: Radial gradient burst from center
   - **Minimal Fade**: Semi-transparent fade with frosted glass blur effect
   - **Ornate Frame**: Decorative frame with inner glow (Fantasy style)
   - **Corner Brackets**: Sci-fi tactical UI style corner brackets
   - **Angular Mask**: Character clipped within angular geometric shapes (unique masking effect)
2. **Customize Colors** (Optional):
   - Check "Customize Backdrop Colors" to enable
   - Choose Primary Color (main color of the backdrop)
   - Choose Secondary Color (accent/border color)
   - Click "Reset to Defaults" to restore original colors

**Text Overlays:**
1. Click **"Add Text Layer"** to create text
2. For each text layer:
   - Enter your text content
   - Choose font, size, and color
   - Select position (Top/Middle/Bottom × Left/Center/Right)
   - Adjust X/Y offsets for fine-tuning
   - Optionally enable background panel with custom color
3. Click the header to collapse/expand layers
4. Drag layers by the grip icon to reorder
5. Click the X button to remove a layer

**Animation & Timing:**
1. **Animation Style**: Choose entrance animation (Slide Right, Slide Left, Fade, Zoom, Diagonal Sweep)
2. **Entrance Duration**: How long the entrance animation takes (100-3000ms)
3. **Exit Duration**: How long the exit animation takes (100-2000ms)

**Dismissal Settings:**
1. **Dismissal Mode**:
   - **Auto-Dismiss**: Closes automatically after delay
   - **User-Dismiss**: Any player clicks to close
   - **GM-Dismiss**: Only GM can close for everyone
   - **Use Module Default**: Uses the global setting
2. **Auto-Dismiss Delay**: Time before auto-closing (1000-10000ms, only used with Auto-Dismiss mode)

**Audience:**
1. Choose **"All Players"** to show to everyone
2. Or choose **"Specific Players"** and select individual players

#### Saving and Using Presets

**Save a Preset:**
1. Configure your cut-in as desired
2. Click **"Save as Preset"**
3. Enter a preset name and optionally mark as default
4. Preset is now saved and can be reused

**Load a Preset:**
1. Use the **"Load Preset"** dropdown
2. Select a saved preset
3. All settings are loaded instantly

**Managing Presets:**
- Access preset management in module settings
- Delete unwanted presets
- Set a default preset for new cut-ins

#### Preview and Save

1. Click **"Preview"** to test your cut-in locally (only you see it)
2. Make adjustments as needed
3. Click **"Save to Deck"** to add the cut-in to your deck
4. Or click **"Cancel"** to discard changes

#### Showing Cut-ins to Players

1. Find your saved cut-in in the GM Deck panel
2. **Left-click** the cut-in button to show it
3. The cut-in appears for the selected audience
4. Dismissal follows the configured mode:
   - **Auto**: Closes automatically after delay
   - **User**: Players click anywhere to close
   - **GM**: Only you can click "Dismiss for All" button

#### Editing Existing Cut-ins

1. **Right-click** a cut-in button in the deck
2. Choose **"Edit"** from the context menu
3. Make your changes
4. Click **"Update"** to save

## Configuration

Access module settings via Configure Settings → Module Settings:

### GM Deck Panel Settings

- **Start Collapsed**: Whether the panel starts minimized when opening a scene (default: false)
- **Button Size**: Size of the deck buttons in pixels (default: 40px, range: 32-64px)

### Cinematic Cut-in Settings

- **Default Dismissal Mode**: Choose how cut-ins are dismissed by default (Auto/User/GM)
- **Manage Presets**: View, delete, and set default presets for cut-in configurations

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

### GM Deck Panel
- Drag-and-drop reordering of deck items
- Custom button labels and icons
- Folders/categories for organizing items
- Import/export deck configurations
- Support for other placeable objects (lights, sounds, etc.)

### Cinematic Cut-ins
- Additional backdrop styles and effects
- Advanced neon glow effects for angular-mask backdrop
- Sound effect integration
- Video support for animated backgrounds
- Trigger cut-ins from macros or module hooks
- Import/export individual cut-in configurations

## Support

- **Issues**: [GitHub Issues](https://github.com/Azazel666/gm-deck/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Azazel666/gm-deck/discussions)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This module is licensed under the MIT License. See LICENSE file for details.

## Credits

Developed by Mattias

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.
