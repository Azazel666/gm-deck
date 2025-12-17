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
   * Add a new item to the deck
   * @param {string} type - 'tile-toggle' or 'macro'
   * @param {string} targetId - Tile ID or Macro UUID
   * @param {object} options - Additional options (name, icon override)
   * @returns {object|null} The created item or null if failed
   */
  static async addItem(type, targetId, options = {}) {
    const items = this.getItems();
    
    // Check for duplicates
    if (items.some(i => i.type === type && i.targetId === targetId)) {
      ui.notifications.warn('This item is already in the GM Deck.');
      return null;
    }

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
    const items = this.getItems();
    const index = items.findIndex(i => i.id === itemId);
    
    if (index === -1) {
      ui.notifications.warn('Item not found in GM Deck.');
      return false;
    }

    const removed = items.splice(index, 1)[0];
    await this.setItems(items);
    
    ui.notifications.info(`Removed "${removed.name}" from GM Deck.`);
    return true;
  }

  /**
   * Update an existing item
   * @param {string} itemId - The deck item ID to update
   * @param {object} updates - Properties to update
   */
  static async updateItem(itemId, updates) {
    const items = this.getItems();
    const item = items.find(i => i.id === itemId);
    
    if (!item) {
      ui.notifications.warn('Item not found in GM Deck.');
      return false;
    }

    Object.assign(item, updates);
    await this.setItems(items);
    return true;
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
   */
  static async executeItem(itemId) {
    const items = this.getItems();
    const item = items.find(i => i.id === itemId);
    
    if (!item) {
      ui.notifications.error('Item not found.');
      return;
    }

    if (item.type === 'tile-toggle') {
      await this.toggleTile(item.targetId);
    } else if (item.type === 'macro') {
      await this.executeMacro(item.targetId);
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
}
