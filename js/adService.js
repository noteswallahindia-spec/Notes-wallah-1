/**
 * NOTES WALLAH - Centralized Ad Service (AdService)
 * Part 1 of 10: Foundation
 * 
 * Strict Architecture Rules:
 * - Decoupled from any single ad provider (supports AdMob, AdSense, etc. via pluggable adapters)
 * - Whenever any student opens Pro Notes, an advertisement MUST be completed before Pro Notes opens.
 * - Do NOT use XP to unlock Pro Notes.
 * - Do NOT implement fake advertisements in Part 1.
 * - Do NOT use fake ad completion.
 */

class AdService {
  constructor() {
    this.providers = new Map();
    this.activeProviderName = null;
    this.isInitialized = false;
    this.listeners = [];
  }

  /**
   * Register an advertising network provider (e.g., 'admob', 'adsense')
   * Provider must implement: { init(), isReady(placement), showAd(placement, options) }
   */
  registerProvider(name, providerInstance) {
    this.providers.set(name, providerInstance);
    if (!this.activeProviderName) {
      this.activeProviderName = name;
    }
    console.info(`[AdService] Provider registered: ${name}`);
  }

  /**
   * Set active ad provider
   */
  setActiveProvider(name) {
    if (this.providers.has(name)) {
      this.activeProviderName = name;
    } else {
      console.warn(`[AdService] Cannot set unknown provider: ${name}`);
    }
  }

  /**
   * Initialize Ad Service with configuration
   */
  async init(config = {}) {
    this.isInitialized = true;
    if (this.activeProviderName && this.providers.has(this.activeProviderName)) {
      const provider = this.providers.get(this.activeProviderName);
      if (typeof provider.init === "function") {
        await provider.init(config);
      }
    }
    console.info("[AdService] Initialized. Provider status:", this.activeProviderName ? "Configured" : "Pending integration in later parts");
  }

  /**
   * Check if an ad is ready for display
   */
  isAdReady(placement = "pro_notes_rewarded") {
    if (!this.activeProviderName || !this.providers.has(this.activeProviderName)) {
      return false;
    }
    const provider = this.providers.get(this.activeProviderName);
    return provider.isReady ? provider.isReady(placement) : false;
  }

  /**
   * Pro Notes Ad Gatekeeper
   * 
   * Mandate:
   * Whenever any user opens Pro Notes:
   *   User opens Pro Notes -> Advertisement is shown -> After advertisement is completed -> Pro Notes open.
   * 
   * In Part 1:
   *   No real ad provider is configured yet.
   *   We do NOT pretend that an ad was shown.
   *   We do NOT use fake ad completion.
   *   We return a structured status explaining that the Ad Provider is pending configuration.
   */
  async showProNotesAd(noteId, options = {}) {
    console.info(`[AdService] Pro Notes ad requested for note: ${noteId}`);

    // Check if a real production provider is registered
    if (this.activeProviderName && this.providers.has(this.activeProviderName)) {
      const provider = this.providers.get(this.activeProviderName);
      try {
        const result = await provider.showAd("pro_notes_rewarded", { noteId, ...options });
        return {
          adShown: true,
          completed: !!result.completed,
          provider: this.activeProviderName,
          noteId
        };
      } catch (err) {
        console.error("[AdService] Provider error showing ad:", err);
        return {
          adShown: false,
          completed: false,
          error: err.message,
          provider: this.activeProviderName
        };
      }
    }

    // Part 1 Safe Foundation Behavior:
    // Strictly adheres to: "safe placeholder/development behavior without pretending that a real advertisement was shown."
    // Strictly: "Do NOT use fake ad completion."
    return {
      adShown: false,
      completed: false,
      status: "pending_provider_setup",
      message: "Pro Notes requires an advertisement before unlocking. The production advertising provider (AdMob/AdSense) will be connected in later parts of Notes Wallah."
    };
  }
}

window.NotesWallahAdService = new AdService();
