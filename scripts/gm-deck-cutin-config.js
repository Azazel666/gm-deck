// GM Deck - Cinematic Cutin Configuration Dialog
import { GMDeckData } from './gm-deck-data.js';
import { GMDeckPresets } from './gm-deck-presets.js';
import { GMDeckCutinOverlay } from './gm-deck-cutin-overlay.js';

const MODULE_ID = 'gm-deck';
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class GMDeckCutinConfig extends HandlebarsApplicationMixin(ApplicationV2) {

  constructor(itemId = null, initialData = {}) {
    super();
    this.itemId = itemId;
    this.initialData = initialData;

    // Initialize expanded layers tracking
    this.expandedLayers = new Set();

    // Load existing item if editing
    if (itemId) {
      const items = GMDeckData.getItems();
      const item = items.find(i => i.id === itemId);
      if (item) {
        this.config = foundry.utils.deepClone(item.config);
        this.cutinName = item.name;
        // When editing existing, all layers start collapsed (empty Set)
      }
    } else {
      // New cutin - initialize with defaults or initial data
      this.config = {
        characterImage: initialData.characterImage || '',
        imageSource: initialData.imageSource || 'custom',
        sourceId: initialData.sourceId || null,
        backdropStyle: 'solid-color',
        backdropPrimaryColor: null,
        backdropSecondaryColor: null,
        imageVerticalAlign: 'bottom',
        imageHorizontalAlign: 'right',
        textLayers: [],
        animationStyle: 'slide-right',
        duration: 800,
        exitDuration: 400,
        dismissalMode: null,
        autoDismissDelay: 3000,
        audience: 'all',
        ...initialData.config
      };
      this.cutinName = initialData.name || 'New Cut-in';
      // When creating new, expand first layer if it exists
      if (this.config.textLayers.length > 0) {
        this.expandedLayers.add(0);
      }
    }
  }

  /* -------------------------------------------- */
  /*  Static Properties                           */
  /* -------------------------------------------- */

  static DEFAULT_OPTIONS = {
    id: 'gm-deck-cutin-config',
    classes: ['gm-deck-cutin-config'],
    window: {
      title: 'Configure Cinematic Cut-in',
      resizable: true,
      minimizable: true
    },
    position: {
      width: 550,
      height: 'auto',
      top: 100,
      left: 200
    },
    actions: {
      selectImage: this._onSelectImage,
      addTextLayer: this._onAddTextLayer,
      removeTextLayer: this._onRemoveTextLayer,
      savePreset: this._onSavePreset,
      preview: this._onPreview,
      save: this._onSave
    }
  };

  static PARTS = {
    form: {
      template: `modules/${MODULE_ID}/templates/cutin-config.hbs`
    }
  };

  /* -------------------------------------------- */
  /*  Context Preparation                         */
  /* -------------------------------------------- */

  async _prepareContext(options) {
    const presets = await GMDeckPresets.getPresets();
    const allPlayers = game.users.filter(u => !u.isGM);

    // Add selected flag to each player
    const players = allPlayers.map(p => ({
      id: p.id,
      name: p.name,
      selected: Array.isArray(this.config.audience) && this.config.audience.includes(p.id)
    }));

    // Add expanded state to text layers for rendering
    const textLayersWithState = this.config.textLayers.map((layer, index) => ({
      ...layer,
      index,
      isExpanded: this.expandedLayers.has(index)
    }));

    // Backdrop styles with color metadata
    const backdropStyles = [
      { value: 'solid-color', label: 'Diagonal Solid', colors: 'primary' },
      { value: 'banner-black', label: 'Black Banner', colors: 'none' },
      { value: 'geometric-pattern', label: 'Checkered Pattern', colors: 'both' },
      { value: 'vertical-split', label: 'Vertical Split', colors: 'primary' },
      { value: 'gradient-burst', label: 'Gradient Burst', colors: 'primary' },
      { value: 'minimal-fade', label: 'Minimal Fade', colors: 'primary' },
      { value: 'ornate-frame', label: 'Ornate Frame (Fantasy)', colors: 'primary' },
      { value: 'corner-brackets', label: 'Corner Brackets (Sci-Fi)', colors: 'both' },
      { value: 'angular-mask', label: 'Angular Mask (Character Cutout)', colors: 'both' }
    ];

    // Find current backdrop's color config
    const currentBackdrop = backdropStyles.find(b => b.value === this.config.backdropStyle);
    const backdropColors = currentBackdrop?.colors || 'none';

    return {
      cutinName: this.cutinName,
      config: {
        ...this.config,
        textLayers: textLayersWithState
      },
      isEditing: !!this.itemId,
      presets,
      players,
      backdropStyles,
      backdropColors,
      animationStyles: [
        { value: 'slide-right', label: 'Slide from Right' },
        { value: 'slide-left', label: 'Slide from Left' },
        { value: 'fade', label: 'Fade In' },
        { value: 'zoom', label: 'Zoom In' },
        { value: 'diagonal-sweep', label: 'Diagonal Sweep' }
      ],
      textPositions: [
        { value: 'top-left', label: 'Top Left' },
        { value: 'top-center', label: 'Top Center' },
        { value: 'top-right', label: 'Top Right' },
        { value: 'middle-left', label: 'Middle Left' },
        { value: 'middle-center', label: 'Center' },
        { value: 'middle-right', label: 'Middle Right' },
        { value: 'bottom-left', label: 'Bottom Left' },
        { value: 'bottom-center', label: 'Bottom Center' },
        { value: 'bottom-right', label: 'Bottom Right' }
      ],
      fonts: [
        'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Courier New',
        'Verdana', 'Impact', 'Comic Sans MS', 'Trebuchet MS', 'Lucida Console'
      ],
      dismissalModes: [
        { value: null, label: 'Use Module Setting' },
        { value: 'user-dismiss', label: 'Players Click to Dismiss' },
        { value: 'gm-dismiss', label: 'GM Controls Dismissal' },
        { value: 'auto-dismiss', label: 'Auto-Dismiss After Duration' }
      ]
    };
  }

  /* -------------------------------------------- */
  /*  Action Handlers                             */
  /* -------------------------------------------- */

  static async _onSelectImage(event, target) {
    const fp = new FilePicker({
      type: 'image',
      callback: (path) => {
        this.config.characterImage = path;
        this.config.imageSource = 'custom';
        this.render();
      }
    });
    fp.render(true);
  }

  static _onAddTextLayer(event, target) {
    this.config.textLayers.push({
      text: 'TEXT',
      font: 'Impact',
      size: 48,
      color: '#ffffff',
      position: 'top-left',
      hasBackground: true,
      backgroundColor: '#000000',
      offsetX: 0,
      offsetY: 0
    });
    // Collapse all existing layers and expand only the new one
    this.expandedLayers.clear();
    this.expandedLayers.add(this.config.textLayers.length - 1);
    this.render();
  }

  static _onRemoveTextLayer(event, target) {
    const index = parseInt(target.dataset.index);
    this.config.textLayers.splice(index, 1);
    this.render();
  }

  static async _onSavePreset(event, target) {
    const name = await foundry.applications.api.DialogV2.prompt({
      window: { title: 'Save Preset' },
      content: '<input type="text" name="preset-name" placeholder="Preset Name" autofocus />',
      ok: {
        callback: (event, button, dialog) => {
          return button.form.elements['preset-name'].value;
        }
      },
      rejectClose: false
    });

    if (name) {
      await GMDeckPresets.savePreset(name, foundry.utils.deepClone(this.config));
      this.render();
    }
  }

  static _onPreview(event, target) {
    const overlay = new GMDeckCutinOverlay(this.config);
    overlay.render({ force: true });
  }

  static async _onSave(event, target) {
    const formData = new FormDataExtended(target.form).object;

    // Update config from form
    this.cutinName = formData.cutinName || 'Cinematic Cut-in';
    this.config.backdropStyle = formData.backdropStyle;
    this.config.backdropPrimaryColor = formData.backdropPrimaryColor || null;
    this.config.backdropSecondaryColor = formData.backdropSecondaryColor || null;
    this.config.imageVerticalAlign = 'bottom'; // Always use bottom alignment
    this.config.imageHorizontalAlign = formData.imageHorizontalAlign || 'right';
    this.config.animationStyle = formData.animationStyle;
    this.config.duration = parseInt(formData.duration);
    this.config.exitDuration = parseInt(formData.exitDuration);
    this.config.dismissalMode = (formData.dismissalMode === 'null' || formData.dismissalMode === '') ? null : formData.dismissalMode;
    this.config.autoDismissDelay = parseInt(formData.autoDismissDelay);

    // Handle audience selection
    if (formData.audienceMode === 'all') {
      this.config.audience = 'all';
    } else {
      // Collect selected player IDs
      const selectedPlayers = [];
      const players = game.users.filter(u => !u.isGM);
      players.forEach(p => {
        if (formData[`player-${p.id}`]) {
          selectedPlayers.push(p.id);
        }
      });
      this.config.audience = selectedPlayers.length > 0 ? selectedPlayers : 'all';
    }

    // Update text layers from form
    const textLayerIndices = Object.keys(formData).filter(k => k.startsWith('textLayer.')).map(k => {
      const match = k.match(/textLayer\.(\d+)\./);
      return match ? parseInt(match[1]) : null;
    }).filter((v, i, a) => v !== null && a.indexOf(v) === i);

    textLayerIndices.forEach(index => {
      if (this.config.textLayers[index]) {
        this.config.textLayers[index].text = formData[`textLayer.${index}.text`] || '';
        this.config.textLayers[index].font = formData[`textLayer.${index}.font`] || 'Impact';
        this.config.textLayers[index].size = parseInt(formData[`textLayer.${index}.size`]) || 48;
        this.config.textLayers[index].color = formData[`textLayer.${index}.color`] || '#ffffff';
        this.config.textLayers[index].position = formData[`textLayer.${index}.position`] || 'top-left';
        this.config.textLayers[index].hasBackground = formData[`textLayer.${index}.hasBackground`] || false;
        this.config.textLayers[index].backgroundColor = formData[`textLayer.${index}.backgroundColor`] || '#000000';
        this.config.textLayers[index].offsetX = parseInt(formData[`textLayer.${index}.offsetX`]) || 0;
        this.config.textLayers[index].offsetY = parseInt(formData[`textLayer.${index}.offsetY`]) || 0;
      }
    });

    // Save to deck
    if (this.itemId) {
      // Update existing
      await GMDeckData.updateItem(this.itemId, {
        name: this.cutinName,
        config: this.config
      });
      ui.notifications.info(`Cut-in "${this.cutinName}" updated.`);
    } else {
      // Add new
      await GMDeckData.addItem('cinematic-cutin', null, {
        name: this.cutinName,
        icon: this.config.characterImage,
        config: this.config
      });
      ui.notifications.info(`Cut-in "${this.cutinName}" added to deck.`);
    }

    // Refresh deck app
    const app = game.modules.get(MODULE_ID).api.getApp();
    if (app?.rendered) app.render();

    this.close();
  }

  _onRender(context, options) {
    // Setup FilePicker button
    const imageBtn = this.element.querySelector('[data-action="selectImage"]');
    if (imageBtn) {
      imageBtn.addEventListener('click', () => {
        const fp = new FilePicker({
          type: 'image',
          callback: (path) => {
            this.config.characterImage = path;
            this.config.imageSource = 'custom';
            this.render();
          }
        });
        fp.render(true);
      });
    }

    // Setup preset selector to auto-load on change
    const presetSelector = this.element.querySelector('#preset-selector');
    if (presetSelector) {
      presetSelector.addEventListener('change', async (event) => {
        const presetId = event.target.value;
        if (!presetId) return;

        const preset = await GMDeckPresets.loadPreset(presetId);
        if (preset) {
          // Preserve existing character image if set
          const currentImage = this.config.characterImage;
          const currentImageSource = this.config.imageSource;
          const currentSourceId = this.config.sourceId;

          this.config = foundry.utils.deepClone(preset.config);

          // Restore image if it was set
          if (currentImage) {
            this.config.characterImage = currentImage;
            this.config.imageSource = currentImageSource;
            this.config.sourceId = currentSourceId;
          }

          ui.notifications.info(`Preset "${preset.name}" loaded.`);
          this.render();
        }
      });
    }

    // Setup live updates for backdrop, animation, and other settings
    const backdropSelector = this.element.querySelector('select[name="backdropStyle"]');
    const colorSection = this.element.querySelector('.form-group:has(#customizeColors)');
    const colorCustomization = this.element.querySelector('.color-customization');

    // Function to update color section visibility based on backdrop
    const updateColorVisibility = () => {
      const selectedOption = backdropSelector?.querySelector(`option[value="${backdropSelector.value}"]`);
      const colors = selectedOption?.dataset.colors || 'none';

      if (colors === 'none') {
        colorSection?.style.setProperty('display', 'none');
        colorCustomization?.style.setProperty('display', 'none');
      } else {
        colorSection?.style.setProperty('display', 'block');
        // Keep color customization visibility based on checkbox state
        const checkbox = this.element.querySelector('#customizeColors');
        if (checkbox?.checked) {
          colorCustomization?.style.setProperty('display', 'block');
        }

        // Show/hide secondary color based on backdrop
        const secondaryColorGroup = colorCustomization?.querySelector('.form-group:has([name="backdropSecondaryColor"])');
        if (secondaryColorGroup) {
          secondaryColorGroup.style.display = (colors === 'both') ? 'block' : 'none';
        }
      }
    };

    if (backdropSelector) {
      // Initial visibility update
      updateColorVisibility();

      backdropSelector.addEventListener('change', (event) => {
        this.config.backdropStyle = event.target.value;
        updateColorVisibility();
        this.render(); // Re-render to update context
      });
    }

    const animationSelector = this.element.querySelector('select[name="animationStyle"]');
    if (animationSelector) {
      animationSelector.addEventListener('change', (event) => {
        this.config.animationStyle = event.target.value;
      });
    }

    const imageHorizontalAlignSelector = this.element.querySelector('select[name="imageHorizontalAlign"]');
    if (imageHorizontalAlignSelector) {
      imageHorizontalAlignSelector.addEventListener('change', (event) => {
        this.config.imageHorizontalAlign = event.target.value;
      });
    }

    const durationInput = this.element.querySelector('input[name="duration"]');
    if (durationInput) {
      durationInput.addEventListener('change', (event) => {
        this.config.duration = parseInt(event.target.value);
      });
    }

    const exitDurationInput = this.element.querySelector('input[name="exitDuration"]');
    if (exitDurationInput) {
      exitDurationInput.addEventListener('change', (event) => {
        this.config.exitDuration = parseInt(event.target.value);
      });
    }

    const dismissalModeSelector = this.element.querySelector('select[name="dismissalMode"]');
    if (dismissalModeSelector) {
      dismissalModeSelector.addEventListener('change', (event) => {
        this.config.dismissalMode = (event.target.value === 'null' || event.target.value === '') ? null : event.target.value;
      });
    }

    const autoDismissInput = this.element.querySelector('input[name="autoDismissDelay"]');
    if (autoDismissInput) {
      autoDismissInput.addEventListener('change', (event) => {
        this.config.autoDismissDelay = parseInt(event.target.value);
      });
    }

    // Setup audience mode radio buttons
    const audienceModeRadios = this.element.querySelectorAll('input[name="audienceMode"]');
    const playerSelection = this.element.querySelector('#player-selection');

    audienceModeRadios.forEach(radio => {
      radio.addEventListener('change', (event) => {
        if (event.target.value === 'all') {
          playerSelection.style.display = 'none';
          this.config.audience = 'all';
        } else {
          playerSelection.style.display = 'block';
          // Update config to array of currently checked players
          const checkedPlayers = Array.from(
            this.element.querySelectorAll('#player-selection input[type="checkbox"]:checked')
          ).map(cb => cb.value);
          this.config.audience = checkedPlayers.length > 0 ? checkedPlayers : [];
        }
      });
    });

    // Setup player checkboxes
    const playerCheckboxes = this.element.querySelectorAll('#player-selection input[type="checkbox"]');
    playerCheckboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        const checkedPlayers = Array.from(
          this.element.querySelectorAll('#player-selection input[type="checkbox"]:checked')
        ).map(checkbox => checkbox.value);
        this.config.audience = checkedPlayers;
      });
    });

    // Setup color customization toggle
    const customizeColorsCheckbox = this.element.querySelector('#customizeColors');
    if (customizeColorsCheckbox) {
      customizeColorsCheckbox.addEventListener('change', (event) => {
        if (event.target.checked) {
          colorCustomization.style.display = 'block';
          // Set default colors if not already set
          if (!this.config.backdropPrimaryColor) {
            this.config.backdropPrimaryColor = '#cc0000';
            this.config.backdropSecondaryColor = '#ff3333';
            this.render();
          }
        } else {
          colorCustomization.style.display = 'none';
          this.config.backdropPrimaryColor = null;
          this.config.backdropSecondaryColor = null;
        }
      });
    }

    // Setup color pickers
    const primaryColorInput = this.element.querySelector('input[name="backdropPrimaryColor"]');
    if (primaryColorInput) {
      primaryColorInput.addEventListener('change', (event) => {
        this.config.backdropPrimaryColor = event.target.value;
      });
    }

    const secondaryColorInput = this.element.querySelector('input[name="backdropSecondaryColor"]');
    if (secondaryColorInput) {
      secondaryColorInput.addEventListener('change', (event) => {
        this.config.backdropSecondaryColor = event.target.value;
      });
    }

    // Setup reset colors button
    const resetColorsBtn = this.element.querySelector('#resetColors');
    if (resetColorsBtn) {
      resetColorsBtn.addEventListener('click', () => {
        this.config.backdropPrimaryColor = null;
        this.config.backdropSecondaryColor = null;
        const customizeCheckbox = this.element.querySelector('#customizeColors');
        if (customizeCheckbox) customizeCheckbox.checked = false;
        this.render();
      });
    }

    // Setup collapse/expand toggle for text layer headers
    const textLayerHeaders = this.element.querySelectorAll('.text-layer-header');
    textLayerHeaders.forEach((header, index) => {
      header.addEventListener('click', (event) => {
        // Don't toggle if clicking the remove button or drag handle
        if (event.target.closest('[data-action="removeTextLayer"]')) return;
        if (event.target.closest('.drag-handle')) return;
        this.#toggleLayer(index);
      });
    });

    // Setup drag and drop for text layers
    const textLayers = this.element.querySelectorAll('.text-layer');
    textLayers.forEach(layer => {
      layer.addEventListener('dragstart', this.#onDragStart.bind(this));
      layer.addEventListener('dragover', this.#onDragOver.bind(this));
      layer.addEventListener('drop', this.#onDrop.bind(this));
      layer.addEventListener('dragend', this.#onDragEnd.bind(this));
      layer.addEventListener('dragenter', this.#onDragEnter.bind(this));
      layer.addEventListener('dragleave', this.#onDragLeave.bind(this));
    });

    // Setup live updates for text layer fields using event delegation
    const form = this.element.querySelector('form');
    if (form) {
      form.addEventListener('change', (event) => {
        const target = event.target;
        const name = target.name;

        // Check if this is a text layer field
        if (name && name.startsWith('textLayer.')) {
          const match = name.match(/textLayer\.(\d+)\.(.+)/);
          if (match) {
            const index = parseInt(match[1]);
            const field = match[2];

            if (this.config.textLayers[index]) {
              switch (field) {
                case 'text':
                  this.config.textLayers[index].text = target.value;
                  break;
                case 'font':
                  this.config.textLayers[index].font = target.value;
                  break;
                case 'size':
                  this.config.textLayers[index].size = parseInt(target.value);
                  break;
                case 'color':
                  this.config.textLayers[index].color = target.value;
                  break;
                case 'position':
                  this.config.textLayers[index].position = target.value;
                  break;
                case 'hasBackground':
                  this.config.textLayers[index].hasBackground = target.checked;
                  // Re-render to show/hide background color field
                  this.render();
                  break;
                case 'backgroundColor':
                  this.config.textLayers[index].backgroundColor = target.value;
                  break;
                case 'offsetX':
                  this.config.textLayers[index].offsetX = parseInt(target.value) || 0;
                  break;
                case 'offsetY':
                  this.config.textLayers[index].offsetY = parseInt(target.value) || 0;
                  break;
              }
            }
          }
        }
      });

      // Also listen for input events on text fields for immediate updates
      form.addEventListener('input', (event) => {
        const target = event.target;
        const name = target.name;

        // Check if this is a text layer text field
        if (name && name.startsWith('textLayer.') && name.endsWith('.text')) {
          const match = name.match(/textLayer\.(\d+)\.text/);
          if (match) {
            const index = parseInt(match[1]);
            if (this.config.textLayers[index]) {
              this.config.textLayers[index].text = target.value;
            }
          }
        }
      });
    }
  }

  /**
   * Toggle collapse/expand state of a text layer
   */
  #toggleLayer(index) {
    if (this.expandedLayers.has(index)) {
      this.expandedLayers.delete(index);
    } else {
      this.expandedLayers.add(index);
    }
    this.render();
  }

  /* -------------------------------------------- */
  /*  Drag and Drop Handlers                      */
  /* -------------------------------------------- */

  /**
   * Handle drag start
   */
  #onDragStart(event) {
    const layer = event.currentTarget;
    this.draggedIndex = parseInt(layer.dataset.index);
    layer.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
  }

  /**
   * Handle drag over
   */
  #onDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }

  /**
   * Handle drag enter
   */
  #onDragEnter(event) {
    const layer = event.currentTarget;
    const targetIndex = parseInt(layer.dataset.index);
    if (targetIndex !== this.draggedIndex) {
      layer.classList.add('drag-over');
    }
  }

  /**
   * Handle drag leave
   */
  #onDragLeave(event) {
    const layer = event.currentTarget;
    layer.classList.remove('drag-over');
  }

  /**
   * Handle drop
   */
  #onDrop(event) {
    event.preventDefault();
    const layer = event.currentTarget;
    layer.classList.remove('drag-over');

    const toIndex = parseInt(layer.dataset.index);
    if (toIndex !== this.draggedIndex) {
      // Reorder the array
      const [item] = this.config.textLayers.splice(this.draggedIndex, 1);
      this.config.textLayers.splice(toIndex, 0, item);

      // Update expanded layers Set with new indices
      const newExpandedLayers = new Set();
      this.expandedLayers.forEach(oldIndex => {
        let newIndex = oldIndex;
        if (oldIndex === this.draggedIndex) {
          newIndex = toIndex;
        } else if (oldIndex < this.draggedIndex && oldIndex >= toIndex) {
          newIndex = oldIndex + 1;
        } else if (oldIndex > this.draggedIndex && oldIndex <= toIndex) {
          newIndex = oldIndex - 1;
        }
        newExpandedLayers.add(newIndex);
      });
      this.expandedLayers = newExpandedLayers;

      this.render();
    }
  }

  /**
   * Handle drag end
   */
  #onDragEnd(event) {
    const layer = event.currentTarget;
    layer.classList.remove('dragging');
    // Clean up any remaining drag-over classes
    this.element.querySelectorAll('.drag-over').forEach(el => {
      el.classList.remove('drag-over');
    });
  }
}
