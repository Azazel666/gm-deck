// GM Deck - Cutin Presets Management
const MODULE_ID = 'gm-deck';

export class GMDeckPresets {

  /**
   * Get all presets (default + custom)
   * @returns {Array} Array of preset objects
   */
  static async getPresets() {
    // Use game.settings instead of world flags for better compatibility
    const custom = game.settings.get(MODULE_ID, 'customCutinPresets') ?? [];
    const defaults = this.getDefaultPresets();
    return [...defaults, ...custom];
  }

  /**
   * Save a custom preset
   * @param {string} name - Preset name
   * @param {object} config - Cutin configuration
   * @returns {object} The saved preset
   */
  static async savePreset(name, config) {
    const presets = game.settings.get(MODULE_ID, 'customCutinPresets') ?? [];
    const newPreset = {
      id: foundry.utils.randomID(),
      name,
      config,
      isCustom: true
    };
    presets.push(newPreset);
    await game.settings.set(MODULE_ID, 'customCutinPresets', presets);
    ui.notifications.info(`Preset "${name}" saved.`);
    return newPreset;
  }

  /**
   * Delete a custom preset
   * @param {string} presetId - Preset ID to delete
   */
  static async deletePreset(presetId) {
    const presets = game.settings.get(MODULE_ID, 'customCutinPresets') ?? [];
    const filtered = presets.filter(p => p.id !== presetId);
    await game.settings.set(MODULE_ID, 'customCutinPresets', filtered);
    ui.notifications.info('Preset deleted.');
  }

  /**
   * Load a specific preset
   * @param {string} presetId - Preset ID to load
   * @returns {object|undefined} The preset object
   */
  static async loadPreset(presetId) {
    const all = await this.getPresets();
    return all.find(p => p.id === presetId);
  }

  /**
   * Get built-in default presets
   * @returns {Array} Array of default preset objects
   */
  static getDefaultPresets() {
    return [
      {
        id: 'default-jrpg',
        name: 'JRPG Hero Entrance',
        config: {
          backdropStyle: 'diagonal-red',
          textLayers: [
            {
              text: 'CINEMATIC!',
              font: 'Impact',
              size: 72,
              color: '#ffffff',
              position: 'top-left',
              hasBackground: true
            }
          ],
          animationStyle: 'slide-right',
          duration: 800,
          exitDuration: 400,
          dismissalMode: null,
          autoDismissDelay: 3000,
          audience: 'all'
        },
        isDefault: true
      },
      {
        id: 'default-villain',
        name: 'Villain Reveal',
        config: {
          backdropStyle: 'gradient-burst',
          textLayers: [
            {
              text: 'BOSS BATTLE',
              font: 'Impact',
              size: 64,
              color: '#ff0000',
              position: 'middle-center',
              hasBackground: false
            }
          ],
          animationStyle: 'zoom',
          duration: 1000,
          exitDuration: 500,
          dismissalMode: null,
          autoDismissDelay: 3000,
          audience: 'all'
        },
        isDefault: true
      },
      {
        id: 'default-introduction',
        name: 'Character Introduction',
        config: {
          backdropStyle: 'banner-black',
          textLayers: [
            {
              text: 'ENTERING',
              font: 'Georgia',
              size: 32,
              color: '#d4af37',
              position: 'top-center',
              hasBackground: false
            }
          ],
          animationStyle: 'fade',
          duration: 600,
          exitDuration: 300,
          dismissalMode: null,
          autoDismissDelay: 3000,
          audience: 'all'
        },
        isDefault: true
      },
      {
        id: 'default-special',
        name: 'Special Attack',
        config: {
          backdropStyle: 'squares-gold',
          textLayers: [
            {
              text: 'SPECIAL MOVE',
              font: 'Impact',
              size: 56,
              color: '#ffff00',
              position: 'middle-left',
              hasBackground: true
            },
            {
              text: 'ULTIMATE',
              font: 'Impact',
              size: 40,
              color: '#ffffff',
              position: 'bottom-left',
              hasBackground: true
            }
          ],
          animationStyle: 'diagonal-sweep',
          duration: 700,
          exitDuration: 350,
          dismissalMode: null,
          autoDismissDelay: 3000,
          audience: 'all'
        },
        isDefault: true
      },
      {
        id: 'default-minimal',
        name: 'Minimal Portrait',
        config: {
          backdropStyle: 'minimal-fade',
          textLayers: [],
          animationStyle: 'fade',
          duration: 500,
          exitDuration: 300,
          dismissalMode: null,
          autoDismissDelay: 3000,
          audience: 'all'
        },
        isDefault: true
      },
      {
        id: 'default-dramatic',
        name: 'Dramatic Split',
        config: {
          backdropStyle: 'vertical-split',
          textLayers: [
            {
              text: 'NOW ENTERING',
              font: 'Courier New',
              size: 28,
              color: '#60a5fa',
              position: 'top-center',
              hasBackground: false
            }
          ],
          animationStyle: 'slide-left',
          duration: 900,
          exitDuration: 400,
          dismissalMode: null,
          autoDismissDelay: 3000,
          audience: 'all'
        },
        isDefault: true
      }
    ];
  }
}
