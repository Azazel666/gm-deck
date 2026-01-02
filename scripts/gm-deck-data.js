// GM Deck - Data Management
const MODULE_ID = 'gm-deck';

export class GMDeckData {
  
  /**
   * Get all deck items for the current scene
   * @returns {Array} Array of deck items
   */
  static getItems() {
    if (!canvas.scene) return [];
    return canvas.scene.getFlag(MODULE_ID, 'items') ?? [];
  }

  /**
   * Set all deck items for the current scene
   * @param {Array} items - Array of deck items
   */
  static async setItems(items) {
    if (!canvas.scene) return;
    await canvas.scene.setFlag(MODULE_ID, 'items', items);
  }

  /**
   * Get all global deck items (available on all scenes)
   * @returns {Array} Array of global deck items
   */
  static getGlobalItems() {
    return game.settings.get(MODULE_ID, 'globalItems') ?? [];
  }

  /**
   * Set all global deck items
   * @param {Array} items - Array of global deck items
   */
  static async setGlobalItems(items) {
    await game.settings.set(MODULE_ID, 'globalItems', items);
  }

  /**
   * Get combined items for current scene (global + scene-specific)
   * @returns {Array} Merged array with global items first, each marked with isGlobal flag
   */
  static getCombinedItems() {
    const globalItems = this.getGlobalItems();
    const sceneItems = this.getItems();

    // Add isGlobal flag for rendering
    const markedGlobal = globalItems.map(item => ({ ...item, isGlobal: true }));
    const markedScene = sceneItems.map(item => ({ ...item, isGlobal: false }));

    return [...markedGlobal, ...markedScene];
  }

  /**
   * Toggle item between global and scene-specific
   * @param {string} itemId - Item ID to toggle
   */
  static async toggleItemGlobalStatus(itemId) {
    const globalItems = this.getGlobalItems();
    const sceneItems = this.getItems();

    // Check if item is currently global
    const globalIndex = globalItems.findIndex(i => i.id === itemId);

    if (globalIndex !== -1) {
      // Move from global to current scene
      const [item] = globalItems.splice(globalIndex, 1);
      delete item.isGlobal;
      sceneItems.push(item);

      await this.setGlobalItems(globalItems);
      await this.setItems(sceneItems);

      ui.notifications.info(`"${item.name}" is now scene-specific.`);
    } else {
      // Move from scene to global
      const sceneIndex = sceneItems.findIndex(i => i.id === itemId);
      if (sceneIndex === -1) {
        ui.notifications.error('Item not found.');
        return;
      }

      const [item] = sceneItems.splice(sceneIndex, 1);
      item.isGlobal = true;
      globalItems.push(item);

      await this.setGlobalItems(globalItems);
      await this.setItems(sceneItems);

      ui.notifications.info(`"${item.name}" is now global (appears on all scenes).`);
    }
  }

  /**
   * Add a new item to the deck
   * @param {string} type - 'tile-toggle' or 'macro'
   * @param {string} targetId - Tile ID or Macro UUID
   * @param {object} options - Additional options (name, icon override)
   * @returns {object|null} The created item or null if failed
   */
  static async addItem(type, targetId, options = {}) {
    const globalItems = this.getGlobalItems();
    const sceneItems = this.getItems();

    // Check for duplicates in BOTH storages
    const existsInGlobal = globalItems.some(i => i.type === type && i.targetId === targetId);
    const existsInScene = sceneItems.some(i => i.type === type && i.targetId === targetId);

    if (existsInGlobal || existsInScene) {
      const location = existsInGlobal ? 'global deck' : 'this scene\'s deck';
      ui.notifications.warn(`This item is already in the ${location}.`);
      return null;
    }

    // Use scene items for adding new items (always add to scene by default)
    const items = sceneItems;

    // Get default name and icon based on type
    let name, icon;
    
    if (type === 'tile-toggle') {
      const tile = canvas.tiles.get(targetId);
      if (!tile) {
        ui.notifications.error('Tile not found on canvas.');
        return null;
      }
      name = options.name ?? tile.document.texture?.src?.split('/').pop() ?? 'Tile';
      icon = options.icon ?? tile.document.texture?.src ?? 'icons/svg/tile.svg';
    } else if (type === 'macro') {
      const macro = await fromUuid(targetId);
      if (!macro) {
        ui.notifications.error('Macro not found.');
        return null;
      }
      name = options.name ?? macro.name;
      icon = options.icon ?? macro.img ?? 'icons/svg/dice-target.svg';
    } else if (type === 'cinematic-cutin') {
      // Cut-ins come with pre-configured options
      const config = options.config;
      if (!config || !config.characterImage) {
        ui.notifications.error('Invalid cut-in configuration.');
        return null;
      }
      name = options.name ?? 'Cinematic Cut-in';
      icon = options.icon ?? config.characterImage;

      const newItem = {
        id: foundry.utils.randomID(),
        name,
        icon,
        type: 'cinematic-cutin',
        targetId: null,
        config
      };
      items.push(newItem);
      await this.setItems(items);
      ui.notifications.info(`Added "${name}" to GM Deck.`);
      return newItem;
    } else {
      ui.notifications.error('Unknown item type.');
      return null;
    }

    const newItem = {
      id: foundry.utils.randomID(),
      name,
      icon,
      type,
      targetId
    };

    items.push(newItem);
    await this.setItems(items);

    ui.notifications.info(`Added "${name}" to GM Deck.`);
    return newItem;
  }

  /**
   * Remove an item from the deck
   * @param {string} itemId - The deck item ID to remove
   */
  static async removeItem(itemId) {
    const globalItems = this.getGlobalItems();
    const sceneItems = this.getItems();

    // Try global first
    let index = globalItems.findIndex(i => i.id === itemId);
    if (index !== -1) {
      const removed = globalItems.splice(index, 1)[0];
      await this.setGlobalItems(globalItems);
      ui.notifications.info(`Removed "${removed.name}" from GM Deck.`);
      return true;
    }

    // Try scene-specific
    index = sceneItems.findIndex(i => i.id === itemId);
    if (index !== -1) {
      const removed = sceneItems.splice(index, 1)[0];
      await this.setItems(sceneItems);
      ui.notifications.info(`Removed "${removed.name}" from GM Deck.`);
      return true;
    }

    ui.notifications.warn('Item not found in GM Deck.');
    return false;
  }

  /**
   * Update an existing item
   * @param {string} itemId - The deck item ID to update
   * @param {object} updates - Properties to update
   */
  static async updateItem(itemId, updates) {
    const globalItems = this.getGlobalItems();
    const sceneItems = this.getItems();

    // Try global first
    let item = globalItems.find(i => i.id === itemId);
    if (item) {
      Object.assign(item, updates);
      await this.setGlobalItems(globalItems);
      return true;
    }

    // Try scene-specific
    item = sceneItems.find(i => i.id === itemId);
    if (item) {
      Object.assign(item, updates);
      await this.setItems(sceneItems);
      return true;
    }

    ui.notifications.warn('Item not found in GM Deck.');
    return false;
  }

  /**
   * Reorder items (for future drag reordering)
   * @param {string} itemId - Item to move
   * @param {number} newIndex - New position
   */
  static async reorderItem(itemId, newIndex) {
    const items = this.getItems();
    const currentIndex = items.findIndex(i => i.id === itemId);
    
    if (currentIndex === -1) return false;
    
    const [item] = items.splice(currentIndex, 1);
    items.splice(newIndex, 0, item);
    await this.setItems(items);
    return true;
  }

  /**
   * Execute a deck item's action
   * @param {string} itemId - The deck item ID to execute
   * @param {string|Array} audienceOverride - Optional audience override ('all' or array of user IDs)
   */
  static async executeItem(itemId, audienceOverride = null) {
    const items = this.getCombinedItems();
    const item = items.find(i => i.id === itemId);

    if (!item) {
      ui.notifications.error('Item not found.');
      return;
    }

    if (item.type === 'tile-toggle') {
      await this.toggleTile(item.targetId);
    } else if (item.type === 'macro') {
      await this.executeMacro(item.targetId);
    } else if (item.type === 'cinematic-cutin') {
      await this.executeCutin(itemId, audienceOverride);
    }
  }

  /**
   * Toggle a tile's visibility
   * @param {string} tileId - The tile document ID
   */
  static async toggleTile(tileId) {
    const tile = canvas.tiles.get(tileId);
    if (!tile) {
      ui.notifications.error('Tile no longer exists on this scene.');
      return;
    }

    const currentHidden = tile.document.hidden;
    await tile.document.update({ hidden: !currentHidden });
    
    console.log(`${MODULE_ID} | Toggled tile ${tileId} visibility: ${currentHidden} -> ${!currentHidden}`);
  }

  /**
   * Execute a macro
   * @param {string} macroUuid - The macro UUID
   */
  static async executeMacro(macroUuid) {
    const macro = await fromUuid(macroUuid);
    if (!macro) {
      ui.notifications.error('Macro no longer exists.');
      return;
    }

    console.log(`${MODULE_ID} | Executing macro: ${macro.name}`);
    await macro.execute();
  }

  /**
   * Get the current state of a tile (for display)
   * @param {string} tileId - The tile document ID
   * @returns {object} State object with visibility info
   */
  static getTileState(tileId) {
    const tile = canvas.tiles.get(tileId);
    if (!tile) {
      return { exists: false, hidden: null };
    }
    return {
      exists: true,
      hidden: tile.document.hidden
    };
  }

  /**
   * Execute a cinematic cutin
   * @param {string} itemId - The deck item ID
   * @param {string|Array} audienceOverride - Optional audience override ('all' or array of user IDs)
   */
  static async executeCutin(itemId, audienceOverride = null) {
    const items = this.getCombinedItems();
    const item = items.find(i => i.id === itemId);

    if (!item || item.type !== 'cinematic-cutin') {
      ui.notifications.error('Cut-in not found.');
      return;
    }

    const config = item.config;
    const cutinId = `cutin-${foundry.utils.randomID()}`;

    // Use audience override if provided, otherwise use config audience
    const targetAudience = audienceOverride !== null ? audienceOverride : config.audience;

    // Broadcast via socket
    game.socket.emit(`module.${MODULE_ID}`, {
      messageType: 'showCutin',
      senderId: game.user.id,
      data: {
        config,
        targetUsers: targetAudience,
        cutinId
      }
    });

    // Show locally for GM
    const shouldShowToGM = targetAudience === 'all' ||
      (Array.isArray(targetAudience) && targetAudience.includes(game.user.id));

    if (shouldShowToGM) {
      import('./gm-deck-cutin-overlay.js').then(({ GMDeckCutinOverlay }) => {
        const overlay = new GMDeckCutinOverlay(config, cutinId);
        overlay.render({ force: true });
      });
    }

    console.log(`${MODULE_ID} | Executed cut-in: ${item.name}`);
  }

  /**
   * Broadcast cutin dismissal to all clients
   * @param {string} cutinId - The cutin overlay ID
   */
  static broadcastDismissCutin(cutinId) {
    game.socket.emit(`module.${MODULE_ID}`, {
      messageType: 'dismissCutin',
      senderId: game.user.id,
      data: { cutinId }
    });
  }
}
