// GM Deck - Application Window (ApplicationV2)
import { GMDeckData } from './gm-deck-data.js';

const MODULE_ID = 'gm-deck';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class GMDeckApp extends HandlebarsApplicationMixin(ApplicationV2) {
  
  constructor(options = {}) {
    // Load saved position
    const savedPosition = game.settings.get(MODULE_ID, 'panelPosition');
    options.position = {
      ...options.position,
      ...savedPosition
    };

    super(options);
  }

  /* -------------------------------------------- */
  /*  Static Properties                           */
  /* -------------------------------------------- */

  static DEFAULT_OPTIONS = {
    id: 'gm-deck-panel',
    classes: ['gm-deck'],
    position: {
      width: 'auto',
      height: 'auto'
    },
    window: {
      frame: true,
      positioned: true,
      resizable: false
    }
  };

  static PARTS = {
    panel: {
      template: `modules/${MODULE_ID}/templates/gm-deck.hbs`
    }
  };

  /* -------------------------------------------- */
  /*  Getters                                     */
  /* -------------------------------------------- */

  get title() {
    return 'GM Deck';
  }

  /* -------------------------------------------- */
  /*  Context Preparation                         */
  /* -------------------------------------------- */

  async _prepareContext(options) {
    const items = GMDeckData.getItems();
    const buttonSize = game.settings.get(MODULE_ID, 'buttonSize');

    // Group items by type
    const tileItems = [];
    const macroItems = [];
    const cutinItems = [];

    for (const item of items) {
      if (item.type === 'tile-toggle') {
        const state = GMDeckData.getTileState(item.targetId);
        tileItems.push({
          ...item,
          exists: state.exists,
          isVisible: state.exists && !state.hidden,
          statusIcon: state.exists
            ? (state.hidden ? 'fa-eye-slash' : 'fa-eye')
            : 'fa-exclamation-triangle',
          statusClass: state.exists
            ? (state.hidden ? 'tile-hidden' : 'tile-visible')
            : 'tile-missing'
        });
      } else if (item.type === 'macro') {
        macroItems.push({
          ...item,
          statusIcon: 'fa-play',
          statusClass: 'macro'
        });
      } else if (item.type === 'cinematic-cutin') {
        cutinItems.push({
          ...item,
          statusIcon: 'fa-play-circle',
          statusClass: 'cinematic-cutin'
        });
      }
    }

    return {
      buttonSize,
      hasTiles: tileItems.length > 0,
      hasMacros: macroItems.length > 0,
      hasCutins: cutinItems.length > 0,
      tileItems,
      macroItems,
      cutinItems,
      isEmpty: items.length === 0
    };
  }

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  _onRender(context, options) {
    this.#activateListeners();
  }

  /**
   * Save position when window is moved
   */
  async setPosition(position = {}) {
    const result = await super.setPosition(position);

    // Save the position to settings
    if (this.position.top !== undefined && this.position.left !== undefined) {
      await game.settings.set(MODULE_ID, 'panelPosition', {
        top: this.position.top,
        left: this.position.left
      });
    }

    return result;
  }

  /* -------------------------------------------- */
  /*  Event Listeners                             */
  /* -------------------------------------------- */

  #activateListeners() {
    const el = this.element;

    // Item clicks and context menu
    const items = el.querySelectorAll('.gm-deck-item');
    items.forEach(item => {
      item.addEventListener('click', this.#onExecuteItem.bind(this));
      item.addEventListener('contextmenu', this.#onItemContext.bind(this));
    });

    // Create Cutin button
    const createCutinBtn = el.querySelector('[data-action="create-cutin"]');
    if (createCutinBtn) {
      createCutinBtn.addEventListener('click', this.#onCreateCutin.bind(this));
    }

    // Drag and drop on content area
    const content = el.querySelector('.gm-deck-content');
    if (content) {
      content.addEventListener('dragover', this.#onDragOver.bind(this));
      content.addEventListener('dragleave', this.#onDragLeave.bind(this));
      content.addEventListener('drop', this.#onDrop.bind(this));
    }

    // Also allow drop on window header
    const windowHeader = el.querySelector('.window-header');
    if (windowHeader) {
      windowHeader.addEventListener('dragover', this.#onDragOver.bind(this));
      windowHeader.addEventListener('dragleave', this.#onDragLeave.bind(this));
      windowHeader.addEventListener('drop', this.#onDrop.bind(this));
    }
  }

  /**
   * Open cutin configuration dialog
   */
  #onCreateCutin(event) {
    event.preventDefault();
    import('./gm-deck-cutin-config.js').then(({ GMDeckCutinConfig }) => {
      new GMDeckCutinConfig().render({ force: true });
    });
  }

  /**
   * Execute a deck item
   */
  async #onExecuteItem(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const itemId = event.currentTarget.dataset.itemId;
    if (!itemId) return;
    
    // Add visual feedback
    const button = event.currentTarget;
    button.classList.add('executing');
    
    await GMDeckData.executeItem(itemId);
    
    // Brief delay before re-render for visual feedback
    setTimeout(() => {
      this.render();
    }, 150);
  }

  /**
   * Show context menu / confirmation for item removal
   */
  #onItemContext(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const itemId = event.currentTarget.dataset.itemId;
    const itemName = event.currentTarget.dataset.itemName;
    
    foundry.applications.api.DialogV2.confirm({
      window: { title: 'Remove from GM Deck' },
      content: `<p>Remove <strong>${itemName}</strong> from the deck?</p>`,
      yes: {
        callback: async () => {
          await GMDeckData.removeItem(itemId);
          this.render();
        }
      },
      no: {
        callback: () => {}
      },
      rejectClose: false
    });
  }

  /* -------------------------------------------- */
  /*  Drag and Drop Handling                      */
  /* -------------------------------------------- */

  #onDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
  }

  #onDragLeave(event) {
    event.currentTarget.classList.remove('drag-over');
  }

  async #onDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');

    // Parse the drop data
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData('text/plain'));
    } catch (e) {
      console.warn(`${MODULE_ID} | Could not parse drop data`);
      return;
    }

    console.log(`${MODULE_ID} | Drop data:`, data);

    // Handle Tile drops
    if (data.type === 'Tile') {
      const tileDoc = await fromUuid(data.uuid);
      if (tileDoc) {
        await GMDeckData.addItem('tile-toggle', tileDoc.id);
        this.render();
      }
      return;
    }

    // Handle Macro drops
    if (data.type === 'Macro') {
      await GMDeckData.addItem('macro', data.uuid);
      this.render();
      return;
    }

    // Handle drops from the Tile layer (alternative format)
    if (data.tileId) {
      await GMDeckData.addItem('tile-toggle', data.tileId);
      this.render();
      return;
    }

    ui.notifications.warn('Drop a Tile or Macro onto the GM Deck to add it.');
  }
}
