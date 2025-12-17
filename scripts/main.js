// GM Deck - Main Entry Point
import { GMDeckApp } from './gm-deck-app.js';
import { GMDeckData } from './gm-deck-data.js';

const MODULE_ID = 'gm-deck';

// Global reference to the deck application
let gmDeckApp = null;

/* -------------------------------------------- */
/*  Module Settings                             */
/* -------------------------------------------- */

function registerSettings() {
  game.settings.register(MODULE_ID, 'panelPosition', {
    name: 'Panel Position',
    hint: 'Stored position of the draggable panel.',
    scope: 'client',
    config: false,
    type: Object,
    default: { top: 100, left: 100 }
  });

  game.settings.register(MODULE_ID, 'collapsedByDefault', {
    name: 'Start Collapsed',
    hint: 'Whether the panel starts collapsed when opening a scene.',
    scope: 'client',
    config: true,
    type: Boolean,
    default: false
  });

  game.settings.register(MODULE_ID, 'buttonSize', {
    name: 'Button Size',
    hint: 'Size of the deck buttons in pixels.',
    scope: 'client',
    config: true,
    type: Number,
    range: {
      min: 32,
      max: 64,
      step: 4
    },
    default: 40,
    onChange: () => {
      if (gmDeckApp?.rendered) {
        gmDeckApp.render();
      }
    }
  });
}

/* -------------------------------------------- */
/*  Initialization Hooks                        */
/* -------------------------------------------- */

Hooks.once('init', () => {
  console.log(`${MODULE_ID} | Initializing GM Deck`);
  registerSettings();
  
  // Expose API for macros/other modules
  game.modules.get(MODULE_ID).api = {
    getApp: () => gmDeckApp,
    refresh: () => gmDeckApp?.render(),
    addTile: (tileId) => GMDeckData.addItem('tile-toggle', tileId),
    addMacro: (macroUuid) => GMDeckData.addItem('macro', macroUuid),
    removeItem: (itemId) => GMDeckData.removeItem(itemId)
  };
});

Hooks.once('ready', () => {
  // Only show for GM
  if (!game.user.isGM) return;
  
  console.log(`${MODULE_ID} | GM Deck ready`);
});

/* -------------------------------------------- */
/*  Scene Hooks                                 */
/* -------------------------------------------- */

Hooks.on('canvasReady', () => {
  if (!game.user.isGM) return;

  // Close existing app if open
  if (gmDeckApp) {
    gmDeckApp.close();
  }

  // Create and render the deck for this scene
  gmDeckApp = new GMDeckApp();
  gmDeckApp.render({ force: true });
});

Hooks.on('getSceneControlButtons', (controls) => {
  if (!game.user.isGM) return;
  if (!Array.isArray(controls)) return;

  // Add toggle button to Token controls
  const tokenControls = controls.find(c => c.name === 'token');
  if (tokenControls) {
    tokenControls.tools.push({
      name: 'gm-deck',
      title: 'Toggle GM Deck',
      icon: 'fas fa-gamepad',
      button: true,
      onClick: () => {
        if (!gmDeckApp) {
          gmDeckApp = new GMDeckApp();
        }

        if (gmDeckApp.rendered) {
          gmDeckApp.close();
        } else {
          gmDeckApp.render({ force: true });
        }
      }
    });
  }

  // Add "Add to GM Deck" button to Tiles controls
  const tilesControl = controls.find(c => c.name === 'tiles');
  if (tilesControl) {
    tilesControl.tools.push({
      name: 'gm-deck-add',
      title: 'GM Deck: Add Selected Tile',
      icon: 'fas fa-square-plus',
      button: true,
      onClick: async () => {
        const controlled = canvas.tiles?.controlled || [];
        if (controlled.length === 0) {
          ui.notifications.warn('Please select a tile on the canvas first.');
          return;
        }

        for (const tile of controlled) {
          await GMDeckData.addItem('tile-toggle', tile.id);
        }

        if (gmDeckApp?.rendered) {
          gmDeckApp.render();
        }
      }
    });
  }
});

Hooks.on('updateTile', (tile, changes) => {
  // Refresh deck if a tile's visibility changed
  if ('hidden' in changes && gmDeckApp?.rendered) {
    gmDeckApp.render();
  }
});

Hooks.on('deleteTile', (tile) => {
  // Remove tile from deck if it was deleted from scene
  if (gmDeckApp?.rendered) {
    const items = GMDeckData.getItems();
    const item = items.find(i => i.type === 'tile-toggle' && i.targetId === tile.id);
    if (item) {
      GMDeckData.removeItem(item.id);
      gmDeckApp.render();
    }
  }
});

/* -------------------------------------------- */
/*  Tile HUD Buttons                            */
/* -------------------------------------------- */

// Add button to tile HUD
Hooks.on('renderTileHUD', (app, element, data) => {
  if (!game.user.isGM) return;

  // In v13, element is the HTML element, not jQuery
  const html = $(element);
  const controlIcons = html.find('.control-icon');

  if (controlIcons.length > 0) {
    const button = $(`
      <div class="control-icon" title="Add to GM Deck">
        <i class="fas fa-gamepad"></i>
      </div>
    `);

    button.on('click', async (event) => {
      event.preventDefault();
      event.stopPropagation();

      const tileId = app.object?.id;
      if (tileId) {
        await GMDeckData.addItem('tile-toggle', tileId);
        if (gmDeckApp?.rendered) {
          gmDeckApp.render();
        }
      }
    });

    controlIcons.first().before(button);
  }
});

/* -------------------------------------------- */
/*  Drag & Drop Hooks                           */
/* -------------------------------------------- */

// Handle drops on the canvas (we'll handle in the app itself)
// But we need to expose module ID for the app
export { MODULE_ID };
