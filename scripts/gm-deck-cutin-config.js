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

    // Load existing item if editing
    if (itemId) {
      const items = GMDeckData.getItems();
      const item = items.find(i => i.id === itemId);
      if (item) {
        this.config = foundry.utils.deepClone(item.config);
        this.cutinName = item.name;
      }
    } else {
      // New cutin - initialize with defaults or initial data
      this.config = {
        characterImage: initialData.characterImage || '',
        imageSource: initialData.imageSource || 'custom',
        sourceId: initialData.sourceId || null,
        backdropStyle: 'diagonal-red',
        textLayers: [],
        animationStyle: 'slide-right',
        duration: 800,
        exitDuration: 400,
        dismissalMode: null,
        autoDismissDelay: 3000,
        audience: 'all',
        ...initialData.config
      };
      this.cutinName = initialData.name || 'New Cutin';
    }
  }

  /* -------------------------------------------- */
  /*  Static Properties                           */
  /* -------------------------------------------- */

  static DEFAULT_OPTIONS = {
    id: 'gm-deck-cutin-config',
    classes: ['gm-deck-cutin-config'],
    window: {
      title: 'Configure Cinematic Cutin',
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
    const players = game.users.filter(u => !u.isGM);

    return {
      cutinName: this.cutinName,
      config: this.config,
      isEditing: !!this.itemId,
      presets,
      players,
      backdropStyles: [
        { value: 'diagonal-red', label: 'Diagonal Red (JRPG)' },
        { value: 'banner-black', label: 'Black Banner' },
        { value: 'squares-gold', label: 'Gold Squares' },
        { value: 'vertical-split', label: 'Vertical Split' },
        { value: 'gradient-burst', label: 'Gradient Burst' },
        { value: 'minimal-fade', label: 'Minimal Fade' }
      ],
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
      hasBackground: true
    });
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
    this.cutinName = formData.cutinName || 'Cinematic Cutin';
    this.config.backdropStyle = formData.backdropStyle;
    this.config.animationStyle = formData.animationStyle;
    this.config.duration = parseInt(formData.duration);
    this.config.exitDuration = parseInt(formData.exitDuration);
    this.config.dismissalMode = formData.dismissalMode === 'null' ? null : formData.dismissalMode;
    this.config.autoDismissDelay = parseInt(formData.autoDismissDelay);
    this.config.audience = formData.audience || 'all';

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
      }
    });

    // Save to deck
    if (this.itemId) {
      // Update existing
      await GMDeckData.updateItem(this.itemId, {
        name: this.cutinName,
        config: this.config
      });
      ui.notifications.info(`Cutin "${this.cutinName}" updated.`);
    } else {
      // Add new
      await GMDeckData.addItem('cinematic-cutin', null, {
        name: this.cutinName,
        icon: this.config.characterImage,
        config: this.config
      });
      ui.notifications.info(`Cutin "${this.cutinName}" added to deck.`);
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
          this.config = foundry.utils.deepClone(preset.config);
          ui.notifications.info(`Preset "${preset.name}" loaded.`);
          this.render();
        }
      });
    }
  }
}
