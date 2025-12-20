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
    const buttonsPerRow = game.settings.get(MODULE_ID, 'buttonsPerRow');

    // Calculate panel width based on grid layout
    const gap = 6;  // matches CSS gap
    const padding = 20;  // 10px on each side
    const panelWidth = (buttonSize * buttonsPerRow) + (gap * (buttonsPerRow - 1)) + padding;

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
      buttonsPerRow,
      panelWidth,
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
    const el = this.element;

    // Set CSS custom properties for grid layout
    el.style.setProperty('--buttons-per-row', context.buttonsPerRow);
    el.style.setProperty('--panel-width', `${context.panelWidth}px`);

    // Set initial collapsed state on first render
    if (!this._hasSetInitialMinimized && game.settings.get(MODULE_ID, 'collapsedByDefault')) {
      this._hasSetInitialMinimized = true;
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        this.minimize();
      });
    }

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

    // Create Cut-in button
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
   * Open cut-in configuration dialog
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
  async #onItemContext(event) {
    event.preventDefault();
    event.stopPropagation();

    const itemId = event.currentTarget.dataset.itemId;
    const itemName = event.currentTarget.dataset.itemName;

    // Get the item to check its type
    const items = GMDeckData.getItems();
    const item = items.find(i => i.id === itemId);

    if (!item) return;

    // For cinematic cut-ins, show edit, target audience, and delete options
    if (item.type === 'cinematic-cutin') {
      const action = await foundry.applications.api.DialogV2.wait({
        window: { title: itemName },
        content: `<p style="margin-bottom: 1em;">What would you like to do with <strong>${itemName}</strong>?</p>`,
        buttons: [
          {
            action: 'edit',
            label: 'Edit Configuration',
            icon: 'fas fa-edit',
            default: true
          },
          {
            action: 'target',
            label: 'Targeted Audience',
            icon: 'fas fa-users'
          },
          {
            action: 'delete',
            label: 'Remove from Deck',
            icon: 'fas fa-trash'
          }
        ],
        rejectClose: false
      });

      if (action === 'edit') {
        // Open edit dialog
        import('./gm-deck-cutin-config.js').then(({ GMDeckCutinConfig }) => {
          new GMDeckCutinConfig(itemId).render({ force: true });
        });
      } else if (action === 'target') {
        // Show targeted audience dialog
        await this.#showTargetedAudienceDialog(itemId, itemName);
      } else if (action === 'delete') {
        // Show delete confirmation
        const confirmed = await foundry.applications.api.DialogV2.confirm({
          window: { title: 'Remove from GM Deck' },
          content: `<p>Remove <strong>${itemName}</strong> from the deck?</p>`,
          rejectClose: false
        });
        if (confirmed) {
          await GMDeckData.removeItem(itemId);
          this.render();
        }
      }
    } else {
      // For tiles and macros, show simple delete confirmation
      const confirmed = await foundry.applications.api.DialogV2.confirm({
        window: { title: 'Remove from GM Deck' },
        content: `<p>Remove <strong>${itemName}</strong> from the deck?</p>`,
        rejectClose: false
      });
      if (confirmed) {
        await GMDeckData.removeItem(itemId);
        this.render();
      }
    }
  }

  /**
   * Show dialog to select targeted audience for a cut-in
   */
  async #showTargetedAudienceDialog(itemId, itemName) {
    const players = game.users.filter(u => !u.isGM);

    const checkboxes = players.map(p =>
      `<label style="display: block; margin: 0.5em 0;">
        <input type="checkbox" name="player-${p.id}" value="${p.id}" />
        ${p.name}
      </label>`
    ).join('');

    const content = `
      <p style="margin-bottom: 1em;">Select which players should see <strong>${itemName}</strong>:</p>
      <div style="max-height: 300px; overflow-y: auto; border: 1px solid #999; padding: 0.5em; margin-bottom: 1em;">
        <label style="display: block; margin: 0.5em 0; font-weight: bold;">
          <input type="checkbox" id="select-all-players" />
          All Players
        </label>
        <hr style="margin: 0.5em 0;" />
        ${checkboxes}
      </div>
    `;

    const selectedPlayers = await foundry.applications.api.DialogV2.wait({
      window: { title: 'Targeted Audience' },
      content: content,
      buttons: [
        {
          action: 'show',
          label: 'Show Cut-in',
          icon: 'fas fa-play',
          default: true,
          callback: (event, button, dialog) => {
            const form = button.form;
            const selectAll = form.querySelector('#select-all-players').checked;

            if (selectAll) {
              return 'all';
            }

            const selected = [];
            players.forEach(p => {
              const checkbox = form.querySelector(`input[name="player-${p.id}"]`);
              if (checkbox && checkbox.checked) {
                selected.push(p.id);
              }
            });
            return selected;
          }
        },
        {
          action: 'cancel',
          label: 'Cancel',
          icon: 'fas fa-times'
        }
      ],
      render: (event, dialog) => {
        const selectAll = dialog.querySelector('#select-all-players');
        const playerCheckboxes = dialog.querySelectorAll('input[type="checkbox"]:not(#select-all-players)');

        selectAll.addEventListener('change', () => {
          playerCheckboxes.forEach(cb => cb.checked = selectAll.checked);
        });

        playerCheckboxes.forEach(cb => {
          cb.addEventListener('change', () => {
            const allChecked = Array.from(playerCheckboxes).every(c => c.checked);
            selectAll.checked = allChecked;
          });
        });
      },
      rejectClose: false
    });

    if (selectedPlayers === 'cancel' || !selectedPlayers) return;

    // Execute the cut-in with targeted audience
    await GMDeckData.executeItem(itemId, selectedPlayers);
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
