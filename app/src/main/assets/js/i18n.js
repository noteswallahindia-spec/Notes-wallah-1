/**
 * NOTES WALLAH - Internationalization & Multilingual System (i18n)
 * Part 4 of 10: Foundation Translation Engine
 * 
 * Rules:
 * - Stable dot-notation keys (e.g. "home.greeting")
 * - Safe fallback: activeLang -> en -> defaultText -> key
 * - Never returns or displays "undefined"
 * - Instant DOM updates without full page reload
 * - Persists preference in localStorage and Firestore profile
 * - Modular design: new languages can be registered easily
 */

class I18nService {
  constructor() {
    this.currentLanguage = "en";
    this.fallbackLanguage = "en";
    this.supportedLanguages = {
      en: { code: "en", name: "English", nativeName: "English" },
      hi: { code: "hi", name: "Hindi", nativeName: "हिन्दी" }
    };
    this.locales = window.NotesWallahLocales || {};
  }

  /**
   * Initialize translation service
   */
  init() {
    this.locales = window.NotesWallahLocales || {};
    
    // Check saved preference in localStorage
    let savedLang = null;
    try {
      savedLang = localStorage.getItem("nw_language");
    } catch (e) {
      console.warn("[i18n] Failed to read from localStorage", e);
    }

    if (savedLang && this.supportedLanguages[savedLang]) {
      this.currentLanguage = savedLang;
    } else {
      this.currentLanguage = "en";
    }

    // Apply translations across DOM
    this.translatePage();
    this.updateLanguageUI();
    return this.currentLanguage;
  }

  /**
   * Core translation lookup with bulletproof fallback
   * @param {string} key - Dot-separated translation key (e.g. "home.quickAccess")
   * @param {string} [fallbackText] - Optional fallback if key is missing in all dictionaries
   */
  t(key, fallbackText = "") {
    if (!key) return fallbackText || "";

    const currentDict = this.locales[this.currentLanguage] || {};
    const fallbackDict = this.locales[this.fallbackLanguage] || {};

    // 1. Try active language
    if (currentDict[key] !== undefined && currentDict[key] !== null) {
      return currentDict[key];
    }

    // 2. Try fallback language (English)
    if (fallbackDict[key] !== undefined && fallbackDict[key] !== null) {
      return fallbackDict[key];
    }

    // 3. Try custom fallback or key itself (never return "undefined")
    return fallbackText || key;
  }

  /**
   * Change active language
   * @param {string} langCode - "en" | "hi"
   * @param {boolean} persistProfile - Whether to sync with Firestore profile
   */
  async setLanguage(langCode, persistProfile = true) {
    if (!this.supportedLanguages[langCode]) {
      console.warn(`[i18n] Unsupported language code: ${langCode}. Falling back to English.`);
      langCode = "en";
    }

    this.currentLanguage = langCode;

    try {
      localStorage.setItem("nw_language", langCode);
    } catch (e) {
      console.warn("[i18n] Could not write to localStorage", e);
    }

    // Instant DOM update
    this.translatePage();
    this.updateLanguageUI();

    // Sync to user profile if logged in
    if (persistProfile && window.NotesWallahAuth && window.NotesWallahDatabase) {
      const user = window.NotesWallahAuth.getCurrentUser();
      if (user && user.uid) {
        try {
          await window.NotesWallahDatabase.saveUserProfile(user.uid, {
            preferredLanguage: this.supportedLanguages[langCode].name
          });
          if (user.profile) {
            user.profile.preferredLanguage = this.supportedLanguages[langCode].name;
            window.NotesWallahAuth.saveSession(user);
          }
        } catch (err) {
          console.warn("[i18n] Failed to sync language to Firestore profile:", err);
        }
      }
    }

    // Notify listeners / dynamic components
    window.dispatchEvent(new CustomEvent("nw:languageChanged", {
      detail: { language: langCode, meta: this.supportedLanguages[langCode] }
    }));

    return langCode;
  }

  /**
   * Translates all elements marked with data-i18n attributes
   */
  translatePage() {
    // 1. Text Content
    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (key) {
        el.textContent = this.t(key, el.textContent);
      }
    });

    // 2. Placeholders (inputs)
    const placeholders = document.querySelectorAll("[data-i18n-placeholder]");
    placeholders.forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (key) {
        el.placeholder = this.t(key, el.placeholder);
      }
    });

    // 3. ARIA labels (accessibility)
    const ariaElements = document.querySelectorAll("[data-i18n-aria]");
    ariaElements.forEach(el => {
      const key = el.getAttribute("data-i18n-aria");
      if (key) {
        el.setAttribute("aria-label", this.t(key, el.getAttribute("aria-label")));
      }
    });

    // 4. HTML Titles
    const titleElements = document.querySelectorAll("[data-i18n-title]");
    titleElements.forEach(el => {
      const key = el.getAttribute("data-i18n-title");
      if (key) {
        el.setAttribute("title", this.t(key, el.getAttribute("title")));
      }
    });
  }

  /**
   * Updates language indicator text in the settings UI
   */
  updateLanguageUI() {
    const langDisplay = document.getElementById("settings-current-language-display");
    if (langDisplay) {
      const meta = this.supportedLanguages[this.currentLanguage];
      langDisplay.textContent = meta ? `${meta.nativeName} (${meta.name})` : "English";
    }

    const studentLangDisplays = document.querySelectorAll(".student-lang-display");
    studentLangDisplays.forEach(el => {
      const meta = this.supportedLanguages[this.currentLanguage];
      el.textContent = meta ? meta.name : "English";
    });
  }

  /**
   * Get current language code
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  /**
   * Get supported languages list
   */
  getSupportedLanguages() {
    return Object.values(this.supportedLanguages);
  }
}

window.NotesWallahI18n = new I18nService();
