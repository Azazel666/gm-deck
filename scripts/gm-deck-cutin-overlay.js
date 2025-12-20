// GM Deck - Cinematic Cutin Overlay
import { GMDeckData } from './gm-deck-data.js';

const MODULE_ID = 'gm-deck';
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class GMDeckCutinOverlay extends HandlebarsApplicationMixin(ApplicationV2) {

  constructor(config, cutinId) {
    super();
    this.config = config;
    this.cutinId = cutinId || `cutin-${foundry.utils.randomID()}`;
    this.isDismissed = false;
  }

  /* -------------------------------------------- */
  /*  Static Properties                           */
  /* -------------------------------------------- */

  static DEFAULT_OPTIONS = {
    id: 'gm-deck-cutin-overlay',
    classes: ['gm-deck-cutin-overlay'],
    window: {
      frame: false,
      positioned: false,
      minimizable: false,
      resizable: false,
      controls: []
    },
    position: {
      width: window.innerWidth,
      height: window.innerHeight,
      top: 0,
      left: 0,
      scale: 1
    }
  };

  static PARTS = {
    overlay: {
      template: `modules/${MODULE_ID}/templates/cutin-overlay.hbs`
    }
  };

  /* -------------------------------------------- */
  /*  Context Preparation                         */
  /* -------------------------------------------- */

  async _prepareContext(options) {
    // Treat empty string as null to fall back to module default
    const configMode = (this.config.dismissalMode === '' || this.config.dismissalMode === null || this.config.dismissalMode === undefined)
      ? null
      : this.config.dismissalMode;
    const dismissalMode = configMode ?? game.settings.get(MODULE_ID, 'cutinDismissalMode');

    return {
      characterImage: this.config.characterImage,
      backdropStyle: this.config.backdropStyle || 'minimal-fade',
      imageVerticalAlign: this.config.imageVerticalAlign || 'center',
      imageHorizontalAlign: this.config.imageHorizontalAlign || 'right',
      textLayers: this.config.textLayers || [],
      animationClass: `anim-${this.config.animationStyle || 'fade'}`,
      duration: this.config.duration || 800,
      dismissalMode,
      showUserHint: dismissalMode === 'user-dismiss',
      showGMControls: dismissalMode === 'gm-dismiss' && game.user.isGM
    };
  }

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  _onRender(context, options) {
    const el = this.element;

    // Force correct positioning to prevent UI distortion
    el.style.position = 'fixed';
    el.style.top = '0';
    el.style.left = '0';
    el.style.width = '100vw';
    el.style.height = '100vh';
    el.style.margin = '0';
    el.style.padding = '0';
    el.style.border = 'none';
    el.style.transform = 'none';
    el.style.zIndex = '10000';

    // Trigger entrance animation
    setTimeout(() => {
      el.querySelector('.cutin-container')?.classList.add('animate-enter');
    }, 10);

    // Set CSS custom properties for animation timing
    el.style.setProperty('--entrance-duration', `${this.config.duration || 800}ms`);
    el.style.setProperty('--exit-duration', `${this.config.exitDuration || 400}ms`);

    // Set CSS custom properties for backdrop colors
    if (this.config.backdropPrimaryColor) {
      el.style.setProperty('--backdrop-primary', this.config.backdropPrimaryColor);
    }
    if (this.config.backdropSecondaryColor) {
      el.style.setProperty('--backdrop-secondary', this.config.backdropSecondaryColor);
    }

    // Treat empty string as null to fall back to module default
    const configMode = (this.config.dismissalMode === '' || this.config.dismissalMode === null || this.config.dismissalMode === undefined)
      ? null
      : this.config.dismissalMode;
    const dismissalMode = configMode ?? game.settings.get(MODULE_ID, 'cutinDismissalMode');

    // User dismiss mode: click anywhere to dismiss
    if (dismissalMode === 'user-dismiss') {
      el.addEventListener('click', () => this.dismiss());
    }

    // Auto dismiss mode: timeout
    if (dismissalMode === 'auto-dismiss') {
      const delay = this.config.autoDismissDelay || 3000;
      setTimeout(() => this.dismiss(), delay + (this.config.duration || 800));
    }

    // GM dismiss mode: show dismiss button
    if (dismissalMode === 'gm-dismiss' && game.user.isGM) {
      const dismissBtn = el.querySelector('.cutin-gm-dismiss');
      if (dismissBtn) {
        dismissBtn.addEventListener('click', (event) => {
          event.stopPropagation();
          this.dismissForAll();
        });
      }
    }

    // Store reference in ui.windows for socket-based dismissal
    ui.windows[this.cutinId] = this;
  }

  /* -------------------------------------------- */
  /*  Dismissal Methods                           */
  /* -------------------------------------------- */

  /**
   * Dismiss the cutin overlay (local only)
   */
  async dismiss() {
    if (this.isDismissed) return;
    this.isDismissed = true;

    const el = this.element;
    el.querySelector('.cutin-container')?.classList.add('animate-exit');

    setTimeout(() => {
      this.close();
      // Clean up window reference
      delete ui.windows[this.cutinId];
    }, this.config.exitDuration || 400);
  }

  /**
   * Dismiss for all connected users (GM only)
   */
  async dismissForAll() {
    if (!game.user.isGM) return;

    // Broadcast dismissal to all players
    GMDeckData.broadcastDismissCutin(this.cutinId);

    // Also dismiss locally
    this.dismiss();
  }
}
